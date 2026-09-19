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
| 0 | **URGENT — live outage, 17+ hours and still ongoing:** public AXIOM chat (`xiiom.com/axiom`) is returning HTTP 502 "AXIOM chat is temporarily unavailable" on every request, first observed 2026-09-18 ~10 AM PDT, **reconfirmed still failing as of ~2:58 AM PDT 2026-09-19**. Founder upgraded Railway to Pro (~10:35 AM PDT 09-18) but the outage persisted afterward — redeploy `axiom-engine` and/or check `OPENAI_API_KEY` validity/quota directly next | The flagship live product is completely non-functional for every visitor right now; the billing upgrade alone did not fix it, so the root cause is narrower than account credit | `PRODUCTION_INCIDENT_2026_09_18_CHAT_502.md` |
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
| 12 | **Partially answered 2026-09-19, still needs founder action:** Axes Contracting Inc (CA corporation, filed 2013, entity #3544685) appears active per public-record aggregators, but its CSLB contractor license #995577 shows **Suspended — Contractor Bond** (a lapsed $25,000 surety bond, not a disciplinary suspension). Founder must (a) verify both directly at the official CA SOS and CSLB sites, and (b) renew the bond to reinstate the license before advertising or performing licensed contracting work | If reinstated, this is a far more revenue-ready offering than the from-scratch design-consultation plan — real 10+ year client history with banks/insurers. Operating/advertising as a licensed contractor while suspended is a compliance risk, not just a marketing gap | `AXES_CONTRACTING_INC_ENTITY_VERIFICATION.md`, `AXES_CONTRACTING_LEGACY_BUSINESS_RECORD.md` |

| 13 | Approve moderation approach (CSAM detection + reporting, abuse review), AI-vendor/budget choice, and hosting/entity plan for the proposed "free-to-all image upload + AI music-driven avatar reanimation" production line under AXES Contracting Inc, before any public upload form or AI-video pipeline is built | Public upload without an approved moderation pipeline is a legal requirement gap (18 U.S.C. § 2258A), not just a risk — nothing should be built here until this is resolved | `AXES_CONTRACTING_AI_AVATAR_PRODUCTION_READINESS.md` |

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
