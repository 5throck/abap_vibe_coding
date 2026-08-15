# Project Scripts

All project automation scripts, implemented in **TypeScript** and running on the **Bun** runtime.

## Available Scripts

### Core Pipeline Scripts

| Script | Purpose |
|--------|---------|
| `dev-sync.ts` | Full sync pipeline (memlog → changelog → audit → commit → PR) |
| `audit.ts` | Documentation and file integrity audit |
| `sync-md.ts` | Update memory/MEMORY.md index |
| `vsp-audit.ts` | Legacy audit wrapper (delegates to audit.ts) |

### Utility Scripts

| Script | Purpose |
|--------|---------|
| `git-sync.ts` | Simple commit-and-push all changes |
| `vsp-task.ts` | Create task files in scratch/tasks/ from template |
| `install-bun.ts` | Bun runtime installer |
| `install-vsp.ts` | VSP binary installer from GitHub Releases |
| `setup.ts` | Post-scaffold environment setup (OS/stack detection, deps, licenses) |
| `vsp-publish.ts` | Package and publish core framework assets to the plugin repository (requires `CLAUDE_PLUGIN_ROOT`) |

### Agent Orchestration Scripts

| Script | Purpose |
|--------|---------|
| `verify-skills.ts` | Verify all skills in `skills/` are loadable |
| `agent-create.ts` | Create new agent definition files |
| `agent-list.ts` | List all agents with metadata |
| `agent-delete.ts` | Delete agent files |
| `agent-verify.ts` | Verify agent/documentation synchronization |
| `dispatch.ts` | Main entry point for agent dispatch |
| `dispatch-parallel.ts` | Parallel agent dispatcher |
| `dispatch-serial.ts` | Serial pipeline executor with dependencies |
| `retry-handler.ts` | Retry logic with exponential backoff |

## NPM Scripts

Convenience shortcuts defined in `package.json`:

```bash
bun run audit            # Run workspace standards audit
bun run dev-sync         # Full sync pipeline
bun run sync-md          # Update memory index
bun run vsp-audit        # Legacy audit wrapper
bun run git-sync         # Commit and push all changes
bun run vsp-task         # Create a new task file
bun run install:vsp      # Install VSP binary
bun run setup            # Post-scaffold environment setup
bun run verify-skills    # Verify skills
bun run agent:create     # Create new agent
bun run agent:list       # List agents
bun run agent:delete     # Delete agent
bun run agent:verify     # Verify agent/documentation sync
bun run dispatch:parallel  # Run parallel dispatch
bun run dispatch:serial    # Run serial dispatch
```

## Runtime Requirements

- **Bun >= 1.0.0** — all scripts use `#!/usr/bin/env bun` and Bun-specific APIs (`Bun.$`, `Bun.file`, `Bun.write`, `import.meta.path`)
- **Git** — used by dev-sync, git-sync, setup
- **GitHub CLI (`gh`)** — used by dev-sync for PR creation

## File Encoding

All scripts are **UTF-8 (without BOM)**.

## Script Conventions

- Shebang: `#!/usr/bin/env bun`
- Path resolution: `const scriptDir = path.dirname(import.meta.path); const projectRoot = path.resolve(scriptDir, "..");`
- Shell execution: `import { $ } from 'bun'` for git/gh commands
- File I/O: `Bun.file()` / `Bun.write()` or `node:fs` APIs
- CLI pattern: Manual `process.argv` parsing, `import.meta.main` guard
- Dual usage: Every script supports both CLI execution and `export { main }` for module use

---

*Project template - customize as needed*
