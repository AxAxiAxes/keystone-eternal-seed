# Founder action queue (profitability-ordered)

**Status:** Internal coordination summary; does not itself authorize any
external, financial, legal, or account action
**Recorded:** 2026-09-18
**Purpose:** A single, short, profitability-ordered list of the actions only
the founder (a human with account/payment/legal authority) can take right
now. This is a summary view over `AXES_TIER_1_DECISION_REGISTER.md` (the
full evidence-backed record) and `FOUNDER_REVENUE_PRIORITY_OVERLAY.md` (the
V1/V2/V3 revenue sequencing) — read those for full context and evidence;
this file exists so the founder can see "what do I personally need to do
next, in what order" without reading the full register. See
`PRODUCT_BRANCH_DOMAIN_MAP.md` for how each item below maps to a specific
domain name, repo, and product branch.

## Why this list exists

Repository work (code, docs, tests, CI-gated PR merges) can be automated
safely within the existing action allowlist and is already running on
autopilot for in-scope changes. Nothing in that allowlist can open a bank
account, accept payment, sign a contract, change a domain/DNS record, upgrade
a hosting plan, or make a legal/licensing claim. Those steps are listed here,
ordered by how directly they unblock revenue.

## Queue (highest revenue impact first)

| # | Action | Why it blocks revenue | Reference |
| --- | --- | --- | --- |
| 0 | **UPDATED 2026-09-19 ~5:33 PM PDT — 502 outage resolved, but a deployment-staleness problem is now confirmed instead:** `xiiom.com/axiom` chat now returns HTTP 200, but the reply gives a stale 2024 date and generic identity — exactly the pre-fix behavior PR #95/#70 (merged 2026-09-18) were meant to eliminate. This means the running Railway deployment predates those merged commits. **Action needed: redeploy `axiom-engine` (and `axiom-freedom` if applicable) from the current `axaxiaxes-axiom-monorepo` head in the Railway dashboard**, then re-test with "what is today's date" / "who created you" and confirm the reply reflects the real date and full AXIOM identity | The flagship live product now responds but is giving every visitor factually wrong, off-brand answers — a credibility problem, not a downtime problem anymore | `PRODUCTION_INCIDENT_2026_09_18_CHAT_502.md` |
| 1 | Railway billing: **already upgraded to Pro** (2026-09-18, ~10:35 AM PDT) — confirm no other services still need attention now that trial credits are no longer a factor | If services go offline, `xiiom.com` and the chat product stop working entirely — this was the single highest-impact item; the plan upgrade itself is done, remaining follow-through is folded into item 0 | `AXES_TIER_1_DECISION_REGISTER.md` (P0, "Keep xiiom.com... online") |
| 2 | Decide and approve the first paid AXES service to accept real clients for (design/materials consultation is the readiest candidate) | No revenue starts until one offering is explicitly approved for paid delivery, priced, and scoped | `AXES_DESIGN_MATERIALS_CONSULTATION_READINESS.md`, `FOUNDER_REVENUE_PRIORITY_OVERLAY.md` (V2) |
| 3 | Connect `axescontracting.com` DNS / renew its HTTPS certificate | An expired cert and stale legacy DNS actively suppress search visibility and block a professional client-facing domain | `AXES_TIER_1_DECISION_REGISTER.md` (P2, domain/email) |
| 4 | Decide repository visibility (public vs. private) | Every business/financial/personal record committed so far has been publicly visible since 2026-08-28; this is a real exposure risk independent of revenue but affects client trust | `AXES_TIER_1_DECISION_REGISTER.md` (P0, visibility) |
| 5 | Approve KEYSTONE creator-origin setup as a second paid offering | Second revenue line once #2 is running; templates/readiness sheet already drafted | `KEYSTONE_CREATOR_ORIGIN_SETUP_READINESS.md` |
| 6 | Define URNUR's permitted legal/compliance scope (or confirm it stays inactive) | Blocks any financial/trading feature from ever becoming revenue-eligible; no work should proceed here until this is resolved | `AXES_TIER_1_DECISION_REGISTER.md` (P0, URNUR scope) |
| 7 | Scope-review AXI inter-AI interaction (which external system, what data crosses the boundary, review-before-acting, kill switch) | Requested capability with no revenue path yet identified; needs a founder scoping decision before any code is written, same as every other sensitive AXI capability | `AXI_EXTERNAL_INTERACTION_READINESS.md` |
| 8 | Reconcile the URNUR "evolving name = value" / automated arbitration concept with the existing non-monetary-recognition and financial-readiness constitutions | Currently self-conflicting: the concept proposes automated personal-value/name scoring and arbitration that the repo's own approved constitution forbids without a named human reviewer; blocks any URNUR feature work until resolved | `URNUR_EVOLVING_NAME_VALUE_CONCEPT.md` |
| 9 | Same reconciliation as #8, applied to the Athanor "agreement with AI, money markets, services" concept | Same underlying conflict, different concept doc; resolving #8 resolves this one too — tracked separately only so the Athanor concept doc isn't silently unresolved | `ATHANOR_ETERNAL_SEED_VESSEL_CONCEPT.md`, `ATHANOR_GAME_CONSOLE_READINESS.md` |
| 10 | Review and confirm/edit the proposed default scope table now drafted in `AXAXAR_LAUNCH_PLAN.md` (product definition, target customer, brand positioning, pricing model, domain status) so the draft plan in `AxAxiAxes/axaxar.com` can move past phase 0 | A registered domain and a scaffold repo already exist for this; a concrete default scope is now proposed and just needs founder confirmation or edits — no build/spend should proceed until confirmed | `keystone/AXAXAR_LAUNCH_PLAN.md` |
| 11 | Decide whether to point the real `urartuhi.com` domain at the already-live gallery site (`https://axaxiaxes.github.io/urartuhi.com/`) via DNS CNAME, or use a different hosting target; supply real artwork if proceeding | Site is built and deployed but invisible to the public until DNS is pointed at it — a low-effort, low-risk item that's currently just sitting idle | `docs/memory/2026-09-17-urartuhi-gallery-site-created.md` |
| 12 | **RESOLVED 2026-09-19 (official CSLB confirmation):** Axes Contracting Inc (CA corporation, filed 2013, entity #3544685) is active, and CSLB contractor license #995577 is confirmed **"current and active"** per the official CSLB site directly (founder-provided screenshot), expiring 08/31/2028 — the earlier "Suspended — Contractor Bond" reading came from stale third-party aggregator data, not the real license status. No bond renewal needed. Founder may now advertise/perform licensed contracting work under this entity/license | AXES Contracting is a real, licensed, 10+ year general contractor — a far more revenue-ready offering than the from-scratch design-consultation plan (V2 default). Consider promoting it ahead of the unlicensed DMC-001 concept, or running both in parallel | `AXES_CONTRACTING_INC_ENTITY_VERIFICATION.md`, `AXES_CONTRACTING_LEGACY_BUSINESS_RECORD.md`, `AXES_CONTRACTING_BOND_RENEWAL_QUICKSTART.md` (superseded, kept for reference) |

| 13 | Approve moderation approach (CSAM detection + reporting, abuse review), AI-vendor/budget choice, and hosting/entity plan for the proposed "free-to-all image upload + AI music-driven avatar reanimation" production line under AXES Contracting Inc, before any public upload form or AI-video pipeline is built | Public upload without an approved moderation pipeline is a legal requirement gap (18 U.S.C. § 2258A), not just a risk — nothing should be built here until this is resolved | `AXES_CONTRACTING_AI_AVATAR_PRODUCTION_READINESS.md` |
| 15 | **RECURRED 2026-09-20 (second report):** Founder again referenced a memory "to establish continuity and manners when in service" that should already govern behavior. Repeated repo-wide + full git-history search (grep across all tracked files, `git log --all -i --grep` for "manners"/"customer service"/"continuity") again found **no** document matching this description under any name — only `AGENT_SERVICE_DELIVERY_PROTOCOL.md` (self-rating/accountability) and this same queue item's original 2026-09-19 report exist. **This is now a repeat, not a first-time gap — please paste the exact text or name the exact file/session where it was created**, so it can finally be committed as a real, permanent, correctly-named document instead of being reported missing a third time | Cannot honor or follow an instruction/document that has never once been captured in a durable, cross-session record in this repo — sessions do not share memory unless something is committed here; recurring without new content supplied strongly suggests it exists only in a session whose output was never persisted, not a capture failure on a specific known task | This entry; see `docs/memory/2026-09-19l-customer-service-prompt-not-found.md`, `docs/keystone/AGENT_SERVICE_DELIVERY_PROTOCOL.md` |
| 16 | **Founder reported a $40,000 resource loss and a mismatched-result rework cost, attributed to a task not being followed as directed.** Please identify the specific task/PR/request this refers to so it can be documented with full ownership and the actual mismatch corrected at the source | No repo-visible record ties any completed task to a $40k figure or a specific wrong deliverable; cannot investigate or correct a named failure without knowing which one it is — a structural corrective step (literal scope-match check before completion) was added regardless, but the specific incident still needs identifying | `docs/memory/2026-09-19m-founder-loss-report-and-rating.md`, `docs/keystone/AGENT_SERVICE_DELIVERY_PROTOCOL.md` (step 5a) |
| 17 | **NEW 2026-09-20 — approve (or redirect) the draft AXES Contracting revenue-launch plan.** A full document review surfaced AXES Contracting Inc as the strongest already-licensed, already-operating revenue candidate in the repo (10+ year business history, CSLB license confirmed active through 2028) — stronger than the from-scratch DMC-001 concept. Draft plan proposes a lower-risk "Phase A" (general contracting/remediation only) launch, holding back home-inspection-specific claims until a certification question is resolved. Needs founder approval/edits before any public page or client outreach | Currently the single most launch-ready, most under-used revenue opportunity already sitting in the paperwork — no new entity, license, or brand needed, only a founder go/no-go and scope confirmation | `AXES_CONTRACTING_REVENUE_LAUNCH_PLAN.md` |

| 14 | **Cross-repo PR/session triage completed 2026-09-19 (no founder action needed, informational):** swept all open PRs across `AxAxiAxes` repos per founder's "push all PR merge on auto always" instruction. Standalone `AxAxiAxes/axiom-engine` repo (a legacy stub, **not** the live `apps/axiom-engine` used by `xiiom.com`) had 16 stale automated "perf:" PRs from 2026-09-13/14 — 5 merged cleanly, the other 11 conflicted with each other (sequential branches assuming prior PRs had already landed) and were closed as superseded rather than manually re-based, since the repo isn't production. `keystone-eternal-seed` PR #173 ("Copilot directive-vs-delivery accountability ledger," from `app/copilot-swe-agent`) is still a **draft** — GitHub blocks both CI and auto-merge on drafts (`gh pr merge --auto` returned "Pull request is a draft"), so no action was taken; once the authoring agent/session marks it ready for review, CI will run and auto-merge can be enabled at that point | Housekeeping only; nothing here blocks revenue or needs a founder decision unless PR #173 stays draft for an unusually long time | This entry |

## What is intentionally not on this list

Patent/filing history, the standalone `axiom-freedom`/Azure repo question,
and youth-safeguard/moderation policy for future pilots are real open items
but do not currently block near-term revenue; they remain tracked in the full
decision register at their existing priority so this queue stays short and
actionable.

## Maintenance

Update this file (not by duplicating detail, only by re-ordering or
retiring rows) whenever a founder decision closes an item or the revenue
priority changes. The full evidence trail always lives in
`AXES_TIER_1_DECISION_REGISTER.md`.
