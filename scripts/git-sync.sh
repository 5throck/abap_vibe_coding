#!/bin/bash
# git-sync.sh
# Usage: ./scripts/git-sync.sh [message]

MESSAGE=${1:-"Auto-sync: Documentation and configuration updates"}

echo "Starting auto-sync to Git..."

# Add all changes except ignored files
git add .

# Check if there are changes to commit
if ! git diff --cached --quiet; then
    git commit -m "$MESSAGE"
    git push origin main
    echo "Successfully synced to Git."
else
    echo "No changes to sync."
fi
