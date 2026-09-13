const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const {
  SERVICE_REGISTRY_ID,
  SERVICE_REGISTRY_NOTICE,
  ServiceRegistryService
} = require("../service-registry-service");

function entry(overrides = {}) {
  return {
    operation: "register",
    serviceId: "axes-control-center",
    serviceName: "AXES Control Center",
    purpose: "Private operational planning metadata",
    stage: "planned",
    classification: "internal",
    ownerRole: "founder",
    dependencySummary: "Private engine readiness and founder review",
    ...overrides
  };
}

test("maintains a private append-only service registry", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-service-registry-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const service = new ServiceRegistryService({
    directory,
    now: () => new Date("2026-09-11T08:00:00.000Z")
  });

  await t.test("initializes and creates a hash-linked registration", async () => {
    const initial = await service.initialize();
    assert.equal(initial.id, SERVICE_REGISTRY_ID);
    assert.equal(initial.recordCount, 0);
    assert.equal(initial.label, SERVICE_REGISTRY_NOTICE);

    const registered = await service.record(entry());
    assert.equal(registered.sequence, 1);
    assert.equal(registered.revision, 1);
    assert.equal(registered.reviewStatus, "operator-approved");
    assert.equal(registered.previousHash, null);
    assert.match(registered.hash, /^[a-f0-9]{64}$/);
  });

  await t.test("retains revisions and returns a service-id-sorted projection", async () => {
    const revision = await service.record(entry({
      operation: "update",
      stage: "internal",
      purpose: "Private operational metadata review"
    }));
    assert.equal(revision.revision, 2);
    assert.equal(revision.previousHash.length, 64);
    for (const stage of ["pilot", "active", "paused", "retired"]) {
      await service.record(entry({
        operation: "update",
        stage,
        purpose: "Private operational metadata review"
      }));
    }

    await service.record(entry({
      operation: "register",
      serviceId: "axiom-engine",
      serviceName: "AXIOM Engine",
      stage: "internal"
    }));
    const records = await service.list(3);
    assert.deepEqual(records.entries.map((record) => record.sequence), [7, 6, 5]);
    const projection = await service.projection();
    assert.deepEqual(Object.keys(projection.services), ["axes-control-center", "axiom-engine"]);
    assert.equal(projection.services["axes-control-center"].revision, 6);
    assert.equal(projection.services["axes-control-center"].stage, "retired");
    assert.match(projection.label, /internal planning and operating metadata only/);
    await assert.rejects(() => service.record(entry({
      operation: "update",
      stage: "paused",
      purpose: "Private operational metadata review"
    })), /invalid stage transition/);
  });
});

test("rejects invalid inputs, transitions, duplicates, and retained tampering", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-service-registry-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const service = new ServiceRegistryService({ directory });
  await service.record(entry());

  await t.test("rejects bad and extra payload fields", async () => {
    await assert.rejects(() => service.record(entry({ ownerRole: "operator" })), /ownerRole must be founder/);
    await assert.rejects(() => service.record(entry({ serviceId: "Bad ID" })), /serviceId must be lowercase/);
    await assert.rejects(() => service.record(entry({ purpose: "Available at https://example.test" })), /non-sensitive bounded/);
    await assert.rejects(() => service.record(entry({ note: "not accepted" })), /unsupported fields/);
  });

  await t.test("rejects duplicate registration, unknown revisions, and invalid transitions", async () => {
    await assert.rejects(() => service.record(entry()), /already exists/);
    await assert.rejects(() => service.record(entry({
      operation: "update", serviceId: "missing-service", stage: "internal"
    })), /does not exist/);
    await assert.rejects(() => service.record(entry({ operation: "update", stage: "active" })), /invalid stage transition/);
  });

  await t.test("surfaces attention and blocks reads when history is tampered", async () => {
    const file = path.join(directory, "service-registry.jsonl");
    const original = await fs.readFile(file, "utf8");
    await fs.writeFile(file, original.replace("planned", "active"));
    assert.deepEqual(await service.status(), {
      status: "attention",
      code: "service-registry-invalid",
      expectedId: SERVICE_REGISTRY_ID,
      expectedSchemaVersion: 1,
      label: SERVICE_REGISTRY_NOTICE
    });
    await assert.rejects(() => service.projection(), /service registry has an invalid entry/);
  });
});
