[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [ValidateScript({ Test-Path -LiteralPath $_ -PathType Container })]
    [string]$SourcePath,

    [string]$ArchiveName = (Get-Date -Format 'yyyy-MM-dd-HHmmss')
)

$ErrorActionPreference = 'Stop'

$repositoryRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$source = Resolve-Path -LiteralPath $SourcePath
$archiveRoot = Join-Path $repositoryRoot "private-archive\copilot-library\$ArchiveName"

if ($source.Path -eq $archiveRoot) {
    throw 'The source directory cannot be the archive destination.'
}
if (Test-Path -LiteralPath $archiveRoot) {
    throw "The archive destination already exists: $archiveRoot"
}

New-Item -ItemType Directory -Path $archiveRoot -Force | Out-Null
Copy-Item -LiteralPath (Join-Path $source '*') -Destination $archiveRoot -Recurse -Force

$manifest = Get-ChildItem -LiteralPath $archiveRoot -Recurse -File |
    ForEach-Object {
        [PSCustomObject]@{
            Path = $_.FullName.Substring($archiveRoot.Length).TrimStart('\')
            SizeBytes = $_.Length
            Sha256 = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash
        }
    }

$manifest | ConvertTo-Json -Depth 3 |
    Set-Content -LiteralPath (Join-Path $archiveRoot 'manifest.sha256.json') -Encoding UTF8

Write-Host "Private archive created: $archiveRoot"
Write-Host "Files archived: $($manifest.Count)"
Write-Host 'The archive is Git-ignored. Review and redact material before creating a public repository record.'
