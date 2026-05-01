# ABAP Development Skills (vsp)

This file defines the ABAP development capabilities and optimized workflow patterns for Claude Code and AI agents.

## Core Capabilities
- **Surgical Edits**: Use `EditSource` for changes under 50 lines to ensure syntax safety and atomicity.
- **Context Awareness**: Use `vsp source context` when analyzing large classes to save tokens and focus on structural understanding.
- **Graph Analysis**: Perform impact analysis via `AnalyzeCallGraph` before refactoring.
- **SQL Accuracy**: Adhere to ABAP SQL standards (e.g., use `DESCENDING` instead of `DESC`) when using `RunQuery`.

## Gemini CLI Skills (AI-Native Capabilities)
- **Role-Based Execution**: Ability to switch between Business (Analysts) and Technical (Developer/DBA) roles defined in `AGENTS.md`.
- **Project Memory Management**: Automatically maintaining `MEMORY.md` to ensure a consistent development history across sessions.
- **Multi-Agent Coordination**: Orchestrating complex tasks by delegating long-running research to `browser_subagent`.
- **Advanced Diagnostics**: Using `vsp health` for architecture validation and `vsp slim` for context optimization.

## Custom Commands (Claude Code Skills)
- `/celebrate`: Displays a celebratory message upon successful completion of complex tasks or milestones.
- `/debug`: Starts a stateful debugging session based on WebSocket. (Requires ZADT_VSP installation)



## Best Practices
- Always execute `SyntaxCheck` after any modification to verify quality.
- Focus operations primarily within `Z*` and `$TMP` packages.
- Parameter references and tool boundaries: see [MCP_USAGE.md](MCP_USAGE.md).

---
*Last Updated: 2026-05-01*
