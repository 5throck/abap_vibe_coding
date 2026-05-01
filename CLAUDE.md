# CLAUDE.md

**vsp** — Go-native MCP server and CLI for SAP ABAP Development Tools (ADT).

> **Doc intent:** CLAUDE.md = dev context. README.md = user onboarding. reports/ = research/history. **contexts/ = module analyst deep-knowledge files.** **memory/ = ABAP development history (archived by date).** **SKILL.md = Agent technical guidelines & custom skills.**

## SKILL.md Rules

### When to read
**You MUST read `SKILL.md` at the start of every session or before using any ABAP-related tools.** This file contains the primary technical guidelines, optimization settings, and custom skill definitions that take precedence over general knowledge.

### When to write
Whenever an ABAP program, class, interface, or other object is **created or significantly changed**, append an entry to the **current date's memory file in the `memory/` directory** (e.g., `memory/YYYY-MM-DD.md`).

Required entries:
- **Object name, type, package, and ADT URL**
- **Purpose summary** (what it does, what it queries, how it outputs)
- **Key technical decisions** (design choices, reasons, alternatives considered)
- **Issue history** (symptom → root cause → resolution)
- **MCP / config changes** (`.mcp.json`, `.vsp.json`, etc.)

### When to read
**Do NOT read the memory files on every task or session start.**
Only consult the relevant date's memory file in the `memory/` directory when a problem occurs — for example:
- A recurring or hard-to-diagnose error
- Uncertainty about a past design decision
- Investigating why something was implemented a certain way

### Format
All entries in the memory files must be written in English.

### Documentation Language Rule
**All `.md` files (including `SKILL.md`, `AGENTS.md`, `MEMORY.md`, etc.) must be written in English at all times.** This ensures global accessibility and consistency for all AI agents and human developers.

---

## Current Priorities

### 1. Graph Engine (`pkg/graph/`) — In Progress
Sequence: unify existing dep logic → SQL/ADT adapters → impact/path queries.
- Done: core types, parser dep extraction, boundary analyzer (11 tests)
- Pending: SQL adapters (CROSS/WBCROSSGT/D010INC), ADT adapters, unify `cli_deps.go` + `cli_extra.go` + `ctxcomp/analyzer.go`
- Design: [002](reports/2026-04-05-002-graph-engine-design.md), [003](reports/2026-04-05-003-graph-engine-alignment-for-claude.md)

### 2. GUI Debugger (Issue #2) — Strategic
Plan: MCP debug sessions → DAP → Web UI. ADT REST API mapped from `CL_TPDA_ADT_RES_APP`. Design: [001](reports/2026-04-05-001-gui-debugger-design.md)

### 3. Open Issues
- **#88** Lock handle bug (EditSource/WriteSource) — real user report
- **#55** RunReport in APC — architectural limit
- **#46, #45** Sync script — low effort

---

## Build & Test

```bash
go build -o vsp ./cmd/vsp              # Build
go test ./...                           # Unit tests
go test -tags=integration -v ./pkg/adt/ # Integration (needs SAP)
make build-all                          # 9 platforms
```

Key flags: `--mode focused|expert|hyperfocused`, `--read-only`, `--allowed-packages "Z*"`, `--disabled-groups 5THD`

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
| Add/update analyst context | `contexts/<module>-analyst.md` |
| New task handoff | copy `docs/task-template.md` → `scratch/task-YYYY-MM-DD-NNN.md` |

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

## ABAP Development

### System Info
- System: NPL, Client: 001
- Host: vhcalnplci:50000
- ABAP Version: 7.57

### Rules
- Package: `$TMP` (no transport required)
- Naming: `ZCL_` (class), `ZIF_` (interface), `ZPROG_` (program)
- Always run SyntaxCheck before WriteSource
- Run RunUnitTests after logic changes
- Use EditSource for small changes

### Workflow (Harness Advanced)

**Trigger**: Any request that creates/modifies an ABAP object or requires multi-package analysis.

1. **Triage (PM)** — Classify the request: ABAP dev / graph / debug / infra.
   Identify the package (`$TMP` or named) and affected object types.

2. **Agenda (PM + Agents)** — Call `SearchObject` or `GrepPackages` to gather context,
   then select agents from `AGENTS.md`. Load the matching `contexts/<module>-analyst.md` for domain depth.
   Produce an Implementation Plan before any write operation.

3. **Execution Design** — Define tool execution order and parallelism:
   ```
   [parallel] GrepPackages($TMP, "ZPROG_") + GetSource(CLAS, ZCL_TARGET)
   [serial]   SyntaxCheck → EditSource → RunUnitTests
   [serial]   memory log → git add → git commit
   ```

4. **Parallel Execution** — Independent read/search tasks run as subagents.
   Write operations (EditSource, WriteSource) remain serial per object to avoid lock conflicts.

5. **Sync & Report** — Before `git commit`:
   a. Append to `memory/YYYY-MM-DD.md` (object name, type, package, ADT URL, decisions, issues).
   b. Run `git add -A && git commit -m "<type>: <summary>"`.
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
