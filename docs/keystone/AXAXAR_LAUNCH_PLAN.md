# Axaxar.com launch plan (DRAFT — pending founder confirmation)

**Recorded:** 2026-09-18
**Status:** Draft architecture/plan prepared for founder review. Not yet
approved, not yet funded, not yet deployed.
**Related repo:** https://github.com/AxAxiAxes/axaxar.com (created 2026-09-18,
empty scaffold + architecture draft only)

## Why this document exists, and the assumption it makes

The founder asked for "a detailed plan under keystone documentation" and a
new repository with an architecture ready for review "to launch Axaxar.com."
`Axaxar.com` does not appear anywhere earlier in this repository's history,
memory records, or governance documents — there is no prior product
definition, target market, feature list, or pricing model on record for it.

Because the immediately preceding conversation turn was about starting
money-making work for the AXES/AXIOM ecosystem, this plan proceeds on the
following **explicit, stated assumption**, to be confirmed or corrected by
the founder before any real build or spend happens:

> **Assumption:** Axaxar.com is a new, separately branded **commercial
> product** in the AXES/KEYSTONE family — most likely a paid or
> subscription AI-assisted service built on the same underlying engine
> patterns already proven in `apps/axiom-engine` (chat, memory, automation),
> but marketed and monetized independently from the free public AXIOM chat
> at xiiom.com.

If that assumption is wrong, everything below should be treated as a
structural template to retarget, not a locked decision.

## What is already true and verified (repository evidence)

- No `axaxar` name, repo, domain record, or product spec existed anywhere in
  `AxAxiAxes/keystone-eternal-seed` before this plan.
- The AXES org currently has these public/private repos: `keystone-eternal-seed`,
  `axiom-engine`, `axiom-freedom`, `urartuhi.com`,
  `keystone-axiom-chronological-archive`, `Class-Library-.NET-8-`.
- No legal business-entity registration is confirmed in repository records
  (`docs/memory/2026-09-11-founder-authority-business-status.md`,
  `docs/memory/2026-09-11-agent-deployment-gap-and-ip-company-status.md`).
- No payment/billing code exists in any AXES repo today.
- `apps/axiom-engine` already has working, tested building blocks that a new
  product can reuse: OpenAI-backed chat (`chat-service.js`), append-only
  memory (`memory-store.js`), usage metering (`usage-store.js`), automation
  service, monitoring, and a Railway deployment pattern
  (`apps/axiom-engine/railway.json`, `docs/RAILWAY_DEPLOYMENT.md`).

## What was done in this pass

1. Created a new, empty GitHub repository:
   **https://github.com/AxAxiAxes/axaxar.com** (public, matches the
   `urartuhi.com` naming convention already used for a domain-named repo in
   this org).
2. Added a draft `README.md` and `ARCHITECTURE.md` in that repo describing a
   proposed technical architecture, explicitly marked DRAFT, for founder
   review — no code, no deployment, no domain/DNS/payment setup.
3. Recorded this plan here, under `docs/keystone/`, per the founder's
   request to keep a KEYSTONE-documented trail of the decision.

## What this explicitly does NOT do

- Does not purchase, register, or point DNS for the `axaxar.com` domain.
- Does not create any payment-processor, banking, or vendor account.
- Does not form or register a legal business entity.
- Does not deploy anything to Railway or any hosting provider.
- Does not commit to a pricing model, target market, or feature set — those
  are founder decisions the architecture doc leaves as open questions.
- Does not move or duplicate any AXIOM/XIIOM production data or credentials
  into the new repo.

These are the same authority-boundary categories called out in this
project's startup protocol (domain, DNS, payment, vendor, legal, account
changes require explicit founder authorization beyond repository access).

## Proposed phased plan (mirrors the AXES OS migration phase model already
used in `PROJECT_TIMELINE.md`)

| Phase | Objective | Exit criteria |
| --- | --- | --- |
| 0 — Scope confirmation | Founder confirms or corrects the product assumption above: what Axaxar.com actually is, who it's for, and how it differs from the free AXIOM chat | Written one-paragraph product definition from the founder |
| 1 — Architecture review | Founder reviews `ARCHITECTURE.md` in the new repo and approves/edits the proposed stack, auth, and billing approach | Founder sign-off or revision requests recorded |
| 2 — Scaffold build | Build the confirmed architecture's skeleton (service boilerplate, tests, CI) in `axaxar.com`, reusing `axiom-engine` patterns where they fit | Skeleton passes its own test suite; no external accounts touched yet |
| 3 — Account/legal readiness | Founder (not the agent) sets up domain DNS, any required legal entity, and a payment-processor account | Founder confirms each external account exists and shares only the minimum config the agent needs (e.g. env var names, not raw secrets in chat) |
| 4 — Integration | Wire confirmed billing/auth into the built skeleton using founder-provided configuration, following the same env-var pattern as `apps/axiom-engine/.env.example` | Test suite covers billing/auth paths without live secrets committed |
| 5 — Staged deploy | Deploy to a non-production environment first (mirrors `PROJECT_TIMELINE.md`'s staging-before-cutover discipline) | Verified health checks, monitoring, and rollback path |
| 6 — Launch | Founder approves go-live; DNS cutover and public announcement | Founder-approved launch checklist complete |

## Open questions for the founder (blocking phase 0 → 1)

1. What does Axaxar.com actually do for a paying user? (e.g., a specialized
   AI assistant, a tool/SaaS product, a marketplace, something else?)
2. Who is the target customer — consumer, business, or both?
3. Is this meant to reuse the AXIOM/KEYSTONE engine and brand voice, or be a
   fully independent product with its own identity?
4. What pricing model is intended (subscription, usage-based, one-time)?
5. Is there already a domain registrar account for `axaxar.com`, or does one
   need to be created?

## Next step

Awaiting founder answers to the open questions above, or explicit
confirmation of the stated assumption, before moving past Phase 0.
