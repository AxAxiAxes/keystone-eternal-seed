const assert = require("node:assert/strict");
const test = require("node:test");
const fs = require("fs/promises");
const os = require("os");
const path = require("path");
const { MemoryStore } = require("../memory-store");

async function withTempDirectory(run) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-memory-test-"));
  try {
    await run(directory);
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
}

test("persists recorded entries to disk and survives a fresh MemoryStore instance", async () => {
  await withTempDirectory(async (directory) => {
    const first = new MemoryStore(directory);
    await first.record({
      kind: "episodic",
      content: "Hello AXIOM",
      metadata: { role: "user", source: "chat" }
    });
    await first.record({
      kind: "episodic",
      content: "Hello from AXIOM.",
      metadata: { role: "assistant", source: "chat" }
    });

    // A brand new instance pointed at the same directory simulates a
    // process restart / redeploy reading back durable state.
    const second = new MemoryStore(directory);
    const entries = await second.list("episodic", 10);

    assert.equal(entries.length, 2);
    // list() returns newest-first.
    assert.equal(entries[0].content, "Hello from AXIOM.");
    assert.equal(entries[1].content, "Hello AXIOM");
    assert.equal(entries[0].metadata.role, "assistant");
    assert.equal(typeof entries[0].recordedAt, "string");
    assert.equal(typeof entries[0].id, "string");
  });
});

test("list() returns an empty array when no entries have been recorded yet", async () => {
  await withTempDirectory(async (directory) => {
    const store = new MemoryStore(directory);
    assert.deepEqual(await store.list("episodic", 10), []);
  });
});

test("list() bounds results to the requested limit, keeping only the most recent entries", async () => {
  await withTempDirectory(async (directory) => {
    const store = new MemoryStore(directory);
    for (let i = 0; i < 5; i += 1) {
      await store.record({ kind: "episodic", content: `turn-${i}` });
    }

    const limited = await store.list("episodic", 2);
    assert.deepEqual(limited.map((entry) => entry.content), ["turn-4", "turn-3"]);
  });
});

test("list() rejects an unsupported kind or an out-of-range limit", async () => {
  await withTempDirectory(async (directory) => {
    const store = new MemoryStore(directory);
    await assert.rejects(() => store.list("not-a-kind", 10), RangeError);
    await assert.rejects(() => store.list("episodic", 0), RangeError);
    await assert.rejects(() => store.list("episodic", 101), RangeError);
  });
});

test("record() validates kind, content, and metadata", async () => {
  await withTempDirectory(async (directory) => {
    const store = new MemoryStore(directory);
    await assert.rejects(
      () => store.record({ kind: "not-a-kind", content: "hi" }),
      RangeError
    );
    await assert.rejects(
      () => store.record({ kind: "episodic", content: "   " }),
      TypeError
    );
    await assert.rejects(
      () => store.record({ kind: "episodic", content: "hi", metadata: "bad" }),
      TypeError
    );
  });
});

test("writeIdentity/readIdentity round-trip, and reading missing identity returns null", async () => {
  await withTempDirectory(async (directory) => {
    const store = new MemoryStore(directory);
    assert.equal(await store.readIdentity(), null);

    const written = await store.writeIdentity({
      name: "AXIOM",
      summary: "Public assistant for Axes Contracting"
    });
    assert.equal(written.name, "AXIOM");
    assert.equal(typeof written.updatedAt, "string");

    const readBack = await store.readIdentity();
    assert.deepEqual(readBack, written);
  });
});
