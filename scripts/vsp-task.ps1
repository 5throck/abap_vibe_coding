# vsp-task.ps1
# Usage: .\scripts\vsp-task.ps1 [-Name "task-name"]
# Creates a new task file in scratch/ from the template.

param(
    [string]$Name = "new-task"
)

$date = Get-Date -Format "yyyy-MM-dd"
$scratchDir = Join-Path $PSScriptRoot "..\scratch"
$templateFile = Join-Path $PSScriptRoot "..\docs\task-template.md"

if (-not (Test-Path $templateFile)) {
    Write-Error "Template file not found at $templateFile"
    exit 1
}

# Find next sequence number
$files = Get-ChildItem -Path $scratchDir -Filter "task-$date-*.md"
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

# Copy and update basic info
$content = Get-Content $templateFile -Raw
$content = $content -replace "<!-- date and time -->", (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
$content = $content -replace "<!-- paste original user request verbatim -->", "Request for: $Name"

Set-Content -Path $targetFilePath -Value $content

Write-Host "Created new task: $targetFileName" -ForegroundColor Green
Write-Host "Path: $targetFilePath" -ForegroundColor Cyan
