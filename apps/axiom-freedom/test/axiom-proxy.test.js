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

    const originContinuity = await fetch(`http://127.0.0.1:${webPort}/origin-continuity`);
    assert.equal(originContinuity.status, 200);
    const originContinuityPage = await originContinuity.text();
    assert.match(originContinuityPage, /Origin and Continuity/);
    assert.match(originContinuityPage, /Eteriti/);

    const originContinuityWithTrailingSlash = await fetch(
      `http://127.0.0.1:${webPort}/origin-continuity/`
    );
    assert.equal(originContinuityWithTrailingSlash.status, 200);

    const axiomChatPage = await fetch(`http://127.0.0.1:${webPort}/axiom`);
    assert.equal(axiomChatPage.status, 200);

    const axiomChatPageWithTrailingSlash = await fetch(
      `http://127.0.0.1:${webPort}/axiom/`
    );
    assert.equal(axiomChatPageWithTrailingSlash.status, 200);

    for (const embedPath of ["/embed", "/embed/", "/axes/"]) {
      const embed = await fetch(`http://127.0.0.1:${webPort}${embedPath}`);
      assert.equal(embed.status, 200);
      assert.match(await embed.text(), /not yet available/);
    }

    const unauthorizedAxesPortal = await request(webPort, { Host: "axescontracting.com" });
    assert.equal(unauthorizedAxesPortal.statusCode, 401);

    const unauthorizedAxesWwwPortal = await request(webPort, {
      Host: "www.axescontracting.com"
    });
    assert.equal(unauthorizedAxesWwwPortal.statusCode, 401);

    const authorization = `Basic ${Buffer.from("admin:test-admin-password").toString("base64")}`;

    const axesPortal = await request(webPort, {
      Host: "axescontracting.com",
      Authorization: authorization
    });
    assert.equal(axesPortal.statusCode, 200);
    assert.match(axesPortal.body, /AXES Command Center/);

    const axesWwwPortal = await request(webPort, {
      Host: "www.axescontracting.com",
      Authorization: authorization
    });
    assert.equal(axesWwwPortal.statusCode, 200);
    assert.match(axesWwwPortal.body, /AXES Command Center/);

    const library = await fetch(
      `http://127.0.0.1:${webPort}/library/AXES_BUSINESS_PLAN.md`
    );
    assert.equal(library.status, 200);
    assert.match(await library.text(), /AXES business plan/);

    const privateSourceDocument = await fetch(
      `http://127.0.0.1:${webPort}/library/keystone/PATENT_APPLICATION_64_078_819.md`
    );
    assert.equal(privateSourceDocument.status, 404);

    const privateArchive = await fetch(
      `http://127.0.0.1:${webPort}/private-archive/copilot-library/source.png`
    );
    assert.equal(privateArchive.status, 404);

    const libraryTraversal = await fetch(
      `http://127.0.0.1:${webPort}/library/%2e%2e%2fprivate-archive/source.png`
    );
    assert.equal(libraryTraversal.status, 404);

    const materials = await fetch(`http://127.0.0.1:${webPort}/materials`);
    assert.equal(materials.status, 200);
    assert.match(await materials.text(), /Materials Discovery/);

    const materialsWithTrailingSlash = await fetch(
      `http://127.0.0.1:${webPort}/materials/`
    );
    assert.equal(materialsWithTrailingSlash.status, 200);

    const unauthorizedConsole = await fetch(`http://127.0.0.1:${webPort}/automation`);
    assert.equal(unauthorizedConsole.status, 401);

    const malformedConsole = await fetch(`http://127.0.0.1:${webPort}/automation`, {
      headers: { Authorization: "******" }
    });
    assert.equal(malformedConsole.status, 401);

    const wrongPasswordConsole = await fetch(`http://127.0.0.1:${webPort}/automation`, {
      headers: {
        Authorization: `Basic ${Buffer.from("admin:wrong-password").toString("base64")}`
      }
    });
    assert.equal(wrongPasswordConsole.status, 401);

    const consolePage = await fetch(`http://127.0.0.1:${webPort}/automation`, {
      headers: { Authorization: authorization }
    });
    assert.equal(consolePage.status, 200);
    const consoleMarkup = await consolePage.text();
    assert.match(consoleMarkup, /AXIOM Automation Console/);
    assert.match(consoleMarkup, /Continuity Tree/);
    assert.match(consoleMarkup, /Continuous Project Memory/);
    assert.match(consoleMarkup, /Private Source Catalog/);
    assert.match(consoleMarkup, /Submitted Business Metrics/);
    assert.match(consoleMarkup, /Private AXES Service Registry/);
    assert.match(consoleMarkup, /founder-approved internal planning and operating metadata only/i);
    assert.match(consoleMarkup, /Founder-controlled private operational process/);
    assert.match(consoleMarkup, /Do not enter account, invoice, customer\/vendor, payment, tax, financial-account, credential, or personal data/);

    const consolePageWithTrailingSlash = await fetch(
      `http://127.0.0.1:${webPort}/automation/`,
      { headers: { Authorization: authorization } }
    );
    assert.equal(consolePageWithTrailingSlash.status, 200);

    const unauthorizedCommandCenter = await fetch(
      `http://127.0.0.1:${webPort}/command-center`
    );
    assert.equal(unauthorizedCommandCenter.status, 401);

    const commandCenter = await fetch(`http://127.0.0.1:${webPort}/command-center`, {
      headers: { Authorization: authorization }
    });
    assert.equal(commandCenter.status, 200);
    const commandCenterMarkup = await commandCenter.text();
    assert.match(commandCenterMarkup, /AXES Command Center/);
    assert.match(commandCenterMarkup, /Live continuity clock and checkpoints/);
    assert.match(commandCenterMarkup, /api\/command-center\/checkpoints/);

    const commandCenterWithTrailingSlash = await fetch(
      `http://127.0.0.1:${webPort}/command-center/`,
      { headers: { Authorization: authorization } }
    );
    assert.equal(commandCenterWithTrailingSlash.status, 200);

    const unauthorizedCheckpoints = await fetch(
      `http://127.0.0.1:${webPort}/api/command-center/checkpoints`
    );
    assert.equal(unauthorizedCheckpoints.status, 401);

    const checkpointResponse = await fetch(
      `http://127.0.0.1:${webPort}/api/command-center/checkpoints`,
      { headers: { Authorization: authorization } }
    );
    assert.equal(checkpointResponse.status, 200);
    const checkpointPayload = await checkpointResponse.json();
    assert.match(checkpointPayload.currentPhase, /Tier 1 internal readiness controls and business-operations foundation complete/);
    assert.ok(checkpointPayload.checkpoints.some(checkpoint =>
      checkpoint.title.includes("Define the AXES Directory")
    ));

    const unauthorizedSupport = await fetch(`http://127.0.0.1:${webPort}/support`);
    assert.equal(unauthorizedSupport.status, 401);

    const unauthorizedSupportWithTrailingSlash = await fetch(
      `http://127.0.0.1:${webPort}/support/`
    );
    assert.equal(unauthorizedSupportWithTrailingSlash.status, 401);

    const supportPage = await fetch(`http://127.0.0.1:${webPort}/support`, {
      headers: { Authorization: authorization }
    });
    assert.equal(supportPage.status, 200);
    assert.match(await supportPage.text(), /AXES Contracting Support Desk/);

    const supportPageWithTrailingSlash = await fetch(
      `http://127.0.0.1:${webPort}/support/`,
      { headers: { Authorization: authorization } }
    );
    assert.equal(supportPageWithTrailingSlash.status, 200);
    assert.match(await supportPageWithTrailingSlash.text(), /AXES Contracting Support Desk/);

    const unauthorizedAdmin = await fetch(`http://127.0.0.1:${webPort}/admin`, {
      redirect: "manual"
    });
    assert.equal(unauthorizedAdmin.status, 401);

    const legacyAdminRedirect = await fetch(`http://127.0.0.1:${webPort}/admin`, {
      headers: { Authorization: authorization },
      redirect: "manual"
    });
    assert.equal(legacyAdminRedirect.status, 302);
    assert.equal(legacyAdminRedirect.headers.get("location"), "/support");

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
    assert.equal(support.readiness.storage.status, "ready");
    assert.equal(support.readiness.provider.status, "not-configured");
    assert.equal(support.continuityRecord.status, "ready");
    assert.equal(support.sourceCatalog.status, "ready");
    assert.equal(support.businessMetrics.status, "ready");
    assert.equal(support.serviceRegistry.status, "ready");
    assert.equal(support.automationProfiles.status, "ok");
    assert.equal(support.automationProfiles.templates[0].id, "operations-observation");
    assert.equal(support.email.status, "planned");

    const automationStatus = await fetch(
      `http://127.0.0.1:${webPort}/api/automation/status`,
      { headers: { Authorization: authorization } }
    );
    assert.equal(automationStatus.status, 200);
    assert.equal((await automationStatus.json()).agents, 5);

    const unauthorizedProfiles = await fetch(
      `http://127.0.0.1:${webPort}/api/automation/profiles`
    );
    assert.equal(unauthorizedProfiles.status, 401);

    const profiles = await fetch(
      `http://127.0.0.1:${webPort}/api/automation/profiles`,
      { headers: { Authorization: authorization } }
    );
    assert.equal(profiles.status, 200);
    const profileStatus = await profiles.json();
    assert.equal(profileStatus.templates.length, 3);
    assert.equal(profileStatus.templates[0].id, "operations-observation");
    assert.equal(profileStatus.templates[1].id, "continuity-protection");

    const profilePreview = await fetch(
      `http://127.0.0.1:${webPort}/api/automation/profiles/preview`,
      {
        method: "POST",
        headers: { Authorization: authorization, "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: "portal-observation",
          template: "operations-observation",
          monitoringRecurrenceMinutes: 5,
          governanceRecurrenceMinutes: 60
        })
      }
    );
    assert.equal(profilePreview.status, 200);
    const preview = await profilePreview.json();
    assert.equal(preview.activation.status, "ready");
    assert.equal(preview.taskPlan.length, 2);
    assert.equal("payload" in preview.taskPlan[0], false);

    const profileDraft = await fetch(
      `http://127.0.0.1:${webPort}/api/automation/profiles`,
      {
        method: "POST",
        headers: { Authorization: authorization, "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: "portal-observation",
          template: "operations-observation",
          monitoringRecurrenceMinutes: 5,
          governanceRecurrenceMinutes: 60
        })
      }
    );
    assert.equal(profileDraft.status, 201);
    assert.equal((await profileDraft.json()).status, "draft");

    const profileActivation = await fetch(
      `http://127.0.0.1:${webPort}/api/automation/profiles/portal-observation/activate`,
      {
        method: "POST",
        headers: { Authorization: authorization, "Content-Type": "application/json" },
        body: JSON.stringify({ confirmed: true })
      }
    );
    assert.equal(profileActivation.status, 200);
    const activeProfile = await profileActivation.json();
    assert.equal(activeProfile.status, "active");
    assert.equal(Object.keys(activeProfile.taskIds).length, 2);

    const profilePause = await fetch(
      `http://127.0.0.1:${webPort}/api/automation/profiles/portal-observation/pause`,
      {
        method: "POST",
        headers: { Authorization: authorization, "Content-Type": "application/json" },
        body: JSON.stringify({ confirmed: true })
      }
    );
    assert.equal(profilePause.status, 200);
    assert.equal((await profilePause.json()).status, "paused");

    const profileResume = await fetch(
      `http://127.0.0.1:${webPort}/api/automation/profiles/portal-observation/resume`,
      {
        method: "POST",
        headers: { Authorization: authorization, "Content-Type": "application/json" },
        body: JSON.stringify({ confirmed: true })
      }
    );
    assert.equal(profileResume.status, 200);
    assert.deepEqual((await profileResume.json()).taskIds, activeProfile.taskIds);

    const profileHistory = await fetch(
      `http://127.0.0.1:${webPort}/api/automation/profiles/history?limit=5`,
      { headers: { Authorization: authorization } }
    );
    assert.equal(profileHistory.status, 200);
    const profileHistoryEntries = await profileHistory.json();
    assert.equal(profileHistoryEntries[0].event, "resumed");
    assert.equal(profileHistoryEntries[0].taskCount, 2);
    assert.equal("taskTemplates" in profileHistoryEntries[0], false);

    const profileHealth = await fetch(
      `http://127.0.0.1:${webPort}/api/automation/profiles/health`,
      { headers: { Authorization: authorization } }
    );
    assert.equal(profileHealth.status, 200);
    const profileHealthProjection = await profileHealth.json();
    assert.equal(profileHealthProjection.profiles[0].profileId, "portal-observation");
    assert.equal(profileHealthProjection.profiles[0].tasks.length, 2);
    assert.equal("payload" in profileHealthProjection.profiles[0].tasks[0], false);

    const storage = await fetch(
      `http://127.0.0.1:${webPort}/api/automation/storage`,
      { headers: { Authorization: authorization } }
    );
    assert.equal(storage.status, 200);
    assert.ok(Number.isSafeInteger((await storage.json()).usedBytes));

    const unauthorizedContinuityRecord = await fetch(
      `http://127.0.0.1:${webPort}/api/automation/continuity-record`
    );
    assert.equal(unauthorizedContinuityRecord.status, 401);

    const continuityRecord = await fetch(
      `http://127.0.0.1:${webPort}/api/automation/continuity-record`,
      { headers: { Authorization: authorization } }
    );
    assert.equal(continuityRecord.status, 200);
    assert.equal((await continuityRecord.json()).status, "ready");

    const continuityEvents = await fetch(
      `http://127.0.0.1:${webPort}/api/automation/continuity-record/events?limit=5`,
      { headers: { Authorization: authorization } }
    );
    assert.equal(continuityEvents.status, 200);
    assert.ok((await continuityEvents.json()).length >= 2);

    const unauthorizedSourceCatalog = await fetch(
      `http://127.0.0.1:${webPort}/api/automation/source-catalog`
    );
    assert.equal(unauthorizedSourceCatalog.status, 401);

    const sourceCatalog = await fetch(
      `http://127.0.0.1:${webPort}/api/automation/source-catalog`,
      { headers: { Authorization: authorization } }
    );
    assert.equal(sourceCatalog.status, 200);
    assert.equal((await sourceCatalog.json()).status, "ready");

    const sourceCatalogEntries = await fetch(
      `http://127.0.0.1:${webPort}/api/automation/source-catalog/entries?limit=5`,
      { headers: { Authorization: authorization } }
    );
    assert.equal(sourceCatalogEntries.status, 200);
    assert.deepEqual(await sourceCatalogEntries.json(), []);

    const unauthorizedBusinessMetrics = await fetch(
      `http://127.0.0.1:${webPort}/api/automation/business-metrics`
    );
    assert.equal(unauthorizedBusinessMetrics.status, 401);

    const businessMetrics = await fetch(
      `http://127.0.0.1:${webPort}/api/automation/business-metrics`,
      { headers: { Authorization: authorization } }
    );
    assert.equal(businessMetrics.status, 200);
    assert.equal((await businessMetrics.json()).status, "ready");

    const businessMetricsEntries = await fetch(
      `http://127.0.0.1:${webPort}/api/automation/business-metrics/entries?limit=5`,
      { headers: { Authorization: authorization } }
    );
    assert.equal(businessMetricsEntries.status, 200);
    assert.deepEqual((await businessMetricsEntries.json()).entries, []);

    const businessMetricsSummary = await fetch(
      `http://127.0.0.1:${webPort}/api/automation/business-metrics/summary`,
      { headers: { Authorization: authorization } }
    );
    assert.equal(businessMetricsSummary.status, 200);
    assert.equal((await businessMetricsSummary.json()).totalRecordedRevenueCents, 0);

    const unauthorizedServiceRegistry = await fetch(
      `http://127.0.0.1:${webPort}/api/automation/service-registry`
    );
    assert.equal(unauthorizedServiceRegistry.status, 401);

    const serviceRegistry = await fetch(
      `http://127.0.0.1:${webPort}/api/automation/service-registry`,
      { headers: { Authorization: authorization } }
    );
    assert.equal(serviceRegistry.status, 200);
    const serviceRegistryStatus = await serviceRegistry.json();
    assert.equal(serviceRegistryStatus.status, "ready");
    assert.match(serviceRegistryStatus.label, /not public availability/);

    const serviceRegistryProjection = await fetch(
      `http://127.0.0.1:${webPort}/api/automation/service-registry/projection`,
      { headers: { Authorization: authorization } }
    );
    assert.equal(serviceRegistryProjection.status, 200);
    assert.deepEqual((await serviceRegistryProjection.json()).services, {});

    const serviceRegistryEntries = await fetch(
      `http://127.0.0.1:${webPort}/api/automation/service-registry/entries?limit=5`,
      { headers: { Authorization: authorization } }
    );
    assert.equal(serviceRegistryEntries.status, 200);
    assert.deepEqual((await serviceRegistryEntries.json()).entries, []);

    const invalidContinuityTask = await fetch(
      `http://127.0.0.1:${webPort}/api/automation/tasks`,
      {
        method: "POST",
        headers: { Authorization: authorization, "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Invalid continuity task",
          action: "continuity.record",
          agentId: "project-memory-manager",
          approvalRequired: false,
          originCheckpoint: "axi-project-memory-management",
          payload: {
            sourceRecord: "portal-test",
            summary: "This task intentionally omits required approval."
          }
        })
      }
    );
    assert.equal(invalidContinuityTask.status, 400);
    assert.match(
      (await invalidContinuityTask.json()).error,
      /continuity\.record tasks require operator approval/
    );

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
    const observerReportPayload = await observerReport.json();
    assert.equal(observerReportPayload.agent.name, "Operations Observer");
    assert.equal(observerReportPayload.observation.agentId, "operations-observer");
    assert.equal(observerReportPayload.observation.attention.length, 0);

    const unprotectedObserverReport = await fetch(
      `http://127.0.0.1:${webPort}/api/automation/agents/operations-observer/report`
    );
    assert.equal(unprotectedObserverReport.status, 401);

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

test("Command Center checkpoint parsing captures an indented multi-line Current phase field", async () => {
  delete require.cache[require.resolve("../server")];
  const web = require("../server");
  const tempTimelineFile = path.join(
    os.tmpdir(),
    `axiom-timeline-multiline-${process.pid}-${Date.now()}.md`
  );
  await fs.writeFile(
    tempTimelineFile,
    [
      "# Test timeline",
      "",
      "**Current phase:** First line of a wrapped phase description",
      "  continues here on an indented second line",
      "",
      "## Current checkpoints",
      "",
      "- [x] Example checkpoint",
      "",
      "## Later section",
      ""
    ].join("\n")
  );
  try {
    const result = web.getCommandCenterCheckpoints(tempTimelineFile);
    assert.equal(
      result.currentPhase,
      "First line of a wrapped phase description continues here on an indented second line"
    );
    assert.equal(result.checkpoints.length, 1);
    assert.equal(result.checkpoints[0].title, "Example checkpoint");
  } finally {
    await fs.rm(tempTimelineFile, { force: true });
  }
});

test("Command Center checkpoint parsing leaves an unindented second line out of Current phase", async () => {
  delete require.cache[require.resolve("../server")];
  const web = require("../server");
  const tempTimelineFile = path.join(
    os.tmpdir(),
    `axiom-timeline-singleline-${process.pid}-${Date.now()}.md`
  );
  await fs.writeFile(
    tempTimelineFile,
    [
      "# Test timeline",
      "",
      "**Current phase:** Only the first line is captured",
      "this unindented line is a separate paragraph, not a continuation",
      "",
      "## Current checkpoints",
      "",
      "- [x] Example checkpoint",
      "",
      "## Later section",
      ""
    ].join("\n")
  );
  try {
    const result = web.getCommandCenterCheckpoints(tempTimelineFile);
    assert.equal(result.currentPhase, "Only the first line is captured");
  } finally {
    await fs.rm(tempTimelineFile, { force: true });
  }
});
