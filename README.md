# VSP Harness Engineering for ABAP

## Project Mission
This project aims to revolutionize SAP ABAP development by establishing a **Harness Engineering** framework. It leverages AI agents and the **vsp** MCP server to automate and optimize the entire development lifecycle—from business requirements analysis to system deployment.

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
| **`memory/`** | Date-based development history. See `memory/MEMORY.md` for the index. |
| **`AGENTS.md`** | Source of truth for agent roles and PM-led workflows. |
| **`CLAUDE.md`** | Primary AI dev context: build, codebase map, priorities, common issues, ABAP rules. |
| **`GEMINI.md`** | Gemini-specific overrides only (hyperfocused mode config, skill additions). |
| **`SKILL.md`** | Technical guidelines, tool boundaries, and custom AI skills. |
| **`SECURITY.md`** | Sanitization policy and pre-commit scan rules for tracked files. |
| **`MCP_USAGE.md`** | Technical reference for MCP tool usage (RunQuery, EditSource, etc.). |
| **`vsp.exe`** | Go-native MCP server for SAP ADT integration. |

## Operational Workflow (Harness Advanced Governance)

1.  **Triage (PM)** — Classify request type; identify package and affected objects.
2.  **Agenda** — Gather context via `SearchObject`/`GrepPackages`; select agents; produce Implementation Plan before any write.
3.  **Execution Design** — Define tool order and parallelism (read tasks parallel, write tasks serial).
4.  **Parallel Execution** — Independent read/search tasks run as subagents; write operations remain serial to avoid lock conflicts.
5.  **Sync & Report** — Append to `memory/YYYY-MM-DD.md`, commit to Git, report outcome with object URL and test results.

---
> [!TIP]
> **Reference Artifacts**
> - [walkthrough.md](walkthrough.md): SAP Demo Data (GWSAMPLE_BASIC/EPM) Guide.
> - [troubleshooting_guide.md](troubleshooting_guide.md): Gateway Maintenance Troubleshooting.

---
*Maintained by the Harness Engineering Team | Last Updated: 2026-05-01*
