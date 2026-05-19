# Harness Engineering for SAP ABAP

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Contributing](https://img.shields.io/badge/contributions-welcome-brightgreen.svg)](CONTRIBUTING.md)

## Project Mission
This project aims to revolutionize SAP ABAP development by establishing a robust **Harness Engineering** framework. It leverages AI agents to automate, standardize, and optimize the entire development lifecycle - from business requirements analysis to system deployment.

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

AI agents operate under a **PM-led Governance** model, categorized into two strategic groups:

- **🏢 Business Group**: PM and Module Analysts (SD, MM, FI, etc.) who translate business needs into technical requirements.
- **🛠️ Technical Group**: Architects, Developers, DBA, QA, and specialized experts (Fiori, Forms, GUI, Interfaces) who implement and verify the solution.

For detailed roles, trigger keywords, and handoff protocols, see [AGENTS.md](AGENTS.md).

## Core Documentation

| File | Purpose |
| :--- | :--- |
| **[AGENTS.md](AGENTS.md)** | Roles, collaborative workflow, and subagent dispatch protocols. |
| **[docs/context.md](docs/context.md)** | **Shared** project context: build commands, codebase map, and development rules. |
| **[skills/abap-dev/SKILL.md](skills/abap-dev/SKILL.md)** | Specialized AI skills (BAPI explorer, memory intelligence) and QA chains. |
| **[docs/setup-guide.md](docs/setup-guide.md)** | Step-by-step environment setup (MCP, SAP, abapGit). |
| **[memory/MEMORY.md](memory/MEMORY.md)** | Index of development history and architectural decisions. |

## Operational Workflow

The project follows a standardized **6-step Harness Engineering workflow**:
1. **Triage & Research** -> 2. **Biz Analysis** -> 3. **Governance Approval** -> 4. **Tech Design** -> 5. **Implementation & Verification** -> 6. **Finalization**.

For the detailed execution sequence, see [AGENTS.md § Collaborative Workflow](AGENTS.md#agent-coordination-workflow-harness-advanced).

---
> [!TIP]
> **New to this project?** Start with [docs/setup-guide.md](docs/setup-guide.md) - step-by-step environment setup (includes MCP connectivity, abapGit, and AI agent configuration).

---
## License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL v3)**.
See [LICENSE](LICENSE) for details. Commercial licensing is available - see [CONTRIBUTING.md](CONTRIBUTING.md).

---

*Maintained by the Harness Engineering Team | Last Updated: 2026-05-19*
