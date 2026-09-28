"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");

const { loadRegistry, validateRegistryData } = require("./validator");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function toMutableData() {
  const { chain, recordsById } = loadRegistry(__dirname);
  const mutableRecordsById = new Map();
  for (const [recordId, record] of recordsById.entries()) {
    mutableRecordsById.set(recordId, clone(record));
  }
  return { chain: clone(chain), recordsById: mutableRecordsById };
}

test("current OORR-P records validate", () => {
  const data = toMutableData();
  const errors = validateRegistryData(data);
  assert.deepEqual(errors, []);
});

test("detects tampering via canonical hash mismatch", () => {
  const data = toMutableData();
  data.recordsById.get("OORRP-FOUNDATIONAL-ORIGIN-000001").title = "Tampered title";
  const errors = validateRegistryData(data);
  assert.ok(errors.some((error) => error.includes("canonical hash mismatch")), errors.join("; "));
});

test("detects broken linkage from founder claim to foundational record", () => {
  const data = toMutableData();
  data.recordsById.get("OORRP-FOUNDER-ORIGIN-OWNERSHIP-000001").claimLinkage.foundationalOriginRecordId = "WRONG-RECORD";
  const errors = validateRegistryData(data);
  assert.ok(errors.some((error) => error.includes("must link to the foundational OORR-P record")), errors.join("; "));
});

test("detects unjustified legal-status elevation", () => {
  const data = toMutableData();
  const record = data.recordsById.get("OORRP-FOUNDER-ORIGIN-OWNERSHIP-000001");
  record.verification.legalStatus = "externally-adjudicated";
  record.verification.officialExternalEvidence = [];
  const errors = validateRegistryData(data);
  assert.ok(errors.some((error) => error.includes("legal status cannot be elevated")), errors.join("; "));
});

test("detects hash-chain record-order failure", () => {
  const data = toMutableData();
  data.chain.entries[1].sequence = 3;
  const errors = validateRegistryData(data);
  assert.ok(errors.some((error) => error.includes("has sequence")), errors.join("; "));
});
