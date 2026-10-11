const { createHash, randomUUID } = require("crypto");
const fs = require("fs/promises");
const path = require("path");

const SERVICE_REGISTRY_ID = "axes-private-service-registry-v1";
const SERVICE_REGISTRY_SCHEMA_VERSION = 1;
const SERVICE_REGISTRY_FILE_NAME = "service-registry.jsonl";
const SERVICE_REGISTRY_NOTICE =
  "Founder-approved internal planning and operating metadata only; not public availability, legal status, professional qualification, business registration, customer service, financial offering, or deployment proof.";
const REVIEW_STATUS = "operator-approved";
const STAGES = new Set(["planned", "internal", "pilot", "active", "paused", "retired"]);
const CLASSIFICATIONS = new Set(["internal", "private", "restricted"]);
const TRANSITIONS = Object.freeze({
  planned: new Set(["internal", "paused", "retired"]),
  internal: new Set(["pilot", "paused", "retired"]),
  pilot: new Set(["active", "paused", "retired"]),
  active: new Set(["paused", "retired"]),
  paused: new Set(["planned", "internal", "pilot", "active", "retired"]),
  retired: new Set()
});
const PROHIBITED_TEXT = /\b(accounts?|customers?|vendors?|persons?|personal|credentials?|passwords?|payments?|banks?|cards?|legal|licensed|licenses?|verified|launch(?:ed)?|available|public|urls?|websites?|emails?)\b/i;

class ServiceRegistryService {
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
    } catch {
      return this.invalidStatus();
    }
  }

  async status() {
    try {
      const entries = await this.readEntries();
      validateEntries(entries);
      return this.statusFromEntries(entries);
    } catch {
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
      label: SERVICE_REGISTRY_NOTICE,
      entries: entries.slice(-limit).reverse().map(summarizeEntry)
    };
  }

  async projection() {
    const entries = await this.readEntries();
    validateEntries(entries);
    const current = new Map();
    for (const entry of entries) current.set(entry.serviceId, summarizeEntry(entry));
    return {
      label: SERVICE_REGISTRY_NOTICE,
      services: Object.fromEntries([...current.entries()].sort(([left], [right]) =>
        left.localeCompare(right)))
    };
  }

  async record(input) {
    assertInput(input);
    return this.withExclusiveAccess(async () => {
      const entries = await this.readEntries();
      validateEntries(entries);
      const normalized = normalizeInput(input);
      const existing = entries.filter((entry) => entry.serviceId === normalized.serviceId);
      if (normalized.operation === "register" && existing.length > 0) {
        throw new RangeError(`serviceId already exists: ${normalized.serviceId}`);
      }
      if (normalized.operation === "update" && existing.length === 0) {
        throw new RangeError(`serviceId does not exist: ${normalized.serviceId}`);
      }
      const previousRevision = existing.at(-1);
      if (previousRevision && !TRANSITIONS[previousRevision.stage].has(normalized.stage)) {
        throw new RangeError(
          `invalid stage transition: ${previousRevision.stage} to ${normalized.stage}`
        );
      }
      const previousEntry = entries.at(-1);
      const entry = {
        schemaVersion: SERVICE_REGISTRY_SCHEMA_VERSION,
        id: randomUUID(),
        sequence: entries.length + 1,
        recordedAt: this.now().toISOString(),
        operation: normalized.operation,
        serviceId: normalized.serviceId,
        revision: previousRevision ? previousRevision.revision + 1 : 1,
        serviceName: normalized.serviceName,
        purpose: normalized.purpose,
        stage: normalized.stage,
        classification: normalized.classification,
        ownerRole: "founder",
        dependencySummary: normalized.dependencySummary,
        reviewStatus: REVIEW_STATUS,
        previousHash: previousEntry ? previousEntry.hash : null
      };
      entry.hash = hashEntry(entry);
      await fs.mkdir(this.directory, { recursive: true });
      await fs.appendFile(this.statePath(), `${JSON.stringify(entry)}\n`, "utf8");
      return summarizeEntry(entry);
    });
  }

  statusFromEntries(entries) {
    return {
      status: "ready",
      id: SERVICE_REGISTRY_ID,
      schemaVersion: SERVICE_REGISTRY_SCHEMA_VERSION,
      recordCount: entries.length,
      serviceCount: new Set(entries.map((entry) => entry.serviceId)).size,
      latestRecord: entries.length ? summarizeEntry(entries.at(-1)) : null,
      label: SERVICE_REGISTRY_NOTICE
    };
  }

  invalidStatus() {
    return {
      status: "attention",
      code: "service-registry-invalid",
      expectedId: SERVICE_REGISTRY_ID,
      expectedSchemaVersion: SERVICE_REGISTRY_SCHEMA_VERSION,
      label: SERVICE_REGISTRY_NOTICE
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
      if (error.code === "ENOENT") return [];
      throw error;
    }
  }

  statePath() {
    return path.join(this.directory, SERVICE_REGISTRY_FILE_NAME);
  }
}

function validateEntries(entries) {
  if (!Array.isArray(entries)) throw new TypeError("service registry must contain an entry array");
  const services = new Map();
  const ids = new Set();
  let previousHash = null;
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    const previousRevision = services.get(entry?.serviceId);
    if (!entry || entry.schemaVersion !== SERVICE_REGISTRY_SCHEMA_VERSION ||
      !isUuid(entry.id) || ids.has(entry.id) || entry.sequence !== index + 1 || !isIsoTimestamp(entry.recordedAt) ||
      !["register", "update"].includes(entry.operation) || !isServiceId(entry.serviceId) ||
      !Number.isInteger(entry.revision) || entry.revision < 1 ||
      !isSafeText(entry.serviceName, 120) || !isSafeText(entry.purpose, 500) ||
      !STAGES.has(entry.stage) || !CLASSIFICATIONS.has(entry.classification) ||
      entry.ownerRole !== "founder" || !isSafeText(entry.dependencySummary, 500) ||
      entry.reviewStatus !== REVIEW_STATUS || entry.previousHash !== previousHash ||
      !isHash(entry.hash) || entry.hash !== hashEntry(entry) ||
      (entry.operation === "register" && previousRevision) ||
      (entry.operation === "update" && !previousRevision) ||
      (previousRevision && entry.revision !== previousRevision.revision + 1) ||
      (previousRevision && !TRANSITIONS[previousRevision.stage].has(entry.stage))) {
      throw new TypeError("service registry has an invalid entry");
    }
    ids.add(entry.id);
    services.set(entry.serviceId, entry);
    previousHash = entry.hash;
  }
}

function assertInput(input) {
  if (!isRecord(input)) throw new TypeError("service registry entry must be an object");
  const allowed = new Set([
    "operation", "serviceId", "serviceName", "purpose", "stage",
    "classification", "ownerRole", "dependencySummary"
  ]);
  if (Object.keys(input).some((key) => !allowed.has(key))) {
    throw new TypeError("service registry entry contains unsupported fields");
  }
  if (!["register", "update"].includes(input.operation)) {
    throw new RangeError("operation must be register or update");
  }
  if (!isServiceId(input.serviceId)) {
    throw new TypeError("serviceId must be lowercase kebab-case up to 120 characters");
  }
  for (const [field, limit] of [["serviceName", 120], ["purpose", 500], ["dependencySummary", 500]]) {
    if (!isSafeText(input[field], limit)) {
      throw new TypeError(`${field} must be a non-sensitive bounded plain-text string`);
    }
  }
  if (!STAGES.has(input.stage)) throw new RangeError("stage is unsupported");
  if (!CLASSIFICATIONS.has(input.classification)) throw new RangeError("classification is unsupported");
  if (input.ownerRole !== "founder") throw new RangeError("ownerRole must be founder");
}

function normalizeInput(input) {
  return Object.fromEntries(Object.entries(input).map(([key, value]) => [
    key, typeof value === "string" ? value.trim() : value
  ]));
}

function hashEntry(entry) {
  return createHash("sha256").update(JSON.stringify({
    schemaVersion: entry.schemaVersion, id: entry.id, sequence: entry.sequence,
    recordedAt: entry.recordedAt, operation: entry.operation, serviceId: entry.serviceId,
    revision: entry.revision, serviceName: entry.serviceName, purpose: entry.purpose,
    stage: entry.stage, classification: entry.classification, ownerRole: entry.ownerRole,
    dependencySummary: entry.dependencySummary, reviewStatus: entry.reviewStatus,
    previousHash: entry.previousHash
  })).digest("hex");
}

function summarizeEntry(entry) {
  return {
    sequence: entry.sequence, recordedAt: entry.recordedAt, operation: entry.operation,
    serviceId: entry.serviceId, revision: entry.revision, serviceName: entry.serviceName,
    purpose: entry.purpose, stage: entry.stage, classification: entry.classification,
    ownerRole: entry.ownerRole, dependencySummary: entry.dependencySummary,
    reviewStatus: entry.reviewStatus, previousHash: entry.previousHash, hash: entry.hash
  };
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isServiceId(value) {
  return typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.trim()) &&
    value.trim().length <= 120;
}

function isSafeText(value, limit) {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= limit &&
    /^[A-Za-z0-9][A-Za-z0-9 .,:;()&'/-]*$/.test(value.trim()) &&
    !PROHIBITED_TEXT.test(value) && !/https?:\/\/|www\./i.test(value);
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
  SERVICE_REGISTRY_FILE_NAME,
  SERVICE_REGISTRY_ID,
  SERVICE_REGISTRY_NOTICE,
  SERVICE_REGISTRY_SCHEMA_VERSION,
  STAGES,
  TRANSITIONS,
  validateServiceRegistryInput: assertInput,
  ServiceRegistryService
};
