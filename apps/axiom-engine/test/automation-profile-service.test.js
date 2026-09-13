const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");
const test = require("node:test");
const {
  AUTOMATION_PROFILE_FILE_NAME,
  AutomationProfileService
} = require("../automation-profile-service");

function readyState(overrides = {}) {
  return {
    startupContext: { status: "ready" },
    sourceCatalog: { status: "ready" },
    businessMetrics: { status: "ready" },
    serviceRegistry: { status: "ready" },
    governance: { status: "ready" },
    recovery: { status: "not-configured" },
    ...overrides
  };
}

function fixture(directory, readiness = () => readyState()) {
  const tasks = [];
  const agents = [
    ["memory-curator", ["memory.record"]],
    ["project-memory-manager", ["memory.record", "continuity.record", "source.catalog", "business.metric", "service.registry"]],
    ["automation-executor", ["automation.noop"]],
    ["automation-auditor", ["memory.record", "automation.noop"]],
    ["operations-observer", ["monitoring.snapshot", "governance.readiness", "recovery.backup", "coordinate.record", "continuity.checkpoint"]]
  ].map(([id, capabilities]) => ({ id, capabilities, enabled: true, accountability: { status: "active" } }));
  return {
    tasks,
    service: new AutomationProfileService({
      directory,
      readiness,
      listAgents: async () => agents,
      listTasks: async () => tasks,
      createTask: async (task) => {
        const created = { id: randomUUID(), ...task };
        tasks.push(created);
        return created;
      }
    })
  };
}

test("creates, activates once, and pauses the exact operations-observation schedule", async (t) => {
  const directory = path.join(process.cwd(), `automation-profile-test-${process.pid}-${Date.now()}`);
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const { service, tasks } = fixture(directory);

  const draft = await service.createDraft({
    profileId: "private-observation",
    template: "operations-observation",
    monitoringRecurrenceMinutes: 5,
    governanceRecurrenceMinutes: 10080
  });

  assert.equal(draft.status, "draft");
  assert.equal((await service.status()).activeProfileCount, 0);

  const active = await service.activate("private-observation", { confirmed: true });
  assert.equal(active.status, "active");
  assert.equal(active.recoveryReadiness, "not-configured");
  assert.equal(tasks.length, 2);
  assert.deepEqual(tasks.map((task) => ({
    action: task.action, agentId: task.agentId, recurrenceMinutes: task.recurrenceMinutes
  })), [
    { action: "monitoring.snapshot", agentId: "operations-observer", recurrenceMinutes: 5 },
    { action: "governance.readiness", agentId: "operations-observer", recurrenceMinutes: 10080 }
  ]);
  await assert.rejects(
    () => service.activate("private-observation", { confirmed: true }),
    /only draft profiles/
  );
  assert.equal(tasks.length, 2);
  assert.equal(await service.isTaskProcessingAllowed(tasks[0].id), true);
  service.listTasks = async () => { throw new Error("task list must not be re-read during processing"); };
  assert.equal(await service.isTaskProcessingAllowed(tasks[0].id, tasks), true);
  service.listTasks = async () => tasks;
  tasks[0].automationProfileKey = "unexpected-key";
  assert.equal(await service.isTaskProcessingAllowed(tasks[0].id), false);
  tasks[0].automationProfileKey = "monitoring-snapshot";
  tasks.push({ ...tasks[0], id: randomUUID() });
  assert.equal(await service.isTaskProcessingAllowed(tasks[0].id), false);
  tasks.pop();

  const paused = await service.pause("private-observation", { confirmed: true });
  assert.equal(paused.status, "paused");
  assert.equal(await service.isTaskProcessingAllowed(tasks[0].id), false);
  assert.equal(await service.isTaskProcessingAllowed(randomUUID()), true);
  await assert.rejects(
    () => service.resume("private-observation", { confirmed: false }),
    /founder confirmation/
  );
  const resumed = await service.resume("private-observation", { confirmed: true });
  assert.equal(resumed.status, "active");
  assert.deepEqual(resumed.taskIds, active.taskIds);
  assert.equal(tasks.length, 2);
  assert.equal(await service.isTaskProcessingAllowed(tasks[0].id), true);
  assert.deepEqual(await service.history(), [
    { sequence: 4, recordedAt: resumed.updatedAt, event: "resumed", profileId: "private-observation", template: "operations-observation", taskCount: 2, recoveryReadiness: "not-configured" },
    { sequence: 3, recordedAt: paused.updatedAt, event: "paused", profileId: "private-observation", template: "operations-observation", taskCount: 2, recoveryReadiness: "not-configured" },
    { sequence: 2, recordedAt: active.updatedAt, event: "activated", profileId: "private-observation", template: "operations-observation", taskCount: 2, recoveryReadiness: "not-configured" },
    { sequence: 1, recordedAt: draft.updatedAt, event: "draft-created", profileId: "private-observation", template: "operations-observation", taskCount: 0, recoveryReadiness: "not-checked" }
  ]);
});

test("creates the continuity-protection schedule for monitoring, governance, checkpoint, and recovery", async (t) => {
  const directory = path.join(process.cwd(), `automation-profile-test-${process.pid}-${Date.now()}`);
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const { service, tasks } = fixture(directory);

  const draft = await service.createDraft({
    profileId: "continuity-protection",
    template: "continuity-protection",
    monitoringRecurrenceMinutes: 5,
    governanceRecurrenceMinutes: 60,
    checkpointRecurrenceMinutes: 1440,
    recoveryRecurrenceMinutes: 1440
  });

  assert.equal(draft.status, "draft");
  assert.equal((await service.preview({
    profileId: "continuity-preview",
    template: "continuity-protection",
    monitoringRecurrenceMinutes: 5,
    governanceRecurrenceMinutes: 60,
    checkpointRecurrenceMinutes: 1440,
    recoveryRecurrenceMinutes: 1440
  })).taskPlan.length, 4);

  const active = await service.activate("continuity-protection", { confirmed: true });
  assert.equal(active.status, "active");
  assert.deepEqual(tasks.map((task) => ({
    action: task.action,
    agentId: task.agentId,
    recurrenceMinutes: task.recurrenceMinutes
  })), [
    { action: "monitoring.snapshot", agentId: "operations-observer", recurrenceMinutes: 5 },
    { action: "governance.readiness", agentId: "operations-observer", recurrenceMinutes: 60 },
    { action: "continuity.checkpoint", agentId: "operations-observer", recurrenceMinutes: 1440 },
    { action: "recovery.backup", agentId: "operations-observer", recurrenceMinutes: 1440 }
  ]);
});

test("exposes every active role capability and activates a founder-configured template", async (t) => {
  const directory = path.join(process.cwd(), `automation-profile-test-${process.pid}-${Date.now()}`);
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const { service, tasks } = fixture(directory);
  const generic = (await service.list()).templates.find((template) => template.id === "founder-configured");
  assert.equal(generic.roles.length, 5);
  assert.ok(generic.roles.find((role) => role.agentId === "operations-observer").capabilities.includes("governance.readiness"));
  await service.createDraft({
    profileId: "curator-memory-profile", template: "founder-configured",
    taskTemplates: [{ key: "record-memory", action: "memory.record", agentId: "memory-curator",
      recurrenceMinutes: 60, dependsOnTaskIds: [], approvalRequired: false,
      payload: { kind: "decision", content: "Approved private operational observation." } }]
  });

  const active = await service.activate("curator-memory-profile", { confirmed: true });
  assert.equal(active.status, "active");
  assert.equal(tasks[0].agentId, "memory-curator");
  assert.equal(tasks[0].automationProfileKey, "record-memory");
  await assert.rejects(() => service.createDraft({
    profileId: "incompatible-role", template: "founder-configured",
    taskTemplates: [{ key: "bad-action", action: "monitoring.snapshot", agentId: "memory-curator",
      recurrenceMinutes: 60, dependsOnTaskIds: [], approvalRequired: false, payload: {} }]
  }), /active registered role compatible/);
  await assert.rejects(() => service.createDraft({
    profileId: "unstructured-input", template: "founder-configured",
    taskTemplates: [{ key: "bad-input", action: "memory.record", agentId: "memory-curator",
      recurrenceMinutes: 60, dependsOnTaskIds: [], approvalRequired: false,
      payload: { kind: "decision", content: "Customer account details" } }]
  }), /approved structured schema/);
});

test("previews a profile without creating a draft or task", async (t) => {
  const directory = path.join(process.cwd(), `automation-profile-test-${process.pid}-${Date.now()}`);
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const { service, tasks } = fixture(directory);

  const preview = await service.preview({
    profileId: "preview-observation",
    template: "operations-observation",
    monitoringRecurrenceMinutes: 5,
    governanceRecurrenceMinutes: 60
  });

  assert.equal(preview.activation.status, "ready");
  assert.deepEqual(preview.activation.blockers, []);
  assert.equal(preview.taskPlan.length, 2);
  assert.equal("payload" in preview.taskPlan[0], false);
  assert.equal(tasks.length, 0);
  assert.equal((await service.status()).profileCount, 0);
});

test("requires profile dependencies to be existing completed tasks", async (t) => {
  const directory = path.join(process.cwd(), `automation-profile-test-${process.pid}-${Date.now()}`);
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const { service, tasks } = fixture(directory);
  const incompleteDependency = randomUUID();
  const input = {
    profileId: "dependency-profile", template: "founder-configured",
    taskTemplates: [{ key: "dependent-noop", action: "automation.noop",
      agentId: "automation-executor", recurrenceMinutes: 60,
      dependsOnTaskIds: [incompleteDependency], approvalRequired: false, payload: {} }]
  };

  await assert.rejects(
    () => service.preview(input),
    /existing completed task/
  );
  await assert.rejects(
    () => service.createDraft(input),
    /existing completed task/
  );
  tasks.push({ id: incompleteDependency, status: "completed" });
  const preview = await service.preview(input);
  assert.equal(preview.activation.status, "ready");
  assert.equal((await service.createDraft(input)).status, "draft");
});

test("reports payload-free profile task association health without writing state", async (t) => {
  const directory = path.join(process.cwd(), `automation-profile-test-${process.pid}-${Date.now()}`);
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const { service, tasks } = fixture(directory);
  await service.createDraft({
    profileId: "profile-health", template: "operations-observation",
    monitoringRecurrenceMinutes: 5, governanceRecurrenceMinutes: 60
  });
  await service.activate("profile-health", { confirmed: true });
  tasks[0].status = "pending";
  tasks[1].status = "blocked";
  tasks[1].lastAuditError = "private audit write failure";
  const profilePath = path.join(directory, AUTOMATION_PROFILE_FILE_NAME);
  const before = await fs.readFile(profilePath, "utf8");

  const health = await service.health();

  assert.equal(await fs.readFile(profilePath, "utf8"), before);
  assert.equal(health.profiles.length, 1);
  assert.equal(health.profiles[0].associationStatus, "attention");
  assert.equal(health.profiles[0].tasks[0].associationStatus, "matching");
  assert.equal(health.profiles[0].tasks[0].taskStatus, "pending");
  assert.deepEqual(health.profiles[0].tasks[1].attention, ["task-run-audit-error", "task-blocked"]);
  assert.equal("payload" in health.profiles[0].tasks[0], false);

  tasks[1].automationProfileKey = "wrong-key";
  const mismatched = await service.health();
  assert.ok(mismatched.profiles[0].tasks[1].attention.includes("missing-association"));
});

test("rejects unsupported templates, unsafe inputs, missing confirmation, and incomplete activation readiness", async (t) => {
  const directory = path.join(process.cwd(), `automation-profile-test-${process.pid}-${Date.now()}`);
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const { service } = fixture(directory, () => readyState({ sourceCatalog: { status: "attention" } }));
  await assert.rejects(() => service.createDraft({
    profileId: "bad profile", template: "operations-observation",
    monitoringRecurrenceMinutes: 5, governanceRecurrenceMinutes: 60
  }), /safe lowercase/);
  await assert.rejects(() => service.createDraft({
    profileId: "wrong-template", template: "anything-else",
    monitoringRecurrenceMinutes: 5, governanceRecurrenceMinutes: 60
  }), /operations-observation, continuity-protection, or founder-configured/);
  await assert.rejects(() => service.createDraft({
    profileId: "too-fast", template: "operations-observation",
    monitoringRecurrenceMinutes: 4, governanceRecurrenceMinutes: 59
  }), /monitoringRecurrenceMinutes/);
  await service.createDraft({
    profileId: "readiness-hold", template: "operations-observation",
    monitoringRecurrenceMinutes: 5, governanceRecurrenceMinutes: 60
  });
  await assert.rejects(() => service.activate("readiness-hold", { confirmed: false }), /confirmation/);
  await assert.rejects(() => service.activate("readiness-hold", { confirmed: true }), /sourceCatalog/);
  const preview = await service.preview({
    profileId: "readiness-preview", template: "operations-observation",
    monitoringRecurrenceMinutes: 5, governanceRecurrenceMinutes: 60
  });
  assert.deepEqual(preview.activation.blockers, ["sourceCatalog"]);
});

test("reports tampering as attention and blocks profile-managed processing", async (t) => {
  const directory = path.join(process.cwd(), `automation-profile-test-${process.pid}-${Date.now()}`);
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const { service } = fixture(directory);
  await service.createDraft({
    profileId: "tamper-test", template: "operations-observation",
    monitoringRecurrenceMinutes: 5, governanceRecurrenceMinutes: 60
  });
  const profilePath = path.join(directory, AUTOMATION_PROFILE_FILE_NAME);
  await fs.appendFile(profilePath, "{\"tampered\":true}\n", "utf8");
  assert.deepEqual((await service.status()).status, "attention");
  assert.equal(await service.isTaskProcessingAllowed(randomUUID()), false);
});
