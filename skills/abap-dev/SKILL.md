---
name: ABAP Development Skills
description: Use when working on SAP ABAP development tasks — provides specialized workflows for BAPI exploration, transport management, unit testing, performance analysis, impact architecture analysis, and documentation audits. Trigger on any SAP/ABAP coding, debugging, or system analysis task.
version: 1.0.0
---

# ABAP Development Skills (vsp)

This skill defines the ABAP development capabilities and optimized workflow patterns for Claude Code and AI agents using the vsp MCP server.

## Core Capabilities

- **Surgical Edits**: Use `EditSource` for changes under 50 lines to ensure syntax safety and atomicity.
- **Context Awareness**: Use `GetContext` when analyzing large classes to save tokens and focus on structural understanding.
- **Graph Analysis**: Perform impact analysis via `AnalyzeCallGraph` before refactoring.
- **SQL Accuracy**: Adhere to ABAP SQL standards (e.g., use `DESCENDING` instead of `DESC`) when using `RunQuery`.

## Best Practices

- Always execute `SyntaxCheck` after any modification to verify quality.
- Focus operations primarily within `Z*` and `$TMP` packages.
- **File Isolation**: Always create `.abap` files within the `scratch/` directory to maintain a clean root.

---

## sap:bapi-explorer

**Purpose**: Discover, evaluate, and document standard SAP BAPIs for integration use cases.

**Trigger**: When searching for integration APIs, standard function modules, or BAPI alternatives to custom development.

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

## sap:transport-manager

**Purpose**: Create, populate, and release SAP Transport Requests (CTS) for object deployment.

**Trigger**: When working on dev/production systems, deploying objects, or managing change management.

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

## sap:unit-architect

**Purpose**: Design and implement ABAP Unit test classes that satisfy the Acceptance Criteria from Business Analysis.

**Trigger**: When writing quality code, implementing new features, or ensuring test coverage.

**Workflow**:
1. Map each Acceptance Criterion (AC-01, AC-02 …) to one or more test methods.
2. Identify dependencies (DB tables, function modules, BAPIs) and design TEST-SEAMs and TEST-INJECTIONs for isolation.
3. Write the test class using `WriteSource` with `FOR TESTING`, `RISK LEVEL HARMLESS`, `DURATION SHORT`.
4. Run `RunUnitTests` — all methods must pass before considering the task complete.

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

## sap:performance-analyzer

**Purpose**: Identify and resolve performance bottlenecks in ABAP code and SQL queries.

**Trigger**: When optimizing code, profiling slow reports, or reviewing SQL for efficiency.

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

**ABAP SQL performance rules**:
- Use `DESCENDING` not `DESC`; `ASCENDING` not `ASC`
- Use `max_rows` parameter, not `LIMIT`
- Always specify field list — avoid `SELECT *` in production code

---

## sap:impact-architecture

**Purpose**: Analyse the full impact of a proposed change before implementation, to prevent regressions.

**Trigger**: When modifying core BAPIs, CDS views, or widely-used objects. Run before any significant refactoring.

**Workflow**:
1. **Call graph analysis**: Call `AnalyzeCallGraph` on the target object. Record all direct and transitive callers.
2. **CDS dependency tree**: Call `GetCDSDependencies` and `GetCDSImpactAnalysis` to identify all CDS views, OData services, and Fiori apps downstream of any changed CDS view.
3. **Cross-package scan**: Call `GrepPackages` with the object name pattern to find references outside the primary package.
4. **Risk matrix**: For each caller/dependent, classify:
   - **Low**: Test-only or rarely-called utility
   - **Medium**: Core business logic — requires regression test
   - **High**: Real-time interface, batch job, or external API consumer — requires stakeholder sign-off
5. **Gate**: Present findings to PM. Do not proceed to Technical Design until PM approves.

**Output format** — produce both sections below:

**Section A — Impact Summary table**:
```
| <ObjectName> | <Type> | <N callers> | Low / Medium / High |
```

**Section B — Risk Assessment**:
```
- Scope: <N objects affected>
- Downtime required: Yes / No
- Transport needed: Yes / No
- Rollback plan: <describe or "N/A">
```

---

## sap:documentation-audit

**Purpose**: Ensure all project documentation is cross-platform compatible, links are valid, and absolute paths are avoided.

**Trigger**: Before finalization/sync, or before running `/sync` command.

**Workflow**:
1. **Identify OS**: Determine if running on Windows (PowerShell) or macOS/Linux (Bash).
2. **Execute Audit**:
   - **Windows**: `powershell -ExecutionPolicy Bypass -File $CLAUDE_PLUGIN_ROOT/scripts/vsp-audit.ps1`
   - **Unix**: `bash $CLAUDE_PLUGIN_ROOT/scripts/vsp-audit.sh`
3. **Analyze Results**:
   - If audit passes: proceed to `vsp-sync`.
   - If audit fails: identify the specific issue (Broken link, Absolute path, Missing pair) and fix it in the source `.md` or script.
4. **Re-run**: Repeat until the audit returns 0 errors.

**Gate**: A passing audit is required before running the final `/sync` command.
