#!/bin/bash
# vsp-task.sh
# Usage: ./scripts/vsp-task.sh [task-name]
# Creates a new task file in scratch/ from the template.

NAME=${1:-"new-task"}
DATE=$(date +%Y-%m-%d)
TIME=$(date "+%Y-%m-%d %H:%M:%S")
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRATCH_DIR="$SCRIPT_DIR/../scratch"
TEMPLATE_FILE="$SCRIPT_DIR/../docs/task-template.md"

if [ ! -f "$TEMPLATE_FILE" ]; then
    echo "Error: Template file not found at $TEMPLATE_FILE"
    exit 1
fi

# Find next sequence number
NEXT_SEQ=1
EXISTING_FILES=$(ls "$SCRATCH_DIR"/task-"$DATE"-*.md 2>/dev/null)
if [ -n "$EXISTING_FILES" ]; then
    # Portable extraction of the number part: task-YYYY-MM-DD-NNN.md -> NNN
    MAX_SEQ=$(echo "$EXISTING_FILES" | awk -F"-" '{print $NF}' | sed 's/\.md//' | sort -n | tail -1)
    if [ -n "$MAX_SEQ" ]; then
        NEXT_SEQ=$((10#$MAX_SEQ + 1))
    fi
fi

SEQ_STR=$(printf "%03d" $NEXT_SEQ)
TARGET_FILE_NAME="task-$DATE-$SEQ_STR.md"
TARGET_FILE_PATH="$SCRATCH_DIR/$TARGET_FILE_NAME"

# Copy and update basic info (using sed in a portable way)
sed -e "s/<!-- date and time -->/$TIME/g" \
    -e "s/<!-- paste original user request verbatim -->/Request for: $NAME/g" \
    "$TEMPLATE_FILE" > "$TARGET_FILE_PATH"

echo "Created new task: $TARGET_FILE_NAME"
echo "Path: $TARGET_FILE_PATH"
