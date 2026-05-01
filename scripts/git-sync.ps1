param(
    [string]$Message = "Auto-sync: Documentation and configuration updates"
)

Write-Host "Starting auto-sync to Git..." -ForegroundColor Cyan

# Add all changes except ignored files
git add .

# Check if there are changes to commit
$status = git status --porcelain
if ($null -ne $status -and $status.Length -gt 0) {
    git commit -m "$Message"
    git push origin main
    Write-Host "Successfully synced to Git." -ForegroundColor Green
} else {
    Write-Host "No changes to sync." -ForegroundColor Yellow
}
