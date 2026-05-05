# ABAP Development Skills (vsp)

This file defines the ABAP development capabilities and optimized workflow patterns for Claude Code and AI agents.

## Core Capabilities
- **Surgical Edits**: Use `EditSource` for changes under 50 lines to ensure syntax safety and atomicity.
- **Context Awareness**: Use `vsp source context` when analyzing large classes to save tokens and focus on structural understanding.
- **Graph Analysis**: Perform impact analysis via `AnalyzeCallGraph` before refactoring.
- **SQL Accuracy**: Adhere to ABAP SQL standards (e.g., use `DESCENDING` instead of `DESC`) when using `RunQuery`.

## Custom Commands (Claude Code Skills)

| Command | Claude Code CLI | Claude Code App | Antigravity | Notes |
|---------|:--------------:|:--------------:|:-----------:|-------|
| `/celebrate` | ✅ | ✅ | ✅ | Loaded from `../.claude/commands/celebrate.md` |
| `/debug` | ✅ | ✅ | ⚠️ Unverified | WebSocket-based; requires ZADT_VSP on SAP |



## Claude Code Skills (CLI, Desktop App, and Antigravity Compatible)

> These skills are available in Claude Code CLI, Claude Code Desktop App, and via the Claude Code extension in Antigravity. Skills requiring CLI-only tools (worktrees, loop scheduling, status line) may not be available in all environments.

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
| `harness:memory-intelligence` | Before starting a new task | Use local search tools on the `memory/` directory to retrieve historical design decisions and past bug fixes |

### Specialized SAP Skills
| Skill | Trigger | Description |
|-------|---------|-------------|
| `sap:bapi-explorer` | When searching for integration APIs | Discover and analyze standard BAPIs using SearchObject/GetTable |
| `sap:transport-manager` | When working on dev/production systems | Create and manage Transport Requests for object deployment |
| `sap:unit-architect` | When writing quality code | Design and implement ABAP Unit tests following docs/testing-guidelines.md |
| `sap:performance-analyzer` | When optimizing code | Use runtime analysis and SQL execution plans to identify bottlenecks |
| `sap:impact-architecture` | When modifying core BAPIs/CDS | Professional analysis of `AnalyzeCallGraph` results to identify cascading risks and side effects |

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
- **File Isolation**: Always create `.abap` files within the `scratch/` directory to maintain a clean root.
- Parameter references and tool boundaries: see [mcp_usage.md](mcp_usage.md).

---

## Post-Write Mandatory Chain

> Applies to all tools: **Claude Code CLI, Antigravity, Gemini CLI**

After ANY `WriteSource` / `EditSource` / `Activate`, the executing agent MUST run these three steps in order:

| Step | Tool | Pass Condition |
|------|------|---------------|
| 1 | `SyntaxCheck` | 0 errors |
| 2 | `RunUnitTests` | 0 failures |
| 3 | `RunATCCheck` | 0 Priority-1 findings |

**ATC Priority levels**:
- Priority 1 (Error) → **BLOCKS** deployment — fix before `Activate`
- Priority 2 (Warning) → PM review required before proceeding
- Priority 3 (Info) → Log to task-template.md § 4.2 only

**In Gemini / Antigravity sessions**: route all three steps through `sap_execute`
with `"action": "SyntaxCheck"`, `"action": "RunUnitTests"`, `"action": "RunATCCheck"`.

> ⚠️ **Claude Code Desktop App**: `PostToolUse` hooks do **not** fire automatically.
> Run all three steps of this chain manually after each write in Desktop sessions.

---
*Last Updated: 2026-05-05*
