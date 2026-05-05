# GEMINI.md

**vsp** — Go-native MCP server and CLI for SAP ABAP Development Tools (ADT).

> This file contains **Gemini-specific overrides only**.
> All shared dev context (build commands, codebase map, current priorities, common issues,
> ABAP rules, security) lives in [docs/context.md](docs/context.md) and applies to all AI tool sessions equally.
> Read `docs/context.md` first, then apply the overrides below.

---

## Gemini-Specific Configuration

### Recommended Mode

Use `--mode hyperfocused` for all Gemini sessions. The single `sap_execute` tool
reduces routing decisions and lowers hallucination risk on tool selection.

```bash
vsp mcp --mode hyperfocused
```

### Settings File

Gemini reads `.gemini/settings.json` in the project root. Confirm `mcpServers.abap.args`
contains `["--mode", "hyperfocused"]` before starting a session.

### Tool Usage in Hyperfocused Mode

All operations are routed through `sap_execute` with an `action` parameter:

```json
{ "action": "GetSource", "object_type": "PROG", "name": "ZPROG_SBOOK_QUERY" }
{ "action": "EditSource", "object_url": "/sap/bc/adt/...", "old_string": "...", "new_string": "..." }
{ "action": "GrepPackages", "packages": ["$TMP"], "pattern": "ZPROG_" }
```

See [docs/mcp_usage.md](docs/mcp_usage.md) for the full tool catalog and parameter reference.

---

## Gemini Skill Additions

The following capabilities extend those in [docs/skill.md](docs/skill.md):

- **Role-Based Execution**: Switch between Business and Technical roles defined in `AGENTS.md`
  by explicitly stating the active role at the start of a task.
- **Multi-Agent Coordination**: Delegate long-running research to `browser_subagent`;
  keep write operations (EditSource, WriteSource) in the primary session.
- **Advanced Diagnostics**: Use `vsp health` to validate architecture and
  `vsp slim` for context optimization before large read sessions.
- **Post-Write Test Chain**: After any write operation, execute the mandatory chain
  defined in `docs/skill.md § Post-Write Mandatory Chain`:
  `SyntaxCheck` → `RunUnitTests` → `RunATCCheck`.
  All three steps apply identically in Gemini sessions via `sap_execute`:
  ```json
  { "action": "SyntaxCheck",   "object_url": "/sap/bc/adt/..." }
  { "action": "RunUnitTests",  "object_url": "/sap/bc/adt/..." }
  { "action": "RunATCCheck",   "object_url": "/sap/bc/adt/..." }
  ```

## Git Commit Policy

**Auto-commits and hooks are disabled** per `docs/context.md § Harness Advanced Workflow`. The PM agent must run `git add -A && git commit` manually at the end of each task. Use Bash git commands directly for commits.
- **File Isolation**: Always create `.abap` files in the `scratch/` directory.

---

## Documentation Synchronization Rule

`docs/context.md` is the **single source of truth** for shared content.

| Change type | Action |
|-------------|--------|
| Shared content (build, codebase, priorities, issues) | Update `docs/context.md` only — no edit needed here |
| Gemini-specific config or skill | Update this file only |
| Agent roles or workflow | Update `AGENTS.md`; reflect summary in `docs/context.md` |

Do **not** copy shared sections from `docs/context.md` into this file.

---
*Last Updated: 2026-05-05*
