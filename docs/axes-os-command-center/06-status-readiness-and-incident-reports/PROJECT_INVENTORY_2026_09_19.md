# Full project inventory — every domain/repo, 2026-09-19

**Status:** Point-in-time inventory snapshot
**Recorded:** 2026-09-19
**Purpose:** One place that lists every domain/repo in the `AxAxiAxes` org,
what directive led to it existing, its current real status (verified, not
assumed), what's actually been completed, and a suggested next-scope
recommendation. This supplements — it does not replace —
`DOMAIN_PORTFOLIO.md` (domain registry), `PRODUCT_BRANCH_DOMAIN_MAP.md`
(branch↔domain cross-reference), and `FOUNDER_ACTION_QUEUE.md`
(profitability-ordered task list); those remain the living documents to
update going forward. This file is a dated checkpoint, not meant to be
edited in place after today.

## How this was compiled

Every repo under `AxAxiAxes` was listed via the GitHub API
(`gh repo list AxAxiAxes`), then each non-trivial one was opened to check
real file contents (not just the name) before being classified as
"active/real" vs. "reserved placeholder." Status claims about live
endpoints reuse the most recent verified checks already on record in this
repo's docs (cited inline) rather than re-guessing.

---

## Part 1 — Active projects with real content

| Project / domain | Directive that created it | Current status (verified) | Tasks completed | Suggested further scope |
| --- | --- | --- | --- | --- |
| **`keystone-eternal-seed`** (this monorepo) | Founding directive: build KEYSTONE/AXES/AXIOM as one governed monorepo | Actively maintained; 174+ merged PRs, 6/6 CI green on every merge, full test suites for `apps/axiom-engine` (Node) and `AXI.Core` (.NET) | Persistent chat memory (PR #73), AXIOM system prompt + date-awareness (PR #70), accountability ledger in review (PR #173, draft), origin-registry health checks, dozens of governance/ownership docs | Keep this as the single source of truth; resist creating parallel repos for things that belong here (see Part 3 duplication note) |
| **XIIOM / AXIOM public chat** — `xiiom.com` | Founder directive: free public constitutional AI chat | **Live but broken**: portal (`GET /axiom`) returns 200; chat (`POST /api/axiom`, `action:"chat"`) returns **HTTP 502, 30+ hours ongoing** as of this doc's date | Chat/date/identity/memory code is correct and tested (verified repeatedly); Railway billing upgraded to Pro (2026-09-18) | **Top priority: founder must check the Railway dashboard directly** (redeploy `axiom-engine` service, confirm `OPENAI_API_KEY`) — this is now purely an ops/credentials issue, not a code issue |
| **AXES Contracting Inc** — `axescontracting.com` | Founder's real, pre-existing licensed contracting business (CSLB #995577) | **License confirmed active** (expires 08/31/2028, corrected from a stale "suspended" aggregator reading); site `/` and `/health` failed to load from this tool on 2026-09-18 (unconfirmed if actually down or tool-blocked) | Entity verification, license correction, bond-renewal quickstart (now superseded/not needed) | Founder should personally confirm `axescontracting.com` loads in a real browser, then decide whether to launch the design/materials consultation offering (queue #2) — this is the readiest real revenue path in the whole portfolio |
| **`urartuhi.com`** art gallery | Founder's personal art site request | Live on GitHub Pages (`https://axaxiaxes.github.io/urartuhi.com/`); real domain not yet DNS-pointed at it; a Railway-backed AI "docent" widget was added by a separate/parallel effort (not this session) | Auto-caption automation script + workflow added (PR #1 on that repo); DNS/HTTPS investigated (apex + `www` correctly configured, cert pending) | Founder: point DNS, supply real artwork/captions for the 26 still-uncaptioned pieces (image content wasn't accessible to this tool to hand-write) |
| **`axaxar.com`** (draft commercial product) | User request: "start a new repo and prepare architecture... to launch Axaxar.com" | Scaffold repo with `ARCHITECTURE.md` only — no code, no deploy, no DNS; domain itself already registered by founder at SiteGround | Phase-0 proposed default scope table drafted and confirmed reasonable (product/customer/brand/pricing/domain) in `AXAXAR_LAUNCH_PLAN.md` | Needs founder sign-off on the proposed scope table (or edits) before Phase 1 (architecture review) begins — nothing should be built past scaffold until that happens |
| **`axiom-freedom`** (standalone legacy repo, distinct from `apps/axiom-freedom` in the monorepo) | Pre-monorepo original AXIOM deployment effort | Not actively maintained (last updated 2026-09-12); contains the original `AXIOM_SYSTEM_PROMPT.md` this whole engagement's identity work was ported from, plus Azure/Docker deployment scripts | Superseded in practice by `apps/axiom-freedom` inside the monorepo | Recommend the founder either archive this repo (to avoid confusion about which is authoritative) or explicitly document it as "source material only, not deployed" |
| **`axiom-engine`** (standalone legacy repo, distinct from `apps/axiom-engine`) | Unknown origin — pre-monorepo or experimental fork; a minimal Express stub, not the real chat service | Just cleaned up today: 16 stale automated "perf:" PRs (5 merged, 11 closed as superseded-by-conflict) | PR triage sweep completed 2026-09-19 | Confirm with the founder whether this repo is still needed at all — if it isn't deployed anywhere, consider archiving it too, same reasoning as `axiom-freedom` above |
| **`Class-Library-.NET-8-`** ("AXI.Core") | Earliest recorded repo (2026-06-07) — origin of the .NET AXI.Core codebase | Superseded by the `AXI.Core` project now living inside `keystone-eternal-seed` (covered by "AXI.Core tests" in CI) | N/A — historical origin point | Same archive-or-document recommendation as the two repos above |
| **`keystone-axiom-chronological-archive`** (private) | Founder request for a chronologically numbered archive of source materials | Private, standalone archive repo; not part of the active build/PR workflow | Serves its stated archival purpose | No action needed — this one is working as intended (a passive archive, not a live product) |

## Part 2 — Reserved domain placeholders (no product work yet)

Per the 2026-09-18 founder directive ("create a repo for all our domains"),
every tracked domain now has a same-named `AxAxiAxes/<domain>` repo
containing only a `README.md` describing its parked status. **None of these
have application code, DNS, hosting, or an account/payment setup** — this is
namespace reservation only, confirmed unchanged since 2026-09-18.

| Domains (all: `README.md` only, parked) | Directive | Status | Suggested scope |
| --- | --- | --- | --- |
| `axoux.com` | Domain reservation pass | Parked — creator/collaboration pilot candidate | Do not build until an invite-only pilot is explicitly scoped (per `DOMAIN_PORTFOLIO.md` rollout order) |
| `auxaous.com` | Domain reservation pass | Parked — self-design/reflection tools candidate | Needs privacy/moderation/safeguarding design before any build |
| `urnur.com` | Domain reservation pass | Parked — future currency/banking concept | **Blocked** on founder legal/financial scope decision (queue #6); no code should be written here regardless of "auto-merge" defaults |
| `axaxaxu.com`, `axianaxiunaixia.com`, `axaxiaxes.com`, `axaxes.com`, `uxaxu.com`, `owawawao.com`, `aulaux.com` | Domain reservation pass | Parked — no defined product | Each needs a one-paragraph product brief from the founder before any work starts |
| `axpur.com` | Domain reservation pass | **Registration status still unverified** — flagged since 2026-09-09 | Founder should confirm this is actually owned before it's tracked further |
| `uxruxu.com`, `axtux.com`, `nuxiux.com`, `nuxuxun.com`, `uxaxaxu.com`, `xaxux.com`, `uxrax.com`, `haiuhi.com`, `axrux.com`, `axraxrax.com`, `axtamar.com`, `axaxox.com`, `axaxau.com`, `axarar.com`, `axaxur.com`, `axelurartu.com` | Domain reservation pass (2026-09-18 SiteGround list) | Parked — registrar-verified ownership, no assigned product | Same as above: no work until a product brief exists per domain |
| `zzz-archived-test-repo-delete-me` | Debugging artifact from the 2026-09-18 domain-repo-creation pass | Already archived; harmless leftover (this session's token lacks `delete_repo` scope to remove it) | Founder can delete manually from GitHub settings whenever convenient — no urgency |

---

## Part 3 — Suggested further scope (cross-cutting recommendations)

1. **Fix the AXIOM chat outage first.** Everything else in the portfolio is
   secondary while the flagship free product is down 30+ hours. This is a
   founder-only action (Railway dashboard/API keys) — repo-side diagnosis is
   exhausted.
2. **Pick one revenue lane and commit.** AXES Contracting (real, licensed,
   confirmed active) is the readiest path — more so than Axaxar.com (draft,
   phase 0) or the design/materials consultation concept (not yet approved).
   Recommend approving the AXES Contracting client-intake flow as the first
   paid offering before starting new product lines.
3. **Reduce repo duplication/confusion.** Three repos now exist that look
   like predecessors of things the monorepo already does better:
   `axiom-freedom`, `axiom-engine` (both standalone), and
   `Class-Library-.NET-8-`. None are actively broken, but their existence
   alongside the monorepo's `apps/axiom-engine` and `apps/axiom-freedom`
   risks someone editing the wrong copy (as happened with the 16 stale perf
   PRs cleaned up today). Suggest the founder decide: archive, or keep as
   clearly-labeled "historical source only."
4. **Domain sprawl is currently safe but non-productive.** 20+ parked
   domains cost only registrar renewal fees and carry no security/product
   risk as long as they stay placeholder-only. Resist the urge to "activate"
   more than one or two at a time — each one needs its own moderation,
   privacy, and legal review before any public-facing build starts (this is
   explicit in `DOMAIN_PORTFOLIO.md` and was reinforced by the CSAM-related
   moderation gap noted for the image-upload/avatar concept, queue #13).
5. **Keep the accountability ledger (PR #173) moving.** It's still a draft
   from a Copilot cloud agent; once marked ready, its CI will run
   automatically and it's a good candidate for auto-merge given its
   described test coverage — this gives the founder exactly the
   directive-vs-delivery visibility this inventory doc is trying to provide
   manually today.

## Maintenance

This is a dated snapshot. For the living, continuously-updated views, use:

- `docs/DOMAIN_PORTFOLIO.md` — domain registry and hosting plan
- `docs/keystone/PRODUCT_BRANCH_DOMAIN_MAP.md` — branch↔domain cross-reference
- `docs/keystone/FOUNDER_ACTION_QUEUE.md` — profitability-ordered next actions
