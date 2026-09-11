const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const {
  CONTINUITY_RECORD_ID,
  ContinuityRecordService
} = require("../continuity-record-service");

test("persists a hash-linked continuity record across restarts", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-continuity-record-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  let now = new Date("2026-09-11T07:30:00.000Z");
  const service = new ContinuityRecordService({ directory, now: () => now });

  const initialized = await service.initialize();
  assert.equal(initialized.status, "ready");
  assert.equal(initialized.id, CONTINUITY_RECORD_ID);
  assert.equal(initialized.recordCount, 2);
  assert.equal(initialized.latestRecord.eventType, "runtime-started");

  now = new Date("2026-09-11T07:35:00.000Z");
  const confirmation = await service.recordOperatorConfirmation({
    sourceRecord: "docs/memory/README.md",
    summary: "Operator confirmed the approved continuity basis."
  });
  assert.equal(confirmation.sequence, 3);

  const resumed = await service.initialize();
  assert.equal(resumed.status, "ready");
  assert.equal(resumed.recordCount, 4);
  const entries = await service.list(10);
  assert.deepEqual(entries.map((entry) => entry.eventType), [
    "runtime-started",
    "operator-confirmed",
    "runtime-started",
    "continuity-initialized"
  ]);
  assert.equal(entries[0].previousHash, entries[1].hash);
});

test("surfaces a tampered continuity record without changing it", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-continuity-record-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const service = new ContinuityRecordService({ directory });
  await service.initialize();
  const statePath = path.join(directory, "continuity-record.jsonl");
  const original = await fs.readFile(statePath, "utf8");
  await fs.writeFile(statePath, original.replace("Private AXI runtime started.", "Tampered."));

  assert.deepEqual(await service.status(), {
    status: "attention",
    code: "continuity-record-invalid",
    expectedId: "axi-continuity-record-v1",
    expectedSchemaVersion: 1
  });
  assert.equal(await fs.readFile(statePath, "utf8"), original.replace(
    "Private AXI runtime started.",
    "Tampered."
  ));
});

test("rejects unsupported and oversized continuity entries", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-continuity-record-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const service = new ContinuityRecordService({ directory });
  await service.initialize();

  await assert.rejects(
    () => service.record({
      eventType: "unbounded",
      sourceRecord: "test",
      summary: "This must not be accepted."
    }),
    /unsupported continuity event type/
  );
  await assert.rejects(
    () => service.recordOperatorConfirmation({
      sourceRecord: "test",
      summary: "x".repeat(501)
    }),
    /summary must be a non-empty string up to 500 characters/
  );
});
