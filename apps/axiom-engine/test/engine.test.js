const assert = require("node:assert/strict");
const http = require("node:http");
const test = require("node:test");
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
