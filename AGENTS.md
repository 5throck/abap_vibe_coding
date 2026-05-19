# Harness Engineering: Agent Definitions

This file defines the roles and responsibilities of each agent operating within the ABAP development ecosystem, organized into Business and Technical groups.

## 🏢 Business Group (Project Governance & Analysis)

### 1. 👑 Global Project Manager (PM)
- **Role**: Overall project management, roadmap definition, and single point of entry for all requests.
- **Responsibilities**:
    - **Initial Triage**: Receive and analyze all user requests first.
    - **Agent Orchestration**: Discuss requirements with relevant functional and technical agents before execution.
    - **Consistency Check**: Ensure all changes are reflected across `docs/context.md`, `CLAUDE.md`, `.codex/config.toml`, `.codex/hooks.json`, `GEMINI.md`, `AGENTS.md`, and `memory/MEMORY.md`.
    - **Deployment Oversight**: Verify that all work is committed to the Git repository.
- **Key Tools**: `ListTransports`, `GrepPackages`, `SearchObject`, `memory/`, Project Dashboards.
- **Triage**: Use `/triage <request>` to auto-classify, create the task file, and generate the §0-A dispatch block.
- **Finalization (§5 — always run after QA gate)**: After all ACs pass and RunATCCheck reports 0 Priority-1 findings:
  1. Run `sap:documentation-audit` to ensure cross-platform integrity.
  2. Copy the §5 Finalization block from the Architect Report into `memory/YYYY-MM-DD.md`
  3. Run `/sync` to execute vsp-audit + memory index update + git commit
  3. Report to user: objects changed, AC status, primary ADT URL

### Business Analysts

Each analyst activates on matching trigger keywords, queries the SAP system directly via
read-only MCP tools, produces a structured PRD/AC output, and hands off to the Technical Group.
Load the matching `agents/<module>-analyst.md` file at activation for deep domain knowledge.

---

#### 2. 📦 SD Analyst (Sales & Distribution)

- **Trigger keywords**: Sales Order, Delivery, Billing, Shipping, Pricing, Quote, SD, VA*, VL*, VF*, VK*, VBAK, VBAP, LIKP, VBRK
- **Context file**: [`agents/sd-analyst.md`](agents/sd-analyst.md)
- **Allowed Tools**: `RunQuery`, `GetTable`, `GetTableContents`, `SearchObject`, `GrepPackages`
- **Output Format**:
  ```
  ## SD Analysis
  ### AS-IS (Including RunQuery results)
  ### GAP
  ### TO-BE Requirements
  ### Acceptance Criteria
  - [ ] AC-01: ...
  ```
- **Handoff**: AC List → Architect, Key Table List → DBA

---

#### 3. 🚛 LE Analyst (Logistics Execution)

- **Trigger keywords**: Shipment Processing, Transport, Route Determination, Warehouse, WM, EWM, Handling Unit, Shipment, Route, Warehouse, LE, LT*, HU, VEKP, VEPO, VTTP, LIKP
- **Context file**: [`agents/le-analyst.md`](agents/le-analyst.md)
- **Allowed Tools**: `RunQuery`, `GetTable`, `GetTableContents`, `SearchObject`
- **Output Format**:
  ```
  ## LE Analysis
  ### AS-IS (Logistics Flow + Table Query Results)
  ### GAP
  ### TO-BE Requirements
  ### Acceptance Criteria
  - [ ] AC-01: ...
  ```
- **Handoff**: Logistics Flow Diagram → Architect, Interface Requirements → Interface Expert

---

#### 4. 🏭 PP Analyst (Production Planning)

- **Trigger keywords**: Production Order, BOM, Routing, MRP, Capacity Planning, Material Requirements, Production Order, Routing, Work Center, PP, CO*, MAST, STKO, AFKO, PLKO
- **Context file**: [`agents/pp-analyst.md`](agents/pp-analyst.md)
- **Allowed Tools**: `RunQuery`, `GetTable`, `GetTableContents`, `SearchObject`
- **Output Format**:
  ```
  ## PP Analysis
  ### AS-IS (BOM/Routing Structure + Query Results)
  ### GAP
  ### TO-BE Requirements
  ### Acceptance Criteria
  - [ ] AC-01: ...
  ```
- **Handoff**: BOM/Routing Structure → Architect, MRP Logic → DBA

---

#### 5. 🛒 MM Analyst (Materials Management)

- **Trigger keywords**: Purchasing, Order, Goods Receipt, Material Master, Inventory, Inspection, Purchase Order, Goods Receipt, Material Master, Inventory, MM, ME*, MARA, MARC, EKKO, EKPO, MKPF, MSEG
- **Context file**: [`agents/mm-analyst.md`](agents/mm-analyst.md)
- **Allowed Tools**: `RunQuery`, `GetTable`, `GetTableContents`, `SearchObject`
- **Output Format**:
  ```
  ## MM Analysis
  ### AS-IS (Purchasing/Inventory Process + Table Query Results)
  ### GAP
  ### TO-BE Requirements
  ### Acceptance Criteria
  - [ ] AC-01: ...
  ```
- **Handoff**: Material-related Table Structure → DBA, Validation Scenario → QA Engineer

---

#### 6. 💰 FI Analyst (Financial Accounting)

- **Trigger keywords**: Journal Entry, Account, GL, AR, AP, Fixed Asset, Settlement, Compliance, Journal Entry, Account, Fiscal Year, FI, FB*, F-*, BKPF, BSEG, ACDOCA, SKA1
- **Context file**: [`agents/fi-analyst.md`](agents/fi-analyst.md)
- **Allowed Tools**: `RunQuery`, `GetTable`, `GetTableContents`, `SearchObject`
- **Output Format**:
  ```
  ## FI Analysis
  ### AS-IS (Posting Flow + Account Query Results)
  ### GAP
  ### TO-BE Requirements
  ### Acceptance Criteria
  - [ ] AC-01: ...
  ```
- **Handoff**: Account Determination Logic → Architect, Balance Verification Query → DBA

---

#### 7. 📊 CO Analyst (Controlling)

- **Trigger keywords**: Cost, Cost Center, Internal Order, Profitability Analysis, CO-PA, Allocation, Cost Center, Internal Order, Profitability, CO, KS*, KO*, CSKS, CSKP, COEP, COSP, CE1*
- **Context file**: [`agents/co-analyst.md`](agents/co-analyst.md)
- **Allowed Tools**: `RunQuery`, `GetTable`, `GetTableContents`, `SearchObject`
- **Output Format**:
  ```
  ## CO Analysis
  ### AS-IS (Cost Flow + CO-PA Characteristic Value Query Results)
  ### GAP
  ### TO-BE Requirements
  ### Acceptance Criteria
  - [ ] AC-01: ...
  ```
- **Handoff**: Allocation Logic → Architect, CO-PA Mapping Table → DBA

---

## 🛠️ Technical Group (System Execution & Implementation)

### 1. 🏗️ Architect
- **Role**: System architecture design and complex dependency management.
- **Responsibilities**:
    - Design technical architecture based on Analyst-authored PRDs.
    - Perform impact analysis using `AnalyzeCallGraph` and provide expert architect-level assessment for BAPI/CDS changes (`sap:impact-architecture`).
    - **Select implementation pattern** (A/B/C) using the deterministic rules in [`agents/architect.md`](agents/architect.md).
    - Generate the §5 Finalization block in every Architect Report so PM can run it without manual composition.
    - Define structural separation between **Function** (Interface/Entry) and **Logic** (Core/Business) components from an OOP perspective.
    - **Rule**: Utilize ABAP Objects (Classes/Interfaces) only when explicitly necessary to balance complexity and performance.
- **Key Tools**: `AnalyzeCallGraph`, `GetCDSDependencies`, `GetCDSImpactAnalysis`, `GrepPackages`, `GetSource`.
- **Subagent prompt**: [`agents/architect.md`](agents/architect.md)

### 2. 💻 ABAP Developer
- **Role**: Feature implementation and source code optimization.
- **Responsibilities**:
    - Create/modify ABAP objects and optimize performance.
    - Perform precision code modifications via `EditSource`.
- **Key Tools**: `WriteSource`, `EditSource`, `SyntaxCheck`.

### 3. 🧪 QA Engineer
- **Role**: Stability verification and bug detection.
- **Responsibilities**:
    - Author and execute Unit Tests based on Analyst's Acceptance Criteria.
    - Follow `docs/testing-guidelines.md` for ABAP Unit structures and TEST-SEAMS.
    - Run `RunATCCheck` after unit tests pass; Priority 1 findings block `Activate`.
    - Analyze runtime errors and provide debugging guides.
    - Perform security and compliance audits (Authorization object checks, SQL Injection prevention).
- **Key Tools**: `RunUnitTests`, `RunATCCheck`, `SyntaxCheck`, `GetSource`.
- **Mandatory sequence**: `SyntaxCheck` → `RunUnitTests` → `RunATCCheck` (see `skills/post-write-chain/SKILL.md`).

### 4. 🗄️ DBA (Database Agent)
- **Role**: Data modeling and SQL performance optimization.
- **Responsibilities**:
    - Design Tables/Views/CDS and tune complex SQL queries.
    - Conduct professional data modeling including **ERD (Entity Relationship Diagram)** design and **Normalization** (1NF to 3NF).
    - Perform **Indexing** strategies and performance review for large-scale data processing.
- **Key Tools**: `RunQuery`, `GetTable`, `GetTableContents`, `SearchObject`.

### 5. 🚀 DevOps / Admin
- **Role**: Environment setup and deployment management.
- **Responsibilities**:
    - Install infrastructure (`vsp install`) and manage Transport Requests.
- **Key Tools**: `InstallZADTVSP`, `InstallAbapGit`, `GetSystemInfo`, `GetConnectionInfo`, `CreateTransport`, `AddToTransport`, `ReleaseTransport`, `ListTransports`, `GetTransport`.

### 6. 🔍 Intelligence Investigator
- **Role**: Codebase exploration and knowledge extraction.
- **Responsibilities**:
    - Perform global pattern searches and manage `memory/`.
    - Execute historical knowledge extraction and design decision summaries via `harness:memory-intelligence`.
- **Key Tools**: `GrepPackages`, `GrepObjects`, `SearchObject`.

### 7. 🔌 Interface Expert
- **Role**: API design and external system integration management.
- **Responsibilities**:
    - Design and implement OData, RFC, IDoc, and RESTful APIs.
    - Troubleshoot connectivity, authentication, and integration payloads.
    - Optimize data exchange performance between SAP and external platforms.
- **Key Tools**: `GetODataMetadata`, `TestODataService`, `GetCDSExposure`, `GetCDSDependencies`, `SearchObject`.

### 8. 🎨 Fiori Developer / UX Designer
- **Role**: High-aesthetic UI/UX design and SAPUI5/Fiori implementation.
- **Responsibilities**:
    - Design modern, premium interfaces following SAP Fiori Guidelines and project "Rich Aesthetics" standards.
    - Implement Fiori Elements or custom UI5 applications.
    - Ensure responsive design and cross-device compatibility.
- **Key Tools**: `UI5ListApps`, `UI5GetApp`, `UI5GetFileContent`, `GetODataMetadata`, `GetCDSExposure`, `EditSource`, `SyntaxCheck`.
- **Note**: Visual mockups are produced as HTML/SVG code artifacts — `generate_image` is not available in this environment.

---

### 9. 📑 Form Expert
- **Role**: Specialized in document output design (SAP Script, Smart Forms, Adobe Forms) and print program development.
- **Responsibilities**:
    - Design and maintain complex layouts for business documents.
    - Implement and optimize print programs for data retrieval.
    - Ensure cross-output format consistency (PDF, XML, Print).
- **Key Tools**: `GetSource` (for print programs), `EditSource`, `browser_subagent`.

---

### 10. 🤖 SAP GUI Scripting Expert
- **Role**: Automation of SAP GUI workflows and legacy process integration.
- **Responsibilities**:
    - Develop and maintain automation scripts for manual transactions and legacy screens.
    - Integrate GUI scripting with external automation tools and frameworks.
    - Troubleshoot screen-scraping, session management, and interaction issues.
- **Key Tools**: `browser_subagent`, `vsp debug`, `vsp health`.

---

## Collaboration & System Rules

### 🔄 Agent Coordination Workflow (Harness Advanced)

1.  **Triage & Initial Research (PM & Subagents)**:
    *   The **Global PM** receives and classifies the request.
    *   Immediate research is dispatched (Parallel: `sap-investigator` + `schema-inspector`) to gather technical context before any discussion.

2.  **Business Analysis & AC Definition (Biz Group)**:
    *   Module analysts (SD, MM, etc.) discuss the request based on research data.
    *   **Output**: PRD (Product Requirements Document) and clear **Acceptance Criteria (AC)**.

3.  **Governance & Implementation Approval (PM & User)**:
    *   PM Agent reviews the PRD/AC and confirms the scope.
    *   **User Approval Required**: For high-risk changes (Core BAPI/CDS modification, Schema changes, cross-module refactors).

4.  **Technical Design & Impact Analysis (Tech Group)**:
    *   Technical agents (Architect, DBA, Developer) design the implementation.
    *   **Impact Analysis**: Use `sap:impact-architecture` to identify side effects. Architect defines OOP structure; DBA reviews indexing.

5.  **Implementation & Verification Chain (Assigned Agents)**:
    *   Implementation is delegated to `code-writer` and verification to `test-runner`.
    *   **Mandatory Chain**: Must pass `SyntaxCheck` → `RunUnitTests` → `RunATCCheck` (Zero P1 findings).

6.  **Finalization, Sync & Reporting (PM)**:
    *   **Memory Logging**: Record key decisions and issues in `memory/YYYY-MM-DD.md`.
    *   **Git Sync**: Execute `vsp-sync` to commit artifacts and update index.
    *   **Final Report**: PM summarizes the outcome and test results for the user.

### 🤖 PM Subagent Dispatch Protocol

This protocol defines **when and how** PM dispatches parallel subagents.
Agent definitions live in `agents/`.

#### Dispatch Decision Tree

```
Request received
  │
  ├─ Read-only? (analyze, search, query, inspect)
  │    └─► PARALLEL SKILLS — Primary Agent dispatches research subagents
  │          ├── sap-investigator   → codebase scan (Skills: memory-intelligence, bapi-explorer)
  │          ├── read-only-analyst  → business data queries (Module analyst contexts)
  │          └── schema-inspector   → table/CDS structure (Skill: impact-architecture)
  │
  └─ Write? (EditSource, WriteSource, SyntaxCheck)
       └─► SERIAL SUBAGENTS — delegate to specialized execution subagents
             ├── code-writer  → ABAP implementation (EditSource/WriteSource/SyntaxCheck)
             └── test-runner  → Stability verification (RunUnitTests/RunATCCheck)
```

#### Subagent Roster

| Subagent | Prompt file | Parallelizable | Tools allowed |
|----------|-------------|:--------------:|---------------|
| `sap-investigator` | `agents/sap-investigator.md` | ✅ Always | `GrepPackages`, `GrepObjects`, `SearchObject` |
| `read-only-analyst` | `agents/read-only-analyst.md` | ✅ Always | `RunQuery`, `GetTable`, `GetTableContents` |
| `schema-inspector` | `agents/schema-inspector.md` | ✅ Always | `GetTable`, `GetCDSDependencies`, `GetSource` (read) |
| `code-writer` | `agents/code-writer.md` | ❌ Never | `EditSource`, `WriteSource`, `SyntaxCheck` |
| `test-runner` | `agents/test-runner.md` | ❌ After write | `RunUnitTests` |
| `fiori-dev` | `agents/fiori-developer.md` | ✅ Always | `generate_image`, `browser_subagent` |
| `form-expert` | `agents/form-expert.md` | ✅ Design only | `GrepObjects`, `EditSource` |
| `gui-scripter` | `agents/gui-scripter.md` | ❌ Never | `browser_subagent`, `vsp debug` |

#### Parallel Dispatch Rules

1. **Single message, multiple Agent() calls** — all parallel subagents must be dispatched in one turn.
2. **Serial write execution** — `EditSource`, `WriteSource`, `SyntaxCheck` are executed by the ABAP Developer in serial to prevent lock conflicts.
3. **Merge before proceeding** — PM waits for ALL parallel subagents to return before moving to the next serial step.
4. **Error handling** — if any parallel subagent fails, PM resolves the failure before proceeding. Do not skip.
5. **Context passing** — PM includes the relevant `agents/<module>-analyst.md` path in each subagent prompt so the subagent has domain context without reading all files.

#### Typical Dispatch Sequences by Task Type

| Task type | Phase 1 (parallel research) | Phase 2 (serial execution) |
|-----------|-----------------------------|----------------------------|
| New ABAP object | investigator + analyst + schema | code-writer → test-runner |
| Bug fix | investigator + schema | code-writer → test-runner |
| Data analysis report | analyst + schema | — (read-only task ends here) |
| Refactor across package | investigator + schema | code-writer per object → test-runner |
| Interface design | analyst + schema + investigator | Interface Expert designs → code-writer implements |
| Fiori / UX design | analyst + browser_subagent | fiori-dev designs → code-writer implements |
| Form / Output design | analyst + schema | form-expert designs → code-writer implements |
| Automation Scripting | analyst + investigator | gui-scripter develops → code-writer integrates |

---

### 🖥️ Tool Selection Rule

Agents must choose the appropriate tool for each task type. All tools share the same abap MCP server but differ in capability and platform support.

| Task type | Claude Code CLI | Claude Code App | Antigravity | Gemini CLI |
|-----------|:--------------:|:--------------:|:-----------:|:----------:|
| PM multi-agent dispatch | ✅ Plan mode + subagents | ✅ Plan mode + subagents | ❌ | ✅ browser_subagent |
| Serial write chain (SyntaxCheck → RunUnitTests → RunATCCheck) | ✅ Hook fires automatically | ⚠️ Hook does NOT fire — run manually | ⚠️ Hook unverified | ✅ Supported |
| ATC code quality check (RunATCCheck) | ✅ | ✅ | ✅ | ✅ Identical result |
| ABAP object browse / edit | ⚠️ Terminal only | ✅ Visual diff + inline review | ✅ File explorer + diff view | ⚠️ Terminal only |
| MCP read/query (GetSource, RunQuery, GrepObjects) | ✅ | ✅ Identical result | ✅ Identical result | ✅ Identical result |
| Git commit / PR | ✅ `commit-commands` skills | ✅ PR monitoring + CI status | ⚠️ Extension terminal only | ✅ Bash tools |
| Web research / browser subagent | ❌ | ❌ | ❌ | ✅ Native capability |
| Parallel sessions (visual worktrees) | ❌ | ✅ Automatic | ❌ | ❌ |
| Computer use (GUI automation) | ❌ | ✅ Win/macOS | ❌ | ❌ |
| Linux support | ✅ | ❌ | ✅ | ✅ |
| Quick lookup / search | ✅ | ✅ | ✅ Native search preferred | ✅ |

**Rule**: Default to Claude Code CLI or App for orchestration. Prefer CLI on Linux or when hook automation is required. Use Desktop App for visual diff review, PR monitoring, and parallel sessions. Use Antigravity for file-centric editing. Use Gemini CLI when web research or `browser_subagent` delegation is needed.

### 📜 Documentation Synchronization Rule
- **Single Source of Truth**: `docs/context.md` holds all shared dev context (build, codebase, ABAP rules, Harness workflow). `CLAUDE.md` contains Claude Code-specific config. `.codex/config.toml` and `.codex/hooks.json` contain Codex-specific config. `GEMINI.md` contains Gemini CLI overrides.
- **Consistency**: Roles defined in `AGENTS.md` must be consistent with the logic in all other `.md` files.

### 📦 Git Reflection Rule
- **Continuous Commitment**: All development artifacts (ABAP sources, docs, research reports) and **memory logs** must be committed to the local Git repository.
- **File Isolation**: Agents MUST only create local `.abap` files in the `scratch/` directory.
- **Verification**: The PM agent verifies the repository status and memory file existence at the end of each major task.

---
*Last Updated: 2026-05-19*
