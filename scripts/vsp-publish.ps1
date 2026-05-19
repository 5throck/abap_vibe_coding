# scripts/vsp-publish.ps1
# Usage: .\scripts\vsp-publish.ps1 -CommitMessage "feat: align with main reference implementation"
# Standardized packaging script to sanitize and copy core framework assets to the plugin repository.

param(
    [string]$TargetDir = $env:CLAUDE_PLUGIN_ROOT,
    [string]$CommitMessage
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$SourceDir = Resolve-Path (Join-Path $ScriptDir "..")

Write-Host "--- Harness Packaging & Publishing Hook ---" -ForegroundColor Cyan

# 1. Resolve and validate target directory (CLAUDE_PLUGIN_ROOT required; no hardcoded fallback)
if ([string]::IsNullOrWhiteSpace($TargetDir)) {
    Write-Error "CLAUDE_PLUGIN_ROOT is not set and -TargetDir was not provided.`nUsage: `$env:CLAUDE_PLUGIN_ROOT='C:\path\to\abap_vibe_coding_plugin'; .\scripts\vsp-publish.ps1 -CommitMessage '<message>'"
    exit 1
}
if (-not (Test-Path $TargetDir)) {
    Write-Error "Target plugin directory '$TargetDir' does not exist."
    exit 1
}

# 2. Define Assets to Copy
$Assets = @(
    @{ Source = "agents"; Target = "agents"; IsFolder = $true },
    @{ Source = "skills"; Target = "skills"; IsFolder = $true },
    @{ Source = ".claude\commands"; Target = "commands"; IsFolder = $true },
    @{ Source = "scripts\install-vsp.ps1"; Target = "scripts\install-vsp.ps1"; IsFolder = $false },
    @{ Source = "scripts\install-vsp.sh"; Target = "scripts\install-vsp.sh"; IsFolder = $false },
    @{ Source = "scripts\sync-md.ps1"; Target = "scripts\sync-md.ps1"; IsFolder = $false },
    @{ Source = "scripts\sync-md.sh"; Target = "scripts\sync-md.sh"; IsFolder = $false },
    @{ Source = "scripts\vsp-audit.ps1"; Target = "scripts\vsp-audit.ps1"; IsFolder = $false },
    @{ Source = "scripts\vsp-audit.sh"; Target = "scripts\vsp-audit.sh"; IsFolder = $false },
    @{ Source = "scripts\vsp-sync.ps1"; Target = "scripts\vsp-sync.ps1"; IsFolder = $false },
    @{ Source = "scripts\vsp-sync.sh"; Target = "scripts\vsp-sync.sh"; IsFolder = $false },
    @{ Source = "scripts\vsp-task.ps1"; Target = "scripts\vsp-task.ps1"; IsFolder = $false },
    @{ Source = "scripts\vsp-task.sh"; Target = "scripts\vsp-task.sh"; IsFolder = $false },
    @{ Source = ".mcp.json.sample"; Target = ".mcp.json.sample"; IsFolder = $false }
)

Write-Host "Copying core assets to plugin..." -ForegroundColor Green

foreach ($asset in $Assets) {
    $srcPath = Join-Path $SourceDir $asset.Source
    $tgtPath = Join-Path $TargetDir $asset.Target
    
    if (-not (Test-Path $srcPath)) {
        Write-Warning "Source path '$srcPath' not found. Skipping."
        continue
    }
    
    if ($asset.IsFolder) {
        # Clean target directory first to prevent orphaned files
        if (Test-Path $tgtPath) {
            Remove-Item -Path $tgtPath -Recurse -Force
        }
        New-Item -Path $tgtPath -ItemType Directory -Force | Out-Null
        Copy-Item -Path "$srcPath\*" -Destination $tgtPath -Recurse -Force
        Write-Host "  [+] Synced Folder: $($asset.Source) -> $($asset.Target)" -ForegroundColor Gray
    } else {
        $parentTgt = Split-Path -Parent $tgtPath
        if (-not (Test-Path $parentTgt)) {
            New-Item -Path $parentTgt -ItemType Directory -Force | Out-Null
        }
        Copy-Item -Path $srcPath -Destination $tgtPath -Force
        Write-Host "  [+] Synced File  : $($asset.Source) -> $($asset.Target)" -ForegroundColor Gray
    }
}

# 3. Commit and Push inside the Target Repository
if (-not [string]::IsNullOrWhiteSpace($CommitMessage)) {
    Write-Host "Staging and committing in target plugin repository..." -ForegroundColor Green
    $currDir = Get-Location
    Set-Location $TargetDir
    
    try {
        $branch = & git rev-parse --abbrev-ref HEAD
        git add -A
        $status = git status --porcelain
        if ([string]::IsNullOrWhiteSpace($status)) {
            Write-Host "No changes detected in plugin repository. Distribution up to date." -ForegroundColor Yellow
        } else {
            git commit -m "$CommitMessage"
            Write-Host "Pushing to remote origin $branch..." -ForegroundColor Green
            git push origin $branch
            Write-Host "Distribution successfully pushed!" -ForegroundColor Green
        }
    } catch {
        Write-Error "Failed to commit and push inside the target repository: $_"
    } finally {
        Set-Location $currDir
    }
}

Write-Host "Harness packaging complete!" -ForegroundColor Green
