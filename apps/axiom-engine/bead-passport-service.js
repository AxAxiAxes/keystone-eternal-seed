const { randomUUID } = require("crypto");
const fs = require("fs/promises");
const path = require("path");
const {
  GENESIS_CHECKPOINT,
  GENESIS_COORDINATE_ID,
  GENESIS_SOURCE_RECORD
} = require("./coordinate-service");

const HARMONIC_BANDS = new Set(["H1", "H2", "H3", "H4", "H5", "H6", "H7"]);
const GRAVITY_CENTER_ID = "axi-genesis-gravity-center";

class BeadPassportService {
  constructor({ directory, coordinateService, getAgent, now = () => new Date() }) {
    this.directory = directory;
    this.coordinateService = coordinateService;
    this.getAgent = getAgent;
    this.now = now;
    this.operationQueue = Promise.resolve();
  }

  async getGravityCenter() {
    const verification = await this.coordinateService.verify();
    const genesis = (await this.coordinateService.list(1_000))
      .find((coordinate) => coordinate.id === GENESIS_COORDINATE_ID);
    if (!genesis) {
      throw new RangeError("AXI Genesis coordinate is unavailable");
    }
    return {
      id: GRAVITY_CENTER_ID,
      status: "founder-recorded-reference",
      coordinateScheme: verification.scheme,
      genesisCoordinateId: genesis.id,
      genesisCoordinateHash: genesis.coordinateHash,
      sourceRecord: GENESIS_SOURCE_RECORD,
      originCheckpoint: GENESIS_CHECKPOINT,
      spatialVector: { x: 0, y: 0, z: 0 }
    };
  }

  async list(limit = 100) {
    if (!Number.isInteger(limit) || limit < 1 || limit > 1_000) {
      throw new RangeError("limit must be an integer between 1 and 1000");
    }
    return this.withPassports(
      async (passports) => passports.slice(-limit).reverse(),
      { persist: false }
    );
  }

  async register({ agentId, harmonicBand, spatialVector, originCheckpoint }) {
    if (!isNonEmptyString(agentId)) {
      throw new TypeError("bead passport agentId must be a non-empty string");
    }
    if (!HARMONIC_BANDS.has(harmonicBand)) {
      throw new TypeError("bead passport harmonicBand must be H1 through H7");
    }
    assertSpatialVector(spatialVector);
    if (!isNonEmptyString(originCheckpoint) ||
      !/^[a-z][a-z0-9-]{2,119}$/.test(originCheckpoint)) {
      throw new TypeError("bead passport originCheckpoint must be a lowercase kebab-case identifier");
    }
    const agent = await this.getAgent(agentId);
    const gravityCenter = await this.getGravityCenter();

    return this.withPassports(async (passports) => {
      if (passports.some((passport) => passport.agentId === agent.id)) {
        throw new RangeError(`agent already has a bead passport: ${agent.id}`);
      }
      const passportId = `BPN-${String(passports.length + 1).padStart(4, "0")}`;
      const coordinate = await this.coordinateService.create({
        label: `Register bead passport ${passportId}`,
        sourceRecord: GENESIS_SOURCE_RECORD,
        originCheckpoint
      });
      const passport = {
        id: randomUUID(),
        passportId,
        agentId: agent.id,
        gravityCenterId: gravityCenter.id,
        coordinateId: coordinate.id,
        coordinateHash: coordinate.coordinateHash,
        harmonicBand,
        spatialVector: { ...spatialVector },
        originCheckpoint,
        issuedAt: this.now().toISOString(),
        status: "active"
      };
      passports.push(passport);
      return passport;
    });
  }

  async verify() {
    const [gravityCenter, coordinates, passports] = await Promise.all([
      this.getGravityCenter(),
      this.coordinateService.list(1_000),
      this.withPassports(async (records) => records, { persist: false })
    ]);
    const coordinatesById = new Map(coordinates.map((coordinate) => [coordinate.id, coordinate]));
    const agentIds = new Set();
    const passportIds = new Set();
    for (const passport of passports) {
      if (!passport || !isNonEmptyString(passport.id) ||
        !isNonEmptyString(passport.passportId) || passportIds.has(passport.passportId) ||
        !isNonEmptyString(passport.agentId) || agentIds.has(passport.agentId) ||
        passport.gravityCenterId !== gravityCenter.id ||
        !HARMONIC_BANDS.has(passport.harmonicBand) ||
        !isValidSpatialVector(passport.spatialVector) ||
        !isNonEmptyString(passport.originCheckpoint) ||
        !isNonEmptyString(passport.issuedAt) || passport.status !== "active") {
        throw new TypeError("bead passport ledger contains an invalid record");
      }
      const coordinate = coordinatesById.get(passport.coordinateId);
      if (!coordinate || coordinate.coordinateHash !== passport.coordinateHash) {
        throw new RangeError(`bead passport coordinate link is invalid: ${passport.passportId}`);
      }
      agentIds.add(passport.agentId);
      passportIds.add(passport.passportId);
    }
    return {
      status: "ready",
      gravityCenterId: gravityCenter.id,
      passportCount: passports.length
    };
  }

  async status() {
    try {
      return await this.verify();
    } catch (error) {
      return {
        status: "invalid",
        gravityCenterId: GRAVITY_CENTER_ID,
        passportCount: 0
      };
    }
  }

  async withPassports(operation, { persist = true } = {}) {
    const queuedOperation = this.operationQueue.then(async () => {
      const passports = await this.readPassports();
      const result = await operation(passports);
      if (persist) {
        await this.writePassports(passports);
      }
      return result;
    });
    this.operationQueue = queuedOperation.catch(() => {});
    return queuedOperation;
  }

  async readPassports() {
    try {
      const contents = await fs.readFile(this.passportsPath(), "utf8");
      return contents.trim()
        ? contents.trim().split("\n").map((line) => JSON.parse(line))
        : [];
    } catch (error) {
      if (error.code === "ENOENT") {
        return [];
      }
      throw error;
    }
  }

  async writePassports(passports) {
    await fs.mkdir(this.directory, { recursive: true });
    const temporaryPath = `${this.passportsPath()}.${randomUUID()}.tmp`;
    await fs.writeFile(
      temporaryPath,
      `${passports.map((passport) => JSON.stringify(passport)).join("\n")}${passports.length ? "\n" : ""}`,
      "utf8"
    );
    await fs.rename(temporaryPath, this.passportsPath());
  }

  passportsPath() {
    return path.join(this.directory, "bead-passports.jsonl");
  }
}

function assertSpatialVector(value) {
  if (!isValidSpatialVector(value)) {
    throw new TypeError("bead passport spatialVector must contain finite x, y, and z values from -10000 to 10000");
  }
}

function isValidSpatialVector(value) {
  return value && ["x", "y", "z"].every((axis) =>
    typeof value[axis] === "number" && Number.isFinite(value[axis]) &&
    value[axis] >= -10_000 && value[axis] <= 10_000);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

module.exports = {
  BeadPassportService,
  GRAVITY_CENTER_ID,
  HARMONIC_BANDS
};
