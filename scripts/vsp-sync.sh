#!/bin/bash
# scripts/vsp-sync.sh
# Usage: ./scripts/vsp-sync.sh "type: summary"
# Syncs memory logs, updates index, and commits to Git.

MESSAGE=$1
DATE=$(date +%Y-%m-%d)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MEMORY_DIR="$SCRIPT_DIR/../memory"
MEMORY_FILE="$MEMORY_DIR/$DATE.md"
INDEX_FILE="$MEMORY_DIR/MEMORY.md"

echo "--- VSP Sync & Report ---"
bash "$SCRIPT_DIR/vsp-audit.sh" || exit 1

# 1. Check for today's memory log — auto-create if missing
if [ ! -f "$MEMORY_FILE" ]; then
    echo "Memory log for today not found. Auto-creating $DATE.md..."
    mkdir -p "$MEMORY_DIR"
    {
        echo "# Memory Log: $DATE"
        echo ""
        echo "<!-- Auto-created by vsp-sync.sh. Add entries below. -->"
        echo ""
        echo "## $(date '+%H:%M') — Session"
        echo ""
        echo "<!-- Describe what was done today -->"
    } > "$MEMORY_FILE"
    echo "Created: $MEMORY_FILE"
fi

# 2. Update MEMORY.md index if needed
if [ -f "$INDEX_FILE" ] && ! grep -q "\[$DATE\]($DATE.md)" "$INDEX_FILE"; then
    echo "Updating memory index..."

    SUMMARY="Development update"
    FIRST_HEADER=$(grep -m 1 "^## " "$MEMORY_FILE" | sed 's/^## //')
    if [ -n "$FIRST_HEADER" ]; then
        SUMMARY="$FIRST_HEADER"
    fi
    if [[ $MESSAGE =~ :[[:space:]]*(.*) ]]; then
        SUMMARY=${BASH_REMATCH[1]}
    fi

    NEW_ENTRY="| [$DATE]($DATE.md) | $SUMMARY |"

    # awk is portable across macOS and Linux (sed -i in-place differs between them)
    awk -v entry="$NEW_ENTRY" '
        /^\|------\|---------\|$/ { print; print entry; next }
        { print }
    ' "$INDEX_FILE" > "$INDEX_FILE.tmp" && mv "$INDEX_FILE.tmp" "$INDEX_FILE"
fi

# 3. Git Commit
if [ -z "$MESSAGE" ]; then
    echo -n "Enter commit message (e.g., feat: add new report): "
    read -r MESSAGE
fi

if [ -z "$MESSAGE" ]; then
    echo "Error: Commit message is required."
    exit 1
fi

echo "Committing to Git..."
git add -A
git commit -m "$MESSAGE"

echo "Sync complete!"
