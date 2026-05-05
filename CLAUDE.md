# CLAUDE.md

**Claude Code (CLI & Desktop App)** configuration for the vsp/SAP ABAP Harness Engineering project.

> **Doc intent:** This file is Claude Code-specific. Shared project context (build, codebase map, ABAP rules, Harness workflow) lives in [docs/CONTEXT.md](docs/CONTEXT.md). Agent roles live in [AGENTS.md](AGENTS.md). Per-session skills live in [docs/SKILL.md](docs/SKILL.md).

---

## Session Start

**You MUST read `docs/SKILL.md` at the start of every session or before using any ABAP-related tools.** It contains technical guidelines, optimization settings, and custom skill definitions that take precedence over general knowledge.

Then read `docs/CONTEXT.md` for shared project context (build commands, codebase map, ABAP dev rules).

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

**All `.md` files (including `docs/SKILL.md`, `AGENTS.md`, `MEMORY.md`, etc.) must be written in English at all times.** This ensures global accessibility and consistency for all AI agents and human developers.
- **File Isolation**: Always create `.abap` files in the `scratch/` directory.

---

## Claude Code: CLI vs Desktop App

Both the CLI and the Desktop App share the same configuration files and MCP server setup. Key differences to be aware of:

| Feature | CLI | Desktop App |
|---------|:---:|:-----------:|
| Platform | Windows / macOS / Linux | Windows / macOS only |
| `.mcp.json` auto-load | ✅ | ✅ identical |
| `.claude/settings.json` | ✅ | ✅ identical |
| PostToolUse hooks fire | ✅ | ⚠️ does not fire (known issue) |
| Custom skills / slash commands | ✅ | ✅ |
| Plan mode + subagent dispatch | ✅ | ✅ |
| Visual diff / inline review | ❌ | ✅ |
| Parallel sessions (auto worktrees) | ❌ | ✅ |
| PR monitoring + CI status bar | ❌ | ✅ |
| Computer use (GUI automation) | ❌ | ✅ Win/macOS |
| Live app preview (embedded browser) | ❌ | ✅ |

> **Hook limitation**: `PostToolUse` hooks configured in `.claude/settings.json` do **not** fire in the Desktop App. After any `WriteSource` / `EditSource`, run the Post-Write Mandatory Chain manually (see `docs/SKILL.md § Post-Write Mandatory Chain`) and sync via `scripts/vsp-sync.sh` or `scripts/vsp-sync.ps1`.

> **Linux developers**: Use CLI only — the Desktop App is not available on Linux.

> **Recommended split**: Use CLI for automated ABAP workflows (hook-driven, multi-agent orchestration). Use Desktop App for visual diff review, PR monitoring, and parallel sessions.

---

## MCP Configuration (Claude Code CLI & Desktop App)

Config file: `.mcp.json` (project root) — auto-loaded by both the CLI and the Desktop App.

```json
{
  "mcpServers": {
    "abap": {
      "command": "./vsp",
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

The relative path `./vsp` works because Claude Code CLI resolves it against the project root.

---

## Claude Code Settings

- `.claude/settings.json` — shared team permissions (committed to repo)
- `.claude/settings.local.json` — personal write permissions + git operations (gitignored)

Both files are loaded automatically. `enableAllProjectMcpServers: true` is set in the local file to activate the abap MCP server.

---

---

*Last Updated: 2026-05-05*

---

## Hooks

A `PostToolUse` hook fires after every `Write` or `Edit` tool call and runs `scripts/sync-md.sh` (cross-platform wrapper). This hook is defined in `.claude/settings.json`.

| Environment | Hook fires? | Notes |
|-------------|:-----------:|-------|
| Claude Code CLI | ✅ | Automatic on every WriteSource/EditSource |
| Claude Code Desktop App | ❌ | Known issue — run Post-Write chain manually |
| Gemini CLI | ✅ | Same hook defined in `.gemini/settings.json` |
| Antigravity | ❌ | No hook support in VS Code extension |

`sync-md.sh` detects `pwsh` or `powershell` and delegates to `sync-md.ps1`, which is currently a no-op placeholder retained for future doc-validation automation. If neither PowerShell variant is installed (macOS/Linux without PowerShell), the script exits silently with code 0.
