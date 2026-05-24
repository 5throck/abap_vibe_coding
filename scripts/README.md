# VSP Scripts

## Hybrid Scripting Automation

This project uses a **hybrid scripting approach**:
1. **Utility Scripts**: Everyday development utilities (like syncing, auditing) are implemented in pure **PowerShell (`.ps1`)** and **Bash (`.sh`)** for cross-platform ease of use without external dependencies.
2. **Agent Orchestration**: Complex multi-agent workflow coordination and orchestration logic are implemented in **TypeScript (`.ts`)** and executed via **Bun**.

## Everyday Usage (Utility Scripts)

Run these directly from your terminal depending on your OS.

**Windows:**
```powershell
.\scripts\dev-sync.ps1 "feat: add feature"
.\scripts\audit.ps1
```
**macOS / Linux:**
```bash
bash scripts/dev-sync.sh "feat: add feature"
bash scripts/audit.sh
```

### Available Utility Scripts

| Script | Purpose | Priority |
|--------|---------|:--------:|
| `dev-sync` | Full dev sync pipeline (changelog -> audit -> commit) | P0 |
| `audit` | Documentation and path integrity audit | P0 |
| `vsp-sync` | Legacy sync wrapper | P2 |

## Agent Orchestration (Bun)

For advanced agent logic, the project requires Bun.

### Prerequisites

```bash
# Install Bun (one-time)
bash scripts/install-bun.sh               # Unix/macOS
powershell -c "irm bun.sh/install.ps1"    # Windows
```

### Executing Agent Scripts
```bash
bun scripts/dispatch.ts parallel
bun scripts/verify-skills.ts
```

### Available Agent Scripts

| Script | Purpose | Priority |
|--------|---------|:--------:|
| `dispatch.ts` | Main CLI dispatcher with parallel/serial modes | P0 |
| `dispatch-parallel.ts` | Parallel agent dispatcher for read-only tasks | P0 |
| `dispatch-serial.ts` | Serial pipeline executor for write operations | P0 |
| `retry-handler.ts` | Automated error recovery and retries | P0 |
| `verify-skills.ts` | Verify all skills and generate SKILLS.md | P1 |

## Troubleshooting

### Bun not found
Ensure Bun is installed and in your PATH. If the install script failed, you can manually run:
```bash
curl -fsSL https://bun.sh/install | bash
```

### Script fails to run
1. Check file permissions on `.sh` files: `chmod +x scripts/*.sh`
2. Ensure you have the `.ps1` and `.sh` pair implemented if you are modifying a utility script.
