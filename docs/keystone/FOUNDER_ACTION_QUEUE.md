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
next, in what order" without reading the full register.

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
| 1 | Confirm Railway billing/trial status and upgrade if still needed | If services go offline, `xiiom.com` and the chat product stop working entirely — this is the single highest-impact item | `AXES_TIER_1_DECISION_REGISTER.md` (P0, "Keep xiiom.com... online") |
| 2 | Decide and approve the first paid AXES service to accept real clients for (design/materials consultation is the readiest candidate) | No revenue starts until one offering is explicitly approved for paid delivery, priced, and scoped | `AXES_DESIGN_MATERIALS_CONSULTATION_READINESS.md`, `FOUNDER_REVENUE_PRIORITY_OVERLAY.md` (V2) |
| 3 | Connect `axescontracting.com` DNS / renew its HTTPS certificate | An expired cert and stale legacy DNS actively suppress search visibility and block a professional client-facing domain | `AXES_TIER_1_DECISION_REGISTER.md` (P2, domain/email) |
| 4 | Decide repository visibility (public vs. private) | Every business/financial/personal record committed so far has been publicly visible since 2026-08-28; this is a real exposure risk independent of revenue but affects client trust | `AXES_TIER_1_DECISION_REGISTER.md` (P0, visibility) |
| 5 | Approve KEYSTONE creator-origin setup as a second paid offering | Second revenue line once #2 is running; templates/readiness sheet already drafted | `KEYSTONE_CREATOR_ORIGIN_SETUP_READINESS.md` |
| 6 | Define URNUR's permitted legal/compliance scope (or confirm it stays inactive) | Blocks any financial/trading feature from ever becoming revenue-eligible; no work should proceed here until this is resolved | `AXES_TIER_1_DECISION_REGISTER.md` (P0, URNUR scope) |
| 7 | Scope-review AXI inter-AI interaction (which external system, what data crosses the boundary, review-before-acting, kill switch) | Requested capability with no revenue path yet identified; needs a founder scoping decision before any code is written, same as every other sensitive AXI capability | `AXI_EXTERNAL_INTERACTION_READINESS.md` |

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
