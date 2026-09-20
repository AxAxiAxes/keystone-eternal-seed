# 2026-09-19r — S1 dashboard was completely broken by PR #186; found via direct page-driving, fixed and verified (PR #187)

## What happened

The founder asked me to "show me the work" and present the rebuilt S1 dashboard properly. While
walking through it, I used the browser-canvas page-driving tools (`read_page`, `evaluate_javascript`)
to click the new sidebar nav directly instead of only re-describing it in chat. That surfaced a
critical, previously undetected regression: **the entire dashboard had been non-functional since
PR #186 merged.**

## Root cause

PR #186's sidebar-nav rewrite removed the `<details><summary id="parked-summary">` element (replaced
by a plain always-visible section, since the sidebar now handles show/hide), but left behind an
orphaned line of JS:

```js
document.getElementById("parked-summary").textContent = "Expand parked domains (" + parkedDomains.length + ")";
```

`getElementById` returned `null` for the deleted element, so this line threw an uncaught
`TypeError: Cannot set properties of null (setting 'textContent')`. Because this was a top-level
statement partway through a single `<script>` block, the exception silently halted **all**
subsequent script execution — meaning the figures bar, active-project cards, per-project ratings
widgets, the "Check live now" button, the parked-domains table, the timeline, and the sidebar nav
click handlers never rendered or bound. The page loaded showing only the static hero text; nothing
else worked, for two full merged PRs (#186, until this fix in #187).

## Why the existing Node sanity-test process didn't catch it

The Node-based pre-commit sanity check (used successfully in prior iterations) stubs
`document.getElementById` to return a fake generic element for **any** id requested, including ones
that don't exist in the real markup. This masked exactly this class of bug: a reference to a
deleted element silently "succeeded" against the stub instead of throwing, so the script appeared
to run cleanly in Node while being completely broken in a real browser.

## Fix and verification (PR #187, merged, 6/6 CI green)

- Removed the orphaned `parked-summary` line.
- Verified by directly driving the actual rendered page via the browser canvas's `evaluate_javascript`
  action (not just re-reading source or trusting a Node stub): dispatched real click events on each
  sidebar nav item and confirmed exclusive section switching, confirmed `#active-grid`/`#figures`/
  `#timeline-root` all populate with real content, and confirmed the per-project rating input writes
  to `localStorage` and shows the "saved ✓" confirmation tag.
- Took a screenshot of the corrected live page for visual confirmation before committing.

## Process lesson (should inform future dashboard iterations)

A Node-stub sanity test is not sufficient on its own for a page with a DOM this size — it must be
paired with actually driving the rendered page (click, read resulting DOM state, screenshot) before
claiming a UI change works, especially after any refactor that removes or renames HTML element ids.
Going forward: after any structural HTML change, re-verify by dispatching real clicks against the
live rendered page, not only a Node-executed copy of the inline script.

## Self-rating

**My rating: 4/10** for the PR #186 delivery in isolation — it shipped completely broken for real
users despite being reported as "merged, verified." Positive: caught and fixed within the same
session, root-caused honestly, and the detection method itself (driving the live page instead of
re-describing it in chat) is now demonstrated and reusable. Requesting the founder's own rating,
per protocol step 7.
