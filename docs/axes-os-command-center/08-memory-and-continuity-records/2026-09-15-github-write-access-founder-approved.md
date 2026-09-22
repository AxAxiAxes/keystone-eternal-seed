# 2026-09-15 Founder-approved GitHub write access (comment, open PR, merge PR)

## What was asked

Following the read-only GitHub visibility shipped earlier the same day
(`2026-09-15-github-read-only-access-and-image-capability.md`), the founder
replied: "yess all capabilities approved please proceed."

## Decision

Interpreted as explicit, unambiguous authorization to extend AXI's GitHub
access from read-only to also include commenting, opening pull requests,
and merging pull requests -- the exact scope this session's own
`docs/AXI_GITHUB_ACCESS.md` had listed as deliberately deferred pending a
founder decision. Proceeded to implement it, since:

- the founder's message directly answers the specific open question that
  document raised ("if that is actually wanted, it needs its own explicit
  founder decision"),
- the implementation remains repository-controlled and reversible (it is
  code in this repo, gated by an environment variable an operator
  controls, and can be disabled by unsetting `AXIOM_GITHUB_TOKEN`),
- no credential was fabricated or handed over -- the mechanism was built,
  but a human must still generate and supply the actual token, exactly as
  before.

## What changed

- `GithubStatusService` gained `createIssueComment()`, `createPullRequest()`,
  and `mergePullRequest()`, plus a `request()` helper generalized to issue
  `POST`/`PUT` requests with a JSON body (previously `GET`-only).
- New routes, all admin-gated (same HTTP Basic pattern as every other
  mutating route in this service): `POST /system/github/issues/:number/comments`,
  `POST /system/github/pull-requests`, `PUT /system/github/pull-requests/:number/merge`.
- `status()`'s reported `scope` text was updated to describe the new
  capability honestly (no longer claims "read-only... no write capability").
- Fixed an ordering bug surfaced while wiring the new `POST`/`PUT` routes:
  `app.use(express.json())` was registered *after* some route definitions
  in `index.js`, meaning `req.body` would have been `undefined` for routes
  declared before it. Moved the JSON body-parser registration to
  immediately after `const app = express()`, before any route. Verified via
  the full test suite (json parsing is content-type-scoped, so this does
  not affect the existing raw-body upload route, which uses a separate
  `express.raw()` middleware applied per-route).
- Updated `docs/AXI_GITHUB_ACCESS.md`, `docs/AXI_AUTOMATION_SERVICE.md`'s
  route table, and `apps/axiom-engine/.env.example` to describe the new
  scope and the token permissions an operator now needs to grant
  ("Pull requests" and "Issues": read **and write**, still scoped to
  exactly one repository).
- Tests: `apps/axiom-engine` suite is **103/103 passing** (8 unit tests for
  `GithubStatusService`, up from 5; new coverage for comment/open-PR/merge-PR
  including validation errors and a simulated GitHub-side merge rejection
  surfaced as a 502 with GitHub's own message text preserved).

## Safety posture retained

- AXI still cannot generate its own GitHub credential. A human must create
  a fine-grained PAT and supply it via `AXIOM_GITHUB_TOKEN`.
- Nothing here is autonomous: these are on-demand routes. No scheduler,
  cron, or automation loop in this codebase calls them by itself; a caller
  (operator, script, or a future automation task) must invoke them
  explicitly.
- Branch protection and required CI status checks already configured on
  `axaxiaxes-axiom-monorepo` are enforced by GitHub itself, not by this
  service, and remain the actual backstop against a bad merge -- a merge
  attempt GitHub would reject for a human is rejected identically here.
- `AXIOM_GITHUB_TOKEN`/`AXIOM_GITHUB_REPO` remain unset by default in this
  repository; the capability exists in code but is inert until an operator
  deliberately configures it.
