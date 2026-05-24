# CLAUDE.md

**Claude Code (CLI & Desktop App)** configuration for the vsp/SAP ABAP Harness Engineering project.

> **Doc intent:** This file is Claude Code-specific. Shared project context (build, codebase map, ABAP rules, Harness workflow) lives in [docs/context.md](docs/context.md). Agent roles live in [AGENTS.md](AGENTS.md). Per-session skills live in [skills/abap-dev/SKILL.md](skills/abap-dev/SKILL.md).

---

## Session Start

> **Ref: docs/context.md -> Session Start / Context Loading**

At the start of every Claude Code session, run this checklist:

```
0. git config core.hooksPath .githooks   # activate hooks (run once per clone)
1. Read https://raw.githubusercontent.com/5throck/ai-workspace-standards/main/CONSTITUTION.md               # workspace design standard
2. Read docs/context.md                  # project knowledge (build, codebase map, ABAP rules)
3. Read AGENTS.md                        # canonical agent roster
4. Read memory/MEMORY.md                 # recent session history (skip if absent)
5. Load skills/abap-dev/SKILL.md         # SAP development workflows and optimization settings
6. Load skills/post-write-chain/SKILL.md # mandatory QA chain after any write
```

---

---

## Claude Code: CLI vs Desktop App

Both the CLI and the Desktop App share the same configuration files and MCP server setup. Key differences, especially regarding hook behavior and UI features, are detailed in [docs/tooling-matrix.md](docs/tooling-matrix.md).

> **Hook limitation**: `PostToolUse` hooks configured in `.claude/settings.json` do **not** fire in the Desktop App. After any `WriteSource` / `EditSource`, run the Post-Write Mandatory Chain manually (see [skills/post-write-chain/SKILL.md](skills/post-write-chain/SKILL.md)) and sync via `scripts/vsp-sync.sh` or `scripts/vsp-sync.ps1`.

> **Linux developers**: Use CLI only —the Desktop App is not available on Linux.

> **Recommended split**: Use CLI for automated ABAP workflows (hook-driven, multi-agent orchestration). Use Desktop App for visual diff review, PR monitoring, and parallel sessions.

---



## Claude Code Settings

- `.claude/settings.json` —shared team permissions (committed to repo; note that `.claude/` is a hidden dot-folder and may not show in standard listing tools by default)
- `.claude/settings.local.json` —personal write permissions + git operations (gitignored)
- `.claude/commands/` —slash commands (`/sync`, `/memlog`, `/new-task`, `/triage`, `/transport`, `/post-write`, `/celebrate`)

Both files are loaded automatically. `enableAllProjectMcpServers: true` is set in the local file to activate the abap MCP server.


---

## Hooks

A `PostToolUse` hook fires after every `Write` or `Edit` tool call and runs `scripts/sync-md.sh` (cross-platform wrapper). This hook is defined in `.claude/settings.json`.

| Environment | Hook fires? | Notes |
|-------------|:-----------:|-------|
| Claude Code CLI | —| Automatic on every WriteSource/EditSource |
| Claude Code Desktop App | —| Known issue —run Post-Write chain manually |
| Gemini CLI | —| Automated hooks disabled —run Post-Write chain manually |
| Antigravity | —| No hook support in VS Code extension |

`sync-md.sh` detects the platform (Windows vs Unix) and delegates to `audit.ps1` or `audit.sh` to perform an immediate documentation and path audit after every edit. This ensures cross-platform integrity is maintained in real-time.


---

*Last Updated: 2026-05-24*


### Optimal Interaction Guidelines
- **XML Tagging**: Utilize XML tags like `<thought>`, `<plan>`, and `<execution>` to structure complex reasoning and plans before generating final responses.
- **Tone**: Maintain an objective, highly analytical tone. Focus on systematic execution.

