# scripts/sync-md.ps1
# PostToolUse hook wrapper for Windows PowerShell.
# Delegates to vsp-audit.ps1 for documentation audit.

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "--- Post-Edit Audit Hook ---"

& "$ScriptDir\vsp-audit.ps1"
exit $LASTEXITCODE
