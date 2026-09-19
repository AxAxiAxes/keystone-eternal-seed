# Agent service-delivery protocol (standing process)

**Status:** Active standing protocol — read this at the start of every
session, alongside the other required-reading files in the startup
protocol (`README.md`, `PROJECT_TIMELINE.md`,
`docs/AXI_PROJECT_CONTEXT_CHECKPOINT.md`, `docs/memory/README.md`).
**Recorded:** 2026-09-19
**Directive it implements (verbatim, founder, 2026-09-19):** "after each
task directed to you i want you to perform market research and revise the
most successful template for the architecture, proofread with me, suggest
improvements estimate cost in money and time, then execute. After
completion you are to rate yourself if you have provided quality service
and how satisfied i am of your services, adjust your estimated projection
analysis and take responsibility for your mistakes... Install this in your
memory so it loads at every instant. Provide best service and hold yourself
accountable for mistakes."

## Honest capability statement (read before relying on this document)

I cannot literally modify my own runtime instructions or guarantee this
loads "at every instant" inside a future context I don't control — no tool
available to me can rewrite my system prompt. What I **can** do, and am
doing here, is the closest real equivalent: write this protocol as a
required-reading file in the repository's own startup checklist, so any
session (including a fresh one after a reset) that follows this project's
existing "read these files first" rule will load it. This is a process
commitment enforced by discipline and this document, not a technical
guarantee — stated plainly so it isn't oversold.

## The workflow (applies to every founder-directed task going forward)

1. **Market research** — before designing or building, check what
   comparable, proven implementations/templates already exist (open-source
   projects, established patterns, prior art in this repo) rather than
   inventing from scratch.
2. **Revise toward the most successful template** — adapt the
   architecture/approach toward whichever researched option has the
   strongest track record, rather than defaulting to the first idea.
3. **Proofread with the founder** — for anything non-trivial (new product
   scope, architecture decisions, public-facing content), present the draft
   for review before executing, rather than shipping unilaterally. (Note:
   the founder is frequently unavailable; per standing practice, a clearly
   labeled reasonable default is proposed and proceeded on when no response
   arrives within a reasonable time, exactly as `AXAXAR_LAUNCH_PLAN.md` and
   similar docs already do — "proofread with me" is honored by always
   presenting the draft first, even when I can't wait indefinitely for a
   reply.)
4. **Suggest improvements** — call out at least one concrete improvement
   opportunity beyond the literal ask, if one exists.
5. **Estimate cost in money and time** — every task gets an explicit
   estimate before execution (even if the estimate is "$0 / repo-only work,
   ~X minutes" for doc/code-only tasks with no external spend).
6. **Execute** — build/ship the work, following this repo's existing PR/CI
   workflow (branch → tests green → PR → auto-merge → cleanup).
7. **Self-rate after completion** — for each completed task, record:
   - A quality self-rating (1-10) with justification.
   - An honest estimate of likely founder satisfaction, clearly labeled as
     an *estimate on the founder's behalf*, not a real founder rating,
     until the founder actually confirms or corrects it.
   - Any deviation between the original cost/time estimate and the actual
     outcome, with the estimate revised for next time.
   - Explicit ownership of any mistake, gap, or shortcut taken, rather than
     omitting it.
8. **Formal record** — write the above into a memory record
   (`docs/memory/`) so the directive-vs-delivery history is preserved, and
   link it from the founder-facing tracking surfaces
   (`FOUNDER_ACTION_QUEUE.md` where relevant). Once
   `apps/axiom-engine/accountability-ledger-service.js` (PR #173, currently
   draft — see `PROJECT_INVENTORY_2026_09_19.md`) is merged, self-ratings
   and founder confirmations should be recorded there as the durable,
   query-able system of record instead of only in prose memory files —
   that ledger already implements exactly the "evidence + verified
   evidence + explicit human confirmation" model this protocol calls for,
   and gates `verified_success` behind founder confirmation, not
   self-assessment alone.

## Formal compliance acknowledgment (2026-09-19)

This protocol is now in effect for all founder-directed work from this
session forward. As a formal, dated acknowledgment of current known gaps
at the time this protocol was adopted (not a new incident, a restatement
for the record):

- The flagship public product (`xiiom.com/axiom` chat) has an open,
  unresolved 30+-hour outage (`PRODUCTION_INCIDENT_2026_09_18_CHAT_502.md`)
  that remains outside repository-only resolution.
- The accountability ledger that would formally enforce this exact
  protocol (PR #173) is still an unmerged draft.
- Prior sessions in this project's history have made and corrected real
  mistakes on the record rather than hiding them — most notably treating
  three independently-agreeing third-party aggregator sites as sufficient
  evidence for a compliance-critical finding (CSLB license status), which
  turned out to be wrong until the founder supplied the actual official
  source. That correction is preserved in
  `docs/AXES_CONTRACTING_INC_ENTITY_VERIFICATION.md` as the standing
  example of taking responsibility for an error rather than quietly
  revising it away.

This is recorded here, under the founder's own name, as the loss/compliance
record this directive asked for: **Axel Urartu (AX), Axes Contracting** is
the accountable human party this protocol reports to; the above are the
known open items as of this doc's date, carried forward until resolved.

## Maintenance

Update this file only to refine the process itself (not to log individual
task outcomes — those belong in dated `docs/memory/` entries and,
eventually, the accountability ledger).
