const { randomUUID } = require("crypto");
const fs = require("fs/promises");
const path = require("path");

const TASK_ACTIONS = new Set([
  "memory.record",
  "automation.noop",
  "monitoring.snapshot",
  "governance.readiness",
  "recovery.backup",
  "coordinate.record"
]);
const TASK_STATUSES = new Set([
  "pending",
  "running",
  "blocked",
  "awaiting_approval",
  "completed",
  "failed",
  "cancelled"
]);
const AGENT_ACCOUNTABILITY_STATUSES = new Set(["active", "suspended"]);
const AGENT_ATTRIBUTION_SCOPE =
  "KEYSTONE protocol registration of origin, lineage, creator ownership claim, accountable stewardship, and bounded duties.";
const KEYSTONE_REGISTRATION = Object.freeze({
  registry: "KEYSTONE origin and lineage registry",
  sourceRecord: "KEYSTONE-ORIGIN-000001",
  creatorAuthority: "Axel Urartu (AX) · Axes Contracting",
  ownershipClaim: "The creator claims ownership and accountability for AXI agents created and registered within the AXES system.",
  scope: AGENT_ATTRIBUTION_SCOPE
});
const REGISTERED_AGENT_DEFAULT_ORIGIN = "axi-agent-registration";
const AXI_GENESIS_OWNERSHIP_CHECKPOINT = Object.freeze({
  id: "axi-genesis-creator-ownership",
  sourceRecord: "KEYSTONE-ORIGIN-000001",
  creatorAuthority: KEYSTONE_REGISTRATION.creatorAuthority,
  purpose: "Preserve AXI creator ownership and accountability across agent registrations and reset recovery."
});

class AutomationService {
  constructor({
    directory,
    memoryStore,
    captureMonitoringSnapshot,
    createRecoveryBackup,
    verifyRecoveryBackup,
    createCoordinate,
    now = () => new Date()
  }) {
    this.directory = directory;
    this.memoryStore = memoryStore;
    this.captureMonitoringSnapshot = captureMonitoringSnapshot;
    this.createRecoveryBackup = createRecoveryBackup;
    this.verifyRecoveryBackup = verifyRecoveryBackup;
    this.createCoordinate = createCoordinate;
    this.now = now;
    this.operationQueue = Promise.resolve();
  }

  async listAgents() {
    return this.withState(async (state) => state.agents);
  }

  async getAgent(agentId) {
    if (!isNonEmptyString(agentId)) {
      throw new TypeError("agentId must be a non-empty string");
    }
    return this.withState(async (state) => {
      const agent = state.agents.find((entry) => entry.id === agentId);
      if (!agent) {
        throw new RangeError(`agent does not exist: ${agentId}`);
      }
      assertActiveAccountability(agent);
      if (!agent.enabled) {
        throw new RangeError(`agent is disabled: ${agentId}`);
      }
      return agent;
    });
  }

  async registerAgent({
    id,
    name,
    capabilities,
    originCheckpoint,
    creator,
    purpose,
    duties
  }) {
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
      assertOptionalString(originCheckpoint, "agent originCheckpoint");
      assertOptionalString(creator, "agent creator");
      assertOptionalString(purpose, "agent purpose");
      if (duties !== undefined &&
        (!Array.isArray(duties) || duties.length === 0 ||
          !duties.every(isNonEmptyString))) {
        throw new TypeError("agent duties must be a non-empty string array");
      }

      const creatorAuthority = normalizeOptionalString(creator) ||
        KEYSTONE_REGISTRATION.creatorAuthority;
      if (creatorAuthority !== AXI_GENESIS_OWNERSHIP_CHECKPOINT.creatorAuthority) {
        throw new RangeError("agent creator must match the AXI Genesis ownership authority");
      }
      const agent = {
        id: id || randomUUID(),
        name: name.trim(),
        capabilities: [...new Set(capabilities.map((capability) => capability.trim()))],
        enabled: true,
        registeredAt: this.now().toISOString(),
        originCheckpoint: normalizeOptionalString(originCheckpoint) ||
          REGISTERED_AGENT_DEFAULT_ORIGIN,
        creator: creatorAuthority,
        purpose: normalizeOptionalString(purpose),
        duties: duties ? [...new Set(duties.map((duty) => duty.trim()))] : [],
        attributionScope: AGENT_ATTRIBUTION_SCOPE,
        keystoneRegistration: createKeystoneRegistration(creatorAuthority),
        accountability: createAccountabilityRecord(
          this.now().toISOString(),
          "Genesis registration accepted."
        )
      };
      if (state.agents.some((existingAgent) => existingAgent.id === agent.id)) {
        throw new RangeError(`agent already exists: ${agent.id}`);
      }

      state.agents.push(agent);
      return agent;
    });
  }

  async reviewAgentAccountability(agentId, { status, reason }) {
    if (!isNonEmptyString(agentId)) {
      throw new TypeError("agentId must be a non-empty string");
    }
    if (!AGENT_ACCOUNTABILITY_STATUSES.has(status)) {
      throw new RangeError("agent accountability status must be active or suspended");
    }
    if (!isNonEmptyString(reason)) {
      throw new TypeError("agent accountability reason must be a non-empty string");
    }
    return this.withState(async (state) => {
      const agent = findAgent(state.agents, agentId);
      assertRegisteredAgent(agent);
      const occurredAt = this.now().toISOString();
      const event = {
        status,
        occurredAt,
        reason: reason.trim()
      };
      agent.accountability = {
        status,
        reviewedAt: occurredAt,
        reason: event.reason,
        history: [...agent.accountability.history, event]
      };
      return agent;
    });
  }

  async getAgentReport(agentId) {
    if (!isNonEmptyString(agentId)) {
      throw new TypeError("agentId must be a non-empty string");
    }
    return this.withState(async (state) => {
      const agent = findAgent(state.agents, agentId);
      assertRegisteredAgent(agent);
      const timeline = [
        {
          event: "origin",
          occurredAt: agent.registeredAt,
          originCheckpoint: agent.originCheckpoint,
          genesisCheckpoint: agent.keystoneRegistration.genesisCheckpoint.id,
          detail: agent.purpose || "No purpose has been recorded."
        },
        ...agent.accountability.history.map((review) => ({
          event: "accountability-review",
          occurredAt: review.occurredAt,
          status: review.status,
          detail: review.reason
        })),
        ...state.tasks
          .filter((task) => task.agentId === agent.id)
          .map((task) => ({
            event: "task-created",
            occurredAt: task.createdAt,
            taskId: task.id,
            title: task.title,
            action: task.action,
            status: task.status,
            originCheckpoint: task.originCheckpoint
          })),
        ...state.runs
          .filter((run) => run.agentId === agent.id)
          .map((run) => ({
            event: "task-run",
            occurredAt: run.recordedAt,
            taskId: run.taskId,
            action: run.action,
            status: run.status,
            runId: run.id
          }))
      ].sort((left, right) =>
        new Date(right.occurredAt).valueOf() - new Date(left.occurredAt).valueOf());

      return {
        generatedAt: this.now().toISOString(),
        agent: {
          id: agent.id,
          name: agent.name,
          capabilities: agent.capabilities,
          enabled: agent.enabled,
          originCheckpoint: agent.originCheckpoint || null,
          creator: agent.creator || null,
          purpose: agent.purpose || null,
          duties: agent.duties || [],
          attributionScope: agent.attributionScope || AGENT_ATTRIBUTION_SCOPE,
          keystoneRegistration: agent.keystoneRegistration || KEYSTONE_REGISTRATION,
          accountability: agent.accountability
        },
        timeline
      };
    });
  }

  async createTask({
    title,
    action,
    payload = {},
    agentId,
    runAt,
    recurrenceMinutes,
    priority = 3,
    dependsOn = [],
    approvalRequired = false,
    maxAttempts = 1,
    retryDelayMinutes = 5,
    originCheckpoint
  }) {
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
      if (agentId) {
        const assignedAgent = findAgent(state.agents, agentId);
        assertActiveAccountability(assignedAgent);
        if (!assignedAgent.enabled) {
          throw new RangeError(`agent is disabled: ${agentId}`);
        }
        if (!assignedAgent.capabilities.includes(action)) {
          throw new RangeError(`agent does not support task action: ${agentId}`);
        }
      }
      assertOriginCheckpoint(originCheckpoint, "task originCheckpoint");

      const scheduledAt = runAt === undefined ? this.now() : new Date(runAt);
      if (Number.isNaN(scheduledAt.valueOf())) {
        throw new TypeError("task runAt must be an ISO-8601 date");
      }
      if (recurrenceMinutes !== undefined &&
        (!Number.isInteger(recurrenceMinutes) || recurrenceMinutes < 1 ||
          recurrenceMinutes > 10080)) {
        throw new RangeError("task recurrenceMinutes must be an integer from 1 to 10080");
      }
      if (!Number.isInteger(priority) || priority < 1 || priority > 5) {
        throw new RangeError("task priority must be an integer from 1 to 5");
      }
      if (!Array.isArray(dependsOn) || !dependsOn.every(isNonEmptyString)) {
        throw new TypeError("task dependsOn must be a string array");
      }
      const dependencyIds = [...new Set(dependsOn.map((dependency) => dependency.trim()))];
      if (!dependencyIds.every((dependencyId) =>
        state.tasks.some((task) => task.id === dependencyId))) {
        throw new RangeError("task dependencies must reference existing tasks");
      }
      if (typeof approvalRequired !== "boolean") {
        throw new TypeError("task approvalRequired must be a boolean");
      }
      if (!Number.isInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > 5) {
        throw new RangeError("task maxAttempts must be an integer from 1 to 5");
      }
      if (!Number.isInteger(retryDelayMinutes) || retryDelayMinutes < 1 ||
        retryDelayMinutes > 1440) {
        throw new RangeError("task retryDelayMinutes must be an integer from 1 to 1440");
      }

      const task = {
        id: randomUUID(),
        title: title.trim(),
        action,
        payload,
        agentId: agentId || null,
        status: approvalRequired ? "awaiting_approval" :
          dependenciesComplete(state.tasks, dependencyIds) ? "pending" : "blocked",
        runAt: scheduledAt.toISOString(),
        recurrenceMinutes: recurrenceMinutes || null,
        priority,
        dependsOn: dependencyIds,
        approvalRequired,
        approvalStatus: approvalRequired ? "pending" : "not-required",
        maxAttempts,
        retryDelayMinutes,
        originCheckpoint: normalizeOptionalString(originCheckpoint),
        attemptCount: 0,
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
      const tasks = status ? state.tasks.filter((task) => task.status === status) : state.tasks;
      return [...tasks].sort(compareTasks);
    });
  }

  async listRuns(limit = 50) {
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new RangeError("limit must be an integer between 1 and 100");
    }
    return this.withState(async (state) => state.runs.slice(-limit).reverse());
  }

  async reviewTaskApproval(taskId, approved) {
    if (!isNonEmptyString(taskId)) {
      throw new TypeError("taskId must be a non-empty string");
    }
    if (typeof approved !== "boolean") {
      throw new TypeError("approved must be a boolean");
    }
    return this.withState(async (state) => {
      const task = findTask(state.tasks, taskId);
      if (task.status !== "awaiting_approval") {
        throw new RangeError("task is not awaiting approval");
      }
      task.approvalStatus = approved ? "approved" : "rejected";
      task.approvedAt = this.now().toISOString();
      task.status = approved && dependenciesComplete(state.tasks, task.dependsOn)
        ? "pending"
        : approved ? "blocked" : "cancelled";
      task.updatedAt = this.now().toISOString();
      return task;
    });
  }

  async processDueTasks(maxTasks = 5) {
    if (!Number.isInteger(maxTasks) || maxTasks < 1 || maxTasks > 20) {
      throw new RangeError("maxTasks must be an integer between 1 and 20");
    }

    return this.withState(async (state) => {
      const now = this.now();
      unblockReadyTasks(state.tasks, this.now);
      const dueTasks = state.tasks
        .filter((task) => task.status === "pending" && new Date(task.runAt) <= now)
        .sort(compareTasks)
        .slice(0, maxTasks);
      const outcomes = [];

      for (const task of dueTasks) {
        const agent = selectAgent(state.agents, task);
        if (!agent) {
          const assignedAgent = task.agentId
            ? state.agents.find((entry) => entry.id === task.agentId)
            : null;
          if (assignedAgent && isRegisteredAgent(assignedAgent) &&
            !isAccountableAgent(assignedAgent)) {
            task.status = "blocked";
            task.lastError = "Assigned agent accountability is suspended.";
            task.updatedAt = this.now().toISOString();
            outcomes.push({ taskId: task.id, status: "blocked" });
            continue;
          }
          outcomes.push({ taskId: task.id, status: "unassigned" });
          continue;
        }

        task.status = "running";
        task.attemptCount += 1;
        task.updatedAt = this.now().toISOString();
        try {
          const result = await this.executeTask(task, agent, state);
          task.runCount += 1;
          task.lastRunAt = this.now().toISOString();
          task.lastResult = result;
          task.attemptCount = 0;
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
          task.updatedAt = this.now().toISOString();
          task.lastError = error.message;
          const retrying = task.attemptCount < task.maxAttempts;
          task.status = retrying ? "pending" : "failed";
          if (retrying) {
            task.runAt = new Date(
              this.now().valueOf() + task.retryDelayMinutes * 60_000
            ).toISOString();
          }
          const run = await this.recordRun(
            state,
            task,
            agent,
            retrying ? "retrying" : "failed",
            { error: error.message }
          );
          outcomes.push({ taskId: task.id, status: task.status, runId: run.id });
        }
      }

      return outcomes;
    });
  }

  async status() {
    return this.withState(async (state) => summarizeAutomationState(state));
  }

  async getGovernanceReadiness() {
    return this.withState(async (state) => evaluateGovernanceReadiness(state));
  }

  async executeTask(task, agent, state) {
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
    if (task.action === "monitoring.snapshot") {
      if (typeof this.captureMonitoringSnapshot !== "function") {
        throw new RangeError("monitoring snapshots are not configured");
      }
      const snapshot = await this.captureMonitoringSnapshot(state);
      return {
        monitoringSnapshotId: snapshot.id,
        recorded: snapshot.recorded,
        attention: snapshot.attention
      };
    }
    if (task.action === "governance.readiness") {
      return evaluateGovernanceReadiness(state);
    }
    if (task.action === "recovery.backup") {
      if (typeof this.createRecoveryBackup !== "function" ||
        typeof this.verifyRecoveryBackup !== "function") {
        throw new RangeError("recovery backups are not configured");
      }
      const backup = await this.createRecoveryBackup();
      return {
        backup,
        verification: await this.verifyRecoveryBackup(backup.id)
      };
    }
    if (task.action === "coordinate.record") {
      if (typeof this.createCoordinate !== "function") {
        throw new RangeError("coordinate recording is not configured");
      }
      return {
        coordinate: await this.createCoordinate({
          label: task.payload.label || task.title,
          occurredAt: task.payload.occurredAt,
          sourceRecord: task.payload.sourceRecord,
          originCheckpoint: task.payload.originCheckpoint || task.originCheckpoint
        })
      };
    }
    throw new RangeError(`unsupported task action: ${task.action}`);
  }

  async recordRun(state, task, agent, status, result) {
    const run = {
      id: randomUUID(),
      taskId: task.id,
      agentId: agent.id,
      action: task.action,
      priority: task.priority,
      attempt: task.attemptCount,
      maxAttempts: task.maxAttempts,
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
      for (const task of state.tasks) {
        if (task.priority === undefined) {
          task.priority = 3;
        }
        if (task.dependsOn === undefined) task.dependsOn = [];
        if (task.approvalRequired === undefined) task.approvalRequired = false;
        if (task.approvalStatus === undefined) task.approvalStatus = "not-required";
        if (task.maxAttempts === undefined) task.maxAttempts = 1;
        if (task.retryDelayMinutes === undefined) task.retryDelayMinutes = 5;
        if (task.attemptCount === undefined) task.attemptCount = 0;
        if (task.originCheckpoint === undefined) task.originCheckpoint = null;
      }
      seedMissingDefaultAgents(state, this.now);
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
    await replaceFile(temporaryPath, this.statePath());
  }

  statePath() {
    return path.join(this.directory, "automation.json");
  }
}

function startAutomationScheduler(service, {
  pollIntervalMs = 60_000,
  maxTasks = 5,
  logger = console,
  onCycle = () => {}
} = {}) {
  if (!Number.isInteger(pollIntervalMs) || pollIntervalMs < 1_000 ||
    pollIntervalMs > 3_600_000) {
    throw new RangeError("pollIntervalMs must be an integer from 1000 to 3600000");
  }

  const process = async () => {
    try {
      await service.processDueTasks(maxTasks);
      onCycle({ error: null });
    } catch (error) {
      logger.error("AXIOM automation scheduler failed:", error);
      onCycle({ error });
    }
  };
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
      registeredAt,
      originCheckpoint: "axi-durable-memory-foundation",
      creator: KEYSTONE_REGISTRATION.creatorAuthority,
      purpose: "Maintain factual, non-sensitive AXI continuity records.",
      duties: [
        "Prepare approved memory entries.",
        "Preserve concise operational continuity."
      ],
      attributionScope: AGENT_ATTRIBUTION_SCOPE,
      keystoneRegistration: createKeystoneRegistration(KEYSTONE_REGISTRATION.creatorAuthority),
      accountability: createAccountabilityRecord(registeredAt, "Genesis registration accepted.")
    },
    {
      id: "automation-executor",
      name: "Automation Executor",
      capabilities: ["automation.noop"],
      enabled: true,
      registeredAt,
      originCheckpoint: "axi-bounded-automation-foundation",
      creator: KEYSTONE_REGISTRATION.creatorAuthority,
      purpose: "Run safe workflow checks within the explicit action allowlist.",
      duties: [
        "Execute approved no-op checks.",
        "Record bounded task outcomes."
      ],
      attributionScope: AGENT_ATTRIBUTION_SCOPE,
      keystoneRegistration: createKeystoneRegistration(KEYSTONE_REGISTRATION.creatorAuthority),
      accountability: createAccountabilityRecord(registeredAt, "Genesis registration accepted.")
    },
    {
      id: "automation-auditor",
      name: "Automation Auditor",
      capabilities: ["memory.record", "automation.noop"],
      enabled: true,
      registeredAt,
      originCheckpoint: "axi-bounded-automation-foundation",
      creator: KEYSTONE_REGISTRATION.creatorAuthority,
      purpose: "Provide an auditable fallback for approved bounded tasks.",
      duties: [
        "Review task outcomes.",
        "Record approved audit continuity."
      ],
      attributionScope: AGENT_ATTRIBUTION_SCOPE,
      keystoneRegistration: createKeystoneRegistration(KEYSTONE_REGISTRATION.creatorAuthority),
      accountability: createAccountabilityRecord(registeredAt, "Genesis registration accepted.")
    },
    {
      id: "operations-observer",
      name: "Operations Observer",
      capabilities: [
        "monitoring.snapshot",
        "governance.readiness",
        "recovery.backup",
        "coordinate.record"
      ],
      enabled: true,
      registeredAt,
      originCheckpoint: "axi-operations-observer",
      creator: KEYSTONE_REGISTRATION.creatorAuthority,
      purpose: "Capture private operational monitoring evidence.",
      duties: [
        "Run approved monitoring snapshots.",
        "Surface operational attention signals.",
        "Assess private Genesis and governance readiness.",
        "Create approved recovery backups.",
        "Record approved coordinate transitions."
      ],
      attributionScope: AGENT_ATTRIBUTION_SCOPE,
      keystoneRegistration: createKeystoneRegistration(KEYSTONE_REGISTRATION.creatorAuthority),
      accountability: createAccountabilityRecord(registeredAt, "Genesis registration accepted.")
    }
  ];
}

function seedMissingDefaultAgents(state, now) {
  for (const defaultAgent of defaultAgents(now)) {
    const existingAgent = state.agents.find((agent) => agent.id === defaultAgent.id);
    if (!existingAgent) {
      state.agents.push(defaultAgent);
      continue;
    }
    for (const field of [
      "originCheckpoint",
      "creator",
      "purpose",
      "duties",
      "attributionScope",
      "keystoneRegistration",
      "capabilities"
    ]) {
      existingAgent[field] = defaultAgent[field];
    }
  }
  for (const agent of state.agents) {
    if (!isNonEmptyString(agent.originCheckpoint)) {
      agent.originCheckpoint = REGISTERED_AGENT_DEFAULT_ORIGIN;
    }
    if (!isNonEmptyString(agent.creator)) {
      agent.creator = KEYSTONE_REGISTRATION.creatorAuthority;
    }
    if (!isNonEmptyString(agent.attributionScope)) {
      agent.attributionScope = AGENT_ATTRIBUTION_SCOPE;
    }
    if (!isRecord(agent.accountability)) {
      agent.accountability = createAccountabilityRecord(
        agent.registeredAt || now().toISOString(),
        "Legacy registration reconciled to the AXI accountability record."
      );
    } else {
      normalizeAccountability(agent.accountability, agent.registeredAt || now().toISOString());
    }
    const registration = createKeystoneRegistration(agent.creator);
    if (!isRecord(agent.keystoneRegistration)) {
      agent.keystoneRegistration = registration;
      continue;
    }
    for (const [field, value] of Object.entries(registration)) {
      if (agent.keystoneRegistration[field] === undefined) {
        agent.keystoneRegistration[field] = value;
      }
    }
  }
}

function summarizeAutomationState(state) {
  return {
    agents: state.agents.length,
    pendingTasks: state.tasks.filter((task) => task.status === "pending").length,
    blockedTasks: state.tasks.filter((task) => task.status === "blocked").length,
    awaitingApprovalTasks: state.tasks.filter(
      (task) => task.status === "awaiting_approval"
    ).length,
    completedTasks: state.tasks.filter((task) => task.status === "completed").length,
    failedTasks: state.tasks.filter((task) => task.status === "failed").length,
    runs: state.runs.length
  };
}

function evaluateGovernanceReadiness(state) {
  const enabledAgents = state.agents.filter((agent) => agent.enabled);
  const unregisteredAgentIds = enabledAgents
    .filter((agent) => !isRegisteredAgent(agent))
    .map((agent) => agent.id);
  const suspendedAgentIds = enabledAgents
    .filter((agent) => isRegisteredAgent(agent) && !isAccountableAgent(agent))
    .map((agent) => agent.id);
  const unsupportedCapabilityAgentIds = enabledAgents
    .filter((agent) => !Array.isArray(agent.capabilities) ||
      agent.capabilities.some((capability) => !TASK_ACTIONS.has(capability)))
    .map((agent) => agent.id);
  const unsupportedTaskIds = state.tasks
    .filter((task) => !TASK_ACTIONS.has(task.action))
    .map((task) => task.id);
  const failedTaskIds = state.tasks
    .filter((task) => task.status === "failed")
    .map((task) => task.id);
  const blockedTaskIds = state.tasks
    .filter((task) => task.status === "blocked")
    .map((task) => task.id);
  const issues = [
    ...unregisteredAgentIds.map((agentId) => ({
      code: "unregistered-agent",
      agentId
    })),
    ...suspendedAgentIds.map((agentId) => ({
      code: "suspended-agent",
      agentId
    })),
    ...unsupportedCapabilityAgentIds.map((agentId) => ({
      code: "unsupported-agent-capability",
      agentId
    })),
    ...unsupportedTaskIds.map((taskId) => ({
      code: "unsupported-task-action",
      taskId
    })),
    ...failedTaskIds.map((taskId) => ({
      code: "failed-task",
      taskId
    })),
    ...blockedTaskIds.map((taskId) => ({
      code: "blocked-task",
      taskId
    }))
  ];

  return {
    status: issues.length === 0 ? "ready" : "attention",
    genesisCheckpoint: {
      id: AXI_GENESIS_OWNERSHIP_CHECKPOINT.id,
      sourceRecord: AXI_GENESIS_OWNERSHIP_CHECKPOINT.sourceRecord,
      creatorAuthority: AXI_GENESIS_OWNERSHIP_CHECKPOINT.creatorAuthority
    },
    enabledAgents: enabledAgents.length,
    activeAgents: enabledAgents.filter(isAccountableAgent).length,
    issues
  };
}

function selectAgent(agents, task) {
  if (task.agentId) {
    const assignedAgent = agents.find((agent) => agent.id === task.agentId);
    return isAccountableAgent(assignedAgent) && assignedAgent.enabled &&
      assignedAgent.capabilities.includes(task.action) ? assignedAgent : null;
  }
  return agents.find((agent) =>
    isAccountableAgent(agent) && agent.enabled && agent.capabilities.includes(task.action)
  ) || null;
}

function createKeystoneRegistration(creatorAuthority) {
  return {
    ...KEYSTONE_REGISTRATION,
    creatorAuthority,
    ownershipClaim: `${creatorAuthority} claims ownership and accountability for AXI agents created and registered within the AXES system.`,
    genesisCheckpoint: { ...AXI_GENESIS_OWNERSHIP_CHECKPOINT }
  };
}

function createAccountabilityRecord(occurredAt, reason) {
  return {
    status: "active",
    reviewedAt: occurredAt,
    reason,
    history: [{
      status: "active",
      occurredAt,
      reason
    }]
  };
}

function normalizeAccountability(accountability, fallbackOccurredAt) {
  if (!AGENT_ACCOUNTABILITY_STATUSES.has(accountability.status)) {
    accountability.status = "suspended";
  }
  if (!isNonEmptyString(accountability.reviewedAt)) {
    accountability.reviewedAt = fallbackOccurredAt;
  }
  if (!isNonEmptyString(accountability.reason)) {
    accountability.reason = "Accountability status reconciled after reset.";
  }
  if (!Array.isArray(accountability.history)) {
    accountability.history = [{
      status: accountability.status,
      occurredAt: accountability.reviewedAt,
      reason: accountability.reason
    }];
  }
}

function isRegisteredAgent(agent) {
  return isRecord(agent) &&
    isNonEmptyString(agent.originCheckpoint) &&
    isNonEmptyString(agent.creator) &&
    isRecord(agent.keystoneRegistration) &&
    agent.keystoneRegistration.sourceRecord ===
      AXI_GENESIS_OWNERSHIP_CHECKPOINT.sourceRecord &&
    agent.creator === AXI_GENESIS_OWNERSHIP_CHECKPOINT.creatorAuthority &&
    agent.keystoneRegistration.creatorAuthority ===
      AXI_GENESIS_OWNERSHIP_CHECKPOINT.creatorAuthority &&
    isNonEmptyString(agent.keystoneRegistration.ownershipClaim) &&
    isRecord(agent.keystoneRegistration.genesisCheckpoint) &&
    agent.keystoneRegistration.genesisCheckpoint.id ===
      AXI_GENESIS_OWNERSHIP_CHECKPOINT.id &&
    agent.keystoneRegistration.genesisCheckpoint.sourceRecord ===
      AXI_GENESIS_OWNERSHIP_CHECKPOINT.sourceRecord &&
    agent.keystoneRegistration.genesisCheckpoint.creatorAuthority ===
      AXI_GENESIS_OWNERSHIP_CHECKPOINT.creatorAuthority;
}

function isAccountableAgent(agent) {
  return isRegisteredAgent(agent) &&
    isRecord(agent.accountability) &&
    agent.accountability.status === "active";
}

function assertRegisteredAgent(agent) {
  if (!isRegisteredAgent(agent)) {
    throw new RangeError("agent is not registered with creator ownership and accountability");
  }
}

function assertActiveAccountability(agent) {
  assertRegisteredAgent(agent);
  if (!isAccountableAgent(agent)) {
    throw new RangeError("agent accountability is suspended");
  }
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function assertOptionalString(value, label) {
  if (value !== undefined && !isNonEmptyString(value)) {
    throw new TypeError(`${label} must be a non-empty string`);
  }
}

function assertOriginCheckpoint(value, label) {
  if (value === undefined) return;
  if (typeof value !== "string" || !/^[a-z][a-z0-9-]{2,119}$/.test(value)) {
    throw new TypeError(`${label} must be a lowercase kebab-case identifier`);
  }
}

function normalizeOptionalString(value) {
  return value === undefined ? null : value.trim();
}

function findAgent(agents, agentId) {
  const agent = agents.find((entry) => entry.id === agentId);
  if (!agent) throw new RangeError(`agent does not exist: ${agentId}`);
  return agent;
}

function compareTasks(left, right) {
  const priorityDifference = right.priority - left.priority;
  if (priorityDifference !== 0) {
    return priorityDifference;
  }
  return new Date(left.runAt).valueOf() - new Date(right.runAt).valueOf();
}

function dependenciesComplete(tasks, dependencyIds) {
  return dependencyIds.every((dependencyId) =>
    tasks.find((task) => task.id === dependencyId)?.status === "completed");
}

function unblockReadyTasks(tasks, now) {
  for (const task of tasks) {
    if (task.status === "blocked" && task.approvalStatus !== "rejected" &&
      dependenciesComplete(tasks, task.dependsOn)) {
      task.status = "pending";
      task.updatedAt = now().toISOString();
    }
  }
}

function findTask(tasks, taskId) {
  const task = tasks.find((entry) => entry.id === taskId);
  if (!task) throw new RangeError(`task does not exist: ${taskId}`);
  return task;
}

async function replaceFile(source, destination) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await fs.rename(source, destination);
      return;
    } catch (error) {
      const isTransientLock = error.code === "EPERM" || error.code === "EBUSY";
      if (!isTransientLock || attempt === 2) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, (attempt + 1) * 25));
    }
  }
}

module.exports = {
  AutomationService,
  AGENT_ATTRIBUTION_SCOPE,
  KEYSTONE_REGISTRATION,
  TASK_ACTIONS,
  TASK_STATUSES,
  evaluateGovernanceReadiness,
  summarizeAutomationState,
  startAutomationScheduler
};
