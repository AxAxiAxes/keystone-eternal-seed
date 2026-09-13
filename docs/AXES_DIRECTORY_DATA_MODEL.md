# AXES Directory pilot data model

**Status:** Proposed internal pilot contract; no directory records or public
listings exist

**Recorded:** 2026-09-10
**Scope:** A future, opt-in, human-reviewed, business-only directory for
building-material vendors, contractors/trades, and real-estate
professionals/services.

## Purpose and operating boundary

This record defines the minimum proposed fields, states, and review evidence
for a future AXES Directory pilot. It is documentation, not a database,
collection form, account system, public directory, invitation program, or
authorization to begin collecting or publishing listings.

The pilot may publish only a confirmed business name, category, service area,
website, and public business contact method. It must never infer, scrape, or
publish a listing from public records. A listing is neither an endorsement nor
a verification of identity, licensing, insurance, quality, availability,
property value, or professional suitability.

## Proposed records and fields

The following fields are the proposed maximum for this pilot. A future
implementation must use the approved fields only, keep internal and public
records separate, and establish its own access, retention, export, deletion,
and incident controls before collecting any information.

### Listing record

| Field | Visibility | Required state | Rule |
| --- | --- | --- | --- |
| `listing_id` | Internal | All states | Non-personal opaque identifier. |
| `business_name` | Public after publication | Confirmation pending and later | Business name as provided or explicitly confirmed by the business. Do not use an individual's name as the listing identity. |
| `track` | Public after publication | Confirmation pending and later | One of `vendor`, `contractor_trade`, or `real_estate_service`. |
| `category` | Public after publication | Confirmation pending and later | Narrow factual category within the selected track. |
| `service_area` | Public after publication | Confirmation pending and later | General business service area only; never a home, job-site, or personal address. |
| `website` | Public after publication | Optional | Business-controlled public website, if provided or explicitly confirmed. |
| `public_contact_method` | Public after publication | Confirmation pending and later | Business-approved public contact route only, such as a published business phone, business email, or contact page. No personal contact details. |
| `listing_source` | Internal | Confirmation pending and later | `business_submission` or `representative_confirmation` only. No scraped, purchased, inferred, or public-record source. |
| `source_received_at` | Internal | Confirmation pending and later | Date the permitted source was received. |
| `confirmation_capacity` | Internal | Confirmed and later | `business_owner` or `authorized_representative`; records the claimed authority without retaining personal identity data. |
| `confirmation_received_at` | Internal | Confirmed and later | Date an owner or authorized representative confirmed the exact public fields. |
| `human_reviewer_role` | Internal | Approved and later | Approved operator role, not an automated decision-maker. |
| `approved_at` | Internal | Approved and later | Date a human approved publication. |
| `published_at` | Internal | Published, paused, expired, or removed | Date the listing was first made public, if ever. |
| `last_reviewed_at` | Internal | Published, paused, expired, or removed | Date a human last reviewed the listing. |
| `renewal_due_at` | Internal | Published or paused | Date by which renewed owner/representative confirmation is required. |
| `renewed_at` | Internal | Published after renewal | Date the most recent renewed confirmation was accepted. |
| `status` | Internal | All states | Lifecycle state from the controlled vocabulary below. |
| `status_changed_at` | Internal | All states | Date of the most recent lifecycle transition. |
| `removal_reason_code` | Internal | Removed only | Controlled code such as `representative_request`, `not_renewed`, `policy_pause`, or `operator_error`; no free-form personal information. |
| `removed_at` | Internal | Removed only | Date the listing was removed from public availability. |

`website` and `public_contact_method` are optional only when the listing still
has a truthful, business-approved way for the public to identify the business.
An implementation must not substitute an operator's private notes or a
representative's personal details for either field.

### Correction and removal request record

Keep contact identity, correspondence, evidence, and free-form request content
out of this proposed directory record. If a future approved process needs them,
it must use a restricted operator system with a documented purpose, access
control, retention period, and deletion path.

| Field | Visibility | Rule |
| --- | --- | --- |
| `request_id` | Internal | Non-personal opaque identifier. |
| `listing_id` | Internal | References the affected listing. |
| `request_type` | Internal | `correction` or `removal`. |
| `received_at` | Internal | Date the request entered the human review queue. |
| `request_route` | Internal | Controlled route label for the published correction/removal channel. |
| `authority_confirmed_at` | Internal | Date a business owner or authorized representative's authority was confirmed for this request. |
| `review_status` | Internal | `received`, `under_review`, `implemented`, `declined`, or `closed`. |
| `reviewed_at` | Internal | Date a human reviewer completed the decision. |
| `resolution_code` | Internal | Controlled outcome code; do not store personal details or free-form correspondence here. |
| `public_change_at` | Internal | Date a correction, pause, or removal reached the public directory, if applicable. |

## Lifecycle and human authority

Only a designated human operator may move a listing between states. Automation
may surface due dates or incomplete fields but cannot approve, publish, renew,
correct, remove, or decline a request.

| State | Entry requirement | Permitted transition |
| --- | --- | --- |
| `draft` | A private, non-public proposed record exists. | `confirmation_pending` or `removed` |
| `confirmation_pending` | The business-submitted or representative-confirmed source and proposed public fields are recorded. | `confirmed` or `removed` |
| `confirmed` | Owner or authorized-representative confirmation covers the exact proposed public fields. | `review_pending`, `correction_pending`, or `removal_pending` |
| `review_pending` | A human review is awaiting an approval decision. | `approved`, `correction_pending`, `removal_pending`, or `removed` |
| `approved` | A human reviewer approved the limited listing. | `published`, `correction_pending`, `removal_pending`, or `removed` |
| `published` | The approved fields are publicly visible. | `correction_pending`, `removal_pending`, `paused`, `expired`, or `removed` |
| `correction_pending` | A correction request or material accuracy concern is under human review. | `published`, `paused`, or `removed` |
| `removal_pending` | A removal request or material policy concern is under human review. | `removed` or `paused` |
| `paused` | The listing is withheld while a correction, policy, or renewal matter is resolved. | `published`, `expired`, or `removed` |
| `expired` | Renewal was not completed by `renewal_due_at`; the listing is no longer public. | `confirmation_pending` or `removed` |
| `removed` | The listing is no longer public and is excluded from future display. | No pilot transition |

Before a listing enters `published`, an operator must confirm that the source
is permitted, the public fields match the confirmation, the track limitations
are satisfied, a correction/removal route is ready, and a renewal date is set.
`expired` and `removed` listings must not appear in any public search,
directory, export, referral, or marketing workflow.

## Track-specific limitations

| Track | Permitted factual scope | Prohibited representation |
| --- | --- | --- |
| Building-material vendor | Business name, material/showroom category, general service area, website, and public business contact method. | Inventory, pricing, delivery, availability, product performance, warranties, exclusive status, recommendation, or quality claims. |
| Contractor or trade | Business name, trade category, general service area, website, and public business contact method. | License, insurance, bond, background-check, code-compliance, safety, availability, workmanship, qualification, or endorsement claims. |
| Real-estate professional or service | Business name, service category, general service area, website, and public business contact method. | Property listings, owner/occupant details, addresses, valuations, pricing, market predictions, licensing, transaction advice, agency relationship, quality, or endorsement claims. |

The directory must not add ranking, reviews, ratings, lead resale, paid
placement, advertising, personalized marketing, automated outreach, messaging,
or payment features to any track.

## Machine-readable schema and fixture

`docs/fixtures/axes-directory/` encodes the listing and correction/removal
request records above as JSON Schema, with a private-safe fixture of
fictional example records (using the IETF-reserved `.example` domain) and a
dependency-free validator, so the rules in this document are testable in CI
rather than descriptive only. See that directory's `README.md` for details,
including one open documentation nuance the schema deliberately did not
resolve on its own (a lifecycle-transition edge case around
`correction_pending`/`removal_pending`).

## Governance and launch gate

Before collection or publication, the founder must approve the launch
jurisdiction, service area, field set, human owner, public correction/removal
route, renewal interval, privacy notice, participant terms, retention and
deletion rules, incident path, and a small pilot cohort. Applicable directory,
privacy, consumer-protection, professional-services, marketing, and
communications requirements must be reviewed for that real-world scope.

This pilot contract is governed by
`AXES_DIRECTORY_READINESS.md` and `AXES_GOVERNANCE_AND_SAFEGUARDING.md`.
Where a proposed implementation conflicts with either record, the stricter
boundary applies.
