const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const {
  SOURCE_CATALOG_ID,
  SourceCatalogService
} = require("../source-catalog-service");

function sampleEntry(overrides = {}) {
  return {
    sourceId: "axes-business-plan",
    title: "AXES business plan",
    sourceType: "document",
    classification: "internal",
    sourceReference: "docs/AXES_BUSINESS_PLAN.md",
    sha256: "a".repeat(64),
    ...overrides
  };
}

test("records approved source metadata in a hash-linked private catalog", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-source-catalog-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const service = new SourceCatalogService({
    directory,
    now: () => new Date("2026-09-11T08:00:00.000Z")
  });

  assert.deepEqual(await service.initialize(), {
    status: "ready",
    id: SOURCE_CATALOG_ID,
    schemaVersion: 1,
    sourceCount: 0,
    classifications: { public: 0, internal: 0, private: 0, restricted: 0 },
    latestSource: null
  });

  const entry = await service.record(sampleEntry());
  assert.equal(entry.sequence, 1);
  assert.equal(entry.reviewStatus, "operator-approved");
  assert.equal(entry.sha256, "a".repeat(64));
  assert.equal(entry.previousHash, null);
  assert.match(entry.hash, /^[a-f0-9]{64}$/);

  const second = await service.record(sampleEntry({
    sourceId: "axi-memory-service",
    title: "AXI persistent memory service",
    sourceReference: "docs/AXI_MEMORY_SERVICE.md",
    classification: "private",
    sha256: "B".repeat(64)
  }));
  assert.equal(second.sha256, "b".repeat(64));
  assert.equal(second.previousHash, entry.hash);

  const status = await service.status();
  assert.equal(status.sourceCount, 2);
  assert.deepEqual(status.classifications, {
    public: 0,
    internal: 1,
    private: 1,
    restricted: 0
  });
  assert.equal(status.latestSource.sourceId, "axi-memory-service");
  assert.equal((await service.list())[0].sourceId, "axi-memory-service");
});

test("rejects unsafe entries and preserves malformed catalog history", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-source-catalog-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const service = new SourceCatalogService({ directory });
  await service.record(sampleEntry());

  await assert.rejects(
    () => service.record(sampleEntry()),
    /sourceId already exists/
  );
  await assert.rejects(
    () => service.record(sampleEntry({ sourceReference: "../outside.md" })),
    /sourceReference must be a repository-relative path/
  );
  await assert.rejects(
    () => service.record({ ...sampleEntry(), content: "raw content is prohibited" }),
    /source catalog entry contains unsupported fields/
  );

  const statePath = path.join(directory, "source-catalog.jsonl");
  const original = await fs.readFile(statePath, "utf8");
  await fs.writeFile(statePath, original.replace("AXES business plan", "Tampered title"));
  assert.deepEqual(await service.status(), {
    status: "attention",
    code: "source-catalog-invalid",
    expectedId: SOURCE_CATALOG_ID,
    expectedSchemaVersion: 1
  });
  assert.equal(await fs.readFile(statePath, "utf8"), original.replace(
    "AXES business plan",
    "Tampered title"
  ));
});
