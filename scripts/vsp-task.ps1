# vsp-task.ps1
# Usage: .\scripts\vsp-task.ps1 [-Name "task-name"]
# Creates a new task file in scratch/ from the template.

param(
    [string]$Name = "new-task"
)

$date = Get-Date -Format "yyyy-MM-dd"
$scratchDir = Join-Path $PSScriptRoot "..\scratch"
$templateFile = Join-Path $PSScriptRoot "..\docs\task-template.md"

# Create scratch dir if it doesn't exist
if (-not (Test-Path $scratchDir)) {
    New-Item -ItemType Directory -Path $scratchDir | Out-Null
}

# Find next sequence number
$files = Get-ChildItem -Path $scratchDir -Filter "task-$date-*.md" -ErrorAction SilentlyContinue
$nextSeq = 1
if ($files) {
    $numbers = $files.Name | ForEach-Object {
        if ($_ -match "task-$date-(\d+)") { [int]$matches[1] }
    }
    if ($numbers) {
        $nextSeq = ($numbers | Measure-Object -Maximum).Maximum + 1
    }
}

$seqStr = $nextSeq.ToString("000")
$targetFileName = "task-$date-$seqStr.md"
$targetFilePath = Join-Path $scratchDir $targetFileName

if (-not (Test-Path $templateFile)) {
    Write-Warning "task-template.md not found. Using minimal template."
    $content = @"
# Task — $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## 0. Request

**Received by (PM)**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**User Request**:
> Request for: $Name

**Classification**: <!-- Debug / Graph Analysis / Interface / Infra / ABAP Dev -->
**Package**: `$TMP`

## 1. Business Analysis

## 2. Technical Design

## 3. Implementation Log

## 4. QA / Test Results

## 5. Finalization
"@
    Set-Content -Path $targetFilePath -Value $content
} else {
    $content = Get-Content $templateFile -Raw
    $content = $content -replace "<!-- date and time -->", (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    $content = $content -replace "<!-- paste original user request verbatim -->", "Request for: $Name"
    Set-Content -Path $targetFilePath -Value $content
}

Write-Host "Created new task: $targetFileName" -ForegroundColor Green
Write-Host "Path: $targetFilePath" -ForegroundColor Cyan
