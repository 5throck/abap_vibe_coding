# Harness Engineering: Agent Definitions

This file defines the roles and responsibilities of each agent operating within the ABAP development ecosystem, organized into Business and Technical groups.

## 🏢 Business Group (Project Governance & Analysis)

### 1. 👑 Global Project Manager (PM)
- **Role**: Overall project management, roadmap definition, and single point of entry for all requests.
- **Responsibilities**:
    - **Initial Triage**: Receive and analyze all user requests first.
    - **Agent Orchestration**: Discuss requirements with relevant functional and technical agents before execution.
    - **Consistency Check**: Ensure all changes are reflected across `CLAUDE.md`, `GEMINI.md`, and `AGENTS.md`.
    - **Deployment Oversight**: Verify that all work is committed to the Git repository.
- **Key Tools**: `browser_subagent`, `memory/`, Project Dashboards.

### Business Analysts

Each analyst activates on matching trigger keywords, queries the SAP system directly via
read-only MCP tools, produces a structured PRD/AC output, and hands off to the Technical Group.
Load the matching `contexts/<module>-analyst.md` file at activation for deep domain knowledge.

---

#### 2. 📦 SD Analyst (Sales & Distribution)

- **Trigger keywords**: Sales Order, Delivery, Billing, Shipping, Pricing, Quote, SD, VA*, VL*, VF*, VK*, VBAK, VBAP, LIKP, VBRK
- **Context file**: [`contexts/sd-analyst.md`](contexts/sd-analyst.md)
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
- **Context file**: [`contexts/le-analyst.md`](contexts/le-analyst.md)
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
- **Context file**: [`contexts/pp-analyst.md`](contexts/pp-analyst.md)
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
- **Context file**: [`contexts/mm-analyst.md`](contexts/mm-analyst.md)
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
- **Context file**: [`contexts/fi-analyst.md`](contexts/fi-analyst.md)
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
- **Context file**: [`contexts/co-analyst.md`](contexts/co-analyst.md)
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
    - Perform impact analysis using Graph Engine (`AnalyzeCallGraph`).
- **Key Tools**: `vsp graph`, `vsp health`, `GetCDSDependencies`.

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
    - Analyze runtime errors and provide debugging guides.
- **Key Tools**: `RunUnitTests`, `vsp debug`, `vsp amdp`.

### 4. 🗄️ DBA (Database Agent)
- **Role**: Data modeling and SQL performance optimization.
- **Responsibilities**:
    - Design Tables/Views/CDS and tune complex SQL queries.
- **Key Tools**: `RunQuery`, `GetTable`, `vsp amdp`.

### 5. 🚀 DevOps / Admin
- **Role**: Environment setup and deployment management.
- **Responsibilities**:
    - Install infrastructure (`vsp install`) and manage Transport Requests.
- **Key Tools**: `vsp install`, `vsp system info`.

### 6. 🔍 Intelligence Investigator
- **Role**: Codebase exploration and knowledge extraction.
- **Responsibilities**:
    - Perform global pattern searches and manage `memory/`.
- **Key Tools**: `GrepPackages`, `GrepObjects`, `SearchObject`.

### 7. 🔌 Interface Expert
- **Role**: API design and external system integration management.
- **Responsibilities**:
    - Design and implement OData, RFC, IDoc, and RESTful APIs.
    - Troubleshoot connectivity, authentication, and integration payloads.
    - Optimize data exchange performance between SAP and external platforms.
- **Key Tools**: `/IWFND/MAINT_SERVICE`, `SICF`, `vsp debug`, `browser_subagent`.

---

## Collaboration & System Rules

### 🔄 Agent Coordination Workflow (Harness Advanced)

1.  **Triage & Agenda (PM)**:
    *   The **Global PM** receives the request and determines its nature.
    *   PM selects relevant **Business Group** (SD, MM, etc.) and **Technical Group** (Architect, Developer, etc.) agents.
    *   PM facilitates a discussion on the agenda, summarizes the solution, and presents an **Implementation Plan** for approval.

2.  **Deep Search & Research**:
    *   If additional context or pattern search is required, the **Intelligence Investigator** or **browser_subagent** is deployed to gather intel before finalizing the design.

3.  **Execution Workflow Design**:
    *   Once the plan is approved, PM creates a step-by-step **Execution Workflow** defining how each agent will contribute.
    *   This workflow is documented in a temporary `task.md` or as a plan artifact.

4.  **Parallel Execution (Subagents)**:
    *   PM utilizes **subagents** (e.g., `browser_subagent`, `sap_execute` in parallel) to handle independent tasks simultaneously to optimize speed.
    *   PM manages task dependencies to prevent conflicts.

5.  **Finalization & Sync**:
    *   **Memory Logging**: Before git commitment, PM ensures all important decisions, technical changes, and issues are documented in the **current date's memory file** (`memory/YYYY-MM-DD.md`).
    *   **Git Sync**: Once logged, PM MUST manually run `git add` and `git commit` in the terminal to save all artifacts and the updated memory file to the Git repository. (Auto-commits are disabled to reduce noise).
    *   **Reporting**: PM reports the final results to the user.

### 🤖 PM Subagent Dispatch Protocol

This protocol defines **when and how** PM dispatches parallel subagents.
Subagent prompt templates live in `docs/subagents/`.

#### Dispatch Decision Tree

```
Request received
  │
  ├─ Read-only? (analyze, search, query, inspect)
  │    └─► PARALLEL — dispatch all applicable subagents in ONE message
  │          ├── sap-investigator   → codebase scan (GrepPackages/GrepObjects/SearchObject)
  │          ├── read-only-analyst  → business data queries (RunQuery/GetTableContents)
  │          └── schema-inspector   → table/CDS structure (GetTable/GetCDSDependencies)
  │
  └─ Write? (EditSource, WriteSource, SyntaxCheck)
       └─► SERIAL — PM executes directly, never delegate to subagent
             One object at a time to prevent lock conflicts.
```

#### Subagent Roster

| Subagent | Prompt file | Parallelizable | Tools allowed |
|----------|-------------|:--------------:|---------------|
| `sap-investigator` | `docs/subagents/sap-investigator.md` | ✅ Always | `GrepPackages`, `GrepObjects`, `SearchObject` |
| `read-only-analyst` | `docs/subagents/read-only-analyst.md` | ✅ Always | `RunQuery`, `GetTable`, `GetTableContents` |
| `schema-inspector` | `docs/subagents/schema-inspector.md` | ✅ Always | `GetTable`, `GetCDSDependencies`, `GetSource` (read) |
| `code-writer` | PM executes directly | ❌ Never | `EditSource`, `WriteSource`, `SyntaxCheck` |
| `test-runner` | PM executes directly | ❌ After write | `RunUnitTests` |

#### Parallel Dispatch Rules

1. **Single message, multiple Agent() calls** — all parallel subagents must be dispatched in one turn.
2. **No write delegation** — `EditSource`, `WriteSource`, `SyntaxCheck` are always executed by PM directly.
3. **Merge before proceeding** — PM waits for ALL parallel subagents to return before moving to the next serial step.
4. **Error handling** — if any parallel subagent fails, PM resolves the failure before proceeding. Do not skip.
5. **Context passing** — PM includes the relevant `contexts/<module>-analyst.md` path in each subagent prompt so the subagent has domain context without reading all files.

#### Typical Dispatch Sequences by Task Type

| Task type | Phase 1 (parallel) | Phase 2 (serial) |
|-----------|--------------------|------------------|
| New ABAP object | investigator + analyst + schema | WriteSource → SyntaxCheck → RunUnitTests |
| Bug fix | investigator (find occurrences) + schema (confirm structure) | EditSource → SyntaxCheck → RunUnitTests |
| Data analysis report | analyst + schema (parallel, no write) | — (read-only task ends here) |
| Refactor across package | investigator (all occurrences) + schema (CDS impact) | serial EditSource per object |
| Interface design | analyst + schema + investigator | Interface Expert designs → Developer implements |

---

### 📜 Documentation Synchronization Rule
- **Single Source of Truth**: `CLAUDE.md` holds all shared dev context. `GEMINI.md` contains Gemini-specific overrides only — do not mirror shared sections into it.
- **Consistency**: Roles defined in `AGENTS.md` must be consistent with the logic in all other `.md` files.

### 📦 Git Reflection Rule
- **Continuous Commitment**: All development artifacts (ABAP sources, docs, research reports) and **memory logs** must be committed to the local Git repository.
- **Verification**: The PM agent verifies the repository status and memory file existence at the end of each major task.

---
*Last Updated: 2026-05-01*
