# CONTEXT.md

**vsp** — Go-native MCP server and CLI for SAP ABAP Development Tools (ADT).

> **Shared reference for all AI tools**: Claude Code CLI, Claude Code Desktop App, Gemini CLI, and Antigravity.
> Tool-specific overrides live in `CLAUDE.md` (Claude Code CLI + Desktop App), `GEMINI.md` (Gemini CLI).
> Claude Code Desktop App shares all config with CLI but PostToolUse hooks do not fire — run Post-Write chain manually.
> Agent roles and orchestration rules live in `AGENTS.md`.
> Per-session technical guidelines and custom skills live in `SKILL.md`.
> ABAP development history (date-archived) lives in `memory/`.
> Module analyst deep-knowledge files live in `docs/SAP ERP Module/`.

---

## Build & Test

```bash
go build -o vsp ./cmd/vsp              # Build
go test ./...                           # Unit tests
go test -tags=integration -v ./pkg/adt/ # Integration (needs SAP)
make build-all                          # 9 platforms
```

Key flags: `--mode hyperfocused|focused|expert` (Note: `hyperfocused` is the standard mode for all AI agents), `--read-only`, `--allowed-packages "Z*"`, `--disabled-groups 5THD`

---

## Codebase

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

| Task | Files |
|------|-------|
| Add MCP tool | `tools_register.go` + `handlers_*.go` + `tools_focused.go` |
| Add ADT operation | `pkg/adt/client.go`, `crud.go`, `devtools.go`, `codeintel.go` |
| Add graph feature | `pkg/graph/` |
| Add lint rule | `pkg/abaplint/rules.go` |
| Add integration test | `pkg/adt/integration_test.go` |
| Fix MCP/docs/config | `README.md`, `docs/cli-agents/*`, `handlers_universal.go` |
| Add/update analyst context | `docs/SAP ERP Module/<module>-analyst.md` |
| New task handoff | copy `docs/task-template.md` → `scratch/task-YYYY-MM-DD-NNN.md` |
| Add/update subagent prompt | `docs/subagents/<role>.md` |

---

## Adding a New MCP Tool

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

## Common Issues

1. **CSRF errors** — auto-refreshed in `http.go`
2. **Lock conflicts** — edit handler does auto lock/unlock
3. **Session issues** — some CRUD/debugger flows are session-sensitive; verify stateful/stateless before changing transport or auth logic
4. **Auth** — use basic OR cookies, not both
5. **ZADT_VSP** — WebSocket debug/RFC/RunReport require it installed on SAP

> Security and sanitization rules are in [SECURITY.md](SECURITY.md).

---

## ABAP Development

### System Info
- System: NPL, Client: 001
- Host: vhcalnplci:50000
- ABAP Version: 7.52 (Verified via `vsp system info`)

### Rules
- Package: `$TMP` (no transport required)
- Naming: `ZCL_` (class), `ZIF_` (interface), `ZPROG_` (program)
- Always run SyntaxCheck before WriteSource
- Run RunUnitTests after logic changes (refer to `docs/testing-guidelines.md`)
- Run RunATCCheck after RunUnitTests — Priority 1 findings block deployment
- Full sequence: see `SKILL.md § Post-Write Mandatory Chain`
- Use EditSource for small changes
- **Local Isolation**: All local `.abap` files must be created ONLY in the `scratch/` directory.

### Workflow (Harness Advanced)

**Trigger**: Any request that creates/modifies an ABAP object or requires multi-package analysis.

1. **Triage (PM)** — Classify the request: ABAP dev / graph / debug / infra.
   Identify the package (`$TMP` or named) and affected object types.

2. **Agenda (PM + Agents)** — Dispatch Phase 1 parallel subagents (sap-investigator +
   read-only-analyst + schema-inspector) in a **single message**. Load `docs/SAP ERP Module/<module>-analyst.md`
   in the analyst subagent prompt. Use `sap:bapi-explorer` to identify necessary standard APIs.
   See `AGENTS.md § PM Subagent Dispatch Protocol` for decision tree.
   Produce an Implementation Plan before any write operation.

3. **Execution Design** — Define tool execution order and parallelism:
   Use `sap:unit-architect` to design tests alongside implementation.
   ```powershell
   # 1. Initialize task (creates scratch/task-YYYY-MM-DD-NNN.md)
   ./scripts/vsp-task.sh "Task Name"  # MacOS/Linux/Git Bash
   .\scripts\vsp-task.ps1 -Name "Task Name" # Windows PS
   
   # 2. Parallel read (investigator + analyst + schema)
   # 3. Serial write (SyntaxCheck → EditSource → RunUnitTests → RunATCCheck)
   
   # 4. Sync & Report (updates memory/, index, and git commit)
   ./scripts/vsp-sync.sh "feat: task summary"
   .\scripts\vsp-sync.ps1 -Message "feat: task summary"
   ```

4. **Parallel Execution** — Independent read/search tasks run as subagents.
   Write operations (EditSource, WriteSource) remain serial per object to avoid lock conflicts.

5. **Sync & Report** — Finalize the task and commit:
   a. Append to `memory/YYYY-MM-DD.md` (object name, type, package, ADT URL, decisions, issues).
   b. **Crucial Step**: Use `vsp-sync` scripts to automate index update and git commit. (Auto-commits are disabled, so PM MUST do this at the end of the task).
   c. Report outcome to user with object URL and test results.

---

## Conventions

Reports: `reports/YYYY-MM-DD-NNN-title.md`. SAP objects: `ZADT_<nn>_<name>`, `ZCL_ADT_<name>`, packages `$ZADT*`.

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
| `docs/cli-agents/*` | Config drift | Codex TOML format may differ from Claude/Gemini JSON docs |

---
*Last Updated: 2026-05-05*
