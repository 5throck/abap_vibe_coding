# Scripts Registry

| Script | Version | Purpose | Layer |
|--------|---------|---------|-------|
| `dev-sync.ts` | 1.5.1 | Full sync pipeline (memlog → changelog → audit → commit → PR) | L0+L1 |
| `sync-skills.ts` | 1.4.1 | 3-platform skill distribution (.agents → .claude/.gemini) | L0+L1 |
| `audit.ts` | 2.10.17 | Documentation integrity audit | L0+L1 |
| `sync-md.ts` | 1.2.0 | Update memory/MEMORY.md index | L0+L1 |
| `sync-mcp.ts` | 1.0.0 | Propagate .mcp.json (SSOT) to .claude/.gemini settings | L0+L1 |
| `verify-skills.ts` | 1.0.0 | Skill auto-discovery and index generation | L0+L1 |
| `agent-verify.ts` | 1.0.0 | Agent file ↔ documentation synchronization check | L0+L1 |
| `agent-create.ts` | 1.0.0 | Create new agent files from template | L0+L1 |
| `agent-list.ts` | 1.0.0 | List all agents with metadata | L0+L1 |
| `agent-delete.ts` | 1.0.0 | Delete agent files | L0+L1 |
| `validate-docs-links.ts` | 1.0.0 | Scan Markdown documentation for dead links and file reference errors | L0+L1 |
| `validate-md-language.ts` | 1.5.0 | Detect undeclared Korean content in official markdown files | L0+L1 |
| `verify-readme-sync.ts` | 1.1.1 | Verify README.md / README_ko.md structural parity | L0+L1 |
| `analyze-git-history.ts` | 1.0.1 | Analyze git commit history for reporting/insights | L0+L1 |
| `cleanup-completed-md.ts` | 1.0.1 | Archive/clean completed markdown task files | L0+L1 |
| `dispatch.ts` | 1.0.0 | Main CLI dispatcher with parallel/serial modes | L1 |
| `dispatch-parallel.ts` | 1.0.0 | Parallel agent dispatcher for read-only tasks | L1 |
| `dispatch-serial.ts` | 1.0.0 | Serial pipeline executor for write operations | L1 |
| `retry-handler.ts` | 1.0.0 | Error recovery with 3-retry limit and exponential backoff | L1 |
| `vsp-audit.ts` | 1.0.0 | VSP configuration audit | L1 |
| `vsp-task.ts` | 1.0.0 | Create task files from template | L1 |
| `new-requirement.ts` | 1.0.0 | Scaffold deliverables/REQ-NNN-slug/01_srs.md and register RTM row | L1 |
| `setup.ts` | 1.0.0 | Project environment setup | L1 |
| `scratch-cleanup.ts` | 1.0.0 | Scratch workspace hygiene (temp purge, task archival, status) | L1 |
| `install-vsp.ts` | 1.0.0 | VSP (VS Code extension) installation | L1 |
| `install-bun.ts` | 1.0.0 | Bun runtime installation | L1 |
| `vsp-publish.ts` | 1.0.0 | Package and publish core framework assets to the plugin repository | L1 |
| `git-sync.ts` | 1.0.0 | ~~Simple commit-and-push utility~~ Superseded by `dev-sync.ts` | L1 (deprecated) |

## Test Files

Unit test files under `scripts/*.test.ts` are versioned alongside the script they cover but
are not part of the operational CLI surface.

| Test File | Version | Covers |
|-----------|---------|--------|
| `new-requirement.test.ts` | 1.0.0 | `new-requirement.ts` |
| `retry-handler.test.ts` | 1.0.0 | `retry-handler.ts` |
| `scratch-cleanup.test.ts` | 1.0.0 | `scratch-cleanup.ts` |
| `sync-mcp.test.ts` | 1.0.0 | `sync-mcp.ts` |
| `sync-md.test.ts` | 1.0.0 | `sync-md.ts` |
| `sync-skills.test.ts` | 1.0.0 | `sync-skills.ts` |
| `verify-skills.test.ts` | 1.0.0 | `verify-skills.ts` |
| `vsp-publish.test.ts` | 1.0.0 | `vsp-publish.ts` |

## Layer Legend
- **L0**: Workspace-root common scripts (managed by templates/common)
- **L1**: Variant-specific scripts (managed by co-abap variant)
- **L0+L1**: Common infrastructure scripts used across all variants
