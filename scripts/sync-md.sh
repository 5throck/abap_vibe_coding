#!/bin/bash
# sync-md.sh — Cross-platform PostToolUse hook wrapper
#
# Runs on Windows (Git Bash), macOS, and Linux.
# Invokes sync-md.ps1 via pwsh or powershell if available.
# Exits silently with code 0 if neither is installed — safe because
# sync-md.ps1 is currently a no-op placeholder retained for future
# doc-validation logic.
#
# Usage (configured in .claude/settings.json and .gemini/settings.json):
#   "command": "bash scripts/sync-md.sh"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if command -v pwsh &>/dev/null; then
    pwsh -File "$SCRIPT_DIR/sync-md.ps1"
elif command -v powershell &>/dev/null; then
    powershell -ExecutionPolicy Bypass -File "$SCRIPT_DIR/sync-md.ps1"
fi

exit 0
