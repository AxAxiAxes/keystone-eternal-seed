const assert = require("node:assert/strict");
const test = require("node:test");
const engine = require("../../axiom-engine");

async function startServer(server) {
  let listeningServer;
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    listeningServer = server.listen(0, "127.0.0.1", resolve);
  });
  return listeningServer;
}

async function stopServer(server) {
  server.closeAllConnections();
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())));
}

test("forwards valid commands to the AXIOM engine", async (t) => {
  const engineServer = await startServer(engine);
  const { port: enginePort } = engineServer.address();

  let webServer;
  try {
    process.env.AXIOM_ENGINE_URL = `http://127.0.0.1:${enginePort}`;
    delete require.cache[require.resolve("../server")];
    const web = require("../server");
    webServer = await startServer(web);
    const { port: webPort } = webServer.address();

    const success = await fetch(`http://127.0.0.1:${webPort}/api/axiom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "analyze",
        payload: { requestId: "proxy-test" }
      })
    });

    assert.equal(success.status, 200);
    assert.deepEqual(await success.json(), {
      engine: "AXIOM",
      actionReceived: "analyze",
      payloadReceived: { requestId: "proxy-test" },
      status: "processed"
    });

    const invalid = await fetch(`http://127.0.0.1:${webPort}/api/axiom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: " " })
    });

    assert.equal(invalid.status, 400);
    assert.deepEqual(await invalid.json(), {
      error: "action must be a non-empty string"
    });

    const portal = await fetch(`http://127.0.0.1:${webPort}/`);
    assert.equal(portal.status, 200);
    assert.match(await portal.text(), /AXES CONTRACTING/);

    const library = await fetch(
      `http://127.0.0.1:${webPort}/library/memory/README.md`
    );
    assert.equal(library.status, 200);
    assert.match(await library.text(), /AXI project memory/);
  } finally {
    if (webServer) {
      await stopServer(webServer);
    }
    await stopServer(engineServer);
    delete process.env.AXIOM_ENGINE_URL;
  }
});
