# AXES Tier 1 decision register

**Status:** Internal coordination record; no pending decision is approved by
this document
**Recorded:** 2026-09-11
**Owner:** Founder or named human delegate
**Purpose:** Keep the next founder-controlled decisions, external-action
boundaries, and evidence requirements visible across the AXES early-revenue
and continuity program.

## Operating rule

This register tracks decisions; it does not authorize a price, service,
publication, external account change, deployment, legal engagement, payment,
provider action, financial feature, or claim. An item moves from pending only
when the named human decision and its referenced evidence are recorded in the
appropriate private or repository-controlled record.

## Current decision queue

| Priority | Decision | Current state | Required evidence before resolution | Human-controlled boundary |
| --- | --- | --- | --- | --- |
| P0 | Restore provider-backed production chat, if the founder chooses to operate it | **Progress 2026-09-12: `OPENAI_API_KEY` issue resolved; a new, different error appeared.** The founder redeployed `lucid-flow`'s `axiom-engine` after setting the key. A live retest now returns **HTTP 502 `{"error":"AXIOM chat is temporarily unavailable"}`** — a different status and message than the prior `503 "AXIOM chat is not configured"`, confirming the key is now accepted and the engine is reachable; this is a new failure, most likely from OpenAI's API itself (for example an invalid/malformed key, no billing or quota on the OpenAI account, or an inaccessible `OPENAI_MODEL` value) rather than a redeploy timing issue — retested twice 15 seconds apart with an identical result both times. The specific upstream cause was previously **unlogged and undiagnosable**: `apps/axiom-engine/index.js`'s error middleware returned `error.message` to the caller but never logged it, and `apps/axiom-freedom/server.js`'s catch block only logged the failure category, not the message; both call sites now also log `error.message` so the exact OpenAI-side cause will appear in each service's Railway logs on the next attempt | Live `POST https://xiiom.com/api/axiom` (`action: "chat"`) test, HTTP 502, body `{"error":"AXIOM chat is temporarily unavailable"}`, stable across two attempts 15 seconds apart. Source inspection of `apps/axiom-engine/chat-service.js` (this generic message/502 fires from either an OpenAI non-2xx response or a missing `output_text` in its reply) and `apps/axiom-freedom/server.js` (`/api/axiom` only special-cases a `503`; any other `error.statusCode` falls through to this same generic 502, whether from OpenAI or a transient reachability issue) | Authorized Railway operator should redeploy both `axiom-engine` and `axiom-web` once this fix is merged (or confirm auto-deploy picked it up), retry chat once, then open `lucid-flow` > `axiom-engine`'s Deployments > logs and look for a line starting `AXIOM engine request error:` — its exact message (for example `OpenAI returned HTTP 401`, `OpenAI returned HTTP 429`, or `OpenAI response did not contain output_text`) will identify the precise next step (fix the key value, enable OpenAI billing/quota, or correct `OPENAI_MODEL`). Requires authorized external Railway/OpenAI account access; nothing further can be diagnosed or fixed from this repository alone |
| P0 | Keep `xiiom.com` and all Railway services online past the current trial period | **New 2026-09-12; confirmed account-wide, not per-project.** The same "24 days or $4.62 left, upgrade to keep your services online" banner was observed both from the Projects list and from inside `lucid-flow`'s own dashboard view, confirming this is one shared account-level trial balance covering every project and service, not a separate quota per project. Also observed: `axiom-freedom`'s Networking tab reports **"You have hit the custom domain limit for your plan"** — the trial plan cannot add another custom domain (such as `axescontracting.com` or `www.xiiom.com`) without upgrading | Founder-reviewed Railway billing/plan page showing current plan, remaining credit or trial window, the specific date/threshold at which services would be suspended if not upgraded, and the custom-domain limit for each candidate paid plan | This is a billing decision requiring the founder's Railway account access and payment method; it cannot be assessed, authorized, or acted on from this repository. If the trial lapses without action, all services in both projects are at risk of going offline; separately, the custom-domain limit already blocks the pending `axescontracting.com` connection (P2 row below) regardless of the trial timer |
| P0 | Merge PR #1 (`axaxiaxes-axes-directory-data-model` → `axaxiaxes-axiom-monorepo`) to deploy the built AXI agent/automation governance system | **Resolved 2026-09-12.** Founder authorized autonomous merging in-session; PR #1 merged (`e9d4f98`), followed by PR #2 (chat-diagnostics/engine-error-forwarding fix, `9b68843`) and PR #3 (vendor/subscription audit checklist, `a2960e8`). All CI green on each merge. Post-merge live check confirmed `xiiom.com/health` returns `{"status":"ok"}`, `/origin-continuity` renders the expected content, and `/support` still correctly returns 401 without credentials | Founder go-ahead was given for autonomous merging in this session; future merges of this scale should still get an explicit founder go-ahead per this row's original intent | Redeploy occurred automatically via Railway's existing branch integration; no manual Railway/DNS action was taken or required |
| P0 | Determine patent/invention filing status and preservation path | Pending | Founder-reviewed private source/filing inventory, dates, and qualified counsel scope if pursued | Requires founder decision and any professional engagement outside this repository |
| P0 | Define URNUR's permitted scope | Pending | Written legal/compliance guidance for the actual proposed jurisdiction and feature scope | Financial, banking, currency, token, marketplace, trading, and collectible-exchange work remains inactive |
| P1 | Activate AXES design/materials consultation candidate `AXES-DMC-001` | Not approved | Completed activation record, scope, owner, price basis, terms, capacity, rights/accessibility review, and low/base/high assumptions | No publication, outreach, paid delivery, or professional-service claim before founder approval |
| P1 | Activate KEYSTONE creator-origin setup candidate `KEYSTONE-COS-001` | Not approved | Completed activation record, private data handling, terms, capacity, legal/privacy review, and low/base/high assumptions | Recordkeeping only; no legal conclusion, filing, enforcement, public registry, payment, or financial service |
| P1 | Run a productivity-tool evaluation | Not measured | Founder-reviewed non-sensitive test with manual baseline, assisted time, correction time, quality decision, and permitted account/data settings | Do not use private material or claim productivity savings before measured review |
| P1 | Advance AXIOM Engine and AXIOM Freedom draft registry records | Draft / unverified | Named human owner, Ux relationship, verified source/credit record, bounded authority scope, data/retention record, security/continuity review, and release decision | No KEYSTONE Origin Unit authority, legal-right conclusion, deployment authorization, or public claim from draft records |
| P1 | Approve a specific source asset for reuse | Not approved | Individual asset-use record with source, rights basis, credit/consent, accessibility, privacy, technical-quality, and human decision | Keep private archives and excluded references private; no provider or public reuse without approval |
| P2 | Connect AXES Contracting domain and complete email migration | Pending | Founder-approved access inventory, rollback plan, exact provider records, and post-change verification. **Verified 2026-09-11:** `axescontracting.com`/`www.axescontracting.com` still resolve via `ns1.siteground.net` (legacy SiteGround), not Railway; HTTPS fails with an expired certificate; plain HTTP returns stale legacy content, not the `axiom-web` portal. See `RAILWAY_DEPLOYMENT.md` "Current deployment state." The destination once connected is now a **private, admin-gated command center** (root requires `ADMIN_PASSWORD`), not a public hub page. **Update 2026-09-12:** the `axiom-freedom` service's Networking tab reports the account has already hit its custom-domain limit (`xiiom.com` occupies the one slot available on the current plan), so this connection is also blocked on a plan upgrade, independent of the DNS/registrar work | Requires authorized Railway, DNS, and mail-provider action; do not change settings from this repository |
| P2 | Prepare AXES OS backup/restore phase | Planned | Founder-approved private encrypted backup destination, retention policy, checkpoint transfer, and documented restore drill | No private data transfer or infrastructure procurement without explicit approval |
| P2 | Confirm Railway redeployed `xiiom.com`'s `axiom-web` service after PR #6 merged (`56d71d1`) | Pending | New routes `/design-desk` and `/axescontracting` still returned 404 on `xiiom.com` roughly 10 minutes after merge, while `/health` and `/materials` responded normally; this needs an authorized operator to check the Railway dashboard's deployment history/logs for the `axiom-web` service to confirm the build triggered, succeeded, and rolled out | Requires authorized Railway dashboard access; no deploy can be triggered or inspected from this repository |
| P2 | Review whether the `handsome-motivation` Railway project is needed, or is unused capacity drawing down the shared trial balance | Pending | **Confirmed 2026-09-12** that `lucid-flow` (not `handsome-motivation`) is the real production project (see P0 chat row). `handsome-motivation`'s `spirited-victory` service runs the same `apps/axiom-engine` code but with a public domain exposed (a deviation from this repository's documented "never create a public domain for axiom-engine" rule); its other service, `nodejs`, is tied to an unrelated, disconnected source repo (`alphasecio/nodejs`), consistent with leftover/template clutter rather than an intentional AXES deployment | Founder must confirm in the Railway dashboard whether `handsome-motivation` is intentionally used for anything (e.g., staging) before deleting it or its services; do not assume it is safe to remove without that confirmation, and no deletion can be performed from this repository |

## Evidence and review cadence

At least weekly, the founder or named human delegate reviews this queue with
the project timeline, budget, evidence ledger, asset-use register, and
application draft records. A review may continue, pause, retire, or reorder a
candidate, but must not mark an item complete without its required evidence.

For income candidates, use `AXES_TIER_1_EVIDENCE_LEDGER.md`; actual revenue,
cost, client, and payment records remain private. For productivity, record
only measured results. For assets, use `AXES_ASSET_USE_READINESS.md`; private
archive contents remain excluded from the repository.

## Related records

- `AXES_BUILD_PROGRAM.md` (this register is the foundation-depth gauge its
  "Foundation depth principle" section checks before each workstream starts)
- `PROJECT_TIMELINE.md`
- `FOUNDER_REVENUE_PRIORITY_OVERLAY.md`
- `KEYSTONE_TIER_1_AUTOMATION_AND_INCOME_PLAN.md`
- `AXES_TIER_1_EVIDENCE_LEDGER.md`
- `AXES_DESIGN_MATERIALS_CONSULTATION_READINESS.md`
- `KEYSTONE_CREATOR_ORIGIN_SETUP_READINESS.md`
- `AXES_ASSET_USE_READINESS.md`
- `keystone/AXIOM_APPLICATION_DRAFT_RECORDS.md`
- `PROJECT_BUDGET.md`
