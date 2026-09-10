const assert = require("node:assert/strict");
const http = require("node:http");
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

function adminAuthorization() {
  return `Basic ${Buffer.from("admin:test-admin-password").toString("base64")}`;
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

    const portal = await fetch(`http://127.0.0.1:${webPort}/`);
    assert.equal(portal.status, 200);
    assert.match(await portal.text(), /AXES CONTRACTING/);

    const axesPortal = await request(webPort, { Host: "axescontracting.com" });
    assert.equal(axesPortal.statusCode, 200);
    assert.match(axesPortal.body, /The AXES Control Center/);

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

    const authorization = adminAuthorization();
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
    assert.equal(support.email.status, "planned");

    const automationStatus = await fetch(
      `http://127.0.0.1:${webPort}/api/automation/status`,
      { headers: { Authorization: authorization } }
    );
    assert.equal(automationStatus.status, 200);
    assert.equal((await automationStatus.json()).agents, 3);

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
      error: "AXIOM engine request failed"
    });
  } finally {
    if (webServer) {
      await stopServer(webServer);
    }
    await stopServer(engineServer);
    delete process.env.AXIOM_ENGINE_URL;
    delete process.env.ADMIN_PASSWORD;
  }
});

test("keeps unreachable private-engine details out of public AXIOM responses", async () => {
  const unavailableServer = await startServer(http.createServer());
  const { port: unavailablePort } = unavailableServer.address();
  await stopServer(unavailableServer);

  let webServer;
  try {
    process.env.AXIOM_ENGINE_URL = `http://127.0.0.1:${unavailablePort}`;
    process.env.ADMIN_PASSWORD = "test-admin-password";
    delete require.cache[require.resolve("../server")];
    const web = require("../server");
    webServer = await startServer(web);
    const { port: webPort } = webServer.address();

    const publicResponse = await fetch(`http://127.0.0.1:${webPort}/api/axiom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "analyze" })
    });
    assert.equal(publicResponse.status, 502);
    assert.deepEqual(await publicResponse.json(), {
      error: "AXIOM engine is unavailable"
    });

    const supportResponse = await fetch(`http://127.0.0.1:${webPort}/api/support/status`, {
      headers: { Authorization: adminAuthorization() }
    });
    assert.equal(supportResponse.status, 200);
    const support = await supportResponse.json();
    assert.deepEqual(support.engine, {
      status: "unavailable",
      diagnostic: { category: "unreachable-private-engine" }
    });
    assert.equal(support.lastEngineFailure.category, "unreachable-private-engine");
    assert.doesNotMatch(JSON.stringify(support), /127\.0\.0\.1|ECONNREFUSED|fetch failed/i);
  } finally {
    if (webServer) {
      await stopServer(webServer);
    }
    delete process.env.AXIOM_ENGINE_URL;
    delete process.env.ADMIN_PASSWORD;
  }
});

test("reports private-engine non-success responses only to authenticated support", async () => {
  const upstream = http.createServer((req, res) => {
    res.writeHead(503, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      error: "private upstream response body must not be relayed",
      endpoint: "http://private-engine.example.internal"
    }));
  });
  const upstreamServer = await startServer(upstream);
  const { port: upstreamPort } = upstreamServer.address();

  let webServer;
  try {
    process.env.AXIOM_ENGINE_URL = `http://127.0.0.1:${upstreamPort}`;
    process.env.ADMIN_PASSWORD = "test-admin-password";
    delete require.cache[require.resolve("../server")];
    const web = require("../server");
    webServer = await startServer(web);
    const { port: webPort } = webServer.address();

    const publicResponse = await fetch(`http://127.0.0.1:${webPort}/api/axiom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "analyze" })
    });
    assert.equal(publicResponse.status, 502);
    assert.deepEqual(await publicResponse.json(), {
      error: "AXIOM engine is unavailable"
    });

    const supportResponse = await fetch(`http://127.0.0.1:${webPort}/api/support/status`, {
      headers: { Authorization: adminAuthorization() }
    });
    assert.equal(supportResponse.status, 200);
    const support = await supportResponse.json();
    assert.deepEqual(support.engine, {
      status: "unavailable",
      diagnostic: { category: "engine-non-success-response" }
    });
    assert.equal(support.lastEngineFailure.category, "engine-non-success-response");
    assert.doesNotMatch(
      JSON.stringify(support),
      /private upstream response body|private-engine\.example\.internal/i
    );
  } finally {
    if (webServer) {
      await stopServer(webServer);
    }
    await stopServer(upstreamServer);
    delete process.env.AXIOM_ENGINE_URL;
    delete process.env.ADMIN_PASSWORD;
  }
});
