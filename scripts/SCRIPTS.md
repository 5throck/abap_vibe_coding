# Scripts Registry

| Script | Purpose | Layer |
|--------|---------|-------|
| `dev-sync.ts` | Full sync pipeline (memlog → changelog → audit → commit → PR) | L0+L1 |
| `sync-skills.ts` | 3-platform skill distribution (.agents → .claude/.gemini) | L0+L1 |
| `audit.ts` | Documentation integrity audit | L0+L1 |
| `sync-md.ts` | Update memory/MEMORY.md index | L0+L1 |
| `sync-mcp.ts` | Propagate .mcp.json (SSOT) to .claude/.gemini settings | L0+L1 |
| `verify-skills.ts` | Skill auto-discovery and index generation | L0+L1 |
| `agent-verify.ts` | Agent file ↔ documentation synchronization check | L0+L1 |
| `agent-create.ts` | Create new agent files from template | L0+L1 |
| `agent-list.ts` | List all agents with metadata | L0+L1 |
| `agent-delete.ts` | Delete agent files | L0+L1 |
| `dispatch.ts` | Main CLI dispatcher with parallel/serial modes | L1 |
| `dispatch-parallel.ts` | Parallel agent dispatcher for read-only tasks | L1 |
| `dispatch-serial.ts` | Serial pipeline executor for write operations | L1 |
| `retry-handler.ts` | Error recovery with 3-retry limit and exponential backoff | L1 |
| `vsp-audit.ts` | VSP configuration audit | L1 |
| `vsp-task.ts` | Create task files from template | L1 |
| `new-requirement.ts` | Scaffold deliverables/REQ-NNN-slug/01_srs.md and register RTM row | L1 |
| `setup.ts` | Project environment setup | L1 |
| `scratch-cleanup.ts` | Scratch workspace hygiene (temp purge, task archival, status) | L1 |
| `install-vsp.ts` | VSP (VS Code extension) installation | L1 |
| `install-bun.ts` | Bun runtime installation | L1 |
| `vsp-publish.sh` | Publish VSP binary (Unix) | L1 |
| `vsp-publish.ps1` | Publish VSP binary (Windows) | L1 |
| `git-sync.ts` | ~~Simple commit-and-push utility~~ Superseded by `dev-sync.ts` | L1 (deprecated) |

## Layer Legend
- **L0**: Workspace-root common scripts (managed by templates/common)
- **L1**: Variant-specific scripts (managed by co-abap variant)
- **L0+L1**: Common infrastructure scripts used across all variants
