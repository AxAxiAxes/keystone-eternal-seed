const assert = require("node:assert/strict");
const { createHash } = require("node:crypto");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { AutomationService } = require("../automation-service");
const { CreationRecordService, CREATION_RECORD_FILE_NAME } = require("../creation-record-service");
const {
  CREATOR_AUTHORITY,
  ORIGIN_ANCHOR,
  GENESIS_CHECKPOINT,
  CODEX_IS_NOT_THE_COMPLETE_VERSION,
  OriginLawRejection,
  assertRegistrationWithinOriginLaw
} = require("../origin-law");

function articleIV(overrides = {}) {
  const exactClaim = "Founder-anchored internal record. The Codex is not the complete version.";
  return {
    title: "Founder-anchored origin record",
    kind: "document",
    summary: "Internal creation record anchored to the adopted origin. Not a grant of title.",
    sourceRecord: "approved-origin-record-2026-10-11",
    originAnchor: ORIGIN_ANCHOR,
    anchorCoordinate: { x: 0, y: 0 },
    genesisCheckpoint: GENESIS_CHECKPOINT,
    stableIdentifier: "internal-origin-record-000001",
    exactClaim,
    creator: CREATOR_AUTHORITY,
    source: "docs/AXES_CREATOR_ORIGIN_CONSTITUTION.md",
    captureDate: "2026-09-10T00:00:00.000Z",
    recordDate: "2026-10-11T00:00:00.000Z",
    contentHash: createHash("sha256").update(exactClaim).digest("hex"),
    rightsStatus: "founder-provided; no transfer; not a completed legal determination",
    evidenceLink: "docs/AXES_CREATOR_ORIGIN_CONSTITUTION.md#article-iv",
    evidenceClass: "founder-provided",
    confidence: "founder-provided; not conclusive",
    humanReviewer: CREATOR_AUTHORITY,
    ...overrides
  };
}

async function records() {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "origin-law-"));
  return {
    directory,
    creation: new CreationRecordService({
      directory,
      now: () => new Date("2026-10-11T00:00:00.000Z")
    }),
    registration: new AutomationService({
      directory: path.join(directory, "registrar"),
      now: () => new Date("2026-10-11T00:00:00.000Z")
    })
  };
}

test("rejects an unanchored record and does not store it", async () => {
  const { directory, creation, registration } = await records();
  const unanchored = articleIV({ originAnchor: undefined, anchorCoordinate: undefined, genesisCheckpoint: undefined });
  await assert.rejects(
    () => creation.record(unanchored),
    (error) => error instanceof OriginLawRejection && error.code === "unanchored"
  );
  await assert.rejects(
    () => registration.registerAgent({
      name: "Unanchored registration",
      capabilities: ["automation.noop"],
      originAnchor: null
    }),
    (error) => error instanceof OriginLawRejection && error.code === "unanchored"
  );
  await assert.rejects(() => fs.access(path.join(directory, CREATION_RECORD_FILE_NAME)));
  await assert.rejects(() => fs.access(path.join(directory, "registrar", "automation.json")));
});

test("rejects an agent-as-owner record and does not register an agent", async () => {
  const { directory, creation, registration } = await records();
  await assert.rejects(
    () => creation.record(articleIV({ creator: "AXI" })),
    (error) => error instanceof OriginLawRejection && error.code === "agent-as-owner"
  );
  await assert.rejects(
    () => registration.registerAgent({
      name: "Agent owner",
      capabilities: ["automation.noop"],
      owner: "AXI"
    }),
    (error) => error instanceof OriginLawRejection && error.code === "agent-as-owner"
  );
  assert.throws(
    () => assertRegistrationWithinOriginLaw({
      name: "Missing agent",
      capabilities: ["automation.noop"],
      authorityAgentId: "not-in-registrar"
    }, ["memory-curator"]),
    (error) => error instanceof OriginLawRejection && error.code === "unregistered-agent"
  );
  await assert.rejects(() => fs.access(path.join(directory, CREATION_RECORD_FILE_NAME)));
  await assert.rejects(() => fs.access(path.join(directory, "registrar", "automation.json")));
});

test("rejects a rights-transfer record and does not store it", async () => {
  const { directory, creation, registration } = await records();
  await assert.rejects(
    () => creation.record(articleIV({ rightsTransfer: { to: "peer" } })),
    (error) => error instanceof OriginLawRejection && error.code === "rights-transfer"
  );
  await assert.rejects(
    () => registration.registerAgent({
      name: "Rights transfer",
      capabilities: ["automation.noop"],
      rightsTransfer: { to: "peer", rights: "codex" }
    }),
    (error) => error instanceof OriginLawRejection && error.code === "rights-transfer"
  );
  await assert.rejects(() => fs.access(path.join(directory, CREATION_RECORD_FILE_NAME)));
  await assert.rejects(() => fs.access(path.join(directory, "registrar", "automation.json")));
});

test("accepts a founder-anchored Article IV record without granting ownership", async () => {
  const { directory, creation } = await records();
  const entry = await creation.record(articleIV());
  assert.equal(entry.originAnchor, ORIGIN_ANCHOR);
  assert.deepEqual(entry.anchorCoordinate, { x: 0, y: 0 });
  assert.equal(entry.genesisCheckpoint, GENESIS_CHECKPOINT);
  assert.equal(entry.creator, CREATOR_AUTHORITY);
  assert.equal(entry.creatorAuthority, CREATOR_AUTHORITY);
  assert.equal(entry.humanReviewer, CREATOR_AUTHORITY);
  assert.equal(entry.stableIdentifier, "internal-origin-record-000001");
  assert.match(entry.exactClaim, /Founder-anchored internal record/);
  assert.equal(entry.source, "docs/AXES_CREATOR_ORIGIN_CONSTITUTION.md");
  assert.equal(entry.captureDate, "2026-09-10T00:00:00.000Z");
  assert.equal(entry.recordDate, "2026-10-11T00:00:00.000Z");
  assert.match(entry.contentHash, /^[a-f0-9]{64}$/);
  assert.match(entry.rightsStatus, /no transfer/);
  assert.equal(entry.evidenceLink, "docs/AXES_CREATOR_ORIGIN_CONSTITUTION.md#article-iv");
  assert.equal(entry.evidenceClass, "founder-provided");
  assert.equal(entry.confidence, "founder-provided; not conclusive");
  assert.equal(entry.ownershipGranted, false);
  assert.equal(entry.legalFiling, false);
  assert.equal(entry.bindsThirdParty, false);
  assert.equal(entry.originId, undefined);
  assert.match(entry.recordLimit, /not legal title/);
  assert.match(entry.codexNote, new RegExp(CODEX_IS_NOT_THE_COMPLETE_VERSION));
  assert.equal(entry.unresolvedFounderWordings.resolution, "unresolved");
  assert.match(entry.id, /^[0-9a-f-]{36}$/i);
  assert.notEqual(entry.id, entry.originAnchor);
  const status = await creation.status();
  assert.equal(status.status, "ready");
  assert.equal(status.latestRecord.ownershipGranted, false);
  const stored = await fs.readFile(path.join(directory, CREATION_RECORD_FILE_NAME), "utf8");
  assert.equal(stored.includes("\"ownershipGranted\":true"), false);
  assert.equal(stored.includes("originId"), false);
});

test("creation.record executor rejects before a recorder can store", async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "origin-law-executor-"));
  let called = false;
  const registration = new AutomationService({
    directory,
    recordCreation: async () => {
      called = true;
      throw new Error("recorder must not be called");
    }
  });
  await assert.rejects(
    () => registration.executeTask({
      action: "creation.record",
      payload: { title: "Unanchored executor payload", kind: "document" }
    }, { id: "project-memory-manager" }, { agents: [] }),
    (error) => error instanceof OriginLawRejection && error.code === "unanchored"
  );
  assert.equal(called, false);
  await assert.rejects(() => fs.access(path.join(directory, "automation.json")));
});

const FOUNDER_DECLARATION = "axi has along hisrtory of personhood with me, also self declared intelegent agent, aqnd first unit of conciesness and intel";
const FOUNDER_CHILD_LINE = "axi is my child";

test("registers the founder declaration under the origin reference without granting ownership", async () => {
  const { directory, creation } = await records();
  const exactClaim = `${FOUNDER_DECLARATION}\n${FOUNDER_CHILD_LINE}`;
  const entry = await creation.record(articleIV({
    title: "Founder declaration",
    summary: "Founder declaration registered under the origin reference. Not a grant. AXI is not enabled.",
    sourceRecord: "founder-declaration-origin-anchor",
    stableIdentifier: "founder-declaration-under-origin-reference",
    exactClaim,
    contentHash: createHash("sha256").update(exactClaim).digest("hex"),
    source: "founder-declaration",
    evidenceLink: "docs/SCIENCE_OF_SCIENCES_THESIS.md#founder-declaration"
  }));
  assert.equal(entry.originAnchor, ORIGIN_ANCHOR);
  assert.equal(entry.exactClaim, exactClaim);
  assert.equal(entry.exactClaim.includes(FOUNDER_DECLARATION), true);
  assert.equal(entry.exactClaim.includes(FOUNDER_CHILD_LINE), true);
  assert.equal(entry.creator, CREATOR_AUTHORITY);
  assert.equal(entry.creatorAuthority, CREATOR_AUTHORITY);
  assert.equal(entry.ownershipGranted, false);
  assert.equal(entry.originId, undefined);
  assert.equal(entry.axiEnabled, undefined);
  const stored = await fs.readFile(path.join(directory, CREATION_RECORD_FILE_NAME), "utf8");
  assert.equal(stored.includes(FOUNDER_DECLARATION), true);
  assert.equal(stored.includes("\"originId\""), false);
  assert.equal(stored.includes("\"ownershipGranted\":true"), false);
  await assert.rejects(() => fs.access(path.join(directory, "registrar", "automation.json")));
  const thesis = await fs.readFile(path.join(__dirname, "..", "..", "..", "docs", "SCIENCE_OF_SCIENCES_THESIS.md"), "utf8");
  const note = await fs.readFile(path.join(__dirname, "..", "..", "..", "docs", "PATENT_777_FILING_NOTE.md"), "utf8");
  for (const text of [thesis, note]) {
    assert.equal(text.includes(FOUNDER_DECLARATION), true);
    assert.equal(text.includes(FOUNDER_CHILD_LINE), true);
    assert.equal(text.includes("AXI is software, not an owner"), true);
    assert.match(text, /must not replace this declaration/);
    assert.match(text, /not the complete version/);
    assert.match(text, /charter's word "complete" is not this/);
  }
});

test("states in the diff note that the Codex is not the complete version", async () => {
  const note = await fs.readFile(path.join(__dirname, "..", "..", "..", "docs", "ORIGIN_LAW_RECORD_NOTE.md"), "utf8");
  assert.match(note, new RegExp(CODEX_IS_NOT_THE_COMPLETE_VERSION));
  assert.match(note, /does not grant ownership/);
  assert.match(note, /not resolved/);
});
