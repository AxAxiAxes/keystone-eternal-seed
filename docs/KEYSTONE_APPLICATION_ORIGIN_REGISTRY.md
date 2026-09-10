# KEYSTONE application origin and authority registry

**Status:** Internal architecture and readiness plan; no registry service is active  
**Recorded:** 2026-09-10  
**Purpose:** Establish a governed internal record of origin and authorized
operation for AXES applications.

## Service definition

KEYSTONE is the proposed origin and authority registration service for AXES
applications. Each registered application has a versioned internal record that
connects its source, accountable human owner, approved operating scope,
deployment approval, and correction/revocation history.

This registry is not a public identity registry or a declaration of global
authority. A registration record does not by itself prove legal ownership,
patent validity, trademark rights, exclusivity, security, regulatory approval,
or authority over another person's or organization's application.

## Required application record

Before an AXES application is recognized as registered, record:

| Record | Minimum content |
| --- | --- |
| Application identity | Stable internal ID, application name, purpose, repository/source reference, and owner |
| Origin evidence | Source-record reference, version/commit reference, creation/registration dates, and hash where appropriate |
| Authority scope | Named human owner, approved operators, permitted actions, access classification, and explicit prohibitions |
| Release state | Draft, internal, pilot, public, paused, retired, or revoked; approval date and approving human |
| Data and integration map | Data classes, storage, approved providers, outbound integrations, retention, export/deletion, and incident owner |
| Rights and credit | Creator/contributor records, rights status, licenses, attribution wording, and restrictions |
| Security and continuity | Authentication/authorization model, secrets location outside the repository, monitoring, backup, recovery, and change log |
| Challenge and correction | Reporting route, evidence record, interim action, decision owner, versioned correction, and revocation path |

## Authority model

Application authority is specific, bounded, and revocable. An authority record
must answer: who can approve release, deploy, change settings, access data,
operate integrations, publish content, spend funds, or make consequential
decisions. If an action is not explicitly assigned, it is not authorized.

Automation may observe, organize records, validate declared schema, and
propose changes. It cannot grant authority, change an application's scope,
activate an integration, deploy, spend, publish, contact third parties, or
resolve an origin/rights dispute without a named human approval.

## Registration lifecycle

1. **Draft:** Source and purpose are recorded; no production authority.
2. **Internal:** A human owner approves private development under defined
   data, access, and action limits.
3. **Pilot:** Required privacy, security, rights, support, accessibility, and
   applicable legal reviews are complete for a limited audience.
4. **Public:** A human approves the exact public scope, statements, support,
   rollback, and ongoing review ownership.
5. **Paused or revoked:** Access, integrations, or public availability are
   stopped when evidence, safety, rights, security, or operating requirements
   are no longer met. History is preserved privately for review.

## First implementation boundary

Begin with the applications already in this repository: the private
`axiom-engine` and public `axiom-freedom` portal. Create no public registry,
user accounts, authority tokens, global application claims, or third-party
app registration flow until the record model, access controls, privacy,
security, correction process, and human operating capacity are validated.

## Related records

- `AXES_CREATOR_ORIGIN_CONSTITUTION.md`
- `AXES_GOVERNANCE_AND_SAFEGUARDING.md`
- `KEYSTONE_TIER_1_AUTOMATION_AND_INCOME_PLAN.md`
- `AXES_OS_PORTABILITY.md`

