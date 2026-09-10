# AXES email migration plan

**Status:** Planned; no DNS or mailbox change has been made  
**Recorded:** 2026-09-09  
**Mailbox:** `info@axescontracting.com`  
**Target:** Microsoft 365  
**Current public DNS observation:** SiteGround-managed mail filtering and mail
endpoint, not GoDaddy or Microsoft 365.

## Goal

Move `info@axescontracting.com` to a directly managed Microsoft 365 mailbox
without losing historical mail or interrupting inbound mail flow. Website
deployment for `axescontracting.com` is independent: it must not change the
domain's MX, SPF, DKIM, DMARC, or mail autodiscovery records.

## Safety rules

1. Do not cancel SiteGround mail or any legacy GoDaddy email subscription until
   mail delivery, historical email, Outlook access, and all integrations are
   confirmed in Microsoft 365.
2. Do not change DNS during data migration. DNS cutover is the final step.
3. Keep the old mailbox accessible through a defined post-cutover observation
   period before decommissioning it.
4. Never put mailbox passwords, Microsoft administrator credentials, recovery
   codes, or exported mail archives in this repository, agent prompts, browser
   code, or chat.
5. Take an export or backup of the source mailbox before migration and record
   where it is stored in a private operational inventory.

## Phase 1 - Discovery and readiness

- Confirm who owns and can access the SiteGround mailbox.
- Inventory every mailbox, alias, forwarding rule, shared mailbox, mailing
  list, contact, calendar, device, website form, and third-party integration
  using `@axescontracting.com`.
- Confirm whether a separate Microsoft 365 tenant already exists. If it does,
  identify its verified domains and current administrator.
- Create or confirm the Microsoft 365 tenant, then create and license the
  destination `info@axescontracting.com` user. Do not assign the production
  domain until the tenant asks for verification.
- Capture the SiteGround IMAP server, port, encryption setting, and source
  mailbox size from SiteGround's official account settings.

**Stop condition:** Do not continue if access, the destination tenant
administrator, the source mailbox settings, or a usable backup cannot be
confirmed.

## Phase 2 - Data migration

For a single business mailbox, use one of these approaches:

| Method | Best when | Limitation |
| --- | --- | --- |
| Outlook copy/export | One mailbox and a need for visual review | Requires manual copying; contacts and calendars require separate export |
| Microsoft 365 IMAP migration | One or more mailbox archives and a repeatable migration batch | IMAP copies mail and folders, not contacts or calendars |
| Migration specialist | Tenant ownership or historical data is unclear | Has additional cost; verify permissions and scope before engagement |

Start an initial copy while inbound MX records remain on SiteGround. Review
folder count, important messages, dates, attachments, sent mail, and any
business-critical correspondence in Microsoft 365. Export/import contacts and
calendars separately when applicable.

## Phase 3 - DNS cutover

Schedule a low-traffic window only after the initial migration is validated.
Use the exact DNS values displayed in the Microsoft 365 admin center for this
tenant:

1. Verify the domain using Microsoft 365's ownership TXT record.
2. Change the MX record to the tenant-specific Microsoft 365 destination.
3. Change the `autodiscover` record as instructed by Microsoft 365.
4. Replace the existing SiteGround SPF authorization with the Microsoft 365
   value after SiteGround is no longer a sending service.
5. Enable Microsoft 365 DKIM and publish the two tenant-specific CNAME records.
6. Publish or update DMARC in monitoring mode first, then tighten its policy
   only after legitimate sending sources are verified.
7. Send and receive external test messages; confirm Outlook web, desktop, and
   mobile access.

Do not copy generic MX, DKIM, SPF, or CNAME values from a guide. Microsoft 365
generates tenant-specific records. Preserve any unrelated website records and
do not remove them during mail cutover.

## Phase 4 - Stabilization and rollback

- Continue a final incremental mail copy if using IMAP migration.
- Monitor inbound and outbound delivery, junk placement, replies, forwarding
  behavior, contact forms, and any AXES notifications.
- Keep SiteGround mail active until the agreed observation period is complete
  and no mail is arriving only in the old mailbox.
- If critical delivery fails, restore the prior MX and SPF records from the
  pre-cutover DNS export, then diagnose before trying again.
- After confirmed stabilization, remove obsolete forwarding rules and retire
  old mail service only when no longer needed.

## AXES application integration

The initial AXES and XIIOM applications should not send business mail
automatically. When form or transactional email is introduced:

- Use a dedicated transactional provider or Microsoft 365-supported sending
  path with domain authentication.
- Send only explicit, consented notifications.
- Keep an auditable record of recipient consent and message purpose.
- Separate operational alerts from marketing mail.

## Evidence to retain privately

- Source mailbox inventory and size.
- Destination mailbox confirmation.
- Backup/export location and restoration instructions.
- DNS record export before and after cutover.
- Test-message results and migration completion date.
- A list of applications and forms updated to use the new mailbox.

## Supporting references

- Microsoft: [IMAP mailbox migrations](https://learn.microsoft.com/en-us/exchange/mailbox-migration/migrating-imap-mailboxes/migrating-imap-mailboxes)
- Microsoft: [DNS records at GoDaddy](https://learn.microsoft.com/en-us/microsoft-365/admin/dns/create-dns-records-at-godaddy)
- GoDaddy: [Email migration guidance](https://www.godaddy.com/help/migrate-my-email-to-microsoft-365-40145)
- `docs/DOMAIN_PORTFOLIO.md`
- `docs/RAILWAY_DEPLOYMENT.md`
