# CLAUDE.md

**Claude Code (CLI & Desktop App)** configuration for the vsp/SAP ABAP Harness Engineering project.

> **Doc intent:** This file is Claude Code-specific. Shared project context (build, codebase map, ABAP rules, Harness workflow) lives in [docs/context.md](docs/context.md). Agent roles live in [AGENTS.md](AGENTS.md). Per-session skills live in [skills/abap-dev/SKILL.md](skills/abap-dev/SKILL.md).

---

## Session Start

**At the start of every session, load the following skills before using any ABAP-related tools:**

1. [`skills/abap-dev/SKILL.md`](skills/abap-dev/SKILL.md) — SAP development workflows and optimization settings
2. [`skills/post-write-chain/SKILL.md`](skills/post-write-chain/SKILL.md) — mandatory QA chain after any write

Then read `docs/context.md` for shared project context (build commands, codebase map, ABAP dev rules).

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

**All `.md` files (including `skills/abap-dev/SKILL.md`, `AGENTS.md`, `MEMORY.md`, etc.) must be written in English at all times.** This ensures global accessibility and consistency for all AI agents and human developers.

**Exception — Korean localization files**: Any `.md` file whose name contains `_ko` (e.g., `README_ko.md`) **must** be written entirely in Korean. Do not mix languages within these files.

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

> **Hook limitation**: `PostToolUse` hooks configured in `.claude/settings.json` do **not** fire in the Desktop App. After any `WriteSource` / `EditSource`, run the Post-Write Mandatory Chain manually (see `skills/abap-dev/SKILL.md § Post-Write Mandatory Chain`) and sync via `scripts/vsp-sync.sh` or `scripts/vsp-sync.ps1`.

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

> **⚠️ Env var prefix note**: The official vibing-steampunk README uses `SAP_MODE` / `SAP_ALLOWED_PACKAGES` as env var names, while this project uses `VSP_MODE` / `VSP_ALLOWED_PACKAGES`. The `--mode` arg in `args` ensures the mode is set regardless. If package restrictions are not being applied, switch to the `SAP_*` prefix (e.g. `"SAP_ALLOWED_PACKAGES": "Z*,$TMP,..."`).

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
| Gemini CLI | ❌ | Automated hooks disabled — run Post-Write chain manually |
| Antigravity | ❌ | No hook support in VS Code extension |

`sync-md.sh` detects the platform (Windows vs Unix) and delegates to `vsp-audit.ps1` or `vsp-audit.sh` to perform an immediate documentation and path audit after every edit. This ensures cross-platform integrity is maintained in real-time.
