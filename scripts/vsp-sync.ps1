$OutputEncoding = [Console]::OutputEncoding = [System.Text.Encoding]::UTF8;
# scripts/vsp-sync.ps1
# Usage: .\scripts\vsp-sync.ps1 -Message "type: summary"
# Syncs memory logs, updates index, and commits to Git.

param(
    [string]$Message
)

$date = Get-Date -Format "yyyy-MM-dd"
$memoryDir = Join-Path $PSScriptRoot "..\memory"
$memoryFile = Join-Path $memoryDir "$date.md"
$indexFile  = Join-Path $memoryDir "MEMORY.md"

Write-Host "--- VSP Sync & Report ---" -ForegroundColor Cyan

# 0. Documentation Audit
& "$PSScriptRoot\vsp-audit.ps1"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Documentation audit failed. Commit aborted."
    exit 1
}

# 1. Check for today's memory log —auto-create if missing
if (-not (Test-Path $memoryFile)) {
    Write-Host "Memory log for today not found. Auto-creating $date.md..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $memoryDir -Force | Out-Null
    $time = Get-Date -Format "HH:mm"
    $header = @(
        "# Memory Log: $date",
        "",
        "<!-- Auto-created by vsp-sync.ps1. Add entries below. -->",
        "",
        "## $time —Session",
        "",
        "<!-- Describe what was done today -->"
    )
    Set-Content -Path $memoryFile -Value $header -Encoding UTF8
    Write-Host "Created: $memoryFile" -ForegroundColor Green
}

# 2. Update MEMORY.md index if needed
if (Test-Path $indexFile) {
    $indexContent = Get-Content $indexFile
    if (-not ($indexContent -match "\[$date\]\($date\.md\)")) {
        Write-Host "Updating memory index..." -ForegroundColor Green

        $summary = "Development update"
        $logContent = Get-Content $memoryFile
        $firstHeader = $logContent | Where-Object { $_ -match "^##\s+(.*)" } | Select-Object -First 1
        if ($firstHeader -match "##\s+(.*)") { $summary = $matches[1] }
        if ($Message -match ":\s*(.*)") { $summary = $matches[1] }

        $newEntry = "| [$date]($date.md) | $summary |"

        $newContent = @()
        $inserted = $false
        foreach ($line in $indexContent) {
            $newContent += $line
            if (-not $inserted -and $line -match "^\|------\|---------\|$") {
                $newContent += $newEntry
                $inserted = $true
            }
        }
        Set-Content -Path $indexFile -Value $newContent -Encoding UTF8
    }
}

# 3. Git Commit
if ([string]::IsNullOrWhiteSpace($Message)) {
    $Message = Read-Host "Enter commit message (e.g., feat: add new report)"
}

if ([string]::IsNullOrWhiteSpace($Message)) {
    Write-Error "Commit message is required."
    exit 1
}

Write-Host "Committing to Git..." -ForegroundColor Green
git add -A
git commit -m "$Message"

Write-Host "Sync complete!" -ForegroundColor Green
