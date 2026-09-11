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
  server.closeAllConnections();
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())));
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

  test("reports seeded automation status", async (t) => {
    t.after(() => fs.rm(memoryDirectory, { recursive: true, force: true }));
    const server = await startServer();
    t.after(() => stopServer(server));
    const { port } = server.address();

    const response = await fetch(`http://127.0.0.1:${port}/automation/status`);

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      agents: 4,
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

  test("reports empty OpenAI usage before any provider requests", async (t) => {
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
  assert.equal(readiness.governance.activeAgents, 4);
  assert.equal(readiness.recovery.status, "not-configured");
  assert.equal(readiness.coordinates.status, "ready");
  assert.equal(readiness.automation.lastRunAt, null);
  assert.equal(readiness.automation.lastError, null);
  assert.ok(readiness.checkedAt);
  assert.equal(JSON.stringify(readiness).includes("OPENAI_API_KEY"), false);
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
  assert.equal(monitoringSnapshot.snapshot.automation.agents, 4);
  assert.equal(monitoringSnapshot.snapshot.governance.status, "ready");
  assert.equal(monitoringSnapshot.snapshot.recovery.status, "not-configured");
  assert.ok(monitoringSnapshot.attention.includes("recovery-not-ready"));
  assert.equal(monitoringSnapshot.snapshot.coordinates.status, "ready");

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

  const monitoringHistory = await fetch(`http://127.0.0.1:${port}/monitoring/history`);
  assert.equal(monitoringHistory.status, 200);
  assert.deepEqual(await monitoringHistory.json(), [{
    id: monitoringSnapshot.id,
    recordedAt: monitoringSnapshot.recordedAt,
    snapshot: monitoringSnapshot.snapshot,
    attention: monitoringSnapshot.attention
  }]);
});
