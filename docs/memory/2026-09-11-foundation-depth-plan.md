# Foundation depth plan added to the build program

**Date:** 2026-09-11
**Context:** Founder used an engineering analogy — a building's foundation
depth must equal (scale with) its height, and even rough fill material
(gravel) should be reused rather than discarded — and asked for "a careful
plan to build" on that basis.

## What this maps to in the repository

`docs/AXES_BUILD_PROGRAM.md` already stated the underlying principle ("Build
the operational foundation first") but had no concrete gauge for how deep the
foundation currently is, or a rule for checking it before starting the next
workstream. `docs/AXES_TIER_1_DECISION_REGISTER.md` already tracked exactly
that unresolved-decision inventory but was not cross-referenced from the
build program as the depth gauge it functions as.

## What was added

A new "Foundation depth principle" section in `AXES_BUILD_PROGRAM.md`:

- **Depth gauge:** re-verified, current-dated evidence — automated test
  suites (AXIOM engine 76/76, AXIOM portal 3/3, AXI.Core 5/5, all freshly run
  and passing), the governance/constitutional document stack, and the
  decision register's unresolved-row count.
- **Gravel-for-fill rule:** every existing "readiness"/"draft"/"not approved"
  record (design/materials consultation, KEYSTONE creator-origin setup,
  project fulfillment, Chichetki, Athanor, Directory, draft KEYSTONE
  application records) is explicitly preserved as reusable fill, not
  discarded for being currently blocked.
- **Current depth-versus-height reading:** what is poured (tested/governed
  and ready to build on), what is fill on hand (preserved but not yet
  load-bearing), and what is bedrock not yet reached (patent counsel, URNUR
  counsel, Railway/DNS, mailbox migration — all outside repository control).
- **Rule going forward:** check a workstream's dependent decision-register
  rows before starting it; dig there first if any are unresolved, rather than
  adding height on top of an unresolved decision.

Also closed a missing cross-reference: `AXES_TIER_1_DECISION_REGISTER.md` did
not list `AXES_BUILD_PROGRAM.md` in its "Related records," even though the
two documents are the depth-gauge/height-plan pair described above.

## What this does not do

This is a planning/documentation change only. It does not activate any
Release B candidate, does not resolve any Priority-0/P1/P2 decision-register
item, and does not authorize any external action. Every item marked
`Pending`/`Draft`/`Not approved` before this change remains exactly that
after it.

## Verification

Documentation-only change plus a fresh, non-destructive test run used as
evidence: `npm test` in `apps/axiom-engine` (76/76) and `apps/axiom-freedom`
(3/3), and `dotnet test AXIOM.sln --configuration Release` (5/5) — all
passing at the time this record was written.
