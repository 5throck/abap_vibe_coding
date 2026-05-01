# sync-md.ps1
# Bidirectional sync between CLAUDE.md and GEMINI.md.
# Triggered by Claude Code PostToolUse hook after Write or Edit tool calls.
# Reads CLAUDE_TOOL_INPUT env var to detect which file was just modified.

param()

$projectRoot = Split-Path -Parent $PSScriptRoot

# Parse tool input to get the file path that was just written/edited
$toolInputJson = $env:CLAUDE_TOOL_INPUT
if (-not $toolInputJson) { exit 0 }

try {
    $toolInput = $toolInputJson | ConvertFrom-Json
} catch {
    exit 0
}

# Support both Write (file_path) and Edit (file_path) tool schemas
$modifiedFile = $toolInput.file_path
if (-not $modifiedFile) { exit 0 }

$claudePath = Join-Path $projectRoot "CLAUDE.md"
$geminiPath = Join-Path $projectRoot "GEMINI.md"

$modifiedFile = $modifiedFile -replace '\\', '/'
$claudeNorm   = $claudePath  -replace '\\', '/'
$geminiNorm   = $geminiPath  -replace '\\', '/'

# ── CLAUDE.md was edited → sync to GEMINI.md ──────────────────────────────
if ($modifiedFile -eq $claudeNorm) {
    $content = Get-Content -Path $claudePath -Raw -Encoding UTF8
    # Replace the header title and any self-references
    $content = $content -replace '^# CLAUDE\.md', '# GEMINI.md'
    $content = $content -replace 'CLAUDE\.md = dev context', 'GEMINI.md = dev context'
    Set-Content -Path $geminiPath -Value $content -Encoding UTF8 -NoNewline
    Write-Host "[sync-md] CLAUDE.md → GEMINI.md synced"
    exit 0
}

# ── GEMINI.md was edited → sync to CLAUDE.md ──────────────────────────────
if ($modifiedFile -eq $geminiNorm) {
    $content = Get-Content -Path $geminiPath -Raw -Encoding UTF8
    # Replace the header title and any self-references
    $content = $content -replace '^# GEMINI\.md', '# CLAUDE.md'
    $content = $content -replace 'GEMINI\.md = dev context', 'CLAUDE.md = dev context'
    Set-Content -Path $claudePath -Value $content -Encoding UTF8 -NoNewline
    Write-Host "[sync-md] GEMINI.md → CLAUDE.md synced"
    exit 0
}

exit 0
