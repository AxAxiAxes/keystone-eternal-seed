const { createHash, randomUUID } = require("crypto");
const fs = require("fs/promises");
const path = require("path");

const CREATION_RECORD_ID = "axi-private-creation-record-v1";
const CREATION_RECORD_SCHEMA_VERSION = 1;
const CREATION_RECORD_FILE_NAME = "creation-record.jsonl";
const CREATION_RECORD_NOTICE =
  "Record of AXI-assisted creations only, each permanently attributed to the founder creator authority; not a copyright registration, patent, trademark, or valuation, and not independently verified.";
const REVIEW_STATUS = "operator-approved";
// The founder-established KEYSTONE origin/lineage authority. This value is
// fixed and cannot be supplied or overridden by task payload input -- every
// creation recorded through this journal is permanently attributed to it,
// so the founder remains eternally accountable for AXI-assisted creations
// the same way they are for registered AXI agents (see
// KEYSTONE_REGISTRATION.creatorAuthority in automation-service.js).
const CREATOR_AUTHORITY = "Axel Urartu (AX) · Axes Contracting";
const PROHIBITED_SOURCE_RECORD_TERMS = new Set([
  "account",
  "bank",
  "card",
  "client",
  "credential",
  "customer",
  "email",
  "invoice",
  "name",
  "payment",
  "person",
  "personal",
  "tax",
  "vendor"
]);
const CREATION_KINDS = new Set([
  "concept",
  "design",
  "document",
  "code",
  "other"
]);

class CreationRecordService {
  constructor({ directory, now = () => new Date() }) {
    this.directory = directory;
    this.now = now;
    this.operationQueue = Promise.resolve();
  }

  async initialize() {
    try {
      return await this.withExclusiveAccess(async () => {
        const entries = await this.readEntries();
        validateEntries(entries);
        await fs.mkdir(this.directory, { recursive: true });
        return this.statusFromEntries(entries);
      });
    } catch (error) {
      return this.invalidStatus();
    }
  }

  async status() {
    try {
      const entries = await this.readEntries();
      validateEntries(entries);
      return this.statusFromEntries(entries);
    } catch (error) {
      return this.invalidStatus();
    }
  }

  async list(limit = 20) {
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new RangeError("limit must be an integer between 1 and 100");
    }
    const entries = await this.readEntries();
    validateEntries(entries);
    return {
      label: CREATION_RECORD_NOTICE,
      entries: entries.slice(-limit).reverse()
    };
  }

  async summary() {
    const entries = await this.readEntries();
    validateEntries(entries);
    return this.summaryFromEntries(entries);
  }

  async record(input) {
    assertEntryInput(input);
    return this.withExclusiveAccess(async () => {
      const entries = await this.readEntries();
      validateEntries(entries);
      const sourceRecord = input.sourceRecord.trim();
      if (entries.some((entry) => entry.sourceRecord === sourceRecord)) {
        throw new RangeError(`sourceRecord already exists: ${sourceRecord}`);
      }

      const previousEntry = entries.at(-1);
      const entry = {
        schemaVersion: CREATION_RECORD_SCHEMA_VERSION,
        id: randomUUID(),
        sequence: entries.length + 1,
        recordedAt: this.now().toISOString(),
        title: input.title.trim(),
        kind: input.kind,
        summary: input.summary.trim(),
        sourceRecord,
        creatorAuthority: CREATOR_AUTHORITY,
        reviewStatus: REVIEW_STATUS,
        previousHash: previousEntry ? previousEntry.hash : null
      };
      entry.hash = hashEntry(entry);

      await fs.mkdir(this.directory, { recursive: true });
      await fs.appendFile(this.statePath(), `${JSON.stringify(entry)}\n`, "utf8");
      return entry;
    });
  }

  statusFromEntries(entries) {
    return {
      status: "ready",
      id: CREATION_RECORD_ID,
      schemaVersion: CREATION_RECORD_SCHEMA_VERSION,
      recordCount: entries.length,
      latestRecord: entries.length ? summarizeEntry(entries.at(-1)) : null,
      label: CREATION_RECORD_NOTICE
    };
  }

  summaryFromEntries(entries) {
    const totalsByKind = {};
    for (const entry of entries) {
      totalsByKind[entry.kind] = (totalsByKind[entry.kind] || 0) + 1;
    }
    return {
      label: CREATION_RECORD_NOTICE,
      recordCount: entries.length,
      creatorAuthority: CREATOR_AUTHORITY,
      totalsByKind: Object.fromEntries(
        Object.entries(totalsByKind).sort(([left], [right]) => left.localeCompare(right))
      )
    };
  }

  invalidStatus() {
    return {
      status: "attention",
      code: "creation-record-invalid",
      expectedId: CREATION_RECORD_ID,
      expectedSchemaVersion: CREATION_RECORD_SCHEMA_VERSION,
      label: CREATION_RECORD_NOTICE
    };
  }

  async withExclusiveAccess(operation) {
    const queuedOperation = this.operationQueue.then(operation);
    this.operationQueue = queuedOperation.catch(() => {});
    return queuedOperation;
  }

  async readEntries() {
    try {
      const contents = await fs.readFile(this.statePath(), "utf8");
      return contents.split("\n").filter(Boolean).map((line) => JSON.parse(line));
    } catch (error) {
      if (error.code === "ENOENT") {
        return [];
      }
      throw error;
    }
  }

  statePath() {
    return path.join(this.directory, CREATION_RECORD_FILE_NAME);
  }
}

function validateEntries(entries) {
  if (!Array.isArray(entries)) {
    throw new TypeError("creation record must contain an entry array");
  }
  const ids = new Set();
  const sourceRecords = new Set();
  let previousHash = null;
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    if (!entry || entry.schemaVersion !== CREATION_RECORD_SCHEMA_VERSION ||
      !isUuid(entry.id) || ids.has(entry.id) || entry.sequence !== index + 1 ||
      !isIsoTimestamp(entry.recordedAt) || !isTitle(entry.title) ||
      !CREATION_KINDS.has(entry.kind) || !isSummary(entry.summary) ||
      !isSourceRecord(entry.sourceRecord) || sourceRecords.has(entry.sourceRecord) ||
      entry.creatorAuthority !== CREATOR_AUTHORITY ||
      entry.reviewStatus !== REVIEW_STATUS ||
      entry.previousHash !== previousHash || !isHash(entry.hash) ||
      entry.hash !== hashEntry(entry)) {
      throw new TypeError("creation record has an invalid entry");
    }
    ids.add(entry.id);
    sourceRecords.add(entry.sourceRecord);
    previousHash = entry.hash;
  }
}

function assertEntryInput(input) {
  if (!isRecord(input)) {
    throw new TypeError("creation record entry must be an object");
  }
  const allowedFields = new Set([
    "title",
    "kind",
    "summary",
    "sourceRecord"
  ]);
  if (Object.keys(input).some((field) => !allowedFields.has(field))) {
    throw new TypeError("creation record entry contains unsupported fields");
  }
  if (!isTitle(input.title)) {
    throw new TypeError("title must be a non-empty string of at most 200 characters");
  }
  if (!CREATION_KINDS.has(input.kind)) {
    throw new RangeError("kind must be one of: concept, design, document, code, other");
  }
  if (!isSummary(input.summary)) {
    throw new TypeError("summary must be a non-empty string of at most 4000 characters");
  }
  if (!isSourceRecord(input.sourceRecord)) {
    throw new TypeError("sourceRecord must be a non-sensitive lowercase kebab-case identifier");
  }
}

function hashEntry(entry) {
  return createHash("sha256").update(JSON.stringify({
    schemaVersion: entry.schemaVersion,
    id: entry.id,
    sequence: entry.sequence,
    recordedAt: entry.recordedAt,
    title: entry.title,
    kind: entry.kind,
    summary: entry.summary,
    sourceRecord: entry.sourceRecord,
    creatorAuthority: entry.creatorAuthority,
    reviewStatus: entry.reviewStatus,
    previousHash: entry.previousHash
  })).digest("hex");
}

function summarizeEntry(entry) {
  return {
    sequence: entry.sequence,
    recordedAt: entry.recordedAt,
    title: entry.title,
    kind: entry.kind,
    summary: entry.summary,
    sourceRecord: entry.sourceRecord,
    creatorAuthority: entry.creatorAuthority
  };
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isTitle(value) {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= 200;
}

function isSummary(value) {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= 4000;
}

function isSourceRecord(value) {
  if (typeof value !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.trim()) ||
    value.trim().length > 120) {
    return false;
  }
  return !value.trim().split("-").some((segment) =>
    [...PROHIBITED_SOURCE_RECORD_TERMS].some((term) => segment.includes(term)));
}

function isHash(value) {
  return typeof value === "string" && /^[a-f0-9]{64}$/i.test(value);
}

function isIsoTimestamp(value) {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function isUuid(value) {
  return typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

module.exports = {
  CREATION_RECORD_FILE_NAME,
  CREATION_RECORD_ID,
  CREATION_RECORD_NOTICE,
  CREATION_RECORD_SCHEMA_VERSION,
  CREATION_KINDS,
  CREATOR_AUTHORITY,
  CreationRecordService
};
