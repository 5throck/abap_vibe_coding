# MEMORY.md

Records ABAP objects created or modified during development sessions, along with key decisions and issue history.

---

## ABAP Programs

### ZPROG_SBOOK_QUERY — Flight Booking Query Report

- **Created**: 2026-04-29
- **Package**: `$TMP`
- **Object URL**: `/sap/bc/adt/programs/programs/ZPROG_SBOOK_QUERY`

#### Purpose
Queries the Sflight demo database across four joined tables (SBOOK, SCARR, SPFLI, SCUSTOM) and displays results in a `CL_SALV_TABLE` ALV grid with built-in sort, filter, and Excel export.

#### Selection Screen Fields
| Variable | Label | Source Field |
|----------|-------|--------------|
| `s_carrid` | Airline Code | `SBOOK-CARRID` |
| `s_connid` | Connection No. | `SBOOK-CONNID` |
| `s_fldate` | Flight Date | `SBOOK-FLDATE` (default: today) |
| `s_custid` | Customer ID | `SBOOK-CUSTOMID` |
| `s_class` | Seat Class | `SBOOK-CLASS` (Y/C/F) |
| `p_cancel` | Include Cancelled | `SBOOK-CANCELLED` |

#### Key Technical Decisions
- **Selection screen field labels**: Set at runtime in `INITIALIZATION` via `%_<field>_%_app_%-text` variables.
- **ALV column headers**: `set_short/medium/long_text` not called — ALV automatically reads labels from DDIC data elements.
- **ALV title**: `set_list_header( 'Flight Booking Query Report (ALV)' )`
- **MANDT in JOIN**: Cannot be used in `ON` condition — handled automatically by the compiler; removed from all JOIN clauses.
- **CASE in Open SQL**: Not supported in ABAP 7.52 — replaced with two separate `SELECT` statements under an `IF p_cancel` branch.
- **SELECT-OPTIONS name limit**: Maximum 8 characters — shortened from `so_carrid` to `s_carrid`, etc.
- **SELECTION-SCREEN BLOCK TITLE**: Text symbols (`TEXT-xxx`) cannot be assigned at runtime — removed `TITLE` clause; using `WITH FRAME` only.

#### Issue History
| Issue | Root Cause | Resolution |
|-------|-----------|------------|
| 403 on object create | DEVELOPER user had no development license | Registered NPL license via SLICENSE → SAP Minisap portal |
| `TEXT-B01` cannot be modified | Text symbols are read-only at runtime | Removed `TITLE` clause; kept `WITH FRAME` only |
| `MANDT` in ON condition error | Client field is compiler-managed | Removed all `mandt` conditions from JOIN `ON` clauses |
| SELECT-OPTION name too long | 8-character name limit | Renamed `so_carrid` → `s_carrid`, etc. |
| BLOCK TITLE variable name error | 8-character limit also applies to TITLE reference | Switched to `WITH FRAME` only |
| `CASE` not supported in Open SQL | ABAP 7.52 restriction | Replaced with `IF p_cancel` branching two SELECT statements |

---

## MCP Configuration

### .mcp.json (`C:\git\abap\.mcp.json`)
- `abap` server command: `C:\git\vsp.exe -s npl`
- Reads credentials from `.vsp.json` (`npl` system entry).
- **Change history**: Initial approach used `${SAP_URL}` env var placeholders — switched to `-s npl` flag because env vars were not expanded by the Claude Code MCP host.

---
