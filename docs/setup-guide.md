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
6. [Configure Claude Code](#6-configure-claude-code)
7. [Configure Gemini CLI (Optional)](#7-configure-gemini-cli-optional)
8. [Install ZADT_VSP on SAP (Optional)](#8-install-zadt_vsp-on-sap-optional)
9. [Verify the Setup](#9-verify-the-setup)
10. [Troubleshooting](#10-troubleshooting)
11. [Team Onboarding Checklist](#11-team-onboarding-checklist)

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
| Anthropic account | Claude Code CLI | https://claude.ai |
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

Only needed if you want to use Gemini as an AI agent alongside Claude.

**Both platforms**:
```bash
npm install -g @google/gemini-cli
gemini auth login
gemini --version
```

### 3-D. PowerShell 7+ (for automation hooks)

PowerShell 7+ is used by the git-sync hook in `.claude/settings.json`.

**Windows**:
```
https://github.com/PowerShell/PowerShell/releases/latest
```
Download and install the `.msi` installer.

**macOS**:
```bash
# Option 1: Homebrew
brew install --cask powershell

# Option 2: Direct download
# https://github.com/PowerShell/PowerShell/releases/latest
# Download the .pkg file for macOS
```

**Alternative for macOS (bash-only)**: If you prefer not to install PowerShell on macOS, you can replace the git-sync hook command in `.claude/settings.local.json` with a bash script (see §6-B).

Verify (both platforms):
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
│   ├── git-sync.ps1
│   └── sync-md.ps1
├── .env                       ← SAP credentials (create manually — gitignored)
├── .mcp.json                  ← MCP server config (create manually — gitignored)
├── .gitignore
├── AGENTS.md
├── CLAUDE.md
├── GEMINI.md
├── MCP_USAGE.md
├── README.md
├── SECURITY.md
├── SKILL.md
└── vsp.exe                    ← Download separately (gitignored)
```

**macOS/Linux** (`~/abap/`):
```
~/abap/
├── .claude/
│   ├── settings.json          ← Claude Code permissions + hooks
│   └── settings.local.json    ← Local extended permissions (create manually)
├── .gemini/
│   └── settings.json          ← Gemini CLI config (create manually)
├── contexts/                  ← SAP module analyst deep-knowledge files
├── docs/
│   ├── subagents/             ← Subagent prompt templates
│   └── task-template.md
├── memory/                    ← Date-stamped development logs
├── scratch/                   ← Temporary ABAP files
├── scripts/
│   ├── git-sync.ps1
│   └── git-sync.sh            ← bash alternative for macOS
├── .env                       ← SAP credentials (create manually — gitignored)
├── .mcp.json                  ← MCP server config (create manually — gitignored)
├── .gitignore
├── AGENTS.md
├── CLAUDE.md
├── GEMINI.md
├── MCP_USAGE.md
├── README.md
├── SECURITY.md
├── SKILL.md
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
SAP_PASSWORD=Down1oad
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
./vsp.exe system info
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
      "command": "./vsp.exe",
      "args": [],
      "env": {
        "VSP_MODE": "hyperfocused",
        "VSP_ALLOWED_PACKAGES": "Z*,$TMP",
        "VSP_FEATURE_ABAPGIT": "off"
      }
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
      "args": [],
      "env": {
        "VSP_MODE": "hyperfocused",
        "VSP_ALLOWED_PACKAGES": "Z*,$TMP",
        "VSP_FEATURE_ABAPGIT": "off"
      }
    }
  }
}
```

Replace `<your-username>` with your macOS username (output of `whoami`).

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
      "mcp__abap__RunUnitTests"
    ]
  },
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "powershell -ExecutionPolicy Bypass -File <repo-root>\\scripts\\sync-md.ps1"
          },
          {
            "type": "command",
            "command": "powershell -ExecutionPolicy Bypass -File <repo-root>\\scripts\\git-sync.ps1"
          }
        ]
      }
    ]
  }
}
```

This sets up:
- **Read-only MCP tools auto-approved** (GetSource, RunQuery, GrepPackages, etc.)
- **Claude Preview tools auto-approved** (screenshot, snapshot, logs)
- **PostToolUse hooks**: runs `sync-md.ps1` then `git-sync.ps1` after every Write/Edit

> **`<repo-root>`** in the hook commands is replaced with your actual repo path when you commit this file to your machine. See §6-B for the per-developer path binding.

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
    "abap"
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
    "abap"
  ]
}
```

> **Note (macOS)**: `"Bash(powershell -Command *)"` is omitted — the git-sync hook uses `scripts/git-sync.sh` instead.

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
  abap — vsp (hyperfocused mode)
    Tools: sap_execute (1 tool)
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

---

## 7. Configure Gemini CLI (Optional)

### 7-A. Create .gemini/settings.json

**Windows** — create `%USERPROFILE%\abap\.gemini\settings.json`:

```json
{
  "mcpServers": {
    "abap": {
      "command": "./vsp.exe",
      "args": [],
      "env": {
        "VSP_MODE": "hyperfocused",
        "VSP_ALLOWED_PACKAGES": "Z*,$TMP",
        "VSP_FEATURE_ABAPGIT": "off"
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
            "command": "powershell -ExecutionPolicy Bypass -File C:\\Users\\<your-username>\\abap\\scripts\\sync-md.ps1"
          },
          {
            "type": "command",
            "command": "powershell -ExecutionPolicy Bypass -File C:\\Users\\<your-username>\\abap\\scripts\\git-sync.ps1"
          }
        ]
      }
    ]
  },
  "enableAllProjectMcpServers": true,
  "enabledMcpjsonServers": ["abap"]
}
```

**macOS/Linux** — create `~/abap/.gemini/settings.json`:

> Replace `<your-username>` with your macOS username (output of `whoami`).

```json
{
  "mcpServers": {
    "abap": {
      "command": "./vsp",
      "args": [],
      "env": {
        "VSP_MODE": "hyperfocused",
        "VSP_ALLOWED_PACKAGES": "Z*,$TMP",
        "VSP_FEATURE_ABAPGIT": "off"
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
          },
          {
            "type": "command",
            "command": "bash scripts/git-sync.sh"
          }
        ]
      }
    ]
  },
  "enableAllProjectMcpServers": true,
  "enabledMcpjsonServers": ["abap"]
}
```

If you have PowerShell installed on macOS, you may also use `pwsh -File ~/abap/scripts/git-sync.ps1` as the hook command.

### 7-B. Verify Gemini sees the MCP server

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

---

## 8. Install ZADT_VSP on SAP (Optional)

ZADT_VSP is a SAP-side ABAP program that enables WebSocket-based debugging, RFC execution, and RunReport. Without it, these features return a 403 error.

**Required for**:
- `vsp debug` (WebSocket debugger)
- `RunReport` (background program execution)
- RFC calls via MCP

**Not required for**:
- `GetSource`, `EditSource`, `WriteSource`, `RunQuery` (standard ADT API)

### 8-A. Install via Claude Code (Recommended)

```bash
cd ~/abap   # Git Bash on Windows, or terminal on macOS
claude
```

Inside the Claude session:
```
Install ZADT_VSP on the SAP system
```

Claude will call `mcp__abap__InstallZADTVSP` automatically.

### 8-B. Manual Installation

If automatic install fails (e.g., permissions issue):

1. Open SAP transaction `SE38`
2. Create program `ZADT_VSP` in package `$TMP`
3. Source code is available at:
   ```
   https://raw.githubusercontent.com/5throck/vsp/main/zadt_vsp/ZADT_VSP.abap
   ```
4. Activate and run once to verify

### 8-C. Verify ZADT_VSP

**Windows** (Git Bash):
```bash
./vsp.exe system info
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

## 9. Verify the Setup

Run through this checklist in order. Each step depends on the previous.

### Checkpoint 1 — SAP Connection

**Windows** (Git Bash):
```bash
cd ~/abap
./vsp.exe system info
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

## 10. Troubleshooting

### Problem: vsp cannot connect to SAP

**Symptom**: `connection refused` or `401 Unauthorized`

**Windows** (Git Bash):
```bash
# 1. Check SAP is running
curl http://vhcalnplci:50000/sap/bc/adt/

# 2. Verify credentials
cat .env

# 3. Check hosts file (NPL only)
grep vhcalnplci /c/Windows/System32/drivers/etc/hosts

# 4. Test with curl directly
curl -u DEVELOPER:Down1oad http://vhcalnplci:50000/sap/bc/adt/
```

**macOS/Linux**:
```bash
# 1. Check SAP is running
curl http://vhcalnplci:50000/sap/bc/adt/

# 2. Verify credentials
cat .env

# 3. Check hosts file (NPL only)
grep vhcalnplci /etc/hosts

# 4. Test with curl directly
curl -u DEVELOPER:Down1oad http://vhcalnplci:50000/sap/bc/adt/
```

---

### Problem: MCP server not visible in Claude

**Symptom**: `/mcp` shows no servers or `abap` is missing

**Windows** (Git Bash):
```bash
# 1. Confirm .mcp.json exists and is valid JSON
cat .mcp.json

# 2. Confirm you are in the project directory and vsp.exe runs
cd ~/abap
./vsp.exe --version

# 3. Verify the username in .mcp.json matches your actual username
echo $USERNAME
```

**macOS/Linux**:
```bash
# 1. Confirm .mcp.json exists and is valid JSON
cat .mcp.json

# 2. Confirm vsp is executable (must have +x)
ls -l vsp
./vsp --version

# 3. Verify the username in .mcp.json matches your actual username
whoami
```

```
# 4. Check Claude Code MCP logs (both platforms)
# In Claude: type /mcp and look for error details
```

---

### Problem: SyntaxCheck or WriteSource returns 403

**Symptom**: CSRF token errors or 403 Forbidden

**Solutions**:
- This is usually a session issue. Restart the Claude session.
- If persistent: verify SAP user has `S_DEVELOP` authorization.
- For ZADT_VSP features: verify ZADT_VSP is installed (Section 8).

---

### Problem: Git hooks not firing

**Symptom**: No auto-commits after editing `.md` files

**Windows** (PowerShell):
```powershell
# 1. Test the script manually (replace <your-username>)
powershell -ExecutionPolicy Bypass -File $env:USERPROFILE\abap\scripts\git-sync.ps1

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

**Solution**: Use ABAP SQL syntax (see `MCP_USAGE.md`):
```sql
-- Wrong
ORDER BY field DESC

-- Correct
ORDER BY field DESCENDING
```

---

## 11. Team Onboarding Checklist

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
- [ ] Create `.mcp.json` using template from §5-D — **replace `<your-username>` with actual username**
- [ ] Create `.claude/settings.local.json` using template from §6-B for your OS
- [ ] Run `./vsp system info` (Windows: `./vsp.exe system info`) — confirm green output
- [ ] Start `claude` in repo directory, run `/mcp` — confirm `abap` listed
- [ ] Run Checkpoint 3–6 from Section 9

### First session orientation (30 min)

- [ ] Read `README.md` — understand the Harness Engineering concept
- [ ] Read `AGENTS.md` — understand your role and available agents
- [ ] Read `SKILL.md` — review tool boundaries and best practices
- [ ] Read `MCP_USAGE.md` §Critical Limitations — especially ABAP SQL syntax
- [ ] Review `contexts/<your-module>-analyst.md` if you are a Business Analyst
- [ ] Review `docs/task-template.md` — understand the handoff workflow
- [ ] Do a test task: ask Claude to query `SFLIGHT` and explain the result

### Optional (advanced)

- [ ] Install Gemini CLI and configure `.gemini/settings.json` (§7)
- [ ] Install ZADT_VSP for debugging capability (§8)
- [ ] Review `docs/subagents/` — understand parallel dispatch patterns

---

## Appendix A — File Reference

| File | Committed | Purpose | Who creates |
|------|:---------:|---------|-------------|
| `.env` | ❌ | SAP credentials | Each developer |
| `.mcp.json` | ❌ | MCP server path/config | Each developer |
| `.claude/settings.json` | ✅ | Shared permissions + hooks | Repo (already exists) |
| `.claude/settings.local.json` | ❌ | Local extended permissions | Each developer |
| `.gemini/settings.json` | ❌ | Gemini config | Each developer (optional) |
| `vsp` / `vsp.exe` | ❌ | MCP server binary | Download from releases |
| `CLAUDE.md` | ✅ | AI dev context | Repo (already exists) |
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
./vsp.exe system info

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
*Document version: 1.2 — 2026-05-01*
*Maintained by: VSP Harness Engineering Team*
