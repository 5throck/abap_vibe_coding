# commit-msg.ps1: auto-log memory + CHANGELOG on every direct git commit.
# Receives the commit message file path as $1.

$ErrorActionPreference = "Stop"
$OutputEncoding = [Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$commitMsgFile = $args[0]
if (-not (Test-Path $commitMsgFile)) { exit 0 }

$commitMsg = (Get-Content $commitMsgFile -Encoding UTF8 -TotalCount 1).Trim()
$commitBody = (Get-Content $commitMsgFile -Encoding UTF8 | Select-Object -Skip 1) |
    Where-Object { $_ -notmatch '^#' -and $_ -ne '' } |
    Select-Object -First 5

# Skip empty, Merge, WIP, fixup!, squash! commits
if ([string]::IsNullOrEmpty($commitMsg)) { exit 0 }
if ($commitMsg -match '^(Merge|WIP|fixup!|squash!)') { exit 0 }

$today = Get-Date -Format "yyyy-MM-dd"
New-Item -ItemType Directory -Path "memory" -Force | Out-Null

$staged = git diff --cached --name-only
$stagedFiles = $staged | Where-Object { $_ -notlike "memory/*" }
$stagedCount = ($stagedFiles | Measure-Object).Count

# Extract decisions from commit body
$decisions = @()
$decisionPatterns = @('decided:', 'choice:', 'selected:', 'chose:', 'why:', 'because:')
foreach ($line in $commitBody) {
    foreach ($pattern in $decisionPatterns) {
        if ($line -imatch "$pattern\s+(.+)") {
            $decisions += $matches[1]
        }
    }
}

# Extract issues from commit body
$issues = @()
$issuePatterns = @('issue:', 'bug:', 'fix:', 'problem:', 'blocker:', 'error:', 'fail:')
foreach ($line in $commitBody) {
    foreach ($pattern in $issuePatterns) {
        if ($line -imatch "$pattern\s+(.+)") {
            $issues += $matches[1]
        }
    }
}
if ($issues.Count -eq 0) { $issues = @("None") }

# Build purpose from commit body or title
if ($commitBody.Count -gt 0) {
    $purpose = $commitBody[0]
} else {
    switch -Regex ($commitMsg) {
        '^feat:'  { $purpose = "Feature implementation: " + $commitMsg.Substring(6) }
        '^fix:'   { $purpose = "Bug fix: " + $commitMsg.Substring(5) }
        '^refactor:' { $purpose = "Refactoring: " + $commitMsg.Substring(10) }
        '^docs:'  { $purpose = "Documentation update: " + $commitMsg.Substring(6) }
        '^test:'  { $purpose = "Test improvement: " + $commitMsg.Substring(6) }
        '^chore:' { $purpose = "Maintenance task: " + $commitMsg.Substring(7) }
        default  { $purpose = $commitMsg }
    }
}

# Build file list
$fileList = if ($stagedFiles.Count -gt 0) { $stagedFiles -join ", " } else { "No files" }

# Auto-append memory log
$memoryFile = "memory/$today.md"
# dev-sync.ts's own step-1 log entry uses a fixed "## Session Summary" heading with
# the commit message as plain body text on the next line — NOT "## $commitMsg" as a
# heading — so matching that shape never found dev-sync's entry and duplicated it on
# every /sync run. Match the raw message text instead of a heading shape.
# `-and` does not short-circuit in PowerShell, so the old one-liner called
# Get-Content unconditionally and would throw on the first commit of a new day
# (file not yet created) under $ErrorActionPreference = "Stop"; this splits the
# existence check out so Get-Content only runs when the file is actually there.
$entryExists = $false
if (Test-Path $memoryFile) {
    $entryExists = (Get-Content $memoryFile -Raw -Encoding UTF8) -match [regex]::Escape($commitMsg)
}

if (-not $entryExists) {
    $separator = if (Test-Path $memoryFile) { "`n---`n`n" } else { "" }

    $entry = @(
        $separator
        "## $commitMsg"
        ""
        "**Summary**: $purpose"
        ""
        "**Files Changed** ($stagedCount files): $fileList"
    )

    if ($decisions.Count -gt 0) {
        $entry += ""
        $entry += "**Decisions**:"
        foreach ($d in $decisions) {
            if ($d.Trim()) { $entry += "- $d" }
        }
    }

    $entry += ""
    $entry += "**Issues**: $($issues -join ', ')"
    $entry += ""

    $entry | Out-File -FilePath $memoryFile -Encoding UTF8 -Append
}

exit 0
