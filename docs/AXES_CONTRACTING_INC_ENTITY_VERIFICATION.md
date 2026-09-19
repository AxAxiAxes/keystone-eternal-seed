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

## CORRECTION (2026-09-19, official CSLB source) — license is active, not suspended

**The founder provided a direct screenshot of the official CSLB license-detail
page** (`cslb.ca.gov/OnlineServices/CheckLicenseII/LicenseDetail.aspx?LicNum=995577`)
showing:

- **License Status: "This license is current and active."**
- Expire Date: **08/31/2028** (not 08/31/2026 as the aggregators reported)
- Business name/address/entity type match exactly: AXES CONTRACTING INC,
  1521 E WINDSOR #6, GLENDALE, CA 91205, Corporation, Issue Date 08/13/2014.

**This corrects and supersedes every "Suspended — Contractor Bond" finding
above and in the same-day re-confirmation section below.** The three
third-party aggregators (contractorlicenseca.com, contractorlicensepro.com,
bizprofile.net) were showing **stale/outdated data** — likely cached from
a past suspension that has since been resolved, or simply not kept current.
This is now the second time this session an aggregator site has been wrong
(see the "Caution recorded" note below, originally about a search-summary
tool, now also applicable to the underlying aggregator sites themselves).

**Standing lesson reinforced:** for anything license/compliance-critical,
only the *official* state source (CSLB, CA SOS) should be treated as
authoritative. Third-party aggregators are a reasonable first signal when
official sites block automated access, but their status field can be
stale — always get the founder to pull the official page directly (as
was just done here) before relying on a suspended/active determination.

**Practical effect: the bond-lapse concern is resolved.** No bond renewal
is needed. `AXES_CONTRACTING_BOND_RENEWAL_QUICKSTART.md` is retained for
reference (the renewal steps are still valid general guidance if a real
lapse ever happens) but is no longer an active action item.

## Re-confirmation (2026-09-19, later same day) — superseded by the official
source above, kept for the record

Re-checked all three sources directly (fetched the actual pages, not an AI
search summary) roughly 12 hours after the original finding above — **no
change**: the corporation is still reported active, and CSLB license 995577
is still shown as **"Suspended — Contractor Bond."**

**Caution recorded for future sessions:** a general web-search-engine
summary tool returned a false "active and clear, no suspensions" result for
this same license during this re-check, citing the same
`contractorlicenseca.com` page that, when fetched directly, still clearly
shows "Suspended - Contractor Bond." That summarized-search result was
**not** used or recorded as a finding — always fetch the actual source page
directly for a status this consequential; do not trust a search-summary
tool's paraphrase alone.

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
active. **Update 2026-09-19 (official CSLB confirmation):** the contractor
license is also confirmed active by the official CSLB source (see
correction section above) — it is not suspended, and no bond renewal is
required.

1. ~~Verify the corporation's status directly at CA SOS bizfile (5 minutes).~~
   Contractor license status now confirmed via the official CSLB source
   directly (screenshot provided by founder, 2026-09-19). CA SOS bizfile
   confirmation of the corporation's Statement of Information filing is
   still a separate, optional double-check if desired, but is no longer
   blocking anything.
2. ~~Contact a surety bond provider to renew the $25,000 CSLB contractor
   bond, then confirm CSLB reinstates license 995577.~~ **Not needed** —
   the license was never actually suspended per the official source; this
   step is moot.
3. **AXES Contracting Inc can now be treated as a licensed, active general
   contractor** for revenue/business-planning purposes. The IP-assignment,
   trademark, and copyright-registration steps (checklist items A2-A4) can
   proceed using this existing entity — no new incorporation required, and
   no licensing blocker remains.

## Related records

- `docs/AXES_OWNERSHIP_AND_ENTITY_CHECKLIST.md` (item A1, now corrected by
  this finding)
- `docs/AXES_CONTRACTING_LEGACY_BUSINESS_RECORD.md` (prior Wayback Machine
  research this corroborates)
- `docs/keystone/FOUNDER_ACTION_QUEUE.md` (item #12)
- `docs/keystone/MAIN_AXES_CONTRACTING_TIMELINE.md`
