#!/bin/bash
# scripts/vsp-audit.sh
# Legacy wrapper — delegates to audit.sh.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
bash "$SCRIPT_DIR/audit.sh"
exit $?
