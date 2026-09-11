const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { AutomationService } = require("../automation-service");
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
  assert.equal(agents.length, 4);
  assert.equal(agents[0].id, "memory-curator");
  assert.equal(agents[3].id, "operations-observer");

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
  assert.equal(report.agent.creator, "Axel Urartu (AX) · Axes Contracting");
  assert.equal(report.agent.keystoneRegistration.sourceRecord, "KEYSTONE-ORIGIN-000001");
  assert.match(report.agent.attributionScope, /not independently verified legal ownership/);
  assert.deepEqual(
    report.timeline.map((event) => event.event).sort(),
    ["origin", "task-created", "task-run"]
  );
  assert.equal(
    report.timeline.find((event) => event.event === "task-created").originCheckpoint,
    "axi-production-deployment"
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
