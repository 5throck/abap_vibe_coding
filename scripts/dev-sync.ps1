# scripts/dev-sync.ps1
# Project Constitution §3 standard entry point for /sync command.
# Delegates to vsp-sync.ps1 which contains the full sync pipeline.
#
# Usage: .\scripts\dev-sync.ps1 -Message "feat: description"

param(
    [string]$Message
)

$vspSync = Join-Path $PSScriptRoot "vsp-sync.ps1"
& $vspSync -Message $Message
exit $LASTEXITCODE
