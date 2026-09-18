# Main Axes Contracting.com Timeline

**Created:** 2026-09-18
**Scope:** A single prioritized, checkpointed list of the *repository-controlled*
work currently open across AXIOM/KEYSTONE/AXES, organized so the founder can
see what can start immediately without further input, what needs one founder
decision before it can start, and what cannot be done from this repository at
all (domain/DNS, billing, legal, patent, account access).

This document does not replace `PROJECT_TIMELINE.md` (the full historical
changelog) or `docs/AXES_TIER_1_DECISION_REGISTER.md` (the detailed decision
ledger with evidence). It is a working-priority view derived from both, plus
the Axaxar.com and KEYSTONE V4 material added 2026-09-18, kept short enough to
act as a standing checklist.

## How to read this

- **[Can start now]** — repository-controlled, no missing information,
  no external account/legal/payment action required. I can begin on request.
- **[Needs one founder decision]** — repository-controlled *after* a specific,
  named decision is made (scope, price, owner, yes/no). Listed with the exact
  question that unblocks it.
- **[Founder/external only]** — requires domain registrar/DNS, Railway
  billing/dashboard, a payment processor, legal counsel, or another account
  this repository has no access to. Not actionable by an agent regardless of
  authorization language, and listed here only for visibility.

## Checkpoint 0 — Done (as of 2026-09-18)

- AXIOM chat now sends a system prompt with live current-date awareness and
  AXIOM identity/creator continuity (PR #95, plus a Docker image build fix
  caught and resolved same day).
- CI-gated auto-merge confirmed live and working; PRs #95–#100 merged, 0 open
  PRs, stray branches cleaned up.
- Axaxar.com: new repo (`AxAxiAxes/axaxar.com`) created with a draft
  `README.md`/`ARCHITECTURE.md`, plus `docs/keystone/AXAXAR_LAUNCH_PLAN.md` in
  this repo (PR #96).
- Domain portfolio doc updated with the founder's ~19-domain SiteGround list
  and the Main Deck (`axescontracting.com`) statement (PR #97).
- Founder's KEYSTONE V4 Venture Analysis preserved verbatim, hash-verified, in
  `docs/keystone/KEYSTONE_V4_VENTURE_ANALYSIS.md` (PR #98).
- Confirmed the cryptographic origin anchor and agent-registry docs already
  exist in this repo (PR #99) — but see Checkpoint 1 below; they contain
  labeled placeholder proofs, not real ones.

## Checkpoint 1 — Can start now (no blocking decision needed)

Ordered by how directly each maps to something already flagged as incomplete
or inconsistent.

1. **Replace the illustrative/placeholder cryptographic proofs in
   `docs/keystone/CRYPTOGRAPHIC_ORIGIN_ANCHOR.md` with real, computable ones.**
   The document currently states its SHA-256 hash, RSA signature block, and
   OpenTimestamps/Bitcoin receipt are explicitly labeled "illustrative" (not
   real). I can compute genuine SHA-256 hashes of the actual founding
   documents already in this repo and record them as a real hash manifest.
   I cannot produce a real RSA signature (no private key exists in the repo)
   or a real OpenTimestamps/blockchain receipt (that requires submitting a
   hash to an external timestamping service, which is a founder-authorized
   external action, not just a repo edit) — those two stay placeholder until
   the founder wants to actually run that submission.
2. **Reconcile the `axescontracting.com` "Main Deck" discrepancy in
   `docs/DOMAIN_PORTFOLIO.md`.** The 2026-09-09 record calls it private/
   admin-only; the founder's 2026-09-18 statement calls it the combined
   "Main Deck." I can rewrite that section to state the founder's intent as
   the authoritative target state and mark the current live DNS/TLS failure
   as the known gap between intent and reality, without touching DNS myself.
3. **Turn the KEYSTONE V4 Venture Analysis's 30-day sprint plan into a
   tracked checklist** cross-referenced against what's already built in this
   repo (e.g., which of the 5 revenue streams already have a candidate offer
   record — `AXES-DMC-001`, `KEYSTONE-COS-001` — versus which have nothing
   started yet).
4. **Flesh out the Axaxar.com architecture draft** (data model, auth
   approach, hosting target, cost estimate) now that a first draft exists,
   still marked unapproved/draft pending founder review — this doesn't
   require the founder to have answered the open product-scope questions
   first, just refines the technical shape of the current assumption.
5. **Fill in the technical/structural fields of the still-empty readiness
   sheets** (`AXOUS_CREATOR_STUDIO_READINESS.md`,
   `SCHOOL_OF_LOVE_AND_ETHICS_READINESS.md`) — data map, moderation-plan
   shape, rollback plan — leaving owner-name and pricing fields blank since
   those need a founder decision (item 6 below).
6. **Routine repository continuity check** (branch currency, open PR/CI
   status, decision-register accuracy) — already a standing practice, kept
   here so it's visible as an always-available task.

## Checkpoint 2 — Needs one founder decision before work starts

| Task | Exact question that unblocks it |
| --- | --- |
| Confirm Axaxar.com's product scope | Is Axaxar.com the paid/subscription AI product distinct from free AXIOM chat (my working assumption in `AXAXAR_LAUNCH_PLAN.md`), or something else? |
| Activate `AXES-DMC-001` (design/materials consultation) | Who is the named owner, what is the price, and what are the terms? (Intake questionnaire already drafted.) |
| Activate `KEYSTONE-COS-001` (creator-origin setup service) | Who is the named owner, what is the price, and what are the terms? (Record-shape templates already drafted.) |
| Name an owner for AXOUS / School of Love & Ethics pilots | Who owns each pilot, and — for School of Love & Ethics specifically — is an adult-only first cohort acceptable, or is a minor-facing cohort intended (which needs an age-policy/guardian-consent decision first)? |
| Confirm whether the SiteGround domain list is complete | The list pasted 2026-09-18 appeared to cut off at `axaxes.com` with no status/expiry column — is there more, or is that the full set? |
| Decide the real OpenTimestamps/notarization step for the origin anchor | Do you want that hash actually submitted to a public timestamping service (an irreversible, one-way action once done), or should it stay a repository-only hash record for now? |

## Checkpoint 3 — Founder/external only (listed for visibility, not actionable here)

- `axescontracting.com` DNS/TLS: still resolves via legacy SiteGround
  nameservers with an expired certificate; connecting it to Railway needs
  registrar/DNS access and a Railway plan that supports another custom
  domain (current plan already reported at its custom-domain limit).
- Railway trial/billing status for the account running `xiiom.com` — repeatedly
  flagged since 2026-09-12, still requires the founder's own Railway billing
  page.
- Patent/invention filing status (application 64/078,819) — prior research
  found no confirmed USPTO filing matching the number referenced in repo
  docs; resolving this needs the founder's own filing records and, if
  pursued, qualified patent counsel.
- Any new domain registration, payment-processor account, or legal-entity
  paperwork for Axaxar.com or any other property.
- Vigour Creative design-packet follow-up and any third-party
  Angi/Yelp/Bing listing checks — founder's own vendor/platform logins only.

## Suggested next action

Given the above, the highest-leverage **Checkpoint 1** items to start on
immediately (no founder input needed) are #1 (real cryptographic hash
manifest) and #2 (Main Deck doc reconciliation), since both directly resolve
inconsistencies already flagged in prior continuity records. Say which item(s)
to start with, or "all of Checkpoint 1," and I'll proceed.
