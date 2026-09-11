const assert = require("node:assert/strict");
const http = require("node:http");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const memoryDirectory = path.join(
  os.tmpdir(),
  `axiom-freedom-proxy-test-${process.pid}`
);
const originalMemoryDirectory = process.env.AXIOM_MEMORY_DIRECTORY;
process.env.AXIOM_MEMORY_DIRECTORY = memoryDirectory;
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

function request(port, headers, path = "/") {
  return new Promise((resolve, reject) => {
    const request = http.get(
      { hostname: "127.0.0.1", port, path, headers },
      (response) => {
        let body = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          body += chunk;
        });
        response.on("end", () => resolve({ body, statusCode: response.statusCode }));
      }
    );
    request.once("error", reject);
  });
}

test("forwards valid commands to the AXIOM engine", async (t) => {
  t.after(() => fs.rm(memoryDirectory, { recursive: true, force: true }));
  const engineServer = await startServer(engine);
  const { port: enginePort } = engineServer.address();

  let webServer;
  try {
    process.env.AXIOM_ENGINE_URL = `http://127.0.0.1:${enginePort}`;
    process.env.ADMIN_PASSWORD = "test-admin-password";
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

    const unavailablePublicChat = await fetch(
      `http://127.0.0.1:${webPort}/api/axiom`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          payload: { message: "Hello AXIOM" }
        })
      }
    );
    assert.equal(unavailablePublicChat.status, 503);
    assert.deepEqual(await unavailablePublicChat.json(), {
      error: "AXIOM chat is not configured"
    });

    const portal = await fetch(`http://127.0.0.1:${webPort}/`);
    assert.equal(portal.status, 200);
    assert.match(await portal.text(), /AXES CONTRACTING/);

    const axesPortal = await request(webPort, { Host: "axescontracting.com" });
    assert.equal(axesPortal.statusCode, 200);
    assert.match(axesPortal.body, /The AXES Control Center/);

    const axesWwwPortal = await request(webPort, { Host: "www.axescontracting.com" });
    assert.equal(axesWwwPortal.statusCode, 200);
    assert.match(axesWwwPortal.body, /The AXES Control Center/);

    const library = await fetch(
      `http://127.0.0.1:${webPort}/library/memory/README.md`
    );
    assert.equal(library.status, 200);
    assert.match(await library.text(), /AXI project memory/);

    const materials = await fetch(`http://127.0.0.1:${webPort}/materials`);
    assert.equal(materials.status, 200);
    assert.match(await materials.text(), /Materials Discovery/);

    const unauthorizedConsole = await fetch(`http://127.0.0.1:${webPort}/automation`);
    assert.equal(unauthorizedConsole.status, 401);

    const authorization = `Basic ${Buffer.from("admin:test-admin-password").toString("base64")}`;
    const consolePage = await fetch(`http://127.0.0.1:${webPort}/automation`, {
      headers: { Authorization: authorization }
    });
    assert.equal(consolePage.status, 200);
    assert.match(await consolePage.text(), /AXIOM Automation Console/);

    const unauthorizedSupport = await fetch(`http://127.0.0.1:${webPort}/support`);
    assert.equal(unauthorizedSupport.status, 401);

    const supportPage = await fetch(`http://127.0.0.1:${webPort}/support`, {
      headers: { Authorization: authorization }
    });
    assert.equal(supportPage.status, 200);
    assert.match(await supportPage.text(), /AXES Contracting Support Desk/);

    const supportStatus = await request(
      webPort,
      { Authorization: authorization },
      "/api/support/status"
    );
    assert.equal(supportStatus.statusCode, 200);
    const support = JSON.parse(supportStatus.body);
    assert.equal(support.portal.status, "ok");
    assert.equal(support.engine.status, "ok");
    assert.equal(support.readiness.status, "ready");
    assert.equal(support.readiness.storage.status, "ok");
    assert.equal(support.readiness.provider.status, "not-configured");
    assert.equal(support.email.status, "planned");

    const automationStatus = await fetch(
      `http://127.0.0.1:${webPort}/api/automation/status`,
      { headers: { Authorization: authorization } }
    );
    assert.equal(automationStatus.status, 200);
    assert.equal((await automationStatus.json()).agents, 4);

    const governanceReadiness = await fetch(
      `http://127.0.0.1:${webPort}/api/automation/readiness`,
      { headers: { Authorization: authorization } }
    );
    assert.equal(governanceReadiness.status, 200);
    assert.equal((await governanceReadiness.json()).status, "ready");

    const gravityCenter = await fetch(
      `http://127.0.0.1:${webPort}/api/automation/gravity-center`,
      { headers: { Authorization: authorization } }
    );
    assert.equal(gravityCenter.status, 200);
    assert.equal((await gravityCenter.json()).id, "axi-genesis-gravity-center");

    const createdPassport = await fetch(
      `http://127.0.0.1:${webPort}/api/automation/bead-passports`,
      {
        method: "POST",
        headers: { Authorization: authorization, "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: "operations-observer",
          harmonicBand: "H4",
          spatialVector: { x: 14.22, y: -3.88, z: 7.01 },
          originCheckpoint: "axi-bead-passport-pilot"
        })
      }
    );
    assert.equal(createdPassport.status, 201);
    assert.equal((await createdPassport.json()).passportId, "BPN-0001");

    const observerReport = await fetch(
      `http://127.0.0.1:${webPort}/api/automation/agents/operations-observer/report`,
      { headers: { Authorization: authorization } }
    );
    assert.equal(observerReport.status, 200);
    assert.equal((await observerReport.json()).agent.name, "Operations Observer");

    const suspendedObserver = await fetch(
      `http://127.0.0.1:${webPort}/api/automation/agents/operations-observer/accountability`,
      {
        method: "POST",
        headers: { Authorization: authorization, "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "suspended",
          reason: "Hold pending operator review."
        })
      }
    );
    assert.equal(suspendedObserver.status, 200);
    assert.equal((await suspendedObserver.json()).accountability.status, "suspended");

    const restoredObserver = await fetch(
      `http://127.0.0.1:${webPort}/api/automation/agents/operations-observer/accountability`,
      {
        method: "POST",
        headers: { Authorization: authorization, "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "active",
          reason: "Operator review completed."
        })
      }
    );
    assert.equal(restoredObserver.status, 200);
    assert.equal((await restoredObserver.json()).accountability.status, "active");

    const monitoringStatus = await fetch(
      `http://127.0.0.1:${webPort}/api/automation/monitoring/status`,
      { headers: { Authorization: authorization } }
    );
    assert.equal(monitoringStatus.status, 200);
    assert.deepEqual(await monitoringStatus.json(), {
      status: "not-yet-sampled",
      attention: []
    });

    const runHistory = await fetch(
      `http://127.0.0.1:${webPort}/api/automation/runs`,
      { headers: { Authorization: authorization } }
    );
    assert.equal(runHistory.status, 200);
    assert.deepEqual(await runHistory.json(), []);

    const unavailableAgentChat = await fetch(
      `http://127.0.0.1:${webPort}/api/automation/chat`,
      {
        method: "POST",
        headers: {
          Authorization: authorization,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          agentId: "memory-curator",
          message: "Review the automation console."
        })
      }
    );
    assert.equal(unavailableAgentChat.status, 503);
    assert.deepEqual(await unavailableAgentChat.json(), {
      error: "OPENAI_API_KEY is not configured"
    });
  } finally {
    if (webServer) {
      await stopServer(webServer);
    }
    await stopServer(engineServer);
    delete process.env.AXIOM_ENGINE_URL;
    delete process.env.ADMIN_PASSWORD;
    if (originalMemoryDirectory === undefined) {
      delete process.env.AXIOM_MEMORY_DIRECTORY;
    } else {
      process.env.AXIOM_MEMORY_DIRECTORY = originalMemoryDirectory;
    }
  }
});
