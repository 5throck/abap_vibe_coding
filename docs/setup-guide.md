# VSP Harness Engineering — Setup Guide

> **Target audience**: Developer who wants to replicate this ABAP AI development environment on a new PC or server.
> **Estimated setup time**: 30–60 minutes (excluding SAP system install).

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [SAP System Setup](#2-sap-system-setup)
3. [Install Core Tools](#3-install-core-tools)
4. [Clone the Repository](#4-clone-the-repository)
5. [Configure vsp (MCP Server)](#5-configure-vsp-mcp-server)
6. [Configure Claude Code (CLI + Desktop App)](#6-configure-claude-code-cli--desktop-app)
7. [Configure Antigravity (Optional)](#7-configure-antigravity-optional)
8. [Configure Gemini CLI (Optional)](#8-configure-gemini-cli-optional)
9. [Install VSP WebSocket Infrastructure on SAP](#9-install-vsp-websocket-infrastructure-on-sap)
10. [Install abapGit on SAP](#10-install-abapgit-on-sap)
11. [Verify the Setup](#11-verify-the-setup)
12. [Troubleshooting](#12-troubleshooting)
13. [Team Onboarding Checklist](#13-team-onboarding-checklist)

---

## 1. Prerequisites

### 1-A. Hardware & OS

| Item | Minimum | Recommended |
|------|---------|-------------|
| OS | Windows 10 64-bit **or** macOS 12 (Monterey) | Windows 11 / macOS 14 (Sonoma) |
| RAM | 8 GB | 16 GB |
| Disk | 10 GB free | 20 GB free (if running SAP locally) |
| Network | SAP system reachable via HTTP | Same network segment as SAP |

> **Path convention used in this guide**:
> - Windows: `%USERPROFILE%\abap` (e.g. `C:\Users\john\abap`)
> - macOS/Linux: `~/abap`
>
> On Windows, `%USERPROFILE%` resolves to your home directory. In Git Bash you can use `~` as an equivalent shorthand.
> Both platforms use the same relative structure — substitute your own username wherever `<your-username>` appears.

### 1-B. Accounts Required

| Account | Purpose | Where to get |
|---------|---------|--------------|
| GitHub account | Clone/push repository | https://github.com |
| Anthropic account | Claude Code CLI + Antigravity extension | https://claude.ai |
| Google account | Gemini CLI (optional) | https://gemini.google.com |
| SAP user on target system | ADT connection | SAP Basis team or SAP trial |

### 1-C. Required Permissions on Target SAP System

The SAP user configured in `.env` needs:
- Role `SAP_ALL` or equivalent (for trial systems)
- For production: roles `S_ADT_WB_ACCESS` + `S_DEVELOP` + `S_CTS_ADMI`
- WebSocket debug (ZADT_VSP): additional `S_BTCH_ADM` recommended

---

## 2. SAP System Setup

### Option A — SAP NetWeaver Trial (NPL) — Local

Recommended for developers without access to a corporate SAP system.

**Step 1**: Download SAP NetWeaver AS ABAP Developer Edition
- URL: https://developers.sap.com/trials-downloads.html
- Search: "SAP NetWeaver AS ABAP Developer Edition 7.52 SP04"
- File size: ~33 GB

**Step 2**: Install following SAP's official guide
```
Default values used in this project:
  System ID (SID): NPL
  Client:          001
  Host:            vhcalnplci  (add to your hosts file — see Step 3)
  HTTP port:       50000
  HTTPS port:      44300
  ABAP user:       DEVELOPER
  Password:        (set during install)
```

**Step 3**: Add hosts entry

**Windows** (run Notepad as Administrator):
```
notepad C:\Windows\System32\drivers\etc\hosts
```

**macOS/Linux** (terminal):
```bash
sudo nano /etc/hosts
```

In both cases, add the line:
```
127.0.0.1   vhcalnplci
```

**Step 4**: Verify SAP is running
```
http://vhcalnplci:50000/sap/bc/adt/
```
Should return an XML or JSON response (not a connection error).

---

### Option B — Corporate SAP System

Use your corporate SAP development system. You will need:
- HTTP(S) URL of the ADT endpoint
- User with development access
- Client number

No additional installation needed. Skip to [Section 3](#3-install-core-tools).

---

## 3. Install Core Tools

### 3-A. Git

**Windows**:
```
https://git-scm.com/download/win
```
Accept all defaults. This installs **Git Bash**, which supports `~` as your home directory shortcut and is used for all Windows shell commands in this guide.

**macOS**:
```bash
# Option 1: Xcode Command Line Tools (includes git)
xcode-select --install

# Option 2: Homebrew
brew install git
```

Verify (both platforms):
```bash
git --version
# Expected: git version 2.x.x
```

Configure your identity (both platforms):
```bash
git config --global user.name  "Your Name"
git config --global user.email "you@example.com"
```

### 3-B. Claude Code CLI

**Step 1**: Install Node.js 18+

**Windows**: Download from https://nodejs.org/en/download

**macOS**:
```bash
# Option 1: Official installer at https://nodejs.org/en/download
# Option 2: Homebrew
brew install node
```

Verify:
```bash
node --version
# Expected: v18.x.x or higher
```

**Step 2**: Install Claude Code (both platforms)
```bash
npm install -g @anthropic-ai/claude-code
```

**Step 3**: Authenticate (both platforms)
```bash
claude
```
Follow the browser OAuth flow to link your Anthropic account.

**Step 4**: Verify (both platforms)
```bash
claude --version
# Expected: claude/x.x.x
```

### 3-C. Gemini CLI (Optional)

Only needed if you want to use Gemini as an AI agent alongside Claude Code and Antigravity.

**Both platforms**:
```bash
npm install -g @google/gemini-cli
gemini auth login
gemini --version
```

### 3-D. Automation Scripts (Bash & PowerShell)

This project uses automation scripts for task initialization and repository synchronization.

- **Windows**: Requires **PowerShell 7+** (pwsh).
  - Download: [PowerShell Releases](https://github.com/PowerShell/PowerShell/releases/latest)
- **macOS/Linux**: Requires **Bash** (v4+) and standard utilities (`awk`, `sed`).

Verify on Windows:
```bash
pwsh --version
# Expected: PowerShell 7.x.x
```

---

## 4. Clone the Repository

**Windows** (Git Bash):
```bash
# Clone directly into your home folder
git clone https://github.com/<your-org>/abap_vibe_coding.git ~/abap
cd ~/abap
```

> **Windows tip**: `~` in Git Bash resolves to `%USERPROFILE%` (e.g. `C:\Users\john`).
> You can verify with `echo $HOME`.

**macOS/Linux**:
```bash
# Clone directly into your home folder
git clone https://github.com/<your-org>/abap_vibe_coding.git ~/abap
cd ~/abap
```

> **Note**: `vsp` binary is in `.gitignore` and is NOT in the repository.
> You must download it separately (see Section 5).

### Resulting directory structure after clone

**Windows** (`%USERPROFILE%\abap\`):
```
%USERPROFILE%\abap\
├── .claude\
│   ├── settings.json          ← Claude Code permissions + hooks
│   └── settings.local.json    ← Local extended permissions (create manually)
├── .gemini\
│   └── settings.json          ← Gemini CLI config (create manually)
├── contexts\                  ← SAP module analyst deep-knowledge files
├── docs\
│   ├── subagents\             ← Subagent prompt templates
│   └── task-template.md
├── memory\                    ← Date-stamped development logs
├── scratch\                   ← Temporary ABAP files
├── scripts\
│   ├── vsp-task.ps1           ← Initialize new tasks (Windows)
│   ├── vsp-task.sh            ← Initialize new tasks (Bash)
│   ├── vsp-sync.ps1           ← Sync memory & Git (Windows)
│   ├── vsp-sync.sh            ← Sync memory & Git (Bash)
│   ├── git-sync.ps1
│   └── sync-md.ps1
├── .env                       ← SAP credentials (create manually — gitignored)
├── .mcp.json                  ← MCP server config for Claude Code CLI (create manually — gitignored)
├── .gitignore
├── AGENTS.md
├── CLAUDE.md                  ← Claude Code CLI-specific config
├── GEMINI.md                  ← Gemini CLI-specific overrides
├── README.md
├── docs/
│   ├── CONTEXT.md             ← Shared project context (all AI tools)
│   ├── MCP_USAGE.md
│   ├── SECURITY.md
│   ├── SKILL.md
│   └── setup-guide.md
└── vsp.exe                    ← Download separately (gitignored)
```

> **Antigravity MCP config** is stored in the user-level VS Code settings — not in this repo.
> See [Section 7](#7-configure-antigravity-optional) for details.

**macOS/Linux** (`~/abap/`):
```
~/abap/
├── .claude/
│   ├── settings.json          ← Claude Code permissions + hooks
│   └── settings.local.json    ← Local extended permissions (create manually)
├── .gemini/
│   └── settings.json          ← Gemini CLI config (create manually)
├── docs/SAP ERP Module/      ← SAP module analyst deep-knowledge files
├── docs/
│   ├── subagents/             ← Subagent prompt templates
│   └── task-template.md
├── memory/                    ← Date-stamped development logs
├── scratch/                   ← Temporary ABAP files
├── scripts/
│   ├── vsp-task.sh            ← Initialize new tasks
│   ├── vsp-sync.sh            ← Sync memory & Git
│   ├── git-sync.sh            ← bash alternative for macOS
│   ├── git-sync.ps1
│   └── sync-md.ps1
├── .env                       ← SAP credentials (create manually — gitignored)
├── .mcp.json                  ← MCP server config for Claude Code CLI (create manually — gitignored)
├── .gitignore
├── AGENTS.md
├── CLAUDE.md                  ← Claude Code CLI-specific config
├── GEMINI.md                  ← Gemini CLI-specific overrides
├── README.md
├── docs/
│   ├── CONTEXT.md             ← Shared project context (all AI tools)
│   ├── MCP_USAGE.md
│   ├── SECURITY.md
│   ├── SKILL.md
│   └── setup-guide.md
└── vsp                        ← Download separately (gitignored)
```

---

## 5. Configure vsp (MCP Server)

**vsp** ([github.com/oisee/vibing-steampunk](https://github.com/oisee/vibing-steampunk)) is a Go-native MCP server that exposes SAP ADT (ABAP Development Tools) capabilities to AI agents via the Model Context Protocol. It handles authentication, CSRF token management, session handling, and translates AI tool calls into SAP REST API operations — allowing Claude and Gemini to read, write, and debug ABAP objects without direct SAP GUI access.

### 5-A. Download the vsp binary

```
https://github.com/5throck/vsp/releases/latest
```

**Windows** (Git Bash): Download `vsp_windows_amd64.exe`, then:
```bash
mv ~/Downloads/vsp_windows_amd64.exe ~/abap/vsp.exe
```

**macOS (Apple Silicon)**:
```bash
mv ~/Downloads/vsp_darwin_arm64 ~/abap/vsp
chmod +x ~/abap/vsp
```

**macOS (Intel)**:
```bash
mv ~/Downloads/vsp_darwin_amd64 ~/abap/vsp
chmod +x ~/abap/vsp
```

**Linux**:
```bash
mv ~/Downloads/vsp_linux_amd64 ~/abap/vsp
chmod +x ~/abap/vsp
```

### 5-B. Create .env

**Windows** — create `%USERPROFILE%\abap\.env`

**macOS/Linux** — create `~/abap/.env`

**This file must never be committed to git.**

```bash
# .env
# SAP System Connection
SAP_URL=http://<YOUR_SAP_HOST>:<PORT>
SAP_USER=<YOUR_USERNAME>
SAP_PASSWORD=<YOUR_PASSWORD>
SAP_CLIENT=<CLIENT_NUMBER>
SAP_LANGUAGE=EN

# VSP Mode
VSP_MODE=hyperfocused
VSP_ALLOWED_PACKAGES=Z*,$TMP
```

**Example for NPL trial**:
```bash
SAP_URL=http://vhcalnplci:50000
SAP_USER=DEVELOPER
SAP_PASSWORD=<YOUR_PASSWORD>
SAP_CLIENT=001
SAP_LANGUAGE=EN
VSP_MODE=hyperfocused
VSP_ALLOWED_PACKAGES=Z*,$TMP
```

**Example for corporate system**:
```bash
SAP_URL=https://your-sap-dev.company.com:44300
SAP_USER=JSMITH
SAP_PASSWORD=MySecurePass123
SAP_CLIENT=100
SAP_LANGUAGE=EN
VSP_MODE=focused
VSP_ALLOWED_PACKAGES=Z*,Y*,$TMP
```

> **Security**: `.env` is in `.gitignore`. Verify it is never staged:
> ```bash
> git check-ignore -v .env
> # Expected: .gitignore:2:.env    .env
> ```

### 5-C. Test vsp connection

**Windows** (Git Bash):
```bash
cd ~/abap
./vsp system info
```

**macOS/Linux**:
```bash
cd ~/abap
./vsp system info
```

Expected output:
```
System: NPL
Client: 001
User:   DEVELOPER
Release: 757
```

If you get an error, check:
- SAP is running (`http://vhcalnplci:50000` opens in browser)
- Credentials in `.env` are correct
- Port is not blocked by firewall

### 5-D. Create .mcp.json

**Windows** — create `%USERPROFILE%\abap\.mcp.json`:

```json
{
  "mcpServers": {
    "abap": {
      "command": "./vsp",
      "args": ["--mode", "hyperfocused"],
      "env": {
        "VSP_MODE": "hyperfocused",
        "VSP_ALLOWED_PACKAGES": "Z*,$TMP,$ZADT_VSP,$VSP_ADT",
        "VSP_FEATURE_ABAPGIT": "on"
      }
    },
    "abap-docs": {
      "type": "http",
      "url": "https://mcp-abap.marianzeis.de/mcp"
    },
    "sap-docs": {
      "type": "http",
      "url": "https://mcp-sap-docs.marianzeis.de/mcp"
    }
  }
}
```

**macOS/Linux** — create `~/abap/.mcp.json`:
```json
{
  "mcpServers": {
    "abap": {
      "command": "./vsp",
      "args": ["--mode", "hyperfocused"],
      "env": {
        "VSP_MODE": "hyperfocused",
        "VSP_ALLOWED_PACKAGES": "Z*,$TMP,$ZADT_VSP,$VSP_ADT",
        "VSP_FEATURE_ABAPGIT": "on"
      }
    },
    "abap-docs": {
      "type": "http",
      "url": "https://mcp-abap.marianzeis.de/mcp"
    },
    "sap-docs": {
      "type": "http",
      "url": "https://mcp-sap-docs.marianzeis.de/mcp"
    }
  }
}
```

> **`abap-docs`**: ABAP keyword and API reference (marianzeis.de).
> **`sap-docs`**: SAP Help Portal documentation search.
> **Expert mode** (more tools, use for debugging or advanced operations):
> Change `"VSP_MODE": "focused"` — gives access to 45 tools instead of 1.

---

## 6. Configure Claude Code

### 6-A. Verify .claude/settings.json (already in repo)

This file is committed and shared. Current content:

```json
{
  "permissions": {
    "allow": [
      "mcp__Claude_Preview__preview_console_logs",
      "mcp__Claude_Preview__preview_screenshot",
      "mcp__Claude_Preview__preview_snapshot",
      "mcp__Claude_Preview__preview_logs",
      "mcp__Claude_Preview__preview_list",
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
            "command": "bash scripts/sync-md.sh"
          }
        ]
      }
    ]
  }
}
```

This sets up:
- **Read-only MCP tools auto-approved** (GetSource, RunQuery, GrepPackages, etc.)
- **`abap-docs` / `sap-docs` tools auto-approved** (wildcard covers all tools from each server)
- **Claude Preview tools auto-approved** (screenshot, snapshot, logs)
- **PostToolUse hooks**: runs `sync-md.sh` after every Write/Edit (cross-platform wrapper — works on Windows Git Bash, macOS, and Linux)

No changes needed to this file — it is already in the repo.

### 6-B. Create .claude/settings.local.json (per-developer)

This file grants additional permissions for your local machine. It is **not committed to git**.

**Windows** — create `%USERPROFILE%\abap\.claude\settings.local.json`:

```json
{
  "permissions": {
    "allow": [
      "mcp__abap__GetTable",
      "mcp__abap__WriteSource",
      "mcp__abap__EditSource",
      "mcp__abap__GetConnectionInfo",
      "mcp__abap__GetSystemInfo",
      "mcp__abap__RunReport",
      "mcp__abap__InstallZADTVSP",
      "mcp__abap__InstallAbapGit",
      "mcp__abap__GetInactiveObjects",
      "mcp__abap__GetPackage",
      "Bash(git init *)",
      "Bash(git branch *)",
      "Bash(git add *)",
      "Bash(git commit -m '*)",
      "Bash(git remote *)",
      "Bash(git push *)",
      "Bash(git credential *)",
      "Bash(git check-ignore *)",
      "Bash(powershell -Command *)",
      "WebSearch",
      "WebFetch(domain:github.com)",
      "WebFetch(domain:raw.githubusercontent.com)"
    ]
  },
  "enableAllProjectMcpServers": true,
  "enabledMcpjsonServers": [
    "abap",
    "abap-docs",
    "sap-docs"
  ]
}
```

**macOS/Linux** — create `~/abap/.claude/settings.local.json`:

```json
{
  "permissions": {
    "allow": [
      "mcp__abap__GetTable",
      "mcp__abap__WriteSource",
      "mcp__abap__EditSource",
      "mcp__abap__GetConnectionInfo",
      "mcp__abap__GetSystemInfo",
      "mcp__abap__RunReport",
      "mcp__abap__InstallZADTVSP",
      "mcp__abap__InstallAbapGit",
      "mcp__abap__GetInactiveObjects",
      "mcp__abap__GetPackage",
      "Bash(git init *)",
      "Bash(git branch *)",
      "Bash(git add *)",
      "Bash(git commit -m '*)",
      "Bash(git remote *)",
      "Bash(git push *)",
      "Bash(git credential *)",
      "Bash(git check-ignore *)",
      "WebSearch",
      "WebFetch(domain:github.com)",
      "WebFetch(domain:raw.githubusercontent.com)"
    ]
  },
  "enableAllProjectMcpServers": true,
  "enabledMcpjsonServers": [
    "abap",
    "abap-docs",
    "sap-docs"
  ]
}
```

> **Note (macOS)**: `"Bash(powershell -Command *)"` is omitted.

> **Minimal setup (read-only first)**: Start with only the `mcp__abap__*` entries.
> Add `WriteSource` and `EditSource` only after verifying the connection works.

### 6-C. Verify Claude Code sees the MCP server

**Windows** (Git Bash):
```bash
cd ~/abap
claude
```

**macOS/Linux**:
```bash
cd ~/abap
claude
```

In the Claude session, run:
```
/mcp
```

Expected output:
```
Connected MCP servers:
  abap      — vsp (hyperfocused mode) · 1 tool (sap_execute)
  abap-docs — ABAP keyword & API reference · N tools
  sap-docs  — SAP Help Portal search · N tools
```

If `abap` does not appear:
- Confirm `.mcp.json` exists in the project root
- Confirm the path in `.mcp.json` matches your actual username
- Confirm the `vsp` binary is in the project root (and is executable on macOS/Linux)
- Restart Claude Code

### 6-D. Test a live SAP query

Inside the Claude session:
```
Run this query: SELECT * FROM t000
```

Expected: a table showing your SAP client(s).

### 6-E. Claude Code Desktop App (Windows / macOS only)

The Desktop App shares all configuration with the CLI — `.mcp.json` and `.claude/settings.json` are loaded automatically without any additional setup.

**Download**: https://claude.ai/download

**What's the same as CLI**:
- MCP servers from `.mcp.json` are loaded automatically
- `.claude/settings.json` and `.claude/settings.local.json` are respected
- All skills, slash commands, and custom agents work identically

**Key differences from CLI**:

| Feature | CLI | Desktop App |
|---------|:---:|:-----------:|
| Platform | Windows / macOS / Linux | Windows / macOS only |
| PostToolUse hooks | ✅ fires automatically | ⚠️ does **not** fire (known issue) |
| Visual diff / inline review | ❌ | ✅ |
| Parallel sessions (worktrees) | CLI flag | ✅ automatic |
| PR monitoring + CI status | ❌ | ✅ |
| Computer use (GUI automation) | ❌ | ✅ |

**Hook limitation**: The Post-Write Mandatory Chain (`SyntaxCheck → RunUnitTests → RunATCCheck`) is NOT triggered automatically in the Desktop App. You must run all three steps manually after every `WriteSource` or `EditSource` call.

**Linux developers**: The Desktop App is not available on Linux. Use Claude Code CLI instead.

**Recommended use cases for Desktop App**:
- Visual diff review of ABAP source changes
- PR monitoring and CI status during code review
- Parallel sessions with automatic worktree management
- Computer use for SAP GUI interaction

---

## 7. Configure Antigravity (Optional)

Antigravity is a VS Code-based editor that can connect to the same abap MCP server as Claude Code CLI. Unlike Claude Code CLI which uses the project-level `.mcp.json`, Antigravity reads MCP configuration from the **user-level settings file**.

> **Why separate config?** `.mcp.json` uses a relative path (`./vsp.exe`) tied to the project working directory. Antigravity requires an absolute path in the user settings file.

### 7-A. Add abap MCP server to Antigravity user settings

Open the Antigravity user settings file:

| OS | Settings file path |
|----|-------------------|
| Windows | `%APPDATA%\Antigravity\User\settings.json` |
| macOS | `~/Library/Application Support/Antigravity/User/settings.json` |
| Linux | `~/.config/Antigravity/User/settings.json` |

Add the following block (merge with existing content — do not replace the file):

**Windows**:
```json
{
  "mcp": {
    "servers": {
      "abap": {
        "type": "stdio",
        "command": "./vsp",
        "args": ["--mode", "hyperfocused"],
        "env": {
          "VSP_MODE": "hyperfocused",
          "VSP_ALLOWED_PACKAGES": "Z*,$TMP,$ZADT_VSP,$VSP_ADT",
          "VSP_FEATURE_ABAPGIT": "on"
        }
      },
      "abap-docs": {
        "type": "http",
        "url": "https://mcp-abap.marianzeis.de/mcp"
      },
      "sap-docs": {
        "type": "http",
        "url": "https://mcp-sap-docs.marianzeis.de/mcp"
      }
    }
  }
}
```

The relative path `./vsp` works if Antigravity is started from the project root. If you encounter issues, replace it with the absolute path to your local `vsp` binary.

**Example** (Absolute path fallback):
```json
"command": "C:\\git\\abap\\vsp"
```

**macOS**:
```json
{
  "mcp": {
    "servers": {
      "abap": {
        "type": "stdio",
        "command": "./vsp",
        "args": ["--mode", "hyperfocused"],
        "env": {
          "VSP_MODE": "hyperfocused",
          "VSP_ALLOWED_PACKAGES": "Z*,$TMP,$ZADT_VSP,$VSP_ADT",
          "VSP_FEATURE_ABAPGIT": "on"
        }
      },
      "abap-docs": {
        "type": "http",
        "url": "https://mcp-abap.marianzeis.de/mcp"
      },
      "sap-docs": {
        "type": "http",
        "url": "https://mcp-sap-docs.marianzeis.de/mcp"
      }
    }
  }
}
```

Replace `/Users/<username>/abap/vsp` with your actual home directory path. Ensure the binary is executable: `chmod +x ~/abap/vsp`.

**Linux**:
```json
{
  "mcp": {
    "servers": {
      "abap": {
        "type": "stdio",
        "command": "/home/<username>/abap/vsp",
        "args": ["--mode", "hyperfocused"],
        "env": {
          "VSP_MODE": "hyperfocused",
          "VSP_ALLOWED_PACKAGES": "Z*,$TMP,$ZADT_VSP,$VSP_ADT",
          "VSP_FEATURE_ABAPGIT": "on"
        }
      },
      "abap-docs": {
        "type": "http",
        "url": "https://mcp-abap.marianzeis.de/mcp"
      },
      "sap-docs": {
        "type": "http",
        "url": "https://mcp-sap-docs.marianzeis.de/mcp"
      }
    }
  }
}
```

Replace `/home/<username>/abap/vsp` with your actual home directory path. Ensure the binary is executable: `chmod +x ~/abap/vsp`.

> **`abap-docs` / `sap-docs`** use HTTP transport — no path configuration needed.
> **Sync warning**: If you move or rebuild the `vsp` binary, update **both** `.mcp.json` (for Claude Code CLI) and the Antigravity user settings independently.

### 7-B. Verify Antigravity sees the MCP server

1. Restart Antigravity after saving the settings file.
2. Open the Chat panel (`Ctrl+Alt+I` or View → Chat).
3. Look for the MCP server indicator — `abap` should appear as connected.
4. Test with a prompt:
   ```
   Show me the SAP system info
   ```

Expected: SAP system details returned via the abap MCP server.

### 7-C. Recommended usage split

| Task | Use Claude Code CLI | Use Antigravity |
|------|:-----------------:|:--------------:|
| Multi-agent orchestration (PM workflow) | ✅ | ❌ |
| ABAP object browse / edit | ⚠️ | ✅ |
| MCP read / query only | ✅ | ✅ |
| Git commit / PR | ✅ | ⚠️ |

See `AGENTS.md § Tool Selection Rule` for the full decision guide.

---

## 8. Configure Gemini CLI (Optional)

### 8-A. Create .gemini/settings.json

**Windows** — create `%USERPROFILE%\abap\.gemini\settings.json`:

```json
{
  "mcpServers": {
    "abap": {
      "command": "./vsp",
      "args": ["--mode", "hyperfocused"],
      "env": {
        "VSP_MODE": "hyperfocused",
        "VSP_ALLOWED_PACKAGES": "Z*,$TMP,$ZADT_VSP,$VSP_ADT",
        "VSP_FEATURE_ABAPGIT": "on"
      }
    },
    "abap-docs": {
      "type": "http",
      "url": "https://mcp-abap.marianzeis.de/mcp"
    },
    "sap-docs": {
      "type": "http",
      "url": "https://mcp-sap-docs.marianzeis.de/mcp"
    }
  },
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
      "mcp__abap__RunATCCheck",
      "mcp__abap__GetTable",
      "mcp__abap__WriteSource",
      "mcp__abap__EditSource",
      "mcp__abap__GetConnectionInfo",
      "mcp__abap__GetSystemInfo",
      "mcp__abap__RunReport",
      "mcp__abap__InstallZADTVSP",
      "mcp__abap__InstallAbapGit",
      "mcp__abap__GetInactiveObjects",
      "mcp__abap__GetPackage",
      "Bash(git init *)",
      "Bash(git branch *)",
      "Bash(git add *)",
      "Bash(git commit -m '*)",
      "Bash(git remote *)",
      "Bash(git push *)",
      "Bash(git credential *)",
      "Bash(git check-ignore *)",
      "Bash(powershell -Command *)",
      "WebSearch",
      "WebFetch(domain:github.com)",
      "WebFetch(domain:raw.githubusercontent.com)"
    ]
  },
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "bash scripts/sync-md.sh"
          }
        ]
      }
    ]
  },
  "enableAllProjectMcpServers": true,
  "enabledMcpjsonServers": ["abap", "abap-docs", "sap-docs"]
}
```

**macOS/Linux** — create `~/abap/.gemini/settings.json`:

```json
{
  "mcpServers": {
    "abap": {
      "command": "./vsp",
      "args": ["--mode", "hyperfocused"],
      "env": {
        "VSP_MODE": "hyperfocused",
        "VSP_ALLOWED_PACKAGES": "Z*,$TMP,$ZADT_VSP,$VSP_ADT",
        "VSP_FEATURE_ABAPGIT": "on"
      }
    },
    "abap-docs": {
      "type": "http",
      "url": "https://mcp-abap.marianzeis.de/mcp"
    },
    "sap-docs": {
      "type": "http",
      "url": "https://mcp-sap-docs.marianzeis.de/mcp"
    }
  },
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
      "mcp__abap__RunATCCheck",
      "mcp__abap__GetTable",
      "mcp__abap__WriteSource",
      "mcp__abap__EditSource",
      "mcp__abap__GetConnectionInfo",
      "mcp__abap__GetSystemInfo",
      "mcp__abap__RunReport",
      "mcp__abap__InstallZADTVSP",
      "mcp__abap__InstallAbapGit",
      "mcp__abap__GetInactiveObjects",
      "mcp__abap__GetPackage",
      "Bash(git init *)",
      "Bash(git branch *)",
      "Bash(git add *)",
      "Bash(git commit -m '*)",
      "Bash(git remote *)",
      "Bash(git push *)",
      "Bash(git credential *)",
      "Bash(git check-ignore *)",
      "WebSearch",
      "WebFetch(domain:github.com)",
      "WebFetch(domain:raw.githubusercontent.com)"
    ]
  },
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "bash scripts/sync-md.sh"
          }
        ]
      }
    ]
  },
  "enableAllProjectMcpServers": true,
  "enabledMcpjsonServers": ["abap", "abap-docs", "sap-docs"]
}
```

### 8-B. Verify Gemini sees the MCP server

**Both platforms** (from Git Bash / terminal):
```bash
cd ~/abap
gemini
```

Type `/tools` or ask:
```
What MCP tools are available?
```

Expected: `sap_execute` and abap-docs / sap-docs tools listed.

### 8-C. Recommended use cases for Gemini CLI

Gemini CLI is preferred when:
- **Web research** is required during development (`browser_subagent` native capability)
- **Long-running background research** needs to be delegated without blocking the main session
- Comparing with `abap-docs` / `sap-docs` MCP servers for SAP documentation lookups

See `AGENTS.md § Tool Selection Rule` for the full decision guide.

---

## 9. Install VSP WebSocket Infrastructure on SAP

The VSP WebSocket infrastructure enables advanced features like interactive debugging (TPDAPI), dynamic RFC execution, and background report monitoring.

### 9-A. Automated Installation
Inside a Claude or Gemini session:
```bash
Install VSP infrastructure to package $TMP
```

### 9-B. Compatibility Notes for NW 7.52 (NPL)
If the automated installation fails or shows syntax errors, apply these manual patches:
- **REGEX Compatibility**: NW 7.52 does not support `FIND PCRE`. All instances must be replaced with `FIND REGEX`.
- **Dynamic Table Handling**: In `ZCL_VSP_RFC_SERVICE`, ensure field symbols for tables are typed as `ANY TABLE` to prevent "not an internal table" errors.
- **Optional Services**: If `abapGit` or `AMDP` services are missing, comment out their instantiation in the `class_constructor` of `ZCL_VSP_APC_HANDLER`.

### 9-C. Finalize in SAP GUI
1. **SAPC (APC Management)**: Create application `ZADT_VSP` with handler class `ZCL_VSP_APC_HANDLER` (Stateful).
2. **SICF (ICF Management)**: Activate service node `/sap/bc/apc/sap/zadt_vsp`.

### 9-D. Verify ZADT_VSP
**Windows** (Git Bash):
```bash
./vsp system info
```

**macOS/Linux**:
```bash
./vsp system info
```

If ZADT_VSP is installed, the output includes:
```
ZADT_VSP: installed (version x.x)
```

---

## 10. Install abapGit on SAP

abapGit is required for persistent version control and repository synchronization.

### 10-A. Deployment Steps
1. **Download**: Get the latest `zabapgit_standalone.prog.abap` from [abapGit.org](https://docs.abapgit.org/guide-install.html).
2. **Rename**: Rename the report to `ZABAPGIT_STANDALONE` to avoid collisions.
3. **Fix 7.52 Compatibility**: Remove all occurrences of `##REGEX_POSIX` pragmas (unsupported in 7.52).
4. **Deploy**: Use `vsp deploy` or copy-paste into SE38.

### 10-B. Developer License Block
If you encounter "No development license for user DEVELOPER":
1. Open SAP GUI -> Transaction **SOBJ**.
2. Register the developer key (standard trial key is usually `29671483213171311350`).

### 10-C. Manual Installation - Developer Version

In order to contribute to the abapGit project, you install the developer version. First, install the standalone version (see above).

**Online (Recommended):**
1. Run the standalone version of abapGit.
2. On the repository list page, select **"New Online"**.
3. Enter `https://github.com/abapGit/abapGit/` for the URL.
4. Enter package name `$ABAPGIT` (or select an existing/create a new package).
5. Select **"Create Online Repo"**, then **"Pull"**.

**Offline:**
Download the latest version of the abapGit developer version from [https://github.com/abapGit/abapGit/](https://github.com/abapGit/abapGit/). Select Code > Download ZIP and save the file locally.
1. Run the standalone version of abapGit.
2. On the repository list page, select **"New Offline"**.
3. Enter repo name `abapGit` and package name `$ABAPGIT`.
4. Select **"Create Offline Repo"**, then **"Import zip"**.
5. Select the `abapGit-main.zip` file, then **"Pull zip"**.

Transaction `ZABAPGIT` is now available to run the developer version.

---

## 11. Verify the Setup

Run through this checklist in order. Each step depends on the previous.

### Checkpoint 1 — SAP Connection

**Windows** (Git Bash):
```bash
cd ~/abap
./vsp system info
```

**macOS/Linux**:
```bash
cd ~/abap
./vsp system info
```

✅ Shows system name, client, user, release

### Checkpoint 2 — MCP Server in Claude

```bash
cd ~/abap   # Git Bash on Windows, or terminal on macOS
claude
```

Inside Claude:
```
/mcp
```
✅ `abap` server listed as connected

### Checkpoint 3 — Read SAP Data

Inside Claude session:
```
Show me the system info from SAP
```
✅ Returns SAP system details via `sap_execute`

### Checkpoint 4 — Read ABAP Source

Inside Claude session:
```
Get the source of program ZPROG_SBOOK_QUERY
```
✅ Returns ABAP source code

### Checkpoint 5 — Run a Query

Inside Claude session:
```
Run: SELECT carrid, COUNT(*) AS cnt FROM sflight GROUP BY carrid ORDER BY cnt DESCENDING
```
✅ Returns airline data from SAP

### Checkpoint 6 — Syntax Check

Inside Claude session:
```
Run a SyntaxCheck on ZPROG_SBOOK_QUERY
```
✅ Returns "No syntax errors" or a list of errors

### Checkpoint 7 — Git Automation

Create a test file and verify the hook fires:
```bash
echo "# test" > scratch/test.md
```
Then in Claude: edit any `.md` file and check:
```bash
git log --oneline -3
```
✅ An auto-commit appears after the edit

---

## 12. Troubleshooting

### Problem: vsp cannot connect to SAP

**Symptom**: `connection refused` or `401 Unauthorized`

**Solutions**:
- Verify SAP is running (`http://vhcalnplci:50000/sap/bc/adt/` in browser).
- Verify credentials in `.env`.
- For `wscat` 401 error: ensure the Base64 encoding of `USER:PASS` is correct.
  ```powershell
  [Convert]::ToBase64String([System.Text.Encoding]::ASCII.GetBytes("USER:PASS"))
  ```

---

### Problem: ADT Lock conflict

**Symptom**: `ExceptionResourceInvalidLockHandle`

**Solution**:
- Wait 60 seconds for the session to timeout.
- Manually unlock the object in transaction **SM12**.

---

### Problem: Syntax Errors in NW 7.52 (NPL)

**Symptom**: `Field PCRE is unknown` or `Type ZADT_VSP... unknown`

**Solutions**:
- **PCRE**: Replace all `FIND PCRE` with `FIND REGEX` in the source code.
- **Pragmas**: Remove `##REGEX_POSIX` pragmas.
- **Dynamic Tables**: Ensure field symbols for dynamic tables are typed as `ANY TABLE` before `LOOP AT`.

---

### Problem: Git hooks not firing

**Symptom**: No auto-commits after editing `.md` files

**Windows** (PowerShell):
```powershell
# 1. Test the script manually (run from repo root)
powershell -ExecutionPolicy Bypass -File scripts\git-sync.ps1

# 2. Check PowerShell execution policy
Get-ExecutionPolicy

# 3. Verify hook config
cat .claude/settings.json

# 4. Confirm git remote is configured
git remote -v
```

**macOS/Linux**:
```bash
# 1. Test the script manually
bash ~/abap/scripts/git-sync.sh

# 2. Verify hook config
cat .claude/settings.json

# 3. Confirm git remote is configured
git remote -v

# 4. Check that the hook command path in settings.local.json is absolute
cat .claude/settings.local.json
```

---

### Problem: `VSP_ALLOWED_PACKAGES` blocks an object

**Symptom**: `object not in allowed packages` error

**Solution** (both platforms — edit `.mcp.json` and `.env`):
```json
"VSP_ALLOWED_PACKAGES": "Z*,Y*,$TMP,ZSPECIAL_PKG"
```

---

### Problem: ABAP SQL query fails with DESC/ASC error

**Symptom**: `"DESC" is not allowed in ORDER BY`

**Solution**: Use ABAP SQL syntax (see `docs/MCP_USAGE.md`):
```sql
-- Wrong
ORDER BY field DESC

-- Correct
ORDER BY field DESCENDING
```

---

## 13. Team Onboarding Checklist

Use this list when onboarding a new team member.

### Before the session

- [ ] Add member's SAP user to target system with required roles
- [ ] Share the GitHub repository URL
- [ ] Share SAP system URL, client number, and credentials
- [ ] Confirm member has a Claude Code (Anthropic) account

### Environment setup (member does this)

- [ ] Install Git (`git --version`) — Windows: installs Git Bash
- [ ] Install Node.js 18+ (`node --version`)
- [ ] Install Claude Code (`claude --version`)
- [ ] Clone the repository into `~/abap`
- [ ] Download `vsp` binary from releases page, place in repo root
  - Windows: `~/abap/vsp.exe`
  - macOS/Linux: `~/abap/vsp` + `chmod +x ~/abap/vsp`
- [ ] Create `.env` with SAP credentials
- [ ] Create `.mcp.json` using template from §5-D
- [ ] Create `.claude/settings.local.json` using template from §6-B for your OS
- [ ] Run `./vsp system info` (Windows: `./vsp.exe system info`) — confirm green output
- [ ] Start `claude` in repo directory, run `/mcp` — confirm `abap` listed
- [ ] Run Checkpoint 3–6 from Section 10

### First session orientation (30 min)

- [ ] Read `README.md` — understand the Harness Engineering concept
- [ ] Read `docs/CONTEXT.md` — shared project context (build commands, codebase map, ABAP dev rules)
- [ ] Read `AGENTS.md` — understand your role and available agents
- [ ] Read `docs/SKILL.md` — review tool boundaries and best practices
- [ ] Read `docs/MCP_USAGE.md` §Critical Limitations — especially ABAP SQL syntax
- [ ] Review `docs/SAP ERP Module/<your-module>-analyst.md` if you are a Business Analyst
- [ ] Review `docs/task-template.md` — understand the handoff workflow
- [ ] Do a test task: ask Claude to query `SFLIGHT` and explain the result

### Optional (advanced)

- [ ] Install Claude Code Desktop App (Windows/macOS only) — same `.mcp.json`, no extra setup; note hooks do not fire (§6-E)
- [ ] Install and configure Antigravity with abap MCP (§7)
- [ ] Install Gemini CLI and configure `.gemini/settings.json` (§8)
- [ ] Install ZADT_VSP for debugging capability (§9)
- [ ] Review `docs/subagents/` — understand parallel dispatch patterns

---

## Appendix A — File Reference

| File | Committed | Purpose | Who creates |
|------|:---------:|---------|-------------|
| `.env` | ❌ | SAP credentials | Each developer |
| `.mcp.json` | ❌ | MCP server config for Claude Code CLI (abap + abap-docs + sap-docs) | Each developer |
| `.claude/settings.json` | ✅ | Shared permissions + hooks | Repo (already exists) |
| `.claude/settings.local.json` | ❌ | Local extended permissions | Each developer |
| `.gemini/settings.json` | ❌ | Gemini CLI config (abap + abap-docs + sap-docs) | Each developer (optional) |
| `%APPDATA%\Antigravity\User\settings.json` | ❌ (outside repo) | Antigravity MCP config (abap + abap-docs + sap-docs) | Each developer (optional) |
| `vsp` / `vsp.exe` | ❌ | MCP server binary | Download from releases |
| `docs/CONTEXT.md` | ✅ | Shared project context for all AI tools | Repo (already exists) |
| `CLAUDE.md` | ✅ | Claude Code CLI-specific config | Repo (already exists) |
| `GEMINI.md` | ✅ | Gemini CLI-specific overrides | Repo (already exists) |
| `AGENTS.md` | ✅ | Agent roles + dispatch protocol | Repo (already exists) |

---

## Appendix B — VSP Mode Reference

| Mode | Tools | Best for |
|------|-------|---------|
| `hyperfocused` | 1 (`sap_execute`) | AI agents — minimal hallucination risk |
| `focused` | ~19 | Standard development sessions |
| `expert` | ~45 | Debugging, advanced operations |

Change mode in `.mcp.json` `env.VSP_MODE` and `.env` `VSP_MODE`.

---

## Appendix C — Quick Command Reference

**Windows** (Git Bash):
```bash
# Start Claude Code in project
cd ~/abap && claude

# Check MCP server status (inside Claude session)
/mcp

# Check SAP connection
./vsp system info

# Manual git sync (PowerShell)
powershell -File scripts/git-sync.ps1

# Run a quick SAP query (outside Claude)
./vsp.exe query "SELECT * FROM t000"

# Show vsp help
./vsp.exe --help
./vsp.exe mcp --help
```

**macOS/Linux**:
```bash
# Start Claude Code in project
cd ~/abap && claude

# Check MCP server status (inside Claude session)
/mcp

# Check SAP connection
./vsp system info

# Manual git sync
bash scripts/git-sync.sh

# Run a quick SAP query (outside Claude)
./vsp query "SELECT * FROM t000"

# Show vsp help
./vsp --help
./vsp mcp --help
```

---
*Document version: 1.6 — 2026-05-05*
*Maintained by: VSP Harness Engineering Team*
