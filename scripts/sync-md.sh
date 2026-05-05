#!/bin/bash
# scripts/sync-md.sh
# Cross-platform PostToolUse hook wrapper for documentation audit.
#
# Runs on Windows (Git Bash), macOS, and Linux.
# Automatically selects the platform-specific audit script.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "--- Post-Edit Audit Hook ---"

if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    # Windows (Git Bash)
    powershell.exe -ExecutionPolicy Bypass -File "$SCRIPT_DIR/vsp-audit.ps1"
else
    # macOS / Linux
    bash "$SCRIPT_DIR/vsp-audit.sh"
fi

# We exit with the audit's exit code. 
# In Claude Code, if a hook fails, it will notify the user.
exit $?
