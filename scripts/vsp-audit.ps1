# vsp-audit.ps1
# Cross-platform documentation audit (Windows)

param()
$failed = $false
Write-Host "--- Documentation Audit (Windows) ---"

# 1. Absolute Path Check
$abs = Get-ChildItem -Path . -Filter *.md -Recurse | Where-Object { $_.FullName -notmatch "node_modules|\.git|setup-guide.md" } | Select-String -Pattern "[A-Z]:\\", "/Users/", "/home/"
if ($abs) {
    Write-Host "  [!] Absolute paths detected!"
    $failed = $true
}

# 2. Link Integrity Check
$docFiles = Get-ChildItem -Path . -Filter *.md -Recurse | Where-Object { $_.FullName -notmatch "node_modules|\.git" }
foreach ($f in $docFiles) {
    $txt = Get-Content $f.FullName -Raw
    if ($null -eq $txt) { continue }
    # Simple regex for [text](link)
    $ms = [regex]::Matches($txt, "\[.*?\]\(([^#\)\s]+)\)")
    foreach ($m in $ms) {
        $l = $m.Groups[1].Value
        # Skip external, anchors, placeholders
        if ($l -match "^http" -or $l -match "^mailto:" -or $l -match "^#" -or $l -match "YYYY-MM-DD") { continue }
        
        $dl = $l.Replace("%20", " ")
        $tp = Join-Path -Path (Split-Path -Path $f.FullName) -ChildPath $dl
        if (-not (Test-Path $tp)) {
            Write-Host "  [!] Broken link in $($f.Name): $l"
            $failed = $true
        }
    }
}

# 3. Redundancy Check
if ((Test-Path "CLAUDE.md") -and (Test-Path "GEMINI.md")) {
    $c = Get-Content "CLAUDE.md" -Raw
    $g = Get-Content "GEMINI.md" -Raw
    if ($c -eq $g) {
        Write-Host "  [!] Redundancy: CLAUDE.md and GEMINI.md are identical."
    }
}

if ($failed) {
    Write-Host "Audit FAILED."
    exit 1
}

Write-Host "Audit PASSED."
exit 0
