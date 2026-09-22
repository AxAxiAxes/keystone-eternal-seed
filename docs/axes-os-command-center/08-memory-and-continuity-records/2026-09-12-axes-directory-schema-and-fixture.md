# 2026-09-12 AXES Directory schema, fixture, and validator added

## Context

The original AXES Directory pilot data-model task asked for "a private-safe
fixture or explicit schema/documentation for proposed listing fields and
lifecycle." `docs/AXES_DIRECTORY_DATA_MODEL.md` satisfied the documentation
half in full, but no machine-readable schema or fixture existed: the field
allowlist, lifecycle states, and track boundaries were prose and tables only,
not something a program (or this repository's own CI) could check. Following
"research and create" and "use your highest intelligence" guidance, this pass
closes that gap without touching any public portal file or collecting any
real data.

## What was added

- `docs/fixtures/axes-directory/listing.schema.json` — JSON Schema for the
  listing record: the 21-field allowlist (`additionalProperties: false`, so
  no rating, review, price, license, insurance, or valuation field can ever
  validate), the 11-state lifecycle enum, the 3 track values, and every
  state-conditional required-field rule from the data model's "Required
  state" column.
- `docs/fixtures/axes-directory/correction-removal-request.schema.json` —
  JSON Schema for the correction/removal request record.
- `docs/fixtures/axes-directory/sample-listings.json` and
  `sample-correction-removal-requests.json` — private-safe fixtures using the
  IETF-reserved `.example` domain (RFC 2606) for every fictional business
  name/website/contact, so no real business or person appears anywhere in
  the data.
- `docs/fixtures/axes-directory/schema-validator.js` — a small,
  dependency-free validator implementing only the JSON Schema subset the two
  schema files use, so the schema files remain the single source of truth
  rather than duplicating the same rules as separate hand-written logic. No
  new npm dependency (for example `ajv`) was added.
- `docs/fixtures/axes-directory/validate.test.js` — a `node:test` suite;
  **10/10 passing**, covering full-fixture validity, lifecycle/track
  coverage, and seven deliberately invalid records (missing required field,
  forbidden extra field, unknown enum value, missing contact method, missing
  removal fields, invalid request type, undated decided request).
- `docs/fixtures/axes-directory/README.md` — purpose, file table, run
  instructions, and the governance boundary restated.
- A cross-reference section in `docs/AXES_DIRECTORY_DATA_MODEL.md` pointing
  to the new directory.
- A new `directory-fixture-validation` job in
  `.github/workflows/axi-continuity-validation.yml` running the suite on
  every push/PR, matching the existing Node jobs' `working-directory` +
  bare `node --test` convention (a directory path passed directly to
  `node --test` from the repository root fails with `MODULE_NOT_FOUND` on
  this Node version; the fix was to `cd` via `working-directory` instead,
  exactly like the existing `apps/axiom-engine`/`apps/axiom-freedom` jobs
  already do).

## Known nuance flagged, not resolved unilaterally

`AXES_DIRECTORY_DATA_MODEL.md`'s lifecycle transition table allows
`correction_pending`/`removal_pending` to be reached directly from
`confirmed`, not only from `published`. Read literally, that means a listing
could reach either state without ever passing through `approved`/`published`,
so `human_reviewer_role`, `approved_at`, `published_at`, and
`last_reviewed_at` are not schema-required for those two states — only for
the states the "Required state" column explicitly lists them under. The
schema encodes the documentation exactly as written rather than silently
tightening it. This is recorded in the fixture's own `README.md` as a
founder-level documentation question about `AXES_DIRECTORY_DATA_MODEL.md`
itself, not something this change decided on its own.

## What was explicitly not done

No real listing data was collected, no public portal file was touched, no
new npm dependency was added, and no live directory route, form, or storage
was built. This is documentation-adjacent validation tooling only, exactly
like the rest of the original pilot slice.

## Next steps

Founder awareness of the transition-graph nuance above. If confirmed that
`correction_pending`/`removal_pending` should always require prior
publication, that is a small, separate documentation-and-schema change to
`AXES_DIRECTORY_DATA_MODEL.md` and `listing.schema.json` together.
