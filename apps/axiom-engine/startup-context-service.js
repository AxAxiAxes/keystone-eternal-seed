const { randomUUID } = require("crypto");
const fs = require("fs/promises");
const path = require("path");

const STARTUP_CONTEXT = {
  schemaVersion: 1,
  id: "axes-memory-bank-startup-v1",
  version: "2026-09-10",
  purpose: "Provide a private, non-sensitive AXES continuity basis at AXI startup.",
  sourceRecords: [
    "docs/AXI_PROJECT_CONTEXT_CHECKPOINT.md",
    "docs/memory/README.md",
    "docs/AXI_GENESIS_OWNERSHIP_CHECKPOINT.md",
    "docs/AXES_AGENT_ORIGIN_REGISTRY.md",
    "AGENTS.md"
  ],
  boundaries: [
    "The bootstrap record is operational context, not a legal, financial, identity, ownership, or value determination.",
    "It does not replace task-specific source review, human authority, or an independently verified recovery bundle.",
    "It contains no credentials, personal data, private source archives, or provider prompts.",
    "It does not publish, contact external services, deploy, spend, or enable the scheduler."
  ]
};

class StartupContextService {
  constructor({ directory, now = () => new Date() }) {
    this.directory = directory;
    this.now = now;
  }

  async initialize() {
    const existing = await this.readState();
    if (!existing) {
      const state = {
        ...STARTUP_CONTEXT,
        createdAt: this.now().toISOString(),
        lastStartedAt: this.now().toISOString(),
        startupCount: 1
      };
      await this.writeState(state);
      return this.toStatus(state);
    }

    if (existing.invalid) {
      return this.invalidStatus();
    }

    if (!this.matchesContext(existing)) {
      return this.versionMismatchStatus(existing);
    }

    const state = {
      ...existing,
      lastStartedAt: this.now().toISOString(),
      startupCount: existing.startupCount + 1
    };
    await this.writeState(state);
    return this.toStatus(state);
  }

  async status() {
    const state = await this.readState();
    if (!state) {
      return this.initialize();
    }
    if (state.invalid) {
      return this.invalidStatus();
    }
    if (!this.matchesContext(state)) {
      return this.versionMismatchStatus(state);
    }
    return this.toStatus(state);
  }

  async readState() {
    try {
      const state = JSON.parse(await fs.readFile(this.statePath(), "utf8"));
      if (!isValidState(state)) {
        return { invalid: true };
      }
      return state;
    } catch (error) {
      if (error.code === "ENOENT") {
        return null;
      }
      return { invalid: true };
    }
  }

  matchesContext(state) {
    return state
      && state.schemaVersion === STARTUP_CONTEXT.schemaVersion
      && state.id === STARTUP_CONTEXT.id
      && state.version === STARTUP_CONTEXT.version;
  }

  toStatus(state) {
    return {
      status: "ready",
      id: state.id,
      version: state.version,
      createdAt: state.createdAt,
      lastStartedAt: state.lastStartedAt,
      startupCount: state.startupCount,
      sourceRecords: state.sourceRecords
    };
  }

  invalidStatus() {
    return {
      status: "attention",
      code: "startup-context-invalid",
      expectedId: STARTUP_CONTEXT.id,
      expectedVersion: STARTUP_CONTEXT.version
    };
  }

  versionMismatchStatus(state) {
    return {
      status: "attention",
      code: "startup-context-version-mismatch",
      expectedId: STARTUP_CONTEXT.id,
      expectedVersion: STARTUP_CONTEXT.version,
      recordedId: state.id || null,
      recordedVersion: state.version || null
    };
  }

  async writeState(state) {
    await fs.mkdir(this.directory, { recursive: true });
    const temporaryPath = `${this.statePath()}.${randomUUID()}.tmp`;
    await fs.writeFile(temporaryPath, JSON.stringify(state, null, 2), "utf8");
    await replaceFile(temporaryPath, this.statePath());
  }

  statePath() {
    return path.join(this.directory, "startup-context.json");
  }
}

function isValidState(state) {
  return state
    && typeof state === "object"
    && Number.isInteger(state.startupCount)
    && state.startupCount >= 1
    && Array.isArray(state.sourceRecords);
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

module.exports = { STARTUP_CONTEXT, StartupContextService };
