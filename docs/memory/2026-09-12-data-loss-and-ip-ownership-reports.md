# 2026-09-12 Data-loss and IP-ownership reports

**Status:** Founder reports recorded as claims; no recovery, legal, or ownership determination made or possible from this session

## What was reported

The founder reported two matters during this session:

1. An approximately 500GB data loss, described as unrecoverable after
   multiple recovery attempts already made. The founder subsequently asked
   that further recovery discussion stop and that this session focus on
   moving forward with what remains.
2. A belief that "our IP was switched to different ownership," that this
   was reported to police, and that the police case was closed.

## What this session checked, and how

This session has no access to the affected drive/device/account, no access
to law-enforcement systems, and no way to confirm a police report or its
outcome. Two things were checked directly, both within this session's
actual reach:

- **Local drive health (read-only).** `Get-Volume` on this machine showed
  no unhealthy or anomalous volume: the system drive (`C:`) is Healthy with
  roughly 879 GB free of ~953 GB total, and the only other visible volume
  is a small (~2 GB) FAT32 volume labeled `AXEL`, also Healthy. Neither
  matches a 500 GB loss, indicating the affected storage is not currently
  connected to, or visible from, this session.
- **This repository's GitHub ownership and access.** `gh api
  repos/AxAxiAxes/keystone-eternal-seed` and the collaborators endpoint
  confirmed the repository remains owned by the `AxAxiAxes` account, lists
  `AxAxiAxes` as its only collaborator (admin/push access), and this
  session's authenticated `gh` identity is that same account. This
  specific repository's ownership and this session's access are unchanged
  and intact. This check says nothing about, and does not confirm or
  refute, any broader claim about patents, trademarks, domain
  registrations, or other accounts outside this repository.

## What was added

The full account, including both checks, is recorded in
`docs/AXI_ETERNAL_ORIGIN_VALUE_AND_CRISIS_REGISTER.md` under "2026-09-12
Data-loss and IP-ownership reports (founder-reported, unverified)."

## What this does not do

This review does not confirm, deny, or take any position on the reported
data loss, the reported IP-ownership change, or the reported police case
and its closure. It does not attempt further data recovery, per the
founder's own direction. Any account-security, law-enforcement, or
IP-ownership-dispute follow-up requires the founder's continued direct
engagement with the relevant platform, registrar, counsel, or
law-enforcement agency — it is outside this repository's access and this
session's authority. This repository's own git history and memory log
continue to serve as an independently timestamped, append-only record of
the founder's authorship and decisions going forward.

## Related records

- `docs/AXI_ETERNAL_ORIGIN_VALUE_AND_CRISIS_REGISTER.md`
- `docs/memory/2026-09-12-copilot-library-code-and-intel-review.md`
