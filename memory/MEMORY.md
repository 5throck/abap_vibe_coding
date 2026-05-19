# Memory Index

This directory stores date-stamped development logs for the **vsp / ABAP** project.

---

## When to Read

Do **not** open memory files at session start. Consult the relevant date file only when:
- A recurring or hard-to-diagnose error occurs
- You need to verify a past design decision
- You are investigating why something was implemented a certain way

## When to Write

After every session in which an ABAP object is created or significantly changed,
append to `memory/YYYY-MM-DD.md` (create the file if it does not exist).

Required fields per entry:
- Object name, type, package, ADT URL
- Purpose summary
- Key technical decisions
- Issue history (symptom -> root cause -> resolution)
- MCP / config changes

---

## Log Files

| Date | Summary |
|------|---------|
| [2026-05-19](2026-05-19.md) | record today's audit logs in memory and update MEMORY.md index |
| [2026-05-18](2026-05-18.md) | correct vibing-steampunk binary names and mode tool counts |
| [2026-05-05](2026-05-05.md) | Harness & specialized tools update (Transports, OData, UI5); Path standardization; Sync script enhancement |
| [2026-05-04](2026-05-04.md) | VSP WebSocket infrastructure & abapGit installation; NW 7.52 compatibility patches; Documentation standardization |
| [2026-05-01](2026-05-01.md) | ZPROG_SBOOK_QUERY OO refactor; ZPROG_EPM_DEMO creation; ZADT_VSP 7.52 patches; hyperfocused mode config |
| [2026-04-29](2026-04-29.md) | ZPROG_SBOOK_QUERY initial creation; MCP config bootstrap (env vars, global config) |

---

## Adding an Entry

When creating a new log file, add a row to the table above -> newest date at the top.

Format: `| [YYYY-MM-DD](YYYY-MM-DD.md) | one-line summary |`

---

*Last Updated: 2026-05-19*
