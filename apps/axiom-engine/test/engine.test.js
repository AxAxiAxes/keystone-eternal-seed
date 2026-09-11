const assert = require("node:assert/strict");
const http = require("node:http");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const memoryDirectory = path.join(os.tmpdir(), `axiom-engine-test-${process.pid}`);
process.env.AXIOM_MEMORY_DIRECTORY = memoryDirectory;
const app = require("../index");

async function startServer() {
  const server = http.createServer(app);
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  return server;
}

async function stopServer(server) {
  const closed = new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())));
  server.closeIdleConnections();
  server.closeAllConnections();
  await closed;
}

test("processes an AXIOM command", async (t) => {
  const server = await startServer();
  t.after(() => stopServer(server));
  const { port } = server.address();

  const response = await fetch(`http://127.0.0.1:${port}/axiom`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "analyze",
      payload: { requestId: "engine-test" }
    })
  });

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    engine: "AXIOM",
    actionReceived: "analyze",
    payloadReceived: { requestId: "engine-test" },
    status: "processed"
  });
});

test("reports engine health", async (t) => {
  const server = await startServer();
  t.after(() => stopServer(server));
  const { port } = server.address();

  const response = await fetch(`http://127.0.0.1:${port}/health`);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    status: "ok",
    service: "AXIOM engine"
  });

  await t.test("reports seeded automation status", async (t) => {
    t.after(() => fs.rm(memoryDirectory, { recursive: true, force: true }));
    const server = await startServer();
    t.after(() => stopServer(server));
    const { port } = server.address();

    const response = await fetch(`http://127.0.0.1:${port}/automation/status`);

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      agents: 5,
      pendingTasks: 0,
      blockedTasks: 0,
      awaitingApprovalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      runs: 0
    });

    const agentReport = await fetch(
      `http://127.0.0.1:${port}/automation/agents/operations-observer/report`
    );
    assert.equal(agentReport.status, 200);
    const report = await agentReport.json();
    assert.equal(report.agent.creator, "Axel Urartu (AX) · Axes Contracting");
    assert.equal(report.agent.keystoneRegistration.sourceRecord, "KEYSTONE-ORIGIN-000001");
    assert.match(report.agent.keystoneRegistration.ownershipClaim, /claims ownership and accountability/);
    assert.equal(
      report.agent.keystoneRegistration.genesisCheckpoint.id,
      "axi-genesis-creator-ownership"
    );
    assert.equal(report.agent.originCheckpoint, "axi-operations-observer");
    assert.deepEqual(report.timeline.map((event) => event.event), [
      "origin",
      "accountability-review"
    ]);
  });

  await t.test("reports empty OpenAI usage before any provider requests", async (t) => {
    t.after(() => fs.rm(memoryDirectory, { recursive: true, force: true }));
    const server = await startServer();
    t.after(() => stopServer(server));
    const { port } = server.address();

    const response = await fetch(`http://127.0.0.1:${port}/usage`);

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      requests: 0,
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0
    });
  });
});

test("reports secret-safe runtime readiness", async (t) => {
  const server = await startServer();
  t.after(() => stopServer(server));
  const { port } = server.address();

  const response = await fetch(`http://127.0.0.1:${port}/system/readiness`);

  assert.equal(response.status, 200);
  const readiness = await response.json();
  assert.equal(readiness.status, "ready");
  assert.equal(readiness.storage.status, "ok");
  assert.equal(readiness.provider.status, "not-configured");
  assert.equal(readiness.provider.model, "gpt-4.1-mini");
  assert.equal(readiness.automation.status, "disabled");
  assert.equal(readiness.monitoring.status, "disabled");
  assert.equal(readiness.governance.status, "ready");
  assert.equal(readiness.governance.activeAgents, 5);
  assert.equal(readiness.recovery.status, "not-configured");
  assert.equal(readiness.coordinates.status, "ready");
  assert.equal(readiness.startupContext.status, "ready");
  assert.equal(readiness.continuityRecord.status, "ready");
  assert.ok(readiness.continuityRecord.recordCount >= 2);
  assert.equal(readiness.startupContext.id, "axes-memory-bank-startup-v1");
  assert.equal(readiness.automation.lastRunAt, null);
  assert.equal(readiness.automation.lastError, null);
  assert.ok(readiness.checkedAt);
  assert.equal(JSON.stringify(readiness).includes("OPENAI_API_KEY"), false);
});

test("reports the private startup context without exposing private source material", async (t) => {
  const server = await startServer();
  t.after(() => stopServer(server));
  const { port } = server.address();

  const response = await fetch(`http://127.0.0.1:${port}/system/startup-context`);

  assert.equal(response.status, 200);
  const startupContext = await response.json();
  assert.equal(startupContext.status, "ready");
  assert.equal(startupContext.id, "axes-memory-bank-startup-v1");
  assert.ok(startupContext.sourceRecords.includes("docs/memory/README.md"));
  assert.equal(JSON.stringify(startupContext).includes("OPENAI_API_KEY"), false);
});

test("persists and exposes the private continuity record", async (t) => {
  const server = await startServer();
  t.after(() => stopServer(server));
  const { port } = server.address();

  const statusResponse = await fetch(
    `http://127.0.0.1:${port}/system/continuity-record`
  );
  assert.equal(statusResponse.status, 200);
  assert.equal((await statusResponse.json()).status, "ready");

  const createdResponse = await fetch(
    `http://127.0.0.1:${port}/system/continuity-record/events`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceRecord: "engine-test",
        summary: "Operator confirmed the engine test continuity record."
      })
    }
  );
  assert.equal(createdResponse.status, 201);
  assert.equal((await createdResponse.json()).eventType, "operator-confirmed");

  const taskResponse = await fetch(`http://127.0.0.1:${port}/automation/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Record managed continuity event",
      action: "continuity.record",
      agentId: "project-memory-manager",
      approvalRequired: true,
      originCheckpoint: "axi-project-memory-management",
      payload: {
        sourceRecord: "engine-test",
        summary: "Operator approved a managed continuity event."
      }
    })
  });
  assert.equal(taskResponse.status, 201);
  const task = await taskResponse.json();
  assert.equal(task.status, "awaiting_approval");

  const approvalResponse = await fetch(
    `http://127.0.0.1:${port}/automation/tasks/${task.id}/approval`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved: true })
    }
  );
  assert.equal(approvalResponse.status, 200);

  const processResponse = await fetch(
    `http://127.0.0.1:${port}/automation/process`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }
  );
  assert.equal(processResponse.status, 200);
  assert.equal((await processResponse.json())[0].status, "completed");

  const entriesResponse = await fetch(
    `http://127.0.0.1:${port}/system/continuity-record/events`
  );
  assert.equal(entriesResponse.status, 200);
  assert.equal((await entriesResponse.json())[0].eventType, "operator-confirmed");
});

test("blocks automation when retained startup context is invalid", async (t) => {
  t.after(() => fs.rm(memoryDirectory, { recursive: true, force: true }));
  await fs.mkdir(memoryDirectory, { recursive: true });
  await fs.writeFile(path.join(memoryDirectory, "startup-context.json"), "{invalid");
  const server = await startServer();
  t.after(() => stopServer(server));
  const { port } = server.address();

  const response = await fetch(`http://127.0.0.1:${port}/automation/process`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}"
  });

  assert.equal(response.status, 409);
  assert.match(
    (await response.json()).error,
    /startup context is ready \(startup-context-invalid\)/
  );
});

test("reports an unavailable chat provider when no key is configured", async (t) => {
  const server = await startServer();
  t.after(() => stopServer(server));
  const { port } = server.address();

  const response = await fetch(`http://127.0.0.1:${port}/axiom`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "chat", payload: { message: "Hello AXIOM" } })
  });

  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), {
    error: "OPENAI_API_KEY is not configured"
  });
});
test("persists and retrieves AXI memory layers", async (t) => {
  t.after(() => fs.rm(memoryDirectory, { recursive: true, force: true }));
  const server = await startServer();
  t.after(() => stopServer(server));
  const { port } = server.address();

  const identity = await fetch(`http://127.0.0.1:${port}/memory/identity`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "AXIOM",
      summary: "AXIOM command service identity"
    })
  });
  assert.equal(identity.status, 201);

  const created = await fetch(`http://127.0.0.1:${port}/memory/episodic`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: "Verified the persistent memory service.",
      metadata: { source: "engine-test" }
    })
  });
  assert.equal(created.status, 201);
  const entry = await created.json();
  assert.equal(entry.kind, "episodic");
  assert.ok(entry.id);

  const entries = await fetch(`http://127.0.0.1:${port}/memory/episodic`);
  assert.equal(entries.status, 200);
  assert.deepEqual(await entries.json(), [entry]);

  const currentIdentity = await fetch(
    `http://127.0.0.1:${port}/memory/identity`
  );
  assert.equal(currentIdentity.status, 200);
  const identityRecord = await currentIdentity.json();
  assert.equal(identityRecord.name, "AXIOM");
  assert.equal(identityRecord.summary, "AXIOM command service identity");
  assert.ok(identityRecord.updatedAt);

  const checkpointResponse = await fetch(
    `http://127.0.0.1:${port}/system/checkpoints`,
    { method: "POST" }
  );
  assert.equal(checkpointResponse.status, 201);
  const checkpoint = await checkpointResponse.json();
  assert.equal(checkpoint.schemaVersion, 1);
  assert.ok(checkpoint.files.some((file) => file.path === "identity.json"));
  assert.ok(checkpoint.files.some((file) => file.path === "episodic.jsonl"));

  const checkpoints = await fetch(`http://127.0.0.1:${port}/system/checkpoints`);
  assert.equal(checkpoints.status, 200);
  assert.deepEqual(await checkpoints.json(), [checkpoint]);

  const monitoring = await fetch(`http://127.0.0.1:${port}/monitoring/snapshots`, {
    method: "POST"
  });
  assert.equal(monitoring.status, 201);
  const monitoringSnapshot = await monitoring.json();
  assert.equal(monitoringSnapshot.snapshot.memoryAvailable, true);
  assert.equal(monitoringSnapshot.snapshot.automation.agents, 5);
  assert.equal(monitoringSnapshot.snapshot.governance.status, "ready");
  assert.equal(monitoringSnapshot.snapshot.recovery.status, "not-configured");
  assert.ok(monitoringSnapshot.attention.includes("recovery-not-ready"));
  assert.equal(monitoringSnapshot.snapshot.coordinates.status, "ready");
  assert.equal(monitoringSnapshot.snapshot.beadPassports.status, "ready");

  const governance = await fetch(`http://127.0.0.1:${port}/automation/readiness`);
  assert.equal(governance.status, 200);
  assert.equal((await governance.json()).status, "ready");

  const createdCoordinate = await fetch(`http://127.0.0.1:${port}/system/coordinates`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      label: "Record engine coordinate test",
      originCheckpoint: "axi-coordinate-foundation"
    })
  });
  assert.equal(createdCoordinate.status, 201);
  const coordinate = await createdCoordinate.json();
  assert.equal(coordinate.sequence, 1);

  const coordinateVerification = await fetch(
    `http://127.0.0.1:${port}/system/coordinates/verify`
  );
  assert.equal(coordinateVerification.status, 200);
  assert.equal((await coordinateVerification.json()).coordinateCount, 2);

  const continuityTaskResponse = await fetch(`http://127.0.0.1:${port}/automation/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Create an AXI continuity checkpoint",
      action: "continuity.checkpoint",
      agentId: "operations-observer",
      originCheckpoint: "axi-continuity-checkpoint"
    })
  });
  assert.equal(continuityTaskResponse.status, 201);
  const continuityTask = await continuityTaskResponse.json();
  const continuityProcessResponse = await fetch(
    `http://127.0.0.1:${port}/automation/process`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }
  );
  assert.equal(continuityProcessResponse.status, 200);
  assert.equal((await continuityProcessResponse.json())[0].taskId, continuityTask.id);
  const continuityCheckpoints = await fetch(`http://127.0.0.1:${port}/system/checkpoints`);
  assert.equal(continuityCheckpoints.status, 200);
  assert.equal((await continuityCheckpoints.json()).length, 2);

  const gravityCenterResponse = await fetch(
    `http://127.0.0.1:${port}/system/gravity-center`
  );
  assert.equal(gravityCenterResponse.status, 200);
  assert.equal((await gravityCenterResponse.json()).id, "axi-genesis-gravity-center");

  const createdPassport = await fetch(`http://127.0.0.1:${port}/system/bead-passports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      agentId: "operations-observer",
      harmonicBand: "H4",
      spatialVector: { x: 14.22, y: -3.88, z: 7.01 },
      originCheckpoint: "axi-bead-passport-pilot"
    })
  });
  assert.equal(createdPassport.status, 201);
  assert.equal((await createdPassport.json()).passportId, "BPN-0001");

  const passportVerification = await fetch(
    `http://127.0.0.1:${port}/system/bead-passports/verify`
  );
  assert.equal(passportVerification.status, 200);
  assert.equal((await passportVerification.json()).passportCount, 1);

  const monitoringHistory = await fetch(`http://127.0.0.1:${port}/monitoring/history`);
  assert.equal(monitoringHistory.status, 200);
  assert.deepEqual(await monitoringHistory.json(), [{
    id: monitoringSnapshot.id,
    recordedAt: monitoringSnapshot.recordedAt,
    snapshot: monitoringSnapshot.snapshot,
    attention: monitoringSnapshot.attention
  }]);
});
