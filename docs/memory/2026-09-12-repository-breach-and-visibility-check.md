# 2026-09-12 Repository breach and visibility check

## What was asked

The founder asked whether a breach check had been done, and to note any
finding on the timeline.

## Checks run

- `GET /repos/{owner}/{repo}/collaborators` — only the `AxAxiAxes` owner
  account, admin role. No unexpected collaborators.
- `GET /repos/{owner}/{repo}/secret-scanning/alerts` — empty result. Confirmed
  secret scanning and push protection are both **enabled** (so the empty
  result reflects "no secrets found," not "not checked").
- `GET /repos/{owner}/{repo}/dependabot/alerts` — disabled for this
  repository (403).
- `GET /repos/{owner}/{repo}/code-scanning/alerts` — no analysis has ever
  been run (404).
- `GET /repos/{owner}/{repo}/keys` and `/hooks` — no deploy keys, no
  webhooks.
- `GET /repos/{owner}/{repo}/branches/{default}/protection` — the default
  branch (`axaxiaxes-axiom-monorepo`) has no branch-protection rule.
- `gh repo view` — confirmed `isPrivate: false`, `visibility: PUBLIC`,
  created 2026-08-28; 0 forks, 0 stargazers, 0 watchers, 0 subscribers.

## Conclusion

**No evidence of an unauthorized-access breach was found.** The collaborator
list, secret-scanning results, and fork/star/watcher counts all show no sign
of compromise or unexpected external access.

**A real, separate finding was surfaced instead: this GitHub repository's
visibility is public, and has been since it was created.** That means every
committed document — including `docs/keystone/PATENT_APPLICATION_64_078_819.md`
and the personal/business/vendor records added throughout this project — has
been visible to anyone on the internet the entire time, which does not match
the "private" framing many of those documents use. Zero forks/stars/watchers
means no GitHub-visible engagement occurred, but that does not rule out a
plain clone or view by someone who never forked/starred/watched.

Also found, as secondary (non-breach) monitoring gaps: Dependabot alerts and
code scanning are disabled, and the default branch has no protection rule.

## What was recorded

- Added a new P0 row to `docs/AXES_TIER_1_DECISION_REGISTER.md` asking the
  founder to decide whether to keep the repository public or switch it to
  private.
- Added a matching row to `PROJECT_TIMELINE.md`.

## Boundary held

No repository visibility or configuration change was made. Switching
visibility is left to an explicit founder decision, since it is a real
consequential change (existing integrations, any links already shared, and
possible CI/billing differences between public and private repos).
