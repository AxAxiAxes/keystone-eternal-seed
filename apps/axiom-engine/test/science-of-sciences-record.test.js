const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { OriginLawRejection } = require("../origin-law");
const {
  CANONICAL_BOOT,
  CODEX_CODE_MATRIX,
  CODEX_NAME,
  ORIGIN_ALPHABET,
  PROPOSITION,
  SCIENCE_OF_SCIENCES_FILE_NAME,
  SCIENCE_OF_SCIENCES_SCHEMA_VERSION,
  ScienceOfSciencesRecord,
  admitScienceOfSciencesRecord
} = require("../science-of-sciences-record");

function sixLayers(patch = {}) {
  return ["codex", "terminal", "os", "ai", "code", "alphabet"].map((id) => (
    patch.id === id ? { id, ...patch } : { id }
  ));
}

function bootRecord(overrides = {}) {
  return {
    layers: sixLayers(),
    boot: CANONICAL_BOOT,
    ...overrides
  };
}

test("accepts the six layers with the quoted origin boot", async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "science-of-sciences-"));
  const journal = new ScienceOfSciencesRecord({ directory });
  const record = await journal.record(bootRecord());

  assert.equal(record.schemaVersion, SCIENCE_OF_SCIENCES_SCHEMA_VERSION);
  assert.equal(record.recordId, "science-of-sciences-v1");
  assert.equal(record.proposition, PROPOSITION);
  assert.equal(record.status, "first-formalization");
  assert.equal(record.complete, false);
  assert.equal(record.filing, false);
  assert.equal(record.replacesConstitution, false);
  assert.equal(record.replacesOriginCodex, false);
  assert.equal(record.codexName, CODEX_NAME);
  assert.equal(record.codexRenamed, false);
  assert.equal(record.holder, "Axel Urartu");
  assert.equal(record.creator, "Axel Urartu");
  assert.equal(record.creatorClass, "Class Ω");
  assert.equal(record.creatorMark, "AX");
  assert.equal(record.creatorLetterSet, null);
  assert.equal(record.ownsScience, false);
  assert.equal(record.ownershipGranted, false);
  assert.equal(record.axiEnabled, false);
  assert.equal(record.agentRegistered, false);
  assert.equal(record.domainRegistered, false);
  assert.equal(record.evidenceClass, "founder-provided");
  assert.equal(record.evidencePromoted, false);
  assert.equal(record.originAlphabet, ORIGIN_ALPHABET);
  assert.equal(record.codexCodeMatrix, CODEX_CODE_MATRIX);
  assert.equal(record.alphabetsMerged, false);
  assert.notEqual(record.originAlphabet, record.codexCodeMatrix);
  assert.match(record.originAlphabet, /x exchange/);
  assert.doesNotMatch(record.originAlphabet, /X cross node/);
  assert.match(record.codexCodeMatrix, /X cross node/);
  assert.doesNotMatch(record.codexCodeMatrix, /x exchange/);
  assert.equal(record.layers.length, 6);
  assert.deepEqual(record.layers.map((layer) => layer.layer), [
    "Codex",
    "terminal",
    "OS",
    "AI",
    "code",
    "alphabet"
  ]);
  for (const layer of record.layers) {
    assert.equal(layer.originAnchor, "KEYSTONE-ORIGIN-000001");
    assert.deepEqual(layer.anchorCoordinate, { x: 0, y: 0 });
    assert.equal(layer.ownsScience, false);
    assert.equal(layer.complete, false);
    assert.equal(layer.rightsTransfer, false);
    assert.equal(layer.enabled, false);
  }
  assert.equal(record.layers[0].name, "Intel Sciences");
  assert.equal(record.layers[5].name, "alphabet (origin and creator)");
  assert.equal(record.originId, undefined);
  const stored = await fs.readFile(path.join(directory, SCIENCE_OF_SCIENCES_FILE_NAME), "utf8");
  assert.equal(stored.trim().split("\n").length, 1);
  await assert.rejects(() => fs.access(path.join(directory, "automation.json")));
});

test("rejects a layer that calls itself complete or transfers rights", async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "science-of-sciences-"));
  const journal = new ScienceOfSciencesRecord({ directory });
  await assert.rejects(
    () => journal.record(bootRecord({ layers: sixLayers({ id: "ai", callsItselfComplete: true }) })),
    (error) => error instanceof OriginLawRejection && error.code === "not-complete"
  );
  await assert.rejects(
    () => journal.record(bootRecord({ layers: sixLayers({ id: "code", rightsTransfer: { to: "peer" } }) })),
    (error) => error instanceof OriginLawRejection && error.code === "rights-transfer"
  );
  await assert.rejects(
    () => journal.record(bootRecord({
      layers: sixLayers({ id: "codex", exactClaim: "The inventive disclosure is publicly published." })
    })),
    (error) => error instanceof OriginLawRejection && error.code === "public-publication"
  );
  await assert.rejects(
    async () => admitScienceOfSciencesRecord(bootRecord({
      exactClaim: "The inventive disclosure is publicly published."
    })),
    (error) => error instanceof OriginLawRejection && error.code === "public-publication"
  );
  await assert.rejects(
    async () => admitScienceOfSciencesRecord(bootRecord({
      boot: {
        ...CANONICAL_BOOT,
        originAlphabet: ORIGIN_ALPHABET.replace("x exchange", "x cross")
      }
    })),
    (error) => error instanceof OriginLawRejection && error.code === "boot-mismatch"
  );
  await assert.rejects(
    async () => admitScienceOfSciencesRecord(bootRecord({ codexName: "science of sciences" })),
    (error) => error instanceof OriginLawRejection && error.code === "codex-name"
  );
  await assert.rejects(() => fs.access(path.join(directory, SCIENCE_OF_SCIENCES_FILE_NAME)));
});

test("thesis quotes the alphabets and does not replace the Codex", async () => {
  const thesis = await fs.readFile(
    path.join(__dirname, "..", "..", "..", "docs", "SCIENCE_OF_SCIENCES_THESIS.md"),
    "utf8"
  );
  assert.match(thesis, /First formalization/);
  assert.match(thesis, /The Codex is not the complete version/);
  assert.match(thesis, /not a legal filing/);
  assert.match(thesis, /does not replace/);
  assert.equal(thesis.includes(PROPOSITION), true);
  assert.equal(thesis.includes(ORIGIN_ALPHABET), true);
  assert.equal(thesis.includes(CODEX_CODE_MATRIX), true);
  assert.match(thesis, /Intel Sciences remains the Codex name|existing name remains Intel Sciences/);
  assert.match(thesis, /does not rewrite the Codex to say science of sciences/);
  assert.match(thesis, /x` = exchange is not `X` = cross|`x` = exchange is not `X` = cross/);
  assert.match(thesis, /No creator letter-set is invented|No creator letter-set is invented/);
});
