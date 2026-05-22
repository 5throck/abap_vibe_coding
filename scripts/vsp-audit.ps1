# scripts/vsp-audit.ps1
# Legacy wrapper — delegates to audit.ps1.
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
& "$ScriptDir\audit.ps1"
exit $LASTEXITCODE
