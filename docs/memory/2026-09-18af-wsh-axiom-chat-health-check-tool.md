# 2026-09-18 (af): Double-click WSH (VBScript) health-check tool for the live AXIOM chat endpoint

## What happened

The founder asked for "a wscript for the agent." Built
`scripts/axiom-chat-health-check.vbs`, a Windows Script Host (VBScript)
tool that can be run without any terminal knowledge (double-click in
Explorer, or `wscript.exe`/`cscript.exe`) to independently check whether
the live public AXIOM chat at `https://xiiom.com` is actually working,
end to end, right now.

## What it does

Repeats the exact three-request diagnostic sequence used throughout the
2026-09-18 production-incident investigation
(`docs/keystone/PRODUCTION_INCIDENT_2026_09_18_CHAT_502.md`):

1. `GET https://xiiom.com/axiom` — portal page loads?
2. `GET https://xiiom.com/api/axiom/history` — engine reachable?
3. `POST https://xiiom.com/api/axiom` with `{"action":"chat",...}` — chat
   actually replies? (the request that has been failing with HTTP 502)

Shows a pass/fail summary in a message box and appends a timestamped
record to `axiom-chat-health-check.log` next to the script (git-ignored via
a new `scripts/*.log` rule in `.gitignore`).

## Verification performed

- Ran the script (headlessly, via `cscript` with `MsgBox` swapped for
  `WScript.Echo` during testing only) against the live endpoint.
- Found and fixed a real bug: the live `/api/axiom/history` response
  contains a mojibake/non-ASCII character (a corrupted curly apostrophe),
  which crashed `WriteLine` on a default ASCII-mode text stream with
  "Invalid procedure call or argument." Added a `Sanitize()` function that
  strips any character outside printable ASCII/CR/LF before logging or
  displaying response snippets.
- Confirmed, after the fix, the script correctly reports: portal page OK
  (200), engine reachability OK (200), chat reply **FAIL (502)** — matching
  the still-open incident's real live state at time of testing.
- Cleaned up all temporary debug scripts/log files created during testing;
  only the final `scripts/axiom-chat-health-check.vbs` was committed.

## What this is not

Not a repair tool — it cannot redeploy, restart, or fix anything in Railway
or OpenAI. It only performs read/diagnostic HTTP requests against the
already-public chat endpoint, sends no secrets, and exists purely so the
founder (or anyone) can re-check live status without needing PowerShell or
curl.

## Cross-references

- `scripts/axiom-chat-health-check.vbs`
- `docs/keystone/PRODUCTION_INCIDENT_2026_09_18_CHAT_502.md` (linked from
  new "no-terminal-needed way to check the endpoint yourself" section)
- `.gitignore` (`scripts/*.log` rule added)
