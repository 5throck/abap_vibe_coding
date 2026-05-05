# VSP Harness Engineering Setup Guide

> Target audience: developers setting up this ABAP AI environment on a new machine.

## 1. Prerequisites
- SAP system reachable over HTTP or HTTPS
- Git
- Node.js 18 or later
- Claude Code if you plan to use the Claude workflow
- PowerShell 7 on Windows, or Bash on macOS/Linux

## 2. Clone the Repository
Clone the repository into your home directory and open the project root.

## 3. Configure VSP
- Place the `vsp` binary in the project root.
- Create `.env` with SAP connection details.
- Create `.mcp.json` with the `abap`, `abap-docs`, and `sap-docs` servers.

## 4. Configure AI Tools
- Claude Code uses `.claude/settings.json` and `.claude/settings.local.json`.
- Gemini CLI uses `.gemini/settings.json`.
- Antigravity uses its user-level settings file.

## 5. Verify the Setup
Run these checks in order:
1. `./vsp system info`
2. Confirm the `abap` MCP server appears in your AI tool
3. Run a simple SAP query
4. Run `SyntaxCheck` on a small object

## 6. Troubleshooting
- If the server cannot connect, confirm SAP is running and credentials are correct.
- If a query fails, check ABAP SQL syntax in `docs/MCP_USAGE.md`.
- If hooks do not run, review the tool-specific settings and the post-edit audit script.

## 7. Onboarding Checklist
- Read `README.md`
- Read `docs/CONTEXT.md`
- Read `AGENTS.md`
- Read `docs/SKILL.md`
- Review `docs/MCP_USAGE.md`

*Document version: 1.6 | Last Updated: 2026-05-05*
