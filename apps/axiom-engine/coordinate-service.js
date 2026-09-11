const { createHash, randomUUID } = require("crypto");
const fs = require("fs/promises");
const path = require("path");

const COORDINATE_SCHEME = "axi-origin-coordinate-v1";
const GENESIS_COORDINATE_ID = "axi-genesis-coordinate";
const GENESIS_SOURCE_RECORD = "KEYSTONE-ORIGIN-000001";
const GENESIS_CHECKPOINT = "axi-genesis-creator-ownership";
const GENESIS_OCCURRED_AT = "2026-05-30T03:14:00.000Z";

class CoordinateService {
  constructor({ directory, now = () => new Date() }) {
    this.directory = directory;
    this.now = now;
    this.operationQueue = Promise.resolve();
  }

  async list(limit = 100) {
    if (!Number.isInteger(limit) || limit < 1 || limit > 1_000) {
      throw new RangeError("limit must be an integer between 1 and 1000");
    }
    return this.withCoordinates(async (coordinates) => coordinates.slice(-limit).reverse());
  }

  async create({
    label,
    occurredAt,
    sourceRecord = GENESIS_SOURCE_RECORD,
    originCheckpoint = GENESIS_CHECKPOINT
  }) {
    if (!isNonEmptyString(label) || label.trim().length > 200) {
      throw new TypeError("coordinate label must be a non-empty string up to 200 characters");
    }
    if (!isNonEmptyString(sourceRecord) || !/^[A-Z][A-Z0-9-]{2,119}$/.test(sourceRecord)) {
      throw new TypeError("coordinate sourceRecord must be an uppercase identifier");
    }
    if (!isNonEmptyString(originCheckpoint) ||
      !/^[a-z][a-z0-9-]{2,119}$/.test(originCheckpoint)) {
      throw new TypeError("coordinate originCheckpoint must be a lowercase kebab-case identifier");
    }
    const coordinateTime = occurredAt === undefined ? this.now() : new Date(occurredAt);
    if (Number.isNaN(coordinateTime.valueOf())) {
      throw new TypeError("coordinate occurredAt must be an ISO-8601 date");
    }

    return this.withCoordinates(async (coordinates) => {
      const parent = coordinates.at(-1);
      const coordinate = {
        scheme: COORDINATE_SCHEME,
        id: randomUUID(),
        sequence: coordinates.length,
        label: label.trim(),
        occurredAt: coordinateTime.toISOString(),
        recordedAt: this.now().toISOString(),
        sourceRecord,
        originCheckpoint,
        parentCoordinateHash: parent.coordinateHash
      };
      coordinate.coordinateHash = calculateCoordinateHash(coordinate);
      coordinates.push(coordinate);
      return coordinate;
    });
  }

  async verify() {
    return this.withCoordinates(async (coordinates) => {
      validateCoordinates(coordinates);
      const latest = coordinates.at(-1);
      return {
        status: "ready",
        scheme: COORDINATE_SCHEME,
        coordinateCount: coordinates.length,
        genesisCoordinateId: GENESIS_COORDINATE_ID,
        latestCoordinateId: latest.id,
        latestCoordinateHash: latest.coordinateHash
      };
    });
  }

  async status() {
    try {
      return await this.verify();
    } catch (error) {
      return {
        status: "invalid",
        scheme: COORDINATE_SCHEME,
        coordinateCount: 0
      };
    }
  }

  async withCoordinates(operation) {
    const queuedOperation = this.operationQueue.then(async () => {
      const coordinates = await this.readCoordinates();
      const result = await operation(coordinates);
      await this.writeCoordinates(coordinates);
      return result;
    });
    this.operationQueue = queuedOperation.catch(() => {});
    return queuedOperation;
  }

  async readCoordinates() {
    try {
      const contents = await fs.readFile(this.coordinatesPath(), "utf8");
      const coordinates = contents.trim()
        ? contents.trim().split("\n").map((line) => JSON.parse(line))
        : [];
      if (coordinates.length === 0) {
        return [createGenesisCoordinate(this.now)];
      }
      return coordinates;
    } catch (error) {
      if (error.code === "ENOENT") {
        return [createGenesisCoordinate(this.now)];
      }
      throw error;
    }
  }

  async writeCoordinates(coordinates) {
    await fs.mkdir(this.directory, { recursive: true });
    const temporaryPath = `${this.coordinatesPath()}.${randomUUID()}.tmp`;
    await fs.writeFile(
      temporaryPath,
      `${coordinates.map((coordinate) => JSON.stringify(coordinate)).join("\n")}\n`,
      "utf8"
    );
    await fs.rename(temporaryPath, this.coordinatesPath());
  }

  coordinatesPath() {
    return path.join(this.directory, "coordinates.jsonl");
  }
}

function createGenesisCoordinate(now) {
  const coordinate = {
    scheme: COORDINATE_SCHEME,
    id: GENESIS_COORDINATE_ID,
    sequence: 0,
    label: "AXI founder-recorded Genesis coordinate",
    occurredAt: GENESIS_OCCURRED_AT,
    recordedAt: now().toISOString(),
    sourceRecord: GENESIS_SOURCE_RECORD,
    originCheckpoint: GENESIS_CHECKPOINT,
    parentCoordinateHash: null
  };
  coordinate.coordinateHash = calculateCoordinateHash(coordinate);
  return coordinate;
}

function validateCoordinates(coordinates) {
  if (!Array.isArray(coordinates) || coordinates.length === 0) {
    throw new TypeError("coordinate ledger is empty");
  }
  for (const [index, coordinate] of coordinates.entries()) {
    if (!coordinate || coordinate.scheme !== COORDINATE_SCHEME ||
      !isNonEmptyString(coordinate.id) || coordinate.sequence !== index ||
      !isNonEmptyString(coordinate.label) || !isValidDate(coordinate.occurredAt) ||
      !isValidDate(coordinate.recordedAt) ||
      !isNonEmptyString(coordinate.sourceRecord) ||
      !isNonEmptyString(coordinate.originCheckpoint) ||
      !/^[a-f0-9]{64}$/.test(coordinate.coordinateHash)) {
      throw new TypeError("coordinate ledger contains an invalid record");
    }
    const expectedParentHash = index === 0 ? null : coordinates[index - 1].coordinateHash;
    if (coordinate.parentCoordinateHash !== expectedParentHash ||
      coordinate.coordinateHash !== calculateCoordinateHash(coordinate)) {
      throw new RangeError(`coordinate chain validation failed at sequence ${index}`);
    }
  }
  const genesis = coordinates[0];
  if (genesis.id !== GENESIS_COORDINATE_ID ||
    genesis.sourceRecord !== GENESIS_SOURCE_RECORD ||
    genesis.originCheckpoint !== GENESIS_CHECKPOINT ||
    genesis.occurredAt !== GENESIS_OCCURRED_AT) {
    throw new RangeError("coordinate ledger does not begin with the AXI Genesis coordinate");
  }
}

function calculateCoordinateHash(coordinate) {
  return createHash("sha256").update(JSON.stringify({
    scheme: coordinate.scheme,
    id: coordinate.id,
    sequence: coordinate.sequence,
    label: coordinate.label,
    occurredAt: coordinate.occurredAt,
    recordedAt: coordinate.recordedAt,
    sourceRecord: coordinate.sourceRecord,
    originCheckpoint: coordinate.originCheckpoint,
    parentCoordinateHash: coordinate.parentCoordinateHash
  })).digest("hex");
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidDate(value) {
  return isNonEmptyString(value) && !Number.isNaN(new Date(value).valueOf());
}

module.exports = {
  COORDINATE_SCHEME,
  CoordinateService,
  GENESIS_CHECKPOINT,
  GENESIS_COORDINATE_ID,
  GENESIS_OCCURRED_AT,
  GENESIS_SOURCE_RECORD,
  calculateCoordinateHash
};
