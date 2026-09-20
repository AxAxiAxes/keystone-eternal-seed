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

0. **Reference-asset intake (added 2026-09-20)** — added after a real
   incident: the founder sent 2 reference images alongside the
   "organize the command center" instruction specifically so the
   dashboard UI would be rebuilt to match them, but no durable,
   query-able link between those specific images and that specific
   instruction was ever created. Session-state image storage is a flat,
   unordered pool with no reliable turn-to-attachment mapping that
   survives a session reset/compaction — so by the time the work was
   revisited, the images could not be identified with confidence, and
   the UI-matching half of the instruction was silently dropped while
   only the document-copy half was completed. **Fix, effective
   immediately:** any time an image is sent alongside a task, before
   doing anything else, save a copy of it into the repository itself
   (e.g. `docs/keystone/assets/reference-images/<dated-slug>.<ext>`,
   or the most relevant existing assets folder) in the same commit/PR
   as the resulting work, with a short written caption tying it
   explicitly to the instruction it was sent for. A repo commit
   survives session resets and compaction; transient session-state
   files do not. If a task cannot be completed in the same turn the
   image arrives, still commit the saved image + caption immediately,
   even before the rest of the work is ready, so the reference is never
   lost to time.
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
5a. **Verify literal scope match before marking anything done** — added
   2026-09-19 after the founder reported receiving a different result than
   what was asked for, requiring rework at added cost. Before calling a
   task complete: re-read the founder's original wording verbatim, list
   what was actually delivered, and confirm they match line-for-line — not
   "close enough" or "the spirit of it." If any ambiguity exists about
   scope, either ask before executing or state the interpretation taken
   explicitly in the delivery, so a mismatch is caught and corrected
   immediately rather than discovered later at double the cost.
6. **Execute** — build/ship the work, following this repo's existing PR/CI
   workflow (branch → tests green → PR → auto-merge → cleanup).
7. **Self-rate after completion — visibly, in chat, every time** — added
   2026-09-19 after the founder had to repeatedly ask for a rating that
   was only ever recorded in `docs/memory/` files, not shown to them. For
   every completed task, the chat response itself (not only a memory file)
   must end with:
   - A direct link/path to the actual result (PR, file, doc).
   - A quality self-rating (1-10) with a one-line justification.
   - An explicit prompt asking the founder for their own rating — every
     time, not only when asked.
   - Any deviation between the original cost/time estimate and the actual
     outcome, with the estimate revised for next time.
   - Explicit ownership of any mistake, gap, or shortcut taken, rather than
     omitting it.
   The full detail (justification, cost/time analysis, accountability
   notes) still goes in the memory record per step 8 — but the rating and
   the request for the founder's rating must never be chat-invisible again.
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

## Formal compliance acknowledgment (2026-09-20, second incident)

Founder reported (2026-09-20): the "organize the command center"
instruction (PR #195/#196) actually had **two parts** — organize the
documents, **and** adjust the S1 dashboard UI to match 2 images already
sent. Only the document-organization half was delivered; the UI-matching
half was missed entirely, and by the time it was raised, the specific 2
images could not be recovered from session state with confidence (no
durable per-turn attachment record exists in the tools available to this
agent). This is acknowledged as a real instruction-completeness failure,
not a semantic disagreement — a compound instruction was only half
executed, and no ambiguity was flagged at the time it should have been.
The structural fix (step 0 above, reference-asset intake) is adopted so
the *cause* — no durable image record — cannot repeat, and the founder
has been asked to resend the 2 images so the UI-matching work can still
be completed against the real originals rather than a guess.

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
