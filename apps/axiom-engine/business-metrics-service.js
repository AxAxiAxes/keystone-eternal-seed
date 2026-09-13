const { createHash, randomUUID } = require("crypto");
const fs = require("fs/promises");
const path = require("path");

const BUSINESS_METRICS_ID = "axi-private-business-metrics-v1";
const BUSINESS_METRICS_SCHEMA_VERSION = 1;
const BUSINESS_METRICS_FILE_NAME = "business-metrics.jsonl";
const BUSINESS_METRICS_NOTICE =
  "Record of submitted metrics only; not a financial statement, accounting treatment, tax calculation, cash balance, valuation, profitability guarantee, or legal or financial advice.";
const REVIEW_STATUS = "operator-approved";
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
const CATEGORIES_BY_KIND = Object.freeze({
  revenue: new Set([
    "contracting-services",
    "product-sales",
    "subscriptions",
    "other-approved-revenue"
  ]),
  expense: new Set([
    "materials",
    "labor",
    "software",
    "operations",
    "marketing",
    "professional-services",
    "other-approved-expense"
  ])
});

class BusinessMetricsService {
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
      label: BUSINESS_METRICS_NOTICE,
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
        schemaVersion: BUSINESS_METRICS_SCHEMA_VERSION,
        id: randomUUID(),
        sequence: entries.length + 1,
        recordedAt: this.now().toISOString(),
        period: input.period,
        kind: input.kind,
        category: input.category,
        amountCents: input.amountCents,
        sourceRecord,
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
      id: BUSINESS_METRICS_ID,
      schemaVersion: BUSINESS_METRICS_SCHEMA_VERSION,
      recordCount: entries.length,
      latestRecord: entries.length ? summarizeEntry(entries.at(-1)) : null,
      label: BUSINESS_METRICS_NOTICE
    };
  }

  summaryFromEntries(entries) {
    const totalsByPeriod = {};
    let totalRevenueCents = 0;
    let totalExpenseCents = 0;

    for (const entry of entries) {
      const period = totalsByPeriod[entry.period] || {
        revenueCents: 0,
        expenseCents: 0,
        netOperatingResultCents: 0
      };
      if (entry.kind === "revenue") {
        totalRevenueCents += entry.amountCents;
        period.revenueCents += entry.amountCents;
      } else {
        totalExpenseCents += entry.amountCents;
        period.expenseCents += entry.amountCents;
      }
      period.netOperatingResultCents = period.revenueCents - period.expenseCents;
      totalsByPeriod[entry.period] = period;
    }

    return {
      label: BUSINESS_METRICS_NOTICE,
      recordCount: entries.length,
      totalRecordedRevenueCents: totalRevenueCents,
      totalRecordedExpenseCents: totalExpenseCents,
      netRecordedOperatingResultCents: totalRevenueCents - totalExpenseCents,
      totalsByPeriod: Object.fromEntries(
        Object.entries(totalsByPeriod).sort(([left], [right]) => left.localeCompare(right))
      )
    };
  }

  invalidStatus() {
    return {
      status: "attention",
      code: "business-metrics-invalid",
      expectedId: BUSINESS_METRICS_ID,
      expectedSchemaVersion: BUSINESS_METRICS_SCHEMA_VERSION,
      label: BUSINESS_METRICS_NOTICE
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
    return path.join(this.directory, BUSINESS_METRICS_FILE_NAME);
  }
}

function validateEntries(entries) {
  if (!Array.isArray(entries)) {
    throw new TypeError("business metrics must contain an entry array");
  }
  const ids = new Set();
  const sourceRecords = new Set();
  let previousHash = null;
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    if (!entry || entry.schemaVersion !== BUSINESS_METRICS_SCHEMA_VERSION ||
      !isUuid(entry.id) || ids.has(entry.id) || entry.sequence !== index + 1 ||
      !isIsoTimestamp(entry.recordedAt) || !isPeriod(entry.period) ||
      !isKind(entry.kind) || !isCategoryForKind(entry.category, entry.kind) ||
      !isPositiveSafeInteger(entry.amountCents) || !isSourceRecord(entry.sourceRecord) ||
      sourceRecords.has(entry.sourceRecord) || entry.reviewStatus !== REVIEW_STATUS ||
      entry.previousHash !== previousHash || !isHash(entry.hash) ||
      entry.hash !== hashEntry(entry)) {
      throw new TypeError("business metrics has an invalid entry");
    }
    ids.add(entry.id);
    sourceRecords.add(entry.sourceRecord);
    previousHash = entry.hash;
  }
}

function assertEntryInput(input) {
  if (!isRecord(input)) {
    throw new TypeError("business metric entry must be an object");
  }
  const allowedFields = new Set([
    "period",
    "kind",
    "category",
    "amountCents",
    "sourceRecord"
  ]);
  if (Object.keys(input).some((field) => !allowedFields.has(field))) {
    throw new TypeError("business metric entry contains unsupported fields");
  }
  if (!isPeriod(input.period)) {
    throw new TypeError("period must be a valid YYYY-MM value from 2000 through 2100");
  }
  if (!isKind(input.kind)) {
    throw new RangeError("kind must be revenue or expense");
  }
  if (!isCategoryForKind(input.category, input.kind)) {
    throw new RangeError("category is unsupported for metric kind");
  }
  if (!isPositiveSafeInteger(input.amountCents)) {
    throw new RangeError("amountCents must be a strictly positive safe integer");
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
    period: entry.period,
    kind: entry.kind,
    category: entry.category,
    amountCents: entry.amountCents,
    sourceRecord: entry.sourceRecord,
    reviewStatus: entry.reviewStatus,
    previousHash: entry.previousHash
  })).digest("hex");
}

function summarizeEntry(entry) {
  return {
    sequence: entry.sequence,
    recordedAt: entry.recordedAt,
    period: entry.period,
    kind: entry.kind,
    category: entry.category,
    amountCents: entry.amountCents,
    sourceRecord: entry.sourceRecord
  };
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isKind(value) {
  return value === "revenue" || value === "expense";
}

function isCategoryForKind(value, kind) {
  return typeof value === "string" && CATEGORIES_BY_KIND[kind]?.has(value);
}

function isPositiveSafeInteger(value) {
  return Number.isSafeInteger(value) && value > 0;
}

function isSourceRecord(value) {
  if (typeof value !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.trim()) ||
    value.trim().length > 120) {
    return false;
  }
  return !value.trim().split("-").some((segment) =>
    [...PROHIBITED_SOURCE_RECORD_TERMS].some((term) => segment.includes(term)));
}

function isPeriod(value) {
  if (typeof value !== "string" || !/^\d{4}-(?:0[1-9]|1[0-2])$/.test(value)) {
    return false;
  }
  const year = Number(value.slice(0, 4));
  return year >= 2000 && year <= 2100;
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
  BUSINESS_METRICS_FILE_NAME,
  BUSINESS_METRICS_ID,
  BUSINESS_METRICS_NOTICE,
  BUSINESS_METRICS_SCHEMA_VERSION,
  CATEGORIES_BY_KIND,
  BusinessMetricsService
};
