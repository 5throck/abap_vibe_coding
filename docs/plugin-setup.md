# Claude Code Plugin Setup Guide

This guide describes how to install and use the **ABAP Vibe Coding Plugin** in a consumer repository. 

> [!NOTE]
> This plugin extends Claude Code CLI with dedicated SAP ABAP workflows, automated triage, post-write quality gates, and vsp-sync audit and commit automation.

---

## 1. Prerequisites

- **Claude Code CLI** installed (`npm install -g @anthropic-ai/claude-code`)
- **vsp (MCP Server)** binary placed at `C:\Users\<your-username>\abap\vsp.exe` (Windows) or `~/abap/vsp` (macOS/Linux)
- **SAP Connection Details** configured in a `.env` file at the root of your consumer repository (see `.env.sample` in the plugin root)

---

## 2. Register the Plugin

Claude Code automatically discovers plugins placed in the `.claude/plugins` folder under your user home directory, or registered via the project-level `.claude/settings.json` file.

To register this plugin for a specific repository:

### 2-A. Add the plugin folder
Copy this plugin repository into your consumer project's path or install it globally under:
- **Windows**: `%USERPROFILE%\.claude\plugins\abap-vibe-coding`
- **macOS/Linux**: `~/.claude/plugins/abap-vibe-coding`

### 2-B. Configure permissions in `.claude/settings.json`
Create a `.claude/settings.json` file in the root of your consumer repository to approve the tools and set up automated hooks:

```json
{
  "permissions": {
    "allow": [
      "mcp__abap__GetSource",
      "mcp__abap__SearchObject",
      "mcp__abap__GrepObjects",
      "mcp__abap__GrepPackages",
      "mcp__abap__FindDefinition",
      "mcp__abap__FindReferences",
      "mcp__abap__GetTableContents",
      "mcp__abap__RunQuery",
      "mcp__abap__GetCDSDependencies",
      "mcp__abap__SyntaxCheck",
      "mcp__abap__RunUnitTests",
      "mcp__abap-docs__*",
      "mcp__sap-docs__*"
    ]
  },
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$CLAUDE_PLUGIN_ROOT/scripts/sync-md.sh\" 2>/dev/null || pwsh -NonInteractive -File \"$CLAUDE_PLUGIN_ROOT/scripts/sync-md.ps1\" 2>/dev/null || powershell -NonInteractive -File \"$CLAUDE_PLUGIN_ROOT/scripts/sync-md.ps1\"",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

---

## 3. Environment Variables (`.env`)

Create a `.env` file at the root of your consumer repository to define SAP connection credentials:

```bash
SAP_URL=http://vhcalnplci:50000
SAP_USER=DEVELOPER
SAP_PASSWORD=your-sap-password
SAP_CLIENT=001
SAP_LANGUAGE=EN
VSP_MODE=hyperfocused
VSP_ALLOWED_PACKAGES=Z*,$TMP
```

---

## 4. Custom Commands Reference

Once successfully registered, you can use these premium slash-commands inside your Claude Code session:

| Command | Usage | Description |
|---------|-------|-------------|
| `/triage "<request>"` | `/triage "Create a new flight flight agency report"` | Automatically scans keywords, creates a task file at `scratch/tasks/`, and outputs a parallel Phase 1 dispatch block. |
| `/post-write <ObjectName>` | `/post-write ZCL_FLIGHT_REPORT` | Runs the mandatory ABAP quality gate chain: `SyntaxCheck` -> `RunUnitTests` -> `RunATCCheck`. |
| `/sync "<commit message>"` | `/sync "feat: add flight validation"` | Runs documentation audit, synchronizes memory indexes, and commits staged files cleanly. |

---

## 5. Main Reference Documentation

For detailed guidelines regarding the complete Harness Governance, Agent role responsibilities, Fiori/BSP tool sets, and troubleshooting:

- **Harness Engineering Core**: [abap_vibe_coding GitHub Repository](https://github.com/5throck/abap_vibe_coding)
- **Governance & Roles**: [AGENTS.md](https://github.com/5throck/abap_vibe_coding/blob/main/AGENTS.md)
- **Tool Boundaries**: [docs/tooling-matrix.md](https://github.com/5throck/abap_vibe_coding/blob/main/docs/tooling-matrix.md)
- **MCP Server Details**: [docs/mcp_usage.md](https://github.com/5throck/abap_vibe_coding/blob/main/docs/mcp_usage.md)

---
*Last Updated: 2026-05-19*
