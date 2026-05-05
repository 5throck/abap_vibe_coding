# vsp-audit.ps1
param()
$failed = $false
Write-Host "Running documentation audit..."
$abs = Get-ChildItem -Path . -Filter *.md -Recurse | Where-Object { $_.FullName -notmatch "node_modules|\.git|setup-guide.md" } | Select-String -Pattern "[A-Z]:\\", "/Users/", "/home/"
if ($abs) {
    Write-Host "Absolute paths detected!"
    $failed = $true
}
if ($failed) { exit 1 }
exit 0
