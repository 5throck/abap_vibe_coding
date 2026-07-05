# abap_vibe_coding — co-abap Configuration

> Extends docs/context.md. This file IS the customization layer for this project.
> context.md is IMMUTABLE — all project-specific changes belong here.
>
> Read order for all AI tools:
>   1. docs/context.md            — immutable project identity (architecture, standards)
>   2. docs/co-abap.context.md    — THIS FILE — tech stack, agents, skills, workflow
>
> Tool-specific overrides live in `../CLAUDE.md` (Claude Code CLI + Desktop App), `../.codex/config.toml` and `../.codex/hooks.json` (Codex), `../GEMINI.md` (Gemini CLI).
> Claude Code Desktop App shares all config with CLI but PostToolUse hooks do not fire — run Post-Write chain manually.
> Agent roles and orchestration rules live in `../AGENTS.md`.
> Per-session technical guidelines and custom skills live in `docs/skill.md` (legacy entry point; current skills are auto-discovered from the `skills/` directory).
> ABAP development history (date-archived) lives in `../memory/`.
> Module analyst deep-knowledge files live in `../agents/` (relative to repo root).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| MCP Server | `vsp` Go binary v2.38.1 — connects to SAP via ADT (ABAP Development Tools REST API) |
| AI Orchestration | Claude Code CLI / Desktop App, Gemini CLI, Antigravity (VS Code extension) |
| SAP Connection | HTTP/HTTPS to SAP NetWeaver AS ABAP; configured via `.env` (`SAP_*` prefix) |
| Scripting | Bash (`.sh`) + PowerShell (`.ps1`) pairs for all automation |
| Documentation | Markdown — `docs/`, `agents/`, `skills/`, `memory/` |

---

## Environment Setup

```bash
# 1. Place the vsp binary in the project root
#    Download from: https://github.com/5throck/vsp/releases
cp /path/to/vsp ./vsp
chmod +x ./vsp          # macOS/Linux
# Windows: copy vsp.exe to project root

# 2. Configure SAP credentials
cp .env.sample .env
# Edit .env — fill in SAP_URL, SAP_USER, SAP_PASSWORD

# 3. Activate git hooks
git config core.hooksPath .githooks

# 4. Verify connection
./vsp health
```

Required env keys (see `.env.sample`):
- `SAP_URL` — SAP system base URL (e.g. `https://my-sap-host:44300`)
- `SAP_USER` — SAP username
- `SAP_PASSWORD` — SAP password
- `SAP_MODE` — MCP mode (default: `hyperfocused`)

---

## Agents

> **Agent roles and orchestration rules**: See [`AGENTS.md`](../AGENTS.md) for the complete agent registry, behavioral rules, and workflow coordination.
> **Skills**: Auto-discovered from `skills/` directory. Each skill is `skills/<name>/SKILL.md`.

### Business Group (Project Governance & Analysis)
| Agent | File | Role | Status |
|-------|------|------|--------|
| PM (Orchestrator) | `agents/pm.md` | 6-step harness lifecycle — Triage → Business Analysis → Governance → Tech Design → Implementation → Finalization | active |
| SD Analyst | `agents/sd-analyst.md` | Sales & Distribution module analysis | active |
| MM Analyst | `agents/mm-analyst.md` | Materials Management module analysis | active |
| FI Analyst | `agents/fi-analyst.md` | Financial Accounting module analysis | active |
| CO Analyst | `agents/co-analyst.md` | Controlling module analysis | active |
| PP Analyst | `agents/pp-analyst.md` | Production Planning module analysis | active |
| LE Analyst | `agents/le-analyst.md` | Logistics Execution module analysis | active |

### Technical Group (System Execution & Implementation)
| Agent | File | Role | Status |
|-------|------|------|--------|
| Architect | `agents/architect.md` | Technical Execution Lead — pattern selection, execution sequencing | active |
| ABAP Developer | `agents/code-writer.md` | ABAP implementation via WriteSource/EditSource | active |
| QA Engineer | `agents/test-runner.md` | SyntaxCheck → RunUnitTests → RunATCCheck | active |
| DBA | `agents/dba.md` | Table/CDS/index design, SQL performance tuning | active |
| DevOps/Admin | `agents/devops-admin.md` | Transport management, infrastructure install | active |
| Interface Expert | `agents/interface-expert.md` | OData/RFC/IDoc interface design | active |
| Fiori Developer | `agents/fiori-developer.md` | UI5/Fiori screen design and implementation | active |
| Form Expert | `agents/form-expert.md` | SAP Script, Smart Forms, Adobe Forms design | active |
| Security Monitor | `agents/security-monitor.md` | Security policies and safe dependencies | active |
| GUI Scripter | `agents/gui-scripter.md` | BDC / VBS automation (last resort) | active |
| Intelligence Investigator | `agents/sap-investigator.md` | Codebase pattern scan, historical design extraction | active |

> Lifecycle management: `bun scripts/agent-lifecycle-audit.ts`
> After any agent change, update AGENTS.md and this table.

---

## Skills

<!-- Add/remove rows as skills are introduced or retired via lifecycle management. -->
<!-- Status: active | deprecated | experimental -->

| Skill | Directory | Purpose | Status |
|-------|-----------|---------|--------|
| ABAP Development | `skills/abap-dev/` | Core SAP ABAP development workflow | active |
| Post-Write Chain | `skills/post-write-chain/` | Mandatory QA chain after WriteSource/EditSource | active |
| SAP Tools | `skills/sap-tools/` | SAP utility skills | active |
| Meeting Facilitation | `skills/meeting-facilitation/` | Meeting notes and action items | active |

> Lifecycle management: `bun scripts/skill-lifecycle-audit.ts`

---

## Scripts

| Script | Purpose | Status |
|--------|---------|--------|
| `dev-sync.sh` / `dev-sync.ps1` | Full sync pipeline (memlog → audit → commit → PR) | active |
| `audit.sh` / `audit.ps1` | Documentation integrity audit | active |
| `vsp-sync.sh` / `vsp-sync.ps1` | VSP-specific sync | active |
| `dispatch.ts` | Main CLI dispatcher with parallel/serial modes | active |
| `dispatch-parallel.ts` | Parallel agent dispatcher for read-only tasks | active |
| `dispatch-serial.ts` | Serial pipeline executor for write operations | active |
| `retry-handler.ts` | Error recovery with 3-retry limit and exponential backoff | active |
| `verify-skills.ts` | Skill auto-discovery and index generation | active |

> **Hybrid Scripting Note**: Complex multi-agent orchestration (dispatch, retry-handler, verify-skills) uses TypeScript (.ts) via Bun. Everyday development utilities use native shell scripts (.sh + .ps1 pairs).

---

## Development Workflow

```bash
# 1. Start a task
/triage <request>          # PM classifies — creates task file — parallel research

# 2. After implementation
/post-write                # SyntaxCheck → RunUnitTests → RunATCCheck
/transport                 # Create/release CTS transport

# 3. Sync to Git
/sync "feat: description"  # memlog → changelog → audit → commit → PR

# Manual equivalents (bash)
bash scripts/dev-sync.sh "feat: description"
```

> **Requirements-Driven Deliverables Workflow (Stage 1 to 5)**:
> All requirements are organized inside `/deliverables/REQ-NNN-[slug]/` using numbered prefixes:
> - `01_srs.md` (Stage 1: Requirements Definition — Owner: Module Analyst / PM)
> - `02_technical_design.md` (Stage 2: Technical Design — Owner: Architect & DBA)
> - `03_implementation_report.md` (Stage 3: Implementation Summary — Owner: Specialist Developers)
> - `04_qa_report.md` (Stage 4: QA & Verification — Owner: QA Engineer)
> - Release & sync (Stage 5 — Owner: PM & DevOps/Admin)

---

## Deployed vsp Binary

| Item | Value |
|------|-------|
| Binary | `vsp.exe` (project root) |
| Version | `2.38.1` (commit: a75fbfd9, built: 2026-04-07) |
| Last Modified | 2026-05-01 |
| Mode | `hyperfocused` (see `.mcp.json`) |

> To upgrade: replace `vsp.exe` with the new binary and update this table.

---

## MCP Configuration

MCP servers are configured in `.mcp.json` (Single Source of Truth).

> **Policy**: `.mcp.json` is tracked in git as a shared configuration template. It must NEVER contain credentials. All secrets must be stored in `.env` (gitignored). This is enforced by the pre-commit hook.

See `.mcp.json` for the complete server list.

> **Note**: This project uses the standard `SAP_*` prefix format for connection and feature flags (e.g. `SAP_MODE`, `SAP_ALLOWED_PACKAGES`), ensuring 100% compatibility with the upstream `vsp` engine.

---

## ABAP Development

### System Defaults
- System: NPL, Client: 001
- Host: vhcalnplci:50000
- ABAP Version: 7.52 (Verified via `vsp system info`)
- Package: `$TMP` (no transport required)

### Directory Reference

| Directory | Purpose | Git-tracked? |
|-----------|---------|:---:|
| `agents/` | Agent role definitions (`.md` files) for all AI tools | Yes |
| `skills/` | Skill definitions (`SKILL.md`) loaded per-session | Yes |
| `docs/` | Shared engineering documentation | Yes |
| `memory/` | Date-stamped development logs (`YYYY-MM-DD.md`) | Yes |
| `scratch/tasks/` | Active task handoff files (created by `/new-task`) | Yes |
| `scratch/stable/` | Exported ABAP sources kept for reference (read-only snapshots) | Yes |
| `scratch/temp/` | Throwaway work files — not committed | No |
| `.agents/` | Claude Code plugin runtime cache (auto-generated by Desktop App) | No |
| `.claude/worktrees/` | Parallel session worktrees (auto-managed by Desktop App) | No |

### ABAP Development Rules
- **Naming**: `ZCL_` (class), `ZIF_` (interface), `ZPROG_` (program).
- **Isolation**: All local `.abap` files must be created ONLY in the `scratch/` directory.
- **Write Operations**: Use `EditSource` for small changes. Always run `SyntaxCheck` before `WriteSource`.
- **QA Chain**: After any logic change or edit, the `Post-Write Mandatory Chain` MUST be executed (`SyntaxCheck` → `RunUnitTests` → `RunATCCheck`). Priority 1 findings block deployment. See [skills/post-write-chain/SKILL.md — Post-Write Mandatory Chain](../skills/post-write-chain/SKILL.md) for details. **Note**: If your environment (e.g., Gemini CLI, Claude Desktop App) does not support automatic PostToolUse hooks, you MUST execute this chain manually.
- **Final Audit**: Before any sync/commit, run the `sap:documentation-audit` skill.

### ABAP SQL Reference (All Agents)

> All agents that run `RunQuery` MUST follow these rules.

```sql
-- Correct ordering
ORDER BY field DESCENDING        -- NOT: ORDER BY field DESC

-- Row limiting (use max_rows parameter, not SQL LIMIT)
RunQuery(sql=..., max_rows=50)   -- NOT: LIMIT 50 in SQL string

-- Date format
WHERE erdat >= '20260501'        -- YYYYMMDD string, no separators

-- Table aliasing in JOINs
FROM vbak AS a JOIN vbap AS b ON a~vbeln = b~vbeln

-- Field references with tilde
b~matnr    -- NOT: b.matnr

-- Anti-patterns to avoid
SELECT *                         -- always list explicit fields
MANDT = '001'                    -- never hardcode client
```

### Developer Quick Start (Task Lifecycle)

For full project governance and role-based orchestration, refer to [AGENTS.md — Collaborative Workflow](../AGENTS.md#agent-coordination-workflow-harness-advanced).

```powershell
# 1. Initialize Task
..\scripts\vsp-task.ps1 -Name "Task Description"

# 2. Execution (Research -> Implementation -> Verification)
# Use specialized skills from skills/abap-dev/SKILL.md

# 3. Synchronize & Commit
..\scripts\vsp-sync.ps1 -Message "feat: implementation summary"
```

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

> **Note on hyperfocused mode**: Despite the name, `hyperfocused` mode registers all 101 individual MCP tools (GetSource, GetODataMetadata, RunQuery, etc.) — not a single unified tool. The mode restricts which SAP **packages** and **features** are accessible, not which MCP tools are registered. Agent files may reference all their tools normally when `SAP_MODE=hyperfocused`.

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
  llvm2abap/          LLVM->ABAP (research)
  wasmcomp/           WASM->ABAP (research)
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

## Project-Specific Rules

> These rules apply equally to Claude Code, Gemini CLI, Codex, Antigravity, and any other AI tool operating in this project. Tool-specific overrides live in `CLAUDE.md`, `GEMINI.md`, and `.codex/`.

### Memory Logging (ABAP)

Whenever an ABAP program, class, interface, or other object is **created or significantly changed**, append an entry to `memory/YYYY-MM-DD.md`.

Required fields per entry:
- **Object name, type, package, and ADT URL**
- **Purpose summary** (what it does, what it queries, how it outputs)
- **Key technical decisions** (design choices, reasons, alternatives considered)
- **Issue history** (symptom → root cause → resolution)
- **MCP / config changes** (`.mcp.json`, `.gemini/settings.json`, etc.)

**When to read**: Only when a recurring error occurs or when uncertain about a past design decision. Do **not** read memory files on every session start. All entries must be written in **English**.

**Scope boundary** — `memory/` and `CHANGELOG.md` serve different purposes and must not be conflated:

| Change type | Record in |
|-------------|-----------|
| ABAP object created or significantly modified | `memory/YYYY-MM-DD.md` |
| Harness infrastructure changed (agents, skills, scripts, docs, config) | `CHANGELOG.md` — `[Unreleased]` section |

### Documentation Language

All `.md` files must be written in **English**. **Exception**: files whose name contains `_ko` (e.g., `README_ko.md`) must be written entirely in Korean.

### Documentation Synchronization

`docs/context.md` is the **single source of truth** for shared engineering content.

| Change type | Action |
|-------------|--------|
| Shared content (build, codebase, rules, issues) | Update `docs/context.md` only |
| Tool-specific config or skill | Update `CLAUDE.md`, `GEMINI.md`, or `.codex/` only |
| Agent roles or workflow | Update `AGENTS.md`; reflect summary in `docs/context.md` |
| ABAP-specific configuration | Update `docs/co-abap.context.md` only |

Do **not** copy shared sections from `docs/context.md` into tool-specific files.

### Initial Context Files
<!-- Files listed here MUST be loaded at the start of EVERY session by ALL AI tools. -->
<!-- The exact loading mechanism (e.g., '@' syntax or 'Read' commands) is tool-specific and defined in CLAUDE.md / GEMINI.md. -->
- `docs/context.md` - Full architecture map, standards
- `docs/co-abap.context.md` - ABAP-specific tech stack, agents, skills, workflow
- `AGENTS.md` - Canonical agent roster
- `memory/MEMORY.md` - Recent session history (if exists)
- `skills/abap-dev/SKILL.md` - Always load for SAP ABAP development tasks
- `skills/post-write-chain/SKILL.md` - Always load; mandatory QA chain after any WriteSource/EditSource

### Git Commit Policy & Reflection

All development artifacts (ABAP sources, docs, research reports) and memory logs must be committed to the local Git repository. The PM agent verifies repository status and memory file existence at the end of each major task.

**Manual Commit Rule**: Because auto-commits and hooks are disabled or unsupported in many AI CLI sessions (like Gemini or Claude Desktop), you must run `git add -A && git commit` manually or use the project synchronization script (`.\scripts\dev-sync.ps1`) at the end of each task.

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

## Task Handoffs

`scratch/tasks/task-YYYY-MM-DD-NNN.md`. Memory Logs: `memory/YYYY-MM-DD.md`. SAP objects: `ZADT_<nn>_<name>`, `ZCL_ADT_<name>`, packages `$ZADT*`.

---

## Coding Guidelines (ABAP Supplement)

> These rules extend the base Coding Guidelines in context.md with ABAP-specific rules.
> Full rationale: [CONSTITUTION.md §8](../docs/constitution/08-coding-guidelines.md)

### 1. Think Before Coding
- State assumptions explicitly before implementing. If uncertain, ask — don't guess silently.
- **Secrets**: Never hardcode passwords, API tokens, or keys. Always use env vars / `.env.sample`.

### 2. Simplicity First
- Write the minimum code that solves the problem. Nothing speculative.

### 3. Surgical Changes
- Touch only what is necessary. Don't "improve" adjacent code.

### 4. Goal-Driven Execution
- Convert every task into a verifiable goal before starting.

### 5. Response Language
- All **conversational** replies — **Korean** by default.
- All code, config, commit messages, PR titles, branch names, **CHANGELOG.md**, and **memory/` logs — **English only**.

---

## Auto-Updating & Context Maintenance

- **Trigger**: Agents MUST automatically append a summary to the `memory/MEMORY.md` or update architecture sections in `docs/co-abap.context.md` whenever a significant architectural decision or multi-file feature is completed.
- **Archiving**: If `docs/co-abap.context.md` or logs become too unwieldy, older decisions should be archived to `docs/history.md`.

## Dynamic Roster & Skills Note
**Note:** The agent and skills lists in this project may be dynamically expanded by the PM orchestrator during the Kickoff Phase based on emerging requirements.

## Tracking Management: CHANGELOG vs. Memory
- **`CHANGELOG.md`**: For end-users and release notes. Record *what* changed (features, fixes) using structured categories. **(Must be written in English)**
- **`memory/` logs**: For developers and AI agents. Record *how* and *why* changes were made, including architectural decisions and debugging context. **(Must be written in English)**

## File Encoding Rule (Markdown & Scripts)
- All text files, including Markdown (.md) and scripts (.ps1, .sh, .py, .js, etc.), must be saved as **UTF-8 (without BOM)**.
- Script outputs (Add-Content, Set-Content) must explicitly specify -Encoding UTF8.

## Hybrid Scripting & Cross-Platform Rule
- **Hybrid Approach**: The project uses a hybrid scripting model. Complex multi-agent orchestration (e.g., `dispatch.ts`, `retry-handler.ts`, `verify-skills.ts`) is implemented in **Bun (.ts)**. Everyday development utilities (e.g., `dev-sync`, `audit`) use native shell scripts.
- **Utility Script Pairing**: All utility shell scripts must be cross-platform compatible. Any creation, modification, or deletion of a PowerShell utility script (`.ps1`) MUST be accompanied by the exact same operation on its corresponding Bash script counterpart (`.sh`), and vice versa. They must always be kept in sync as a pair (e.g., `dev-sync.ps1` and `dev-sync.sh`).

---
*co-abap.context.md version: 1.0 — migrated from legacy context.md on 2026-07-05*
