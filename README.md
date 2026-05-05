# Harness Engineering for SAP ABAP

## Project Mission
This project provides a Harness Engineering framework for SAP ABAP development. It uses AI agents to help with requirements analysis, technical design, implementation, testing, and synchronization of project knowledge.

## What Lives Here
- `AGENTS.md`: roles, responsibilities, and orchestration rules
- `docs/CONTEXT.md`: shared project context for all AI tools
- `docs/SKILL.md`: ABAP workflow rules and tool guidance
- `docs/MCP_USAGE.md`: MCP tool reference and ABAP SQL notes
- `memory/`: date-based development notes and decisions
- `docs/SAP ERP Module/`: analyst context files by SAP module
- `docs/subagents/`: subagent prompt templates
- `scripts/`: automation scripts for task init, sync, and audit

## Operating Model
1. Triage the request.
2. Gather context and select the right agents.
3. Plan the execution path.
4. Run read tasks in parallel and write tasks serially.
5. Log important decisions in memory and commit the result.

## Start Here
If you are new to the project, read:
1. `docs/setup-guide.md`
2. `docs/CONTEXT.md`
3. `AGENTS.md`
4. `docs/SKILL.md`

## Notes
- All `.abap` scratch files belong in `scratch/`.
- Shared project rules are documented in English.

*Maintained by the Harness Engineering Team | Last Updated: 2026-05-05*
