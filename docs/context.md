# context.md

**vsp** — Go-native MCP server and CLI for SAP ABAP Development Tools (ADT).

> **Shared reference for all AI tools**: Claude Code CLI, Claude Code Desktop App, Codex, Gemini CLI, and Antigravity.
> Tool-specific overrides live in `../CLAUDE.md` (Claude Code CLI + Desktop App), `../.codex/config.toml` and `../.codex/hooks.json` (Codex), `../GEMINI.md` (Gemini CLI).
> Claude Code Desktop App shares all config with CLI but PostToolUse hooks do not fire — run Post-Write chain manually.
> Agent roles and orchestration rules live in `../AGENTS.md`.
> Per-session technical guidelines and custom skills live in `docs/skill.md` (legacy entry point; current skills are auto-discovered from the `skills/` directory).
> ABAP development history (date-archived) lives in `../memory/`.
> Module analyst deep-knowledge files live in `../agents/` (relative to repo root).

---

## Upstream VSP Reference Build & Test

> **Note**: The following build and test commands apply to the upstream **vsp** Go engine repository, not this configuration/harness repository.

```bash
go build -o vsp ./cmd/vsp              # Build
go test ./...                           # Unit tests
go test -tags=integration -v ./pkg/adt/ # Integration (needs SAP)
make build-all                          # 9 platforms
```

Key flags: `--mode hyperfocused|focused|expert` (Note: `hyperfocused` is the standard mode for all AI agents), `--read-only`, `--allowed-packages "Z*"`, `--disabled-groups 5THD`

---

## Upstream VSP Codebase Structure

> **Note**: This outlines the directory layout of the upstream **vsp** engine source repository for reference when contributing to handlers or MCP protocols.

```
cmd/vsp/              CLI entry + 28 commands
internal/mcp/
  handlers_*.go       Domain handlers (read, edit, debug, graph, ...)
  tools_register.go   Registration + mode logic
  tools_focused.go    Focused mode whitelist
  handlers_universal.go  Hyperfocused single-tool (SAP)
pkg/
  adt/                ADT client (HTTP, CSRF, sessions, all SAP ops)
  graph/              Dependency graph engine (in progress)
  ctxcomp/            Context compression (dep resolution for read)
  abaplint/           ABAP lexer + parser (91 statements, 8 lint rules)
  dsl/                Fluent API, YAML workflows, batch ops
  cache/              In-memory + SQLite
  scripting/          Lua engine
  llvm2abap/          LLVM→ABAP (research)
  wasmcomp/           WASM→ABAP (research)
```

### Upstream VSP Modification Map

| Task | Upstream Go Source Files |
|------|-------------------------|
| Add MCP tool | `tools_register.go` + `handlers_*.go` + `tools_focused.go` |
| Add ADT operation | `pkg/adt/client.go`, `crud.go`, `devtools.go`, `codeintel.go` |
| Add graph feature | `pkg/graph/` |
| Add lint rule | `pkg/abaplint/rules.go` |
| Add integration test | `pkg/adt/integration_test.go` |
| Fix MCP router / shell | `handlers_universal.go` |

### Harness Configuration & Documentation Map

| Task | Local Harness Configuration / Markdown Files |
|------|---------------------------------------------|
| Fix MCP/docs/config | `../README.md`, `../agents/*` |
| Add/update analyst context | `../agents/<module>-analyst.md` |
| New task handoff | copy `task-template.md` → `../scratch/tasks/task-YYYY-MM-DD-NNN.md` |
| Add/update subagent prompt | `../agents/<role>.md` |

---

## Adding a New MCP Tool in Upstream VSP

> [!NOTE]
> This section is only relevant when contributing to the upstream vsp engine source repository.

1. Handler in `handlers_*.go`:
```go
func (s *Server) handleX(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
    name, _ := req.GetArguments()["name"].(string)
    result, err := s.adtClient.Method(ctx, name)
    if err != nil { return newToolResultError(err.Error()), nil }
    return mcp.NewToolResultText(format(result)), nil
}
```
2. Register in `tools_register.go` with `shouldRegister("X")`
3. Route in `handlers_analysis.go` (or appropriate router)
4. Add to `tools_focused.go` if needed in focused mode

---

## Upstream VSP / SAP Runtime Common Issues

1. **CSRF errors** — auto-refreshed in `http.go`
2. **Lock conflicts** — edit handler does auto lock/unlock
3. **Session issues** — some CRUD/debugger flows are session-sensitive; verify stateful/stateless before changing transport or auth logic
4. **Auth** — use basic OR cookies, not both
5. **ZADT_VSP** — WebSocket debug/RFC/RunReport require it installed on SAP

> Security and sanitization rules are in [security.md](security.md).

---

## ABAP Development

### System Defaults
- System: NPL, Client: 001
- Host: vhcalnplci:50000
- ABAP Version: 7.52 (Verified via `vsp system info`)
- Package: `$TMP` (no transport required)

### ABAP Development Rules
- **Naming**: `ZCL_` (class), `ZIF_` (interface), `ZPROG_` (program).
- **Isolation**: All local `.abap` files must be created ONLY in the `scratch/` directory.
- **Write Operations**: Use `EditSource` for small changes. Always run `SyntaxCheck` before `WriteSource`.
- **QA Chain**: After any logic change or edit, the `Post-Write Mandatory Chain` MUST be executed (`SyntaxCheck` → `RunUnitTests` → `RunATCCheck`). Priority 1 findings block deployment. See [skills/post-write-chain/SKILL.md § Post-Write Mandatory Chain](../skills/post-write-chain/SKILL.md) for details.
- **Final Audit**: Before any sync/commit, run the `sap:documentation-audit` skill.

### Developer Quick Start (Task Lifecycle)

For full project governance and role-based orchestration, refer to [AGENTS.md § Collaborative Workflow](../AGENTS.md#agent-coordination-workflow-harness-advanced).

```powershell
# 1. Initialize Task
..\scripts\vsp-task.ps1 -Name "Task Description"

# 2. Execution (Research -> Implementation -> Verification)
# Use specialized skills from skills/abap-dev/SKILL.md

# 3. Synchronize & Commit
..\scripts\vsp-sync.ps1 -Message "feat: implementation summary"
```

---

## Conventions

Reports: `reports/YYYY-MM-DD-NNN-title.md`. SAP objects: `ZADT_<nn>_<name>`, `ZCL_ADT_<name>`, packages `$ZADT*`.

---

## Project-Wide Rules (All Tools)

> These rules apply equally to Claude Code, Gemini CLI, Codex, Antigravity, and any other AI tool operating in this project. Tool-specific overrides live in `CLAUDE.md`, `GEMINI.md`, and `.codex/`.

### Memory Logging

Whenever an ABAP program, class, interface, or other object is **created or significantly changed**, append an entry to `memory/YYYY-MM-DD.md`.

Required fields per entry:
- **Object name, type, package, and ADT URL**
- **Purpose summary** (what it does, what it queries, how it outputs)
- **Key technical decisions** (design choices, reasons, alternatives considered)
- **Issue history** (symptom → root cause → resolution)
- **MCP / config changes** (`.mcp.json`, `.gemini/settings.json`, etc.)

**When to read**: Only when a recurring error occurs or when uncertain about a past design decision. Do **not** read memory files on every session start. All entries must be written in **English**.

### Documentation Language

All `.md` files must be written in **English**. **Exception**: files whose name contains `_ko` (e.g., `README_ko.md`) must be written entirely in Korean.

**Git artifacts** (commit messages, PR titles, PR body, branch names, code review comments) must also be written in **English** at all times, regardless of the language used in conversation with the user.

### Documentation Synchronization

`docs/context.md` is the **single source of truth** for shared engineering content.

| Change type | Action |
|-------------|--------|
| Shared content (build, codebase, rules, issues) | Update `docs/context.md` only |
| Tool-specific config or skill | Update `CLAUDE.md`, `GEMINI.md`, or `.codex/` only |
| Agent roles or workflow | Update `AGENTS.md`; reflect summary in `docs/context.md` |

Do **not** copy shared sections from `docs/context.md` into tool-specific files.

### Git Reflection

All development artifacts (ABAP sources, docs, research reports) and memory logs must be committed to the local Git repository. The PM agent verifies repository status and memory file existence at the end of each major task.

### Tooling Matrix

For a full comparison of tool capabilities (Claude Code CLI vs Desktop App vs Antigravity vs Gemini CLI) and hook behavior by environment, see [docs/tooling-matrix.md](tooling-matrix.md).

---

## Areas Requiring Care

| Area | Risk | Notes |
|------|------|-------|
| `pkg/graph/` | New, incomplete | Only parser adapter; SQL/ADT adapters pending |
| `handlers_debugger.go` | WebSocket-only | REST breakpoints 403 on newer SAP; use ZADT_VSP |
| `handlers_amdp.go` | Experimental | Session works, breakpoints unreliable |
| `pkg/adt/ui5.go` | Read-only | Write needs `/UI5/CL_REPOSITORY_LOAD` |
| `pkg/llvm2abap/`, `pkg/wasmcomp/` | Research | Not production; don't treat as stable |
| `pkg/adt/debugger.go` (REST) | Deprecated | Prefer `websocket_debug.go` |
| `../agents/*` | Config drift | Codex TOML format may differ from Claude/Gemini JSON docs |
| `.codex/config.toml` | Tool parity | Keep MCP servers, hook enablement, and `skills/abap-dev/SKILL.md` skill loading aligned with Claude/Gemini settings |

---
*Last Updated: 2026-05-19*
