[CmdletBinding()]
param(
    [string]$ManifestPath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($ManifestPath)) {
    $ManifestPath = Join-Path $PSScriptRoot "..\web\axes-public-foundation.json"
}

function Assert-Condition {
    param(
        [bool]$Condition,
        [string]$Message
    )

    if (-not $Condition) {
        throw $Message
    }
}

function Test-NoIndex {
    param([string]$Robots)

    return $Robots -match '(^|,\s*)noindex(,|$)'
}

Assert-Condition (Test-Path -LiteralPath $ManifestPath -PathType Leaf) "Manifest not found: $ManifestPath"
$manifest = Get-Content -LiteralPath $ManifestPath -Raw | ConvertFrom-Json
$repositoryRoot = Split-Path -Parent $PSScriptRoot

Assert-Condition ($manifest.schemaVersion -eq 1) "schemaVersion must be 1."
Assert-Condition ($manifest.site.publicationState -eq "approval-gated") "The site must remain approval-gated."
Assert-Condition ($manifest.site.deploymentState -eq "not-configured") "The deployment state must remain not-configured."
Assert-Condition (Test-NoIndex $manifest.global.robots) "Global robots must include noindex."
Assert-Condition (-not $manifest.global.socialMetadata.enabled) "Social metadata must remain disabled pending owner approval."
Assert-Condition (-not $manifest.global.structuredData.enabled) "Structured data must remain disabled pending owner approval."
Assert-Condition ($manifest.routes.Count -gt 0) "At least one public-safe route is required."

$prohibitedTerms = '(?i)\b(contact us|request (an )?(estimate|inspection|consultation)|get a quote|book now|call now|submit|sign up|schedule|24/7|emergency|licensed|insured|certified|free consultation|\$\s?\d|\b\d+\s?(?:usd|dollars?)\b)\b'
foreach ($route in $manifest.routes) {
    Assert-Condition ($route.path -eq "/") "Only the approved root route may be represented before publication approval."
    Assert-Condition ($route.status -eq "planned-public-safe") "Route '$($route.path)' must be planned-public-safe."
    Assert-Condition (Test-NoIndex $route.robots) "Route '$($route.path)' must include noindex."
    Assert-Condition ([uri]::IsWellFormedUriString($route.canonical, [uriKind]::Absolute)) "Route '$($route.path)' has an invalid canonical URL."
    Assert-Condition ($route.canonical -eq "$($manifest.site.intendedProductionOrigin)/") "Route '$($route.path)' canonical must use the intended production origin."
    Assert-Condition ([string]::IsNullOrWhiteSpace($route.h1) -eq $false) "Route '$($route.path)' requires one semantic H1."
    Assert-Condition ($route.forms.Count -eq 0) "Route '$($route.path)' must not expose forms before approval."
    Assert-Condition ($route.externalLinks.Count -eq 0) "Route '$($route.path)' must not expose external links before approval."

    $routeText = @($route.title, $route.description, $route.h1, $route.bodyPurpose) -join "`n"
    Assert-Condition ($routeText -notmatch $prohibitedTerms) "Route '$($route.path)' includes an unapproved public claim, offer, or intake prompt."

    $previewPath = Join-Path $repositoryRoot $route.localPreviewPath
    Assert-Condition (Test-Path -LiteralPath $previewPath -PathType Leaf) "Preview not found: $($route.localPreviewPath)"
    $preview = Get-Content -LiteralPath $previewPath -Raw
    Assert-Condition ($preview -match ('<title>\s*' + [regex]::Escape($route.title) + '\s*</title>')) "Preview title does not match route metadata."
    Assert-Condition ($preview -match ('<meta\s+name="description"\s+content="' + [regex]::Escape($route.description) + '"')) "Preview description does not match route metadata."
    Assert-Condition ($preview -match ('<link\s+rel="canonical"\s+href="' + [regex]::Escape($route.canonical) + '"')) "Preview canonical does not match route metadata."
    Assert-Condition ($preview -match '<meta\s+name="robots"\s+content="noindex, nofollow, noarchive, nosnippet"') "Preview robots must preserve the noindex policy."
    Assert-Condition ($preview -match ('<h1[^>]*>\s*' + [regex]::Escape($route.h1) + '\s*</h1>')) "Preview must contain the route H1."
    Assert-Condition ($preview -notmatch '(?i)<form\b|<input\b|<textarea\b|mailto:|tel:') "Preview exposes an unapproved form or external link."
    $hrefs = [regex]::Matches($preview, '(?i)\bhref="([^"]+)"')
    Assert-Condition ($hrefs.Count -eq 1 -and $hrefs[0].Groups[1].Value -eq $route.canonical) "Preview may only contain the approved canonical URL."
    Assert-Condition ($preview -notmatch $prohibitedTerms) "Preview includes an unapproved public claim, offer, or intake prompt."
}

foreach ($guard in $manifest.publicationGuards.PSObject.Properties) {
    if ($guard.Name -like "require*") {
        Assert-Condition ($guard.Value -eq $true) "Publication guard '$($guard.Name)' must be true."
    }
    else {
        Assert-Condition ($guard.Value -eq "prohibited") "Publication guard '$($guard.Name)' must be prohibited."
    }
}

Write-Output "AXES public foundation validation passed: $ManifestPath"
