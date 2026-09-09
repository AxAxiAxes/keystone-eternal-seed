const { randomUUID } = require("crypto");
const fs = require("fs/promises");
const path = require("path");

const TASK_ACTIONS = new Set(["memory.record", "automation.noop"]);
const TASK_STATUSES = new Set([
  "pending",
  "running",
  "completed",
  "failed",
  "cancelled"
]);

class AutomationService {
  constructor({ directory, memoryStore, now = () => new Date() }) {
    this.directory = directory;
    this.memoryStore = memoryStore;
    this.now = now;
    this.operationQueue = Promise.resolve();
  }

  async listAgents() {
    return this.withState(async (state) => state.agents);
  }

  async registerAgent({ id, name, capabilities }) {
    return this.withState(async (state) => {
      if (id !== undefined && !isNonEmptyString(id)) {
        throw new TypeError("agent id must be a non-empty string");
      }
      if (!isNonEmptyString(name)) {
        throw new TypeError("agent name must be a non-empty string");
      }
      if (!Array.isArray(capabilities) || capabilities.length === 0 ||
        !capabilities.every(isNonEmptyString)) {
        throw new TypeError("agent capabilities must be a non-empty string array");
      }

      const agent = {
        id: id || randomUUID(),
        name: name.trim(),
        capabilities: [...new Set(capabilities.map((capability) => capability.trim()))],
        enabled: true,
        registeredAt: this.now().toISOString()
      };
      if (state.agents.some((existingAgent) => existingAgent.id === agent.id)) {
        throw new RangeError(`agent already exists: ${agent.id}`);
      }

      state.agents.push(agent);
      return agent;
    });
  }

  async createTask({ title, action, payload = {}, agentId, runAt, recurrenceMinutes }) {
    return this.withState(async (state) => {
      if (!isNonEmptyString(title)) {
        throw new TypeError("task title must be a non-empty string");
      }
      if (!TASK_ACTIONS.has(action)) {
        throw new RangeError(`unsupported task action: ${action}`);
      }
      if (!isRecord(payload)) {
        throw new TypeError("task payload must be an object");
      }
      if (agentId !== undefined && !isNonEmptyString(agentId)) {
        throw new TypeError("task agentId must be a non-empty string");
      }
      if (agentId && !state.agents.some((agent) => agent.id === agentId)) {
        throw new RangeError(`agent does not exist: ${agentId}`);
      }

      const scheduledAt = runAt === undefined ? this.now() : new Date(runAt);
      if (Number.isNaN(scheduledAt.valueOf())) {
        throw new TypeError("task runAt must be an ISO-8601 date");
      }
      if (recurrenceMinutes !== undefined &&
        (!Number.isInteger(recurrenceMinutes) || recurrenceMinutes < 1 ||
          recurrenceMinutes > 10080)) {
        throw new RangeError("task recurrenceMinutes must be an integer from 1 to 10080");
      }

      const task = {
        id: randomUUID(),
        title: title.trim(),
        action,
        payload,
        agentId: agentId || null,
        status: "pending",
        runAt: scheduledAt.toISOString(),
        recurrenceMinutes: recurrenceMinutes || null,
        runCount: 0,
        createdAt: this.now().toISOString(),
        updatedAt: this.now().toISOString()
      };
      state.tasks.push(task);
      return task;
    });
  }

  async listTasks(status) {
    return this.withState(async (state) => {
      if (status !== undefined && !TASK_STATUSES.has(status)) {
        throw new RangeError(`unsupported task status: ${status}`);
      }
      return status ? state.tasks.filter((task) => task.status === status) : state.tasks;
    });
  }

  async listRuns(limit = 50) {
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new RangeError("limit must be an integer between 1 and 100");
    }
    return this.withState(async (state) => state.runs.slice(-limit).reverse());
  }

  async processDueTasks(maxTasks = 5) {
    if (!Number.isInteger(maxTasks) || maxTasks < 1 || maxTasks > 20) {
      throw new RangeError("maxTasks must be an integer between 1 and 20");
    }

    return this.withState(async (state) => {
      const now = this.now();
      const dueTasks = state.tasks
        .filter((task) => task.status === "pending" && new Date(task.runAt) <= now)
        .slice(0, maxTasks);
      const outcomes = [];

      for (const task of dueTasks) {
        const agent = selectAgent(state.agents, task);
        if (!agent) {
          outcomes.push({ taskId: task.id, status: "unassigned" });
          continue;
        }

        task.status = "running";
        task.updatedAt = this.now().toISOString();
        try {
          const result = await this.executeTask(task, agent);
          task.runCount += 1;
          task.lastRunAt = this.now().toISOString();
          task.lastResult = result;
          if (task.recurrenceMinutes) {
            task.status = "pending";
            task.runAt = new Date(
              this.now().valueOf() + task.recurrenceMinutes * 60_000
            ).toISOString();
          } else {
            task.status = "completed";
          }
          task.updatedAt = this.now().toISOString();
          const run = await this.recordRun(state, task, agent, "completed", result);
          outcomes.push({ taskId: task.id, status: task.status, runId: run.id });
        } catch (error) {
          task.status = "failed";
          task.updatedAt = this.now().toISOString();
          task.lastError = error.message;
          const run = await this.recordRun(
            state,
            task,
            agent,
            "failed",
            { error: error.message }
          );
          outcomes.push({ taskId: task.id, status: "failed", runId: run.id });
        }
      }

      return outcomes;
    });
  }

  async status() {
    return this.withState(async (state) => ({
      agents: state.agents.length,
      pendingTasks: state.tasks.filter((task) => task.status === "pending").length,
      completedTasks: state.tasks.filter((task) => task.status === "completed").length,
      failedTasks: state.tasks.filter((task) => task.status === "failed").length,
      runs: state.runs.length
    }));
  }

  async executeTask(task, agent) {
    if (task.action === "automation.noop") {
      return { message: "No-op automation completed" };
    }
    if (task.action === "memory.record") {
      const entry = await this.memoryStore.record({
        kind: task.payload.kind,
        content: task.payload.content,
        metadata: {
          ...task.payload.metadata,
          source: "automation",
          taskId: task.id,
          agentId: agent.id
        }
      });
      return { memoryEntryId: entry.id, memoryKind: entry.kind };
    }
    throw new RangeError(`unsupported task action: ${task.action}`);
  }

  async recordRun(state, task, agent, status, result) {
    const run = {
      id: randomUUID(),
      taskId: task.id,
      agentId: agent.id,
      action: task.action,
      status,
      result,
      recordedAt: this.now().toISOString()
    };
    state.runs.push(run);
    await this.memoryStore.record({
      kind: "decision",
      content: `Automation task "${task.title}" ${status} by ${agent.name}.`,
      metadata: {
        source: "automation",
        taskId: task.id,
        runId: run.id,
        agentId: agent.id,
        action: task.action,
        status
      }
    });
    return run;
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
      if (!Array.isArray(state.agents) || !Array.isArray(state.tasks) ||
        !Array.isArray(state.runs)) {
        throw new TypeError("automation state has an invalid shape");
      }
      return state;
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
      return {
        agents: defaultAgents(this.now),
        tasks: [],
        runs: []
      };
    }
  }

  async writeState(state) {
    await fs.mkdir(this.directory, { recursive: true });
    const temporaryPath = `${this.statePath()}.${randomUUID()}.tmp`;
    await fs.writeFile(temporaryPath, JSON.stringify(state, null, 2), "utf8");
    await fs.rename(temporaryPath, this.statePath());
  }

  statePath() {
    return path.join(this.directory, "automation.json");
  }
}

function startAutomationScheduler(service, {
  pollIntervalMs = 60_000,
  maxTasks = 5,
  logger = console
} = {}) {
  if (!Number.isInteger(pollIntervalMs) || pollIntervalMs < 1_000 ||
    pollIntervalMs > 3_600_000) {
    throw new RangeError("pollIntervalMs must be an integer from 1000 to 3600000");
  }

  const process = () => service.processDueTasks(maxTasks).catch((error) => {
    logger.error("AXIOM automation scheduler failed:", error);
  });
  process();
  return setInterval(process, pollIntervalMs);
}

function defaultAgents(now) {
  const registeredAt = now().toISOString();
  return [
    {
      id: "memory-curator",
      name: "Memory Curator",
      capabilities: ["memory.record"],
      enabled: true,
      registeredAt
    },
    {
      id: "automation-executor",
      name: "Automation Executor",
      capabilities: ["automation.noop"],
      enabled: true,
      registeredAt
    },
    {
      id: "automation-auditor",
      name: "Automation Auditor",
      capabilities: ["memory.record", "automation.noop"],
      enabled: true,
      registeredAt
    }
  ];
}

function selectAgent(agents, task) {
  if (task.agentId) {
    const assignedAgent = agents.find((agent) => agent.id === task.agentId);
    return assignedAgent?.enabled &&
      assignedAgent.capabilities.includes(task.action) ? assignedAgent : null;
  }
  return agents.find((agent) =>
    agent.enabled && agent.capabilities.includes(task.action)
  ) || null;
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

module.exports = {
  AutomationService,
  TASK_ACTIONS,
  TASK_STATUSES,
  startAutomationScheduler
};
