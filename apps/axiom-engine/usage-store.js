const fs = require("fs/promises");
const path = require("path");

class UsageStore {
  constructor(directory) {
    this.directory = directory;
  }

  async record({ model, usage, responseId }) {
    if (typeof model !== "string" || model.trim().length === 0) {
      throw new TypeError("model must be a non-empty string");
    }
    if (!isUsage(usage)) {
      throw new TypeError("usage must contain non-negative integer token counts");
    }

    const entry = {
      model: model.trim(),
      responseId: typeof responseId === "string" ? responseId : null,
      inputTokens: usage.input_tokens || 0,
      outputTokens: usage.output_tokens || 0,
      totalTokens: usage.total_tokens || 0,
      recordedAt: new Date().toISOString()
    };

    await fs.mkdir(this.directory, { recursive: true });
    await fs.appendFile(this.entriesPath(), `${JSON.stringify(entry)}\n`, "utf8");
    return entry;
  }

  async summary() {
    const entries = await this.list();
    return entries.reduce((totals, entry) => ({
      requests: totals.requests + 1,
      inputTokens: totals.inputTokens + entry.inputTokens,
      outputTokens: totals.outputTokens + entry.outputTokens,
      totalTokens: totals.totalTokens + entry.totalTokens
    }), {
      requests: 0,
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0
    });
  }

  async list() {
    try {
      const contents = await fs.readFile(this.entriesPath(), "utf8");
      return contents
        .trim()
        .split("\n")
        .filter(Boolean)
        .map((line) => JSON.parse(line));
    } catch (error) {
      if (error.code === "ENOENT") {
        return [];
      }
      throw error;
    }
  }

  entriesPath() {
    return path.join(this.directory, "openai-usage.jsonl");
  }
}

function isUsage(value) {
  if (value === null || typeof value !== "object") {
    return false;
  }

  return ["input_tokens", "output_tokens", "total_tokens"].every((key) =>
    value[key] === undefined || (Number.isInteger(value[key]) && value[key] >= 0)
  );
}

module.exports = { UsageStore };
