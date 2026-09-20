# AXES Directory pilot fixture and schema

**Status:** Documentation and validation tooling only. No directory records,
public listings, or data collection exist. Nothing in this directory is wired
into `apps/axiom-engine` or `apps/axiom-freedom`, and no public portal file
was touched to build it.

This directory makes the proposed listing and correction/removal request
records in `docs/AXES_DIRECTORY_DATA_MODEL.md` mechanically checkable, not
just descriptive. It exists so a future implementation (and this repository's
own CI) can prove a candidate record actually satisfies the documented field
set, lifecycle-required fields, and track boundaries, rather than relying on
prose alone.

## Files

| File | Purpose |
| --- | --- |
| `listing.schema.json` | JSON Schema for the listing record: the approved 21-field allowlist (`additionalProperties: false`, so no rating, review, price, license, insurance, or valuation field can ever validate), the 11-state lifecycle enum, the 3 track values, and every state-conditional required-field rule from the data model's "Required state" column. |
| `correction-removal-request.schema.json` | JSON Schema for the correction/removal request record: the approved 10-field allowlist and the always-required intake fields. Contact identity, correspondence, and free-form request content are deliberately excluded, matching the data model's own boundary that those belong in a restricted operator system. |
| `sample-listings.json` | A private-safe fixture: 11 entirely fictional example listings using the IETF-reserved `.example` domain (RFC 2606), one per lifecycle state, rotating across all three tracks. No real business, person, or listing is represented. |
| `sample-correction-removal-requests.json` | A private-safe fixture: 4 fictional example correction/removal requests referencing the listing fixture above. |
| `schema-validator.js` | A small, dependency-free validator implementing only the JSON Schema subset the two schema files use (`type`, `properties`, `required`, `additionalProperties: false`, `enum`, `const`, `minLength`, `pattern`, local `$ref`/`$defs`, and `allOf` clauses shaped as `{ if, then }`). It exists so the schema files remain the single source of truth for the rules, rather than duplicating the same business logic separately in hand-written validation code. |
| `validate.test.js` | `node:test` coverage proving every fixture record validates, that all 11 states and all 3 tracks are represented, and that deliberately invalid examples (a missing required field, an extra forbidden field, an unknown enum value, a missing renewal-of-required-condition, a removed listing without a removal reason, an invalid request type, and an undated decided request) are correctly rejected. |

## Running the checks

```
node --test docs/fixtures/axes-directory
```

## Boundary

This fixture does not authorize collecting, publishing, or storing any real
business information. Per `docs/AXES_DIRECTORY_DATA_MODEL.md` and
`docs/AXES_DIRECTORY_READINESS.md`, the founder must still approve the launch
jurisdiction, field set, human owner, correction/removal route, renewal
interval, privacy notice, participant terms, retention rules, and incident
path before any collection begins. If a future implementation diverges from
these schema files, the schema files (not the implementation) should be
treated as the record of what was originally approved, and any divergence
should be reconciled through the same governance review as the rest of this
pilot.

## Known documentation nuance (not resolved by this change)

`docs/AXES_DIRECTORY_DATA_MODEL.md`'s lifecycle transition table allows
`correction_pending` and `removal_pending` to be reached directly from
`confirmed`, not only from `published`. Read literally, this means a listing
could reach `correction_pending` or `removal_pending` without ever passing
through `approved` or `published` — so `human_reviewer_role`, `approved_at`,
`published_at`, and `last_reviewed_at` are not schema-required for those two
states, only for states the "Required state" column explicitly lists. The
schema in this directory intentionally encodes the documentation exactly as
written rather than silently tightening or reinterpreting it. If the founder
intends `correction_pending`/`removal_pending` to always require prior
publication, that is a documentation decision for `AXES_DIRECTORY_DATA_MODEL.md`
itself, not something this fixture should decide unilaterally.
