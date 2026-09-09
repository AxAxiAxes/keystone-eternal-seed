[CmdletBinding()]
param(
    [string]$WorkspacePath = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
)

$environmentFile = Join-Path $WorkspacePath '.env'
$environmentExampleFile = Join-Path $WorkspacePath '.env.example'

if (-not (Test-Path -LiteralPath $environmentFile)) {
    Copy-Item -LiteralPath $environmentExampleFile -Destination $environmentFile
}

$apiKey = Read-Host -Prompt 'Enter your OpenAI API key (input is hidden)' -AsSecureString
$keyPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($apiKey)

try {
    $plainTextKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($keyPointer)
    if ([string]::IsNullOrWhiteSpace($plainTextKey)) {
        throw 'An OpenAI API key is required.'
    }

    $lines = Get-Content -LiteralPath $environmentFile
    $replacement = "OPENAI_API_KEY=$plainTextKey"
    $updated = $false
    $newLines = foreach ($line in $lines) {
        if ($line -match '^OPENAI_API_KEY=') {
            $updated = $true
            $replacement
        } else {
            $line
        }
    }

    if (-not $updated) {
        $newLines += $replacement
    }

    [System.IO.File]::WriteAllLines($environmentFile, $newLines)
} finally {
    if ($keyPointer -ne [IntPtr]::Zero) {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($keyPointer)
    }
}

$wslPath = 'C:\Windows\System32\wsl.exe'
if (-not (Test-Path -LiteralPath $wslPath)) {
    throw 'WSL is required to run the Docker Compose deployment.'
}

$wslWorkspacePath = '/mnt/' + $WorkspacePath.Substring(0, 1).ToLower() + $WorkspacePath.Substring(2).Replace('\', '/')
$command = "cd '$wslWorkspacePath'; docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d --wait --force-recreate axiom-engine axiom-web"
& $wslPath -d Ubuntu -- bash -lc $command
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

Write-Host 'AXIOM live chat is active at http://localhost:8080.'
