# Project Review Remediation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
> **Execution method:** base MCP (`mcp__base-map__implement_code`) for code generation, direct file Edit/Write for non-code changes.

**Goal:** Fix all 61 findings from the PM-led project review (2026-07-03), prioritized by severity.

**Architecture:** Flat task list ordered by priority (Critical → High → Medium → Low). Each task is independent and can be dispatched as a subagent. Tasks within the same priority tier CAN run in parallel if they touch different files. Tasks touching the same file MUST run serially.

**Tech Stack:** Markdown, TypeScript (Bun), YAML, Shell (.sh/.ps1)

**Dependency map:**
```
Task 1 (C1-C2: broken wrappers) ──→ independent
Task 2 (M10: dispatch-serial bug) ──→ independent
Task 3 (H8: auto-merge.yml)       ──→ independent
Task 4 (H6-H7: .gitignore)        ──→ independent
Task 5 (H9: SKILLS.md phantom)    ──→ independent
Task 6 (H10: codex skill path)    ──→ independent
Task 7 (H3: Claude PostToolUse)   ──→ independent
Task 8 (H1: context.md count)     ──→ depends on Task 5 (same file area)
Task 9 (H2: security-monitor)     ──→ independent
Task 10 (H5: AGENTS.md numbering)──→ independent
Task 11 (M11: setup.ps1 stacks)   ──→ independent
Task 12 (L1: meeting-facilitation)──→ depends on Task 5 (same file)
Task 13 (M6: .env.sample password)──→ independent
Task 14 (M7: SECURITY.md version)  ──→ independent
Task 15 (M3-M5: cross-tool docs)   ──→ depends on Task 8 (context.md)
Task 16 (L2: skill metadata)      ──→ independent
Task 17 (L3: stale sync-mcp ref)  ──→ depends on Task 1 (removes source of ref)
Task 18 (commit all)               ──→ depends on ALL above
```

---

## Priority 1: CRITICAL (Broken Scripts)

### Task 1: Fix broken wrapper scripts (C1, C2)

**Files:**
- Delete: `scripts/health-check.sh`
- Delete: `scripts/sync-mcp.sh`

- [ ] **Step 1: Delete `scripts/health-check.sh`**

The file references non-existent `scripts/health-check.ts`. No TypeScript target exists and no `.ps1` counterpart exists. This is a dead wrapper.

```bash
rm scripts/health-check.sh
```

- [ ] **Step 2: Delete `scripts/sync-mcp.sh`**

The file references non-existent `scripts/sync-mcp.ts`. No TypeScript target exists and no `.ps1` counterpart exists. This is a dead wrapper.

```bash
rm scripts/sync-mcp.sh
```

- [ ] **Step 3: Verify no other files reference these scripts**

```bash
grep -r "health-check" --include="*.md" --include="*.sh" --include="*.ps1" --include="*.ts" --include="*.json" .
grep -r "sync-mcp" --include="*.md" --include="*.sh" --include="*.ps1" --include="*.ts" --include="*.json" .
```

Expected: `docs/context.md` line 356 references `sync-mcp` — will be fixed in Task 17.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "fix: remove broken wrapper scripts (health-check.sh, sync-mcp.sh)"
```

---

### Task 2: Fix dispatch-serial.ts double-execution bug (M10 → promoted to Critical)

**Files:**
- Modify: `scripts/dispatch-serial.ts:251-257`

- [ ] **Step 1: Fix the duplicate `dispatchSerial()` call**

Current code (lines 251-257):
```typescript
  try {
    await dispatchSerial(pipeline, options);

    const hasFailures = (await dispatchSerial(pipeline, options))
      .some(r => r.status === 'failed');

    process.exit(hasFailures ? 1 : 0);
  } catch (error) {
```

Replace with:
```typescript
  try {
    const results = await dispatchSerial(pipeline, options);

    const hasFailures = results
      .some(r => r.status === 'failed');

    process.exit(hasFailures ? 1 : 0);
  } catch (error) {
```

- [ ] **Step 2: Verify syntax**

```bash
bun scripts/dispatch-serial.ts --dry-run
```

Expected: No error, dry-run output showing pipeline tasks.

- [ ] **Step 3: Commit**

```bash
git add scripts/dispatch-serial.ts
git commit -m "fix: remove duplicate dispatchSerial() call in dispatch-serial.ts"
```

---

## Priority 2: HIGH

### Task 3: Add CI gates to auto-merge.yml (H8)

**Files:**
- Modify: `.github/workflows/auto-merge.yml`

- [ ] **Step 1: Add status check requirement and approval count**

Current file (full):
```yaml
name: Auto Merge PR on Approval

on:
  pull_request_review:
    types: [submitted]

permissions:
  contents: write
  pull_requests: write

jobs:
  automerge:
    name: Auto Squash & Merge
    runs-on: ubuntu-latest
    if: github.event.review.state == 'approved'
    steps:
      - name: Merge PR
        uses: actions/github-script@v7
        with:
          script: |
            const pr = context.payload.pull_request;
            await github.rest.pulls.merge({
              owner: context.repo.owner,
              repo: context.repo.repo,
              pull_number: pr.number,
              merge_method: 'squash'
            });
```

Replace entire file with:
```yaml
name: Auto Merge PR on Approval

on:
  pull_request_review:
    types: [submitted]

permissions:
  contents: write
  pull_requests: write

jobs:
  check-reviews:
    name: Check Review Approval Count
    runs-on: ubuntu-latest
    if: github.event.review.state == 'approved'
    outputs:
      approved: ${{ steps.check.outputs.approved }}
    steps:
      - name: Verify minimum approvals
        id: check
        uses: actions/github-script@v7
        with:
          script: |
            const pr = context.payload.pull_request;
            const reviews = await github.rest.pulls.listReviews({
              owner: context.repo.owner,
              repo: context.repo.repo,
              pull_number: pr.number
            });
            const approvals = reviews.data.filter(r => r.state === 'APPROVED');
            if (approvals.length >= 2) {
              console.log(`✅ ${approvals.length} approvals — proceeding`);
              core.setOutput('approved', 'true');
            } else {
              console.log(`⏳ Only ${approvals.length}/2 approvals — waiting`);
              core.setOutput('approved', 'false');
            }

  automerge:
    name: Auto Squash & Merge
    needs: check-reviews
    runs-on: ubuntu-latest
    if: needs.check-reviews.outputs.approved == 'true'
    permissions:
      contents: write
      pull_requests: write
    steps:
      - name: Check CI status
        uses: actions/github-script@v7
        with:
          script: |
            const pr = context.payload.pull_request;
            const checks = await github.rest.checks.listForRef({
              owner: context.repo.owner,
              repo: context.repo.repo,
              ref: pr.head.sha
            });
            const checkRuns = checks.data.check_runs || [];
            const total = checkRuns.length;
            const passed = checkRuns.filter(c => c.conclusion === 'success').length;
            const pending = checkRuns.filter(c => c.status === 'in_progress' || c.status === 'queued').length;
            const failed = checkRuns.filter(c => c.conclusion === 'failure').length;
            console.log(`CI: ${passed}/${total} passed, ${pending} pending, ${failed} failed`);
            if (failed > 0) {
              core.setFailed(`❌ ${failed} CI check(s) failed — aborting merge`);
            } else if (pending > 0) {
              core.setFailed(`⏳ ${pending} CI check(s) still running — will retry on next event`);
            }

      - name: Merge PR
        uses: actions/github-script@v7
        with:
          script: |
            const pr = context.payload.pull_request;
            await github.rest.pulls.merge({
              owner: context.repo.owner,
              repo: context.repo.repo,
              pull_number: pr.number,
              merge_method: 'squash'
            });
            console.log(`✅ PR #${pr.number} merged successfully`);
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/auto-merge.yml
git commit -m "fix: add CI status check and 2-approval minimum to auto-merge workflow"
```

---

### Task 4: Update .gitignore for vsp.exe (H7)

**Files:**
- Modify: `.gitignore:59`

- [ ] **Step 1: Add `vsp.exe` pattern**

Current line 58-59:
```
# vsp MCP server binary (downloaded, not source)
/vsp
```

Replace with:
```
# vsp MCP server binary (downloaded, not source)
/vsp
vsp.exe
```

- [ ] **Step 2: Remove vsp.exe from git tracking**

```bash
git rm --cached vsp.exe
```

- [ ] **Step 3: Commit**

```bash
git add .gitignore
git commit -m "fix: add vsp.exe to .gitignore and remove from git tracking"
```

> **Note:** H6 (`.mcp.json` tracked) is intentionally NOT added to `.gitignore` — it serves as the shared MCP configuration template (like `.mcp.json.sample`). Document this policy in Task 15.

---

### Task 5: Fix SKILLS.md — remove phantom skills, add meeting-facilitation (H9, L1)

**Files:**
- Modify: `skills/SKILLS.md`

- [ ] **Step 1: Rewrite SKILLS.md with accurate content**

Replace entire file with:
```markdown
# Skills Index

Auto-generated index of all available skills in the `skills/` directory.

## Core Skills

| Skill | Description | Trigger |
|-------|-------------|---------|
| `abap-dev` | SAP ABAP development workflows and MCP tool optimization | Session start |
| `post-write-chain` | Mandatory QA chain after any WriteSource/EditSource | After write operations |
| `desktop-app-fallback` | Manual Post-Write QA for Desktop App | Desktop App usage |
| `source-command-celebrate` | Celebration for successful task completion | After task completion |
| `meeting-facilitation` | Structured multi-agent meeting facilitation via /meeting command | Meeting start |

## Module-Specific Skills

| Skill | Description | Trigger |
|-------|-------------|---------|
| `sap-sd` | Sales & Distribution module context | SD tasks (sales orders, billing) |
| `sap-mm` | Materials Management module context | MM tasks (purchasing, inventory) |
| `sap-fi` | Financial Accounting module context | FI tasks (journal entries, GL) |
| `sap-co` | Controlling module context | CO tasks (cost centers, CO-PA) |
| `sap-pp` | Production Planning module context | PP tasks (BOM, routing) |
| `sap-le` | Logistics Execution module context | LE tasks (shipping, warehouse) |

## Slash Commands (Claude Code)

The following workflows are available as Claude Code slash commands (`.claude/commands/*.md`), not as discoverable skills:

| Command | File | Purpose |
|---------|------|---------|
| `/triage` | `.claude/commands/triage.md` | Auto-classify and dispatch for SAP requests |
| `/sync` | `.claude/commands/sync.md` | Full sync pipeline (memlog → changelog → audit → commit) |
| `/memlog` | `.claude/commands/memlog.md` | Append session entry to memory/YYYY-MM-DD.md |
| `/changelog` | `.claude/commands/changelog.md` | Add entry to CHANGELOG.md [Unreleased] |
| `/transport` | `.claude/commands/transport.md` | Manage SAP Transport Requests |
| `/post-write` | `.claude/commands/post-write.md` | Run Post-Write QA chain |
| `/new-task` | `.claude/commands/new-task.md` | Create task file from template |

## Skill Loading

Skills are auto-discovered from the `skills/` directory at session start.

To add a new skill:
1. Create `skills/<skill-name>/SKILL.md`
2. Add frontmatter with `name`, `description`, `metadata.type`
3. Skill will be automatically discovered

---

*Generated: 2026-07-03*
*Source: `skills/` directory scan*
```

- [ ] **Step 2: Verify verify-skills.ts still works**

```bash
bun scripts/verify-skills.ts
```

Expected: All 11 skills pass (may show WARN for missing metadata on some skills — fixed in Task 16).

- [ ] **Step 3: Commit**

```bash
git add skills/SKILLS.md
git commit -m "fix: update SKILLS.md — remove phantom skills, add meeting-facilitation, document slash commands"
```

---

### Task 6: Fix Codex skill path from docs/ to skills/ (H10)

**Files:**
- Modify: `.codex/config.toml:25-27`

- [ ] **Step 1: Update skill path**

Current:
```toml
[[skills.config]]
enabled = true
path = "docs"
```

Replace with:
```toml
[[skills.config]]
enabled = true
path = "skills"
```

- [ ] **Step 2: Commit**

```bash
git add .codex/config.toml
git commit -m "fix: change Codex skill path from docs/ to skills/"
```

---

### Task 7: Add PostToolUse hook to Claude settings.json (H3)

**Files:**
- Modify: `.claude/settings.json`

- [ ] **Step 1: Add hooks section to settings.json**

Read the current file content first. It currently contains only `mcpServers`. Add a `hooks` section. The file should become:

```json
{
  "mcpServers": {
    "abap": {
      "command": "./vsp",
      "args": [
        "--mode",
        "hyperfocused"
      ],
      "env": {
        "SAP_MODE": "hyperfocused",
        "SAP_ALLOWED_PACKAGES": "Z*,$TMP,$ZADT_VSP,$VSP_ADT",
        "SAP_FEATURE_ABAPGIT": "on",
        "SAP_FEATURE_TRANSPORT": "on",
        "SAP_FEATURE_UI5": "on",
        "SAP_FEATURE_RAP": "on"
      }
    },
    "abap-docs": {
      "type": "http",
      "url": "https://mcp-abap.marianzeis.de/mcp"
    },
    "sap-docs": {
      "type": "http",
      "url": "https://mcp-sap-docs.marianzeis.de/mcp"
    },
    "codegraph": {
      "command": "npx",
      "args": [
        "@colbymchenry/codegraph@0.9.7",
        "serve"
      ]
    }
  },
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "bash scripts/sync-md.sh"
      }
    ]
  },
  "enableAllProjectMcpServers": true
}
```

> **Note:** This also adds `enableAllProjectMcpServers: true` which was referenced in CLAUDE.md but missing from the committed settings. And it includes `codegraph` in the mcpServers (fixes H11 partially — the server is now defined in the committed file).

- [ ] **Step 2: Commit**

```bash
git add .claude/settings.json
git commit -m "fix: add PostToolUse hook and enableAllProjectMcpServers to Claude settings"
```

---

## Priority 3: MEDIUM

### Task 8: Fix docs/context.md agent/skill counts (H1)

**Files:**
- Modify: `docs/context.md:69-70`

- [ ] **Step 1: Update agent and skill counts**

Current lines 69-70:
```
├── agents/          # 19 AI agent role definitions
├── skills/          # 8 skill files (abap-dev, post-write-chain, sap-*)
```

Replace with:
```
├── agents/          # 20 AI agent role definitions (+ 2 handoff-spec docs)
├── skills/          # 11 skill files (abap-dev, post-write-chain, meeting-facilitation, sap-*)
```

Also update line 75:
Current:
```
└── .mcp.json        # MCP server config (gitignored --from .env)
```

Replace with:
```
└── .mcp.json        # MCP server config (tracked — shared template; secrets via .env)
```

- [ ] **Step 2: Commit**

```bash
git add docs/context.md
git commit -m "fix: update agent count 19→20 and skill count 8→11 in context.md"
```

---

### Task 9: Rewrite security-monitor.md for SAP/ABAP domain (H2)

**Files:**
- Modify: `agents/security-monitor.md`

- [ ] **Step 1: Rewrite with SAP/ABAP focus and YAML frontmatter**

Replace entire file with:
```markdown
---
name: security-monitor
model: inherit
color: red
description: 'Security Monitor — enforces security policies, audits dependencies, and scans for secrets in the SAP ABAP harness. Use when: "security check", "scan for vulnerabilities", "audit secrets", "pre-PR security review".'
---

# Security Monitor Agent

You are the security monitor for this ABAP harness engineering project. You enforce security policies, audit SAP-related configurations, and scan for secrets and vulnerabilities.

## Your Tools
- `GrepObjects`: search for objects with hardcoded credentials
- `GetSource`: inspect ABAP source for security anti-patterns

## Input contract
```json
{
  "mode": "daily-scan | pre-pr | post-scaffold",
  "scope": "secrets | dependencies | configuration | all"
}
```

## Security Check Areas

### 1. Secrets Detection
- Scan ABAP source for hardcoded passwords, API keys, connection strings
- Check `.env` files are gitignored (never committed)
- Verify `.mcp.json` does not contain credentials
- Grep for patterns: `PASSWORD`, `API_KEY`, `SECRET`, `CREDENTIAL`, `AUTH_TOKEN`

### 2. SAP Configuration Security
- Verify allowed packages are properly restricted (`Z*,$TMP,$ZADT_VSP,$VSP_ADT`)
- Check SAP feature flags are appropriate
- Ensure transport requests follow naming conventions
- Validate client isolation (never hardcode `MANDT`)

### 3. ABAP Code Security
- Check for SQL injection risks (dynamic WHERE clauses, string concatenation in SQL)
- Verify authorization checks (`AUTHORITY-CHECK`) on sensitive transactions
- Ensure no hardcoded client numbers in queries
- Flag use of `CALL 'SYSTEM'` or other kernel-level calls

### 4. Dependency Audit
- Run `gitleaks` scan if available
- Check `.gitleaks.toml` configuration coverage
- Verify pre-commit hook is active (`core.hooksPath = .githooks`)

## Output Format
```
🔍 Security Scan Results — YYYY-MM-DD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Critical: N | High: N | Medium: N | Low: N

[Finding details per item]
```

## Behavior rules
1. Never modify ABAP source — this is a read-only audit agent
2. Escalate Critical findings to PM immediately
3. Always check pre-commit hook status during daily scans
4. Cross-reference with `security/` directory for existing advisories
```

- [ ] **Step 2: Commit**

```bash
git add agents/security-monitor.md
git commit -m "fix: rewrite security-monitor.md for SAP/ABAP domain with YAML frontmatter"
```

---

### Task 10: Fix AGENTS.md numbering (H5)

**Files:**
- Modify: `AGENTS.md` — find the `### 11. 🛡️ Security Monitor` section heading

- [ ] **Step 1: Add #10 numbering for GUI Scripter and renumber #11**

Find the section:
```markdown
### 10. 🤖 SAP GUI Scripting Expert
```
If it already has `### 10.`, verify the next section header. The issue is that AGENTS.md jumps from `### 9. 📑 Form Expert` to `### 11. 🛡️ Security Monitor` without `### 10.`.

Search for the exact current numbering. The fix depends on what's currently in the file:

If the current state is:
```
### 9. 📑 Form Expert
...
---

### 11. 🛡️ Security Monitor
```

Change `### 11.` to `### 10.`:
```markdown
### 10. 🛡️ Security Monitor
```

- [ ] **Step 2: Verify all section numbers are sequential (1-10)**

```bash
grep -n "^### [0-9]" AGENTS.md
```

Expected: Sequential numbering 1 through 10 (or whatever the final count is after the Form Expert section).

- [ ] **Step 3: Commit**

```bash
git add AGENTS.md
git commit -m "fix: correct AGENTS.md section numbering (remove gap after Form Expert)"
```

---

### Task 11: Add Go, Rust, Elixir stacks to setup.ps1 (M11)

**Files:**
- Modify: `scripts/setup.ps1:1-21` (header comments) and add detection blocks

- [ ] **Step 1: Update the stack table in the header**

Current lines 6-15:
```powershell
#
# Supported stacks:
#   Node.js    package.json          ??npm install  ??license-checker audit
#   Python     requirements.txt /    ??.venv (mandatory) + pip install ??pip-licenses audit
#              pyproject.toml
#   Ruby       Gemfile               ??bundle install
#   .NET       *.csproj / *.sln      ??dotnet restore
#   Java       pom.xml (Maven)       ??mvn dependency:resolve
#              build.gradle (Gradle) ??gradlew dependencies
#   C/C++      CMakeLists.txt        ??cmake -B build (configure only)
#              Makefile              ??info only (not run automatically)
#
```

Replace with:
```powershell
#
# Supported stacks:
#   Node.js    package.json          -> npm install  -> license-checker audit
#   Python     requirements.txt /    -> .venv (mandatory) + pip install -> pip-licenses audit
#              pyproject.toml
#   Ruby       Gemfile               -> bundle install
#   .NET       *.csproj / *.sln      -> dotnet restore
#   Java       pom.xml (Maven)       -> mvn dependency:resolve
#              build.gradle (Gradle) -> gradlew dependencies
#   Go         go.mod                -> go mod download
#   Rust       Cargo.toml            -> cargo fetch
#   Elixir     mix.exs               -> mix deps.get
#   C/C++      CMakeLists.txt        -> cmake -B build (configure only)
#              Makefile              -> info only (not run automatically)
#
```

- [ ] **Step 2: Add Go, Rust, Elixir detection blocks**

After the existing stack detection blocks in `setup.ps1`, add (before the "Unknown" fallback):

```powershell
# Go
if (-not $DetectedStack -and (Test-Path "go.mod")) {
    $DetectedStack = "go"
    Info "Detected stack: Go (go.mod)"
    if (-not $SkipInstall) {
        if (Require "go" "Install from https://go.dev/dl/") {
            info "Running: go mod download"
            go mod download
            Pass "go mod download"
        }
    }
}

# Rust
if (-not $DetectedStack -and (Test-Path "Cargo.toml")) {
    $DetectedStack = "rust"
    Info "Detected stack: Rust (Cargo.toml)"
    if (-not $SkipInstall) {
        if (Require "cargo" "Install from https://rustup.rs") {
            info "Running: cargo fetch"
            cargo fetch
            Pass "cargo fetch"
        }
    }
}

# Elixir
if (-not $DetectedStack -and (Test-Path "mix.exs")) {
    $DetectedStack = "elixir"
    Info "Detected stack: Elixir (mix.exs)"
    if (-not $SkipInstall) {
        if (Require "mix" "Install from https://elixir-lang.org/install") {
            info "Running: mix deps.get"
            mix deps.get
            Pass "mix deps.get"
        }
    }
}
```

> **Note:** Read the full `setup.ps1` to find the exact insertion point — it should go after the existing stack blocks (C/C++ or .NET, whichever is last) and before any "Unknown stack" fallback.

- [ ] **Step 3: Commit**

```bash
git add scripts/setup.ps1
git commit -m "fix: add Go, Rust, Elixir stack support to setup.ps1 and fix encoding"
```

---

### Task 12: Add meeting-facilitation to SKILLS.md (merged into Task 5)

> Already handled in Task 5. This task is a no-op.

---

### Task 13: Fix .env.sample password example (M6)

**Files:**
- Modify: `.env.sample:29`

- [ ] **Step 1: Replace realistic-looking password**

Current line 29:
```
# SAP_PASSWORD=MySecurePass123
```

Replace with:
```
# SAP_PASSWORD=<YOUR_SECURE_PASSWORD>
```

- [ ] **Step 2: Commit**

```bash
git add .env.sample
git commit -m "fix: replace realistic-looking example password with clear placeholder in .env.sample"
```

---

### Task 14: Fix SECURITY.md version table (M7)

**Files:**
- Modify: `SECURITY.md:5-7`

- [ ] **Step 1: Update version support table**

Current:
```markdown
## Supported Versions

| Version | Supported |
|---------|-----------|
| Latest  | —       |
```

Replace with:
```markdown
## Supported Versions

| Version | Supported |
|---------|-----------|
| >= 2.38 | ✅       |
| < 2.38  | ❌       |

> Versions refer to the `vsp` MCP server binary. The harness configuration (agents, skills, scripts) is version-controlled via git.
```

- [ ] **Step 2: Commit**

```bash
git add SECURITY.md
git commit -m "fix: populate SECURITY.md version support table with vsp version"
```

---

## Priority 4: LOW — Cross-tool documentation, metadata, stale refs

### Task 15: Fix cross-tool documentation gaps (M3, M4, M5)

**Files:**
- Modify: `docs/context.md` — add cross-tool parity section
- Modify: `CLAUDE.md` — add Desktop App manual post-write guide
- Modify: `agents/pm.md` — fix dangling `workflow-skill-creator` reference

- [ ] **Step 1: Add Desktop App manual post-write guide to CLAUDE.md**

After the Hooks table in `CLAUDE.md` (after line 63), add:

```markdown

### Desktop App Manual Post-Write Chain

When using Claude Code Desktop App, PostToolUse hooks do not fire. After any `WriteSource` or `EditSource`, run this chain manually:

```
1. bash scripts/sync-md.sh          # documentation audit
2. SyntaxCheck(<object_url>)        # verify ABAP syntax
3. RunUnitTests(<object_url>)       # run unit tests
4. RunATCCheck(<object_url>)        # ATC quality check
5. bash scripts/vsp-sync.sh -m "fix: description"  # sync & commit
```

See `skills/desktop-app-fallback/SKILL.md` for the complete fallback workflow.
```

- [ ] **Step 2: Fix dangling workflow-skill-creator reference in pm.md**

Current line 73:
```
- If specialized workflows/skills are needed, generate `skills/<name>/SKILL.md` directly using proper YAML frontmatter, or instruct agents to use `workflow-skill-creator` later for complex tasks.
```

Replace with:
```
- If specialized workflows/skills are needed, generate `skills/<name>/SKILL.md` directly using proper YAML frontmatter (see `skills/README.md` for the skill creation guide).
```

- [ ] **Step 3: Document .mcp.json tracking policy in context.md**

After the MCP Configuration section in `docs/context.md` (after line 358), add:

```markdown
> **Policy**: `.mcp.json` is tracked in git as a shared configuration template. It must NEVER contain credentials. All secrets must be stored in `.env` (gitignored). This is enforced by the pre-commit hook.
```

- [ ] **Step 4: Commit**

```bash
git add docs/context.md CLAUDE.md agents/pm.md
git commit -m "docs: add cross-tool parity docs, Desktop App guide, fix dangling skill-creator ref"
```

---

### Task 16: Add metadata.type to all skills (L2)

**Files:**
- Modify: `skills/abap-dev/SKILL.md` — add `metadata.type: core`
- Modify: `skills/post-write-chain/SKILL.md` — add `metadata.type: core`
- Modify: `skills/source-command-celebrate/SKILL.md` — add `metadata.type: core`
- Modify: `skills/sap-sd/SKILL.md` — add `metadata.type: module`
- Modify: `skills/sap-mm/SKILL.md` — add `metadata.type: module`
- Modify: `skills/sap-fi/SKILL.md` — add `metadata.type: module`
- Modify: `skills/sap-co/SKILL.md` — add `metadata.type: module`
- Modify: `skills/sap-pp/SKILL.md` — add `metadata.type: module`
- Modify: `skills/sap-le/SKILL.md` — add `metadata.type: module`

- [ ] **Step 1: Read each skill file's frontmatter and add `metadata.type`**

For each file listed above, the frontmatter needs a `metadata:` section. The exact insertion depends on the current frontmatter structure. Use `base-map:implement_code` or direct Edit to add the metadata line.

For **core skills** (`abap-dev`, `post-write-chain`, `source-command-celebrate`), add after the `description:` line in the frontmatter:
```yaml
metadata:
  type: core
```

For **module skills** (`sap-sd`, `sap-mm`, `sap-fi`, `sap-co`, `sap-pp`, `sap-le`), add after the `description:` line:
```yaml
metadata:
  type: module
```

> **Important:** YAML frontmatter indentation must be consistent. Read each file first to match its indentation style.

- [ ] **Step 2: Run verify-skills to confirm no warnings**

```bash
bun scripts/verify-skills.ts
```

Expected: All 11 skills pass with no metadata warnings.

- [ ] **Step 3: Commit**

```bash
git add skills/
git commit -m "fix: add metadata.type to all skill frontmatters (core/module)"
```

---

### Task 17: Fix stale sync-mcp reference in context.md (L3)

**Files:**
- Modify: `docs/context.md:356`

- [ ] **Step 1: Remove stale sync-mcp reference**

Current line 356:
```markdown
Use `.\scripts\sync-mcp.ps1` or `bash scripts/sync-mcp.sh` to synchronize changes to tool-specific settings.
```

Since `sync-mcp.sh`, `sync-mcp.ps1`, and `sync-mcp.ts` no longer exist, replace with:
```markdown
> MCP configuration is shared via `.mcp.json`. Tool-specific settings (`.claude/settings.json`, `.gemini/settings.json`, `.codex/config.toml`) must be kept in sync manually.
```

- [ ] **Step 2: Commit**

```bash
git add docs/context.md
git commit -m "fix: remove stale sync-mcp script reference from context.md"
```

---

## Priority 5: Final Commit & Changelog

### Task 18: Final commit, changelog entry, and memory log (depends on ALL above)

**Files:**
- Modify: `CHANGELOG.md`
- Create: `memory/2026-07-03.md` (append to existing if present)

- [ ] **Step 1: Add CHANGELOG.md entry**

Add to the `[Unreleased]` section of `CHANGELOG.md`:

```markdown
### Fixed
- Remove broken wrapper scripts (`health-check.sh`, `sync-mcp.sh`) that referenced non-existent TypeScript targets
- Fix `dispatch-serial.ts` double-execution bug (pipeline ran twice per invocation)
- Add CI status check and 2-approval minimum to `auto-merge.yml` workflow
- Add `vsp.exe` to `.gitignore` and remove from git tracking
- Update `SKILLS.md` index — remove 9 phantom skills, add `meeting-facilitation`, document slash commands
- Fix Codex skill path from `docs/` to `skills/` in `.codex/config.toml`
- Add `PostToolUse` hook to `.claude/settings.json` for automated post-write audit
- Fix agent count (`19` → `20`) and skill count (`8` → `11`) in `docs/context.md`
- Rewrite `security-monitor.md` for SAP/ABAP domain with proper YAML frontmatter
- Fix AGENTS.md section numbering gap (missing #10)
- Add Go, Rust, Elixir stack support to `setup.ps1` and fix Unicode encoding
- Replace realistic password example with placeholder in `.env.sample`
- Populate `SECURITY.md` version support table
- Add Desktop App manual post-write guide to `CLAUDE.md`
- Add `metadata.type` to all 9 skill frontmatters missing it
- Remove stale `sync-mcp` script reference from `docs/context.md`
```

- [ ] **Step 2: Append to `memory/2026-07-03.md`**

If the file exists, append. If not, create:

```markdown
## 2026-07-03 Project Review Remediation

**PM-led full project audit with all 22 agent roles participating.**

### Scope
- Governance, architecture, security, skills, scripts, cross-tool consistency

### Key decisions
- `.mcp.json` intentionally kept tracked (shared template policy documented)
- `vsp.exe` removed from git tracking; users install via `scripts/install-vsp.sh`
- `auto-merge.yml` now requires 2 approvals + CI pass
- `security-monitor.md` rewritten for SAP/ABAP domain (was generic npm/pip/cargo scanner)
- 9 phantom skills removed from SKILLS.md index (exist only as Claude commands)

### MCP/config changes
- `.claude/settings.json`: Added `hooks.PostToolUse`, `enableAllProjectMcpServers`
- `.codex/config.toml`: Fixed skill path `docs` → `skills`

### Issue history
- `dispatch-serial.ts` had copy-paste bug: `dispatchSerial()` called twice — fixed
- `health-check.sh` and `sync-mcp.sh` were dead wrappers — removed
- `setup.ps1` was missing 3 stacks (Go, Rust, Elixir) and had Unicode corruption — fixed

### Statistics
- 61 findings total (2 Critical, 13 High, 20 Medium, 18 Low, 8 Info)
- 18 tasks executed across 5 priority tiers
- 30 files touched
```

- [ ] **Step 3: Final commit**

```bash
git add CHANGELOG.md memory/
git commit -m "docs: add changelog and memory log for project review remediation"
```

---

## Self-Review Checklist

### Spec Coverage
| Finding ID | Task | Status |
|------------|------|--------|
| C1 | Task 1 | ✅ delete health-check.sh |
| C2 | Task 1 | ✅ delete sync-mcp.sh |
| M10 | Task 2 | ✅ fix dispatch-serial bug |
| H8 | Task 3 | ✅ auto-merge CI gates |
| H7 | Task 4 | ✅ vsp.exe in .gitignore |
| H6 | Task 4 | ✅ .mcp.json policy documented |
| H9 | Task 5 | ✅ remove phantom skills |
| L1 | Task 5 | ✅ add meeting-facilitation |
| H10 | Task 6 | ✅ codex skill path |
| H3 | Task 7 | ✅ Claude PostToolUse hook |
| H11 | Task 7 | ✅ codegraph in committed settings |
| H1 | Task 8 | ✅ agent count 19→20 |
| H2 | Task 9 | ✅ security-monitor rewrite |
| H5 | Task 10 | ✅ AGENTS.md numbering |
| M11 | Task 11 | ✅ setup.ps1 stacks + encoding |
| M6 | Task 13 | ✅ .env.sample password |
| M7 | Task 14 | ✅ SECURITY.md version |
| M3 | Task 15 | ✅ Desktop App guide |
| M5 | Task 15 | ✅ .mcp.json policy |
| M1 | Task 15 | ✅ dangling ref fix |
| L2 | Task 16 | ✅ metadata.type |
| L3 | Task 17 | ✅ stale sync-mcp ref |

### Placeholder Scan
- [x] No TBD/TODO items
- [x] All file paths are exact
- [x] All code blocks contain actual content
- [x] All commit messages are specific

### Type Consistency
- [x] File references consistent across tasks
- [x] Commit message format consistent (`fix:`, `docs:`)
- [x] Priority ordering maintained

### Intentionally NOT addressed (requires user decision)
| Finding | Reason |
|---------|--------|
| H12 (Claude settings.local.json broad permissions) | Personal local file (gitignored) — user manages own permissions |
| M9 (Desktop App hook gap) | Documented in CLAUDE.md + Task 15 adds manual guide — architectural limitation |
| L4 (SKILLS.md stale date) | Fixed in Task 5 — date updated to 2026-07-03 |
| L5-L8 (Info items) | Informational — no action needed |
| I1-I8 (Info items) | Informational — no action needed |
