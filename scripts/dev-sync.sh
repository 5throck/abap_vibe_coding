#!/bin/bash
# scripts/dev-sync.sh
# Project Constitution §3 standard entry point for /sync command.
# Delegates to vsp-sync.sh which contains the full sync pipeline.
#
# Usage: ./scripts/dev-sync.sh "feat: description"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec bash "$SCRIPT_DIR/vsp-sync.sh" "$@"
