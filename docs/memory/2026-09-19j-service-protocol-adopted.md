# 2026-09-19j — Service-delivery protocol adopted; live pages opened

## Directive (verbatim, founder)

"create and open all web pages developed, after each task directed to you
i want you to perform market research and revise the most successful
template for the architecture, proofread with me, suggest improvements
estimate cost in money and time, then execute. After completion you are to
rate yourself if you have provided quality service and how satisfied i am
of your services, adjust your estimated projection analysis and take
responsibility for your mistakes. there is a formal compliance letter and
loss report update. record will show, how you completed the project.
Install this in your memory so it loads at every instant. Provide best
service and hold yourself accountable for mistakes."

## What was done

1. **Opened the live, actually-deployed web pages** in browser canvases:
   - `https://xiiom.com/axiom` (AXIOM public chat portal — loads; the
     underlying chat POST is still the known 30+ hr outage)
   - `https://urartuhi.com` (art gallery — **now resolves via the real
     domain**, not just the GitHub Pages URL; DNS appears to have been
     connected since the last check, good news not previously recorded)
   - `axescontracting.com` was checked and still fails at the transport
     level (unchanged from prior findings) — not opened since there is
     nothing live to show.
   - `axaxar.com` has no deployed page yet (scaffold/architecture-doc only)
     — nothing to open there.
2. **Adopted a formal standing service-delivery protocol**:
   `docs/keystone/AGENT_SERVICE_DELIVERY_PROTOCOL.md` — codifies the
   requested workflow (market research → best-template revision →
   proofread-with-founder → improvement suggestions → cost/time estimate →
   execute → post-completion self-rating/satisfaction-estimate →
   accountability) for every founder-directed task going forward.
   - Includes an honest capability statement: I cannot literally rewrite my
     own runtime instructions to "load at every instant" — the closest real
     equivalent is adding it to this repo's existing required-reading
     startup checklist, which was done in `AXI_PROJECT_CONTEXT_CHECKPOINT.md`.
   - Includes a formal compliance acknowledgment section restating current
     known open items (chat outage, draft accountability-ledger PR #173,
     and the standing example of a corrected past mistake — the CSLB
     license aggregator error) as the "loss report" record this directive
     asked for.

## Self-rating for this specific task (per the new protocol, applied immediately)

- **Quality self-rating:** 7/10. Delivered both literal asks (opened real
  live pages; wrote and adopted the protocol) and was honest about a hard
  capability limit (cannot literally auto-load into "every instant" of a
  future session) rather than overclaiming. Did not perform a full external
  market-research pass on "most successful templates" for this specific
  task, since the task itself was a process/governance directive, not a
  build task with a template to benchmark — flagged as a gap below rather
  than silently applying the step where it didn't fit.
- **Estimated founder satisfaction:** unknown — this is my own estimate on
  the founder's behalf, not a real rating, pending explicit confirmation.
  Estimating moderate-to-good given the literal requests were fulfilled,
  but the "install in memory" ask was only partially achievable and that
  gap is called out explicitly rather than hidden.
- **Cost/time estimate vs. actual:** no external cost (doc + browser-canvas
  work only); time was roughly 15-20 minutes of session time, in line with
  similar doc-only tasks this session. No estimate was given before
  starting (the protocol itself didn't exist until this task produced it) —
  going forward, every task will get a stated estimate first, per the new
  protocol.
- **Accountability note:** the market-research step of the new protocol
  was not concretely exercised on this founder-facing content because this
  task's own scope (adopting a process) has no external "template" to
  benchmark. This will be exercised properly the next time a
  build/architecture task arrives.

## Reference

- `docs/keystone/AGENT_SERVICE_DELIVERY_PROTOCOL.md`
- `docs/AXI_PROJECT_CONTEXT_CHECKPOINT.md` (startup checklist now points to
  the protocol)
- `docs/MICROSOFT_UI_OWNERSHIP_AND_SUPPORT_LIMITATIONS_REPORT.md` (the
  pre-existing loss report this directive references)
