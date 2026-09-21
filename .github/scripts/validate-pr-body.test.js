const assert = require("node:assert/strict");
const test = require("node:test");
const { validatePullRequestBody } = require("./validate-pr-body");

const VALID_BODY = `
## Task accountability

- Task-ID: TASK-20260921-0001
- Exception path: none
- Exception reason: none
- Directive author: Axel Urartu (AX) · Axes Contracting
- Task owner: Axel Urartu (AX) · Axes Contracting
- Implementer(s): Copilot App; founder-directed local edits
- Reviewer: pending founder review
- Merger / acceptor: pending merge
- AI / tool attribution: Copilot App, local repository edits
- Continuity / memory record: docs/memory/2026-09-21-accountability-policy.md
- Next review date: 2026-09-28T00:00:00.000Z
- Repository artifact status: delivered
- Real-world / production outcome status: not applicable
- Founder confirmation state: pending

## What founder instruction does this PR deliver?

Implements the founder-requested task-record and accountability policy.

## Scope-match check (protocol step 5a)

Matches the requested scope: extends the existing accountability ledger and adds PR validation.

## Cost / time estimate vs. actual (protocol steps 5, 5b)

- Estimated: doc + code update, no external spend expected
- Actual (agent-side): local development + tests
- Actual (founder-side time spent on this task/conversation, if determinable): pending confirmation

## At least one suggested improvement beyond the literal ask (protocol step 4)

Add CI enforcement so the PR template becomes a real merge gate instead of a visible suggestion only.

## Self-rating (protocol step 7)

- Quality rating (1-10): 8 — extends the existing implementation vehicle instead of duplicating it
- Founder rating requested: yes (ask directly in the PR/chat, every time)

## Verification performed

Ran targeted engine, portal, and PR-body validation tests locally.
`;

test("accepts a complete Task-ID based PR body", () => {
  assert.deepEqual(validatePullRequestBody(VALID_BODY), []);
});

test("accepts documented historical exceptions without a Task-ID", () => {
  const body = VALID_BODY
    .replace("Task-ID: TASK-20260921-0001", "Task-ID: not applicable")
    .replace("Exception path: none", "Exception path: historical")
    .replace("Exception reason: none", "Exception reason: Historical PR created before the Task-ID policy existed.");
  assert.deepEqual(validatePullRequestBody(body), []);
});

test("rejects placeholder exception reasons for documented exceptions", () => {
  const failures = validatePullRequestBody(
    VALID_BODY
      .replace("Task-ID: TASK-20260921-0001", "Task-ID: not applicable")
      .replace("Exception path: none", "Exception path: administrative")
      .replace("Exception reason: none", "Exception reason: TODO")
  );
  assert.match(failures.join("\n"), /Exception reason/);
});

test("rejects missing Task-ID when no exception path is used", () => {
  const failures = validatePullRequestBody(VALID_BODY.replace("Task-ID: TASK-20260921-0001", "Task-ID: "));
  assert.match(failures.join("\n"), /Task-ID is required/);
});

test("rejects placeholder-only accountability content", () => {
  const failures = validatePullRequestBody(VALID_BODY.replace(
    "AI / tool attribution: Copilot App, local repository edits",
    "AI / tool attribution: TODO"
  ));
  assert.match(failures.join("\n"), /AI \/ tool attribution/);
});
