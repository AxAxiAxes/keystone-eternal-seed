const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const {
  StorageUsageService,
  directoryUsage,
  parseWarningBytes
} = require("../storage-usage-service");

test("measures private AXI storage without capping memory", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axi-storage-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  await fs.writeFile(path.join(directory, "first.txt"), "first");
  await fs.mkdir(path.join(directory, "nested"));
  await fs.writeFile(path.join(directory, "nested", "second.txt"), "second");

  assert.deepEqual(await directoryUsage(directory), { fileCount: 2, usedBytes: 11 });
  const status = await new StorageUsageService({ directory, warningBytes: 10 }).status();
  assert.equal(status.status, "attention");
  assert.equal(status.usedBytes, 11);
  assert.equal(status.fileCount, 2);
  assert.equal(status.warningBytes, 10);
  assert.ok(["available", "unavailable"].includes(status.filesystem.status));
  assert.equal((await new StorageUsageService({ directory }).status()).status, "ready");
});

test("rejects malformed storage warning configuration", () => {
  assert.equal(parseWarningBytes(undefined), null);
  assert.equal(parseWarningBytes("123"), 123);
  assert.throws(() => parseWarningBytes("12.5"), /positive integer/);
});
