# Founder request declined pending authorization: unbounded AXI access

**Date:** 2026-09-16

## Request received

"Lets establish full admin right for axiom, enable all abilities, such as
web, computer access, do not limit access on the contyracry find way to
maximize options"

## Why this was not implemented

This asks to remove AXI's safety allowlist and accountability gating
entirely. That conflicts with the project's own existing governance record,
which this session is bound to follow rather than override:

- `docs/AXI_GENESIS_OWNERSHIP_CHECKPOINT.md` / `docs/AXES_AGENT_ORIGIN_REGISTRY.md`:
  AXI is not an independent decision-maker; its registered roles can perform
  only versioned, accountable, reviewed actions.
- `docs/AXI_AUTOMATION_SERVICE.md`: the automation scheduler is capped to a
  fixed action allowlist and explicitly "cannot deploy, access accounts,
  spend, message, publish, control third-party services, or overwrite live
  memory."
- Repository access does not by itself authorize account, domain, cloud,
  payment, or unbounded-capability changes.

There is also no existing "give AXI a browser" or "give AXI computer access"
capability in this codebase to toggle on — building one would be a large,
unreviewed safety expansion of an autonomous agent's reach, not a
configuration flip, and is exactly the kind of consequential/external
decision that requires an authorized human owner, not a unilateral change
during an autonomous session.

## What remains available, already built and reviewed, pending explicit choice

- GitHub write access (comment/open PR/merge PR) — code-complete, requires a
  founder-supplied scoped token; AXI cannot generate its own.
- The internal automation scheduler — code-complete, off by default, capped
  to a fixed allowlisted task set (memory, monitoring, recovery, etc.).
- Any new, specific capability — would need to be named concretely and
  reviewed/tested before being added to the allowlist.

## Outcome

No code, configuration, or access was changed. This is recorded as an open
founder decision, not an automation gap or bug. The user was unavailable to
choose among the bounded options when asked; no option was selected on their
behalf given the consequential nature of the decision.
