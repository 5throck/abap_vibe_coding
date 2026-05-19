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

The following capabilities extend those in [skills/abap-dev/SKILL.md](skills/abap-dev/SKILL.md):

- **Role-Based Execution**: Switch between Business and Technical roles defined in `AGENTS.md`
  by explicitly stating the active role at the start of a task.
- **Multi-Agent Coordination**: Delegate long-running research to `browser_subagent`;
  keep write operations (EditSource, WriteSource) in the primary session.
- **Advanced Diagnostics**: Use `vsp health` to validate architecture and
  `vsp slim` for context optimization before large read sessions.
- **Post-Write Test Chain**: After any write operation, execute the mandatory chain
  defined in `skills/abap-dev/SKILL.md § Post-Write Mandatory Chain`:
  `SyntaxCheck` → `RunUnitTests` → `RunATCCheck`.
  All three steps apply identically in Gemini sessions via `sap_execute`:
  ```json
  { "action": "SyntaxCheck",   "object_url": "/sap/bc/adt/..." }
  { "action": "RunUnitTests",  "object_url": "/sap/bc/adt/..." }
  { "action": "RunATCCheck",   "object_url": "/sap/bc/adt/..." }
  ```

## Common Session Rules

Memory logging, documentation language, file isolation, and the post-write quality gate apply to **all platforms**. See [AGENTS.md § Common Session Rules](AGENTS.md#-common-session-rules-all-platforms) for the authoritative definitions.

---

## Git Commit Policy

**Auto-commits and hooks are disabled** in Gemini CLI sessions. The PM agent must run `git add -A && git commit` manually at the end of each task. Use Bash git commands directly for commits.

---
*Last Updated: 2026-05-19*
