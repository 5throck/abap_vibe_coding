# Project Review Remediation Plan

> **Status: COMPLETED 2026-07-10** — all 30 findings remediated (PR #82/#83); Task 11 Step 3
> (stale `agent-lifecycle-audit.ts` reference) finished in the 2026-07-10 follow-up session.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
> **Execution method:** base MCP (`mcp__base-map__implement_code`) for code generation, direct file Edit/Write for non-code changes.

**Goal:** Fix all 30 findings from the PM-led project review (2026-07-09), prioritized by severity.
**Design:** `docs/superpowers/specs/2026-07-09-project-review-remediation-design.md`

---

## Priority 1: CRITICAL (4 Tasks)

### Task 1: Fix sync-skills.ts Phase 2 path.sep bug (C-2)

**Files:** `scripts/sync-skills.ts` (line 110)
**Depends on:** None

- [x] **Step 1:** Replace `path.sep` concatenation with `path.normalize()` in Phase 2 filter
  - Current: `platformTargets.filter((t) => !t.includes(".agents" + path.sep + "skills"))`
  - Fix: Use normalized path comparison or string-based check that works on all OS
- [x] **Step 2:** Move `shortcutSkillNames` to a well-documented constant near the top of the file
- [x] **Step 3:** Verify Phase 1 and Phase 2 produce identical results on Windows (Git Bash)

### Task 2: Expand dev-sync.ts security guard to scan staged index (C-1)

**Files:** `scripts/dev-sync.ts` (lines 126-141)
**Depends on:** None

- [x] **Step 1:** Keep existing untracked file check as-is
- [x] **Step 2:** Add staged file check using `git diff --cached --name-only`
- [x] **Step 3:** Apply same `sensitivePattern` regex to staged file list
- [x] **Step 4:** Add content-level pattern scan for staged files (check for `PASSWORD`, `SECRET`, `TOKEN`, `API_KEY` patterns in file content using `git diff --cached`)
- [x] **Step 5:** If sensitive staged files detected, unstage them (`git reset HEAD <file>`) and abort with clear message

### Task 3: Fix CHANGELOG.md regressions + dev-sync.ts changelog parser (C-4)

**Files:** `CHANGELOG.md`, `scripts/dev-sync.ts` (lines 85-107)
**Depends on:** None (includes Task 14 categoryMap fix)

- [x] **Step 1:** Fix CHANGELOG.md `[Unreleased]` section:
  - Unescape all backslash-escaped entries: `feat\:` → `feat:`, `chore\:\ bump` → `chore: bump`
  - Fix 6 affected lines (lines 16, 19, 22, 34, 57, 61)
- [x] **Step 2:** Recategorize misplaced entries:
  - `fix: pre-push hook...` → move from `### Added` to `### Fixed`
  - `chore: bump devDependencies...` → move to `### Changed`
  - `docs: update memory log...` → move to `### Changed`
  - `chore: sync ABAP inventory...` → move to `### Changed`
  - `docs: port mig improvements...` → move to `### Changed`
- [x] **Step 3:** Merge duplicate `### Added` headers into a single section
- [x] **Step 4:** Fix `dev-sync.ts` categoryMap:
  - `docs` → `### Added` (documentation additions are new features)
  - `style` → `### Changed` (already correct)
- [x] **Step 5:** Add dedup check: before inserting a category header, verify it doesn't already exist in the `[Unreleased]` section
- [x] **Step 6:** Verify CHANGELOG.md renders correctly (no escaped chars visible)

### Task 4: Introduce bun:test framework + write core tests (C-3)

**Files:** New `scripts/retry-handler.test.ts`, `scripts/verify-skills.test.ts`, `scripts/sync-md.test.ts`
**Depends on:** None

- [x] **Step 1:** Create `scripts/retry-handler.test.ts`:
  - Test `withRetry` success on first attempt
  - Test `withRetry` success after failures (exponential backoff)
  - Test `withRetry` exhaustion (maxRetries reached)
  - Test `classifyError` returns correct categories
  - Test `getRecoverySuggestion` returns non-empty string
- [x] **Step 2:** Create `scripts/verify-skills.test.ts`:
  - Test `extractSkillMetadata` with valid frontmatter
  - Test `extractSkillMetadata` with missing fields
  - Test `extractSkillMetadata` with no frontmatter
  - Test `verifySkill` with valid SKILL.md
  - Test `verifySkill` with empty content
- [x] **Step 3:** Create `scripts/sync-md.test.ts`:
  - Test MEMORY.md creation when file doesn't exist
  - Test entry append for new date
  - Test dedup: same date should not be appended twice
  - Test dedup: different date should be appended
- [x] **Step 4:** Add `"test": "bun test scripts/*.test.ts"` to root `package.json`
- [x] **Step 5:** Run `bun test` and verify all tests pass

---

## Priority 2: HIGH (10 Tasks)

### Task 5: Delete scripts/package.json, merge into root (H-1)

**Files:** `scripts/package.json` (delete), `package.json` (modify)
**Depends on:** None

- [x] **Step 1:** Verify root `package.json` already has all scripts from `scripts/package.json`
- [x] **Step 2:** Delete `scripts/package.json`
- [x] **Step 3:** Verify `bun scripts/*.ts` still works without nested package.json

### Task 6: Fix audit.ts CONSTITUTION.md check (H-6)

**Files:** `scripts/audit.ts` (lines 42-51)
**Depends on:** None

- [x] **Step 1:** Convert CONSTITUTION.md check to workspace-level check with `warn` instead of `fail`
- [x] **Step 2:** Add comment explaining this is a workspace-level artifact
- [x] **Step 3:** Add new check: verify `.mcp.json` exists (project-level, `pass`/`fail`)
- [x] **Step 4:** Add new check: verify `skills/` directory has at least 1 SKILL.md (project-level)

### Task 7: Fix dev-sync.ts session log format (H-8)

**Files:** `scripts/dev-sync.ts` (lines 56-61)
**Depends on:** None

- [x] **Step 1:** Change session log template from:
  ```
  ## <msg>
  - **Files**: <fileList>
  - **Purpose**:
  - **Decisions**:
  - **Issues**: None
  ```
  To match docs/context.md spec:
  ```
  ## <msg>
  - **Summary**: <summary from commit message>
  - **Changes**:
  - **Decisions**:
  - **Open Issues**: None
  ```
- [x] **Step 2:** Populate `**Changes**` field with the file list (currently under `**Files**`)
- [x] **Step 3:** Populate `**Summary**` field with the commit message

### Task 8: Fix dev-sync.ts git add and Co-Authored-By (H-3, H-4)

**Files:** `scripts/dev-sync.ts` (lines 177, 191)
**Depends on:** Task 2 (same file)

- [x] **Step 1:** Change `git add -A` to `git add .` (line 177)
- [x] **Step 2:** Add environment detection for Co-Authored-By:
  - Check `CLAUDE_CODE` or `ANTHROPIC_API_KEY` env var → "Claude"
  - Check `GEMINI_API_KEY` or `GOOGLE_API_KEY` env var → "Gemini"
  - Default → "AI Assistant"
- [x] **Step 3:** Update commit message template to use detected co-author

### Task 9: Deprecate git-sync.ts (H-9)

**Files:** `scripts/git-sync.ts`
**Depends on:** Task 5 (package.json)

- [x] **Step 1:** Add DEPRECATED header comment with migration instructions
- [x] **Step 2:** Add stderr warning on execution: "DEPRECATED: Use dev-sync.ts instead"
- [x] **Step 3:** Remove `git-sync` script from root `package.json`

### Task 10: Remove orphan references in .claude/settings.local.json (H-10)

**Files:** `.claude/settings.local.json`
**Depends on:** None

- [x] **Step 1:** Read current file and identify all orphan references:
  - `git-sync.sh` (line 68) — migrated to `git-sync.ts`
  - `dev-sync.sh` (line 101) — migrated to `dev-sync.ts`
  - `sync-mcp.ts` — script removed
  - `claude-md-management` — skill doesn't exist
  - `C:/git/__TRACKED_VAR__` paths (lines 44-49) — unresolved placeholders
- [x] **Step 2:** Remove all identified orphan entries from allowed-tools
- [x] **Step 3:** Verify settings.local.json is still valid JSON

### Task 11: Update docs/co-abap.context.md (H-7, H-2)

**Files:** `docs/co-abap.context.md`
**Depends on:** Tasks 6, 7, 9

- [x] **Step 1:** Update Skills table: expand from 4 entries to all 14 skills
- [x] **Step 2:** Update Scripts table:
  - Mark `git-sync.ts` as `deprecated` (replaced by `dev-sync.ts`)
  - Add `sync-skills.ts` entry
- [x] **Step 3:** Remove or clarify references to non-existent `agent-lifecycle-audit.ts` and `skill-lifecycle-audit.ts`
- [x] **Step 4:** Add note about workspace-level artifacts (CONSTITUTION.md) not required for this project

### Task 12: Create .github/workflows/ci.yml (H-5)

**Files:** New `.github/workflows/ci.yml`
**Depends on:** Task 4 (tests must exist)

- [x] **Step 1:** Create CI workflow with `pull_request` trigger
- [x] **Step 2:** Add job steps:
  1. Checkout code
  2. Setup Bun runtime
  3. `bun install`
  4. `bun test` (run all test files)
  5. `bun scripts/audit.ts` (workspace audit)
  6. `bun scripts/verify-skills.ts` (skill verification)
  7. `bun scripts/agent-verify.ts` (agent verification)
- [x] **Step 3:** Test workflow triggers correctly on PR creation

### Task 13: Fix sync-md.ts dedup check (M-3)

**Files:** `scripts/sync-md.ts` (line 39)
**Depends on:** None

- [x] **Step 1:** Replace `content.includes(`[${date}]`)` with regex:
  ```typescript
  const dedupPattern = new RegExp(`^\\| \\[${date}\\]\\(${date}\\.md\\) \\|`, 'm');
  if (!dedupPattern.test(content)) { ... }
  ```
- [x] **Step 2:** This prevents false matches when the date string appears elsewhere in the file

### Task 14: Fix dev-sync.ts changelog categoryMap (M-4)

**Files:** `scripts/dev-sync.ts` (lines 85-96)
**Depends on:** Included in Task 3

- [x] Covered by Task 3 Step 4 and Step 5

---

## Priority 3: MODERATE (10 Tasks)

### Task 15: dispatch.ts `any` type removal (M-1)

**Files:** `scripts/dispatch.ts`
- [x] Define `CliOptions` interface replacing `any`
- [x] Define `ParallelTask` interface for tasks array
- [x] Replace all `any` casts with proper types

### Task 16: verify-skills.ts parser improvement (M-2)

**Files:** `scripts/verify-skills.ts`
- [x] Add boundary check: verify second `---` is on its own line
- [x] Handle edge case where metadata value contains `---`
- [x] Add logging for parser failures

### Task 17: sync-skills.ts Phase 1 whitelist (sync-skills)

**Files:** `scripts/sync-skills.ts`
- [x] Modify `copyDirIfExists` to only copy `SKILL.md` files
- [x] Exclude `.DS_Store`, `.gitkeep`, and other non-skill files

### Task 18: AGENTS.md version date (M-5)

**Files:** `AGENTS.md`
- [x] Add `*Last Updated: 2026-07-09*` at the end of the file

### Task 19: CLAUDE.md/GEMINI.md checklist alignment (M-6)

**Files:** `CLAUDE.md`, `GEMINI.md`
- [x] Verify both have consistent 5-step session start
- [x] Document platform-specific overrides clearly

### Task 20: .agents/skills.json role clarification (M-7)

**Files:** `.agents/skills.json`
- [x] Add comments explaining: skills.json is ZCode runtime index, SKILLS.md is auto-generated human-readable catalog

### Task 21: githooks auto-install in setup.ts (M-8)

**Files:** `scripts/setup.ts`
- [x] Add `git config core.hooksPath .githooks` to setup script
- [x] Add check: only run if not already configured

### Task 22: pre-commit flow documentation (M-9)

**Files:** `.githooks/pre-commit` or docs
- [x] Add header comment explaining: hook modifies staged files, working directory may have uncommitted changes after commit

### Task 23: MCP config SSOT documentation (M-10)

**Files:** `docs/co-abap.context.md`
- [x] Expand MCP Configuration section with explicit SSOT statement and platform sync notes

### Task 24: dispatch-parallel.ts type fix

**Files:** `scripts/dispatch-parallel.ts`
- [x] Fix `(parts[3] as any)` → proper type cast with validation

---

## Priority 4: LOW (6 Tasks)

### Task 25-26: Code improvement TODOs

- [x] **Task 25:** Add `// TODO(cli): Consider Commander.js or yargs for robust CLI parsing` to dispatch.ts
- [x] **Task 26:** Add `// TODO(error): Replace substring-based error classification with Error.code` to retry-handler.ts

### Task 27: ABAP technical design template

**Files:** New `deliverables/templates/abap_technical_design.md`
- [x] Create generic ABAP report/program technical design template

### Task 28: .env.sample validation

**Files:** `.env.sample`
- [x] Verify all values are placeholders only (no real credentials)

### Task 29: AGENTS.md version date

- [x] Covered by Task 18

### Task 30: Scratch cleanup automation

- [x] Defer to future development (document as deferred in co-abap.context.md)

---

## Final Verification

After all tasks are complete:

```bash
bun test                          # All tests pass
bun scripts/audit.ts              # Exit code 0
bun scripts/verify-skills.ts      # All skills verified
bun scripts/agent-verify.ts       # All agents verified
bun scripts/sync-skills.ts        # Skills distributed correctly
```

---

*Last Updated: 2026-07-09*
