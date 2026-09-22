# Product branch ↔ domain synchronization map

**Status:** Coordination summary — read `DOMAIN_PORTFOLIO.md` (full domain
registry), `FOUNDER_ACTION_QUEUE.md` (profitability-ordered task list), and
`AXES_TIER_1_DECISION_REGISTER.md` (full evidence) for underlying detail.
**Recorded:** 2026-09-18
**Purpose:** Every active product/workstream ("branch") in this project is
tracked in a different document, and not every branch has a domain, a repo,
and a queue item recorded together in one place. This file cross-references
them so nothing drifts out of sync — if a branch is missing a row here, or a
row is missing a domain/repo/queue link, that itself is the gap to close.

## Map

| Branch | Domain(s) | Repo | Live status | Related queue item(s) | Detail doc |
| --- | --- | --- | --- | --- | --- |
| AXES Contracting (hub / private command center) | `axescontracting.com` | `keystone-eternal-seed` (`apps/axiom-freedom`); placeholder namespace also reserved at `AxAxiAxes/axescontracting.com` | Registrar-verified; a 2026-09-18 fetch of `/` and `/health` failed at the transport level (DNS/TLS) from this environment — unconfirmed whether it's actually down or blocked to the tool | #1 (Railway billing, shared host), #3 (DNS/cert), #4 (repo visibility) | `DOMAIN_PORTFOLIO.md` |
| XIIOM / AXIOM public chat | `xiiom.com` | `keystone-eternal-seed` (`apps/axiom-engine` + `apps/axiom-freedom`); placeholder namespace also reserved at `AxAxiAxes/xiiom.com` | Portal/history endpoints live (200); **chat POST returning HTTP 502 — open incident** | #0 (urgent outage), #1 (Railway billing) | `PRODUCTION_INCIDENT_2026_09_18_CHAT_502.md` |
| First paid AXES service (design/materials consultation) | `axescontracting.com` (same public front door) | `keystone-eternal-seed` | Not yet activated — awaiting founder approval | #2 | `AXES_DESIGN_MATERIALS_CONSULTATION_READINESS.md` |
| KEYSTONE creator-origin setup (2nd paid offering) | none dedicated yet — would sit behind the same front door until scoped otherwise | `keystone-eternal-seed` | Readiness/template drafted, not activated | #5 | `KEYSTONE_CREATOR_ORIGIN_SETUP_READINESS.md` |
| AXOUS / AXOUX creator studio | `axoux.com` | `keystone-eternal-seed`; placeholder namespace reserved at `AxAxiAxes/axoux.com` | Parked; reference/catalog only, no build | Not currently on the queue (pre-revenue pilot, ranked below item #9 in `DOMAIN_PORTFOLIO.md` rollout order) | `AXOUS_CREATOR_STUDIO_READINESS.md` |
| AUXAOUS self-design/reflection | `auxaous.com` | placeholder namespace reserved at `AxAxiAxes/auxaous.com` (README only) | Parked; no readiness doc drafted yet | Not currently on the queue | `DOMAIN_PORTFOLIO.md` only |
| URNUR (future currency/banking) | `urnur.com` | `keystone-eternal-seed`; placeholder namespace reserved at `AxAxiAxes/urnur.com` | Parked pending legal/banking review | #6 (scope), #8 (name-value concept reconciliation) | `URNUR_FINANCIAL_READINESS.md`, `URNUR_EVOLVING_NAME_VALUE_CONCEPT.md` |
| Athanor (eternal seed vessel / game console concept) | none assigned — candidate parked domains exist (`owawawao.com`, `aulaux.com`, `uxaxu.com`, etc., each now with a reserved placeholder repo) but none is officially designated for it | `keystone-eternal-seed` | Concept-stage only | #9 | `ATHANOR_ETERNAL_SEED_VESSEL_CONCEPT.md`, `ATHANOR_GAME_CONSOLE_READINESS.md` |
| Axaxar.com (new commercial product, draft) | `axaxar.com` (registered at SiteGround, no DNS pointed yet) | separate repo `AxAxiAxes/axaxar.com` (scaffold + architecture draft only) | Draft plan awaiting founder scope answers (phase 0) | **Not currently on `FOUNDER_ACTION_QUEUE.md` — gap identified and added below as item 10** | `AXAXAR_LAUNCH_PLAN.md` |
| Urartuhi art gallery | `urartuhi.com` (not yet DNS-connected) | separate repo `AxAxiAxes/urartuhi.com` | Live now on GitHub Pages at `https://axaxiaxes.github.io/urartuhi.com/`; placeholder artwork only, real domain not pointed at it | **Not currently on `FOUNDER_ACTION_QUEUE.md` — gap identified and added below as item 11** | `docs/memory/2026-09-17-urartuhi-gallery-site-created.md` |

## AI-Interaction and other cross-cutting items (no single domain)

| Branch | Related queue item(s) | Detail doc |
| --- | --- | --- |
| AXI inter-AI external interaction scope | #7 | `AXI_EXTERNAL_INTERACTION_READINESS.md` |

## Gaps found and closed by this pass

Two active, repo-backed workstreams (`axaxar.com` draft plan, `urartuhi.com`
gallery site) existed with their own repos and detail docs but were never
added to `FOUNDER_ACTION_QUEUE.md`, so they were invisible in the founder's
single-page task view. Added as queue items #10 and #11 (see
`FOUNDER_ACTION_QUEUE.md`) so every branch with founder-facing next steps is
tracked in one place.

## 2026-09-18: all 31 domains now have a reserved GitHub repo

Per founder request ("create a repo for all our domains"), every domain
tracked in `DOMAIN_PORTFOLIO.md` now has a same-named placeholder repo under
`AxAxiAxes` (29 newly created this pass; `axaxar.com` and `urartuhi.com`
already existed and were left untouched). See the "Repo" column above and
the 2026-09-18 update section in `DOMAIN_PORTFOLIO.md` for the full list.
**Known cleanup item:** a stray `AxAxiAxes/test-domain-repo-delete-me` repo
was created while debugging the GitHub API call for this pass. The
repository-access token used here lacks the `delete_repo` scope, so it
could not be removed automatically — the founder should delete it manually
from GitHub settings when convenient. It contains no real content.

## Maintenance

When a new domain-named repo or product branch is created, add a row here in
the same pass — this keeps the domain registry, the queue, and the
per-branch detail docs from drifting out of sync with each other.
