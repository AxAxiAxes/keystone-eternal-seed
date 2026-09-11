const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { MonitoringService } = require("../monitoring-service");

test("records changed monitoring state and attention transitions", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-monitoring-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const decisions = [];
  const service = new MonitoringService({
    directory,
    memoryStore: { record: async (entry) => decisions.push(entry) },
    now: () => new Date("2026-09-10T00:00:00.000Z")
  });
  const healthy = {
    memoryAvailable: true,
    scheduler: { enabled: true, lastError: null },
    automation: { pendingTasks: 0, failedTasks: 0 },
    usage: { totalTokens: 0 }
  };

  assert.equal((await service.record(healthy)).recorded, true);
  assert.equal((await service.record(healthy)).recorded, false);
  const attention = await service.record({
    ...healthy,
    automation: { pendingTasks: 0, failedTasks: 1 }
  });

  assert.deepEqual(attention.attention, ["failed-tasks"]);
  assert.equal(decisions.length, 1);
  assert.equal((await service.history()).length, 2);

  const governanceAttention = await service.record({
    ...healthy,
    governance: { status: "attention" }
  });
  assert.deepEqual(governanceAttention.attention, ["governance-readiness"]);
  assert.equal(decisions.length, 2);
  assert.equal((await service.history()).length, 3);

  const recoveryAttention = await service.record({
    ...healthy,
    recovery: { status: "empty" }
  });
  assert.deepEqual(recoveryAttention.attention, ["recovery-not-ready"]);
  assert.equal(decisions.length, 3);
  assert.equal((await service.history()).length, 4);

  const coordinateAttention = await service.record({
    ...healthy,
    coordinates: { status: "invalid" }
  });
  assert.deepEqual(coordinateAttention.attention, ["coordinate-chain-invalid"]);
  assert.equal(decisions.length, 4);
  assert.equal((await service.history()).length, 5);

  const startupContextAttention = await service.record({
    ...healthy,
    startupContext: { status: "attention" }
  });
  assert.deepEqual(startupContextAttention.attention, ["startup-context-unavailable"]);
  assert.equal(decisions.length, 5);
  assert.equal((await service.history()).length, 6);
});
