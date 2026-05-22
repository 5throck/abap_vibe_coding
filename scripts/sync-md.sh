#!/bin/bash
# scripts/sync-md.sh
# PostToolUse hook wrapper — runs vsp-audit.sh.
# Works on Windows (Git Bash / MSYS2), macOS, and Linux.
# The .sh script is always executed inside a bash context, so
# there is no need to call powershell.exe from here.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# --- Temporary file skip logic (방안 B) ---
# Claude Code passes the written file path via CLAUDE_FILE_PATHS (space-separated).
WRITTEN_FILE="${CLAUDE_FILE_PATHS:-}"
if [ -n "$WRITTEN_FILE" ]; then
  SKIP_PATTERNS=("scratch/temp" "scratch/tasks" "memory/" "docs/superpowers/")
  for pattern in "${SKIP_PATTERNS[@]}"; do
    if [[ "$WRITTEN_FILE" == *"$pattern"* ]]; then
      echo "  [skip] Temporary/generated file — audit skipped: $WRITTEN_FILE"
      exit 0
    fi
  done
fi

echo "--- Post-Edit Audit Hook ---"

bash "$SCRIPT_DIR/vsp-audit.sh"
exit $?
