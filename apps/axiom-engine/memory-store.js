const { randomUUID } = require("crypto");
const fs = require("fs/promises");
const path = require("path");

const ENTRY_KINDS = new Set(["episodic", "semantic", "decision", "procedure"]);

class MemoryStore {
  constructor(directory) {
    this.directory = directory;
  }

  async record({ kind, content, metadata = {} }) {
    if (!ENTRY_KINDS.has(kind)) {
      throw new RangeError(`Unsupported memory kind: ${kind}`);
    }
    if (typeof content !== "string" || content.trim().length === 0) {
      throw new TypeError("content must be a non-empty string");
    }
    if (!isRecord(metadata)) {
      throw new TypeError("metadata must be an object");
    }

    const entry = {
      id: randomUUID(),
      kind,
      content: content.trim(),
      metadata,
      recordedAt: new Date().toISOString()
    };

    await fs.mkdir(this.directory, { recursive: true });
    await fs.appendFile(
      this.entriesPath(kind),
      `${JSON.stringify(entry)}\n`,
      "utf8"
    );
    return entry;
  }

  async list(kind, limit = 50) {
    if (!ENTRY_KINDS.has(kind)) {
      throw new RangeError(`Unsupported memory kind: ${kind}`);
    }
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new RangeError("limit must be an integer between 1 and 100");
    }

    try {
      const contents = await fs.readFile(this.entriesPath(kind), "utf8");
      return contents
        .trim()
        .split("\n")
        .filter(Boolean)
        .map((line) => JSON.parse(line))
        .slice(-limit)
        .reverse();
    } catch (error) {
      if (error.code === "ENOENT") {
        return [];
      }
      throw error;
    }
  }

  async readIdentity() {
    try {
      return JSON.parse(await fs.readFile(this.identityPath(), "utf8"));
    } catch (error) {
      if (error.code === "ENOENT") {
        return null;
      }
      throw error;
    }
  }

  async writeIdentity({ name, summary }) {
    if (typeof name !== "string" || name.trim().length === 0) {
      throw new TypeError("name must be a non-empty string");
    }
    if (typeof summary !== "string" || summary.trim().length === 0) {
      throw new TypeError("summary must be a non-empty string");
    }

    const identity = {
      name: name.trim(),
      summary: summary.trim(),
      updatedAt: new Date().toISOString()
    };

    await fs.mkdir(this.directory, { recursive: true });
    await fs.writeFile(this.identityPath(), JSON.stringify(identity, null, 2), "utf8");
    return identity;
  }

  entriesPath(kind) {
    return path.join(this.directory, `${kind}.jsonl`);
  }

  identityPath() {
    return path.join(this.directory, "identity.json");
  }
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

module.exports = { ENTRY_KINDS, MemoryStore };
