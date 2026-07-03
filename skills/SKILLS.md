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
