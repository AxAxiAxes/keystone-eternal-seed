# AXES Contracting Inc — entity and license verification research

**Status:** Web-sourced research finding, not a legal confirmation. Every
figure below comes from third-party public-record aggregators, not a direct
fetch of the official California Secretary of State or CSLB databases
(both blocked automated/scripted access at fetch time). Founder should
independently confirm at the official sources linked below before relying
on this for any legal, financial, or public-facing decision.
**Recorded:** 2026-09-19
**Trigger:** Founder asked to research "Axes Contracting Inc" directly,
following up on the ownership-checklist item that flagged entity status as
unconfirmed.

## Headline finding: the entity already exists and appears active

This corrects the prior assumption in `AXES_OWNERSHIP_AND_ENTITY_CHECKLIST.md`
(item A1) that entity formation was "unconfirmed." Multiple independent
public-record aggregator sites, cross-referencing consistent details (same
entity number, same address, same filer name across all three), report:

| Field | Value | Source |
| --- | --- | --- |
| Legal name | Axes Contracting Inc. | bizprofile.net |
| Entity type | California General Corporation | bizprofile.net |
| Filed date | February 6, 2013 | bizprofile.net |
| CA entity/document number | 3544685 | bizprofile.net |
| Filing status | "Active" (per aggregator) | bizprofile.net |
| Principal/mailing address | 1521 E Windsor #6, Glendale, CA 91205 | bizprofile.net, contractorlicenseca.com (matches) |
| CEO / Secretary / CFO / Director | Axel Urartu (all four roles) | bizprofile.net |
| Registered agent | Axel Urartu, same address | bizprofile.net |

**Why this is credible:** the address and phone number independently match
the `AXES_CONTRACTING_LEGACY_BUSINESS_RECORD.md` Wayback Machine findings
from a prior session (same Glendale address, same phone number
424-334-0777), and the officer name "Axel Urartu" matches the founder
identity already established elsewhere in this repository (`AX` /
Axel Urartu). Three independently-run aggregator sites report the same
entity number and address, which is a much stronger signal than a single
source, but none of them are the official state record itself.

## Second finding: an active CSLB contractor license, currently suspended

| Field | Value | Source |
| --- | --- | --- |
| License number | 995577 | contractorlicenseca.com |
| Classification | B — General Building Contractor | contractorlicenseca.com |
| Issue date | August 13, 2014 | contractorlicenseca.com |
| Expiration date | August 31, 2026 | contractorlicenseca.com |
| **Current status** | **Suspended — Contractor Bond** | contractorlicenseca.com |
| Disciplinary record | None on file | contractorlicenseca.com |
| Bond | $25,000, Merchants Bonding Company (Mutual) | contractorlicenseca.com |
| Workers' compensation | Exempt | contractorlicenseca.com |

**What "Suspended — Contractor Bond" means, in plain terms:** CSLB requires
every active B-license contractor to maintain a current $25,000 surety
bond. This status code means the bond lapsed, expired, or was cancelled at
some point and was not replaced in time, so CSLB suspended the license
until a new bond is filed. It is explicitly **not** a disciplinary
suspension (no violation, no complaint on record) — it's a paperwork/
compliance lapse, which is normally the easiest kind of suspension to
resolve: file a new bond with a surety company and the license typically
reactivates.

## Why this matters right now

1. **This directly answers `FOUNDER_ACTION_QUEUE.md` item #12** ("confirm
   whether the legacy home-inspection/remediation license is still
   active"). The corporation is active; the *contractor license* is not
   currently active — it's suspended pending a bond renewal.
2. **This also answers ownership-checklist item A1.** The entity does not
   need to be formed — it already exists, has for 12+ years, and the
   founder already holds every officer role. What's actually needed now is
   confirming this is current/accurate and getting the contractor license
   reactivated, not filing new incorporation paperwork.
3. **A suspended contractor license is a real, immediate compliance risk**
   if AXES Contracting is publicly advertised or performs licensed
   contracting work (the historical home-inspection/hazard-remediation
   business) while suspended — California law generally prohibits
   contracting for compensation while a license is suspended. No public
   page in this repository currently claims active licensed-contractor
   status (per the existing item #12 caution), so no immediate correction
   is needed to existing content, but **this should not be advertised as
   an active license until the bond is renewed and CSLB confirms
   reinstatement.**

## What must still be founder-verified directly (cannot be done from this
repository)

- **Official confirmation at the authoritative sources**, since automated
  fetches of both were blocked at research time:
  - CA Secretary of State bizfile: https://bizfileonline.sos.ca.gov/search/business (search "Axes Contracting" or entity number 3544685)
  - CSLB license check: https://www.cslb.ca.gov/OnlineServices/CheckLicenseII/CheckLicense.aspx (search "Axes Contracting" or license 995577)
- Whether the corporation's required California **Statement of
  Information** filings are current (a corporation can show as "active" in
  aggregator data while actually being delinquent on this separate,
  required biennial filing — only the official SOS record shows this).
- Whether the $25,000 surety bond needs to simply be renewed (fast, likely
  low-cost) or whether something else caused the lapse.
- Whether Axel Urartu wants to keep 100% sole officer/agent structure or
  formalize additional officers/ownership as the project scales.

## Updated recommendation

Given this finding, **no new entity formation is needed.** The prior
`AXES_OWNERSHIP_AND_ENTITY_CHECKLIST.md` guidance to "confirm/form the
entity" is corrected here: the entity exists and is (per aggregator data)
active. The founder's immediate action is narrower and cheaper than
forming a new company:

1. Verify the corporation's status directly at CA SOS bizfile (5 minutes).
2. Contact a surety bond provider to renew the $25,000 CSLB contractor
   bond, then confirm CSLB reinstates license 995577.
3. Once both are confirmed current, the IP-assignment, trademark, and
   copyright-registration steps (checklist items A2-A4) can proceed using
   this existing entity — no new incorporation required.

## Related records

- `docs/AXES_OWNERSHIP_AND_ENTITY_CHECKLIST.md` (item A1, now corrected by
  this finding)
- `docs/AXES_CONTRACTING_LEGACY_BUSINESS_RECORD.md` (prior Wayback Machine
  research this corroborates)
- `docs/keystone/FOUNDER_ACTION_QUEUE.md` (item #12)
- `docs/keystone/MAIN_AXES_CONTRACTING_TIMELINE.md`
