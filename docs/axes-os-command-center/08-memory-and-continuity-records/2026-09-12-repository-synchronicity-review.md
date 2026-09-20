# 2026-09-12 Repository synchronicity review

## Context

The founder noticed, from their own GitHub profile page, that four
repositories still exist (`keystone-eternal-seed`, `axiom-freedom`,
`axiom-engine`, `Class-Library-.NET-8-`) despite this monorepo's README
claiming to consolidate them, and asked whether they should be merged into
one, reviewed for synchronicity and "meaning evaluation," plus an updated
crisis report.

## What was checked

Read-only `gh repo view`, `gh pr list`, `gh run list`, and `gh api` calls
against all three standalone repositories. Nothing was pushed, edited,
configured, or deleted in any of them; this session has no Azure, DNS, or
GitHub Actions-secret access to any of the three.

## Findings

- **`axiom-engine`**: last push 2026-09-06T23:15:47Z, zero pull requests
  ever. Fully absorbed, no drift, safe to treat as historical only.
- **`Class-Library-.NET-8-`**: last push 2026-06-07T15:20:58Z, zero pull
  requests ever. Fully absorbed, no drift, safe to treat as historical only.
- **`axiom-freedom`**: **not dormant.** Two merged PRs: #2 (2026-09-05,
  before this monorepo's 2026-09-09 consolidation date, already captured)
  and **#1, merged 2026-09-12T11:06:21Z** — same day as this session, ~6
  minutes before this session's own PR #31 merge. PR #1 was authored by
  `copilot-swe-agent[bot]` (a separate GitHub Copilot coding-agent session,
  not this interactive session) on branch `copilot/automate-axiom-deployment`
  and adds an entirely separate Azure/Terraform/GitHub Actions deployment
  pipeline plus a Microsoft Copilot Studio provisioning script, targeting a
  different cloud provider than the Railway path this monorepo has been
  actively debugging all session.
- The resulting `deploy-axiom.yml` workflow run failed immediately: Azure
  service-principal secrets (`ARM_TENANT_ID`/`ARM_CLIENT_ID`/
  `ARM_CLIENT_SECRET`/`ARM_SUBSCRIPTION_ID`) are unset in that repository,
  so `az login` rejected the request and Terraform never ran `apply`. **No
  Azure resource exists and no cloud spend has occurred.** A separate
  Docker-image-publish job did succeed, pushing to `ghcr.io` using only the
  automatic `GITHUB_TOKEN` (free, no external vendor).

## What this means

Two different Copilot-driven work-streams have been building "AXIOM
deployment" independently: this monorepo's Railway path (actively
maintained, several crash/route fixes this session) and the standalone
`axiom-freedom` repo's new Azure/Terraform path (built today, inert due to
missing credentials). Neither referenced the other. This is exactly the
kind of fragmentation risk the founder's question anticipated. It is
currently inert/low-risk (no spend, no DNS applied), but left unreconciled
it risks real spend if secrets are later added, a DNS conflict (the
Terraform's optional Azure DNS zone targets the same conceptual domains
`docs/DOMAIN_PORTFOLIO.md` already governs via Railway/SiteGround), and
continued duplicated founder/agent effort.

## What was produced

- New row + full detail section in
  `docs/AXI_ETERNAL_ORIGIN_VALUE_AND_CRISIS_REGISTER.md`
  ("2026-09-12 Parallel repository deployment-automation finding").
- New P0 row in `docs/AXES_TIER_1_DECISION_REGISTER.md`.
- `README.md`'s "Source provenance" list annotated with each repository's
  actual current status, so this doesn't need rediscovery.
- `PROJECT_TIMELINE.md` row and this memory entry.

## What was explicitly not done

No repository was archived, deleted, or merged. No Azure, DNS, or GitHub
Actions secret was viewed, created, or changed (none of this session's
tooling has that access). No judgment was made on whether Azure or Railway
is the "right" long-term path — that is a founder architecture decision.

## Next steps

Founder decision on the new P0 decision-register row: keep Railway as sole
canonical path (and decide whether to port, or decline, the new Terraform/
Copilot-Studio material before archiving the standalone repo), keep both
intentionally, or direct future Copilot sessions to only target this
monorepo. `axiom-engine` and `Class-Library-.NET-8-` can be archived now
with no loss, independent of that decision, whenever the founder chooses.
