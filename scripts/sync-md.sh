#!/bin/bash
# scripts/sync-md.sh
# PostToolUse hook wrapper — runs vsp-audit.sh.
# Works on Windows (Git Bash / MSYS2), macOS, and Linux.
# The .sh script is always executed inside a bash context, so
# there is no need to call powershell.exe from here.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "--- Post-Edit Audit Hook ---"

bash "$SCRIPT_DIR/vsp-audit.sh"
exit $?
