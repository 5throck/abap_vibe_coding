# VSP Harness Engineering for ABAP

## Project Mission
This project aims to revolutionize SAP ABAP development by establishing a **Harness Engineering** framework. It leverages AI agents and the **vsp** (Vibing Steampunk) MCP server to automate and optimize the entire development lifecycle—from business requirements analysis to system deployment.

## System Architecture & Operating Principles

The system operates as a bridge between Modern AI interfaces and legacy SAP environments:

1.  **Agent Tier**: AI agents (Claude Code, Gemini CLI) act as the "brain," orchestrating tasks based on predefined roles.
2.  **MCP Tier (vsp)**: The **vsp** server provides a standard protocol (Model Context Protocol) to expose SAP ADT (ABAP Development Tools) capabilities to AI.
3.  **SAP Tier**: Interaction with SAP systems via REST APIs and WebSocket (ZADT_VSP) for stateful operations like debugging and RFC execution.

### Harness Engineering Concept
Harness Engineering is a methodology where specialized AI agents collaborate within a structured "harness" (environment). This project follows a **Document-First** approach. ABAP source code resides directly within the SAP system, while this repository tracks the **intelligence, logic, and architectural framework** (Harness) used by AI agents to manage the SAP environment.

## Agent Framework (AGENTS.md)

Agents are categorized into two strategic groups, operating under a **PM-led Governance** model:

### 🏢 Business Group
- **👑 Global PM**: The **single point of entry** for all requests. Orchestrates agents and ensures doc/git consistency.
- **📦 Functional Analysts (SD, MM, etc.)**: Bridge business needs and technology by authoring module-specific PRDs.

### 🛠️ Technical Group
- **🏗️ Architect & 🗄️ DBA**: Design system blueprints and optimized data models (CDS Views).
- **💻 ABAP Developer**: Executes precision coding and refactoring via `vsp`.
- **🔌 Interface Expert**: Manages OData, RFC, and external API integrations.
- **🧪 QA Engineer**: Ensures stability through Unit Testing and debugging.
- **🚀 DevOps/Admin**: Handles infrastructure and deployment.
- **🔍 Intelligence Investigator**: Explores codebase patterns and extracts knowledge.

## File Structure

| Directory/File | Purpose |
| :--- | :--- |
| **`memory/`** | **Date-based development history.** Replaces the flat `MEMORY.md`. |
| **`AGENTS.md`** | Source of truth for agent roles and **strict PM-led workflows**. |
| **`CLAUDE.md` / `GEMINI.md`** | Synchronized AI context and development guidelines. |
| **`SKILL.md`** | Mandatory technical guidelines and custom AI skills. |
| **`MCP_USAGE.md`** | Technical manual for optimal MCP tool (RunQuery, EditSource, etc.) usage. |
| **`vsp.exe`** | The core Go-native MCP server for SAP ADT integration. |

## Operational Workflow (Governance)

1.  **Entry**: All user requests are received by the **Global PM**.
2.  **Orchestration**: PM consults with relevant Analysts and Technical agents to define scope.
3.  **Implementation**: Developers and experts execute tasks in **Hyperfocused Mode**.
4.  **Verification**: QA validates against requirements; PM ensures documentation sync.
5.  **Persistence**: All work is logged in **`memory/`** and committed to **Git**.

---
> [!TIP]
> **Reference Artifacts**
> - [walkthrough.md](walkthrough.md): SAP Demo Data (GWSAMPLE_BASIC/EPM) Guide.
> - [troubleshooting_guide.md](troubleshooting_guide.md): Gateway Maintenance Troubleshooting.

---
*Maintained by the Harness Engineering Team | Last Updated: 2026-05-01*
