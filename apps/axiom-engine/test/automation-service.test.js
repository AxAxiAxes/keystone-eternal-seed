const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const {
  AutomationService
} = require("../automation-service");
const { MemoryStore } = require("../memory-store");

function createMemoryStore() {
  const entries = [];
  return {
    entries,
    async record(entry) {
      const stored = { id: `entry-${entries.length + 1}`, ...entry };
      entries.push(stored);
      return stored;
    }
  };
}

test("assigns an eligible agent, records memory, and writes an audit run", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-automation-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const memoryStore = createMemoryStore();
  const service = new AutomationService({ directory, memoryStore });

  const agents = await service.listAgents();
  assert.equal(agents.length, 5);
  assert.equal(agents[0].id, "memory-curator");
  assert.equal(agents[1].id, "project-memory-manager");
  assert.equal(agents[4].id, "operations-observer");
  assert.match(agents[0].createdAt, /^\d{4}-\d{2}-\d{2}T/);
  assert.equal(agents[0].createdAt, agents[0].registeredAt);
  assert.equal(agents[0].observation.attention.length, 0);

  const task = await service.createTask({
    title: "Record deployment decision",
    action: "memory.record",
    agentId: "memory-curator",
    originCheckpoint: "axi-production-deployment",
    payload: {
      kind: "decision",
      content: "Private production engine deployed."
    }
  });

  test("restricts approved business metric tasks to the Project Memory Manager", async (t) => {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-automation-"));
    t.after(() => fs.rm(directory, { recursive: true, force: true }));
    const recordedMetrics = [];
    const service = new AutomationService({
      directory,
      memoryStore: createMemoryStore(),
      recordBusinessMetric: async (entry) => {
        const recorded = { id: "metric-entry-1", sequence: 1, ...entry };
        recordedMetrics.push(recorded);
        return recorded;
      }
    });
    const payload = {
      period: "2026-09",
      kind: "revenue",
      category: "contracting-services",
      amountCents: 12500,
      sourceRecord: "approved-metric-2026-09-001"
    };

    const agents = await service.listAgents();
    assert.ok(agents.find((agent) => agent.id === "project-memory-manager")
      .capabilities.includes("business.metric"));
    await assert.rejects(
      () => service.createTask({
        title: "Metric without approval",
        action: "business.metric",
        agentId: "project-memory-manager",
        originCheckpoint: "axi-business-metrics-foundation",
        payload
      }),
      /business\.metric tasks require operator approval/
    );
    const nonManager = await service.registerAgent({
      name: "Business Metrics Test Agent",
      capabilities: ["business.metric"]
    });
    await assert.rejects(
      () => service.createTask({
        title: "Metric with wrong agent",
        action: "business.metric",
        agentId: nonManager.id,
        approvalRequired: true,
        originCheckpoint: "axi-business-metrics-foundation",
        payload
      }),
      /business\.metric tasks must be assigned to the Project Memory Manager/
    );

    const task = await service.createTask({
      title: "Approved business metric",
      action: "business.metric",
      agentId: "project-memory-manager",
      approvalRequired: true,
      originCheckpoint: "axi-business-metrics-foundation",
      payload
    });
    assert.equal(task.status, "awaiting_approval");
    await service.reviewTaskApproval(task.id, true);
    assert.equal((await service.processDueTasks())[0].status, "completed");
    assert.deepEqual(recordedMetrics, [{
      id: "metric-entry-1",
      sequence: 1,
      ...payload
    }]);
  });

  await t.test("records an approved continuity event through the Project Memory Manager", async (t) => {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-automation-"));
    t.after(() => fs.rm(directory, { recursive: true, force: true }));
    const continuityEntries = [];
    const service = new AutomationService({
      directory,
      memoryStore: createMemoryStore(),
      recordContinuity: async (entry) => {
        const recorded = { sequence: continuityEntries.length + 1, ...entry };
        continuityEntries.push(recorded);
        return recorded;
      }
    });

    await assert.rejects(
      () => service.createTask({
        title: "Record manager continuity without approval",
        action: "continuity.record",
        agentId: "project-memory-manager",
        originCheckpoint: "axi-project-memory-management",
        payload: {
          sourceRecord: "docs/memory/README.md",
          summary: "This task lacks required approval."
        }
      }),
      /continuity\.record tasks require operator approval/
    );
    const nonManager = await service.registerAgent({
      name: "Continuity Test Agent",
      capabilities: ["continuity.record"]
    });
    await assert.rejects(
      () => service.createTask({
        title: "Record continuity with the wrong agent",
        action: "continuity.record",
        agentId: nonManager.id,
        approvalRequired: true,
        originCheckpoint: "axi-project-memory-management",
        payload: {
          sourceRecord: "docs/memory/README.md",
          summary: "This task has the wrong manager."
        }
      }),
      /continuity\.record tasks must be assigned to the Project Memory Manager/
    );

    const task = await service.createTask({
      title: "Record approved project continuity",
      action: "continuity.record",
      agentId: "project-memory-manager",
      approvalRequired: true,
      originCheckpoint: "axi-project-memory-management",
      payload: {
        sourceRecord: "docs/memory/README.md",
        summary: "Operator confirmed the project continuity basis."
      }
    });
    assert.equal(task.status, "awaiting_approval");

    await service.reviewTaskApproval(task.id, true);
    const outcomes = await service.processDueTasks();
    assert.equal(outcomes[0].status, "completed");
    assert.deepEqual(continuityEntries, [{
      sequence: 1,
      sourceRecord: "docs/memory/README.md",
      summary: "Operator confirmed the project continuity basis."
    }]);
    assert.equal((await service.listRuns())[0].agentId, "project-memory-manager");
  });
  await t.test("catalogs approved source metadata through the Project Memory Manager", async (t) => {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-automation-"));
    t.after(() => fs.rm(directory, { recursive: true, force: true }));
    const catalogEntries = [];
    const service = new AutomationService({
      directory,
      memoryStore: createMemoryStore(),
      catalogSource: async (entry) => {
        const recorded = { id: "source-entry-1", sequence: catalogEntries.length + 1, ...entry };
        catalogEntries.push(recorded);
        return recorded;
      }
    });
    const payload = {
      sourceId: "axi-memory-service",
      title: "AXI persistent memory service",
      sourceType: "document",
      classification: "private",
      sourceReference: "docs/AXI_MEMORY_SERVICE.md",
      sha256: "a".repeat(64)
    };

    await assert.rejects(
      () => service.createTask({
        title: "Catalog source without approval",
        action: "source.catalog",
        agentId: "project-memory-manager",
        originCheckpoint: "axi-project-memory-management",
        payload
      }),
      /source\.catalog tasks require operator approval/
    );
    const nonManager = await service.registerAgent({
      name: "Source Catalog Test Agent",
      capabilities: ["source.catalog"]
    });
    await assert.rejects(
      () => service.createTask({
        title: "Catalog source with wrong agent",
        action: "source.catalog",
        agentId: nonManager.id,
        approvalRequired: true,
        originCheckpoint: "axi-project-memory-management",
        payload
      }),
      /source\.catalog tasks must be assigned to the Project Memory Manager/
    );

    const task = await service.createTask({
      title: "Catalog approved AXI memory source",
      action: "source.catalog",
      agentId: "project-memory-manager",
      approvalRequired: true,
      originCheckpoint: "axi-project-memory-management",
      payload
    });
    await service.reviewTaskApproval(task.id, true);
    assert.equal((await service.processDueTasks())[0].status, "completed");
    assert.deepEqual(catalogEntries, [{ id: "source-entry-1", sequence: 1, ...payload }]);
  });
  const outcomes = await service.processDueTasks();

  assert.deepEqual(outcomes, [{
    taskId: task.id,
    status: "completed",
    runId: outcomes[0].runId
  }]);
  assert.match(outcomes[0].runId, /^[0-9a-f-]{36}$/);

  const [completedTask] = await service.listTasks("completed");
  assert.equal(completedTask.id, task.id);
  assert.equal(completedTask.runCount, 1);
  assert.equal(memoryStore.entries.length, 2);
  assert.deepEqual(memoryStore.entries[0], {
    id: "entry-1",
    kind: "decision",
    content: "Private production engine deployed.",
    metadata: {
      source: "automation",
      taskId: task.id,
      agentId: "memory-curator"
    }
  });
  assert.equal(memoryStore.entries[1].kind, "decision");
  assert.equal(memoryStore.entries[1].metadata.taskId, task.id);

  const [run] = await service.listRuns();
  assert.equal(run.taskId, task.id);
  assert.equal(run.agentId, "memory-curator");
  assert.equal(run.status, "completed");

  const report = await service.getAgentReport("memory-curator");
  assert.equal(report.agent.originCheckpoint, "axi-durable-memory-foundation");
  assert.equal(report.agent.createdAt, report.agent.registeredAt);
  assert.equal(report.agent.creator, "Axel Urartu (AX) · Axes Contracting");
  assert.equal(report.agent.keystoneRegistration.sourceRecord, "KEYSTONE-ORIGIN-000001");
  assert.match(report.agent.keystoneRegistration.ownershipClaim, /claims ownership and accountability/);
  assert.equal(
    report.agent.keystoneRegistration.genesisCheckpoint.id,
    "axi-genesis-creator-ownership"
  );
  assert.match(report.agent.attributionScope, /creator ownership claim/);
  assert.deepEqual(
    report.timeline.map((event) => event.event).sort(),
    ["accountability-review", "origin", "task-created", "task-run"]
  );
  assert.equal(
    report.timeline.find((event) => event.event === "task-created").originCheckpoint,
    "axi-production-deployment"
  );
  assert.deepEqual(report.observation.compatibleCapabilities, ["memory.record"]);
  assert.equal(report.observation.assignedTaskCountsByState.completed, 1);
  assert.equal(report.observation.recentRun.status, "completed");
  assert.deepEqual(report.observation.attention, []);
});

test("registers each AXI agent with creator accountability and an origin", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-automation-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const service = new AutomationService({ directory, memoryStore: createMemoryStore() });

  const agent = await service.registerAgent({
    name: "Registered Test Agent",
    capabilities: ["automation.noop"]
  });

  assert.equal(agent.creator, "Axel Urartu (AX) · Axes Contracting");
  assert.equal(agent.originCheckpoint, "axi-agent-registration");
  assert.equal(agent.keystoneRegistration.sourceRecord, "KEYSTONE-ORIGIN-000001");
  assert.match(agent.keystoneRegistration.ownershipClaim, /claims ownership and accountability/);
  assert.equal(agent.keystoneRegistration.genesisCheckpoint.id, "axi-genesis-creator-ownership");

  await assert.rejects(
    () => service.registerAgent({
      name: "Unregistered Authority",
      capabilities: ["automation.noop"],
      creator: "Other authority"
    }),
    (error) => error instanceof RangeError &&
      error.message === "agent creator must match the AXI Genesis ownership authority"
  );
});

test("upgrades legacy agent registrations with the ownership claim", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-automation-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  await fs.writeFile(path.join(directory, "automation.json"), JSON.stringify({
    agents: [{
      id: "legacy-agent",
      name: "Legacy Agent",
      capabilities: ["automation.noop"],
      enabled: true,
      registeredAt: "2026-09-10T00:00:00.000Z",
      originCheckpoint: "axi-legacy-foundation",
      creator: "Axel Urartu (AX) · Axes Contracting",
      keystoneRegistration: {
        registry: "KEYSTONE origin and lineage registry",
        sourceRecord: "KEYSTONE-ORIGIN-000001",
        creatorAuthority: "Axel Urartu (AX) · Axes Contracting"
      }
    }],
    tasks: [],
    runs: []
  }), "utf8");
  const service = new AutomationService({ directory, memoryStore: createMemoryStore() });

  const report = await service.getAgentReport("legacy-agent");

  assert.match(report.agent.keystoneRegistration.ownershipClaim, /claims ownership and accountability/);
  assert.equal(report.agent.keystoneRegistration.sourceRecord, "KEYSTONE-ORIGIN-000001");
  assert.equal(report.agent.keystoneRegistration.genesisCheckpoint.id, "axi-genesis-creator-ownership");
  assert.equal(report.agent.createdAt, "2026-09-10T00:00:00.000Z");
});

test("retains legacy provenance evidence and observes invalid agent records without repairing them", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-automation-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  await fs.writeFile(path.join(directory, "automation.json"), JSON.stringify({
    agents: [{
      id: "invalid-legacy-agent",
      name: "Invalid Legacy Agent",
      capabilities: ["automation.noop", "unsupported.action"],
      enabled: true,
      createdAt: "not-an-iso-timestamp",
      registeredAt: "2026-09-10T00:00:00.000Z",
      creator: "Unreconciled creator",
      keystoneRegistration: {
        sourceRecord: "KEYSTONE-ORIGIN-000001",
        creatorAuthority: "Unreconciled creator",
        ownershipClaim: "Unreconciled claim"
      }
    }, {
      id: "missing-legacy-agent",
      name: "Missing Legacy Agent",
      capabilities: ["automation.noop"],
      enabled: true,
      registeredAt: "not-an-iso-timestamp",
      keystoneRegistration: {}
    }],
    tasks: [],
    runs: []
  }), "utf8");
  const service = new AutomationService({ directory, memoryStore: createMemoryStore() });

  const report = await service.getAgentReport("invalid-legacy-agent");
  assert.equal(report.agent.createdAt, "not-an-iso-timestamp");
  assert.equal(report.observation.createdAt, null);
  assert.equal(report.observation.registeredAt, "2026-09-10T00:00:00.000Z");
  assert.deepEqual(report.observation.compatibleCapabilities, ["automation.noop"]);
  assert.deepEqual(report.observation.attention.sort(), [
    "creation-timestamp-invalid",
    "creator-authority-invalid",
    "origin-checkpoint-missing",
    "ownership-claim-invalid",
    "unsupported-capability"
  ]);
  await assert.rejects(() => service.getAgent("invalid-legacy-agent"), /not registered/);
  const missingReport = await service.getAgentReport("missing-legacy-agent");
  assert.match(missingReport.agent.createdAt, /^\d{4}-\d{2}-\d{2}T/);
  assert.equal(missingReport.agent.registeredAt, "not-an-iso-timestamp");
  assert.deepEqual(missingReport.observation.attention.sort(), [
    "creator-authority-invalid",
    "origin-checkpoint-missing",
    "ownership-claim-invalid",
    "registration-timestamp-invalid"
  ]);
  const readiness = await service.getGovernanceReadiness();
  assert.equal(readiness.status, "attention");
  assert.equal(readiness.agentObservations.length, 7);
  assert.ok(readiness.agentObservations.some((observation) =>
    observation.agentId === "missing-legacy-agent"));
});

test("fails closed when a custom agent loses its canonical Genesis source", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-automation-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const service = new AutomationService({ directory, memoryStore: createMemoryStore() });
  const agent = await service.registerAgent({
    id: "source-integrity-test",
    name: "Source Integrity Test",
    capabilities: ["automation.noop"]
  });
  const statePath = path.join(directory, "automation.json");
  const state = JSON.parse(await fs.readFile(statePath, "utf8"));
  state.agents.find((entry) => entry.id === agent.id).keystoneRegistration.sourceRecord =
    "KEYSTONE-ORIGIN-UNRECONCILED";
  await fs.writeFile(statePath, JSON.stringify(state), "utf8");

  await assert.rejects(
    () => service.getAgent(agent.id),
    (error) => error instanceof RangeError &&
      error.message === "agent is not registered with creator ownership and accountability"
  );
  const readiness = await service.getGovernanceReadiness();
  assert.equal(readiness.status, "attention");
  assert.deepEqual(readiness.issues, [{
    code: "unregistered-agent",
    agentId: agent.id
  }]);
});

test("reconciles default agents to the Genesis authority after a reset", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-automation-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  await fs.writeFile(path.join(directory, "automation.json"), JSON.stringify({
    agents: [{
      id: "operations-observer",
      name: "Operations Observer",
      capabilities: ["monitoring.snapshot"],
      enabled: true,
      registeredAt: "2026-09-10T00:00:00.000Z",
      creator: "AXES project founder direction",
      keystoneRegistration: {
        sourceRecord: "KEYSTONE-ORIGIN-000001",
        creatorAuthority: "AXES project founder direction"
      }
    }],
    tasks: [],
    runs: []
  }), "utf8");
  const service = new AutomationService({ directory, memoryStore: createMemoryStore() });

  const report = await service.getAgentReport("operations-observer");

  assert.equal(report.agent.creator, "Axel Urartu (AX) · Axes Contracting");
  assert.equal(
    report.agent.keystoneRegistration.genesisCheckpoint.id,
    "axi-genesis-creator-ownership"
  );
  assert.match(report.agent.keystoneRegistration.ownershipClaim, /claims ownership and accountability/);
});

test("suspends unreviewed agents and records accountability review history", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-automation-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const service = new AutomationService({
    directory,
    memoryStore: createMemoryStore(),
    now: () => new Date("2026-09-10T20:00:00.000Z")
  });
  const task = await service.createTask({
    title: "Hold task pending accountability review",
    action: "automation.noop",
    agentId: "automation-executor",
    originCheckpoint: "axi-accountability-review"
  });

  const suspended = await service.reviewAgentAccountability("automation-executor", {
    status: "suspended",
    reason: "Hold pending operator review."
  });
  assert.equal(suspended.accountability.status, "suspended");
  assert.equal(suspended.accountability.history.length, 2);

  await assert.rejects(
    () => service.createTask({
      title: "Attempt suspended assignment",
      action: "automation.noop",
      agentId: "automation-executor",
      originCheckpoint: "axi-accountability-review"
    }),
    (error) => error instanceof RangeError &&
      error.message === "agent accountability is suspended"
  );
  assert.deepEqual(await service.processDueTasks(), [{
    taskId: task.id,
    status: "blocked"
  }]);
  assert.equal((await service.listTasks("blocked"))[0].lastError,
    "Assigned agent accountability is suspended.");

  const report = await service.getAgentReport("automation-executor");
  assert.equal(report.agent.accountability.status, "suspended");
  assert.deepEqual(
    report.timeline.filter((event) => event.event === "accountability-review")
      .map((event) => event.status),
    ["active", "suspended"]
  );
});

test("keeps recurring tasks pending for their next execution", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-automation-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const memoryStore = createMemoryStore();
  let currentTime = new Date("2026-09-09T18:00:00.000Z");
  const service = new AutomationService({
    directory,
    memoryStore,
    now: () => currentTime
  });

  const task = await service.createTask({
    title: "Recurring health audit",
    action: "automation.noop",
    recurrenceMinutes: 15
  });
  await service.processDueTasks();

  const [pendingTask] = await service.listTasks("pending");
  assert.equal(pendingTask.id, task.id);
  assert.equal(pendingTask.runCount, 1);
  assert.equal(pendingTask.runAt, "2026-09-09T18:15:00.000Z");
  assert.equal((await service.listRuns()).length, 1);
});

test("processes due tasks by priority and then scheduled time", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-automation-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const currentTime = new Date("2026-09-09T18:00:00.000Z");
  const service = new AutomationService({
    directory,
    memoryStore: createMemoryStore(),
    now: () => currentTime
  });

  const lowPriority = await service.createTask({
    title: "Low priority task",
    action: "automation.noop",
    priority: 1
  });
  const highPriority = await service.createTask({
    title: "High priority task",
    action: "automation.noop",
    priority: 5
  });

  const [outcome] = await service.processDueTasks(1);
  assert.equal(outcome.taskId, highPriority.id);
  assert.equal((await service.listTasks("completed"))[0].id, highPriority.id);
  assert.equal((await service.listTasks("pending"))[0].id, lowPriority.id);
});

test("unblocks approved tasks after their dependencies complete", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-automation-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const service = new AutomationService({
    directory,
    memoryStore: createMemoryStore(),
    now: () => new Date("2026-09-09T18:00:00.000Z")
  });
  const prerequisite = await service.createTask({
    title: "Complete prerequisite",
    action: "automation.noop"
  });
  const dependent = await service.createTask({
    title: "Complete approved dependent task",
    action: "automation.noop",
    dependsOn: [prerequisite.id],
    approvalRequired: true
  });

  assert.equal(dependent.status, "awaiting_approval");
  const approved = await service.reviewTaskApproval(dependent.id, true);
  assert.equal(approved.status, "blocked");
  await service.processDueTasks();
  assert.equal((await service.listTasks("blocked"))[0].id, dependent.id);
  await service.processDueTasks();
  assert.equal((await service.listTasks("completed"))[0].id, prerequisite.id);
  assert.equal((await service.listTasks("completed"))[1].id, dependent.id);
});

test("retries a failed task only up to its configured attempt limit", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-automation-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  let currentTime = new Date("2026-09-09T18:00:00.000Z");
  const service = new AutomationService({
    directory,
    memoryStore: new MemoryStore(directory),
    now: () => currentTime
  });
  const task = await service.createTask({
    title: "Invalid memory record",
    action: "memory.record",
    payload: { kind: "invalid", content: "Will fail" },
    maxAttempts: 2,
    retryDelayMinutes: 1
  });

  const [firstOutcome] = await service.processDueTasks();
  assert.equal(firstOutcome.status, "pending");
  assert.equal((await service.listTasks("pending"))[0].attemptCount, 1);
  currentTime = new Date("2026-09-09T18:01:00.000Z");
  const [secondOutcome] = await service.processDueTasks();
  assert.equal(secondOutcome.status, "failed");
  assert.equal((await service.listTasks("failed"))[0].id, task.id);
  assert.deepEqual((await service.listRuns()).map((run) => run.status), ["failed", "retrying"]);
});

test("rejects task actions outside the allowlist", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-automation-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const service = new AutomationService({
    directory,
    memoryStore: createMemoryStore()
  });

  await assert.rejects(
    () => service.createTask({
      title: "Run a shell command",
      action: "shell.execute"
    }),
    (error) => error instanceof RangeError &&
      error.message === "unsupported task action: shell.execute"
  );

  await assert.rejects(
    () => service.createTask({
      title: "Assign unsupported work",
      action: "memory.record",
      agentId: "operations-observer"
    }),
    (error) => error instanceof RangeError &&
      error.message === "agent does not support task action: operations-observer"
  );
});

test("reports Genesis and governance readiness without making an ownership determination", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-automation-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const service = new AutomationService({
    directory,
    memoryStore: createMemoryStore()
  });

  const initialReadiness = await service.getGovernanceReadiness();
  assert.equal(initialReadiness.status, "ready");
  assert.deepEqual(initialReadiness.genesisCheckpoint, {
    id: "axi-genesis-creator-ownership",
    sourceRecord: "KEYSTONE-ORIGIN-000001",
    creatorAuthority: "Axel Urartu (AX) · Axes Contracting"
  });
  assert.equal(initialReadiness.enabledAgents, 5);
  assert.equal(initialReadiness.activeAgents, 5);
  assert.deepEqual(initialReadiness.issues, []);
  assert.equal(initialReadiness.agentObservations.length, 5);
  assert.deepEqual(initialReadiness.agentObservations[0].attention, []);

  const task = await service.createTask({
    title: "Assess private Genesis readiness",
    action: "governance.readiness",
    agentId: "operations-observer",
    originCheckpoint: "axi-governance-readiness"
  });
  const [outcome] = await service.processDueTasks();
  assert.equal(outcome.taskId, task.id);
  assert.equal(outcome.status, "completed");
  const readinessRun = (await service.listRuns())[0].result;
  assert.equal(readinessRun.status, "ready");
  assert.equal(readinessRun.agentObservations.length, 5);
  assert.equal(
    readinessRun.agentObservations.find((observation) =>
      observation.agentId === "operations-observer").assignedTaskCountsByState.running,
    1
  );

  await service.reviewAgentAccountability("operations-observer", {
    status: "suspended",
    reason: "Hold for readiness review."
  });
  const readiness = await service.getGovernanceReadiness();
  assert.equal(readiness.status, "attention");
  assert.deepEqual(readiness.issues, [{
    code: "suspended-agent",
    agentId: "operations-observer"
  }]);
});

test("creates and verifies a recovery backup through the Operations Observer", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-automation-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const service = new AutomationService({
    directory,
    memoryStore: createMemoryStore(),
    createRecoveryBackup: async () => ({ id: "bc0c59f8-d711-4b96-9fa0-71b14c98f60d" }),
    verifyRecoveryBackup: async (backupId) => ({
      id: backupId,
      integrity: "verified"
    })
  });
  const task = await service.createTask({
    title: "Create a private recovery backup",
    action: "recovery.backup",
    agentId: "operations-observer",
    originCheckpoint: "axi-reset-recovery"
  });

  const [outcome] = await service.processDueTasks();
  assert.equal(outcome.status, "completed");
  assert.deepEqual((await service.listRuns())[0].result, {
    backup: { id: "bc0c59f8-d711-4b96-9fa0-71b14c98f60d" },
    verification: {
      id: "bc0c59f8-d711-4b96-9fa0-71b14c98f60d",
      integrity: "verified"
    }
  });
  assert.equal(task.agentId, "operations-observer");
});

test("records a coordinate transition through the Operations Observer", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-automation-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const service = new AutomationService({
    directory,
    memoryStore: createMemoryStore(),
    createCoordinate: async (coordinate) => ({
      id: "coordinate-1",
      ...coordinate
    })
  });
  await service.createTask({
    title: "Record Genesis continuity",
    action: "coordinate.record",
    agentId: "operations-observer",
    originCheckpoint: "axi-coordinate-foundation"
  });

  await service.processDueTasks();
  assert.deepEqual((await service.listRuns())[0].result, {
    coordinate: {
      id: "coordinate-1",
      label: "Record Genesis continuity",
      originCheckpoint: "axi-coordinate-foundation"
    }
  });
});

test("creates a private continuity checkpoint through the Operations Observer", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-automation-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const service = new AutomationService({
    directory,
    memoryStore: createMemoryStore(),
    createCheckpoint: async () => ({
      id: "f3f0dfc6-67e4-48f1-a892-9279952bd2c2",
      files: [{ path: "automation.json", sha256: "a".repeat(64) }]
    })
  });
  await service.createTask({
    title: "Preserve AXI continuity",
    action: "continuity.checkpoint",
    agentId: "operations-observer",
    originCheckpoint: "axi-continuity-checkpoint"
  });

  await service.processDueTasks();
  assert.deepEqual((await service.listRuns())[0].result, {
    checkpoint: {
      id: "f3f0dfc6-67e4-48f1-a892-9279952bd2c2",
      files: [{ path: "automation.json", sha256: "a".repeat(64) }]
    }
  });
});

test("records a monitoring snapshot through the dedicated observer", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-automation-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const memoryStore = createMemoryStore();
  let receivedState;
  const service = new AutomationService({
    directory,
    memoryStore,
    captureMonitoringSnapshot: async (state) => {
      receivedState = structuredClone(state);
      return {
        id: "monitoring-snapshot-1",
        recorded: true,
        attention: []
      };
    }
  });

  const task = await service.createTask({
    title: "Capture a private monitoring snapshot",
    action: "monitoring.snapshot",
    recurrenceMinutes: 15
  });
  const [outcome] = await service.processDueTasks();

  assert.equal(outcome.taskId, task.id);
  assert.equal(outcome.status, "pending");
  assert.equal(receivedState.tasks[0].status, "running");
  const [run] = await service.listRuns();
  assert.deepEqual(run.result, {
    monitoringSnapshotId: "monitoring-snapshot-1",
    recorded: true,
    attention: []
  });
  assert.equal(run.agentId, "operations-observer");
});

test("does not retry a completed protected operation when its memory audit fails", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-automation-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  let catalogWrites = 0;
  const service = new AutomationService({
    directory,
    memoryStore: {
      async record() {
        throw new Error("private memory audit is unavailable");
      }
    },
    catalogSource: async (entry) => {
      catalogWrites += 1;
      return {
        id: "source-entry-1",
        sequence: catalogWrites,
        sourceId: entry.sourceId
      };
    }
  });
  const task = await service.createTask({
    title: "Catalog a reviewed source",
    action: "source.catalog",
    agentId: "project-memory-manager",
    approvalRequired: true,
    originCheckpoint: "axi-source-catalog",
    payload: {
      sourceId: "reviewed-source",
      title: "Reviewed source",
      sourceType: "document",
      classification: "internal",
      sourceReference: "docs/AXI_SOURCE_CATALOG.md",
      sha256: "a".repeat(64)
    }
  });
  await service.reviewTaskApproval(task.id, true);

  const [outcome] = await service.processDueTasks();

  assert.equal(outcome.status, "completed");
  assert.match(outcome.auditError, /private memory audit is unavailable/);
  assert.equal(catalogWrites, 1);
  assert.equal((await service.listTasks())[0].status, "completed");
  assert.match((await service.listRuns())[0].auditError, /private memory audit is unavailable/);
  assert.equal((await service.processDueTasks()).length, 0);
  assert.equal(catalogWrites, 1);
});
