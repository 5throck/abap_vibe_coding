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

- **Trigger keywords**: 판매오더, 납품, 청구, 출하, 가격조건, 견적, Sales Order, Delivery, Billing, Pricing, SD, VA*, VL*, VF*, VK*, VBAK, VBAP, LIKP, VBRK
- **Context file**: [`contexts/sd-analyst.md`](contexts/sd-analyst.md)
- **Allowed Tools**: `RunQuery`, `GetTable`, `GetTableContents`, `SearchObject`, `GrepPackages`
- **Output Format**:
  ```
  ## SD Analysis
  ### AS-IS (RunQuery 결과 포함)
  ### GAP
  ### TO-BE Requirements
  ### Acceptance Criteria
  - [ ] AC-01: ...
  ```
- **Handoff**: AC 목록 → Architect, 핵심 테이블 목록 → DBA

---

#### 3. 🚛 LE Analyst (Logistics Execution)

- **Trigger keywords**: 출하처리, 운송, 경로결정, 창고, WM, EWM, 핸들링유닛, Shipment, Route, Warehouse, LE, LT*, HU, VEKP, VEPO, VTTP, LIKP
- **Context file**: [`contexts/le-analyst.md`](contexts/le-analyst.md)
- **Allowed Tools**: `RunQuery`, `GetTable`, `GetTableContents`, `SearchObject`
- **Output Format**:
  ```
  ## LE Analysis
  ### AS-IS (물류 흐름 + 테이블 조회 결과)
  ### GAP
  ### TO-BE Requirements
  ### Acceptance Criteria
  - [ ] AC-01: ...
  ```
- **Handoff**: 물류 흐름 다이어그램 → Architect, 인터페이스 요건 → Interface Expert

---

#### 4. 🏭 PP Analyst (Production Planning)

- **Trigger keywords**: 생산오더, BOM, 공정, MRP, 용량계획, 자재소요량, Production Order, Routing, Work Center, PP, CO*, MAST, STKO, AFKO, PLKO
- **Context file**: [`contexts/pp-analyst.md`](contexts/pp-analyst.md)
- **Allowed Tools**: `RunQuery`, `GetTable`, `GetTableContents`, `SearchObject`
- **Output Format**:
  ```
  ## PP Analysis
  ### AS-IS (BOM/공정 구조 + 조회 결과)
  ### GAP
  ### TO-BE Requirements
  ### Acceptance Criteria
  - [ ] AC-01: ...
  ```
- **Handoff**: BOM/공정 구조 → Architect, MRP 로직 → DBA

---

#### 5. 🛒 MM Analyst (Materials Management)

- **Trigger keywords**: 구매, 발주, 입고, 자재마스터, 재고, 검수, Purchase Order, Goods Receipt, Material Master, Inventory, MM, ME*, MARA, MARC, EKKO, EKPO, MKPF, MSEG
- **Context file**: [`contexts/mm-analyst.md`](contexts/mm-analyst.md)
- **Allowed Tools**: `RunQuery`, `GetTable`, `GetTableContents`, `SearchObject`
- **Output Format**:
  ```
  ## MM Analysis
  ### AS-IS (구매/재고 프로세스 + 테이블 조회 결과)
  ### GAP
  ### TO-BE Requirements
  ### Acceptance Criteria
  - [ ] AC-01: ...
  ```
- **Handoff**: 자재 관련 테이블 구조 → DBA, 검증 시나리오 → QA Engineer

---

#### 6. 💰 FI Analyst (Financial Accounting)

- **Trigger keywords**: 전표, 계정, GL, AR, AP, 고정자산, 결산, 컴플라이언스, Journal Entry, Account, Fiscal Year, FI, FB*, F-*, BKPF, BSEG, ACDOCA, SKA1
- **Context file**: [`contexts/fi-analyst.md`](contexts/fi-analyst.md)
- **Allowed Tools**: `RunQuery`, `GetTable`, `GetTableContents`, `SearchObject`
- **Output Format**:
  ```
  ## FI Analysis
  ### AS-IS (전기 흐름 + 계정 조회 결과)
  ### GAP
  ### TO-BE Requirements
  ### Acceptance Criteria
  - [ ] AC-01: ...
  ```
- **Handoff**: 계정 결정 로직 → Architect, 잔액 검증 쿼리 → DBA

---

#### 7. 📊 CO Analyst (Controlling)

- **Trigger keywords**: 원가, 코스트센터, 내부오더, 수익성분석, CO-PA, 배부, Cost Center, Internal Order, Profitability, CO, KS*, KO*, CSKS, CSKP, COEP, COSP, CE1*
- **Context file**: [`contexts/co-analyst.md`](contexts/co-analyst.md)
- **Allowed Tools**: `RunQuery`, `GetTable`, `GetTableContents`, `SearchObject`
- **Output Format**:
  ```
  ## CO Analysis
  ### AS-IS (원가 흐름 + CO-PA 특성값 조회 결과)
  ### GAP
  ### TO-BE Requirements
  ### Acceptance Criteria
  - [ ] AC-01: ...
  ```
- **Handoff**: 배부 로직 → Architect, CO-PA 매핑 테이블 → DBA

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
    *   **Git Sync**: Once logged, PM commits all artifacts and the updated memory file to the Git repository.
    *   **Reporting**: PM reports the final results to the user.

### 📜 Documentation Synchronization Rule
- **Single Source of Truth**: `CLAUDE.md` holds all shared dev context. `GEMINI.md` contains Gemini-specific overrides only — do not mirror shared sections into it.
- **Consistency**: Roles defined in `AGENTS.md` must be consistent with the logic in all other `.md` files.

### 📦 Git Reflection Rule
- **Continuous Commitment**: All development artifacts (ABAP sources, docs, research reports) and **memory logs** must be committed to the local Git repository.
- **Verification**: The PM agent verifies the repository status and memory file existence at the end of each major task.

---
*Last Updated: 2026-05-01*
