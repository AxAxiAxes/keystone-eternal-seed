# Follow-up: how to further enable AXI web/email/browser access

**Date:** 2026-09-16

## Request

"how can we further enable his access to web email, tab, etc.."

## Response given (no code change)

Explained the required pattern for each, matching how GitHub access was
built (named, scoped, admin-gated, opt-in, human-supplied credential where
applicable — never self-granted):

- **Web reading**: would add a single new admin-gated route
  (`POST /system/web/fetch { url }`) that fetches one URL server-side and
  returns sanitized text. Not general browsing — no navigation, clicking,
  or JS execution. Needs a safe-fetch policy (block internal/private IPs,
  cap response size) and a decision on public vs. admin-only exposure.
- **Email**: needs a real mailbox and protocol choice (read-only IMAP or a
  provider API), plus a founder-supplied, scoped (ideally read-only)
  credential. Sending mail would be a separate, later, higher-risk decision.
- **Browser-tab control**: a much larger risk surface (can interact with
  arbitrary sites and logged-in sessions); not something to add to this
  codebase without a dedicated sandboxed environment and dedicated safety
  review — explicitly out of scope for a routine implementation step.

## Why nothing was built yet

Asked the founder which one to scope and build first; founder was
unavailable ("work autonomously"). This request was **not** treated as
routine ambiguity to resolve alone:

- Email cannot be implemented without a real, founder-supplied mailbox
  credential that does not exist yet — there's nothing to wire up.
- Adding a new web-fetch capability changes AXI's safety surface (it can now
  reach arbitrary external content) and is exactly the kind of consequential,
  external capability expansion the project's own governance docs
  (`docs/AXI_AUTOMATION_SERVICE.md`, `docs/AXI_GENESIS_OWNERSHIP_CHECKPOINT.md`)
  reserve for explicit, authorized decisions, not something to add
  speculatively in an autonomous session.

## Outcome

No code, configuration, or credential was added. This is an open founder
decision: pick one bounded option (web fetch, email, or something named
concretely) and, for email, provide the mailbox + scoped credential. See
also
[`2026-09-16-unbounded-access-request-declined.md`](2026-09-16-unbounded-access-request-declined.md)
for the related prior decision on unrestricted access.
