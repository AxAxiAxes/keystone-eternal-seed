const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { CheckpointService } = require("../checkpoint-service");

test("creates a checksummed portable checkpoint without secrets", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-checkpoint-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  await fs.writeFile(path.join(directory, "identity.json"), "{\"name\":\"AXI\"}");
  await fs.writeFile(
    path.join(directory, "startup-context.json"),
    "{\"id\":\"axes-memory-bank-startup-v1\"}"
  );
  await fs.writeFile(path.join(directory, "automation.json"), "{\"tasks\":[]}");

  const service = new CheckpointService({
    directory,
    modules: [{ id: "memory", version: "1" }],
    now: () => new Date("2026-09-10T00:00:00.000Z")
  });
  const checkpoint = await service.create();

  assert.equal(checkpoint.schemaVersion, 1);
  assert.equal(checkpoint.modules[0].id, "memory");
  assert.deepEqual(
    checkpoint.files.map((file) => file.path),
    ["identity.json", "startup-context.json", "automation.json"]
  );
  assert.match(checkpoint.files[0].sha256, /^[a-f0-9]{64}$/);
  assert.equal(JSON.stringify(checkpoint).includes("OPENAI_API_KEY"), false);

  const listed = await service.list();
  assert.deepEqual(listed, [checkpoint]);
});
