# ABAP Development Skills (vsp)

This file defines the ABAP development capabilities and optimized workflow patterns for Claude Code and AI agents.

## Core Capabilities
- **Surgical Edits**: Use `EditSource` for changes under 50 lines to ensure syntax safety and atomicity.
- **Context Awareness**: Use `vsp source context` when analyzing large classes to save tokens and focus on structural understanding.
- **Graph Analysis**: Perform impact analysis via `AnalyzeCallGraph` before refactoring.
- **SQL Accuracy**: Adhere to ABAP SQL standards (e.g., use `DESCENDING` instead of `DESC`) when using `RunQuery`.

## Custom Commands (Claude Code Skills)

| Command | Claude Code CLI | Antigravity | Notes |
|---------|:--------------:|:-----------:|-------|
| `/celebrate` | ✅ | ✅ | Loaded from `.claude/commands/celebrate.md` |
| `/debug` | ✅ | ⚠️ Unverified | WebSocket-based; requires ZADT_VSP on SAP |



## Claude Code Skills (Antigravity Compatible)

> These skills are available via the Claude Code extension in Antigravity. Skills requiring CLI-only tools (worktrees, loop scheduling, status line) are excluded.

### Development Workflow
| Skill | Trigger | Description |
|-------|---------|-------------|
| `superpowers:brainstorming` | Before starting a creative task | Explore ideas and design approaches before implementation |
| `superpowers:writing-plans` | When spec/requirements are available | Write step-by-step implementation plans |
| `superpowers:executing-plans` | When executing a written plan | Sequential implementation based on a plan file |
| `superpowers:systematic-debugging` | When a bug or test failure occurs | Root cause analysis → hypothesis → verification loop |
| `superpowers:test-driven-development` | When implementing a feature or bug fix | Write tests first, then implement |
| `superpowers:verification-before-completion` | Before declaring a task complete | Checklist to verify actual behavior |
| `superpowers:subagent-driven-development` | When executing an implementation plan | Parallel implementation via subagents |
| `superpowers:dispatching-parallel-agents` | When 2+ independent tasks exist | Dispatch parallel agents for simultaneous processing |
| `superpowers:requesting-code-review` | After completing a major task | Prepare a code review request |
| `superpowers:receiving-code-review` | When receiving review feedback | Prioritize and incorporate feedback |

### Code Quality
| Skill | Trigger | Description |
|-------|---------|-------------|
| `simplify` | After code changes | Review and improve readability/efficiency |
| `code-review:code-review` | When a PR review is requested | Comprehensive review for bugs, security, and conventions |
| `security-review` | When making security-sensitive changes | OWASP-based vulnerability scan |
| `feature-dev:feature-dev` | When developing a new feature | Analyze codebase and provide implementation guide |

### Commit & PR
| Skill | Trigger | Description |
|-------|---------|-------------|
| `commit-commands:commit` | When committing changes | Generate conventional commit messages |
| `commit-commands:commit-push-pr` | When creating a PR | Commit + push + PR in one step |
| `commit-commands:clean_gone` | When cleaning up branches | Remove local branches tracking deleted remotes |


---

## Best Practices
- Always execute `SyntaxCheck` after any modification to verify quality.
- Focus operations primarily within `Z*` and `$TMP` packages.
- Parameter references and tool boundaries: see [MCP_USAGE.md](MCP_USAGE.md).

---
*Last Updated: 2026-05-04*
