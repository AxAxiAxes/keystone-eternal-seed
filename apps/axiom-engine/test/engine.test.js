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
});
