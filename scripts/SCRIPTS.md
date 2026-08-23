# SCRIPTS.md — Script Lifecycle Registry

> Auto-generated draft. Review and fill in the Guide section before committing.

---

## Registry

| script | source | version | status | removal-date | security-advisory | layer | pair |
|--------|--------|---------|--------|--------------|-------------------|-------|------|
| `agent-create.ts` | L0 | 1.0.1 | active | — | — | common | — |
| `agent-delete.ts` | L0 | 1.0.1 | active | — | — | common | — |
| `agent-lifecycle-audit.ts` | L0 | 1.1.5 | active | — | — | common | — |
| `agent-list.ts` | L0 | 1.1.0 | active | — | — | common | — |
| `agent-verify.ts` | L0 | 1.0.2 | active | — | — | common | — |
| `analyze-git-history.ts` | L0 | 1.0.2 | active | — | — | common | — |
| `archive-memory.ts` | L0 | 1.0.0 | active | — | — | common | — |
| `audit-variant.ts` | L2 | 1.0.0 | active | — | — | variant | co-abap integrity checks (gitleaks allowlist, MCP SAP guard, AGENTS.md markers, wrapper import paths) |
| `audit.ts` | L0 | 2.21.1 | active | — | — | common | — |
| `cleanup-completed-md.ts` | L0 | 1.1.0 | active | — | — | common | — |
| `clear-pm-approval.ts` | L0 | 1.0.0 | active | — | — | common | — |
| `compile-tokens.ts` | L0 | 1.0.0 | active | — | — | common | — |
| `dev-sync.ts` | L0 | 1.7.2 | active | — | — | common | — |
| `dispatch-parallel.ts` | L0 | 1.0.1 | active | — | — | common | — |
| `dispatch-serial.ts` | L0 | 1.0.1 | active | — | — | common | — |
| `dispatch.ts` | L0 | 1.0.0 | active | — | — | common | — |
| `gen-pr-body.ts` | L0 | 1.2.0 | active | — | — | common | — |
| `generate-ide-rules.ts` | L0 | 1.0.0 | active | — | — | common | — |
| `git-sync.ts` | L0 | 1.0.0 | active | — | — | common | — |
| `helpers/extends-validator.ts` | L0 | 1.0.1 | active | — | — | common | — |
| `helpers/merge-frontmatter.ts` | L0 | 1.8.6 | active | — | — | common | — |
| `helpers/context-sections.ts` | L0 | 1.0.0 | active | — | — | common | — |
| `helpers/pm-md-parser.ts` | L0 | 1.1.0 | active | — | — | common | — |
| `helpers/security-validator.ts` | L0 | 1.1.0 | active | — | — | common | — |
| `helpers/template-utils.ts` | L0 | 1.1.1 | active | — | — | common | — |
| `hooks/gateguard-fact-force.ts` | L0 | 1.2.0 | active | — | — | common | — |
| `hooks/post-write-lifecycle-check.ts` | L0 | 1.1.0 | active | — | — | common | — |
| `hooks/pre-commit.ts` | L0 | 1.5.10 | active | — | — | common | — |
| `hooks/pre-push.ts` | L0 | 1.2.9 | active | — | — | common | — |
| `install-bun.ts` | L0 | 1.0.0 | active | — | — | common | — |
| `install-vsp.ts` | L0 | 1.1.0 | active | — | — | common | — |
| `lib/auth.ts` | L0 | 1.0.0 | active | — | — | common | — |
| `lib/encoding-utils.ts` | L0 | 1.1.0 | active | — | — | common | — |
| `lib/error-handling.ts` | L0 | 1.3.0 | active | — | — | common | — |
| `lib/language-guard.ts` | L0 | 1.0.0 | active | — | — | common | — |
| `lib/pipeline-state.ts` | L0 | 1.1.1 | active | — | — | common | — |
| `lib/platform-context.ts` | L0 | 1.0.0 | active | — | — | common | — |
| `lib/ssrf.ts` | L0 | 1.1.0 | active | — | — | common | — |
| `lifecycle-sync-audit.ts` | L0 | 1.4.8 | active | — | — | common | — |
| `md-to-ooxml.ts` | L0 | 1.1.0 | active | — | — | common | — |
| `new-requirement.test.ts` | L0 | 1.0.0 | active | — | — | common | — |
| `new-requirement.ts` | L0 | 1.0.0 | active | — | — | common | — |
| `qa-gate.ts` | L0 | 1.2.0 | active | — | — | common | — |
| `readme-lifecycle-audit.ts` | L0 | 1.0.4 | active | — | — | common | — |
| `render-pdf-deck.ts` | L0 | 1.0.1 | active | — | — | common | — |
| `retry-handler.test.ts` | L0 | 1.0.0 | active | — | — | common | — |
| `retry-handler.ts` | L0 | 1.0.1 | active | — | — | common | — |
| `scratch-cleanup.test.ts` | L0 | 1.0.0 | active | — | — | common | — |
| `scratch-cleanup.ts` | L0 | 1.0.0 | active | — | — | common | — |
| `setup-github-branch-protection.ts` | L0 | 1.0.1 | active | — | — | common | — |
| `setup.ts` | L0 | 1.0.0 | active | — | — | common | — |
| `skill-lifecycle-audit.ts` | L0 | 1.3.0 | active | — | — | common | — |
| `sync-agent-status.ts` | L0 | 1.0.1 | active | — | — | common | — |
| `sync-mcp.test.ts` | L0 | 1.0.0 | active | — | — | common | — |
| `sync-mcp.ts` | L0 | 1.0.0 | active | — | — | common | — |
| `sync-md.test.ts` | L0 | 1.0.0 | active | — | — | common | — |
| `sync-md.ts` | L0 | 1.3.1 | active | — | — | common | — |
| `sync-skill-status.ts` | L0 | 1.0.1 | active | — | — | common | — |
| `sync-skills.test.ts` | L0 | 1.0.0 | active | — | — | common | — |
| `sync-skills.ts` | L0 | 1.4.1 | active | — | — | common | — |
| `team-builder.ts` | L0 | 1.2.2 | active | — | — | common | — |
| `test-platform-parity.ts` | L0 | 0.2.4 | active | — | — | common | — |
| `test-runner.ts` | L0 | 1.1.0 | active | — | — | common | — |
| `translate-readme.ts` | L0 | 1.0.0 | active | — | — | common | — |
| `validate-agents.ts` | L0 | 1.0.5 | active | — | — | common | — |
| `validate-doc-folder.ts` | L0 | 1.1.0 | active | — | — | common | — |
| `validate-docs-links.ts` | L0 | 1.0.0 | active | — | — | common | — |
| `validate-md-language.ts` | L0 | 1.6.0 | active | — | — | common | — |
| `validate-model-registry.ts` | L0 | 1.1.0 | active | — | — | common | — |
| `validate-pm-extends.ts` | L0 | 0.3.1 | active | — | — | common | — |
| `validate-skills.ts` | L0 | 1.0.3 | active | — | — | common | — |
| `verify-agent-deliverables.ts` | L0 | 1.0.1 | active | — | — | common | — |
| `verify-memory.ts` | L0 | 1.1.0 | active | — | — | common | — |
| `verify-platform-lifecycle.ts` | L0 | 1.1.2 | active | — | — | common | — |
| `verify-readme-sync.ts` | L0 | 1.2.0 | active | — | — | common | — |
| `verify-scripts.ts` | L0 | 1.4.1 | active | — | — | common | — |
| `verify-skills.test.ts` | L0 | 1.0.0 | active | — | — | common | — |
| `verify-skills.ts` | L0 | 1.2.1 | active | — | — | common | — |
| `vsp-audit.ts` | L0 | 1.0.0 | active | — | — | common | — |
| `vsp-publish.test.ts` | L0 | 1.0.0 | active | — | — | common | — |
| `vsp-publish.ts` | L0 | 1.0.0 | active | — | — | common | — |
| `vsp-task.ts` | L0 | 1.0.0 | active | — | — | common | — |

---

## Guide

<!-- Add human-readable documentation for each script here -->

### Variant wrapper scripts (scripts/co-abap/)

- `dispatch.ts` / `dispatch-parallel.ts` / `dispatch-serial.ts` are ADR-0050 variant wrappers that import the common dispatchers from `scripts/` via `../dispatch-*.ts` (fixed 2026-08-18 from a broken `../../dispatch-*.ts` path that resolved outside the project root; wrappers bumped to 1.0.2 — tracked in `scripts/co-abap/SCRIPTS.md`, not in this root registry).

