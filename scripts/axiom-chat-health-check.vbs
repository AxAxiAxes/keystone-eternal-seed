' axiom-chat-health-check.vbs
'
' Purpose: A Windows Script Host (WSH) tool the founder can double-click
' (no PowerShell/curl knowledge required) to independently check whether the
' live public AXIOM chat at https://xiiom.com is actually working, end to
' end, right now.
'
' Context: this repeats the exact three-request diagnostic pattern used to
' investigate and document the 2026-09-18 production incident (see
' docs/keystone/PRODUCTION_INCIDENT_2026_09_18_CHAT_502.md):
'   1. GET  https://xiiom.com/axiom              -> portal page loads?
'   2. GET  https://xiiom.com/api/axiom/history   -> engine reachable?
'   3. POST https://xiiom.com/api/axiom           -> chat actually replies?
' Request #3 is the one that has been failing with HTTP 502 during the
' incident, because it is the only one that calls out to OpenAI.
'
' Usage: double-click this file in Windows Explorer, or run:
'   wscript.exe axiom-chat-health-check.vbs
' A summary is shown in a message box and appended to
' axiom-chat-health-check.log next to this script, with a timestamp, so a
' history of checks is kept without needing to read a terminal.
'
' This script only performs read/diagnostic HTTP requests against the
' already-public chat endpoint. It sends no secrets, and it cannot fix,
' redeploy, or restart anything in Railway or OpenAI -- it is a checker,
' not a repair tool. If it reports a failure, the next step remains the
' founder-only actions already listed in
' docs/keystone/FOUNDER_ACTION_QUEUE.md (item 0): redeploy axiom-engine in
' Railway, use Railway Agent to read live logs, or verify the
' OPENAI_API_KEY on the OpenAI dashboard.

Option Explicit

Dim results, summary, logLine, fso, logFile, scriptDir

results = ""
summary = ""

' --- Check 1: portal page ---
CheckUrl "GET", "https://xiiom.com/axiom", "", "Portal page (GET /axiom)"

' --- Check 2: engine reachability via history endpoint ---
CheckUrl "GET", "https://xiiom.com/api/axiom/history", "", "Engine reachability (GET /api/axiom/history)"

' --- Check 3: actual chat reply (the request that calls OpenAI) ---
CheckUrl "POST", "https://xiiom.com/api/axiom", "{""action"":""chat"",""message"":""health check - automated""}", "Chat reply (POST /api/axiom, action=chat)"

' --- Write results to a log file next to this script, and show a summary ---
Set fso = CreateObject("Scripting.FileSystemObject")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
Set logFile = fso.OpenTextFile(scriptDir & "\axiom-chat-health-check.log", 8, True)
logLine = "===== " & Now & " ====="
logFile.WriteLine logLine
logFile.WriteLine results
logFile.WriteLine ""
logFile.Close

MsgBox summary, vbInformation, "AXIOM chat health check - " & Now

Sub CheckUrl(method, url, body, label)
    Dim http, statusLine, ok
    On Error Resume Next
    Set http = CreateObject("WinHttp.WinHttpRequest.5.1")
    http.Open method, url, False
    If method = "POST" Then
        http.SetRequestHeader "Content-Type", "application/json"
        http.Send body
    Else
        http.Send
    End If

    If Err.Number <> 0 Then
        statusLine = label & ": REQUEST FAILED (" & Err.Description & ")"
        ok = False
        Err.Clear
    Else
        ok = (http.Status >= 200 And http.Status < 300)
        statusLine = label & ": HTTP " & http.Status & " - " & _
            Sanitize(Left(http.ResponseText, 200))
    End If
    On Error Goto 0

    results = results & statusLine & vbCrLf
    If ok Then
        summary = summary & "[OK] " & label & " (HTTP " & http.Status & ")" & vbCrLf
    Else
        summary = summary & "[FAIL] " & statusLine & vbCrLf
    End If
End Sub

' Live responses can include curly quotes/other non-ASCII characters that
' break a plain ASCII text stream's WriteLine call ("Invalid procedure call
' or argument"). Replace anything outside printable ASCII with "?" so the
' log/summary can always be written safely.
Function Sanitize(text)
    Dim i, ch, code, out
    out = ""
    For i = 1 To Len(text)
        ch = Mid(text, i, 1)
        code = AscW(ch)
        If (code >= 32 And code <= 126) Or code = 10 Or code = 13 Then
            out = out & ch
        Else
            out = out & "?"
        End If
    Next
    Sanitize = out
End Function
