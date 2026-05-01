# GEMINI.md

**vsp** — Go-native MCP server and CLI for SAP ABAP Development Tools (ADT).

> This file contains **Gemini-specific overrides only**.
> All shared dev context (build commands, codebase map, current priorities, common issues,
> ABAP rules, security) lives in [CLAUDE.md](CLAUDE.md) and applies to Gemini sessions equally.
> Read `CLAUDE.md` first, then apply the overrides below.

---

## Gemini-Specific Configuration

### Recommended Mode

Use `--mode hyperfocused` for all Gemini sessions. The single `sap_execute` tool
reduces routing decisions and lowers hallucination risk on tool selection.

```bash
vsp mcp --mode hyperfocused
```

### Settings File

Gemini reads `.gemini/settings.json` in the project root. Confirm `mcpServers.vsp.args`
contains `["--mode", "hyperfocused"]` before starting a session.

### Tool Usage in Hyperfocused Mode

All operations are routed through `sap_execute` with an `action` parameter:

```json
{ "action": "GetSource", "object_type": "PROG", "name": "ZPROG_SBOOK_QUERY" }
{ "action": "EditSource", "object_url": "/sap/bc/adt/...", "old_string": "...", "new_string": "..." }
{ "action": "GrepPackages", "packages": ["$TMP"], "pattern": "ZPROG_" }
```

See [MCP_USAGE.md](MCP_USAGE.md) for the full tool catalog and parameter reference.

---

## Gemini Skill Additions

The following capabilities extend those in [SKILL.md](SKILL.md):

- **Role-Based Execution**: Switch between Business and Technical roles defined in `AGENTS.md`
  by explicitly stating the active role at the start of a task.
- **Multi-Agent Coordination**: Delegate long-running research to `browser_subagent`;
  keep write operations (EditSource, WriteSource) in the primary session.
- **Advanced Diagnostics**: Use `vsp health` to validate architecture and
  `vsp slim` for context optimization before large read sessions.

---

## Documentation Synchronization Rule

`CLAUDE.md` is the **single source of truth** for shared content.

| Change type | Action |
|-------------|--------|
| Shared content (build, codebase, priorities, issues) | Update `CLAUDE.md` only — no edit needed here |
| Gemini-specific config or skill | Update this file only |
| Agent roles or workflow | Update `AGENTS.md`; reflect summary in `CLAUDE.md` |

Do **not** copy shared sections from `CLAUDE.md` into this file.

---
*Last Updated: 2026-05-01*
