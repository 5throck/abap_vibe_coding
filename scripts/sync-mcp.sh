#!/usr/bin/env bash
# Legacy wrapper for backward compatibility

if command -v bun &> /dev/null; then
    exec bun scripts/sync-mcp.ts "$@"
else
    echo "❌ Bun is required. Run: bash scripts/install-bun.sh"
    exit 1
fi
