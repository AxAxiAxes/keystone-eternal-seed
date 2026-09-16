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

  async list(kind, limit = 50, { metadataFilter, scanLimit = 500 } = {}) {
    if (!ENTRY_KINDS.has(kind)) {
      throw new RangeError(`Unsupported memory kind: ${kind}`);
    }
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new RangeError("limit must be an integer between 1 and 100");
    }

    try {
      const contents = await fs.readFile(this.entriesPath(kind), "utf8");
      const lines = contents.trim().split("\n").filter(Boolean);

      if (!metadataFilter) {
        // Slice to the requested tail before parsing: this log is
        // append-only and grows without bound, so parsing every line just
        // to discard all but the last `limit` wastes CPU proportional to
        // the full file size on every read.
        return lines
          .slice(-limit)
          .map((line) => JSON.parse(line))
          .reverse();
      }

      // Filtered reads (e.g. scoping a chat session's own history) can't
      // rely on the plain tail slice above, since matching entries may sit
      // further back than the most recent `limit` lines once other
      // sessions have interleaved entries. Scan backward from the tail up
      // to `scanLimit` raw lines -- bounded work, not the whole file --
      // stopping once `limit` matches are found.
      const scanned = lines.slice(-scanLimit);
      const matches = [];
      for (let i = scanned.length - 1; i >= 0 && matches.length < limit; i -= 1) {
        const entry = JSON.parse(scanned[i]);
        if (matchesMetadata(entry.metadata, metadataFilter)) {
          matches.push(entry);
        }
      }
      return matches;
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

function matchesMetadata(metadata, filter) {
  if (!isRecord(metadata)) return false;
  return Object.entries(filter).every(([key, value]) => metadata[key] === value);
}

module.exports = { ENTRY_KINDS, MemoryStore };
