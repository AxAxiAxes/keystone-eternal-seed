const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { BeadPassportService, GRAVITY_CENTER_ID } = require("../bead-passport-service");
const { CoordinateService } = require("../coordinate-service");

async function createService(t) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-bead-passports-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const coordinateService = new CoordinateService({
    directory,
    now: () => new Date("2026-09-10T00:00:00.000Z")
  });
  const agents = new Map([[
    "operations-observer",
    { id: "operations-observer", name: "Operations Observer" }
  ]]);
  return {
    directory,
    coordinateService,
    service: new BeadPassportService({
      directory,
      coordinateService,
      getAgent: async (agentId) => {
        const agent = agents.get(agentId);
        if (!agent) {
          throw new RangeError(`registered agent does not exist: ${agentId}`);
        }
        return agent;
      },
      now: () => new Date("2026-09-10T01:00:00.000Z")
    })
  };
}

test("registers an internal AXI agent as a bead-passport node linked to the gravity center", async (t) => {
  const { directory, service } = await createService(t);

  const gravityCenter = await service.getGravityCenter();
  assert.equal(gravityCenter.id, GRAVITY_CENTER_ID);
  assert.deepEqual(gravityCenter.spatialVector, { x: 0, y: 0, z: 0 });

  const passport = await service.register({
    agentId: "operations-observer",
    harmonicBand: "H4",
    spatialVector: { x: 14.22, y: -3.88, z: 7.01 },
    originCheckpoint: "axi-bead-passport-pilot"
  });
  assert.equal(passport.passportId, "BPN-0001");
  assert.equal(passport.gravityCenterId, GRAVITY_CENTER_ID);
  assert.equal(passport.harmonicBand, "H4");
  assert.deepEqual(passport.spatialVector, { x: 14.22, y: -3.88, z: 7.01 });
  assert.match(passport.coordinateHash, /^[a-f0-9]{64}$/);

  assert.deepEqual(await service.verify(), {
    status: "ready",
    gravityCenterId: GRAVITY_CENTER_ID,
    passportCount: 1
  });
  assert.deepEqual(await service.list(), [passport]);
  assert.ok(await fs.stat(path.join(directory, "bead-passports.jsonl")));

  await assert.rejects(
    () => service.register({
      agentId: "operations-observer",
      harmonicBand: "H4",
      spatialVector: { x: 0, y: 0, z: 0 },
      originCheckpoint: "axi-bead-passport-pilot"
    }),
    /agent already has a bead passport/
  );
});

test("rejects malformed nodes and reports an altered coordinate link without repairing it", async (t) => {
  const { directory, service } = await createService(t);
  await assert.rejects(
    () => service.register({
      agentId: "operations-observer",
      harmonicBand: "H8",
      spatialVector: { x: 0, y: 0, z: 0 },
      originCheckpoint: "axi-bead-passport-pilot"
    }),
    /harmonicBand/
  );
  await service.register({
    agentId: "operations-observer",
    harmonicBand: "H2",
    spatialVector: { x: 0, y: 0, z: 0 },
    originCheckpoint: "axi-bead-passport-pilot"
  });
  const passportPath = path.join(directory, "bead-passports.jsonl");
  const [passport] = (await fs.readFile(passportPath, "utf8")).trim()
    .split("\n").map((line) => JSON.parse(line));
  passport.coordinateHash = "0".repeat(64);
  await fs.writeFile(passportPath, `${JSON.stringify(passport)}\n`, "utf8");

  await assert.rejects(() => service.verify(), /bead passport coordinate link is invalid/);
  assert.deepEqual(await service.status(), {
    status: "invalid",
    gravityCenterId: GRAVITY_CENTER_ID,
    passportCount: 0
  });
});
