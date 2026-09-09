const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { AutomationService } = require("../automation-service");

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
  assert.equal(agents.length, 3);
  assert.equal(agents[0].id, "memory-curator");

  const task = await service.createTask({
    title: "Record deployment decision",
    action: "memory.record",
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
});
