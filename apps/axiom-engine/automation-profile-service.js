const { createHash, randomUUID } = require("crypto");
const fs = require("fs/promises");
const path = require("path");
const { validateServiceRegistryInput } = require("./service-registry-service");

const AUTOMATION_PROFILE_ID = "axi-automation-profile-v1";
const AUTOMATION_PROFILE_SCHEMA_VERSION = 1;
const AUTOMATION_PROFILE_FILE_NAME = "automation-profiles.jsonl";
const OPERATIONS_OBSERVATION_TEMPLATE = "operations-observation";
const FOUNDER_CONFIGURED_TEMPLATE = "founder-configured";
const PROFILE_NOTICE = "Founder-controlled internal schedules only. Profiles do not deploy, access accounts, send messages, publish, spend, accept payments, collect data, or make financial or legal decisions.";
const PROFILE_HEALTH_NOTICE = "Read-only profile/task association status. This report does not expose task payloads or audit-error details, and does not change a profile, task, scheduler, or external system.";
const ACTIONS = new Set(["memory.record", "automation.noop", "monitoring.snapshot", "governance.readiness", "recovery.backup", "coordinate.record", "continuity.checkpoint", "continuity.record", "source.catalog", "business.metric", "service.registry"]);
const NO_PAYLOAD_ACTIONS = new Set(["automation.noop", "monitoring.snapshot", "governance.readiness", "recovery.backup", "continuity.checkpoint"]);
const SENSITIVE = /\b(account|bank|card|client|credential|customer|email|invoice|name|password|payment|person|personal|tax|vendor)\b/i;

class AutomationProfileService {
  constructor({ directory, createTask, listTasks, listAgents, readiness, now = () => new Date() }) {
    Object.assign(this, { directory, createTask, listTasks, listAgents, readiness, now });
    this.operationQueue = Promise.resolve();
  }

  async initialize() {
    try {
      const records = await this.readRecords();
      validateRecords(records);
      await fs.mkdir(this.directory, { recursive: true });
      return this.statusFromRecords(records);
    } catch { return this.invalidStatus(); }
  }
  async status() {
    try { return this.statusFromRecords(await this.validRecords()); } catch { return this.invalidStatus(); }
  }
  async list() {
    const records = await this.validRecords();
    return { label: PROFILE_NOTICE, templates: sourceMatrix(await this.listAgents()), profiles: Object.values(projectProfiles(records)).map(summarizeProfile) };
  }
  async history(limit = 20) {
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new RangeError("limit must be an integer between 1 and 100");
    }
    return (await this.validRecords()).slice(-limit).reverse().map(summarizeProfileEvent);
  }
  async health() {
    const records = await this.validRecords();
    const tasks = await this.listTasks();
    return {
      label: PROFILE_HEALTH_NOTICE,
      profiles: Object.values(projectProfiles(records))
        .filter((profile) => profile.status === "active" || profile.status === "paused")
        .map((profile) => summarizeProfileHealth(profile, tasks))
    };
  }
  async preview(input) {
    const agents = await this.listAgents();
    assertDraftInput(input, agents);
    const taskTemplates = input.template === OPERATIONS_OBSERVATION_TEMPLATE
      ? starterTemplates(input) : normalizeTaskTemplates(input.taskTemplates);
    assertCompletedDependencies(taskTemplates, await this.listTasks());
    const readiness = await this.readiness();
    const activationBlockers = activationReadinessIssues(readiness);
    return {
      label: PROFILE_NOTICE,
      profileId: input.profileId.trim(),
      template: input.template,
      taskPlan: taskTemplates.map(summarizeTaskPlan),
      activation: {
        status: activationBlockers.length ? "blocked" : "ready",
        blockers: activationBlockers,
        recoveryReadiness: readiness.recovery?.status || "unavailable"
      }
    };
  }
  async createDraft(input) {
    const agents = await this.listAgents();
    assertDraftInput(input, agents);
    const taskTemplates = input.template === OPERATIONS_OBSERVATION_TEMPLATE
      ? starterTemplates(input) : normalizeTaskTemplates(input.taskTemplates);
    assertCompletedDependencies(taskTemplates, await this.listTasks());
    return this.withExclusiveAccess(async () => {
      const records = await this.validRecords();
      if (projectProfiles(records)[input.profileId.trim()]) throw new RangeError(`profileId already exists: ${input.profileId.trim()}`);
      const template = input.template;
      return this.append(records, {
        event: "draft-created", profileId: input.profileId.trim(), template, taskTemplates,
        taskIds: {}, recoveryReadiness: "not-checked"
      });
    });
  }
  async activate(profileId, { confirmed } = {}) {
    if (!isId(profileId)) throw new TypeError("profileId must be a safe lowercase kebab-case identifier");
    if (confirmed !== true) throw new RangeError("founder confirmation is required to activate a profile");
    return this.withExclusiveAccess(async () => {
      const records = await this.validRecords();
      const profile = projectProfiles(records)[profileId];
      if (!profile) throw new RangeError(`profile does not exist: ${profileId}`);
      if (profile.status !== "draft") throw new RangeError("only draft profiles can be activated");
      const readiness = await this.readiness();
      assertActivationReadiness(readiness);
      const agents = await this.listAgents();
      assertCompatibleTemplates(profile.taskTemplates, agents);
      const existingTasks = await this.listTasks();
      assertCompletedDependencies(profile.taskTemplates, existingTasks);
      const taskIds = {};
      for (const definition of profile.taskTemplates) {
        const associated = existingTasks.filter((task) => task.automationProfileId === profileId && task.automationProfileKey === definition.key);
        if (associated.length > 1 || associated.some((task) => !matchesDefinition(task, definition))) {
          throw new RangeError("profile task association conflicts with the approved template");
        }
        const task = associated[0] || await this.createTask({
          title: `Profile ${profileId} ${definition.key}`, action: definition.action, agentId: definition.agentId,
          recurrenceMinutes: definition.recurrenceMinutes, dependsOn: definition.dependsOnTaskIds,
          approvalRequired: definition.approvalRequired, originCheckpoint: "axi-automation-profiles",
          payload: definition.payload, automationProfileId: profileId, automationProfileKey: definition.key
        });
        taskIds[definition.key] = task.id;
      }
      return this.append(records, {
        event: "activated", profileId, template: profile.template, taskTemplates: profile.taskTemplates,
        taskIds, recoveryReadiness: readiness.recovery?.status || "unavailable"
      });
    });
  }
  async pause(profileId, { confirmed } = {}) {
    if (!isId(profileId)) throw new TypeError("profileId must be a safe lowercase kebab-case identifier");
    if (confirmed !== true) throw new RangeError("founder confirmation is required to pause a profile");
    return this.withExclusiveAccess(async () => {
      const records = await this.validRecords();
      const profile = projectProfiles(records)[profileId];
      if (!profile) throw new RangeError(`profile does not exist: ${profileId}`);
      if (profile.status !== "active") throw new RangeError("only active profiles can be paused");
      return this.append(records, { event: "paused", profileId, template: profile.template,
        taskTemplates: profile.taskTemplates, taskIds: profile.taskIds, recoveryReadiness: profile.recoveryReadiness });
    });
  }
  async resume(profileId, { confirmed } = {}) {
    if (!isId(profileId)) throw new TypeError("profileId must be a safe lowercase kebab-case identifier");
    if (confirmed !== true) throw new RangeError("founder confirmation is required to resume a profile");
    return this.withExclusiveAccess(async () => {
      const records = await this.validRecords();
      const profile = projectProfiles(records)[profileId];
      if (!profile) throw new RangeError(`profile does not exist: ${profileId}`);
      if (profile.status !== "paused") throw new RangeError("only paused profiles can be resumed");
      const readiness = await this.readiness();
      assertActivationReadiness(readiness);
      const agents = await this.listAgents();
      assertCompatibleTemplates(profile.taskTemplates, agents);
      const existingTasks = await this.listTasks();
      const taskIds = {};
      for (const definition of profile.taskTemplates) {
        const taskId = profile.taskIds[definition.key] || profile.taskIds[definition.action];
        const associated = existingTasks.filter((task) =>
          task.automationProfileId === profileId && task.automationProfileKey === definition.key);
        if (associated.length !== 1 || associated[0].id !== taskId ||
          !matchesDefinition(associated[0], definition)) {
          throw new RangeError("paused profile task association conflicts with the approved template");
        }
        taskIds[definition.key] = taskId;
      }
      return this.append(records, {
        event: "resumed", profileId, template: profile.template,
        taskTemplates: profile.taskTemplates, taskIds,
        recoveryReadiness: readiness.recovery?.status || "unavailable"
      });
    });
  }
  async isTaskProcessingAllowed(taskId, availableTasks) {
    try {
      const profiles = Object.values(projectProfiles(await this.validRecords()));
      const tasks = availableTasks || await this.listTasks();
      const task = tasks.find((candidate) => candidate.id === taskId);
      const profile = profiles.find((candidate) =>
        Object.values(candidate.taskIds).includes(taskId) ||
        task?.automationProfileId === candidate.profileId);
      if (!profile) return true;
      if (profile.status !== "active") return false;
      const definition = profile.taskTemplates.find((candidate) =>
        candidate.key === task?.automationProfileKey);
      if (!definition || !task) return false;
      const retainedTaskId = profile.taskIds[definition.key] || profile.taskIds[definition.action];
      const associated = tasks.filter((candidate) =>
        candidate.automationProfileId === profile.profileId &&
        candidate.automationProfileKey === definition.key);
      return retainedTaskId === taskId && associated.length === 1 &&
        matchesDefinition(task, definition);
    } catch { return false; }
  }
  async append(records, event) {
    const previous = records.at(-1);
    const record = { schemaVersion: AUTOMATION_PROFILE_SCHEMA_VERSION, id: randomUUID(), sequence: records.length + 1,
      recordedAt: this.now().toISOString(), controller: "founder", ...event, previousHash: previous ? previous.hash : null };
    record.hash = hashRecord(record);
    await fs.mkdir(this.directory, { recursive: true });
    await fs.appendFile(this.statePath(), `${JSON.stringify(record)}\n`, "utf8");
    return summarizeProfile(projectProfiles([...records, record])[record.profileId]);
  }
  async validRecords() { const records = await this.readRecords(); validateRecords(records); return records; }
  async readRecords() {
    try { return (await fs.readFile(this.statePath(), "utf8")).split("\n").filter(Boolean).map(JSON.parse); }
    catch (error) { if (error.code === "ENOENT") return []; throw error; }
  }
  statusFromRecords(records) {
    const profiles = Object.values(projectProfiles(records));
    return { status: "ready", id: AUTOMATION_PROFILE_ID, schemaVersion: AUTOMATION_PROFILE_SCHEMA_VERSION,
      profileCount: profiles.length, activeProfileCount: profiles.filter((profile) => profile.status === "active").length,
      templates: sourceMatrix([]), profiles: profiles.map(summarizeProfile), label: PROFILE_NOTICE };
  }
  invalidStatus() { return { status: "attention", code: "automation-profile-invalid", expectedId: AUTOMATION_PROFILE_ID, expectedSchemaVersion: AUTOMATION_PROFILE_SCHEMA_VERSION, label: PROFILE_NOTICE }; }
  withExclusiveAccess(operation) { const queued = this.operationQueue.then(operation); this.operationQueue = queued.catch(() => {}); return queued; }
  statePath() { return path.join(this.directory, AUTOMATION_PROFILE_FILE_NAME); }
}

function sourceMatrix(agents) {
  const active = agents.filter((agent) => agent.enabled && agent.accountability?.status === "active");
  return [
    { id: OPERATIONS_OBSERVATION_TEMPLATE, starter: true, taskTemplates: starterTemplates({ monitoringRecurrenceMinutes: 5, governanceRecurrenceMinutes: 60 }) },
    { id: FOUNDER_CONFIGURED_TEMPLATE, starter: false, roles: active.map((agent) => ({ agentId: agent.id, capabilities: agent.capabilities.filter((action) => ACTIONS.has(action)) })), taskSchema: { key: "lowercase kebab-case", action: [...ACTIONS], agentId: "active compatible registered role", recurrenceMinutes: "1..10080", dependsOnTaskIds: "existing completed task UUIDs", approvalRequired: "required for protected record actions", payload: "action-specific approved structured input only" } }
  ];
}
function starterTemplates(input) {
  return [
    { key: "monitoring-snapshot", action: "monitoring.snapshot", agentId: "operations-observer", recurrenceMinutes: input.monitoringRecurrenceMinutes, dependsOnTaskIds: [], approvalRequired: false, payload: {} },
    { key: "governance-readiness", action: "governance.readiness", agentId: "operations-observer", recurrenceMinutes: input.governanceRecurrenceMinutes, dependsOnTaskIds: [], approvalRequired: false, payload: {} }
  ];
}
function normalizeTaskTemplates(templates) {
  return templates.map((template) => ({ key: template.key.trim(), action: template.action, agentId: template.agentId,
    recurrenceMinutes: template.recurrenceMinutes, dependsOnTaskIds: [...template.dependsOnTaskIds],
    approvalRequired: template.approvalRequired, payload: template.payload }));
}
function projectProfiles(records) {
  const profiles = {};
  for (const record of records) {
    const templates = record.taskTemplates || starterFromLegacy(record);
    profiles[record.profileId] = { profileId: record.profileId, template: record.template, controller: record.controller,
      taskTemplates: templates, taskIds: record.taskIds, status: record.event === "draft-created" ? "draft" : ["activated", "resumed"].includes(record.event) ? "active" : "paused",
      recoveryReadiness: record.recoveryReadiness, updatedAt: record.recordedAt, auditSequence: record.sequence };
  }
  return profiles;
}
function starterFromLegacy(record) {
  return starterTemplates({ monitoringRecurrenceMinutes: record.monitoringRecurrenceMinutes, governanceRecurrenceMinutes: record.governanceRecurrenceMinutes });
}
function summarizeProfile(profile) { return { ...profile, taskIds: { ...profile.taskIds }, taskTemplates: profile.taskTemplates.map((task) => ({ ...task, payload: { ...task.payload } })), notice: PROFILE_NOTICE }; }
function summarizeProfileEvent(record) {
  return {
    sequence: record.sequence,
    recordedAt: record.recordedAt,
    event: record.event,
    profileId: record.profileId,
    template: record.template,
    taskCount: Object.keys(record.taskIds).length,
    recoveryReadiness: record.recoveryReadiness
  };
}
function summarizeProfileHealth(profile, tasks) {
  const tasksById = new Map(tasks.map((task) => [task.id, task]));
  const taskHealth = profile.taskTemplates.map((definition) => {
    const taskId = profile.taskIds[definition.key] || profile.taskIds[definition.action];
    const task = tasksById.get(taskId);
    const associated = tasks.filter((candidate) =>
      candidate.automationProfileId === profile.profileId &&
      candidate.automationProfileKey === definition.key);
    let associationStatus = "matching";
    if (!taskId) associationStatus = "missing-retained-id";
    else if (!task) associationStatus = "missing-task";
    else if (associated.length !== 1) associationStatus = associated.length ? "duplicate-association" : "missing-association";
    else if (associated[0].id !== taskId || !matchesDefinition(associated[0], definition)) associationStatus = "mismatched-association";
    const attention = [];
    if (associationStatus !== "matching") attention.push(associationStatus);
    if (task?.lastAuditError) attention.push("task-run-audit-error");
    if (task && ["blocked", "failed"].includes(task.status)) attention.push(`task-${task.status}`);
    return {
      key: definition.key,
      taskId: taskId || null,
      associationStatus,
      taskStatus: task?.status || "missing",
      attention
    };
  });
  const attention = taskHealth.flatMap((task) => task.attention);
  return {
    profileId: profile.profileId,
    profileStatus: profile.status,
    updatedAt: profile.updatedAt,
    recoveryReadiness: profile.recoveryReadiness,
    associationStatus: attention.length ? "attention" : "ready",
    attention,
    tasks: taskHealth
  };
}

function assertDraftInput(input, agents) {
  if (!isRecord(input) || (input.template !== OPERATIONS_OBSERVATION_TEMPLATE && input.template !== FOUNDER_CONFIGURED_TEMPLATE)) throw new RangeError("profile must select operations-observation or founder-configured");
  if (!isId(input.profileId)) throw new TypeError("profileId must be a safe lowercase kebab-case identifier");
  const starter = input.template === OPERATIONS_OBSERVATION_TEMPLATE;
  const allowed = starter ? ["profileId", "template", "monitoringRecurrenceMinutes", "governanceRecurrenceMinutes"] : ["profileId", "template", "taskTemplates"];
  if (Object.keys(input).some((key) => !allowed.includes(key))) throw new TypeError("profile contains unsupported fields");
  if (starter) {
    if (!Number.isInteger(input.monitoringRecurrenceMinutes) || input.monitoringRecurrenceMinutes < 5 || input.monitoringRecurrenceMinutes > 1440) throw new RangeError("monitoringRecurrenceMinutes must be an integer from 5 to 1440");
    if (!Number.isInteger(input.governanceRecurrenceMinutes) || input.governanceRecurrenceMinutes < 60 || input.governanceRecurrenceMinutes > 10080) throw new RangeError("governanceRecurrenceMinutes must be an integer from 60 to 10080");
  } else {
    if (!Array.isArray(input.taskTemplates) || input.taskTemplates.length < 1 || input.taskTemplates.length > 20) throw new RangeError("taskTemplates must contain 1 through 20 approved task templates");
    assertCompatibleTemplates(input.taskTemplates, agents);
  }
}
function assertCompatibleTemplates(templates, agents) {
  const keys = new Set();
  for (const template of templates) {
    if (!isRecord(template) || Object.keys(template).some((key) => !["key", "action", "agentId", "recurrenceMinutes", "dependsOnTaskIds", "approvalRequired", "payload"].includes(key)) ||
      !isId(template.key) || keys.has(template.key) || !ACTIONS.has(template.action) || !isId(template.agentId) ||
      !Number.isInteger(template.recurrenceMinutes) || template.recurrenceMinutes < 1 || template.recurrenceMinutes > 10080 ||
      !Array.isArray(template.dependsOnTaskIds) || !template.dependsOnTaskIds.every(isUuid) || typeof template.approvalRequired !== "boolean") {
      throw new TypeError("task template has an invalid schema");
    }
    keys.add(template.key);
    const agent = agents.find((entry) => entry.id === template.agentId);
    if (!agent || !agent.enabled || agent.accountability?.status !== "active" || !agent.capabilities.includes(template.action)) throw new RangeError("task template must use an active registered role compatible with its action");
    if (["continuity.record", "source.catalog", "business.metric", "service.registry"].includes(template.action) && (!template.approvalRequired || template.agentId !== "project-memory-manager")) throw new RangeError("protected record task templates require founder approval and the Project Memory Manager");
    assertPayload(template.action, template.payload);
  }
}
function assertPayload(action, payload) {
  if (!isRecord(payload)) throw new TypeError("task template payload must be an object");
  if (NO_PAYLOAD_ACTIONS.has(action) && Object.keys(payload).length) throw new TypeError("this task action does not accept profile payload input");
  if (action === "memory.record") return assertFields(payload, ["kind", "content"], (value) => ["decision", "procedure", "semantic", "episodic"].includes(value.kind) && safeText(value.content, 500));
  if (action === "continuity.record") return assertFields(payload, ["sourceRecord", "summary"], (value) => isId(value.sourceRecord) && safeText(value.summary, 500));
  if (action === "source.catalog") return assertFields(payload, ["sourceId", "title", "sourceType", "classification", "sourceReference", "sha256"], (value) => isId(value.sourceId) && safeText(value.title, 200) && ["application", "dataset", "document", "media", "record", "other"].includes(value.sourceType) && ["public", "internal", "private", "restricted"].includes(value.classification) && safePath(value.sourceReference) && isHash(value.sha256));
  if (action === "business.metric") return assertFields(payload, ["period", "kind", "category", "amountCents", "sourceRecord"], (value) => /^20\d\d-(0[1-9]|1[0-2])$/.test(value.period) && ["revenue", "expense"].includes(value.kind) && (value.kind === "revenue" ? ["contracting-services", "product-sales", "subscriptions", "other-approved-revenue"] : ["materials", "labor", "software", "operations", "marketing", "professional-services", "other-approved-expense"]).includes(value.category) && Number.isSafeInteger(value.amountCents) && value.amountCents > 0 && isId(value.sourceRecord));
  if (action === "service.registry") return validateServiceRegistryInput(payload);
  if (action === "coordinate.record") return assertFields(payload, ["label", "sourceRecord", "originCheckpoint"], (value) => safeText(value.label, 120) && isId(value.sourceRecord) && isId(value.originCheckpoint));
}
function assertFields(value, fields, predicate) { if (Object.keys(value).length !== fields.length || fields.some((field) => !(field in value)) || !predicate(value)) throw new TypeError("task template payload does not match its approved structured schema"); }
function safeText(value, limit) { return typeof value === "string" && value.trim().length > 0 && value.trim().length <= limit && /^[A-Za-z0-9][A-Za-z0-9 .,:;()&'/-]*$/.test(value.trim()) && !SENSITIVE.test(value); }
function safePath(value) { return typeof value === "string" && value.length > 0 && value.length <= 500 && !value.includes("\\") && !value.startsWith("/") && !value.split("/").some((part) => !part || part === "." || part === ".."); }
function activationReadinessIssues(readiness) { return ["startupContext", "sourceCatalog", "businessMetrics", "serviceRegistry", "governance"].filter((key) => readiness?.[key]?.status !== "ready"); }
function assertActivationReadiness(readiness) { const blockers = activationReadinessIssues(readiness); if (blockers.length) throw new RangeError(`profile activation is blocked until ${blockers[0]} is ready`); }
function assertCompletedDependencies(templates, tasks) {
  const tasksById = new Map(tasks.map((task) => [task.id, task]));
  for (const template of templates) {
    const incompleteDependency = template.dependsOnTaskIds.find((taskId) =>
      tasksById.get(taskId)?.status !== "completed");
    if (incompleteDependency) {
      throw new RangeError(
        `profile task dependency must reference an existing completed task: ${incompleteDependency}`
      );
    }
  }
}
function matchesDefinition(task, definition) { return task.action === definition.action && task.agentId === definition.agentId && task.recurrenceMinutes === definition.recurrenceMinutes && JSON.stringify(task.dependsOn) === JSON.stringify(definition.dependsOnTaskIds) && task.approvalRequired === definition.approvalRequired && JSON.stringify(task.payload) === JSON.stringify(definition.payload); }
function summarizeTaskPlan(template) { return { key: template.key, action: template.action, agentId: template.agentId, recurrenceMinutes: template.recurrenceMinutes, dependsOnTaskIds: [...template.dependsOnTaskIds], approvalRequired: template.approvalRequired }; }
function validateRecords(records) {
  if (!Array.isArray(records)) throw new TypeError("automation profiles must contain records");
  let previousHash = null; const profiles = {};
  for (let index = 0; index < records.length; index += 1) {
    const record = records[index]; const prior = profiles[record?.profileId]; const templates = record?.taskTemplates || starterFromLegacy(record || {});
    const legacy = record?.taskTemplates === undefined;
    if (!record || record.schemaVersion !== AUTOMATION_PROFILE_SCHEMA_VERSION || !isUuid(record.id) || record.sequence !== index + 1 || !isTimestamp(record.recordedAt) || record.controller !== "founder" || !["draft-created", "activated", "paused", "resumed"].includes(record.event) || !isId(record.profileId) || ![OPERATIONS_OBSERVATION_TEMPLATE, FOUNDER_CONFIGURED_TEMPLATE].includes(record.template) || (legacy && record.template !== OPERATIONS_OBSERVATION_TEMPLATE) || !validTemplates(templates) || !isRecord(record.taskIds) || !["not-checked", "not-configured", "empty", "ready", "unavailable"].includes(record.recoveryReadiness) || record.previousHash !== previousHash || !isHash(record.hash) || record.hash !== hashRecord(record) || (record.event === "draft-created" && (prior || Object.keys(record.taskIds).length)) || (record.event === "activated" && (!prior || prior.status !== "draft" || !validTaskIds(record.taskIds, templates, legacy))) || (record.event === "paused" && (!prior || prior.status !== "active" || !same(record.taskIds, prior.taskIds))) || (record.event === "resumed" && (!prior || prior.status !== "paused" || !validTaskIds(record.taskIds, templates, legacy) || !same(record.taskIds, prior.taskIds)))) throw new TypeError("automation profile has an invalid record");
    profiles[record.profileId] = { ...record, taskTemplates: templates, status: record.event === "draft-created" ? "draft" : ["activated", "resumed"].includes(record.event) ? "active" : "paused" }; previousHash = record.hash;
  }
}
function validTemplates(templates) {
  try {
    if (!Array.isArray(templates) || templates.length < 1 || templates.length > 20) return false;
    const keys = new Set();
    for (const template of templates) {
      if (!isRecord(template) || !isId(template.key) || keys.has(template.key) || !ACTIONS.has(template.action) ||
        !isId(template.agentId) || !Number.isInteger(template.recurrenceMinutes) ||
        template.recurrenceMinutes < 1 || template.recurrenceMinutes > 10080 ||
        !Array.isArray(template.dependsOnTaskIds) || !template.dependsOnTaskIds.every(isUuid) ||
        typeof template.approvalRequired !== "boolean") return false;
      if (["continuity.record", "source.catalog", "business.metric", "service.registry"].includes(template.action) &&
        (!template.approvalRequired || template.agentId !== "project-memory-manager")) return false;
      keys.add(template.key);
      assertPayload(template.action, template.payload);
    }
    return true;
  } catch { return false; }
}
function validTaskIds(ids, templates, legacy) { return Object.keys(ids).length === templates.length && templates.every((template) => isUuid(ids[legacy ? template.action : template.key])); }
function same(left, right) { return JSON.stringify(left) === JSON.stringify(right); }
function isRecord(value) { return value !== null && typeof value === "object" && !Array.isArray(value); }
function isId(value) { return typeof value === "string" && /^[a-z][a-z0-9-]{2,79}$/.test(value.trim()); }
function isHash(value) { return typeof value === "string" && /^[a-f0-9]{64}$/i.test(value); }
function isTimestamp(value) { return typeof value === "string" && !Number.isNaN(Date.parse(value)); }
function isUuid(value) { return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value); }
function hashRecord(record) { const hashable = { schemaVersion: record.schemaVersion, id: record.id, sequence: record.sequence, recordedAt: record.recordedAt, controller: record.controller, event: record.event, profileId: record.profileId, template: record.template, taskIds: record.taskIds, recoveryReadiness: record.recoveryReadiness, previousHash: record.previousHash }; if (record.taskTemplates !== undefined) hashable.taskTemplates = record.taskTemplates; else { hashable.monitoringRecurrenceMinutes = record.monitoringRecurrenceMinutes; hashable.governanceRecurrenceMinutes = record.governanceRecurrenceMinutes; } return createHash("sha256").update(JSON.stringify(hashable)).digest("hex"); }
module.exports = { AUTOMATION_PROFILE_FILE_NAME, AUTOMATION_PROFILE_ID, AUTOMATION_PROFILE_SCHEMA_VERSION, OPERATIONS_OBSERVATION_TEMPLATE, FOUNDER_CONFIGURED_TEMPLATE, PROFILE_NOTICE, AutomationProfileService };
