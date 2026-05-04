# CLAUDE.md

**Claude Code CLI** configuration for the vsp/SAP ABAP Harness Engineering project.

> **Doc intent:** This file is Claude Code-specific. Shared project context (build, codebase map, ABAP rules, Harness workflow) lives in [CONTEXT.md](CONTEXT.md). Agent roles live in [AGENTS.md](AGENTS.md). Per-session skills live in [SKILL.md](SKILL.md).

---

## Session Start

**You MUST read `SKILL.md` at the start of every session or before using any ABAP-related tools.** It contains technical guidelines, optimization settings, and custom skill definitions that take precedence over general knowledge.

Then read `CONTEXT.md` for shared project context (build commands, codebase map, ABAP dev rules).

---

## Memory Logging Rules

### When to write
Whenever an ABAP program, class, interface, or other object is **created or significantly changed**, append an entry to the **current date's memory file** (`memory/YYYY-MM-DD.md`).

Required entries:
- **Object name, type, package, and ADT URL**
- **Purpose summary** (what it does, what it queries, how it outputs)
- **Key technical decisions** (design choices, reasons, alternatives considered)
- **Issue history** (symptom → root cause → resolution)
- **MCP / config changes** (`.mcp.json`, `.vsp.json`, etc.)

### When to read
**Do NOT read memory files on every session start.** Only consult the relevant date's file when:
- A recurring or hard-to-diagnose error occurs
- Uncertain about a past design decision
- Investigating why something was implemented a certain way

### Format
All memory entries must be written in **English**.

---

## Documentation Language Rule

**All `.md` files (including `SKILL.md`, `AGENTS.md`, `MEMORY.md`, etc.) must be written in English at all times.** This ensures global accessibility and consistency for all AI agents and human developers.

---

## MCP Configuration (Claude Code CLI)

Config file: `.mcp.json` (project root) — auto-loaded by Claude Code CLI.

```json
{
  "mcpServers": {
    "abap": {
      "command": "./vsp.exe",
      "args": ["--mode", "hyperfocused"],
      "env": {
        "VSP_MODE": "hyperfocused",
        "VSP_ALLOWED_PACKAGES": "Z*,$TMP,$ZADT_VSP,$VSP_ADT",
        "VSP_FEATURE_ABAPGIT": "on"
      }
    }
  }
}
```

The relative path `./vsp.exe` works because Claude Code CLI resolves it against the project root.

---

## Claude Code Settings

- `.claude/settings.json` — shared team permissions (committed to repo)
- `.claude/settings.local.json` — personal write permissions + git operations (gitignored)

Both files are loaded automatically. `enableAllProjectMcpServers: true` is set in the local file to activate the abap MCP server.

---

---

*Last Updated: 2026-05-04*

---

## Hooks (Claude Code CLI only)

A `PostToolUse` hook fires after every `Write` or `Edit` tool call and runs `scripts/sync-md.ps1`. This hook is defined in `.claude/settings.json` and is **not active** in Gemini CLI or Antigravity sessions.

> **Note**: `sync-md.ps1` is currently a no-op placeholder. It previously synced CLAUDE.md ↔ GEMINI.md when they shared content, but that pattern is obsolete since `CONTEXT.md` was introduced as the shared source of truth. The hook is retained for future doc-validation automation.
