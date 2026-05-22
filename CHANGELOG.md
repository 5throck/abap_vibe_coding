# Changelog

All notable changes to **abap-harness-engineering** (main project harness) are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versions follow [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Fixed (2026-05-22 Skill Command Wrappers)
- `.claude/commands/abap-dev.md`: New wrapper — registers `abap-dev` skill for Skill tool invocation
- `.claude/commands/sap-sd/mm/fi/co/le/pp.md`: Six new wrappers — all SAP module skills now invocable via `Skill("sap-*")`
- `.claude/commands/post-write.md`: Converted from standalone duplicate to thin wrapper delegating to `skills/post-write-chain/SKILL.md` (single source of truth)

### Changed (2026-05-22)
- `scripts/audit.sh` / `audit.ps1`: New standard audit entry point (replaces vsp-audit as primary)
- `scripts/vsp-audit.sh` / `vsp-audit.ps1`: Now legacy wrappers delegating to audit.sh/ps1
- `scripts/sync-md.sh` / `sync-md.ps1`: Updated to call audit.sh/ps1 directly

### Added (2026-05-22 Inventory Management Design)
- `docs/superpowers/specs/2026-05-22-inventory-management-design.md`: Design document for custom inventory management system with Z tables (ZTINV_REQ, ZTINV_REQ_IT, ZTINV_STOCK) handling Goods Receipt and Goods Issue

### Added (2026-05-21 Memory Log)
- `memory/2026-05-21.md`: Session log for 2026-05-21 — consistency audit, dispatch-card refactor, BAPI lifecycle expansion, Project Constitution compliance
- `memory/MEMORY.md`: Updated index with 2026-05-21 entry; Last Updated bumped

### Added (2026-05-21 Git Hook Configuration)
- `.githooks/pre-commit`: Added Git hook to enforce `CHANGELOG.md` updates on every commit.
- `.githooks/pre-push`: Added Git hook to block direct pushes to `main` branch; enforces PR-based workflow.
- `.github/workflows/auto-merge.yml`: Added GitHub Actions workflow that automatically Squash & Merges a PR when it receives an "Approved" review.

### Added (2026-05-21 Project Constitution Compliance)
- `scripts/dev-sync.sh` / `dev-sync.ps1`: Added Project Constitution §3 standard entry-point wrappers delegating to `vsp-sync.sh` / `vsp-sync.ps1`
- `docs/context.md`: Added `Project Overview`, `Tech Stack`, `Agents`, and `Skills` summary sections per Project Constitution §7 required sections
- `CLAUDE.md`: Added `.claude/commands/` listing with slash command inventory; added note clarifying root `commands/` folder is legacy; updated Last Updated to 2026-05-21

### Changed (2026-05-21 Project Constitution Compliance)
- `.claude/commands/sync.md`: Updated script invocation from `vsp-sync.sh` → `dev-sync.sh` to align with Project Constitution §3 standard

### Added (2026-05-21 BAPI Coverage Expansion)
- `skills/sap-sd/SKILL.md`: Added `BAPI_SALESORDER_CHANGE` (Sales Order Change) and `BAPI_BILLINGDOC_CREATEMULTIPLE` (Billing Document Creation); expanded `BAPI_OUTB_DELIVERY_CREATE_SLS` stub to full parameter documentation; fixed typo `TARGET_QUY` → `TARGET_QTY` in `BAPI_SALESORDER_CREATEFROMDAT2`
- `skills/sap-mm/SKILL.md`: Added `BAPI_PO_CHANGE` (Purchase Order Change) and `BAPI_MATERIAL_SAVEDATA` (Material Master Save); expanded existing BAPIs with additional parameter detail
- `skills/sap-fi/SKILL.md`: Added `BAPI_ACC_DOCUMENT_REV_POST` (Document Reversal) and `BAPI_INCOMINGINVOICE_CREATE` (Incoming Invoice / MIRO equivalent); expanded `BAPI_ACC_DOCUMENT_POST` with full parameter detail
- `skills/sap-co/SKILL.md`: Added `BAPI_COSTCENTER_CHANGE` (Cost Center Change) and `BAPI_INTERNALORDER_CREATE` (Internal Order Create); expanded existing BAPIs with additional parameter detail
- `skills/sap-pp/SKILL.md`: Added `BAPI_PRODORD_RELEASE` (Production Order Release) and `BAPI_PRODORD_COMPLETE_CONF` (Production Order Confirmation)
- `skills/sap-le/SKILL.md`: Added `BAPI_OUTB_DELIVERY_CONFIRM_DEC` (Delivery Goods Issue Confirmation/Cancellation) and `BAPI_WHSE_TO_CONFIRM` (WM Transfer Order Confirmation)

### Changed (2026-05-21 PM card + Architect Technical Lead)
- `AGENTS.md`: PM entry converted to dispatch-card format — removed redundant §5 Finalization steps and Responsibilities bullets (detail lives in `agents/pm.md`); added `Entry point` and `Subagent prompt` fields
- `AGENTS.md`: Architect designated as **Technical Execution Lead** — role explicitly stated in Technical Group intro and Architect card; added `Technical Lead responsibilities` field
- `agents/architect.md`: Opening statement updated to reflect Technical Execution Lead role — single point of contact between PM and Technical Group

### Changed (2026-05-21 AGENTS.md Refactoring)
- `AGENTS.md`: Refactored Business Group analyst entries (SD/LE/PP/MM/FI/CO) to dispatch-card format — removed redundant `Allowed Tools` and `Output Format` skeleton blocks; renamed `Context file` → `Subagent prompt`; deduplicated trigger keyword lists
- `AGENTS.md`: Refactored Technical Group entries (Architect/ABAP Developer/QA Engineer/DBA/DevOps/Intelligence Investigator/Interface Expert/Fiori Developer/Form Expert/GUI Scripter) to dispatch-card format — replaced `Responsibilities` detail bullets with `When to dispatch` + `Output` summary; added missing `Subagent prompt` links to all agents (`code-writer.md`, `test-runner.md`, `dba.md`, `devops-admin.md`, `sap-investigator.md`, `interface-expert.md`, `fiori-developer.md`, `form-expert.md`, `gui-scripter.md`)
- `AGENTS.md`: Added Technical Group intro note directing readers to `agents/*.md` for full behavioral rules
- `AGENTS.md`: Updated Last Updated to 2026-05-21

### Fixed (2026-05-21 Consistency Audit)
- `GEMINI.md`: Removed `browser_subagent` reference from Multi-Agent Coordination section; corrected "single tool" description — hyperfocused mode exposes all 101 operations via `sap_execute`
- `docs/tooling-matrix.md`: Removed `browser_subagent` from PM dispatch cell and Default Rule note; renamed "Web research / browser subagent" row to "Web research"; updated Last Updated to 2026-05-20
- `docs/setup-guide.md`: Removed `browser_subagent` from §8-C; corrected Appendix B mode table (hyperfocused = "101 ops via sap_execute", not "1 tool"); fixed `VSP_MODE` → `SAP_MODE` in Appendix B; clarified §5-D note; updated to version 1.7 / 2026-05-20
- `docs/plugin-setup.md`: Fixed `VSP_MODE` → `SAP_MODE` and `VSP_ALLOWED_PACKAGES` → `SAP_ALLOWED_PACKAGES` in §3 `.env` template
- `docs/mcp_usage.md`: Fixed `VSP_FEATURE_TRANSPORT/RAP/UI5` → `SAP_FEATURE_*` throughout Specialized Tools section; corrected Mode Selection Guide to accurately describe hyperfocused as 101-op routing
- `AGENTS.md`: Removed non-existent `harness:memory-intelligence` skill reference from Intelligence Investigator; fixed CO trigger keyword `CSKP` → `CSKB`; corrected Role Boundary Matrix: "Analyse ABAP source logic" now maps to `architect` (not `sap-investigator`)
- `agents/sap-investigator.md`: Fixed CO pattern `CSKP` → `CSKB`; added `GetSource` to tools list for pattern-context verification
- `docs/testing-guidelines.md`: Fixed §Logging ATC Results to reference "active task file" not "task-template.md"; updated Last Updated to 2026-05-20
- **C-08 verified non-issue**: `agents/architect.md` already contained `GetCDSImpactAnalysis` — no change needed

### Fixed
- `AGENTS.md`: Removed 5 incorrect `browser_subagent` references from Form Expert, GUI Scripter, Fiori Dev (Design Mode), and Dispatch Sequences table — tool does not exist in vsp MCP server (IMP-01)
- `docs/context.md`: Clarified that `hyperfocused` mode registers all 101 individual MCP tools, not a single unified tool — addresses Interface Expert tool availability concern (IMP-02)

### Added
- `AGENTS.md`: Cross-Module Integration Orchestration section — parallel activation rule, PRD ownership policy, primary analyst designation, and 4 standard scenario templates (SD-FI, MM-FI, SD-LE, PP-MM) (IMP-09)
- `docs/context.md`: Deployed vsp Binary version table (`v2.38.1`, built 2026-04-07) (IMP-05)
- `docs/context.md`: Canonical ABAP SQL Reference section for all agents (DESCENDING, max_rows, tilde notation, anti-patterns) (IMP-08)
- `scripts/vsp-audit.ps1` / `vsp-audit.sh`: Check 6 — reports vsp binary version on each audit run (IMP-05)
- `agents/architect.md`: Pattern C partial-failure rollback procedure — 5-step recovery process when multi-object refactor aborts mid-sequence (IMP-04)
- `docs/testing-guidelines.md`: ATC Priority-2 Escalation Workflow — three disposition options (Fix / Suppress-with-justification / Defer) with recording location and decision criteria (IMP-03)
- `docs/testing-guidelines.md`: ABAP Unit Test Skeleton section with method naming convention and AAA pattern reference (IMP-10)
- `scratch/stable/z_unit_test_skeleton.clas.abap`: Reference ABAP Unit test skeleton with TEST-SEAM injection pattern (IMP-10)
- `agents/sap-investigator.md`: 6 cross-module pattern groups — SD-FI, MM-FI, SD-LE, PP-MM, LE extended, PP extended (IMP-06)
- `skills/sap-co/SKILL.md`, `sap-pp/SKILL.md`, `sap-le/SKILL.md`: Strategic BAPIs & APIs section added to complete all 8 required skill sections (IMP-07)
- `scratch/tasks/task-2026-05-20-001` through `-010`: Task handoff files for all 10 improvement items from 2026-05-20 all-hands review meeting

### Changed
- `agents/test-runner.md`: ATC P2 standard updated to reference new escalation workflow (IMP-03)
- `docs/task-template.md`: Rollback Plan table added to §2 Technical Design; P2 Disposition field added to §4.2 ATC Check Results (IMP-03, IMP-04)
- `agents/read-only-analyst.md`: Inline ABAP SQL Quick Reference replaced with canonical reference pointer to `docs/context.md` (IMP-08)
- `agents/dba.md`: SQL syntax rule reference added to behavior rules (IMP-08)
- `agents/interface-expert.md`: Confirmed tool availability note added to `## Your Tools` section (IMP-02)

---

## [0.5.0] — 2026-05-20

### Fixed
- `docs/setup-guide.md §9`: Rewrote ZADT_VSP installation section with mandatory order warning (9-A → 9-C → 9-D)
- `docs/setup-guide.md §9-C`: Expanded SAPC and SICF finalization into step-by-step field-by-field guides with exact transaction codes, navigation paths, failure recovery instructions, and `⚠️ mandatory — do not skip` warning
- `docs/setup-guide.md §9-D`: Added failure checklist (SAPC handler, SICF active status, `S_BTCH_ADM` authorization)
- `docs/setup-guide.md §12`: `VSP_ALLOWED_PACKAGES` → `SAP_ALLOWED_PACKAGES` (prefix consistency)
- `docs/antigravity-setup.md`: `VSP_MODE`, `VSP_ALLOWED_PACKAGES`, `VSP_FEATURE_*` → `SAP_*` prefix throughout
- `scripts/install-vsp.sh`: Added step 4 in Next steps — ZADT_VSP install and SAP GUI finalization reminder with §9-C reference; corrected example port `8080` → `44300`
- `scripts/install-vsp.ps1`: Same as above for Windows

### Changed
- `AGENTS.md`: Strengthened preamble with explicit `⚠️ For AI tools reading this file` warning — clarifies this is a registry/orchestration reference, not behavioral instructions; redirects each tool to its own config file (`CLAUDE.md`, `GEMINI.md`, `.codex/config.toml`)
- `AGENTS.md`: Subtitle updated from "Agent Definitions" to "Agent Registry & Orchestration Contract"

---

## [0.4.0] — 2026-05-19

### Added
- `docs/tooling-matrix.md`: New file — Tool Selection Rule table and Hook Behavior table comparing Claude Code CLI, Desktop App, Gemini CLI, and Antigravity
- `AGENTS.md`: Agent Role Boundary Matrix — research agent disambiguation, technical agent boundaries, analyst trigger keywords, and escalation rules
- `docs/context.md`: Directory Reference table documenting all 9 project directories with Git-tracking status
- `docs/context.md`: Documentation Language rule extended to cover git artifacts (commit messages, PR titles, branch names)
- `C:/git/CLAUDE.md`: Git Conventions section requiring English for all git artifacts

### Fixed
- `agents/pm.md`: `color: gold` → `color: yellow`; removed non-existent `browser_subagent` tool reference
- `agents/devops-admin.md`: `color: orange` → `color: yellow`
- `agents/dba.md`, `read-only-analyst.md`, `sap-investigator.md`, `schema-inspector.md`: `color: purple` → `color: magenta`
- `.codex/config.toml`: All `VSP_*` env vars → `SAP_*` prefix (`VSP_MODE` → `SAP_MODE`, etc.)
- `scripts/vsp-audit.ps1`: Enforced script pairing (removed `sync-md` exemption, activated `$failed = $true`); added Check 5 — MCP prefix consistency
- `scripts/vsp-audit.sh`: Removed `install-vsp` exemption from pairing check; added Check 5 — MCP prefix consistency

---

## [0.3.0] — 2026-05-19

### Added
- `docs/plugin-setup.md`: Dedicated plugin installation guide (marketplace vs. standalone flows)
- `scripts/vsp-publish.sh` / `.ps1`: Automated packaging and publishing pipeline scripts
- `scripts/sync-md.sh` / `.ps1`: Cross-platform hook wrapper for PostToolUse audit trigger
- `docs/tooling-matrix.md`: Initial tooling comparison (superseded by v0.4.0 version)

### Changed
- `AGENTS.md`: Consolidated common session rules (memory logging, documentation language, file isolation, post-write chain, git reflection) into single authoritative section
- `docs/context.md`: Established as single source of truth for shared engineering content; removed duplicated sections from `CLAUDE.md` and `GEMINI.md`
- `CLAUDE.md` / `GEMINI.md`: Reduced to platform-specific adapter files with links to `docs/context.md`
- MCP documentation server domains updated to `marianzeis.de` endpoints (`mcp-abap.marianzeis.de`, `mcp-sap-docs.marianzeis.de`)
- `scratch/` restructured into `scratch/tasks/` (active task files), `scratch/stable/` (read-only ABAP snapshots), `scratch/temp/` (throwaway, not committed)

### Fixed
- `scripts/vsp-audit.ps1`: Script pairing check hardened; `.ps1` / `.sh` pair enforcement activated
- `scripts/vsp-audit.sh`: Script pairing check fixed for Windows Git Bash compatibility
- `.mcp.json.sample`: MCP URLs corrected to live `marianzeis.de` endpoints
- Agent YAML frontmatter errors corrected across multiple agent files
- Git worktree paths repaired in hook configuration

---

## [0.2.0] — 2026-05-19

### Added
- `agents/interface-expert.md`: New Interface Expert agent for RFC/BAPI/IDoc integration
- Subagent parallel execution framework: `§0-A` dispatch block pattern in `AGENTS.md`
- SAP module analyst agents elevated with full execution context (SD, MM, FI, CO, PP, LE)
- `scripts/`: `vsp-sync.sh` / `.ps1`, `vsp-task.sh` / `.ps1`, `vsp-audit.sh` / `.ps1`
- `.claude/settings.json`: Team-shared permissions committed to repo
- `.codex/config.toml` and `.codex/hooks.json`: Codex tool configuration
- `docs/setup-guide.md`: Comprehensive multi-platform environment setup guide (SAP, Claude Code, Gemini CLI, Antigravity)
- `docs/antigravity-setup.md`: Antigravity VS Code extension configuration guide
- `docs/security.md`: Security and sanitization rules
- `docs/mcp_usage.md`: MCP tool usage patterns and critical limitations (ABAP SQL syntax)

### Changed
- `AGENTS.md`: PM-led governance model established; triage → dispatch → QA → finalization workflow
- `README.md`: Updated with Harness Engineering concept and PM-led workflow
- SAP connection config migrated from `.vsp.json` to `.env` file

### Fixed
- `ZCL_VSP_APC_HANDLER`: Added `S_DEVELOP` authority check for security hardening
- `ZPROG_SBOOK_QUERY`: Refactored to OO-ABAP pattern

---

## [0.1.0] — 2026-05-01

### Added
- Initial commit: vsp ABAP development harness framework
- `docs/context.md`: Shared engineering context (vsp build commands, codebase map)
- `AGENTS.md`: Initial agent role definitions (Business Group + Technical Group)
- `CLAUDE.md`: Claude Code configuration
- `GEMINI.md`: Gemini CLI configuration
- `agents/`: Core agent definitions — pm, architect, code-writer, dba, devops-admin, fiori-developer, form-expert, gui-scripter, test-runner, read-only-analyst, sap-investigator, schema-inspector
- `agents/`: SAP module analysts — sd, mm, fi, co, pp, le
- `skills/abap-dev/SKILL.md`: SAP development workflows and MCP optimization
- `skills/post-write-chain/SKILL.md`: Mandatory QA chain (SyntaxCheck → RunUnitTests → RunATCCheck)
- `commands/`: triage, new-task, sync, transport, post-write, memlog, celebrate
- `.mcp.json`: MCP server configuration (vsp hyperfocused mode, abap-docs, sap-docs)
- `memory/`: Date-stamped development log directory
- `scratch/`: Working directory for ABAP sources and task files
- `LICENSE`: AGPL-3.0-only
