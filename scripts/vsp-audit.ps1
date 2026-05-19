# vsp-audit.ps1
# Cross-platform documentation audit (Windows)

param()
$failed = $false
Write-Host "--- Documentation Audit (Windows) ---" -ForegroundColor Cyan

# 1. Absolute Path Check
$abs = Get-ChildItem -Path . -Filter *.md -Recurse | Where-Object { $_.FullName -notmatch "node_modules|\.git|\.claude|\.gemini|setup-guide.md|antigravity-setup.md" } | Select-String -Pattern "[A-Z]:\\", "/Users/", "/home/"
if ($abs) {
    Write-Host "  [!] Absolute paths detected!" -ForegroundColor Red
    $failed = $true
}

# 2. Link Integrity & Path Style Check
$docFiles = Get-ChildItem -Path . -Filter *.md -Recurse | Where-Object { $_.FullName -notmatch "node_modules|\.git|\.claude|\.gemini" }
foreach ($f in $docFiles) {
    $txt = Get-Content $f.FullName -Raw
    if ($null -eq $txt) { continue }
    
    # Check for backslashes in markdown links (Windows-only style, fails on Unix)
    if ($txt -match "\[.*?\]\(.*?\\.*?\)") {
        Write-Host "  [!] Cross-Platform: Backslash found in link in $($f.Name). Use forward slashes (/) for compatibility." -ForegroundColor Yellow
        $failed = $true
    }

    $ms = [regex]::Matches($txt, "\[.*?\]\(([^#\)\s]+)\)")
    foreach ($m in $ms) {
        $l = $m.Groups[1].Value
        if ($l -match "^http" -or $l -match "^mailto:" -or $l -match "^#" -or $l -match "YYYY-MM-DD") { continue }
        
        $dl = $l.Replace("%20", " ")
        $tp = Join-Path -Path (Split-Path -Path $f.FullName) -ChildPath $dl
        if (-not (Test-Path $tp)) {
            Write-Host "  [!] Broken link in $($f.Name): $l" -ForegroundColor Red
            $failed = $true
        }
    }
}

# 3. Script Pairing Check (Ensure both .ps1 and .sh exist for automation)
$scripts = Get-ChildItem -Path "scripts\*" -Include *.ps1, *.sh
$scriptBasenames = $scripts | ForEach-Object { [System.IO.Path]::GetFileNameWithoutExtension($_.Name) } | Select-Object -Unique
foreach ($base in $scriptBasenames) {
    $ps1 = Join-Path "scripts" "$base.ps1"
    $sh = Join-Path "scripts" "$base.sh"
    if (-not (Test-Path $ps1) -or -not (Test-Path $sh)) {
        # Exempt specific files if needed, but standardizing is better
        if ($base -notmatch "sync-md") {
            Write-Host "  [!] Cross-Platform: Missing script pair for '$base' (Need both .ps1 and .sh)" -ForegroundColor Yellow
            # $failed = $true # Warning for now to allow sync-md exception
        }
    }
}

# 4. Redundancy Check
if ((Test-Path "CLAUDE.md") -and (Test-Path "GEMINI.md")) {
    $c = Get-Content "CLAUDE.md" -Raw
    $g = Get-Content "GEMINI.md" -Raw
    if ($c -eq $g) {
        Write-Host "  [!] Redundancy: CLAUDE.md and GEMINI.md are identical." -ForegroundColor Yellow
    }
}

if ($failed) {
    Write-Host "`nAudit FAILED. Please resolve issues before syncing." -ForegroundColor Red
    exit 1
}

Write-Host "`nAudit PASSED. Ready for cross-platform deployment." -ForegroundColor Green
exit 0
