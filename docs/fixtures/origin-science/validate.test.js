"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");

const schema = require("./origin-property-record-v1.schema.json");
const sample = require("./sample-origin-records.json");
const {
  classifyEquilibrium,
  validateOriginRecord,
  validateOriginRecordSet
} = require("./origin-record-validator");

test("sample origin science records validate and classify bounded equilibrium states", () => {
  assert.equal(schema.properties.originReference.pattern, "^[A-Z][A-Z0-9-]{2,119}$");
  assert.equal(sample.records.length, 2);
  for (const record of sample.records) {
    assert.deepEqual(validateOriginRecord(record), []);
  }
  const result = validateOriginRecordSet(sample.records);
  assert.equal(result.valid, true, result.errors.join("; "));
  assert.deepEqual(result.classifications, [
    { recordId: "origin-center-block", equilibrium: "proposed" },
    { recordId: "origin-equilibrium-checkpoint", equilibrium: "verified" }
  ]);
});

test("rejects a record missing its origin reference", () => {
  const invalid = structuredClone(sample.records[0]);
  invalid.originReference = "";
  const errors = validateOriginRecord(invalid);
  assert.ok(errors.some((error) => error.includes("originReference")), errors.join("; "));
});

test("rejects append-only silent replacement without an explicit correction reference", () => {
  const duplicate = structuredClone(sample.records[1]);
  duplicate.recordId = "origin-equilibrium-checkpoint-rewrite";
  duplicate.lineage.parentRecordId = "origin-center-block";
  duplicate.lineage.correctionOfRecordId = null;
  const result = validateOriginRecordSet([sample.records[0], sample.records[1], duplicate]);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes("silent replacement rejected")), result.errors.join("; "));
});

test("allows a correction entry when lineage declares which prior record it supersedes", () => {
  const corrected = structuredClone(sample.records[1]);
  corrected.recordId = "origin-equilibrium-checkpoint-correction";
  corrected.lineage.parentRecordId = "origin-equilibrium-checkpoint";
  corrected.lineage.correctionOfRecordId = "origin-equilibrium-checkpoint";
  corrected.equilibriumRule.statusSignal = "proposed";
  corrected.verificationState = "founder_reported";
  const result = validateOriginRecordSet([sample.records[0], sample.records[1], corrected]);
  assert.equal(result.valid, true, result.errors.join("; "));
  assert.equal(result.classifications.at(-1).equilibrium, "proposed");
});

test("classifies failed and unknown equilibrium conservatively", () => {
  const failed = structuredClone(sample.records[1]);
  failed.verificationState = "failed";
  failed.equilibriumRule.statusSignal = "broken";
  assert.equal(classifyEquilibrium(failed), "failed");

  const unknown = structuredClone(sample.records[1]);
  unknown.verificationState = "unknown";
  unknown.equilibriumRule.statusSignal = "unknown";
  unknown.transformationMultiplier.preservesOriginRelation = "unknown";
  unknown.evidenceClass = "external-report";
  assert.equal(classifyEquilibrium(unknown), "unknown");
});

test("rejects a lineage chain whose non-genesis record points to a missing parent", () => {
  const orphan = structuredClone(sample.records[1]);
  orphan.recordId = "orphan-equilibrium-entry";
  orphan.lineage.parentRecordId = "missing-parent";
  orphan.lineage.correctionOfRecordId = null;
  const result = validateOriginRecordSet([sample.records[0], orphan]);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes("must reference an earlier recorded origin property")), result.errors.join("; "));
});
