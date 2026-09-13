const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const {
  CoordinateService,
  GENESIS_COORDINATE_ID
} = require("../coordinate-service");

test("creates a deterministic coordinate chain from the founder-recorded Genesis reference", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-coordinates-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const service = new CoordinateService({
    directory,
    now: () => new Date("2026-09-10T00:00:00.000Z")
  });

  const [genesis] = await service.list();
  assert.equal(genesis.id, GENESIS_COORDINATE_ID);
  assert.equal(genesis.sequence, 0);
  assert.equal(genesis.parentCoordinateHash, null);

  const coordinate = await service.create({
    label: "Record reset recovery checkpoint",
    occurredAt: "2026-09-10T01:00:00.000Z",
    originCheckpoint: "axi-reset-recovery"
  });
  assert.equal(coordinate.sequence, 1);
  assert.equal(coordinate.parentCoordinateHash, genesis.coordinateHash);
  assert.match(coordinate.coordinateHash, /^[a-f0-9]{64}$/);

  const verification = await service.verify();
  assert.equal(verification.status, "ready");
  assert.equal(verification.coordinateCount, 2);
  assert.equal(verification.latestCoordinateId, coordinate.id);
});

test("detects a changed coordinate chain without silently repairing it", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-coordinates-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const service = new CoordinateService({ directory });
  await service.create({ label: "Record a coordinate transition" });
  const coordinatePath = path.join(directory, "coordinates.jsonl");
  const coordinates = (await fs.readFile(coordinatePath, "utf8")).trim()
    .split("\n").map((line) => JSON.parse(line));
  coordinates[1].label = "Modified after recording";
  await fs.writeFile(
    coordinatePath,
    `${coordinates.map((coordinate) => JSON.stringify(coordinate)).join("\n")}\n`,
    "utf8"
  );

  await assert.rejects(
    () => service.verify(),
    (error) => error instanceof RangeError &&
      error.message === "coordinate chain validation failed at sequence 1"
  );
  assert.equal((await service.status()).status, "invalid");
});
