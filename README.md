# VSP Harness Engineering for ABAP

## Project Mission
This project aims to revolutionize SAP ABAP development by establishing a **Harness Engineering** framework. It leverages AI agents and the **vsp** MCP server to automate and optimize the entire development lifecycle—from business requirements analysis to system deployment.

## System Architecture & Operating Principles

The system operates as a bridge between Modern AI interfaces and legacy SAP environments:

1.  **Agent Tier**: AI agents (Claude Code CLI, Antigravity, Gemini CLI) act as the "brain," orchestrating tasks based on predefined roles.
2.  **MCP Tier (vsp)**: The **[vsp](https://github.com/oisee/vibing-steampunk)** server provides a standard protocol (Model Context Protocol) to expose SAP ADT (ABAP Development Tools) capabilities to AI.
3.  **SAP Tier**: Interaction with SAP systems via REST APIs and WebSocket (ZADT_VSP) for stateful operations like debugging and RFC execution.

### Harness Engineering Concept
Harness Engineering is a methodology where specialized AI agents collaborate within a structured "harness" (environment). This project follows a **Document-First** approach. ABAP source code resides directly within the SAP system, while this repository tracks the **intelligence, logic, and architectural framework** (Harness) used by AI agents to manage the SAP environment.

## Agent Framework (AGENTS.md)

Agents are categorized into two strategic groups, operating under a **PM-led Governance** model:

### 🏢 Business Group
- **👑 Global PM**: The **single point of entry** for all requests. Orchestrates agents and ensures doc/git consistency.
- **📦 Functional Analysts (SD, LE, PP, MM, FI, CO)**: Activate on trigger keywords, query SAP directly via read-only MCP tools, produce structured PRDs with Acceptance Criteria, and hand off to the Technical Group. Each analyst loads a dedicated `contexts/<module>-analyst.md` for deep domain knowledge.

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
| **`contexts/`** | Module analyst deep-knowledge files (sd, le, pp, mm, fi, co). Loaded at agent activation. |
| **`docs/task-template.md`** | Handoff template — copy to `scratch/` at task start; each agent fills their section. |
| **`docs/testing-guidelines.md`**| QA standards for ABAP Unit and TEST-SEAMS. |
| **`docs/subagents/`** | Subagent prompt templates: `sap-investigator`, `read-only-analyst`, `schema-inspector`. |
| **`scripts/`** | Cross-platform automation: `vsp-task.*`, `vsp-sync.*`, `git-sync.*`. |
| **`AGENTS.md`** | Agent roles, trigger keywords, allowed tools, output format, and handoff rules. |
| **`CONTEXT.md`** | **Shared** project context for all AI tools: scripts, codebase map, ABAP rules, workflow. |
| **`CLAUDE.md`** | Claude Code CLI-specific config: session start rules, MCP config note, hooks behavior. |
| **`GEMINI.md`** | Gemini CLI-specific overrides (hyperfocused mode config, skill additions). |
| **`SKILL.md`** | High-level AI behavioral instructions and ABAP development capabilities. |
| **`SECURITY.md`** | Sanitization policy and pre-commit scan rules for tracked files. |
| **`MCP_USAGE.md`** | Technical reference for MCP tool usage, tool boundaries, and error handling. |
| **`vsp.exe`** | [vsp](https://github.com/oisee/vibing-steampunk) — Go-native MCP server for SAP ADT integration. |

## Operational Workflow (Harness Advanced Governance)

1.  **Triage (PM)** — Classify request type; identify package and affected objects.
2.  **Agenda** — Gather context; select agents; run `./scripts/vsp-task.sh` to initialize.
3.  **Execution Design** — Define tool order (read tasks parallel, write tasks serial).
4.  **Parallel Execution** — Independent read tasks run as subagents; write operations remain serial.
5.  **Sync & Report** — Append to `memory/YYYY-MM-DD.md`, then run `./scripts/vsp-sync.sh` to commit.

---
> [!TIP]
> **New to this project?** Start with [docs/setup-guide.md](docs/setup-guide.md) — step-by-step environment setup (includes vsp, abapGit, and AI agent configuration).

---
*Maintained by the Harness Engineering Team | Last Updated: 2026-05-04*
