#!/bin/bash
# vsp-task.sh
# Usage: ./scripts/vsp-task.sh [task-name]
# Creates a new task file in scratch/ from the template.

NAME=${1:-"new-task"}
DATE=$(date +%Y-%m-%d)
TIME=$(date "+%Y-%m-%d %H:%M:%S")
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRATCH_DIR="$SCRIPT_DIR/../scratch/tasks"
TEMPLATE_FILE="$SCRIPT_DIR/../docs/task-template.md"

# Create scratch dir if it doesn't exist
mkdir -p "$SCRATCH_DIR"

# Use inline template if docs/task-template.md doesn't exist
if [ ! -f "$TEMPLATE_FILE" ]; then
    echo "Warning: task-template.md not found. Using minimal template."
    TEMPLATE_CONTENT="# Task — <!-- date and time -->

## 0. Request

**Received by (PM)**: <!-- date and time -->
**User Request**:
> <!-- paste original user request verbatim -->

**Classification**: <!-- Debug / Graph Analysis / Interface / Infra / ABAP Dev -->
**Package**: \$TMP
**Affected Object Types**: <!-- fill after investigation -->

## 1. Business Analysis
<!-- Fill after read-only-analyst / sap-investigator / schema-inspector results -->

## 2. Technical Design
<!-- Fill after architect report -->

## 3. Implementation Log
<!-- Fill as code-writer completes steps -->

## 4. QA / Test Results
<!-- Fill after test-runner report -->

## 5. Finalization
<!-- Memory log entry, transport number, git commit -->
"
    NEXT_SEQ=1
    EXISTING_FILES=$(ls "$SCRATCH_DIR"/task-"$DATE"-*.md 2>/dev/null)
    if [ -n "$EXISTING_FILES" ]; then
        MAX_SEQ=$(echo "$EXISTING_FILES" | awk -F"-" '{print $NF}' | sed 's/\.md//' | sort -n | tail -1)
        if [ -n "$MAX_SEQ" ]; then
            NEXT_SEQ=$((10#$MAX_SEQ + 1))
        fi
    fi
    SEQ_STR=$(printf "%03d" $NEXT_SEQ)
    TARGET_FILE_NAME="task-$DATE-$SEQ_STR.md"
    TARGET_FILE_PATH="$SCRATCH_DIR/$TARGET_FILE_NAME"
    echo "$TEMPLATE_CONTENT" | sed \
        -e "s/<!-- date and time -->/$TIME/g" \
        -e "s/<!-- paste original user request verbatim -->/Request for: $NAME/g" \
        > "$TARGET_FILE_PATH"
    echo "Created new task: $TARGET_FILE_NAME"
    echo "Path: $TARGET_FILE_PATH"
    exit 0
fi

# Find next sequence number
NEXT_SEQ=1
EXISTING_FILES=$(ls "$SCRATCH_DIR"/task-"$DATE"-*.md 2>/dev/null)
if [ -n "$EXISTING_FILES" ]; then
    MAX_SEQ=$(echo "$EXISTING_FILES" | awk -F"-" '{print $NF}' | sed 's/\.md//' | sort -n | tail -1)
    if [ -n "$MAX_SEQ" ]; then
        NEXT_SEQ=$((10#$MAX_SEQ + 1))
    fi
fi

SEQ_STR=$(printf "%03d" $NEXT_SEQ)
TARGET_FILE_NAME="task-$DATE-$SEQ_STR.md"
TARGET_FILE_PATH="$SCRATCH_DIR/$TARGET_FILE_NAME"

sed -e "s/<!-- date and time -->/$TIME/g" \
    -e "s/<!-- paste original user request verbatim -->/Request for: $NAME/g" \
    -e "s|](../skills/|](../../skills/|g" \
    "$TEMPLATE_FILE" > "$TARGET_FILE_PATH"

echo "Created new task: $TARGET_FILE_NAME"
echo "Path: $TARGET_FILE_PATH"
