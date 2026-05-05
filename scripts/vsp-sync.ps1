# vsp-sync.ps1
# Usage: .\scripts\vsp-sync.ps1 -Message "type: summary"
# Syncs memory logs, updates index, and commits to Git.

param(
    [string]$Message
)

$date = Get-Date -Format "yyyy-MM-dd"
$memoryDir = Join-Path $PSScriptRoot "..\memory"
$memoryFile = Join-Path $memoryDir "$date.md"
$indexFile = Join-Path $memoryDir "MEMORY.md"

Write-Host "--- VSP Sync & Report ---" -ForegroundColor Cyan

# 0. Documentation Audit
powershell -File "$PSScriptRoot\vsp-audit.ps1"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Documentation audit failed. Commit aborted."
    exit 1
}

# 1. Check for today's memory log
if (-not (Test-Path $memoryFile)) {
    Write-Warning "Memory log for today ($date.md) not found."
    Write-Host "Please create it before syncing to ensure development history is preserved."
    exit 1
}

# 2. Update MEMORY.md index if needed
$indexContent = Get-Content $indexFile
if (-not ($indexContent -match "\[$date\]\($date\.md\)")) {
    Write-Host "Updating memory index..." -ForegroundColor Green
    
    # Create new entry line
    $summary = "Development update"
    if ($Message -match ":\s*(.*)") { $summary = $matches[1] }
    $newEntry = "| [$date]($date.md) | $summary |"
    
    # Insert after the header table
    $newContent = @()
    $inserted = $false
    foreach ($line in $indexContent) {
        $newContent += $line
        if (-not $inserted -and $line -match "^\|------\|---------\|$") {
            $newContent += $newEntry
            $inserted = $true
        }
    }
    Set-Content -Path $indexFile -Value $newContent
}

# 3. Git Commit
if ([string]::IsNullOrWhiteSpace($Message)) {
    Write-Host "Enter commit message (e.g., feat: add new report):" -NoNewline
    $Message = Read-Host
}

if ([string]::IsNullOrWhiteSpace($Message)) {
    Write-Error "Commit message is required."
    exit 1
}

Write-Host "Committing to Git..." -ForegroundColor Green
git add -A
git commit -m "$Message"

Write-Host "Sync complete!" -ForegroundColor Green
