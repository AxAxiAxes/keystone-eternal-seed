const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const {
  CREATION_RECORD_ID,
  CREATION_RECORD_NOTICE,
  CREATOR_AUTHORITY,
  CreationRecordService
} = require("../creation-record-service");

function sampleEntry(overrides = {}) {
  return {
    title: "Temple of Love architecture concept",
    kind: "concept",
    summary: "Distilled architectural design concept for Project Eternal Seed.",
    sourceRecord: "approved-creation-2026-09-001",
    ...overrides
  };
}

test("persists approved hash-linked creation records with fixed creator attribution", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-creation-record-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const service = new CreationRecordService({
    directory,
    now: () => new Date("2026-09-18T08:00:00.000Z")
  });

  assert.equal((await service.initialize()).recordCount, 0);
  const first = await service.record(sampleEntry());
  const second = await service.record(sampleEntry({
    title: "Seven-gear sphere model",
    kind: "design",
    sourceRecord: "approved-creation-2026-09-002"
  }));

  assert.equal(first.sequence, 1);
  assert.equal(first.reviewStatus, "operator-approved");
  assert.equal(first.creatorAuthority, CREATOR_AUTHORITY);
  assert.equal(second.previousHash, first.hash);
  assert.match(second.hash, /^[a-f0-9]{64}$/);

  const status = await service.status();
  assert.equal(status.id, CREATION_RECORD_ID);
  assert.equal(status.recordCount, 2);
  assert.equal(status.label, CREATION_RECORD_NOTICE);
  assert.equal(status.latestRecord.sourceRecord, "approved-creation-2026-09-002");

  const recent = await service.list();
  assert.equal(recent.label, CREATION_RECORD_NOTICE);
  assert.deepEqual(recent.entries.map((entry) => entry.sequence), [2, 1]);

  const summary = await service.summary();
  assert.equal(summary.recordCount, 2);
  assert.equal(summary.creatorAuthority, CREATOR_AUTHORITY);
  assert.deepEqual(summary.totalsByKind, { concept: 1, design: 1 });
});

test("rejects malformed, duplicate, unsafe, and tampered creation history", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-creation-record-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const service = new CreationRecordService({ directory });
  await service.record(sampleEntry());

  await assert.rejects(() => service.record(sampleEntry()), /sourceRecord already exists/);
  await assert.rejects(
    () => service.record(sampleEntry({ title: "", sourceRecord: "approved-creation-2" })),
    /title must be a non-empty string/
  );
  await assert.rejects(
    () => service.record(sampleEntry({ kind: "invention", sourceRecord: "approved-creation-3" })),
    /kind must be one of/
  );
  await assert.rejects(
    () => service.record(sampleEntry({ summary: "", sourceRecord: "approved-creation-4" })),
    /summary must be a non-empty string/
  );
  await assert.rejects(
    () => service.record(sampleEntry({ sourceRecord: "invoice-123", note: "prohibited" })),
    /unsupported fields/
  );
  await assert.rejects(
    () => service.record(sampleEntry({ sourceRecord: "Customer Name" })),
    /sourceRecord must be a non-sensitive/
  );
  await assert.rejects(
    () => service.record(sampleEntry({ sourceRecord: "invoice-123" })),
    /sourceRecord must be a non-sensitive/
  );

  const statePath = path.join(directory, "creation-record.jsonl");
  const original = await fs.readFile(statePath, "utf8");
  await fs.writeFile(statePath, original.replace("concept", "design"));
  assert.deepEqual(await service.status(), {
    status: "attention",
    code: "creation-record-invalid",
    expectedId: CREATION_RECORD_ID,
    expectedSchemaVersion: 1,
    label: CREATION_RECORD_NOTICE
  });
  await assert.rejects(() => service.summary(), /creation record has an invalid entry/);
});
