# KEYSTONE income-deployment inventory and timeline

**Status:** Planning/navigation document. Restates and sequences work already
documented elsewhere; does not authorize anything new by itself.
**Recorded:** 2026-09-18
**Purpose:** Answer the founder's question directly — "what is the full
inventory, and what is the scheduled, dated path to first income" — in one
place, instead of across a dozen separate readiness documents.

## 1. How to read this document

Every task below is one of three kinds. The kind determines who can move it:

- **[AI-buildable]** — engineering/documentation work an agent can complete
  in this repository without new founder authority. Given an approximate
  completion date because it is schedulable now.
- **[Founder-only]** — requires the founder's account, money, legal
  identity, or judgment (approvals, billing, domain/DNS, legal review).
  These cannot be given a real completion date by an agent — only the
  founder controls when they happen — so each instead gets a **target**
  date assuming the founder acts promptly, and is cross-linked to
  `docs/keystone/FOUNDER_ACTION_QUEUE.md`.
- **[Blocked/gated]** — cannot proceed at all yet because it conflicts with
  an existing binding safety/legal boundary (URNUR, Athanor money features).
  No date; explicitly held.

## 2. Full inventory — what already exists today (verified in this repo)

| Capability | State | Evidence |
| --- | --- | --- |
| Public AXIOM chat at xiiom.com/axiom | **Live** | `apps/axiom-freedom/server.js`, `apps/axiom-engine/chat-service.js` |
| AXIOM persistent chat memory (last 10 turns) | **Live, merged** | PR #73 |
| AXIOM identity + current-date system prompt | **Live, merged** | `apps/axiom-engine/system-prompt.js`, PR (identity/date fix, this branch family) |
| AXI automation service (bounded, admin-gated actions incl. `creation.record`) | **Live** | `apps/axiom-engine/automation-service.js`, `docs/AXI_AUTOMATION_SERVICE.md` |
| AXI web/browser access (SSRF-guarded, admin-gated, off by default) | **Built, not enabled by default** | `docs/AXI_WEB_ACCESS.md` |
| CI-gated auto-merge on canonical branch | **Live** | 6 required checks, verified green across PRs #137-#142 |
| Design/materials consultation service offer (V2) | **Drafted, not published** | `docs/AXES_DESIGN_MATERIALS_CONSULTATION_READINESS.md` |
| KEYSTONE creator-origin setup service offer (V3) | **Drafted, not published** | `docs/KEYSTONE_CREATOR_ORIGIN_SETUP_READINESS.md` |
| Creative-work origin/provenance registry (image hash + provenance anchoring) | **Live, actively used** | `docs/KEYSTONE_AI_CREATIVE_WORK_ORIGIN_REGISTRY.md` (6 entries) |
| Founder-only action tracker | **Live, actively used** | `docs/keystone/FOUNDER_ACTION_QUEUE.md` (9 items) |
| URNUR (financial/trading) functionality | **Explicitly blocked pending legal review** | `docs/URNUR_FINANCIAL_READINESS.md` |
| Athanor / game-console concept | **Concept-stage, money features blocked** | `docs/ATHANOR_GAME_CONSOLE_READINESS.md` |

**Bottom line on inventory:** the two nearest revenue-capable products
(V2 design/materials consultation, V3 KEYSTONE creator-origin setup) are
already **written and ready to review** — they are not blocked on
engineering. They are blocked on founder publication approval plus the
founder-only items already listed (billing, domain/DNS, repo visibility).

## 3. Timeline

Dates are approximate, sequential from today (2026-09-18), and assume no
new founder-blocked surprises. AI-buildable items proceed in parallel with
founder-only items where possible.

### Phase 0 — Founder approvals to unblock revenue (this week)
Target: **2026-09-25**
- [Founder-only] Approve or edit V2 design/materials consultation offer sheet for publication — `docs/AXES_DESIGN_MATERIALS_CONSULTATION_READINESS.md`
- [Founder-only] Approve or edit V3 KEYSTONE creator-origin setup offer sheet for publication — `docs/KEYSTONE_CREATOR_ORIGIN_SETUP_READINESS.md`
- [Founder-only] Confirm Railway billing plan (referenced in `FOUNDER_ACTION_QUEUE.md` item 1)
- [Founder-only] Decide repository visibility (public vs. private) before any client-facing offer goes live — item 4

### Phase 1 — First paid-service launch (V2 design/materials consultation)
Target: **2026-10-02**
- [AI-buildable] Build a simple public intake page/form for the approved V2 offer (client-controlled questionnaire, no appraisal/inspection claims) once Phase 0 approval lands
- [AI-buildable] Wire intake submissions into a reviewable queue (no automated pricing/eligibility decisions — human review required per existing boundary docs)
- [Founder-only] Approve pricing, delivery process, and support path — required before first paid intake, per `FOUNDER_REVENUE_PRIORITY_OVERLAY.md`

### Phase 2 — Second offering (V3 KEYSTONE creator-origin setup)
Target: **2026-10-09**
- [AI-buildable] Extend the existing origin-registry pattern (already proven across 6 entries) into a client-facing "creator-origin record setup" delivery workflow
- [Founder-only] Approve final client-facing wording and any pricing

### Phase 3 — Platform hardening for public/paid traffic
Target: **2026-10-16**
- [AI-buildable] Backup/recovery verification for chat memory + new client-record data
- [AI-buildable] Monitoring/alerting pass on the two new endpoints
- [Founder-only] Confirm domain/DNS ownership and email continuity (items 3 and the reinvestment note in `FOUNDER_REVENUE_PRIORITY_OVERLAY.md`)

### Phase 4 — Gated items (no date; explicitly held)
- [Blocked/gated] URNUR financial/trading functionality — held pending legal review (`URNUR_FINANCIAL_READINESS.md`)
- [Blocked/gated] URNUR evolving name/value + automated arbitration concept — held pending founder/legal reconciliation (`URNUR_EVOLVING_NAME_VALUE_CONCEPT.md`)
- [Blocked/gated] Athanor money-markets/services agreement element — held on the same reconciliation (`ATHANOR_ETERNAL_SEED_VESSEL_CONCEPT.md`)
- [Founder-only, unscheduled] AXI inter-AI interaction scoping — no revenue path identified yet (`AXI_EXTERNAL_INTERACTION_READINESS.md`)

## 4. What would change these dates

- Any Phase 0 approval slipping past 2026-09-25 pushes every later phase by
  the same amount — these are the true critical path, not engineering time.
- New founder requests that require new engineering (as have arrived
  steadily this cycle) will be handled in parallel without changing this
  timeline unless they require blocking, shared infrastructure changes.

## Cross-references

- `docs/keystone/FOUNDER_ACTION_QUEUE.md`
- `docs/FOUNDER_REVENUE_PRIORITY_OVERLAY.md`
- `docs/AXES_TIER_1_DECISION_REGISTER.md`
- `docs/AXES_DESIGN_MATERIALS_CONSULTATION_READINESS.md`
- `docs/KEYSTONE_CREATOR_ORIGIN_SETUP_READINESS.md`
- `PROJECT_TIMELINE.md`
