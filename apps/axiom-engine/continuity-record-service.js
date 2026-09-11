const { createHash, randomUUID } = require("crypto");
const fs = require("fs/promises");
const path = require("path");

const CONTINUITY_RECORD_ID = "axi-continuity-record-v1";
const CONTINUITY_RECORD_SCHEMA_VERSION = 1;
const EVENT_TYPES = new Set([
  "continuity-initialized",
  "runtime-started",
  "monitoring-state-changed",
  "operator-confirmed"
]);

class ContinuityRecordService {
  constructor({ directory, now = () => new Date() }) {
    this.directory = directory;
    this.now = now;
    this.operationQueue = Promise.resolve();
  }

  async initialize() {
    return this.withExclusiveAccess(async () => {
      const entries = await this.readEntries();
      if (entries === null) {
        await this.appendEntry([], {
          eventType: "continuity-initialized",
          sourceRecord: "runtime",
          summary: "Private continuity record initialized."
        });
      } else {
        validateEntries(entries);
      }

      const currentEntries = entries || await this.readEntries();
      await this.appendEntry(currentEntries, {
        eventType: "runtime-started",
        sourceRecord: "runtime",
        summary: "Private AXI runtime started."
      });
      return this.statusFromEntries(await this.readEntries());
    }).catch(() => this.invalidStatus());
  }

  async status() {
    try {
      const entries = await this.readEntries();
      if (entries === null) {
        return this.initialize();
      }
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
    if (entries === null) {
      return [];
    }
    validateEntries(entries);
    return entries.slice(-limit).reverse();
  }

  async recordOperatorConfirmation({ summary, sourceRecord }) {
    return this.record({
      eventType: "operator-confirmed",
      sourceRecord,
      summary
    });
  }

  async recordMonitoringStateChange() {
    return this.record({
      eventType: "monitoring-state-changed",
      sourceRecord: "monitoring-service",
      summary: "Private monitoring state changed."
    });
  }

  async record({ eventType, sourceRecord, summary }) {
    assertEntryInput({ eventType, sourceRecord, summary });
    return this.withExclusiveAccess(async () => {
      const entries = await this.readEntries();
      if (entries === null) {
        throw new Error("continuity record must be initialized before recording events");
      }
      validateEntries(entries);
      return this.appendEntry(entries, { eventType, sourceRecord, summary });
    });
  }

  async withExclusiveAccess(operation) {
    const queuedOperation = this.operationQueue.then(operation);
    this.operationQueue = queuedOperation.catch(() => {});
    return queuedOperation;
  }

  async readEntries() {
    try {
      const contents = await fs.readFile(this.statePath(), "utf8");
      return contents
        .split("\n")
        .filter(Boolean)
        .map((line) => JSON.parse(line));
    } catch (error) {
      if (error.code === "ENOENT") {
        return null;
      }
      throw error;
    }
  }

  async appendEntry(entries, { eventType, sourceRecord, summary }) {
    assertEntryInput({ eventType, sourceRecord, summary });
    const previousEntry = entries.at(-1);
    const entry = {
      schemaVersion: CONTINUITY_RECORD_SCHEMA_VERSION,
      id: randomUUID(),
      sequence: entries.length + 1,
      recordedAt: this.now().toISOString(),
      eventType,
      sourceRecord: sourceRecord.trim(),
      summary: summary.trim(),
      previousHash: previousEntry ? previousEntry.hash : null
    };
    entry.hash = hashEntry(entry);

    await fs.mkdir(this.directory, { recursive: true });
    await fs.appendFile(this.statePath(), `${JSON.stringify(entry)}\n`, "utf8");
    return entry;
  }

  statusFromEntries(entries) {
    return {
      status: "ready",
      id: CONTINUITY_RECORD_ID,
      schemaVersion: CONTINUITY_RECORD_SCHEMA_VERSION,
      recordCount: entries.length,
      latestRecord: summarizeEntry(entries.at(-1))
    };
  }

  invalidStatus() {
    return {
      status: "attention",
      code: "continuity-record-invalid",
      expectedId: CONTINUITY_RECORD_ID,
      expectedSchemaVersion: CONTINUITY_RECORD_SCHEMA_VERSION
    };
  }

  statePath() {
    return path.join(this.directory, "continuity-record.jsonl");
  }
}

function validateEntries(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new TypeError("continuity record must contain at least one entry");
  }
  let previousHash = null;
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    if (!entry || entry.schemaVersion !== CONTINUITY_RECORD_SCHEMA_VERSION ||
      !isUuid(entry.id) || entry.sequence !== index + 1 ||
      !isIsoTimestamp(entry.recordedAt) || !EVENT_TYPES.has(entry.eventType) ||
      !isBoundedString(entry.sourceRecord, 200) || !isBoundedString(entry.summary, 500) ||
      entry.previousHash !== previousHash || !isHash(entry.hash) ||
      entry.hash !== hashEntry(entry)) {
      throw new TypeError("continuity record has an invalid entry");
    }
    previousHash = entry.hash;
  }
}

function assertEntryInput({ eventType, sourceRecord, summary }) {
  if (!EVENT_TYPES.has(eventType)) {
    throw new RangeError("unsupported continuity event type");
  }
  if (!isBoundedString(sourceRecord, 200)) {
    throw new TypeError("sourceRecord must be a non-empty string up to 200 characters");
  }
  if (!isBoundedString(summary, 500)) {
    throw new TypeError("summary must be a non-empty string up to 500 characters");
  }
}

function hashEntry(entry) {
  return createHash("sha256").update(JSON.stringify({
    schemaVersion: entry.schemaVersion,
    id: entry.id,
    sequence: entry.sequence,
    recordedAt: entry.recordedAt,
    eventType: entry.eventType,
    sourceRecord: entry.sourceRecord,
    summary: entry.summary,
    previousHash: entry.previousHash
  })).digest("hex");
}

function summarizeEntry(entry) {
  return {
    sequence: entry.sequence,
    recordedAt: entry.recordedAt,
    eventType: entry.eventType,
    sourceRecord: entry.sourceRecord
  };
}

function isBoundedString(value, maximumLength) {
  return typeof value === "string" &&
    value.trim().length > 0 &&
    value.trim().length <= maximumLength;
}

function isHash(value) {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
}

function isIsoTimestamp(value) {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function isUuid(value) {
  return typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

module.exports = {
  CONTINUITY_RECORD_ID,
  CONTINUITY_RECORD_SCHEMA_VERSION,
  ContinuityRecordService
};
