const { randomUUID } = require("crypto");
const fs = require("fs/promises");
const path = require("path");

class MonitoringService {
  constructor({ directory, memoryStore, now = () => new Date() }) {
    this.directory = directory;
    this.memoryStore = memoryStore;
    this.now = now;
    this.operationQueue = Promise.resolve();
  }

  async record(snapshot) {
    return this.withState(async (state) => {
      const attention = getAttention(snapshot);
      const fingerprint = JSON.stringify({
        ...snapshot,
        scheduler: {
          enabled: snapshot.scheduler.enabled,
          lastError: snapshot.scheduler.lastError
        },
        attention
      });
      const changed = state.latestFingerprint !== fingerprint;
      const enteredAttention = attention.some((item) => !state.attention.includes(item));
      const record = {
        id: randomUUID(),
        recordedAt: this.now().toISOString(),
        snapshot,
        attention
      };

      state.latest = record;
      state.latestFingerprint = fingerprint;
      state.attention = attention;
      if (changed || enteredAttention) {
        state.history.push(record);
        state.history = state.history.slice(-100);
      }
      if (enteredAttention) {
        await this.memoryStore.record({
          kind: "decision",
          content: `Monitoring attention required: ${attention.join(", ")}.`,
          metadata: { source: "monitoring", attention }
        });
      }
      return { ...record, recorded: changed || enteredAttention };
    });
  }

  async status() {
    return this.withState(async (state) => state.latest || {
      status: "not-yet-sampled",
      attention: []
    });
  }

  async history(limit = 20) {
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new RangeError("limit must be an integer between 1 and 100");
    }
    return this.withState(async (state) => state.history.slice(-limit).reverse());
  }

  async withState(operation) {
    const queuedOperation = this.operationQueue.then(async () => {
      const state = await this.readState();
      const result = await operation(state);
      await this.writeState(state);
      return result;
    });
    this.operationQueue = queuedOperation.catch(() => {});
    return queuedOperation;
  }

  async readState() {
    try {
      const state = JSON.parse(await fs.readFile(this.statePath(), "utf8"));
      if (!Array.isArray(state.history) || !Array.isArray(state.attention)) {
        throw new TypeError("monitoring state has an invalid shape");
      }
      return state;
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
      return { latest: null, latestFingerprint: null, attention: [], history: [] };
    }
  }

  async writeState(state) {
    await fs.mkdir(this.directory, { recursive: true });
    const temporaryPath = `${this.statePath()}.${randomUUID()}.tmp`;
    await fs.writeFile(temporaryPath, JSON.stringify(state, null, 2), "utf8");
    await replaceFile(temporaryPath, this.statePath());
  }

  statePath() {
    return path.join(this.directory, "monitoring.json");
  }
}

function getAttention(snapshot) {
  const attention = [];
  if (!snapshot.memoryAvailable) attention.push("memory-unavailable");
  if (snapshot.automation.failedTasks > 0) attention.push("failed-tasks");
  if (snapshot.scheduler.enabled && snapshot.scheduler.lastError) attention.push("scheduler-error");
  if (snapshot.automation.pendingTasks > 20) attention.push("queue-backlog");
  if (snapshot.governance && snapshot.governance.status !== "ready") {
    attention.push("governance-readiness");
  }
  if (snapshot.recovery && snapshot.recovery.status !== "ready") {
    attention.push("recovery-not-ready");
  }
  return attention;
}

async function replaceFile(source, destination) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await fs.rename(source, destination);
      return;
    } catch (error) {
      if ((error.code !== "EPERM" && error.code !== "EBUSY") || attempt === 2) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, (attempt + 1) * 25));
    }
  }
}

module.exports = { MonitoringService, getAttention };
