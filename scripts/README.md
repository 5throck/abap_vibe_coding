# VSP Scripts

## Bun-based Automation

All scripts are written in **TypeScript** and run via **Bun** for cross-platform compatibility.

## Prerequisites

```bash
# Install Bun (one-time)
bash scripts/install-bun.sh       # Unix/macOS
powershell -c "irm bun.sh/install.ps1"    # Windows
```

## Usage

### Direct Bun execution
```bash
bun scripts/dev-sync.ts "feat: add feature"
bun scripts/audit.ts
bun scripts/health-check.ts
```

### Via npm scripts
```bash
bun run dev-sync "feat: add feature"
bun run audit
bun run health
```

### Legacy wrappers (backward compatible)
**Windows:**
```powershell
powershell -f scripts/dev-sync.ps1 "feat: add feature"
powershell -f scripts/audit.ps1
```
**macOS / Linux:**
```bash
bash scripts/dev-sync.sh "feat: add feature"
bash scripts/audit.sh
```

## Available Scripts

| Script | Purpose | Priority |
|--------|---------|:--------:|
| `dev-sync.ts` | Full dev sync pipeline (changelog -> audit -> commit) | P0 |
| `audit.ts` | Documentation and path integrity audit | P0 |
| `sync-mcp.ts` | Synchronize .mcp.json to tool-specific settings | P0 |
| `health-check.ts` | System health (SAP, MCP, git, memory) | P2 |
| `post-write.ts` | Post-write QA chain (SyntaxCheck -> UnitTests -> ATC) | P1 |
| `verify-skills.ts` | Verify all skills are loadable | P1 |
| `update-memory-index.ts` | Auto-update memory/MEMORY.md index | P1 |

## Migration from .sh/.ps1

Legacy `.sh` wrappers are provided at `scripts/` root for backward compatibility.
These delegate to the Bun-based `.ts` implementations.
New development should use `.ts` files directly via `bun scripts/<name>.ts`.

## Troubleshooting

### Bun not found
```bash
bash scripts/install-bun.sh
```

### Permission denied on .ts files
```bash
chmod +x scripts/*.ts
```

### Script fails to run
1. Check Bun is installed: `bun --version`
2. Check file permissions: `ls -la scripts/*.ts`
3. Run with verbose output: `bun --verbose scripts/script.ts`
