const { createHash, randomUUID } = require("crypto");
const fs = require("fs/promises");
const path = require("path");

const SOURCE_CATALOG_ID = "axi-private-source-catalog-v1";
const SOURCE_CATALOG_SCHEMA_VERSION = 1;
const SOURCE_CATALOG_FILE_NAME = "source-catalog.jsonl";
const SOURCE_TYPES = new Set([
  "application",
  "dataset",
  "document",
  "media",
  "record",
  "other"
]);
const CLASSIFICATIONS = new Set(["public", "internal", "private", "restricted"]);
const REVIEW_STATUS = "operator-approved";

class SourceCatalogService {
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
    return entries.slice(-limit).reverse();
  }

  async record(input) {
    assertEntryInput(input);
    return this.withExclusiveAccess(async () => {
      const entries = await this.readEntries();
      validateEntries(entries);
      if (entries.some((entry) => entry.sourceId === input.sourceId.trim())) {
        throw new RangeError(`sourceId already exists: ${input.sourceId.trim()}`);
      }

      const previousEntry = entries.at(-1);
      const entry = {
        schemaVersion: SOURCE_CATALOG_SCHEMA_VERSION,
        id: randomUUID(),
        sequence: entries.length + 1,
        recordedAt: this.now().toISOString(),
        sourceId: input.sourceId.trim(),
        title: input.title.trim(),
        sourceType: input.sourceType,
        classification: input.classification,
        sourceReference: normalizeSourceReference(input.sourceReference),
        sha256: input.sha256.toLowerCase(),
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
    const classifications = Object.fromEntries(
      [...CLASSIFICATIONS].map((classification) => [classification, 0])
    );
    for (const entry of entries) {
      classifications[entry.classification] += 1;
    }
    return {
      status: "ready",
      id: SOURCE_CATALOG_ID,
      schemaVersion: SOURCE_CATALOG_SCHEMA_VERSION,
      sourceCount: entries.length,
      classifications,
      latestSource: entries.length ? summarizeEntry(entries.at(-1)) : null
    };
  }

  invalidStatus() {
    return {
      status: "attention",
      code: "source-catalog-invalid",
      expectedId: SOURCE_CATALOG_ID,
      expectedSchemaVersion: SOURCE_CATALOG_SCHEMA_VERSION
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
    return path.join(this.directory, SOURCE_CATALOG_FILE_NAME);
  }
}

function validateEntries(entries) {
  if (!Array.isArray(entries)) {
    throw new TypeError("source catalog must contain an entry array");
  }
  let previousHash = null;
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    if (!entry || entry.schemaVersion !== SOURCE_CATALOG_SCHEMA_VERSION ||
      !isUuid(entry.id) || entry.sequence !== index + 1 ||
      !isIsoTimestamp(entry.recordedAt) || !isSourceId(entry.sourceId) ||
      !isBoundedString(entry.title, 200) || !SOURCE_TYPES.has(entry.sourceType) ||
      !CLASSIFICATIONS.has(entry.classification) ||
      !isSourceReference(entry.sourceReference) || !isHash(entry.sha256) ||
      entry.reviewStatus !== REVIEW_STATUS || entry.previousHash !== previousHash ||
      !isHash(entry.hash) || entry.hash !== hashEntry(entry)) {
      throw new TypeError("source catalog has an invalid entry");
    }
    previousHash = entry.hash;
  }
}

function assertEntryInput(input) {
  if (!isRecord(input)) {
    throw new TypeError("source catalog entry must be an object");
  }
  const allowedFields = new Set([
    "sourceId",
    "title",
    "sourceType",
    "classification",
    "sourceReference",
    "sha256"
  ]);
  if (Object.keys(input).some((field) => !allowedFields.has(field))) {
    throw new TypeError("source catalog entry contains unsupported fields");
  }
  if (!isSourceId(input.sourceId)) {
    throw new TypeError("sourceId must be lowercase kebab-case up to 120 characters");
  }
  if (!isBoundedString(input.title, 200)) {
    throw new TypeError("title must be a non-empty string up to 200 characters");
  }
  if (!SOURCE_TYPES.has(input.sourceType)) {
    throw new RangeError("sourceType is unsupported");
  }
  if (!CLASSIFICATIONS.has(input.classification)) {
    throw new RangeError("classification is unsupported");
  }
  if (!isSourceReference(input.sourceReference)) {
    throw new TypeError("sourceReference must be a repository-relative path");
  }
  if (!isHash(input.sha256)) {
    throw new TypeError("sha256 must be a 64-character hexadecimal hash");
  }
}

function hashEntry(entry) {
  return createHash("sha256").update(JSON.stringify({
    schemaVersion: entry.schemaVersion,
    id: entry.id,
    sequence: entry.sequence,
    recordedAt: entry.recordedAt,
    sourceId: entry.sourceId,
    title: entry.title,
    sourceType: entry.sourceType,
    classification: entry.classification,
    sourceReference: entry.sourceReference,
    sha256: entry.sha256,
    reviewStatus: entry.reviewStatus,
    previousHash: entry.previousHash
  })).digest("hex");
}

function normalizeSourceReference(value) {
  return value.trim().replaceAll("\\", "/");
}

function summarizeEntry(entry) {
  return {
    sourceId: entry.sourceId,
    title: entry.title,
    sourceType: entry.sourceType,
    classification: entry.classification,
    recordedAt: entry.recordedAt
  };
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isBoundedString(value, maximumLength) {
  return typeof value === "string" &&
    value.trim().length > 0 &&
    value.trim().length <= maximumLength;
}

function isSourceId(value) {
  return typeof value === "string" &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.trim()) &&
    value.trim().length <= 120;
}

function isSourceReference(value) {
  if (!isBoundedString(value, 500)) {
    return false;
  }
  const normalized = normalizeSourceReference(value);
  return !normalized.startsWith("/") &&
    !normalized.split("/").some((segment) => segment === "" || segment === "." || segment === "..");
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
  SOURCE_CATALOG_FILE_NAME,
  SOURCE_CATALOG_ID,
  SOURCE_CATALOG_SCHEMA_VERSION,
  SourceCatalogService
};
