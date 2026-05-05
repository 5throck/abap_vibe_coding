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

---

## SAP Skill Implementation Guide

### sap:bapi-explorer

**Purpose**: Discover, evaluate, and document standard SAP BAPIs for integration use cases.

**Workflow**:
1. Use `SearchObject` with `type=FUNC` and a keyword pattern (e.g. `BAPI_SALESORDER_*`) to locate candidate function modules.
2. For each candidate, call `GetSource` to read the function module signature (importing/exporting/tables parameters).
3. Use `GetFunctionGroup` to understand the group the BAPI belongs to and related functions.
4. Call `RunQuery` on `BAPISTRUCT` or relevant parameter tables to understand data structures.
5. Document findings: BAPI name, parameters, return code structure (BAPIRET2), known limitations.

**Output format**:
```
BAPI: <name>
Function Group: <group>
Purpose: <one-line>
Key Parameters:
  IN:  <param> (<type>) — <description>
  OUT: <param> (<type>) — <description>
Return: BAPIRET2 (check TYPE = 'E' for errors, TYPE = 'S' for success)
Usage pattern: CALL FUNCTION '<BAPI>' ... COMMIT WORK.
Limitations: <known issues or missing fields>
```

---

### sap:transport-manager

**Purpose**: Create, populate, and release SAP Transport Requests (CTS) for object deployment.

**Workflow**:
1. **Check existing transports**: Call `ListTransports` to see open requests. Reuse an existing request if the task is part of an ongoing change.
2. **Create a new request** (if needed): Call `CreateTransport` with a clear description (`feat: <summary>`).
3. **Add objects**: After each `WriteSource`/`EditSource`/`Activate`, call `AddToTransport` with the object URL and transport number.
4. **Pre-release gate**: Before `ReleaseTransport`, verify:
   - `SyntaxCheck` → 0 errors on all objects
   - `RunUnitTests` → 0 failures
   - `RunATCCheck` → 0 Priority-1 findings
5. **Release**: Call `ReleaseTransport`. Log the transport number in `memory/YYYY-MM-DD.md`.

**Slash command**: Use `/transport` for all steps above.

**Golden rule**: Never release a transport with Priority-1 ATC findings. If blocked, escalate to PM.

---

### sap:unit-architect

**Purpose**: Design and implement ABAP Unit test classes that satisfy the Acceptance Criteria from Business Analysis.

**Workflow**:
1. Read `docs/testing-guidelines.md` for conventions (test class naming, risk level, duration).
2. Map each Acceptance Criterion (AC-01, AC-02 …) to one or more test methods.
3. Identify dependencies (DB tables, function modules, BAPIs) and design TEST-SEAMs and TEST-INJECTIONs for isolation.
4. Write the test class using `WriteSource` with `FOR TESTING`, `RISK LEVEL HARMLESS`, `DURATION SHORT`.
5. Run `RunUnitTests` — all methods must pass before considering the task complete.

**Test naming convention**:
```abap
CLASS ltc_<object_name> DEFINITION FOR TESTING
  RISK LEVEL HARMLESS DURATION SHORT.
  PRIVATE SECTION.
    METHODS test_<ac_id>_<scenario> FOR TESTING.
ENDCLASS.
```

**Coverage target**: Every AC must have at least one test method. Priority-1 ATC findings of type "No unit test" must be resolved.

---

### sap:performance-analyzer

**Purpose**: Identify and resolve performance bottlenecks in ABAP code and SQL queries.

**Workflow**:
1. **Identify hot paths**: Use `AnalyzeCallGraph` on the suspect object to see call frequency and depth.
2. **Inspect SQL**: Extract all `SELECT` statements from `GetSource`. Check for:
   - Missing `WHERE` clause or missing index fields in WHERE
   - `SELECT *` instead of field list
   - Nested SELECTs inside loops (N+1 problem)
   - Missing `UP TO N ROWS` on large tables
3. **Validate with data**: Use `RunQuery` to measure actual row counts on the relevant tables.
4. **Check CDS**: Use `GetCDSDependencies` to see if a CDS view with built-in aggregation can replace the ABAP logic.
5. **Apply fixes** using `EditSource` — replace problem patterns with:
   - `SELECT field1, field2 INTO TABLE @DATA(lt_result) FROM table WHERE ...`
   - Single JOIN instead of nested SELECT
   - `FOR ALL ENTRIES IN` instead of SELECT inside LOOP
6. Run `SyntaxCheck` and `RunUnitTests` after every change.

**ABAP SQL performance rules** (from docs/mcp_usage.md):
- Use `DESCENDING` not `DESC`; `ASCENDING` not `ASC`
- Use `max_rows` parameter, not `LIMIT`
- Always specify field list — avoid `SELECT *` in production code

---

### sap:impact-architecture

**Purpose**: Analyse the full impact of a proposed change before implementation, to prevent regressions.

**Workflow**:
1. **Call graph analysis**: Call `AnalyzeCallGraph` on the target object. Record all direct and transitive callers.
2. **CDS dependency tree**: Call `GetCDSDependencies` and `GetCDSImpactAnalysis` to identify all CDS views, OData services, and Fiori apps downstream of any changed CDS view.
3. **Cross-package scan**: Call `GrepPackages` with the object name pattern to find references outside the primary package.
4. **Risk matrix**: For each caller/dependent, classify:
   - **Low**: Test-only or rarely-called utility
   - **Medium**: Core business logic — requires regression test
   - **High**: Real-time interface, batch job, or external API consumer — requires stakeholder sign-off
5. **Document in task-template.md § 1-A**: Fill in the Impact Summary table and Risk Assessment.
6. **Gate**: Present findings to PM. Do not proceed to Technical Design until PM approves.

**Output format** — produce BOTH sections below and paste into task-template.md §1-A:

**Section A — Impact Summary table (paste into §1-A Impact Summary):**
```markdown
| <ObjectName>          | <PROG/CLAS/DDLS> | <N callers> | Low / Medium / High |
| <related object 2>    | <type>           | <N>         | Low / Medium / High |
```
One row per directly affected object. Risk classification rules:
- **Low**: test-only or utility caller, no external consumers
- **Medium**: core business logic — regression test required
- **High**: real-time interface, batch job, or external API consumer — stakeholder sign-off required

**Section B — Risk Assessment (paste into §1-A Risk Assessment):**
```markdown
- **Scope**: <N objects affected>
- **Downtime required**: Yes / No
- **Transport needed**: Yes / No → Transport #: <!-- fill after CreateTransport -->
- **Rollback plan**: <describe or "N/A">
```

**Section C — Narrative (keep in your response for PM context):**
```
Direct callers (AnalyzeCallGraph): N objects
CDS dependents (GetCDSImpactAnalysis): M views, K OData services
Cross-package references (GrepPackages): P occurrences
Overall risk: Low / Medium / High
Reason: <explain dominant risk factor>
```

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
