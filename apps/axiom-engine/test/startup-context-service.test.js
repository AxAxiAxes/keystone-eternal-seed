const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { StartupContextService } = require("../startup-context-service");

test("seeds and retains the AXES memory-bank startup context", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-startup-context-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  let now = new Date("2026-09-10T12:00:00.000Z");
  const service = new StartupContextService({
    directory,
    now: () => now
  });

  const seeded = await service.initialize();
  assert.equal(seeded.status, "ready");
  assert.equal(seeded.id, "axes-memory-bank-startup-v1");
  assert.equal(seeded.startupCount, 1);
  assert.ok(seeded.sourceRecords.includes("docs/AXI_PROJECT_CONTEXT_CHECKPOINT.md"));

  now = new Date("2026-09-10T12:05:00.000Z");
  const resumed = await service.initialize();
  assert.equal(resumed.status, "ready");
  assert.equal(resumed.startupCount, 2);
  assert.equal(resumed.createdAt, "2026-09-10T12:00:00.000Z");
  assert.equal(resumed.lastStartedAt, "2026-09-10T12:05:00.000Z");
});

test("surfaces a version mismatch without replacing the retained context", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-startup-context-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  await fs.writeFile(path.join(directory, "startup-context.json"), JSON.stringify({
    schemaVersion: 1,
    id: "axes-memory-bank-startup-v1",
    version: "older-version",
    startupCount: 1,
    sourceRecords: []
  }));
  const service = new StartupContextService({ directory });

  const status = await service.initialize();
  assert.deepEqual(status, {
    status: "attention",
    code: "startup-context-version-mismatch",
    expectedId: "axes-memory-bank-startup-v1",
    expectedVersion: "2026-09-10",
    recordedId: "axes-memory-bank-startup-v1",
    recordedVersion: "older-version"
  });
  const retained = JSON.parse(await fs.readFile(path.join(directory, "startup-context.json"), "utf8"));
  assert.equal(retained.version, "older-version");
});

test("reports malformed retained state without replacing it", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-startup-context-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const statePath = path.join(directory, "startup-context.json");
  await fs.writeFile(statePath, "{not-json");
  const service = new StartupContextService({ directory });

  assert.deepEqual(await service.initialize(), {
    status: "attention",
    code: "startup-context-invalid",
    expectedId: "axes-memory-bank-startup-v1",
    expectedVersion: "2026-09-10"
  });
  assert.equal(await fs.readFile(statePath, "utf8"), "{not-json");
});

test("reseeds a missing bootstrap context from deployed startup context", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-startup-context-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const service = new StartupContextService({ directory });

  const status = await service.status();
  assert.equal(status.status, "ready");
  assert.equal(status.startupCount, 1);
  assert.equal(
    (await fs.stat(path.join(directory, "startup-context.json"))).isFile(),
    true
  );
});
