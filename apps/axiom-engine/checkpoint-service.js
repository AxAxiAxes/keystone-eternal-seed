const { createHash, randomUUID } = require("crypto");
const fs = require("fs/promises");
const path = require("path");

const PERSISTED_FILE_NAMES = [
  "identity.json",
  "startup-context.json",
  "continuity-record.jsonl",
  "source-catalog.jsonl",
  "business-metrics.jsonl",
  "service-registry.jsonl",
  "automation-profiles.jsonl",
  "episodic.jsonl",
  "semantic.jsonl",
  "decision.jsonl",
  "procedure.jsonl",
  "automation.json",
  "monitoring.json",
  "coordinates.jsonl",
  "bead-passports.jsonl",
  "openai-usage.jsonl"
];

class CheckpointService {
  constructor({ directory, modules, now = () => new Date() }) {
    this.directory = directory;
    this.modules = modules;
    this.now = now;
  }

  async create() {
    const files = [];
    for (const name of PERSISTED_FILE_NAMES) {
      const file = await this.describeFile(name);
      if (file) {
        files.push(file);
      }
    }

    const checkpoint = {
      schemaVersion: 1,
      id: randomUUID(),
      createdAt: this.now().toISOString(),
      modules: this.modules,
      files
    };

    await fs.mkdir(this.checkpointsDirectory(), { recursive: true });
    const checkpointPath = path.join(
      this.checkpointsDirectory(),
      `${checkpoint.createdAt.replace(/[:.]/g, "-")}-${checkpoint.id}.json`
    );
    const temporaryPath = `${checkpointPath}.${randomUUID()}.tmp`;
    await fs.writeFile(temporaryPath, JSON.stringify(checkpoint, null, 2), "utf8");
    await fs.rename(temporaryPath, checkpointPath);
    return checkpoint;
  }

  async list(limit = 20) {
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new RangeError("limit must be an integer between 1 and 100");
    }

    try {
      const names = await fs.readdir(this.checkpointsDirectory());
      const checkpoints = await Promise.all(names
        .filter((name) => name.endsWith(".json"))
        .sort()
        .reverse()
        .slice(0, limit)
        .map(async (name) => JSON.parse(await fs.readFile(
          path.join(this.checkpointsDirectory(), name),
          "utf8"
        ))));
      return checkpoints;
    } catch (error) {
      if (error.code === "ENOENT") {
        return [];
      }
      throw error;
    }
  }

  async describeFile(name) {
    const filePath = path.join(this.directory, name);
    try {
      const contents = await fs.readFile(filePath);
      return {
        path: name,
        bytes: contents.length,
        sha256: createHash("sha256").update(contents).digest("hex")
      };
    } catch (error) {
      if (error.code === "ENOENT") {
        return null;
      }
      throw error;
    }
  }

  checkpointsDirectory() {
    return path.join(this.directory, "checkpoints");
  }
}

module.exports = { CheckpointService, PERSISTED_FILE_NAMES };
