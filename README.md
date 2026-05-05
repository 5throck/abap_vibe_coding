# Harness Engineering for SAP ABAP

## Project Mission
This project aims to revolutionize SAP ABAP development by establishing a robust **Harness Engineering** framework. It leverages AI agents to automate, standardize, and optimize the entire development lifecycle—from business requirements analysis to system deployment.

## Harness Engineering Concept

**Harness Engineering** is a methodology where specialized AI agents collaborate within a strictly structured "harness" (environment). This approach ensures that AI-driven development is predictable, professional, and highly efficient. 

Key principles of Harness Engineering include:
- **Document-First Approach**: All architectural decisions, workflows, and business rules are documented before any code is written. 
- **Role-Based Collaboration**: Tasks are delegated to specialized agents (PM, Analysts, Developers, Architects) operating under a unified governance model, much like a human software engineering team.
- **Repository as a Brain**: While ABAP source code resides directly within the SAP system, this repository tracks the **intelligence, logic, and architectural framework** (the Harness) used by AI agents to manage the SAP environment.

## System Architecture & Operating Principles

The system operates as a bridge between modern AI interfaces and SAP environments:

1.  **Agent Tier**: AI agents (Claude Code CLI, Antigravity, Gemini CLI) act as the "brain," orchestrating tasks based on predefined Harness roles.
2.  **Protocol Tier**: Standardized protocols (such as Model Context Protocol) are used to safely expose SAP ADT (ABAP Development Tools) capabilities to the agents.
3.  **SAP Tier**: Direct interaction with SAP systems via REST APIs and WebSockets for stateful operations like debugging, query execution, and object management.

## Agent Framework (AGENTS.md)

Agents are categorized into two strategic groups, operating under a **PM-led Governance** model:

### 🏢 Business Group
- **👑 Global PM**: The **single point of entry** for all requests. Orchestrates agents and ensures doc/git consistency.
- **📦 Functional Analysts (SD, LE, PP, MM, FI, CO)**: Activate on trigger keywords, query SAP directly via read-only MCP tools, produce structured PRDs with Acceptance Criteria, and hand off to the Technical Group. Each analyst loads a dedicated `docs/sap-erp-module/<module>-analyst.md` for deep domain knowledge.

### 🛠️ Technical Group
- **🏗️ Architect & 🗄️ DBA**: Design system blueprints and optimized data models (CDS Views).
- **💻 ABAP Developer**: Executes precision coding and refactoring through the protocol layer.
- **🧪 QA Engineer**: Ensures stability through Unit Testing and debugging.
- **🔌 Interface Expert**: Manages OData, RFC, and external API integrations.
- **🎨 Fiori Developer / UX Designer**: Designs modern, premium interfaces following SAP Fiori Guidelines.
- **📑 Form Expert**: Specializes in document output design (Smart Forms, Adobe Forms).
- **🤖 SAP GUI Scripting Expert**: Automates legacy workflows and manual transactions.
- **🚀 DevOps/Admin**: Handles infrastructure and deployment.
- **🔍 Intelligence Investigator**: Explores codebase patterns and extracts knowledge.

## File Structure

### ⚖️ Governance & Rules
| File | Purpose |
| :--- | :--- |
| **`AGENTS.md`** | Agent roles, trigger keywords, allowed tools, and handoff rules. |
| **`docs/context.md`** | **Shared** project context for all AI tools (scripts, codebase map, ABAP rules). |
| **`docs/skill.md`** | High-level AI behavioral instructions and ABAP development capabilities. |
| **`docs/security.md`** | Sanitization policy and pre-commit scan rules. |

### 🧠 Intelligence & Memory
| Directory/File | Purpose |
| :--- | :--- |
| **`memory/`** | Date-based development history. See `memory/MEMORY.md` for index. |
| **`docs/sap-erp-module/`** | Module analyst deep-knowledge files (SD, MM, FI, etc.). |
| **`docs/subagents/`** | Specialized subagent prompt templates (investigator, analyst, etc.). |

### 🛠️ Development & Ops
| Directory/File | Purpose |
| :--- | :--- |
| **`scripts/`** | Cross-platform automation: `vsp-task.*`, `vsp-sync.*`, `git-sync.*`, `vsp-audit.*`. |
| **`docs/task-template.md`** | Handoff template for cross-agent collaboration. |
| **`docs/testing-guidelines.md`**| QA standards for ABAP Unit and TEST-SEAMS. |
| **`docs/mcp_usage.md`** | Technical reference for MCP tool usage and error handling. |

### ⚙️ Configuration
| File | Purpose |
| :--- | :--- |
| **`CLAUDE.md`** | Claude Code CLI-specific config and hooks behavior. |
| **`GEMINI.md`** | Gemini CLI-specific overrides. |
| **`vsp` / `vsp.exe`** | The MCP server binary for SAP ADT integration. |

## Operational Workflow (Harness Advanced Governance)

1.  **Triage (PM)** — Classify request type; identify package and affected objects.
2.  **Agenda** — Gather context; select agents; run `vsp-task` to initialize.
3.  **Execution Design** — Define tool order (read tasks parallel, write tasks serial).
4.  **Parallel Execution** — Independent read tasks run as subagents; write operations remain serial.
5.  **Sync & Report** — Append to memory, then run `vsp-sync` to commit.

---
> [!TIP]
> **New to this project?** Start with [docs/setup-guide.md](docs/setup-guide.md) — step-by-step environment setup (includes MCP connectivity, abapGit, and AI agent configuration).

---
*Maintained by the Harness Engineering Team | Last Updated: 2026-05-05*
