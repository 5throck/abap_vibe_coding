# CLAUDE.md

**Claude Code (CLI & Desktop App)** configuration for the vsp/SAP ABAP Harness Engineering project.

> **Doc intent:** This file is Claude Code-specific. Shared project context (build, codebase map, ABAP rules, Harness workflow) lives in [docs/context.md](docs/context.md). Agent roles live in [AGENTS.md](AGENTS.md). Per-session skills live in [skills/abap-dev/SKILL.md](skills/abap-dev/SKILL.md).

---

## Session Start Checklist

<!-- Shared 5-step checklist (matches GEMINI.md Section 1) — platform overrides in each file -->

At the start of every Claude Code session, run this checklist:
*(Ref: `docs/context.md` -> `Initial Context Files`)*

```
0. git config core.hooksPath .githooks         # activate hooks (run once per clone)
1. Read docs/context.md                        # full architecture map, ABAP rules, workflow
2. Read AGENTS.md                              # canonical agent roster
3. Read memory/MEMORY.md                       # recent session history (skip if absent)
4. Read skills/abap-dev/SKILL.md               # SAP development workflows
5. Read skills/post-write-chain/SKILL.md       # mandatory QA chain after any write
```

---

---

## Claude Code: CLI vs Desktop App

Both the CLI and the Desktop App share the same configuration files and MCP server setup. Key differences, especially regarding hook behavior and UI features, are detailed in [docs/tooling-matrix.md](docs/tooling-matrix.md).

> **Hook limitation**: `PostToolUse` hooks configured in `.claude/settings.json` do **not** fire in the Desktop App. After any `WriteSource` / `EditSource`, run the Post-Write Mandatory Chain manually (see [skills/post-write-chain/SKILL.md](skills/post-write-chain/SKILL.md)) and sync via `bun scripts/dev-sync.ts`.

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

A `PostToolUse` hook fires after every `Write` or `Edit` tool call and runs `bun scripts/sync-md.ts`. This hook is defined in `.claude/settings.json`.

| Environment | Hook fires? | Notes |
|-------------|:-----------:|-------|
| Claude Code CLI | —| Automatic on every WriteSource/EditSource |
| Claude Code Desktop App | —| Known issue —run Post-Write chain manually |
| Gemini CLI | —| Automated hooks disabled —run Post-Write chain manually |
| Antigravity | —| No hook support in VS Code extension |

`sync-md.ts` updates the `memory/MEMORY.md` index after every edit. This ensures session context is maintained in real-time.


### Desktop App Manual Post-Write Chain

When using Claude Code Desktop App, PostToolUse hooks do not fire. After any `WriteSource` or `EditSource`, run this chain manually:

```
1. bun scripts/sync-md.ts          # update memory index
2. SyntaxCheck(<object_url>)        # verify ABAP syntax
3. RunUnitTests(<object_url>)       # run unit tests
4. RunATCCheck(<object_url>)        # ATC quality check
5. bun scripts/dev-sync.ts "fix: description"  # sync & commit
```

See `skills/desktop-app-fallback/SKILL.md` for the complete fallback workflow.


---

*Last Updated: 2026-08-17*


### Optimal Interaction Guidelines
- **XML Tagging**: Utilize XML tags like `<thought>`, `<plan>`, and `<execution>` to structure complex reasoning and plans before generating final responses.
- **Tone**: Maintain an objective, highly analytical tone. Focus on systematic execution.

## Subagent Dispatch & 3-Tier Model Mapping

To fully leverage the 3-tier cost optimization strategy during execution plan creation and subagent dispatch, you must explicitly set the `model` parameter in `Agent()` calls using the correct short alias. 

**Registry Model ID to Short Alias Translation:**
- **High-tier (Design/Planning)**: Registry ID `claude-opus-*` → `model = "opus"`
- **Medium-tier (Review/QA)**: Registry ID `claude-sonnet-*` → `model = "sonnet"`
- **Low-tier (Execution/Coding)**: Registry ID `claude-haiku-*` → `model = "haiku"`

**Example `Agent()` Call:**
```javascript
Agent(
  model = "haiku", // Use short alias: opus, sonnet, or haiku
  description = "Code-writer for serial implementation",
  prompt = "..."
)
```
When dispatching subagents defined in `agents/*.md`, translate their configured tier into the corresponding short alias above.


<!-- COMMON-CLAUDE:START -->
#### teammateMode (Claude Code Agent Teams execution mode)

**teammateMode** specifies the parallel execution mode when Agent Teams is enabled in Claude Code.

**Values**:
- `in-process` — Parallel execution within the same process (applies to both Claude Code CLI and Desktop App)
- `tmux` — Parallel execution using tmux split-pane (Claude Code CLI only, not supported in Desktop App)
- `null` — Default value (auto-selects based on environment)

**Configuration location**: `.claude/settings.json` → `teammateMode`

**Note**: Antigravity does not have an equivalent to Agent Teams, so teammateMode is a Claude Code-specific setting. Antigravity 2.0+ uses Agent Manager to manage multiple workspace shards.

**Relationship to execution plan table**: teammateMode controls parallel execution mode. The execution plan table defines the multi-agent task dispatch.
<!-- COMMON-CLAUDE:END -->
