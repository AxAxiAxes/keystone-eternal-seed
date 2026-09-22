# 2026-09-19i — Full cross-repo project inventory compiled

## What happened

Per the founder's request ("do an inventory on all our projects, list each
domain: directives taken, status, inventory tasks successfully completed,
suggest further scope"), listed every repo under `AxAxiAxes` via the GitHub
API, opened each non-trivial one to check real content (not just assume from
its name), and cross-referenced against the existing `DOMAIN_PORTFOLIO.md`
and `PRODUCT_BRANCH_DOMAIN_MAP.md`.

## Findings

- 9 repos have real content/history: `keystone-eternal-seed` (the monorepo),
  `xiiom.com`-fronted AXIOM chat, AXES Contracting, `urartuhi.com`,
  `axaxar.com`, plus three legacy/pre-monorepo repos (`axiom-freedom`,
  `axiom-engine`, `Class-Library-.NET-8-`) and one private archive
  (`keystone-axiom-chronological-archive`).
- ~26 domains remain reserved placeholder repos (README only), unchanged
  since the 2026-09-18 "create a repo for all our domains" pass — no product
  work started on any of them, correctly.
- Identified a new cross-cutting risk not previously called out explicitly:
  three legacy standalone repos (`axiom-freedom`, `axiom-engine`,
  `Class-Library-.NET-8-`) look like predecessors of things the monorepo now
  does better, and today's PR-triage sweep already found one real instance
  of this causing confusion (16 stale perf PRs on the wrong `axiom-engine`
  repo). Recommended the founder decide to archive or clearly label them.

## Output

Wrote `docs/keystone/PROJECT_INVENTORY_2026_09_19.md` — a dated, three-part
snapshot (active projects, parked domains, cross-cutting recommendations).
Explicitly scoped as a point-in-time doc, not a replacement for the living
`DOMAIN_PORTFOLIO.md` / `PRODUCT_BRANCH_DOMAIN_MAP.md` /
`FOUNDER_ACTION_QUEUE.md` files.

## Reference

- `docs/keystone/PROJECT_INVENTORY_2026_09_19.md`
- `docs/DOMAIN_PORTFOLIO.md`, `docs/keystone/PRODUCT_BRANCH_DOMAIN_MAP.md`
