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

## Website/domain branches — timeline to completion

Every registered domain from `docs/DOMAIN_PORTFOLIO.md` is one "branch" off
this Main Deck. This table gives two different, clearly-labeled kinds of
dates so you can check both:

- **Registrar expiry (real, checkable today)** — pulled directly from the
  founder-provided SiteGround screen recorded 2026-09-18. This is a real
  renewal deadline: if a domain isn't renewed by this date, it lapses. Verify
  the live figure in the SiteGround dashboard before relying on it — this
  repository only stores what was reported.
- **Draft target checkpoint (proposed, not a real deadline yet)** — derived
  from `DOMAIN_PORTFOLIO.md`'s existing 5-phase rollout order. These are
  *my proposed* build-out milestones, not founder-committed dates. No
  founder deadline exists for any of these yet; treat this column as a
  starting proposal to confirm, adjust, or reject per branch.

| Domain | Current role | Registrar expiry (real) | Rollout phase | Draft target checkpoint (proposed) |
| --- | --- | --- | --- | --- |
| `axescontracting.com` | Main Deck / AXES command center (founder-stated); doc still shows private/admin-only pending live reconciliation | Feb 3, 2029 | Phase 1 | Now — reconcile doc + confirm live DNS/TLS status (Checkpoint 1 item #2 above) |
| `xiiom.com` | Live public AXIOM home | Not in the 2026-09-18 SiteGround list — registrar/account unconfirmed | Phase 1 (already live) | Ongoing maintenance only |
| `axaxar.com` | Axaxar.com product (draft repo + architecture exist) | Sep 15, 2027 | New / not in original 5-phase plan | Q4 2026 — pending founder confirmation of product scope (Checkpoint 2) |
| `axoux.com` | Creator projects / collaboration (AXOUS pilot) | Not in 2026-09-18 list; check 2026-09-09 registry | Phase 3 | After Phase 1–2 complete; needs named pilot owner (Checkpoint 2) |
| `auxaous.com` | Private self-design/reflection tools | Not in 2026-09-18 list | Phase 4 | After privacy/moderation/export/deletion capability exists |
| `urnur.com` | Future monetary/banking direction | Not in 2026-09-18 list | Phase 5 | Parked — blocked on legal/banking readiness review, not scheduled |
| `axaxaxu.com` | Founder-defined future direction | Not in 2026-09-18 list | Phase 5 | Parked — needs a scoped product brief first |
| `axianaxiunaixia.com` | Founder-defined future direction | Not in 2026-09-18 list | Phase 5 | Parked — needs a scoped product brief first |
| `axaxiaxes.com` | Founder-defined future direction | Not in 2026-09-18 list | Phase 5 | Parked — needs a scoped product brief first |
| `axaxes.com` | Newly reported AXES site | Row cut off in founder's paste — status/expiry unknown, re-confirm | Phase 5 | Parked — needs confirmed registration + purpose |
| `uxaxu.com` | Founder-defined future direction | Not in 2026-09-18 list | Phase 5 | Parked — needs a scoped product brief first |
| `owawawao.com` | Founder-defined future direction | Not in 2026-09-18 list | Phase 5 | Parked — needs a scoped product brief first |
| `aulaux.com` | Founder-defined future direction | Not in 2026-09-18 list | Phase 5 | Parked — needs a scoped product brief first |
| `axpur.com` | Unverified registration | Not in 2026-09-18 list | Unassigned | Verify registration/ownership before any planning |
| `urartuhi.com` | Art gallery site (repo already created 2026-09-17) | Sep 16, 2027 | New / not in original 5-phase plan | Q4 2026 — content/build-out, no blocking decision known |
| `axarar.com` | Not yet assigned a product role | Sep 16, 2027 | Unassigned | Parked — needs a scoped product brief |
| `axaxur.com` | Not yet assigned a product role | Sep 15, 2027 | Unassigned | Parked — needs a scoped product brief |
| `axelurartu.com` | Not yet assigned a product role (founder's own name domain) | Sep 13, 2027 | Unassigned | Parked — needs a scoped product brief |
| `uxruxu.com` | Verification required at registrar; no product role | Sep 16, 2027 | Unassigned | Parked — registrar verification + product brief needed |
| `axtux.com` | Verification required at registrar; no product role | Sep 16, 2027 | Unassigned | Parked — registrar verification + product brief needed |
| `nuxiux.com` | Verification required at registrar; no product role | Sep 16, 2027 | Unassigned | Parked — registrar verification + product brief needed |
| `nuxuxun.com` | Verification required at registrar; no product role | Sep 16, 2027 | Unassigned | Parked — registrar verification + product brief needed |
| `uxaxaxu.com` | Verification required at registrar; no product role | Sep 16, 2027 | Unassigned | Parked — registrar verification + product brief needed |
| `xaxux.com` | Verification required at registrar; no product role | Sep 16, 2027 | Unassigned | Parked — registrar verification + product brief needed |
| `uxrax.com` | Verification required at registrar; no product role | Sep 16, 2027 | Unassigned | Parked — registrar verification + product brief needed |
| `haiuhi.com` | Verification required at registrar; no product role | Sep 16, 2027 | Unassigned | Parked — registrar verification + product brief needed |
| `axrux.com` | Verification required at registrar; no product role | Sep 16, 2027 | Unassigned | Parked — registrar verification + product brief needed |
| `axraxrax.com` | Verification required at registrar; no product role | Sep 16, 2027 | Unassigned | Parked — registrar verification + product brief needed |
| `axtamar.com` | Verification required at registrar; no product role | Sep 16, 2027 | Unassigned | Parked — registrar verification + product brief needed |
| `axaxox.com` | Verification required at registrar; no product role | Sep 16, 2027 | Unassigned | Parked — registrar verification + product brief needed |
| `axaxau.com` | Verification required at registrar; no product role | Sep 16, 2027 | Unassigned | Parked — registrar verification + product brief needed |

### Reading this table honestly

- The **expiry column is the only genuinely fixed deadline** in this table
  today — miss it and the domain lapses. Everything in the "draft target
  checkpoint" column is a proposal I'm making from the existing rollout-order
  logic, not a commitment; several rows explicitly can't move until a
  Checkpoint 2 decision (named owner, scoped product brief, or product-scope
  confirmation) happens first.
- Several 2026-09-09 vs 2026-09-18 entries look like they might be the same
  domain reported twice with different names or a transcription difference
  (e.g. `axaxaxu.com` vs `uxaxaxu.com`, `axaxiaxes.com` vs `axraxrax.com`) —
  flagged in `DOMAIN_PORTFOLIO.md` already, not resolved here. Confirm the
  founder's SiteGround dashboard directly for the authoritative current list
  before treating every row above as a distinct domain.
- `xiiom.com` and several 2026-09-09-registry domains don't appear in the
  newer SiteGround paste at all — could be a different registrar/account, or
  simply omitted from that paste. Not assumed either way.
- If you want real target dates instead of phase-based proposals, tell me
  the deadline per branch (or per phase) and I'll update this table to track
  against it going forward.

## Suggested next action

Given the above, the highest-leverage **Checkpoint 1** items to start on
immediately (no founder input needed) are #1 (real cryptographic hash
manifest) and #2 (Main Deck doc reconciliation), since both directly resolve
inconsistencies already flagged in prior continuity records. Say which item(s)
to start with, or "all of Checkpoint 1," and I'll proceed.
