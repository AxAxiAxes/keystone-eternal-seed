const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const {
  BUSINESS_METRICS_ID,
  BUSINESS_METRICS_NOTICE,
  BusinessMetricsService
} = require("../business-metrics-service");

function sampleEntry(overrides = {}) {
  return {
    period: "2026-09",
    kind: "revenue",
    category: "contracting-services",
    amountCents: 12500,
    sourceRecord: "approved-metric-2026-09-001",
    ...overrides
  };
}

test("persists approved hash-linked metric records and calculates deterministic totals", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-business-metrics-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const service = new BusinessMetricsService({
    directory,
    now: () => new Date("2026-09-11T08:00:00.000Z")
  });

  assert.equal((await service.initialize()).recordCount, 0);
  const revenue = await service.record(sampleEntry());
  const expense = await service.record(sampleEntry({
    kind: "expense",
    category: "materials",
    amountCents: 3500,
    sourceRecord: "approved-metric-2026-09-002"
  }));
  const nextRevenue = await service.record(sampleEntry({
    period: "2026-10",
    amountCents: 2000,
    sourceRecord: "approved-metric-2026-10-001"
  }));

  assert.equal(revenue.sequence, 1);
  assert.equal(revenue.reviewStatus, "operator-approved");
  assert.equal(expense.previousHash, revenue.hash);
  assert.equal(nextRevenue.previousHash, expense.hash);
  assert.match(nextRevenue.hash, /^[a-f0-9]{64}$/);

  const status = await service.status();
  assert.equal(status.id, BUSINESS_METRICS_ID);
  assert.equal(status.recordCount, 3);
  assert.equal(status.label, BUSINESS_METRICS_NOTICE);
  assert.equal(status.latestRecord.sourceRecord, "approved-metric-2026-10-001");

  const recent = await service.list();
  assert.equal(recent.label, BUSINESS_METRICS_NOTICE);
  assert.deepEqual(recent.entries.map((entry) => entry.sequence), [3, 2, 1]);

  assert.deepEqual(await service.summary(), {
    label: BUSINESS_METRICS_NOTICE,
    recordCount: 3,
    totalRecordedRevenueCents: 14500,
    totalRecordedExpenseCents: 3500,
    netRecordedOperatingResultCents: 11000,
    totalsByPeriod: {
      "2026-09": {
        revenueCents: 12500,
        expenseCents: 3500,
        netOperatingResultCents: 9000
      },
      "2026-10": {
        revenueCents: 2000,
        expenseCents: 0,
        netOperatingResultCents: 2000
      }
    }
  });
});

test("rejects malformed, duplicate, unsafe, and tampered metric history", async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "axiom-business-metrics-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const service = new BusinessMetricsService({ directory });
  await service.record(sampleEntry());

  await assert.rejects(() => service.record(sampleEntry()), /sourceRecord already exists/);
  await assert.rejects(
    () => service.record(sampleEntry({ period: "2026-13", sourceRecord: "approved-metric-2" })),
    /period must be a valid YYYY-MM/
  );
  await assert.rejects(
    () => service.record(sampleEntry({
      kind: "expense",
      category: "contracting-services",
      sourceRecord: "approved-metric-3"
    })),
    /category is unsupported/
  );
  await assert.rejects(
    () => service.record(sampleEntry({ amountCents: 0, sourceRecord: "approved-metric-4" })),
    /amountCents must be a strictly positive safe integer/
  );
  await assert.rejects(
    () => service.record(sampleEntry({ sourceRecord: "invoice-123", note: "prohibited" })),
    /unsupported fields/
  );
  await assert.rejects(
    () => service.record(sampleEntry({ sourceRecord: "Customer Name" })),
    /sourceRecord must be a non-sensitive/
  );
  await assert.rejects(
    () => service.record(sampleEntry({ sourceRecord: "invoice-123" })),
    /sourceRecord must be a non-sensitive/
  );

  const statePath = path.join(directory, "business-metrics.jsonl");
  const original = await fs.readFile(statePath, "utf8");
  await fs.writeFile(statePath, original.replace("12500", "12501"));
  assert.deepEqual(await service.status(), {
    status: "attention",
    code: "business-metrics-invalid",
    expectedId: BUSINESS_METRICS_ID,
    expectedSchemaVersion: 1,
    label: BUSINESS_METRICS_NOTICE
  });
  await assert.rejects(() => service.summary(), /business metrics has an invalid entry/);
});
