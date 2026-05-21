# GEMINI.md

**vsp** — Go-native MCP server and CLI for SAP ABAP Development Tools (ADT).

> This file contains **Gemini-specific overrides only**.
> All shared dev context (build commands, codebase map, current priorities, common issues,
> ABAP rules, security) lives in [docs/context.md](docs/context.md) and applies to all AI tool sessions equally.
> Read `docs/context.md` first, then apply the overrides below.

---

## Gemini-Specific Configuration

### Recommended Mode

Use `--mode hyperfocused` for all Gemini sessions. In hyperfocused mode all 101 MCP operations are accessible via `sap_execute`; the single entry point reduces tool-selection hallucinations without restricting capability.

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
- **Multi-Agent Coordination**: Delegate long-running research to background sessions;
  keep write operations (EditSource, WriteSource) in the primary session.
- **Advanced Diagnostics**: Use `vsp health` to validate architecture and
  `vsp slim` for context optimization before large read sessions.
- **Post-Write Test Chain**: After any write operation, execute the mandatory chain
  defined in [skills/post-write-chain/SKILL.md](skills/post-write-chain/SKILL.md):
  `SyntaxCheck` → `RunUnitTests` → `RunATCCheck`.
  All three steps apply identically in Gemini sessions via `sap_execute`:
  ```json
  { "action": "SyntaxCheck",   "object_url": "/sap/bc/adt/..." }
  { "action": "RunUnitTests",  "object_url": "/sap/bc/adt/..." }
  { "action": "RunATCCheck",   "object_url": "/sap/bc/adt/..." }
  ```

> **Common engineering rules** (memory logging, language, file isolation, post-write chain, git): [docs/context.md § Project-Wide Rules](docs/context.md#project-wide-rules-all-tools).

---

## Git Commit Policy

**Auto-commits and hooks are disabled** in Gemini CLI sessions. The PM agent must run `git add -A && git commit` manually at the end of each task. Use Bash git commands directly for commits.

## Gemini-Specific Workflows

### 1. Planning Mode & Architecture Changes
For complex tasks or architectural modifications, Gemini must enter **Planning Mode**:
1. Create a detailed technical design using the **Implementation Plan** artifact.
2. Obtain explicit user approval before modifying code.
3. Track tasks using `task.md` and document changes in `walkthrough.md`.
4. Ensure that after changes are verified, the outcomes are summarized in the project's `memory/YYYY-MM-DD.md` log.

### 2. Executing Custom Commands
Unlike Claude Code, Gemini does not natively register local custom slash commands from `.gemini/commands/` or `.claude/commands/`. Instead:
- Automation workflows like `/sync` or `/memlog` are simulated or executed directly as project scripts (e.g., executing `.\scripts\dev-sync.ps1` or `./scripts/dev-sync.sh` via terminal tools).
- System-provided slash commands (like `/goal`, `/schedule`, `/browser`, `/grill-me`) can be recommended to the user.

### 3. Coexistence, Precedence & Migration of .claude
This project contains a `.claude/` directory. To prevent configuration drift and avoid issues when transitioning away from Claude Code, Gemini follows these rules:
- **Absolute Precedence**: `.gemini/` always takes absolute precedence over `.claude/`. If `.gemini/` exists, `.claude/` is ignored by Gemini to prevent duplicate or conflicting configurations.
- **Fallback (Coexistence Phase)**: If a project lacks a `.gemini/` directory but contains `.claude/`, Gemini will temporarily read and respect `.claude/settings.json`, `.claude/settings.local.json`, and `.claude/commands/` as the fallback source of truth.
- **Graceful Migration**: If the project transitions fully away from Claude Code, or if Gemini needs to write new project-level settings/commands, Gemini should proactively offer to migrate the `.claude/` configuration to `.gemini/` (copying and adapting files) rather than leaving legacy files orphaned.
- **Command Emulation**: Custom slash commands defined as markdown files in `.claude/commands/` must be emulated by Gemini. Read the `.md` file to understand the underlying script execution and run those commands directly via terminal tools.
- **Gemini Integration Rule**: Gemini can dynamically instantiate roles defined in `AGENTS.md` using the `define_subagent` and `invoke_subagent` tools.

---
*Last Updated: 2026-05-21*
