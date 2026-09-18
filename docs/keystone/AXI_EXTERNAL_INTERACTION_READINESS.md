# AXI external-interaction and app-accessibility readiness

**Status:** Honest readiness/status record — no new autonomous capability is
enabled by this document
**Recorded:** 2026-09-18
**Purpose:** Answer, in one place, the founder's request to "reconcile" AXI
automation with (a) inter-AI interaction, (b) verified-by-KEYSTONE-version
gating, (c) web/browser/internet access, (d) broader "app accessibility,"
and (e) the reported inability to upload files in the public chat.

## 1. Current AXI automation status (baseline)

AXI automation (`apps/axiom-engine/automation-service.js`) is a bounded,
versioned action allowlist — not general autonomy. See
`docs/AXI_AUTOMATION_SERVICE.md`. As of 2026-09-18 it supports 12 actions,
most recently `creation.record` (PR #137), which lets AXI append a
founder-attributed creation entry to a private journal under approval. It
cannot deploy, spend, message an external party, or publish on its own.

## 2. Interaction with other AI systems

**Not implemented; not started.** Letting AXI exchange messages with another
AI system (a different vendor's model, another agent framework, etc.) is a
materially different, larger safety surface than anything currently in the
allowlist: it would mean AXI-authored content leaving this system's control
and unknown external content flowing back in. Before any code is written,
this needs the same kind of explicit scoped decision the founder already
uses elsewhere in this repo (see `docs/AXES_TIER_1_DECISION_REGISTER.md`):
which external AI system, what data may cross that boundary, whether
responses are reviewed before acting on them, and a kill switch. Recording
this as an open, unresolved item rather than building it unreviewed.

## 3. "Verified by KEYSTONE versions"

Read as: any future inter-AI or external-app capability should be gated by
which KEYSTONE architecture version approved it, so nothing new activates
silently. This is consistent with how `KEYSTONE_REGISTRATION` and the
Genesis ownership checkpoint already gate agent registration
(`docs/AXI_GENESIS_OWNERSHIP_CHECKPOINT.md`). No new version-gate exists yet
for inter-AI/external-app features specifically — that gate should be
designed together with whichever specific capability it is meant to guard,
rather than added generically in advance of a concrete feature.

## 4. Web/browser access

**Already implemented, already documented, off by default.** See
`docs/AXI_WEB_ACCESS.md`: a single, admin-gated, SSRF-guarded, read-only URL
fetch (`POST /system/web-access/fetch`), capped at 512 KB, no cookies, no
JavaScript, no redirects followed. This is not a browser and cannot log in
anywhere or click/navigate. Full interactive browser-tab control was
explicitly scoped out in 2026-09-16 as needing its own sandboxed environment
and safety review (see that file's History section) — that conclusion still
holds; nothing changed here today.

## 5. "Other app accessibility"

Too broad to action as written. If this means a specific target (a named
app, API, or service AXI should be able to call), name it and it can go
through the same allowlist-addition process used for `creation.record`:
one bounded action, one capability, approval-gated where sensitive, tested.

## 6. File upload — "I couldn't upload any files"

This is a real, useful bug report, not a missing feature: an upload path
already exists end-to-end (`apps/axiom-freedom/server.js`'s
`POST /api/axiom/uploads` proxying to the engine's admin-gated
`/system/source-catalog/uploads`), but it is currently **admin-credential
gated**, so a public visitor at `xiiom.com/axiom` cannot use it — that
matches what the founder observed. Making chat-facing upload available to
public users (not just admins) is exactly the work already underway in a
separate, parallel session on this same chat surface; per this session's own
scope boundary, upload-path changes are intentionally left to that session
to avoid duplicate or conflicting edits. No upload-related code was touched
here.

## Summary for the founder

- Web access: done, bounded, off by default until enabled.
- File upload: known gap (admin-only today); a sibling session is already
  building public-facing upload for this exact chat — no action needed here.
- Inter-AI interaction and open-ended "other app accessibility": genuinely
  new work, not yet scoped or built; needs a named target and an explicit
  data/safety boundary before any code is written, the same way every other
  sensitive AXI capability in this repo has been added.
