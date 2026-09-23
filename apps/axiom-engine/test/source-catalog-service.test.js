const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const {
  CHAT_ATTACHMENT_MAX_FILES,
  CHAT_ATTACHMENT_MAX_TOTAL_BYTES,
  SOURCE_CATALOG_ID,
  SOURCE_TYPES,
  CLASSIFICATIONS,
  SourceCatalogService,
  describeOptions
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

test("describes every supported sourceType/classification option and field constraint", () => {
  const options = describeOptions({ maxUploadBytes: 5 * 1024 * 1024 });
  assert.deepEqual(new Set(options.sourceTypes), SOURCE_TYPES);
  assert.deepEqual(new Set(options.classifications), CLASSIFICATIONS);
  assert.equal(options.reviewStatus, "operator-approved");
  assert.ok(options.fields.sourceReference.includes(".."));
  assert.equal(options.upload.route, "POST /system/source-catalog/uploads");
  assert.equal(options.upload.auth, "admin (HTTP Basic)");
  assert.equal(options.upload.maxBytes, 5 * 1024 * 1024);
  assert.ok(options.notes.some((note) => note.includes("operator approval")));
});

test("stores uploaded file bytes locally and returns a computed sha256 sourceReference", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-source-catalog-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const service = new SourceCatalogService({ directory });

  const buffer = Buffer.from("hello uploaded world");
  const stored = await service.storeUpload({ buffer, filename: "report.PDF" });

  assert.match(stored.sourceReference, /^uploads\/[0-9a-f-]{36}\.pdf$/);
  assert.equal(stored.size, buffer.length);
  assert.equal(
    stored.sha256,
    require("node:crypto").createHash("sha256").update(buffer).digest("hex")
  );
  assert.equal(stored.originalFilename, "report.PDF");

  const storedBytes = await fs.readFile(path.join(directory, stored.sourceReference));
  assert.deepEqual(storedBytes, buffer);
});

test("sanitizes a malicious upload filename to only a safe extension", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-source-catalog-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const service = new SourceCatalogService({ directory });

  const stored = await service.storeUpload({
    buffer: Buffer.from("payload"),
    filename: "../../../etc/passwd.sh"
  });
  assert.match(stored.sourceReference, /^uploads\/[0-9a-f-]{36}\.sh$/);

  const noExtension = await service.storeUpload({
    buffer: Buffer.from("payload"),
    filename: "no-extension-name"
  });
  assert.match(noExtension.sourceReference, /^uploads\/[0-9a-f-]{36}$/);

  await assert.rejects(
    () => service.storeUpload({ buffer: Buffer.alloc(0), filename: "empty.txt" }),
    /uploaded file must be a non-empty buffer/
  );
});

test("prepares supported chat attachments and reports unsupported files honestly", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-source-catalog-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const service = new SourceCatalogService({ directory });

  const textBuffer = Buffer.from("first line\nsecond line");
  const imageBuffer = Buffer.from("not really an image");
  const textUpload = await service.storeUpload({ buffer: textBuffer, filename: "notes.txt" });
  const imageUpload = await service.storeUpload({ buffer: imageBuffer, filename: "photo.png" });

  const prepared = await service.prepareChatAttachments([
    {
      sourceReference: textUpload.sourceReference,
      sha256: textUpload.sha256,
      size: textUpload.size,
      originalFilename: "notes.txt",
      mimeType: "text/plain"
    },
    {
      sourceReference: imageUpload.sourceReference,
      sha256: imageUpload.sha256,
      size: imageUpload.size,
      originalFilename: "photo.png",
      mimeType: "image/png"
    }
  ]);

  assert.equal(prepared[0].status, "processed");
  assert.equal(prepared[0].text, "first line\nsecond line");
  assert.match(prepared[0].detail, /Read/);
  assert.equal(prepared[1].status, "failed");
  assert.match(prepared[1].detail, /tested vision path/);
});

test("rejects chat attachment metadata that escapes uploads, mismatches hashes, or exceeds limits", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-source-catalog-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const service = new SourceCatalogService({ directory });
  const upload = await service.storeUpload({ buffer: Buffer.from("hello"), filename: "notes.txt" });

  await assert.rejects(
    () => service.prepareChatAttachments([{
      sourceReference: "../outside.txt",
      sha256: upload.sha256,
      size: upload.size,
      originalFilename: "notes.txt",
      mimeType: "text/plain"
    }]),
    /sourceReference must be an uploads/
  );

  await assert.rejects(
    () => service.prepareChatAttachments([{
      sourceReference: upload.sourceReference,
      sha256: "b".repeat(64),
      size: upload.size,
      originalFilename: "notes.txt",
      mimeType: "text/plain"
    }]),
    /integrity check failed/
  );

  const tooManyAttachments = Array.from({ length: CHAT_ATTACHMENT_MAX_FILES + 1 }, (_, index) => ({
    sourceReference: upload.sourceReference,
    sha256: upload.sha256,
    size: upload.size,
    originalFilename: `notes-${index}.txt`,
    mimeType: "text/plain"
  }));
  await assert.rejects(
    () => service.prepareChatAttachments(tooManyAttachments),
    new RegExp(`at most ${CHAT_ATTACHMENT_MAX_FILES}`)
  );

  await assert.rejects(
    () => service.prepareChatAttachments([{
      sourceReference: upload.sourceReference,
      sha256: upload.sha256,
      size: CHAT_ATTACHMENT_MAX_TOTAL_BYTES + 1,
      originalFilename: "notes.txt",
      mimeType: "text/plain"
    }]),
    /must not exceed/
  );
});
