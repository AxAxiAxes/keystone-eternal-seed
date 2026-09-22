# Chat upload clarity + visible live-clock/timeline calibration

**Date:** 2026-09-16

## Founder request

> still can upload, lets take it a step a time. tell mr which docs i can
> upload and ill check one by one, also tyhe calendar was not calibrated
> can you establish continuious timeline so he is aware of the timeline
> live clock memertry recording concepts

## What was found

1. **Upload question answered directly**: the public chat's attach button
   (`apps/axiom-freedom/axiom_web_interface.html`) already restricts file
   selection to: `.pdf .doc .docx .txt .md .csv .json .png .jpg .jpeg .gif
   .webp`, capped at 5 MB. There is no additional content-based
   restriction beyond that.
2. **Why uploads were failing**: `/api/axiom/uploads` is intentionally
   admin-gated (`requireAdmin` in `apps/axiom-freedom/server.js`) --
   uploads are not open to anonymous visitors. A plain visitor (or the
   founder testing without having entered admin credentials for that
   browser/origin yet) always gets a 401, which the widget's old error
   handling surfaced as a generic, unhelpful "Upload failed" (since the
   plain-text 401 body isn't JSON and gets swallowed).
3. **Calendar/date confusion**: the underlying stale-date bug was already
   fixed in PR #89, but there was no visible, independent way for the
   founder to confirm the fix in the UI itself, and no explanation in
   AXI's own instructions of *how* it tracks time/memory turn to turn.

## What was shipped

- **Clearer upload error messaging**: a 401 response from the upload
  route now surfaces as "Admin sign-in required to upload. Your browser
  should prompt for the AXIOM admin username/password -- enter them and
  try again." instead of a generic failure.
- **Visible live clock** in the chat header (`#liveClock`): ticks every
  second using the browser's own clock (weekday, date, time), giving an
  independent way to eyeball whether "today" looks right without asking
  AXI anything -- proof the timeline is calibrated, separate from
  whatever the model itself reports.
- **Expanded chat instructions** (`chat-service.js`): AXI is now told
  explicitly that it maintains continuous, timestamped memory recording
  driven by the live server clock on every turn, and can explain this
  plainly if asked how it tracks time or memory -- rather than only
  knowing the current date without understanding the broader concept.

## What this deliberately does not do

- Does **not** open uploads to anonymous visitors -- that gate is
  intentional (unreviewed file storage from the public internet is a real
  risk) and unchanged. The founder (as admin) can still upload by
  authenticating when the browser's native credential prompt appears.
- Does **not** add new accepted file formats -- the existing list already
  covers common document/image formats.

## Testing

- `apps/axiom-engine` full suite: **118/118 passing** (no test asserted
  the exact previous instructions string, so the new line is additive and
  non-breaking; existing regex-based assertions on the date/guidance
  substrings still pass).
- `apps/axiom-freedom` full suite: **14/14 passing** (no existing test
  covers the static HTML widget, so no regressions there).
- `axiom_web_interface.html` has no automated coverage (static asset); the
  live clock and upload-error-message changes should be spot-checked in a
  browser once deployed.
