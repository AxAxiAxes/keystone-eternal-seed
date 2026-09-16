const express = require("express");
const crypto = require("crypto");
const fs = require("fs/promises");
const { constants: fsConstants } = require("fs");
const path = require("path");
const { ChatService } = require("./chat-service");
const { MemoryStore } = require("./memory-store");
const { StorageUsageService } = require("./storage-usage-service");
const { UsageStore } = require("./usage-store");
const { CheckpointService } = require("./checkpoint-service");
const { MonitoringService } = require("./monitoring-service");
const { RecoveryBackupService } = require("./recovery-backup-service");
const { CoordinateService } = require("./coordinate-service");
const { BeadPassportService } = require("./bead-passport-service");
const { StartupContextService } = require("./startup-context-service");
const { ContinuityRecordService } = require("./continuity-record-service");
const { SourceCatalogService, describeOptions: sourceCatalogDescribeOptions } = require("./source-catalog-service");
const { BusinessMetricsService } = require("./business-metrics-service");
const { ServiceRegistryService } = require("./service-registry-service");
const { AutomationProfileService } = require("./automation-profile-service");
const {
  AutomationService,
  evaluateGovernanceReadiness,
  summarizeAutomationState,
  startAutomationScheduler,
  listActionCatalog
} = require("./automation-service");
const { GithubStatusService } = require("./github-status-service");
const { WebAccessService } = require("./web-access-service");
const app = express();
app.use(express.json());
const ADMIN_PASSWORD = process.env.AXIOM_ENGINE_ADMIN_PASSWORD;
// Raw source-file uploads are capped and admin-authenticated (see the
// requireAdmin route below): 5 MB is a safe default for the intended use
// (documents, small media, datasets) on a small Railway instance disk;
// override via AXIOM_SOURCE_UPLOAD_MAX_BYTES if a larger cap is needed.
const DEFAULT_SOURCE_UPLOAD_MAX_BYTES = 5 * 1024 * 1024;
const SOURCE_UPLOAD_MAX_BYTES = (() => {
  const configured = Number(process.env.AXIOM_SOURCE_UPLOAD_MAX_BYTES);
  return Number.isInteger(configured) && configured > 0
    ? configured
    : DEFAULT_SOURCE_UPLOAD_MAX_BYTES;
})();

// All state-mutating AXIOM engine routes (automation profiles, checkpoints,
// backups, coordinates, bead passports, memory writes, etc.) must require
// admin credentials before this service is reachable from any public network
// path. This mirrors apps/axiom-freedom/server.js's requireAdmin pattern: a
// Basic-Auth password compared with a constant-time check, denying access by
// default whenever AXIOM_ENGINE_ADMIN_PASSWORD is unset.
function checkAdminAuth(req) {
  if (!ADMIN_PASSWORD) return false;
  const authorization = req.headers.authorization;
  if (typeof authorization !== "string") return false;

  const match = /^Basic\s+([A-Za-z0-9+/]+={0,2})$/.exec(authorization);
  if (!match) return false;

  const decoded = Buffer.from(match[1], "base64").toString("utf8");
  const separator = decoded.indexOf(":");
  if (separator < 0) return false;

  const providedPassword = Buffer.from(decoded.slice(separator + 1));
  const expectedPassword = Buffer.from(ADMIN_PASSWORD);
  return (
    providedPassword.length === expectedPassword.length &&
    crypto.timingSafeEqual(providedPassword, expectedPassword)
  );
}

function requireAdmin(req, res, next) {
  if (checkAdminAuth(req)) return next();
  res.set("WWW-Authenticate", 'Basic realm="AXIOM Engine Admin"');
  res.status(401).json({ error: "admin credentials required" });
}

const dataDirectory = process.env.AXIOM_MEMORY_DIRECTORY || path.join(__dirname, "data");
const memoryStore = new MemoryStore(dataDirectory);
const storageUsageService = new StorageUsageService({ directory: dataDirectory });
const usageStore = new UsageStore(dataDirectory);
const startupContextService = new StartupContextService({ directory: dataDirectory });
const startupContextReady = startupContextService.initialize();
const continuityRecordService = new ContinuityRecordService({ directory: dataDirectory });
const continuityRecordReady = continuityRecordService.initialize();
const sourceCatalogService = new SourceCatalogService({ directory: dataDirectory });
const sourceCatalogReady = sourceCatalogService.initialize();
const businessMetricsService = new BusinessMetricsService({ directory: dataDirectory });
const businessMetricsReady = businessMetricsService.initialize();
const serviceRegistryService = new ServiceRegistryService({ directory: dataDirectory });
const serviceRegistryReady = serviceRegistryService.initialize();
// GitHub visibility and write actions, founder-approved 2026-09-15. Off by
// default: reports "not configured" (and refuses every call) unless an
// authorized operator has supplied both AXIOM_GITHUB_TOKEN and
// AXIOM_GITHUB_REPO out-of-band. AXI cannot generate its own GitHub
// credentials -- the token itself must come from a human. Write routes
// (comment/open PR/merge) remain subject to GitHub's own branch protection
// and required status checks, which reject an unsafe merge the same way
// they would for a human caller.
const githubStatusService = new GithubStatusService({
  token: process.env.AXIOM_GITHUB_TOKEN,
  repo: process.env.AXIOM_GITHUB_REPO
});
// Bounded, read-only web-fetch capability, admin-gated. Off by default:
// reports "not enabled" (and refuses every fetch) unless an authorized
// operator sets AXIOM_WEB_ACCESS_ENABLED=true out-of-band. Not a browser --
// fetches exactly one URL server-side, blocks private/reserved addresses,
// does not follow redirects, and caps/truncates the response.
const webAccessService = new WebAccessService({
  enabled: process.env.AXIOM_WEB_ACCESS_ENABLED === "true"
});
const runtimeContextReady = Promise.all([
  startupContextReady,
  continuityRecordReady,
  sourceCatalogReady,
  businessMetricsReady,
  serviceRegistryReady
]);
const recoveryBackupService = new RecoveryBackupService({
  sourceDirectory: dataDirectory,
  backupDirectory: process.env.AXIOM_BACKUP_DIRECTORY,
  restoreDirectory: process.env.AXIOM_RECOVERY_RESTORE_DIRECTORY
});

app.get("/system/source-catalog", async (req, res, next) => {
  try {
    res.json(await sourceCatalogService.status());
  } catch (error) {
    next(error);
  }
});

app.get("/system/source-catalog/entries", async (req, res, next) => {
  try {
    const limit = req.query.limit === undefined ? 20 : Number(req.query.limit);
    res.json(await sourceCatalogService.list(limit));
  } catch (error) {
    next(error);
  }
});

// Read-only discovery route: exposes the valid sourceType/classification
// values and field constraints, so a caller does not need to hardcode or
// reverse-engineer the schema. sourceType is a metadata classification, not
// a file-extension allowlist -- every kind of file is representable.
app.get("/system/source-catalog/options", (req, res) => {
  res.json(sourceCatalogDescribeOptions({ maxUploadBytes: SOURCE_UPLOAD_MAX_BYTES }));
});

// GitHub visibility, founder-approved 2026-09-15. Reports "not configured"
// until an operator supplies AXIOM_GITHUB_TOKEN/AXIOM_GITHUB_REPO
// out-of-band; AXI never generates its own credentials. Status alone is
// safe to leave open (it reveals only whether a token is present, never
// the token itself); every route that reads or writes real repository data
// requires admin auth.
app.get("/system/github", (req, res) => {
  res.json(githubStatusService.status());
});

app.get("/system/github/repository", requireAdmin, async (req, res, next) => {
  try {
    res.json(await githubStatusService.repository());
  } catch (error) {
    next(error);
  }
});

app.get("/system/github/pull-requests", requireAdmin, async (req, res, next) => {
  try {
    const state = req.query.state === undefined ? "open" : req.query.state;
    const limit = req.query.limit === undefined ? 20 : Number(req.query.limit);
    res.json(await githubStatusService.listPullRequests({ state, limit }));
  } catch (error) {
    next(error);
  }
});

app.get("/system/github/issues", requireAdmin, async (req, res, next) => {
  try {
    const state = req.query.state === undefined ? "open" : req.query.state;
    const limit = req.query.limit === undefined ? 20 : Number(req.query.limit);
    res.json(await githubStatusService.listIssues({ state, limit }));
  } catch (error) {
    next(error);
  }
});

// Write actions, founder-approved 2026-09-15. Admin-gated. GitHub's own
// branch protection and required status checks on the target repository
// are the real safety backstop -- a merge GitHub itself would reject
// (failing/pending required checks, unmet review requirements) fails here
// exactly the same way it would for a human using the API directly.
app.post("/system/github/issues/:number/comments", requireAdmin, async (req, res, next) => {
  try {
    const number = Number(req.params.number);
    const body = req.body && req.body.body;
    res.status(201).json(await githubStatusService.createIssueComment(number, body));
  } catch (error) {
    next(error);
  }
});

app.post("/system/github/pull-requests", requireAdmin, async (req, res, next) => {
  try {
    const { title, head, base, body } = req.body || {};
    res.status(201).json(await githubStatusService.createPullRequest({ title, head, base, body }));
  } catch (error) {
    next(error);
  }
});

app.put("/system/github/pull-requests/:number/merge", requireAdmin, async (req, res, next) => {
  try {
    const number = Number(req.params.number);
    const { mergeMethod, commitTitle } = req.body || {};
    res.json(await githubStatusService.mergePullRequest(number, { mergeMethod, commitTitle }));
  } catch (error) {
    next(error);
  }
});

// Bounded web-fetch capability, admin-gated. Status alone is safe to leave
// open (it only reveals whether the capability is enabled, never fetches
// anything); the actual fetch route requires admin auth and is off by
// default until AXIOM_WEB_ACCESS_ENABLED=true is set out-of-band.
app.get("/system/web-access", (req, res) => {
  res.json(webAccessService.status());
});

app.post("/system/web-access/fetch", requireAdmin, async (req, res, next) => {
  try {
    const url = req.body && req.body.url;
    res.json(await webAccessService.fetchUrl(url));
  } catch (error) {
    next(error);
  }
});


app.get("/system/business-metrics", async (req, res, next) => {
  try {
    res.json(await businessMetricsService.status());
  } catch (error) {
    next(error);
  }
});

app.get("/system/business-metrics/entries", async (req, res, next) => {
  try {
    const limit = req.query.limit === undefined ? 20 : Number(req.query.limit);
    res.json(await businessMetricsService.list(limit));
  } catch (error) {
    next(error);
  }
});

app.get("/system/business-metrics/summary", async (req, res, next) => {
  try {
    res.json(await businessMetricsService.summary());
  } catch (error) {
    next(error);
  }
});
app.get("/system/service-registry", async (req, res, next) => {
  try {
    res.json(await serviceRegistryService.status());
  } catch (error) {
    next(error);
  }
});

app.get("/system/service-registry/entries", async (req, res, next) => {
  try {
    const limit = req.query.limit === undefined ? 20 : Number(req.query.limit);
    res.json(await serviceRegistryService.list(limit));
  } catch (error) {
    next(error);
  }
});

app.get("/system/service-registry/projection", async (req, res, next) => {
  try {
    res.json(await serviceRegistryService.projection());
  } catch (error) {
    next(error);
  }
});
const coordinateService = new CoordinateService({ directory: dataDirectory });
const checkpointService = new CheckpointService({
  directory: dataDirectory,
  modules: [
    { id: "memory", version: "1" },
    { id: "usage", version: "1" },
    { id: "automation", version: "1" },
    { id: "chat", version: "1" },
    { id: "monitoring", version: "1" },
    { id: "checkpoint", version: "1" },
    { id: "source-catalog", version: "1" },
    { id: "business-metrics", version: "1" },
    { id: "service-registry", version: "1" },
    { id: "automation-profiles", version: "1" }
  ]
});
let automationProfileService;
const automationService = new AutomationService({
  directory: dataDirectory,
  memoryStore,
  captureMonitoringSnapshot,
  createRecoveryBackup: () => recoveryBackupService.create(),
  verifyRecoveryBackup: (backupId) => recoveryBackupService.verify(backupId),
  createCoordinate: (coordinate) => coordinateService.create(coordinate),
  createCheckpoint: () => checkpointService.create(),
  recordContinuity: (entry) => continuityRecordService.recordOperatorConfirmation(entry),
  catalogSource: (entry) => sourceCatalogService.record(entry),
  recordBusinessMetric: (entry) => businessMetricsService.record(entry),
  recordServiceRegistry: (entry) => serviceRegistryService.record(entry),
  canProcessTask: (task, tasks) => automationProfileService
    ? automationProfileService.isTaskProcessingAllowed(task.id, tasks)
    : true
});
automationProfileService = new AutomationProfileService({
  directory: dataDirectory,
  createTask: (task) => automationService.createProfileTask(task),
  listTasks: () => automationService.listTasks(),
  listAgents: () => automationService.listAgents(),
  readiness: async () => ({
    startupContext: await startupContextService.status(),
    sourceCatalog: await sourceCatalogService.status(),
    businessMetrics: await businessMetricsService.status(),
    serviceRegistry: await serviceRegistryService.status(),
    governance: await automationService.getGovernanceReadiness(),
    recovery: await recoveryBackupService.status()
  })
});
const automationProfileReady = automationProfileService.initialize();
const beadPassportService = new BeadPassportService({
  directory: dataDirectory,
  coordinateService,
  getAgent: (agentId) => automationService.getAgent(agentId)
});
const scheduler = {
  enabled: process.env.AXIOM_AUTOMATION_ENABLED === "true",
  lastRunAt: null,
  lastError: null
};
const monitoring = {
  enabled: process.env.AXIOM_MONITORING_ENABLED === "true"
};
const monitoringService = new MonitoringService({
  directory: dataDirectory,
  memoryStore
});
const chatService = new ChatService({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
  memoryStore,
  usageStore,
  maxMessageCharacters: Number(
    process.env.AXIOM_CHAT_MAX_MESSAGE_CHARACTERS || 4000
  )
});

app.use(async (req, res, next) => {
  try {
    await runtimeContextReady;
    await automationProfileReady;
    next();
  } catch (error) {
    next(error);
  }
});

// Health check
app.get("/", (req, res) => {
  res.json({ status: "AXIOM engine online" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "AXIOM engine" });
});

app.get("/system/readiness", async (req, res, next) => {
  try {
    await fs.mkdir(memoryStore.directory, { recursive: true });
    await fs.access(memoryStore.directory, fsConstants.R_OK | fsConstants.W_OK);
    const storage = await storageUsageService.status();
    res.json({
      status: "ready",
      checkedAt: new Date().toISOString(),
      storage,
      provider: {
        status: chatService.apiKey ? "configured" : "not-configured",
        model: chatService.model
      },
      automation: {
        status: scheduler.enabled ? "enabled" : "disabled",
        lastRunAt: scheduler.lastRunAt,
        lastError: scheduler.lastError
      },
      monitoring: {
        status: monitoring.enabled ? "enabled" : "disabled"
      },
      governance: await automationService.getGovernanceReadiness(),
      recovery: await recoveryBackupService.status(),
      coordinates: await coordinateService.status(),
      beadPassports: await beadPassportService.status(),
      startupContext: await startupContextService.status(),
      continuityRecord: await continuityRecordService.status(),
      sourceCatalog: await sourceCatalogService.status(),
      businessMetrics: await businessMetricsService.status(),
      serviceRegistry: await serviceRegistryService.status(),
      automationProfiles: await automationProfileService.status(),
      github: githubStatusService.status(),
      webAccess: webAccessService.status()
    });
  } catch (error) {
    console.error("AXIOM runtime readiness check failed:", error.message);
    res.status(503).json({
      status: "not-ready",
      checkedAt: new Date().toISOString(),
      storage: { status: "unavailable" }
    });
  }
});

app.get("/system/storage", async (req, res, next) => {
  try {
    res.json(await storageUsageService.status());
  } catch (error) {
    next(error);
  }
});

app.get("/usage", async (req, res, next) => {
  try {
    res.json(await usageStore.summary());
  } catch (error) {
    next(error);
  }
});

async function captureMonitoringSnapshot(automationState) {
  await memoryStore.list("decision", 1);
  const [storage, automation, usage, governance, recovery, coordinates, beadPassports, startupContext, continuityRecord, sourceCatalog, businessMetrics, serviceRegistry, automationProfiles] = await Promise.all([
    storageUsageService.status(),
    automationState
      ? summarizeAutomationState(automationState)
      : automationService.status(),
    usageStore.summary(),
    automationState
      ? evaluateGovernanceReadiness(automationState)
      : automationService.getGovernanceReadiness(),
    recoveryBackupService.status(),
    coordinateService.status(),
    beadPassportService.status(),
    startupContextService.status(),
    continuityRecordService.status(),
    sourceCatalogService.status(),
    businessMetricsService.status(),
    serviceRegistryService.status(),
    automationProfileService.status()
  ]);
  const monitoringRecord = await monitoringService.record({
    memoryAvailable: storage.status !== "unavailable",
    storage,
    scheduler: { ...scheduler },
    automation,
    governance,
    recovery,
    coordinates,
    beadPassports,
    startupContext,
    continuityRecord,
    sourceCatalog,
    businessMetrics,
    serviceRegistry,
    automationProfiles,
    usage
  });
  if (monitoringRecord.recorded) {
    await continuityRecordService.recordMonitoringStateChange();
  }
  return monitoringRecord;
}

async function requireReadyStartupContext() {
  await runtimeContextReady;
  await automationProfileReady;
  const startupContext = await startupContextService.status();
  if (startupContext.status !== "ready") {
    const error = new Error(
      `Automation is blocked until the startup context is ready (${startupContext.code}).`
    );
    error.statusCode = 409;
    throw error;
  }

  const continuityRecord = await continuityRecordService.status();
  if (continuityRecord.status !== "ready") {
    const continuityError = new Error(
      `Automation is blocked until the continuity record is ready (${continuityRecord.code}).`
    );
    continuityError.statusCode = 409;
    throw continuityError;
  }
  const sourceCatalog = await sourceCatalogService.status();
  if (sourceCatalog.status !== "ready") {
    const catalogError = new Error(
      `Automation is blocked until the source catalog is ready (${sourceCatalog.code}).`
    );
    catalogError.statusCode = 409;
    throw catalogError;
  }
  const businessMetrics = await businessMetricsService.status();
  if (businessMetrics.status !== "ready") {
    const metricsError = new Error(
      `Automation is blocked until business metrics are ready (${businessMetrics.code}).`
    );
    metricsError.statusCode = 409;
    throw metricsError;
  }
  const serviceRegistry = await serviceRegistryService.status();
  if (serviceRegistry.status !== "ready") {
    const registryError = new Error(
      `Automation is blocked until the service registry is ready (${serviceRegistry.code}).`
    );
    registryError.statusCode = 409;
    throw registryError;
  }
  const profiles = await automationProfileService.status();
  if (profiles.status !== "ready") {
    const profileError = new Error(
      `Automation is blocked until automation profiles are ready (${profiles.code}).`
    );
    profileError.statusCode = 409;
    throw profileError;
  }
}

app.get("/automation/profiles", async (req, res, next) => {
  try {
    res.json(await automationProfileService.list());
  } catch (error) {
    next(error);
  }
});

app.post("/automation/profiles", requireAdmin, async (req, res, next) => {
  try {
    res.status(201).json(await automationProfileService.createDraft(req.body));
  } catch (error) {
    next(error);
  }
});

app.get("/automation/profiles/history", async (req, res, next) => {
  try {
    const limit = req.query.limit === undefined ? 20 : Number(req.query.limit);
    res.json(await automationProfileService.history(limit));
  } catch (error) {
    next(error);
  }
});

app.get("/automation/profiles/health", async (req, res, next) => {
  try {
    res.json(await automationProfileService.health());
  } catch (error) {
    next(error);
  }
});

app.post("/automation/profiles/preview", requireAdmin, async (req, res, next) => {
  try {
    res.json(await automationProfileService.preview(req.body));
  } catch (error) {
    next(error);
  }
});

app.post("/automation/profiles/:profileId/activate", requireAdmin, async (req, res, next) => {
  try {
    res.json(await automationProfileService.activate(req.params.profileId, req.body));
  } catch (error) {
    next(error);
  }
});

app.post("/automation/profiles/:profileId/pause", requireAdmin, async (req, res, next) => {
  try {
    res.json(await automationProfileService.pause(req.params.profileId, req.body));
  } catch (error) {
    next(error);
  }
});

app.post("/automation/profiles/:profileId/resume", requireAdmin, async (req, res, next) => {
  try {
    res.json(await automationProfileService.resume(req.params.profileId, req.body));
  } catch (error) {
    next(error);
  }
});

app.get("/system/startup-context", async (req, res, next) => {
  try {
    res.json(await startupContextService.status());
  } catch (error) {
    next(error);
  }
});

app.get("/system/continuity-record", async (req, res, next) => {
  try {
    res.json(await continuityRecordService.status());
  } catch (error) {
    next(error);
  }
});

app.get("/system/continuity-record/events", async (req, res, next) => {
  try {
    const limit = req.query.limit === undefined ? 20 : Number(req.query.limit);
    res.json(await continuityRecordService.list(limit));
  } catch (error) {
    next(error);
  }
});

app.post("/system/continuity-record/events", requireAdmin, async (req, res, next) => {
  try {
    res.status(201).json(await continuityRecordService.recordOperatorConfirmation(req.body));
  } catch (error) {
    next(error);
  }
});

app.get("/monitoring/status", async (req, res, next) => {
  try {
    res.json(await monitoringService.status());
  } catch (error) {
    next(error);
  }
});

app.get("/monitoring/history", async (req, res, next) => {
  try {
    const limit = req.query.limit === undefined ? 20 : Number(req.query.limit);
    res.json(await monitoringService.history(limit));
  } catch (error) {
    next(error);
  }
});

app.post("/monitoring/snapshots", requireAdmin, async (req, res, next) => {
  try {
    res.status(201).json(await captureMonitoringSnapshot());
  } catch (error) {
    next(error);
  }
});

app.get("/system/checkpoints", async (req, res, next) => {
  try {
    const limit = req.query.limit === undefined ? 20 : Number(req.query.limit);
    res.json(await checkpointService.list(limit));
  } catch (error) {
    next(error);
  }
});

app.post("/system/checkpoints", requireAdmin, async (req, res, next) => {
  try {
    res.status(201).json(await checkpointService.create());
  } catch (error) {
    next(error);
  }
});

app.get("/system/backups", async (req, res, next) => {
  try {
    const limit = req.query.limit === undefined ? 20 : Number(req.query.limit);
    res.json(await recoveryBackupService.list(limit));
  } catch (error) {
    next(error);
  }
});

app.post("/system/backups", requireAdmin, async (req, res, next) => {
  try {
    res.status(201).json(await recoveryBackupService.create());
  } catch (error) {
    next(error);
  }
});

app.post("/system/backups/:backupId/verify", requireAdmin, async (req, res, next) => {
  try {
    res.json(await recoveryBackupService.verify(req.params.backupId));
  } catch (error) {
    next(error);
  }
});

app.post("/system/backups/:backupId/restore", requireAdmin, async (req, res, next) => {
  try {
    res.status(201).json(await recoveryBackupService.restore(req.params.backupId));
  } catch (error) {
    next(error);
  }
});

app.get("/system/coordinates", async (req, res, next) => {
  try {
    const limit = req.query.limit === undefined ? 100 : Number(req.query.limit);
    res.json(await coordinateService.list(limit));
  } catch (error) {
    next(error);
  }
});

app.post("/system/coordinates", requireAdmin, async (req, res, next) => {
  try {
    res.status(201).json(await coordinateService.create(req.body));
  } catch (error) {
    next(error);
  }
});

app.get("/system/coordinates/verify", async (req, res, next) => {
  try {
    res.json(await coordinateService.verify());
  } catch (error) {
    next(error);
  }
});

app.get("/system/gravity-center", async (req, res, next) => {
  try {
    res.json(await beadPassportService.getGravityCenter());
  } catch (error) {
    next(error);
  }
});

app.get("/system/bead-passports", async (req, res, next) => {
  try {
    const limit = req.query.limit === undefined ? 100 : Number(req.query.limit);
    res.json(await beadPassportService.list(limit));
  } catch (error) {
    next(error);
  }
});

app.post("/system/bead-passports", requireAdmin, async (req, res, next) => {
  try {
    res.status(201).json(await beadPassportService.register(req.body));
  } catch (error) {
    next(error);
  }
});

app.get("/system/bead-passports/verify", async (req, res, next) => {
  try {
    res.json(await beadPassportService.verify());
  } catch (error) {
    next(error);
  }
});

app.get("/automation/status", async (req, res, next) => {
  try {
    res.json(await automationService.status());
  } catch (error) {
    next(error);
  }
});

// Read-only discovery route: lists every allowlisted action with its
// approval requirement, fixed agent (if any), and expected payload fields,
// so a caller can query available options instead of hardcoding them.
app.get("/automation/actions", (req, res) => {
  res.json({ actions: listActionCatalog() });
});

app.get("/automation/readiness", async (req, res, next) => {
  try {
    res.json(await automationService.getGovernanceReadiness());
  } catch (error) {
    next(error);
  }
});

app.get("/automation/agents", async (req, res, next) => {
  try {
    res.json(await automationService.listAgents());
  } catch (error) {
    next(error);
  }
});

app.get("/automation/agents/:agentId/report", async (req, res, next) => {
  try {
    res.json(await automationService.getAgentReport(req.params.agentId));
  } catch (error) {
    next(error);
  }
});

app.post("/automation/agents/:agentId/accountability", requireAdmin, async (req, res, next) => {
  try {
    res.json(await automationService.reviewAgentAccountability(
      req.params.agentId,
      req.body
    ));
  } catch (error) {
    next(error);
  }
});

app.post("/automation/agents", requireAdmin, async (req, res, next) => {
  try {
    res.status(201).json(await automationService.registerAgent(req.body));
  } catch (error) {
    next(error);
  }
});

app.get("/automation/tasks", async (req, res, next) => {
  try {
    res.json(await automationService.listTasks(req.query.status));
  } catch (error) {
    next(error);
  }
});

app.post("/automation/tasks", requireAdmin, async (req, res, next) => {
  try {
    res.status(201).json(await automationService.createTask(req.body));
  } catch (error) {
    next(error);
  }
});

// Stores raw file bytes for later cataloging: admin-authenticated, size
// capped (AXIOM_SOURCE_UPLOAD_MAX_BYTES, default 5 MB), and written only to
// this instance's own local data directory -- never the git repository and
// never an external/cloud store. This route only persists bytes and reports
// their sha256; it does not create a source-catalog entry. Filing the
// returned sourceReference still requires an approved source.catalog
// automation task, preserving the existing operator-approval boundary while
// adding real storage of the uploaded content.
app.post(
  "/system/source-catalog/uploads",
  requireAdmin,
  express.raw({ type: () => true, limit: SOURCE_UPLOAD_MAX_BYTES }),
  async (req, res, next) => {
    try {
      if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
        res.status(400).json({ error: "request body must be a non-empty file upload" });
        return;
      }
      const filenameHeader = req.headers["x-source-filename"];
      const stored = await sourceCatalogService.storeUpload({
        buffer: req.body,
        filename: typeof filenameHeader === "string" ? filenameHeader : null
      });
      res.status(201).json(stored);
    } catch (error) {
      next(error);
    }
  }
);

app.post("/automation/tasks/:taskId/approval", requireAdmin, async (req, res, next) => {
  try {
    res.json(await automationService.reviewTaskApproval(
      req.params.taskId,
      req.body.approved
    ));
  } catch (error) {
    next(error);
  }
});

app.post("/automation/process", requireAdmin, async (req, res, next) => {
  try {
    await requireReadyStartupContext();
    const maxTasks = req.body.maxTasks === undefined ? 5 : Number(req.body.maxTasks);
    res.json(await automationService.processDueTasks(maxTasks));
  } catch (error) {
    next(error);
  }
});

app.post("/automation/chat", requireAdmin, async (req, res, next) => {
  try {
    const agent = await automationService.getAgent(req.body.agentId);
    const reply = await chatService.reply(req.body.message, { agent });
    res.json({ agent: { id: agent.id, name: agent.name }, reply });
  } catch (error) {
    next(error);
  }
});

app.get("/automation/runs", async (req, res, next) => {
  try {
    const limit = req.query.limit === undefined ? 50 : Number(req.query.limit);
    res.json(await automationService.listRuns(limit));
  } catch (error) {
    next(error);
  }
});

app.get("/memory/identity", async (req, res, next) => {
  try {
    const identity = await memoryStore.readIdentity();
    if (!identity) {
      res.status(404).json({ error: "AXIOM identity has not been initialized" });
      return;
    }
    res.json(identity);
  } catch (error) {
    next(error);
  }
});

app.put("/memory/identity", async (req, res, next) => {
  try {
    res.status(201).json(await memoryStore.writeIdentity(req.body));
  } catch (error) {
    next(error);
  }
});

app.get("/memory/:kind", async (req, res, next) => {
  try {
    const limit = req.query.limit === undefined ? 50 : Number(req.query.limit);
    // Optional privacy scoping: when a sessionId is supplied (the public
    // portal always supplies its visitor's own session id when reading back
    // chat history), only that session's own entries are returned instead
    // of every visitor's episodic history.
    const sessionId = typeof req.query.sessionId === "string" && req.query.sessionId.trim().length > 0
      ? req.query.sessionId.trim()
      : undefined;
    res.json(await memoryStore.list(
      req.params.kind,
      limit,
      sessionId ? { metadataFilter: { sessionId } } : undefined
    ));
  } catch (error) {
    next(error);
  }
});

app.post("/memory/:kind", requireAdmin, async (req, res, next) => {
  try {
    res.status(201).json(await memoryStore.record({
      kind: req.params.kind,
      content: req.body.content,
      metadata: req.body.metadata
    }));
  } catch (error) {
    next(error);
  }
});

// Core automation route
app.post("/axiom", requireAdmin, async (req, res, next) => {
  const { action, payload } = req.body;

  try {
    if (action === "chat") {
      // Every chat session is private by default: a caller that supplies no
      // sessionId (or an empty one) gets a brand-new, isolated id here, so
      // it starts with zero prior context and its turns cannot be read back
      // by any other session. This is the seam the public portal's
      // per-visitor cookie plugs into (see apps/axiom-freedom/server.js).
      const sessionId = typeof payload?.sessionId === "string" && payload.sessionId.trim().length > 0
        ? payload.sessionId.trim()
        : crypto.randomUUID();
      const reply = await chatService.reply(payload?.message, { sessionId });
      res.json({
        engine: "AXIOM",
        actionReceived: action,
        reply,
        sessionId,
        status: "processed"
      });
      return;
    }

  res.json({
    engine: "AXIOM",
    actionReceived: action,
    payloadReceived: payload,
    status: "processed"
  });
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError) {
    res.status(400).json({ error: "Invalid JSON request" });
    return;
  }
  if (error.type === "entity.too.large" || error.status === 413) {
    res.status(413).json({
      error: `uploaded file exceeds the maximum allowed size of ${SOURCE_UPLOAD_MAX_BYTES} bytes`
    });
    return;
  }
  if (
    error instanceof TypeError ||
    error instanceof RangeError ||
    Number.isInteger(error.statusCode)
  ) {
    console.error("AXIOM engine request error:", error.message);
    res.status(error.statusCode || 400).json({ error: error.message });
    return;
  }
  console.error("AXIOM engine request failed:", error.message);
  res.status(500).json({ error: "AXIOM engine request failed" });
});

if (require.main === module) {
  if (process.env.AXIOM_AUTOMATION_ENABLED === "true") {
    startAutomationScheduler(automationService, {
      pollIntervalMs: Number(process.env.AXIOM_AUTOMATION_POLL_INTERVAL_MS || 60_000),
      maxTasks: Number(process.env.AXIOM_AUTOMATION_MAX_TASKS_PER_CYCLE || 5),
      canProcess: requireReadyStartupContext,
      onCycle: ({ error }) => {
        scheduler.lastRunAt = new Date().toISOString();
        scheduler.lastError = error ? error.message : null;
      }
    });
  }
  if (process.env.AXIOM_MONITORING_ENABLED === "true") {
    const intervalMs = Number(process.env.AXIOM_MONITORING_POLL_INTERVAL_MS || 60_000);
    if (!Number.isInteger(intervalMs) || intervalMs < 1_000 || intervalMs > 3_600_000) {
      throw new RangeError("AXIOM_MONITORING_POLL_INTERVAL_MS must be from 1000 to 3600000");
    }
    captureMonitoringSnapshot().catch((error) => console.error("AXIOM monitoring failed:", error));
    setInterval(() => {
      captureMonitoringSnapshot().catch((error) => console.error("AXIOM monitoring failed:", error));
    }, intervalMs);
  }
  app.listen(process.env.PORT || 3000, () => {
    console.log("AXIOM engine running");
  });
}

module.exports = app;
