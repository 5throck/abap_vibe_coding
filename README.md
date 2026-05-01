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

Agents are categorized into two strategic groups to ensure both business alignment and technical excellence:

### 🏢 Business Group
- **Global PM**: Manages project roadmap and cross-module synchronization.
- **Functional Analysts (SD, LE, PP, MM, FI, CO)**: Bridge business needs and technology by authoring module-specific PRDs and Acceptance Criteria.

### 🛠️ Technical Group
- **Architect & DBA**: Design system blueprints and optimized data models (CDS Views).
- **ABAP Developer**: Executes precision coding and refactoring.
- **QA Engineer**: Ensures stability through automated Unit Testing and debugging.
- **DevOps/Admin**: Handles infrastructure setup and transport management.
- **Intelligence Investigator**: Maintains the project's knowledge base and explores existing code patterns.

## File Structure

| Directory/File | Purpose |
| :--- | :--- |
| **`.gemini/`, `.claude/`** | Agent-specific settings, permissions, and custom commands (Skills). |
| **`scripts/`** | Automation tools for document syncing and synchronization. |
| **`AGENTS.md`** | Source of truth for agent roles and collaboration workflows. |
| **`SKILL.md`** | Mandatory technical guidelines and AI-native skill definitions. |
| **`MEMORY.md`** | Living log of architectural decisions and system changes. |
| **`MCP_USAGE.md`** | Technical manual for optimal MCP tool utilization. |
| **`vsp.exe`** | The core MCP server and CLI tool for SAP ADT integration. |

## Operational Workflow

1.  **Analysis**: The process starts with a **Functional Analyst** defining requirements in a PRD.
2.  **Design**: The **Architect** and **DBA** create a technical design while the **Investigator** researches existing objects.
3.  **Implementation**: The **Developer** writes code in **Hyperfocused Mode** directly on the SAP system.
4.  **Verification**: The **QA Engineer** validates the results against the **Acceptance Criteria** defined in step 1.
5.  **Documentation**: All changes are automatically logged in **MEMORY.md** for future context.

---
*Maintained by the Harness Engineering Team | Last Updated: 2026-05-01*
