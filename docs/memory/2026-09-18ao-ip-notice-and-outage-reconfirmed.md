# 2026-09-18ao — Root NOTICE.md added; live chat outage reconfirmed still active

**What happened:** Founder asked to "check progress from onset and protect
our intel as resource" against concerns about "usage mining" and others
asserting "fake ownership rights" over recorded creative/project work.

**Action taken (repo-controlled):**
- Added `NOTICE.md` at the repository root: an explicit, dated
  copyright/authorship notice stating no reuse/redistribution/model-training
  license is granted by public visibility, cross-referencing
  `docs/KEYSTONE_AI_CREATIVE_WORK_ORIGIN_REGISTRY.md` as the timestamped
  origin record, and stating plainly that real enforcement (DMCA,
  trademark, legal action) requires a human with legal authority — this
  repository can document and support such action but not take it.
- This mirrors the copyright notice + LICENSE already added to the
  `AxAxiAxes/axaxox.com` repo earlier the same day (see
  `2026-09-18an-axaxox-com-pages-preview-published.md`).

**Important status check surfaced during this task:** re-tested the live
production AXIOM chat endpoint directly
(`POST https://xiiom.com/api/axiom` with `{"action":"chat", ...}`) at
~9:25 PM PDT on 2026-09-18. It **still returns HTTP 502**
(`{"error":"AXIOM chat is temporarily unavailable"}`) — the exact same
failure first reported that morning (~10 AM PDT) and already tracked as
item #0 in `docs/keystone/FOUNDER_ACTION_QUEUE.md` and
`docs/keystone/PRODUCTION_INCIDENT_2026_09_18_CHAT_502.md`. This is now an
**11+ hour continuous outage** of the flagship live product, unresolved
despite the founder's Railway Pro upgrade. Both docs were updated with
this reconfirmation and elapsed-time note. No code fix is indicated — the
`axiom-engine` test suite already passes and the identity/date code is
confirmed correct (PR #95); this points to a Railway-side deploy state or
`OPENAI_API_KEY` issue that only the founder can resolve via the Railway
dashboard (see the incident doc's numbered next steps).

**On the founder's IP-protection concern specifically:** no repository or
hosting setting can technically prevent copying of anything already
publicly reachable (a limitation of the open web itself, not a
configuration gap). The two concrete, repo-controlled levers that exist
are (1) a clear, dated copyright/no-license notice — done, this entry —
and (2) making the repository private, which remains an **unresolved,
founder-only decision** already tracked as item #4 in
`docs/keystone/FOUNDER_ACTION_QUEUE.md` (every business/financial/personal
record committed since 2026-08-28 has been publicly visible this whole
time). Real enforcement against someone falsely claiming ownership (DMCA,
trademark opposition, litigation) requires qualified legal counsel; this
repository is not a substitute for that.

**Relevant files:**
- `NOTICE.md` (new, repo root)
- `docs/KEYSTONE_AI_CREATIVE_WORK_ORIGIN_REGISTRY.md`
- `docs/keystone/FOUNDER_ACTION_QUEUE.md` (items #0 and #4)
- `docs/keystone/PRODUCTION_INCIDENT_2026_09_18_CHAT_502.md`
