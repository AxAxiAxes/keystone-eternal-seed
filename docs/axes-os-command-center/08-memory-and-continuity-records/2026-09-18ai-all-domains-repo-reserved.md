# Reserved a GitHub repo for every tracked domain; confirmed auto-merge already automatic

**Date:** 2026-09-18

## What was requested

The founder asked to "push all approval automatically, and create a repo
for all our domains please." A follow-up message confirmed "there are 31"
domains.

## What was found: approval is already automatic

Checked branch protection on `axaxiaxes-axiom-monorepo` via
`gh api repos/AxAxiAxes/keystone-eternal-seed/branches/.../protection`. It
requires only the 6 CI status checks already documented in this project's
PR workflow — **no required human approving review is configured.** Every
PR opened with `gh pr merge <n> --auto --squash` (the standing workflow
used throughout this session) already merges automatically as soon as CI
passes, with no manual approval gate. No change was needed to make this
true; it already was.

## What was done: one GitHub repo per domain

Compiled the full 31-domain list from `DOMAIN_PORTFOLIO.md` (12 from the
2026-09-09 registry + 19 unique newly reported/confirmed on 2026-09-18,
deduplicated) — this matches the founder's "there are 31" count exactly.

Of the 31, two already had dedicated repos (`axaxar.com`, `urartuhi.com`)
and were left untouched. Created placeholder GitHub repos for the
remaining 29, each containing only a `README.md` stating: the domain's
current product role (pulled from `DOMAIN_PORTFOLIO.md`), that it is a
reserved namespace with no application code yet, and that founder approval
plus a scoped product brief is required before building there — no DNS,
hosting, payment, or legal-account action was taken for any of them.

New repos: `axescontracting.com`, `xiiom.com`, `axoux.com`, `auxaous.com`,
`urnur.com`, `axaxaxu.com`, `axianaxiunaixia.com`, `axaxiaxes.com`,
`axaxes.com`, `uxaxu.com`, `owawawao.com`, `aulaux.com`, `axpur.com`,
`uxruxu.com`, `axtux.com`, `nuxiux.com`, `nuxuxun.com`, `uxaxaxu.com`,
`xaxux.com`, `uxrax.com`, `haiuhi.com`, `axrux.com`, `axraxrax.com`,
`axtamar.com`, `axaxox.com`, `axaxau.com`, `axarar.com`, `axaxur.com`,
`axelurartu.com`.

Updated `DOMAIN_PORTFOLIO.md` (new "2026-09-18 update: GitHub repo
reserved for every tracked domain" section) and
`docs/keystone/PRODUCT_BRANCH_DOMAIN_MAP.md` (Repo column + new dated
note) to record this.

## Known issue / cleanup needed

A stray `AxAxiAxes/test-domain-repo-delete-me` repo was created while
debugging the correct API endpoint (the account is a GitHub **user**, not
an org — `POST /orgs/AxAxiAxes/repos` 404s; the correct endpoint is
`POST /user/repos`). The token in use lacks the `delete_repo` scope, so
this repo could not be deleted automatically. It has no real content;
the founder can delete it manually from GitHub repo settings.

## What was not done

- No domain was newly registered, no DNS was changed, no hosting was
  configured, and no payment/legal account was created — this pass only
  reserves GitHub namespaces and documents current status.
- Did not touch `axaxar.com` or `urartuhi.com`, which already have real
  content from prior sessions.

## Reference

- `docs/DOMAIN_PORTFOLIO.md` (updated)
- `docs/keystone/PRODUCT_BRANCH_DOMAIN_MAP.md` (updated)
- 29 new repos under `https://github.com/AxAxiAxes/<domain>`
