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
// Uploaded file bytes are stored under this subdirectory of the catalog's
// own data directory (never the git repository), so a stored sourceReference
// like "uploads/<uuid>.pdf" is visibly distinguishable from a repository
// path like "docs/foo.md". Storing is admin-authenticated and size-capped at
// the HTTP layer (see index.js); this service only persists whatever bytes
// it is given and reports their sha256, it does not classify or catalog
// them -- filing a catalog entry for an upload still goes through the
// existing operator-approved source.catalog automation task.
const UPLOAD_SUBDIRECTORY = "uploads";
const CHAT_ATTACHMENT_ALLOWED_EXTENSIONS = new Set([".txt", ".md", ".csv", ".json"]);
const CHAT_ATTACHMENT_MAX_FILES = 4;
const CHAT_ATTACHMENT_MAX_TOTAL_BYTES = 1024 * 1024;
const CHAT_ATTACHMENT_MAX_TEXT_BYTES_PER_FILE = 64 * 1024;
const CHAT_ATTACHMENT_MAX_TEXT_CHARACTERS = 24000;

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

  // Stores raw uploaded file bytes to local disk (under this service's own
  // data directory) and returns a sourceReference + sha256 computed from the
  // actual stored bytes -- never a client-supplied hash. This only persists
  // the file; it intentionally does not create a catalog entry, so filing
  // still requires an approved source.catalog automation task, preserving
  // the existing governance/approval boundary while adding real storage.
  async storeUpload({ buffer, filename }) {
    if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
      throw new TypeError("uploaded file must be a non-empty buffer");
    }
    const extension = sanitizeUploadExtension(filename);
    const storedName = `${randomUUID()}${extension}`;
    const uploadDirectory = path.join(this.directory, UPLOAD_SUBDIRECTORY);
    await fs.mkdir(uploadDirectory, { recursive: true });
    await fs.writeFile(path.join(uploadDirectory, storedName), buffer);
    return {
      sourceReference: `${UPLOAD_SUBDIRECTORY}/${storedName}`,
      sha256: createHash("sha256").update(buffer).digest("hex"),
      size: buffer.length,
      originalFilename: typeof filename === "string" && filename.trim() ? filename.trim().slice(0, 200) : null
    };
  }

  validateChatAttachments(attachments) {
    if (attachments === undefined) {
      return [];
    }
    if (!Array.isArray(attachments)) {
      throw new TypeError("attachments must be an array");
    }
    if (attachments.length > CHAT_ATTACHMENT_MAX_FILES) {
      throw new RangeError(`attachments must contain at most ${CHAT_ATTACHMENT_MAX_FILES} files`);
    }
    let declaredTotalBytes = 0;
    const normalizedAttachments = [];

    for (const attachment of attachments) {
      const normalized = normalizeChatAttachmentInput(attachment);
      declaredTotalBytes += normalized.size;
      if (declaredTotalBytes > CHAT_ATTACHMENT_MAX_TOTAL_BYTES) {
        throw new RangeError(
          `attachments must not exceed ${CHAT_ATTACHMENT_MAX_TOTAL_BYTES} bytes in total`
        );
      }
      normalizedAttachments.push(normalized);
    }
    return normalizedAttachments;
  }

  async prepareChatAttachments(attachments) {
    const normalizedAttachments = this.validateChatAttachments(attachments);
    const uploadDirectory = path.join(this.directory, UPLOAD_SUBDIRECTORY);
    let extractedCharacters = 0;
    const prepared = [];

    for (const normalized of normalizedAttachments) {
      const filePath = resolveUploadReferencePath(uploadDirectory, normalized.sourceReference);
      let buffer;
      try {
        buffer = await fs.readFile(filePath);
      } catch (error) {
        if (error.code === "ENOENT") {
          throw new RangeError(`attachment file was not found: ${normalized.originalFilename}`);
        }
        throw error;
      }
      if (buffer.length !== normalized.size) {
        throw new RangeError(`attachment size mismatch: ${normalized.originalFilename}`);
      }

      const actualHash = createHash("sha256").update(buffer).digest("hex");
      if (actualHash !== normalized.sha256) {
        throw new RangeError(`attachment integrity check failed: ${normalized.originalFilename}`);
      }

      const extension = path.extname(normalized.sourceReference).toLowerCase();
      if (!CHAT_ATTACHMENT_ALLOWED_EXTENSIONS.has(extension)) {
        prepared.push({
          ...normalized,
          status: "failed",
          detail: unsupportedAttachmentDetail(extension)
        });
        continue;
      }

      const remainingCharacters = CHAT_ATTACHMENT_MAX_TEXT_CHARACTERS - extractedCharacters;
      if (remainingCharacters <= 0) {
        prepared.push({
          ...normalized,
          status: "failed",
          detail: "Attachment was stored, but AXI skipped it for this reply because the chat attachment context budget was already exhausted."
        });
        continue;
      }

      const maxReadableBytes = Math.min(buffer.length, CHAT_ATTACHMENT_MAX_TEXT_BYTES_PER_FILE);
      let text = buffer.subarray(0, maxReadableBytes).toString("utf8");
      let truncated = buffer.length > maxReadableBytes;
      if (text.length > remainingCharacters) {
        text = text.slice(0, remainingCharacters);
        truncated = true;
      }
      extractedCharacters += text.length;

      prepared.push({
        ...normalized,
        status: "processed",
        text,
        detail: truncated
          ? `Read the first ${Math.min(buffer.length, CHAT_ATTACHMENT_MAX_TEXT_BYTES_PER_FILE)} bytes for this reply.`
          : "Read this attachment for the current reply."
      });
    }

    return prepared;
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

// Only ever used to preserve a readable file extension on disk (e.g. ".pdf")
// -- never the caller-supplied name or path itself, so this cannot be used
// for path traversal or to overwrite an arbitrary file. Anything that is
// not a short alphanumeric extension is dropped in favor of no extension.
function sanitizeUploadExtension(filename) {
  if (typeof filename !== "string") {
    return "";
  }
  const match = /\.[A-Za-z0-9]{1,10}$/.exec(filename.trim());
  return match ? match[0].toLowerCase() : "";
}

function normalizeChatAttachmentInput(input) {
  if (!isRecord(input)) {
    throw new TypeError("attachment metadata must be an object");
  }
  const allowedFields = new Set([
    "sourceReference",
    "sha256",
    "size",
    "originalFilename",
    "mimeType"
  ]);
  if (Object.keys(input).some((field) => !allowedFields.has(field))) {
    throw new TypeError("attachment metadata contains unsupported fields");
  }

  const normalizedSourceReference = normalizeUploadReference(input.sourceReference);
  if (!normalizedSourceReference) {
    throw new TypeError("attachment sourceReference must be an uploads/<uuid> path created by this system");
  }
  if (!isHash(input.sha256)) {
    throw new TypeError("attachment sha256 must be a 64-character hexadecimal hash");
  }
  if (!Number.isInteger(input.size) || input.size < 1) {
    throw new TypeError("attachment size must be a positive integer");
  }
  if (!isBoundedString(input.originalFilename, 200)) {
    throw new TypeError("attachment originalFilename must be a non-empty string up to 200 characters");
  }
  if (!(input.mimeType === "" || input.mimeType === null || isBoundedString(input.mimeType, 120))) {
    throw new TypeError("attachment mimeType must be an empty string or a bounded string up to 120 characters");
  }

  return {
    sourceReference: normalizedSourceReference,
    sha256: input.sha256.toLowerCase(),
    size: input.size,
    originalFilename: input.originalFilename.trim(),
    mimeType: typeof input.mimeType === "string" ? input.mimeType.trim() : ""
  };
}

function normalizeUploadReference(value) {
  if (!isBoundedString(value, 500)) {
    return null;
  }
  const normalized = normalizeSourceReference(value);
  return /^uploads\/[0-9a-f-]{36}(?:\.[A-Za-z0-9]{1,10})?$/.test(normalized)
    ? normalized
    : null;
}

function resolveUploadReferencePath(uploadDirectory, sourceReference) {
  const relativeName = sourceReference.slice(`${UPLOAD_SUBDIRECTORY}/`.length);
  const resolvedPath = path.resolve(uploadDirectory, relativeName);
  const expectedPrefix = `${path.resolve(uploadDirectory)}${path.sep}`;
  if (!resolvedPath.startsWith(expectedPrefix)) {
    throw new TypeError("attachment sourceReference must stay within the upload directory");
  }
  return resolvedPath;
}

function unsupportedAttachmentDetail(extension) {
  switch (extension) {
    case ".pdf":
    case ".doc":
    case ".docx":
      return "Attachment was stored, but AXI cannot read this document format in chat yet. Text extraction is currently limited to .txt, .md, .csv, and .json.";
    case ".png":
    case ".jpg":
    case ".jpeg":
    case ".gif":
    case ".webp":
      return "Attachment was stored, but AXI does not have a tested vision path in chat yet, so this image was not interpreted.";
    default:
      return "Attachment was stored, but AXI could not read this file type in chat.";
  }
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

// Read-only discovery data for API/console consumers, so a caller can query
// the valid sourceType/classification values and field constraints instead
// of hardcoding or reverse-engineering them from source. sourceType already
// covers every kind of file/source a founder might want cataloged
// (application, dataset, document, media, record, other); "other" is the
// deliberate catch-all so this list never blocks a legitimate submission.
function describeOptions({ maxUploadBytes } = {}) {
  return {
    sourceTypes: [...SOURCE_TYPES],
    classifications: [...CLASSIFICATIONS],
    reviewStatus: REVIEW_STATUS,
    fields: {
      sourceId: "lowercase kebab-case, up to 120 characters, must be unique",
      title: "non-empty string, up to 200 characters",
      sourceType: `one of: ${[...SOURCE_TYPES].join(", ")}`,
      classification: `one of: ${[...CLASSIFICATIONS].join(", ")}`,
      sourceReference: "repository-relative path, up to 500 characters, no leading slash or .. segments (or an uploads/<name> path returned by the upload endpoint)",
      sha256: "64-character hexadecimal hash of the source content"
    },
    upload: {
      route: "POST /system/source-catalog/uploads",
      auth: "admin (HTTP Basic)",
      maxBytes: Number.isInteger(maxUploadBytes) ? maxUploadBytes : null,
      notes: "Accepts raw file bytes as the request body, stores them under this service's own data directory (never the git repository), and returns a sourceReference/sha256 computed from the stored bytes. This only stores bytes -- it does not create a catalog entry. Filing the resulting sourceReference still requires a source.catalog automation task with operator approval."
    },
    notes: [
      "sourceType is a metadata classification, not a file-extension allowlist: every file type is representable via one of the listed values.",
      "This service appends approved metadata only. Uploading raw bytes (see the upload field above) is a separate, admin-authenticated, size-capped step; cataloging an entry still requires operator approval (see docs/AXI_AUTOMATION_SERVICE.md)."
    ]
  };
}

module.exports = {
  CHAT_ATTACHMENT_ALLOWED_EXTENSIONS,
  CHAT_ATTACHMENT_MAX_FILES,
  CHAT_ATTACHMENT_MAX_TOTAL_BYTES,
  CHAT_ATTACHMENT_MAX_TEXT_BYTES_PER_FILE,
  CHAT_ATTACHMENT_MAX_TEXT_CHARACTERS,
  SOURCE_CATALOG_FILE_NAME,
  SOURCE_CATALOG_ID,
  SOURCE_CATALOG_SCHEMA_VERSION,
  SOURCE_TYPES,
  CLASSIFICATIONS,
  SourceCatalogService,
  describeOptions
};
