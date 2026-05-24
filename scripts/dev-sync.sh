#!/usr/bin/env bash
# Legacy wrapper for backward compatibility
# Delegates to Bun-based implementation

# Check if bun is available
if command -v bun &> /dev/null; then
    exec bun scripts/dev-sync.ts "$@"
else
    echo "❌ Bun is required. Run: bash scripts/install-bun.sh"
    exit 1
fi
