const fs = require("fs/promises");
const path = require("path");

class StorageUsageService {
  constructor({ directory, warningBytes = process.env.AXIOM_MEMORY_WARNING_BYTES }) {
    this.directory = directory;
    this.warningBytes = parseWarningBytes(warningBytes);
  }

  async status() {
    try {
      await fs.mkdir(this.directory, { recursive: true });
      const usage = await directoryUsage(this.directory);
      const filesystem = await filesystemUsage(this.directory);
      const warningReached = this.warningBytes !== null &&
        usage.usedBytes >= this.warningBytes;
      return {
        status: warningReached ? "attention" : "ready",
        usedBytes: usage.usedBytes,
        fileCount: usage.fileCount,
        warningBytes: this.warningBytes,
        filesystem
      };
    } catch (error) {
      return {
        status: "unavailable",
        code: "memory-storage-inspection-failed"
      };
    }
  }
}

async function directoryUsage(directory) {
  let usedBytes = 0;
  let fileCount = 0;
  const entries = await fs.readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      const nested = await directoryUsage(entryPath);
      usedBytes += nested.usedBytes;
      fileCount += nested.fileCount;
    } else if (entry.isFile()) {
      try {
        usedBytes += (await fs.stat(entryPath)).size;
        fileCount += 1;
      } catch (error) {
        // Atomic state replacement can remove a temporary file after readdir.
        if (error.code !== "ENOENT") throw error;
      }
    }
  }
  return { usedBytes, fileCount };
}

async function filesystemUsage(directory) {
  if (typeof fs.statfs !== "function") return { status: "unavailable" };
  try {
    const stats = await fs.statfs(directory);
    const blockSize = Number(stats.bsize);
    return {
      status: "available",
      totalBytes: Number(stats.blocks) * blockSize,
      availableBytes: Number(stats.bavail) * blockSize
    };
  } catch {
    return { status: "unavailable" };
  }
}

function parseWarningBytes(value) {
  if (value === undefined || value === "") return null;
  if (!/^[1-9][0-9]*$/.test(String(value)) ||
    !Number.isSafeInteger(Number(value))) {
    throw new RangeError("AXIOM_MEMORY_WARNING_BYTES must be a positive integer");
  }
  return Number(value);
}

module.exports = {
  StorageUsageService,
  directoryUsage,
  parseWarningBytes
};
