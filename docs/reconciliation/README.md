# Repository reconciliation reports

**Status:** Active repository-controlled automation (generated reports; curated inputs require founder review)

This folder holds a repeatable, repository-only reconciliation of origin,
ownership, constitution and governance, timeline, pull-request history, and
business-plan priorities for `AxAxiAxes/keystone-eternal-seed`. It was built in
response to the founder directive to reconcile this repository ("reconcile
under 1") and produce a business-plan-ready view of what is verified, what is
proposed or symbolic, and what is still unfiled.

## Responsible parties

| Role | Party |
| --- | --- |
| Founder / human owner | Axel Urartu (AX) · Axes Contracting |
| GitHub repository / account context | AxAxiAxes (`AxAxiAxes/keystone-eternal-seed`) |
| Assigned completion agent | GitHub Copilot coding agent (assistant) |

The agent builds and maintains the automation; it acquires no origin,
ownership, authorship, or governance claim, and the reports make no legal,
financial, or professional determination.

## Generated reports

Start at [RECONCILIATION_INDEX.md](RECONCILIATION_INDEX.md).

| Report | Contents |
| --- | --- |
| [RECONCILIATION_INDEX.md](RECONCILIATION_INDEX.md) | Responsible parties, scope, status labels, executive summary, required-source inventory |
| [PR_RECONCILIATION.md](PR_RECONCILIATION.md) | Focus PR chain (#173, #199, #201, #204, #205, #206, #217–#220 and related) with evidence probes, relevant PR ledger, after-the-fact capture counts |
| [ORIGIN_OWNERSHIP_GOVERNANCE_MATRIX.md](ORIGIN_OWNERSHIP_GOVERNANCE_MATRIX.md) | Authority separation, origin science / constitution / governance concepts, every reviewed record classified |
| [TIMELINE_AND_BUSINESS_SYNTHESIS.md](TIMELINE_AND_BUSINESS_SYNTHESIS.md) | Chronology, loss/gain graph, values → operational values, inventory by profit × urgency, mission narrative |
| [MISSING_MEANING_AND_GAPS.md](MISSING_MEANING_AND_GAPS.md) | Unfiled, missing, unverified, and blocked meaning |
| [DIRECTIVES_ROADMAP_AND_ETA.md](DIRECTIVES_ROADMAP_AND_ETA.md) | Story synopsis, founder directives in order (exact wording), execution order with ETAs, origin IDs, report and business plan on one timeline, review automation queue and findings |

Do not edit the generated reports by hand.

## Commands

Run from the repository root (Node 20+, no dependencies, no network):

```bash
node scripts/reconciliation/generate-reconciliation-report.js                   # regenerate all reports
node scripts/reconciliation/generate-reconciliation-report.js --check           # validate inputs; warn if reports are stale
node scripts/reconciliation/generate-reconciliation-report.js --check --strict  # also fail if reports are stale
node --test scripts/reconciliation/test/generate-reconciliation-report.test.js
GITHUB_TOKEN=... GITHUB_REPOSITORY=AxAxiAxes/keystone-eternal-seed \
  node scripts/reconciliation/refresh-pr-snapshot.js                            # read-only PR snapshot refresh
```

## Review automation

`.github/workflows/reconciliation-refresh.yml` runs every Monday (and on
manual dispatch). It re-reads pull-request metadata with a read-only API
listing, regenerates every report, runs the tests and `--check --strict`, and
opens a review pull request when anything changed. It never merges, deploys,
or edits anything outside `docs/reconciliation/`. Because the roadmap review
date is the snapshot's `recordedAt`, each refresh surfaces newly overdue
steps, steps whose PRs have all merged or closed, and the open-PR review queue
in `DIRECTIVES_ROADMAP_AND_ETA.md`. Founder actions required once: approve
the workflow run and enable "Allow GitHub Actions to create and approve pull
requests" in the repository settings.

CI (`Reconciliation report validation` in
`.github/workflows/axi-continuity-validation.yml`) runs the tests and
`--check`. Invalid inputs or missing reports fail the job. Because the reports
fingerprint every scanned document, any later documentation change makes them
stale; CI reports that as a warning so unrelated work is not blocked. Regenerate
and commit the reports when a reconciliation refresh is wanted.

## How it works

1. **Collect.** Reads the curated inputs in [`sources/`](sources/), the
   required sources, `README.md`, `AGENTS.md`, `PROJECT_TIMELINE.md`, and every
   text record under `docs/` except generated or bulk-copy folders listed in
   `scan.excludeDirs` (for example the Command Center copy index and patent
   PDFs).
2. **Validate.** Fails closed when a source reference is missing or unsafe, a
   status label is unknown, a required focus PR or responsible-party role is
   absent, or anything is labeled `verified` without `verificationEvidence`.
   Concepts, overrides, and gaps can never be `verified`.
3. **Classify.** Each record gets a domain and an automatic status from
   ordered, auditable rules (entry points, memory records, status lines, then
   filenames, then a conservative default of `proposed`). Automatic rules never
   assign `verified`.
4. **Reconcile PRs.** Focus PRs carry evidence probes (file exists / file
   contains text). Merged + all probes pass → `verified` (the merge, not the
   claims inside it); merged + probe fails → `unfiled`; open → `proposed`;
   closed without merge → `historical`.
5. **Render.** Writes byte-deterministic Markdown: no clock, git, or network
   access; output depends only on the tree.

## Updating the inputs

- [`sources/reconciliation-config.v1.json`](sources/reconciliation-config.v1.json):
  responsible parties, scope, required sources, scan settings, focus PRs and
  probes, chronology phases, origin/governance concepts, value map, inventory
  with profit and urgency scores (1–5), known gaps, the mission narrative,
  `originalDirectives` (founder wording, in order), `storySynopsis`, and the
  `roadmap` (start date, ordered steps with owner, duration, dependencies,
  directives, inventory and PR references). Profit and urgency scores and
  roadmap durations are the agent's proposed estimates; the founder confirms
  or changes them here. ETAs are computed (start + dependencies + duration);
  every directive must be scheduled by at least one step, and dependency
  cycles fail validation.
- Origin IDs (`AXES-OID-<kind>-<id>-<hash>`) are deterministic, content-addressed
  internal identifiers for directives and inventory items. They are not legal,
  copyright, patent, or registry filings; formal registration is a roadmap step.
- [`sources/pr-snapshot.v1.json`](sources/pr-snapshot.v1.json): point-in-time
  PR metadata (number, title, state, dates, head branch). Refresh it from a
  read-only pull-request listing in a reviewed commit and update `recordedAt`.

After editing either file, regenerate the reports and run the tests.

## Boundaries

- Repository records only. Chats, uploads, accounts, deployments, and external
  filings that were never committed cannot be read and are reported as
  unfiled, not reconstructed.
- Other repositories (urartuhi.com, axaxar.com, standalone axiom-freedom /
  axiom-engine) are out of scope for this reconciliation.
- Symbolic and proposed material is never presented as verified. Internal
  governance claims are not external legal determinations.
- The automation does not change GitHub, DNS, Railway, email, payment, or any
  other external account state.
