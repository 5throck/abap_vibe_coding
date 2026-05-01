# Task Handoff Template

> **Usage**: Copy this file to `scratch/task-YYYY-MM-DD-NNN.md` at the start of each task.
> Each agent fills in their section, then passes to the next role.
> The PM archives the completed file to `memory/YYYY-MM-DD.md` after git commit.

---

## 0. Request

**Received by (PM)**: <!-- date and time -->
**User Request**:
> <!-- paste original user request verbatim -->

**Classification**: `ABAP Dev` / `Graph Analysis` / `Debug` / `Infra` / `Interface`
**Package**: `$TMP` / <!-- named package -->
**Affected Object Types**: PROG / CLAS / INTF / FUNC / DDLS / TABLE / CDS

**Agents Selected**:
- Business: <!-- SD / LE / PP / MM / FI / CO Analyst -->
- Technical: <!-- Architect / ABAP Developer / DBA / QA / DevOps / Interface Expert -->

---

## 1. Business Analysis

**Agent**: <!-- e.g., SD Analyst -->
**Context file loaded**: `contexts/<module>-analyst.md`

### AS-IS

<!-- Describe the current state. Include RunQuery / GetTableContents results. -->

```sql
-- query used
```

| Field | Value |
|-------|-------|
| <!-- key finding --> | <!-- result --> |

### GAP

<!-- What is wrong or missing? -->

### TO-BE Requirements

<!-- Describe the desired state in business terms. -->

### Acceptance Criteria

- [ ] **AC-01**: <!-- measurable condition -->
- [ ] **AC-02**: <!-- measurable condition -->
- [ ] **AC-03**: <!-- measurable condition -->

**Handoff to Architect**: <!-- summary of objects affected and key tables -->
**Handoff to DBA**: <!-- table list needing structure review -->

---

## 2. Technical Design

**Agent**: Architect
**Tools used**: `AnalyzeCallGraph`, `GetCDSDependencies`, `GrepPackages`

### Impact Analysis

```
-- AnalyzeCallGraph or GrepPackages result
```

| Object | Type | Change Required | Risk |
|--------|------|-----------------|------|
| <!-- name --> | PROG/CLAS/... | Create / Modify / None | Low/Medium/High |

### Implementation Approach

- [ ] EditSource (surgical, <50 lines)
- [ ] WriteSource (full rewrite)
- [ ] ImportFromFile (>2000 lines)

### Execution Plan

```
[parallel] <read tasks>
[serial]   SyntaxCheck → EditSource/WriteSource → RunUnitTests
[serial]   memory log → git commit
```

**Risk level**: `Low` / `Medium` / `High`
**Reason**: <!-- why this risk level -->

**Handoff to ABAP Developer**: <!-- object_url list and change description -->
**Handoff to DBA**: <!-- SQL/CDS changes needed -->

---

## 3. Implementation

**Agent**: ABAP Developer / DBA

### Changes Made

| Object URL | Type | Tool Used | Status |
|------------|------|-----------|--------|
| `/sap/bc/adt/...` | PROG | EditSource | ✅ Done / ❌ Failed |

### Syntax Check Results

```
-- SyntaxCheck output
```

### Unit Test Results

```
-- RunUnitTests output
```

**Handoff to QA Engineer**: <!-- test scenarios based on AC list -->

---

## 4. QA Verification

**Agent**: QA Engineer

### AC Verification

| AC | Test Method | Result |
|----|-------------|--------|
| AC-01 | <!-- RunUnitTests / manual --> | ✅ Pass / ❌ Fail |
| AC-02 | <!-- --> | ✅ Pass / ❌ Fail |

### Issues Found

| # | Symptom | Root Cause | Resolution |
|---|---------|------------|------------|
| 1 | <!-- --> | <!-- --> | <!-- --> |

---

## 5. Finalization (PM)

### Memory Log Entry

Append to `memory/YYYY-MM-DD.md`:

```markdown
## <Object Name> (<Object Type>)
- **Package**: <package>
- **ADT URL**: /sap/bc/adt/...
- **Purpose**: <one-line summary>
- **Decisions**: <key technical decisions>
- **Issues**: <symptom → root cause → resolution>
- **MCP/Config changes**: <if any>
```

### Git Commit

```bash
git add -A
git commit -m "<type>: <summary>"
```

**Commit type**: `feat` / `fix` / `refactor` / `docs` / `chore`

### Final Report to User

- Objects changed: <!-- list -->
- AC status: <!-- X/Y passed -->
- ADT URL: <!-- primary object link -->
- Notes: <!-- anything the user should know -->

---
*Template version: 1.0 — 2026-05-01*
