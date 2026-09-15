# AXES email migration readiness

**Mailbox:** `info@axescontracting.com`
**Status:** Repository readiness complete; no external system was accessed or changed
**Scope:** A controlled handoff for moving mail from SiteGround to Microsoft 365

This artifact follows the existing planned migration strategy; it does not
approve a cutover. The owner performs every tenant, mailbox, license, DNS, and
provider action. Keep credentials, recovery codes, exports, and tenant-specific
DNS values in a private operational record, never in this repository.

## Responsibility boundary

| Repository-controlled and verified | Owner-controlled; required before cutover |
| --- | --- |
| This readiness artifact and its local structural check | Microsoft 365 tenant ownership, admin access, licensing, and mailbox creation |
| A private-safe capture template with no DNS values or credentials | SiteGround mailbox access, backup/export, and source settings |
| A rollback and validation sequence that preserves the legacy service | DNS capture and changes at the authoritative provider |
| No external mail, DNS, tenant, provider, or account activity | Real-message validation, observation, and service retirement decision |

Run the local check from the repository root:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\Test-EmailMigrationReadiness.ps1
```

It reads only repository files. It does not connect to DNS, Microsoft 365,
SiteGround, GoDaddy, or any mail server.

## Owner pre-cutover inventory and backup

Do not schedule a cutover until each item is recorded privately and confirmed:

- [ ] Identify the authoritative DNS provider and export the complete current
  zone; preserve the export and a dated screenshot or equivalent record.
- [ ] Copy the current mail-related records exactly: MX, SPF TXT, DKIM CNAME or
  TXT, DMARC TXT, `autodiscover`, and any mail-provider verification records.
- [ ] Inventory `info@axescontracting.com` mailbox size, folders, aliases,
  forwarding, delegated access, contacts, calendars, devices, website forms,
  notifications, and third-party senders/receivers.
- [ ] Export or back up the source mailbox, contacts, and calendars as
  applicable; record the private storage location and restoration instructions.
- [ ] Confirm access to the legacy mailbox and its provider settings, including
  the source IMAP endpoint, port, encryption, and mailbox size.
- [ ] Confirm a Microsoft 365 global administrator, tenant ownership, an
  appropriate license, and a created destination mailbox without publishing
  production DNS changes.

**Stop condition:** If a source backup cannot be restored or the owner cannot
access both the legacy mailbox and Microsoft 365 administration, do not
continue.

## Private tenant DNS capture

In a private record, copy the exact records Microsoft 365 displays for this
tenant. Do not paste values into this file or replace these placeholders in a
commit.

| Record purpose | Owner's private capture |
| --- | --- |
| Domain-verification TXT | `[[capture from Microsoft 365 admin center]]` |
| Production MX | `[[capture from Microsoft 365 admin center]]` |
| `autodiscover` record | `[[capture from Microsoft 365 admin center]]` |
| SPF TXT | `[[capture from Microsoft 365 admin center]]` |
| DKIM selector 1 | `[[capture from Microsoft 365 admin center]]` |
| DKIM selector 2 | `[[capture from Microsoft 365 admin center]]` |
| DMARC policy and reporting destination | `[[capture after verifying approved senders]]` |

Before changing any record, compare this private capture against the zone
export. Preserve unrelated website, application, and verification records.
Do not use generic values from this repository or a third-party guide.

## Controlled cutover and validation

1. Complete and review the initial data copy while MX remains on SiteGround.
   Compare folder counts, message dates, sent mail, attachments, contacts, and
   calendars where applicable.
2. During a low-traffic window, have the owner publish only the
   Microsoft-365-provided records in the approved private capture. Keep
   SiteGround mail available.
3. After propagation, send distinct external test messages in both directions
   and record the sender, recipient, timestamp, delivery result, headers where
   available, junk placement, and reply result privately.
4. Confirm inbound delivery, outbound delivery, Outlook web, desktop, mobile,
   aliases/forwarding, website contact paths, and each known business
   notification or integration.
5. Complete a final incremental data copy if the chosen migration method
   requires it, then compare the result to the pre-cutover inventory.

## Observation and rollback

Observe the new route for the owner-defined business observation window; keep
the legacy service active throughout it. Review delivery failures, missing
mail, junk placement, forwarding, contacts, calendars, website forms, and
third-party notifications at least once during the window.

If a critical delivery failure occurs:

1. Pause further DNS changes and preserve test evidence.
2. Restore the prior MX and SPF records from the private pre-cutover export;
   restore only the records changed for mail.
3. Keep the legacy mailbox accessible, confirm the rollback with a new
   bidirectional external test, and diagnose before another cutover attempt.

Do not cancel SiteGround mail, delete DNS records, or retire any legacy
subscription until the observation window is complete and the owner has
confirmed no required mail reaches only the old mailbox.

## Required return package for the next phase

Return a private confirmation (not credentials, exports, or DNS values) that
states:

1. The pre-cutover inventory and restorable backup are complete, with their
   private storage locations and responsible owner identified.
2. The destination tenant administrator, license, and mailbox are ready.
3. The pre-cutover DNS export and tenant-specific Microsoft 365 record capture
   are complete and reviewed against each other.
4. The migration method, cutover window, observation-window duration, and
   rollback decision-maker are approved.
5. After cutover, the bidirectional test results, application/integration
   results, final-copy result, and observation outcome are recorded privately.

## References

- [Microsoft: IMAP mailbox migrations](https://learn.microsoft.com/en-us/exchange/mailbox-migration/migrating-imap-mailboxes/migrating-imap-mailboxes)
- [Microsoft: Add DNS records to connect your domain](https://learn.microsoft.com/en-us/microsoft-365/admin/get-help-with-domains/create-dns-records-at-any-dns-hosting-provider)
