const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const board = require("../founder-review-board");

const REPOSITORY_BOARD = path.join(__dirname, "..", "..", "..", "docs", "founder-review", "founder-review-board.v1.json");

function validBoard() {
  return {
    schemaVersion: "founder-review-board-v1",
    recordedAt: "2026-09-30T14:50:00Z",
    source: { method: "Synthetic test snapshot", refreshHow: "Edit in a reviewed pull request", baseBranch: "axaxiaxes-axiom-monorepo" },
    automation: { mayApprove: false, mayMerge: false, mayPostReviewComments: false, mayRecordFounderConfirmation: false },
    lenses: {
      fundamentals: {
        nextStep: { title: "One step", why: "Because", how: "Like this", link: "https://github.com/AxAxiAxes/keystone-eternal-seed/pull/1" },
        basics: ["Tests passing is not acceptance."]
      },
      inReview: [{
        id: "pr-1",
        pr: 1,
        url: "https://github.com/AxAxiAxes/keystone-eternal-seed/pull/1",
        title: "Example",
        state: "implemented_on_branch",
        provenance: "Synthetic",
        headBranch: "copilot/example",
        draft: true,
        observedMergeState: "blocked",
        observedAt: "2026-09-30T14:50:00Z",
        ciObservation: "passed_on_head",
        ciEvidence: "https://github.com/AxAxiAxes/keystone-eternal-seed/actions/runs/1",
        dependencies: [],
        nextStep: "Review it",
        checklist: [
          { item: "CI passes", owner: "automated_check", status: "done_by_check", evidence: "https://github.com/AxAxiAxes/keystone-eternal-seed/actions/runs/1" },
          { item: "Founder reads it", owner: "founder", status: "pending" }
        ],
        founderConfirmation: { state: "pending" }
      }],
      needsFounderDecision: [{
        id: "decision-1",
        title: "Order",
        state: "proposed",
        provenance: "Synthetic",
        question: "Which first?",
        options: ["A", "B"],
        ifNoDecision: "Nothing merges.",
        nextStep: "Decide later"
      }],
      later: [{ id: "later-1", title: "Idea", state: "proposed", provenance: "Synthetic", parked: true, nextStep: "Wait" }]
    }
  };
}

test("the repository founder review board is valid and keeps every founder confirmation pending or evidenced", () => {
  const loaded = board.loadFounderReviewBoard(REPOSITORY_BOARD, new Date("2026-09-30T15:00:00Z"));
  assert.equal(loaded.schemaVersion, board.SCHEMA_VERSION);
  assert.equal(loaded.freshness.status, "recent");
  assert.ok(loaded.lenses.inReview.some(pr => pr.pr === 216));
  for (const pr of loaded.lenses.inReview) {
    assert.notEqual(pr.state, "verified_on_base");
    assert.ok(pr.checklist.some(step => step.owner === "founder"));
  }
});

test("accepts a well-formed board", () => {
  assert.deepEqual(board.validateFounderReviewBoard(validBoard()), []);
});

test("rejects any automation permission to approve, merge, comment, or confirm", () => {
  for (const key of ["mayApprove", "mayMerge", "mayPostReviewComments", "mayRecordFounderConfirmation"]) {
    const candidate = validBoard();
    candidate.automation[key] = true;
    assert.ok(board.validateFounderReviewBoard(candidate).includes(`automation.${key} must be false`), key);
  }
  const missing = validBoard();
  delete missing.automation;
  assert.ok(board.validateFounderReviewBoard(missing).includes("automation boundaries must be declared"));
});

test("keeps CI results separate from founder acceptance", () => {
  const founderByCi = validBoard();
  founderByCi.lenses.inReview[0].checklist[1].status = "done_by_check";
  founderByCi.lenses.inReview[0].checklist[1].evidence = "https://github.com/AxAxiAxes/keystone-eternal-seed/actions/runs/1";
  assert.match(board.validateFounderReviewBoard(founderByCi).join("\n"), /founder step and cannot be completed by an automated check/);

  const checkByFounder = validBoard();
  checkByFounder.lenses.inReview[0].checklist[0].status = "founder_confirmed";
  assert.match(board.validateFounderReviewBoard(checkByFounder).join("\n"), /automated check and cannot be founder_confirmed/);

  const noFounderStep = validBoard();
  noFounderStep.lenses.inReview[0].checklist.pop();
  assert.match(board.validateFounderReviewBoard(noFounderStep).join("\n"), /must include at least one founder review step/);

  const unevidencedCheck = validBoard();
  delete unevidencedCheck.lenses.inReview[0].checklist[0].evidence;
  assert.match(board.validateFounderReviewBoard(unevidencedCheck).join("\n"), /checklist\[0\]\.evidence/);
});

test("founder confirmation needs founder-recorded GitHub evidence", () => {
  const unevidenced = validBoard();
  unevidenced.lenses.inReview[0].founderConfirmation = { state: "confirmed", recordedBy: "founder" };
  assert.match(board.validateFounderReviewBoard(unevidenced).join("\n"), /founderConfirmation\.evidence/);

  const byAutomation = validBoard();
  byAutomation.lenses.inReview[0].founderConfirmation = {
    state: "confirmed",
    recordedBy: "copilot",
    evidence: "https://github.com/AxAxiAxes/keystone-eternal-seed/pull/1#pullrequestreview-1"
  };
  assert.match(board.validateFounderReviewBoard(byAutomation).join("\n"), /recordedBy the founder, never by automation/);

  const byFounder = validBoard();
  byFounder.lenses.inReview[0].founderConfirmation = {
    state: "confirmed",
    recordedBy: "founder",
    evidence: "https://github.com/AxAxiAxes/keystone-eternal-seed/pull/1#pullrequestreview-1"
  };
  assert.deepEqual(board.validateFounderReviewBoard(byFounder), []);
});

test("an open pull request or parked idea is never labeled verified on base", () => {
  const openPr = validBoard();
  openPr.lenses.inReview[0].state = "verified_on_base";
  openPr.lenses.inReview[0].baseCommit = "7b9a6b4";
  assert.match(board.validateFounderReviewBoard(openPr).join("\n"), /cannot be verified_on_base while the pull request is in review/);

  const decision = validBoard();
  decision.lenses.needsFounderDecision[0].state = "verified_on_base";
  assert.match(board.validateFounderReviewBoard(decision).join("\n"), /requires a baseCommit SHA/);

  const unparked = validBoard();
  unparked.lenses.later[0].parked = false;
  assert.match(board.validateFounderReviewBoard(unparked).join("\n"), /parked must be true/);

  const unknownState = validBoard();
  unknownState.lenses.later[0].state = "done";
  assert.match(board.validateFounderReviewBoard(unknownState).join("\n"), /state must be one of/);
});

test("rejects mismatched links, missing CI evidence, and duplicate ids", () => {
  const candidate = validBoard();
  candidate.lenses.inReview[0].url = "https://example.com/pull/1";
  candidate.lenses.inReview[0].ciEvidence = "javascript:alert(1)";
  candidate.lenses.later[0].id = "pr-1";
  const errors = board.validateFounderReviewBoard(candidate).join("\n");
  assert.match(errors, /url must link to pull request #1/);
  assert.match(errors, /ciEvidence must be a https:\/\/github\.com/);
  assert.match(errors, /duplicates pr-1/);
});

test("labels stale snapshots and renders an advisory summary without approval language", () => {
  const stale = board.describeFreshness("2026-09-01T00:00:00Z", new Date("2026-09-30T00:00:00Z"));
  assert.equal(stale.status, "stale");
  assert.match(stale.label, /may be out of date/);

  const summary = board.renderAdvisorySummary({ ...validBoard(), freshness: stale });
  assert.match(summary, /Advisory only/);
  assert.match(summary, /not founder acceptance/);
  assert.match(summary, /\| #1 \| Implemented on branch \| CI passed on current commit \| pending \| 1 \|/);
  assert.doesNotMatch(summary, /\bapproved\b|LGTM|ready to merge/i);
});

test("loading an invalid board fails closed with every validation error", async () => {
  const file = path.join(require("node:os").tmpdir(), `founder-review-invalid-${process.pid}.json`);
  const candidate = validBoard();
  candidate.automation.mayMerge = true;
  await fs.writeFile(file, JSON.stringify(candidate));
  try {
    assert.throws(() => board.loadFounderReviewBoard(file), error => {
      assert.deepEqual(error.validationErrors, ["automation.mayMerge must be false"]);
      return true;
    });
  } finally {
    await fs.rm(file, { force: true });
  }
});

test("serves the founder review board only to the protected Command Center", async () => {
  process.env.ADMIN_PASSWORD = "test-admin-password";
  delete require.cache[require.resolve("../server")];
  const web = require("../server");
  await new Promise((resolve, reject) => {
    web.once("error", reject);
    web.listen(0, "127.0.0.1", resolve);
  });
  try {
    const url = `http://127.0.0.1:${web.address().port}/api/command-center/founder-review`;
    const anonymous = await fetch(url);
    assert.equal(anonymous.status, 401);

    const authorized = await fetch(url, {
      headers: { Authorization: `Basic ${Buffer.from("admin:test-admin-password").toString("base64")}` }
    });
    assert.equal(authorized.status, 200);
    assert.equal(authorized.headers.get("cache-control"), "no-store");
    const payload = await authorized.json();
    assert.equal(payload.schemaVersion, board.SCHEMA_VERSION);
    assert.ok(["recent", "stale"].includes(payload.freshness.status));
    assert.equal(payload.automation.mayMerge, false);
    assert.equal(payload.labels.states.verified_on_base, "Verified on base");
  } finally {
    web.closeAllConnections();
    await new Promise(resolve => web.close(resolve));
  }
});

test("Command Center renders one next step first, collapses other lenses, and escapes board text", async () => {
  const markup = await fs.readFile(path.join(__dirname, "..", "command-center.html"), "utf8");
  const script = markup.match(/<script>([\s\S]*?)<\/script\s*>/i);
  assert.ok(script, "the Command Center page must contain its application script");
  const elements = new Map();
  const context = vm.createContext({
    document: {
      querySelector(selector) {
        if (!elements.has(selector)) {
          elements.set(selector, { innerHTML: "", textContent: "", addEventListener() {} });
        }
        return elements.get(selector);
      }
    },
    fetch: async () => {
      throw new Error("Network access is disabled in UI rendering tests.");
    },
    setInterval() {}
  });
  vm.runInContext(script[1], context, { filename: "command-center.html" });
  await new Promise(resolve => setImmediate(resolve));
  assert.match(elements.get("#founder-freshness").textContent, /Founder pace view unavailable/);

  const hostile = '<img src=x onerror="globalThis.compromised=true">';
  const candidate = {
    ...validBoard(),
    freshness: board.describeFreshness("2026-09-30T14:50:00Z", new Date("2026-09-30T15:00:00Z")),
    labels: { states: board.STATES, ciObservations: board.CI_OBSERVATIONS, checklistStatuses: board.CHECKLIST_STATUSES }
  };
  candidate.lenses.fundamentals.nextStep.title = `Next ${hostile}`;
  candidate.lenses.inReview[0].title = hostile;
  candidate.lenses.inReview[0].ciEvidence = 'javascript:alert(1)';
  candidate.lenses.later[0].title = hostile;
  context.candidate = candidate;
  vm.runInContext("renderFounderReview(candidate);", context);

  const html = elements.get("#founder-review").innerHTML;
  assert.doesNotMatch(html, /<img\b/i);
  assert.doesNotMatch(html, /javascript:/);
  assert.match(html, /&lt;img src=x/);
  assert.ok(html.indexOf("Fundamentals · your one next step") < html.indexOf("<details"));
  assert.doesNotMatch(html, /<details[^>]*\bopen\b/);
  assert.match(html, /In review — pull requests \(1\)/);
  assert.match(html, /Needs your decision \(1\)/);
  assert.match(html, /Later — possibilities, parked \(1\)/);
  assert.match(html, /Implemented on branch/);
  assert.match(html, /Your confirmation: pending/);
  assert.match(html, /Automated check: CI passes — <span class="ready">done by automated check/);
  assert.match(html, /You: Founder reads it — <span class="attention">to do/);
  assert.match(elements.get("#founder-freshness").textContent, /Not live/);
});
