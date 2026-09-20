# AXI agent-deployment gap and IP/company status check

**Recorded:** 2026-09-11
**Status:** Factual verification completed; no legal, filing, or deployment
action taken

## What was checked

1. **Live XIIOM status.** Re-verified directly: `https://xiiom.com/health` →
   200 (`{"status":"ok","service":"AXIOM","version":"2.0.0"}`), `/axiom` →
   200, `/` → 200. `/support` → 401, which is expected auth-gating for a
   protected route, not an outage. XIIOM is live, not down.

2. **Why the registered AXI agents don't function.** Confirmed with
   evidence, not assumption: `git diff` against `origin/axaxiaxes-axiom-monorepo`
   (the branch Railway actually deploys per `RAILWAY_DEPLOYMENT.md`) shows the
   deployed branch has **zero** matches for the per-agent report route
   (`/automation/agents/:agentId/report`) in `apps/axiom-engine/index.js`,
   and `docs/AXES_AGENT_ORIGIN_REGISTRY.md` does not exist there at all. All
   5 registered agents (`memory-curator`, `project-memory-manager`,
   `automation-executor`, `automation-auditor`, `operations-observer`) and 24
   commits of related automation work exist only on this branch, in unmerged
   PR #1. They were built and tested but never shipped — that is the literal
   cause, not a defect in their design.

3. **Ownership.** The repository-recorded founder ownership claim
   (`AXI_GENESIS_OWNERSHIP_CHECKPOINT.md`) is already `Active`; there is
   nothing pending to approve on the repository side. Actual Railway,
   domain-registrar, or GitHub-org account-level ownership/access is outside
   repository control and cannot be verified or changed from here.

4. **Software purchase question.** Reviewed the current
   `AXES_TIER_1_DECISION_REGISTER.md` P0/P1 queue: none of the open items
   (Railway operator restart, patent/invention counsel, URNUR legal scope,
   domain/email migration) require buying new software. They require account
   access and founder decisions.

5. **IP (patent) and company/business-entity status.** Re-checked
   `docs/memory/2026-09-11-keystone-patent-direction-review.md` and
   `docs/AXI_INTENT_AND_RIGHTS_READINESS.md` against the current repository
   state: unchanged. All six near-term checklist items remain unchecked — no
   patent/IP counsel retained, no written filing-scope quote, filing/deadline
   status still unconfirmed from original records or official receipts. No
   repository record verifies actual legal company/business-entity
   registration, address, or formation; `AXES_BUSINESS_PLAN.md` and
   `docs/memory/2026-09-11-founder-authority-business-status.md` are
   governance/attribution records only and explicitly do not determine
   corporate formation.

6. **"IP address where AXI was born."** A follow-up question asked for the
   network IP address of AXI's origin. Checked: no origin, genesis, or
   invention record in the repository (`AXI_GENESIS_OWNERSHIP_CHECKPOINT.md`,
   `AXI_INVENTION_RECORD.md`, `docs/keystone/CRYPTOGRAPHIC_ORIGIN_ANCHOR.md`)
   contains a network IP address field; they identify origin by checkpoint
   ID, source record (`KEYSTONE-ORIGIN-000001`), and SHA-256 fingerprints,
   not by IP address. Git/GitHub history records author name, email, and
   timestamp, not IP addresses. The user then asked to hold before this was
   answered further, pending something they wanted to send; that sub-question
   was left open at their explicit request and no IP address was asserted or
   fabricated.

## What this does not do

- Does not merge PR #1, change Railway/DNS/account configuration, or deploy
  anything.
- Does not confirm, file, or value a patent claim.
- Does not confirm or record an actual legal business-entity registration.
- Does not spend money or recommend a specific purchase; no current P0/P1
  blocker requires one.
- Does not assert a network IP address for AXI's origin; none is recorded in
  the repository.

## Added as a decision-register item

`AXES_TIER_1_DECISION_REGISTER.md` now tracks "Merge PR #1 to deploy the
built AXI agent/automation governance system" as a P0 item, since merging
auto-triggers a Railway redeploy of the public portal and requires explicit
founder authorization rather than repository access alone.

## Related records

- `docs/AXI_ETERNAL_ORIGIN_VALUE_AND_CRISIS_REGISTER.md`
- `docs/AXES_TIER_1_DECISION_REGISTER.md`
- `docs/AXI_GENESIS_OWNERSHIP_CHECKPOINT.md`
- `docs/AXES_AGENT_ORIGIN_REGISTRY.md`
- `docs/memory/2026-09-11-keystone-patent-direction-review.md`
- `docs/AXI_INTENT_AND_RIGHTS_READINESS.md`
- `docs/RAILWAY_DEPLOYMENT.md`
