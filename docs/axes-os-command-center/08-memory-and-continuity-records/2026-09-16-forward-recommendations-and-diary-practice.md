# Recommendations for further study and improvement (2026-09-16 session)

**Date:** 2026-09-16

## Context

At the end of this session's work (PRs #84-#87: chat minimize toggle,
Workspace Library, governance records on unbounded-access requests, and the
bounded web-access capability), the following forward-looking
recommendations were raised for future sessions to consider. None of these
are implemented yet; they are recorded here so a future session can pick
one up without re-deriving it.

## Recommendations

1. **Sandboxed environment for email and browser-tab control.** Both
   remain unbuilt (see
   [`2026-09-16-web-email-access-scoping-followup.md`](2026-09-16-web-email-access-scoping-followup.md)
   and
   [`2026-09-16-web-access-capability-shipped.md`](2026-09-16-web-access-capability-shipped.md)).
   Before either is attempted, a dedicated sandboxed execution environment
   and a specific safety review are prerequisites — this is infrastructure
   work, not a routine service addition, and needs an explicit founder
   scope decision plus (for email) a real mailbox credential.
2. **Governance policies and automated enforcement as capabilities grow.**
   As more admin-gated capabilities are added (GitHub write, web-fetch, and
   whatever comes next), consider whether the existing allowlist/
   accountability pattern (`docs/AXI_AUTOMATION_SERVICE.md`,
   `docs/AXES_AGENT_ORIGIN_REGISTRY.md`) needs a lightweight automated
   check (e.g., a CI lint step) that every new admin route is
   default-disabled and documented, to keep the "off by default" pattern
   from silently regressing as the codebase grows.
3. **Scalable indexing/search for the Workspace Library.** `workspace.html`
   currently loads all four data sources client-side via `Promise.all` and
   filters with a simple substring search. This is fine at current data
   volumes but will not scale indefinitely — worth revisiting (e.g.
   server-side pagination/search) once source-catalog or service-registry
   entry counts grow meaningfully.
4. **Monitor and test the web-access feature after it is actually enabled.**
   `WebAccessService` (PR #87) is code-complete and tested in isolation,
   but has not been exercised against real, live external URLs, nor
   evaluated for security/performance under real traffic. Before or shortly
   after an operator sets `AXIOM_WEB_ACCESS_ENABLED=true` on a live
   deployment, budget time to test it against a variety of real pages and
   watch for gaps in the SSRF guard, timeout behavior, and truncation
   correctness that only show up with real-world content.

## Ongoing diary / proactive suggestions

The founder asked whether this session should keep a diary updated after
each session and proactively suggest next-priority areas. Answer: **yes,
and this is already the established practice** — every meaningful
milestone in this project is already recorded under `docs/memory/` per the
existing entry rules, and each entry customarily closes with either a
"next steps" section or (as here) explicit recommendations. This session
will continue that pattern; no new automation infrastructure was needed to
support it, since the mechanism already exists in the repository's own
conventions.
