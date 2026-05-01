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

Each analyst handles requirements, authors PRDs and Acceptance Criteria, and supplies
domain knowledge to the Technical Group.

| Role | Domain | Core Responsibilities | Key Tables |
|------|--------|-----------------------|------------|
| SD Analyst | Sales & Distribution | Sales/Delivery/Billing analysis; Pricing Procedures (VKOA, VK11) | VBAK/VBAP, LIKP/LIPS, VBRK/VBRP |
| LE Analyst | Logistics Execution | Shipping/Transport/Route; WM/EWM integration design | VEKP/VEPO, VTTP |
| PP Analyst | Production Planning | BOM/Routing/Production Order; Capacity Planning & MRP | MAST/STKO/STPO, AFKO/AFPO |
| MM Analyst | Materials Management | Purchasing/Goods Receipt; Material Master & Inventory | MARA/MARC/MARD, EKKO/EKPO, MKPF/MSEG |
| FI Analyst | Financial Accounting | GL/AR/AP/Fixed Assets; Financial Statement & compliance | BKPF/BSEG, ACDOCA |
| CO Analyst | Controlling | Cost Center/Internal Order; CO-PA model design | CSKS/CSKP, COEP, COSP |

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
