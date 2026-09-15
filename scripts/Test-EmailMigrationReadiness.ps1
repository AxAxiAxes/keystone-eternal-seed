[CmdletBinding()]
param(
    [string]$ReadinessPath = (Join-Path $PSScriptRoot "..\docs\EMAIL_MIGRATION_READINESS.md")
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $ReadinessPath -PathType Leaf)) {
    throw "Readiness artifact not found: $ReadinessPath"
}

$content = Get-Content -LiteralPath $ReadinessPath -Raw
$requiredHeadings = @(
    "## Responsibility boundary",
    "## Owner pre-cutover inventory and backup",
    "## Private tenant DNS capture",
    "## Controlled cutover and validation",
    "## Observation and rollback",
    "## Required return package for the next phase"
)

$missingHeadings = $requiredHeadings | Where-Object {
    $content.IndexOf($_, [System.StringComparison]::Ordinal) -lt 0
}

if ($missingHeadings) {
    throw "Readiness artifact is missing required sections: $($missingHeadings -join ', ')"
}

if ($content -notmatch '\[\[capture from Microsoft 365 admin center\]\]') {
    throw "Readiness artifact must retain tenant-specific DNS capture placeholders."
}

if ($content -match '(?im)^(?!.*\[\[capture).*?(?:MX|CNAME|TXT)\s*[:|].+\S') {
    throw "Readiness artifact appears to contain a concrete DNS record value."
}

Write-Output "PASS: Email migration readiness artifact has the required private-safe sections."
