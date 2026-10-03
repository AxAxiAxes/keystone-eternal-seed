"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const generator = require("../generate-reconciliation-report.js");

const REPO_ROOT = path.resolve(__dirname, "..", "..", "..");

function writeFile(root, rel, content) {
  const absolute = path.join(root, rel);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, content, "utf8");
}

function capture() {
  const out = [];
  const err = [];
  return {
    io: {
      stdout: { write: (text) => out.push(text) },
      stderr: { write: (text) => err.push(text) },
      env: {}
    },
    stdout: () => out.join(""),
    stderr: () => err.join("")
  };
}

function fixtureSnapshot() {
  return {
    schemaVersion: "axes-pr-snapshot-v1",
    repository: "example/fixture",
    recordedAt: "2026-10-02",
    boundary: "Fixture snapshot.",
    pullRequests: generator.REQUIRED_FOCUS_PRS.map((number) => ({
      number,
      title: number === 217 ? "Add Origin Science checkpoint" : `Record accountability work ${number}`,
      state: number === 217 ? "open" : "merged",
      createdAt: "2026-09-20",
      closedAt: number === 217 ? null : "2026-09-21",
      headRef: `branch-${number}`
    })).concat([{ number: 9, title: "Old ownership draft", state: "closed-unmerged", createdAt: "2026-09-10", closedAt: "2026-09-10", headRef: "old" }])
  };
}

function fixtureConfig() {
  const refs = ["docs/GOVERNANCE.md"];
  return {
    schemaVersion: "axes-reconciliation-config-v1",
    recordedAt: "2026-10-02",
    scope: { repository: "example/fixture", canonicalBranch: "main", decision: "Fixture only.", boundary: "Repository records only." },
    responsibleParties: [
      { role: "Founder / human owner", name: "Founder", authority: "Directs work.", boundary: "Internal claim only.", sourceRefs: refs },
      { role: "GitHub repository / account context", name: "example", authority: "Stores records.", boundary: "Not an owner.", sourceRefs: refs },
      { role: "Assigned completion agent", name: "Assistant", authority: "Implements work.", boundary: "Acquires no claim.", sourceRefs: refs }
    ],
    requiredSources: [
      { path: "README.md", domain: "continuity", status: "operational", authority: "Entry point", note: "" },
      { path: "docs/GOVERNANCE.md", domain: "governance", status: "operational", authority: "Governance", note: "" }
    ],
    scan: { rootFiles: ["README.md", "PROJECT_TIMELINE.md"], roots: ["docs"], excludeDirs: ["docs/reconciliation"], maxFileBytes: 200000 },
    classificationOverrides: [],
    focusPullRequests: generator.REQUIRED_FOCUS_PRS.map((number) => ({
      number,
      themes: ["accountability"],
      summary: `Focus ${number}`,
      evidence: number === 217
        ? [{ type: "path", path: "docs/ORIGIN_SCIENCE.md" }]
        : [{ type: "contains", path: "docs/GOVERNANCE.md", text: "Accountability" }]
    })),
    chronologyPhases: [{ id: "P0", start: "2026-09-01", end: "2026-10-02", name: "Fixture", description: "Fixture phase.", sourceRefs: refs }],
    originGovernanceConcepts: [
      { term: "Origin anchor", kind: "declaration", status: "symbolic", meaning: "Symbolic founding statement.", operationalUse: "None.", sourceRefs: refs }
    ],
    valueMap: [{ value: "Accountability", operationalValue: "Ledger", mechanism: "Ledger record", status: "operational", sourceRefs: refs }],
    inventory: [
      { id: "INV-01", item: "First offer", category: "plan", status: "proposed", profit: 5, urgency: 4, authority: "Founder", nextAction: "Approve.", sourceRefs: refs },
      { id: "INV-02", item: "Trademark", category: "document", status: "unfiled", profit: 2, urgency: 5, authority: "Counsel", nextAction: "File.", sourceRefs: refs }
    ],
    knownGaps: [{ id: "GAP-01", gap: "Uncommitted chats", status: "unfiled", detail: "Not in repository.", sourceRefs: refs }],
    missionNarrative: { mission: "Fixture mission.", problem: "Fixture problem.", assets: ["Asset"], differentiators: ["Truth labeling"], nearTermRevenue: "Consulting.", sourceRefs: refs }
  };
}

function makeFixture(mutate) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "axes-reconciliation-"));
  const config = fixtureConfig();
  const snapshot = fixtureSnapshot();
  if (mutate) mutate(config, snapshot);
  writeFile(root, "README.md", "# Fixture\n\nSee PR #173 and (#999).\n");
  writeFile(root, "PROJECT_TIMELINE.md", [
    "# Timeline",
    "",
    "| Date | Status | Milestone | Evidence |",
    "| --- | --- | --- | --- |",
    "| 2026-09-20 | Complete | Ledger added | PR #173 |",
    "| 2026-09-21 to 2026-09-22 | Needs attention | Missing images | PR #199 |",
    "",
    "- [x] Done item",
    "- [ ] Open item",
    "  continued detail",
    ""
  ].join("\n"));
  writeFile(root, "docs/GOVERNANCE.md", "# Governance\n\n**Status:** Adopted internal governance\n\nAccountability rules. Not yet filed with counsel.\n");
  writeFile(root, "docs/SACRED_LETTER.md", "# Sacred letter\n\nFounder words.\n");
  writeFile(root, "docs/memory/2026-09-20-origin-ownership-record.md", "# Origin record\n");
  writeFile(root, "docs/memory/README.md", "# Memory\n");
  writeFile(root, generator.CONFIG_PATH, `${JSON.stringify(config, null, 2)}\n`);
  writeFile(root, generator.SNAPSHOT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`);
  return root;
}

test("isSafeRelativePath rejects traversal, absolute, and backslash paths", () => {
  assert.equal(generator.isSafeRelativePath("docs/A.md"), true);
  assert.equal(generator.isSafeRelativePath("docs/keystone/birth certificate"), true);
  for (const unsafe of ["../x", "docs/../../x", "/etc/passwd", "C:/x", "docs\\x", "", "./docs/A.md", "docs//A.md"]) {
    assert.equal(generator.isSafeRelativePath(unsafe), false, unsafe);
  }
});

test("extractPrRefs finds PR mentions, ranges, links, and parenthesized numbers", () => {
  const text = "PR #173, PRs #170-#200, see https://github.com/o/r/pull/205 and merge (#217). Issue #5 is ignored.";
  assert.deepEqual(generator.extractPrRefs(text), [170, 173, 200, 205, 217]);
});

test("classifyDocument never auto-assigns verified", () => {
  const overrides = new Map();
  const samples = [
    ["docs/memory/2026-09-20-x.md", ""],
    ["docs/memory/README.md", ""],
    ["PROJECT_TIMELINE.md", ""],
    ["docs/keystone/founding source", ""],
    ["docs/X.md", "Historical snapshot"],
    ["docs/X.md", "Symbolic founder statement"],
    ["docs/X.md", "Blocking founder action required"],
    ["docs/X.md", "Draft proposal"],
    ["docs/X.md", "Active and implemented; verified by tests"],
    ["docs/SACRED_LETTER.md", ""],
    ["docs/SOMETHING_READINESS.md", ""],
    ["docs/BUSINESS_PLAN.md", ""],
    ["docs/UNKNOWN.md", ""]
  ];
  for (const [rel, status] of samples) {
    const result = generator.classifyDocument(rel, status, overrides);
    assert.ok(generator.STATUS_LABELS.includes(result.status), rel);
    assert.notEqual(result.status, "verified", `${rel} / ${status}`);
  }
  assert.equal(generator.classifyDocument("docs/memory/2026-09-20-x.md", "", overrides).status, "historical");
  assert.equal(generator.classifyDocument("docs/memory/README.md", "", overrides).status, "operational");
  assert.equal(generator.classifyDocument("PROJECT_TIMELINE.md", "", overrides).status, "operational");
  assert.equal(generator.classifyDocument("docs/SACRED_LETTER.md", "", overrides).status, "symbolic");
  assert.equal(generator.classifyDocument("docs/UNKNOWN.md", "", overrides).status, "proposed");
});

test("parseTimeline reads dated rows, date ranges, and multi-line checkpoints", () => {
  const parsed = generator.parseTimeline([
    "| 2026-09-20 | Complete | A | e |",
    "| 2026-09-21 to 2026-09-22 | Needs attention | B | e |",
    "- [x] done",
    "- [ ] open",
    "  more detail"
  ].join("\n"));
  assert.deepEqual(parsed.rows.map((row) => [row.date, row.status, row.milestone]), [
    ["2026-09-20", "Complete", "A"],
    ["2026-09-21", "Needs attention", "B"]
  ]);
  assert.deepEqual(parsed.checkpoints.map((item) => [item.checked, item.text]), [
    [true, "done"],
    [false, "open more detail"]
  ]);
});

test("reconcilePr maps snapshot state and evidence to status labels", () => {
  const ok = { result: { ok: true } };
  const missing = { result: { ok: false } };
  assert.equal(generator.reconcilePr({ state: "merged", probes: [ok, ok] }).status, "verified");
  assert.equal(generator.reconcilePr({ state: "merged", probes: [ok, missing] }).status, "unfiled");
  assert.equal(generator.reconcilePr({ state: "open", probes: [missing] }).status, "proposed");
  assert.equal(generator.reconcilePr({ state: "closed-unmerged", probes: [] }).status, "historical");
});

test("validateInputs rejects unsupported verified labels, unsafe paths, missing refs, and missing focus PRs", () => {
  const root = makeFixture();
  const config = fixtureConfig();
  const snapshot = fixtureSnapshot();
  assert.deepEqual(generator.validateInputs(root, config, snapshot).errors, []);

  config.inventory[0].status = "verified";
  config.originGovernanceConcepts[0].status = "verified";
  config.knownGaps[0].sourceRefs = ["../outside.md"];
  config.valueMap[0].sourceRefs = ["docs/DOES_NOT_EXIST.md", "pr:#4242"];
  config.focusPullRequests = config.focusPullRequests.filter((entry) => entry.number !== 205);
  config.responsibleParties = config.responsibleParties.slice(0, 2);
  const errors = generator.validateInputs(root, config, snapshot).errors.join("\n");
  assert.match(errors, /inventory\[0\].*verified requires verificationEvidence/);
  assert.match(errors, /concepts, terms, and definitions may not be labeled verified/);
  assert.match(errors, /unsafe source path "\.\.\/outside\.md"/);
  assert.match(errors, /source docs\/DOES_NOT_EXIST\.md does not exist/);
  assert.match(errors, /pr:#4242 is not in the PR snapshot/);
  assert.match(errors, /focusPullRequests must include #205/);
  assert.match(errors, /responsibleParties must include role "Assigned completion agent"/);
});

test("generator writes byte-identical reports and reconciles the fixture", () => {
  const root = makeFixture();
  const first = capture();
  assert.equal(generator.main(["--root", root], first.io), 0, first.stderr());
  const read = () => generator.OUTPUT_FILES.map((name) => fs.readFileSync(path.join(root, generator.OUTPUT_DIR, name), "utf8"));
  const before = read();
  assert.equal(generator.main(["--root", root], capture().io), 0);
  assert.deepEqual(read(), before);

  const [index, prs, matrix, timeline, gaps] = before;
  for (const content of before) {
    assert.match(content, /^<!-- GENERATED FILE/);
    assert.match(content, /## Responsible parties/);
    assert.match(content, /Founder \/ human owner/);
    assert.match(content, /GitHub repository \/ account context/);
    assert.match(content, /Assigned completion agent/);
  }
  assert.match(index, /Required sources: \*\*2 of 2\*\* present/);
  assert.match(prs, /### #173 — /);
  assert.match(prs, /`verified` — Merged per snapshot/);
  assert.match(prs, /### #217 — [\s\S]*?`proposed` — Open/);
  assert.match(matrix, /Origin anchor/);
  assert.match(timeline, /Score = profit/);
  assert.match(timeline, /`INV-01`[^\n]*\*\*20\*\*/);
  assert.match(gaps, /PR numbers cited in records but absent from the snapshot: #999/);
  assert.match(gaps, /GAP-01/);
});

test("check mode warns on stale reports, fails in strict mode, and fails when reports are missing", () => {
  const root = makeFixture();
  const missing = capture();
  assert.equal(generator.main(["--check", "--root", root], missing.io), 1);
  assert.match(missing.stderr(), /Missing generated reports/);

  assert.equal(generator.main(["--root", root], capture().io), 0);
  const fresh = capture();
  assert.equal(generator.main(["--check", "--strict", "--root", root], fresh.io), 0);
  assert.match(fresh.stdout(), /reports up to date/);

  writeFile(root, "docs/NEW_PLAN.md", "# New plan\n");
  const stale = capture();
  stale.io.env = { GITHUB_ACTIONS: "true" };
  assert.equal(generator.main(["--check", "--root", root], stale.io), 0);
  assert.match(stale.stdout(), /^::warning::Reconciliation reports are stale/);
  const strict = capture();
  assert.equal(generator.main(["--check", "--strict", "--root", root], strict.io), 1);
  assert.match(strict.stderr(), /stale/);
});

test("invalid inputs fail with exit code 1 and argument errors exit 2", () => {
  const root = makeFixture((config) => {
    config.inventory[0].status = "certain";
  });
  const result = capture();
  assert.equal(generator.main(["--root", root], result.io), 1);
  assert.match(result.stderr(), /status "certain" is not one of/);
  assert.equal(fs.existsSync(path.join(root, generator.OUTPUT_DIR, generator.OUTPUT_FILES[0])), false);
  assert.equal(generator.main(["--strict"], capture().io), 2);
  assert.equal(generator.main(["--bogus"], capture().io), 2);
});

test("repository reconciliation inputs are valid and committed reports are present", () => {
  const result = capture();
  assert.equal(generator.main(["--check", "--root", REPO_ROOT], result.io), 0, result.stderr());
});
