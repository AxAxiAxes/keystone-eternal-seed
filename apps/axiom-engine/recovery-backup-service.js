const { createHash, randomUUID } = require("crypto");
const fs = require("fs/promises");
const path = require("path");
const { PERSISTED_FILE_NAMES } = require("./checkpoint-service");

const BACKUP_SCHEMA_VERSION = 1;
const BACKUP_FILE_SUFFIX = ".axi-recovery.json";

class RecoveryBackupService {
  constructor({
    sourceDirectory,
    backupDirectory,
    restoreDirectory,
    now = () => new Date()
  }) {
    this.sourceDirectory = sourceDirectory;
    this.backupDirectory = backupDirectory;
    this.restoreDirectory = restoreDirectory;
    this.now = now;
  }

  async create() {
    await this.ensureConfiguredDirectory();
    const createdAt = this.now().toISOString();
    const files = await Promise.all((await this.sourceFilePaths()).map(async (filePath) => {
      const contents = await fs.readFile(path.join(this.sourceDirectory, filePath));
      return {
        path: filePath,
        bytes: contents.length,
        sha256: sha256(contents),
        contentBase64: contents.toString("base64")
      };
    }));
    const bundle = {
      schemaVersion: BACKUP_SCHEMA_VERSION,
      id: randomUUID(),
      createdAt,
      files
    };
    assertValidBundle(bundle);
    const backupPath = path.join(this.backupDirectory, this.fileName(bundle));
    const temporaryPath = `${backupPath}.${randomUUID()}.tmp`;
    await fs.writeFile(temporaryPath, JSON.stringify(bundle), "utf8");
    await fs.rename(temporaryPath, backupPath);
    return summarizeBundle(bundle);
  }

  async status() {
    if (!this.backupDirectory) {
      return {
        status: "not-configured",
        backupCount: 0,
        latestBackup: null
      };
    }
    try {
      await this.ensureConfiguredDirectory();
      const names = (await this.backupFileNames()).sort().reverse();
      if (names.length === 0) {
        return {
          status: "empty",
          backupCount: 0,
          latestBackup: null
        };
      }
      const latestBundle = await this.readBundleFile(names[0]);
      assertValidBundle(latestBundle);
      return {
        status: "ready",
        backupCount: names.length,
        latestBackup: summarizeBundle(latestBundle)
      };
    } catch (error) {
      return {
        status: "unavailable",
        backupCount: 0,
        latestBackup: null
      };
    }
  }

  async list(limit = 20) {
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new RangeError("limit must be an integer between 1 and 100");
    }
    await this.ensureConfiguredDirectory();
    const names = await this.backupFileNames();
    return Promise.all(names
      .sort()
      .reverse()
      .slice(0, limit)
      .map(async (name) => {
        const bundle = await this.readBundleFile(name);
        assertValidBundle(bundle);
        return summarizeBundle(bundle);
      }));
  }

  async verify(backupId) {
    if (!isUuid(backupId)) {
      throw new TypeError("backupId must be a UUID");
    }
    await this.ensureConfiguredDirectory();
    const name = (await this.backupFileNames()).find((entry) =>
      entry.endsWith(`-${backupId}${BACKUP_FILE_SUFFIX}`));
    if (!name) {
      throw new RangeError(`backup does not exist: ${backupId}`);
    }
    const bundle = await this.readBundleFile(name);
    assertValidBundle(bundle);
    return {
      ...summarizeBundle(bundle),
      verifiedAt: this.now().toISOString(),
      integrity: "verified"
    };
  }

  async restore(backupId) {
    if (!isUuid(backupId)) {
      throw new TypeError("backupId must be a UUID");
    }
    await this.ensureConfiguredDirectory();
    await this.ensureRestoreDirectory();
    const name = (await this.backupFileNames()).find((entry) =>
      entry.endsWith(`-${backupId}${BACKUP_FILE_SUFFIX}`));
    if (!name) {
      throw new RangeError(`backup does not exist: ${backupId}`);
    }
    const bundle = await this.readBundleFile(name);
    assertValidBundle(bundle);

    const destination = path.join(this.restoreDirectory, bundle.id);
    try {
      await fs.mkdir(destination);
    } catch (error) {
      if (error.code === "EEXIST") {
        throw new RangeError(`recovery destination already exists for backup: ${backupId}`);
      }
      throw error;
    }
    for (const file of bundle.files) {
      const destinationPath = path.join(destination, file.path);
      await fs.mkdir(path.dirname(destinationPath), { recursive: true });
      const temporaryPath = `${destinationPath}.${randomUUID()}.tmp`;
      await fs.writeFile(temporaryPath, Buffer.from(file.contentBase64, "base64"));
      await fs.rename(temporaryPath, destinationPath);
    }
    return {
      ...summarizeBundle(bundle),
      restoredAt: this.now().toISOString(),
      recoveryId: bundle.id
    };
  }

  async sourceFilePaths() {
    const files = [];
    for (const name of PERSISTED_FILE_NAMES) {
      if (await isFile(path.join(this.sourceDirectory, name))) {
        files.push(name);
      }
    }
    const checkpointDirectory = path.join(this.sourceDirectory, "checkpoints");
    try {
      const checkpointNames = await fs.readdir(checkpointDirectory);
      for (const name of checkpointNames) {
        if (name.endsWith(".json") && await isFile(path.join(checkpointDirectory, name))) {
          files.push(path.posix.join("checkpoints", name));
        }
      }
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }
    return files.sort();
  }

  async backupFileNames() {
    const names = await fs.readdir(this.backupDirectory);
    return names.filter((name) => name.endsWith(BACKUP_FILE_SUFFIX));
  }

  async readBundleFile(name) {
    return JSON.parse(await fs.readFile(path.join(this.backupDirectory, name), "utf8"));
  }

  fileName(bundle) {
    return `${bundle.createdAt.replace(/[:.]/g, "-")}-${bundle.id}${BACKUP_FILE_SUFFIX}`;
  }

  async ensureConfiguredDirectory() {
    if (!isNonEmptyString(this.backupDirectory)) {
      throw new RangeError(
        "AXIOM_BACKUP_DIRECTORY must be configured to a distinct recovery location"
      );
    }
    if (pathsOverlap(this.sourceDirectory, this.backupDirectory)) {
      throw new RangeError(
        "AXIOM_BACKUP_DIRECTORY must not be the memory directory or one of its subdirectories"
      );
    }
    await fs.mkdir(this.backupDirectory, { recursive: true });
  }

  async ensureRestoreDirectory() {
    if (!isNonEmptyString(this.restoreDirectory)) {
      throw new RangeError(
        "AXIOM_RECOVERY_RESTORE_DIRECTORY must be configured to an isolated restore location"
      );
    }
    if (pathsOverlap(this.sourceDirectory, this.restoreDirectory) ||
      pathsOverlap(this.backupDirectory, this.restoreDirectory)) {
      throw new RangeError(
        "AXIOM_RECOVERY_RESTORE_DIRECTORY must be distinct from memory and backup locations"
      );
    }
    await fs.mkdir(this.restoreDirectory, { recursive: true });
  }
}

function summarizeBundle(bundle) {
  return {
    id: bundle.id,
    createdAt: bundle.createdAt,
    fileCount: bundle.files.length,
    totalBytes: bundle.files.reduce((total, file) => total + file.bytes, 0)
  };
}

function assertValidBundle(bundle) {
  if (!bundle || bundle.schemaVersion !== BACKUP_SCHEMA_VERSION || !isUuid(bundle.id) ||
    !isNonEmptyString(bundle.createdAt) || !Array.isArray(bundle.files)) {
    throw new TypeError("backup bundle has an invalid shape");
  }
  if (bundle.files.length === 0) {
    throw new RangeError("backup bundle must contain at least one runtime file");
  }
  for (const file of bundle.files) {
    if (!file || !isSafeSourcePath(file.path) || !Number.isInteger(file.bytes) ||
      file.bytes < 0 || !/^[a-f0-9]{64}$/.test(file.sha256) ||
      !isNonEmptyString(file.contentBase64)) {
      throw new TypeError("backup bundle contains an invalid file record");
    }
    const contents = Buffer.from(file.contentBase64, "base64");
    if (contents.length !== file.bytes || sha256(contents) !== file.sha256) {
      throw new RangeError(`backup integrity check failed: ${file.path}`);
    }
  }
}

function isSafeSourcePath(filePath) {
  return PERSISTED_FILE_NAMES.includes(filePath) ||
    /^checkpoints\/[^/]+\.json$/.test(filePath);
}

function pathsOverlap(sourceDirectory, backupDirectory) {
  const source = path.resolve(sourceDirectory);
  const backup = path.resolve(backupDirectory);
  return source === backup || source.startsWith(`${backup}${path.sep}`) ||
    backup.startsWith(`${source}${path.sep}`);
}

async function isFile(filePath) {
  try {
    return (await fs.stat(filePath)).isFile();
  } catch (error) {
    if (error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

function sha256(contents) {
  return createHash("sha256").update(contents).digest("hex");
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isUuid(value) {
  return typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

module.exports = {
  BACKUP_FILE_SUFFIX,
  BACKUP_SCHEMA_VERSION,
  RecoveryBackupService
};
