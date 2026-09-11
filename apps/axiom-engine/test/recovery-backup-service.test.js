const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { RecoveryBackupService } = require("../recovery-backup-service");

test("creates, verifies, and restores a private runtime timeline bundle", async (t) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-recovery-"));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const sourceDirectory = path.join(root, "memory");
  const backupDirectory = path.join(root, "backups");
  const restoreDirectory = path.join(root, "restored");
  await fs.mkdir(path.join(sourceDirectory, "checkpoints"), { recursive: true });
  await fs.writeFile(path.join(sourceDirectory, "identity.json"), "{\"name\":\"AXI\"}");
  await fs.writeFile(
    path.join(sourceDirectory, "startup-context.json"),
    "{\"id\":\"axes-memory-bank-startup-v1\"}"
  );
  await fs.writeFile(
    path.join(sourceDirectory, "continuity-record.jsonl"),
    "{\"sequence\":1,\"eventType\":\"continuity-initialized\"}\n"
  );
  await fs.writeFile(
    path.join(sourceDirectory, "source-catalog.jsonl"),
    "{\"sequence\":1,\"sourceId\":\"axi-memory-service\"}\n"
  );
  await fs.writeFile(
    path.join(sourceDirectory, "business-metrics.jsonl"),
    "{\"sequence\":1,\"kind\":\"revenue\",\"amountCents\":12500}\n"
  );
  await fs.writeFile(path.join(sourceDirectory, "decision.jsonl"), "{\"event\":\"origin\"}\n");
  await fs.writeFile(
    path.join(sourceDirectory, "coordinates.jsonl"),
    "{\"scheme\":\"axi-origin-coordinate-v1\",\"sequence\":0}\n"
  );
  await fs.writeFile(
    path.join(sourceDirectory, "bead-passports.jsonl"),
    "{\"passportId\":\"BPN-0001\",\"agentId\":\"operations-observer\"}\n"
  );
  await fs.writeFile(
    path.join(sourceDirectory, "checkpoints", "2026-09-10-checkpoint.json"),
    "{\"checkpoint\":1}"
  );

  const service = new RecoveryBackupService({
    sourceDirectory,
    backupDirectory,
    restoreDirectory,
    now: () => new Date("2026-09-10T00:00:00.000Z")
  });
  assert.deepEqual(await service.status(), {
    status: "empty",
    backupCount: 0,
    latestBackup: null
  });

  const backup = await service.create();
  assert.equal(backup.createdAt, "2026-09-10T00:00:00.000Z");
  assert.equal(backup.fileCount, 9);
  assert.ok(backup.totalBytes > 0);
  assert.deepEqual(await service.status(), {
    status: "ready",
    backupCount: 1,
    latestBackup: backup
  });
  assert.deepEqual(await service.list(), [backup]);

  const verification = await service.verify(backup.id);
  assert.equal(verification.integrity, "verified");
  assert.equal(verification.id, backup.id);

  const restored = await service.restore(backup.id);
  assert.equal(restored.recoveryId, backup.id);
  assert.equal(
    await fs.readFile(path.join(restoreDirectory, backup.id, "identity.json"), "utf8"),
    "{\"name\":\"AXI\"}"
  );
  assert.equal(
    await fs.readFile(path.join(restoreDirectory, backup.id, "startup-context.json"), "utf8"),
    "{\"id\":\"axes-memory-bank-startup-v1\"}"
  );
  assert.equal(
    await fs.readFile(path.join(restoreDirectory, backup.id, "continuity-record.jsonl"), "utf8"),
    "{\"sequence\":1,\"eventType\":\"continuity-initialized\"}\n"
  );
  assert.equal(
    await fs.readFile(path.join(restoreDirectory, backup.id, "source-catalog.jsonl"), "utf8"),
    "{\"sequence\":1,\"sourceId\":\"axi-memory-service\"}\n"
  );
  assert.equal(
    await fs.readFile(path.join(restoreDirectory, backup.id, "business-metrics.jsonl"), "utf8"),
    "{\"sequence\":1,\"kind\":\"revenue\",\"amountCents\":12500}\n"
  );
  assert.equal(
    await fs.readFile(
      path.join(restoreDirectory, backup.id, "checkpoints", "2026-09-10-checkpoint.json"),
      "utf8"
    ),
    "{\"checkpoint\":1}"
  );
  assert.equal(
    await fs.readFile(path.join(restoreDirectory, backup.id, "coordinates.jsonl"), "utf8"),
    "{\"scheme\":\"axi-origin-coordinate-v1\",\"sequence\":0}\n"
  );
  assert.equal(
    await fs.readFile(path.join(restoreDirectory, backup.id, "bead-passports.jsonl"), "utf8"),
    "{\"passportId\":\"BPN-0001\",\"agentId\":\"operations-observer\"}\n"
  );
  await assert.rejects(
    () => service.restore(backup.id),
    (error) => error instanceof RangeError &&
      error.message === `recovery destination already exists for backup: ${backup.id}`
  );
});

test("fails closed for unsafe or corrupted recovery storage", async (t) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-recovery-"));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const sourceDirectory = path.join(root, "memory");
  const backupDirectory = path.join(root, "backups");
  await fs.mkdir(sourceDirectory);
  await fs.writeFile(path.join(sourceDirectory, "identity.json"), "{\"name\":\"AXI\"}");

  const missing = new RecoveryBackupService({ sourceDirectory });
  await assert.rejects(
    () => missing.create(),
    (error) => error instanceof RangeError &&
      error.message.includes("AXIOM_BACKUP_DIRECTORY")
  );

  const unsafe = new RecoveryBackupService({
    sourceDirectory,
    backupDirectory: path.join(sourceDirectory, "backups")
  });
  await assert.rejects(
    () => unsafe.create(),
    (error) => error instanceof RangeError &&
      error.message.includes("must not be the memory directory")
  );

  const service = new RecoveryBackupService({ sourceDirectory, backupDirectory });
  const backup = await service.create();
  const file = (await fs.readdir(backupDirectory))[0];
  const bundle = JSON.parse(await fs.readFile(path.join(backupDirectory, file), "utf8"));
  bundle.files[0].contentBase64 = Buffer.from("tampered").toString("base64");
  await fs.writeFile(path.join(backupDirectory, file), JSON.stringify(bundle), "utf8");

  await assert.rejects(
    () => service.verify(backup.id),
    (error) => error instanceof RangeError &&
      error.message === "backup integrity check failed: identity.json"
  );
  assert.equal((await service.status()).status, "unavailable");
});
