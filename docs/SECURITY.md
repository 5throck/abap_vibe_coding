# SECURITY.md

Security policy and sanitization rules for the **vsp** repository.

> For dev context, build instructions, and architecture see [CONTEXT.md](CONTEXT.md).

---

## Committed Files — Never Include

Never commit `.env`, `cookies.txt`, `.mcp.json`, or local agent/MCP config files
(all listed in `.gitignore`).

---

## Sanitize Policy for Tracked Docs, Tests, and Examples

The public repo must not contain concrete identifiers that tie code or docs to a
live SAP system, a real user, or a customer's ABAP namespace. Anything that does
belongs under `.local/` (gitignored) and never in `SAP ERP Module/`, `reports/`,
`docs/`, or any tracked test fixture.

**Never in tracked files:**
- Real SAP usernames — use `TESTUSER`
- Real hostnames or IPs — use `dev.example.local`, `prodsys-a.example`, `trialsys.example`
- System aliases that name a live box — use `devsys`, `devsys-adt`, `prodsys-a`, `prodsys-b`
- Live transport numbers (`DEVK[0-9]+`, `R[0-9]{2}K[0-9]+`, `D[0-9]{2}K[0-9]+`) — use `TR-EXAMPLE`
- Live change request IDs — use `CR-EXAMPLE`
- Customer ABAP namespaces from real projects — use synthetic `ZDEMO_*`, `ZCL_DEMO_*`, `ZIF_DEMO_*`, `$ZDEMO$`
- Customer transport attribute names — use `Z_CR_ATTR`
- Real passwords, API keys, bearer tokens
- Real person names tied to private systems (OSS attribution for upstream libraries is fine — "user X on private host Y" is not)

**Always OK in tracked files:**
- `$ZHIRTEST*`, `ZCL_HIRT*`, `ZCUSTOM_DEVELOPMENT` — pre-agreed synthetic fixtures
- Public GitHub handles that are already in the Go module path
- Upstream OSS attribution for library authors

**Operational scratch goes under `.local/`** — session notes, live CR dumps, bug
repros with real identifiers, debugging transcripts. The `.local/` dir is
gitignored. If you need to reference it from a tracked doc, redact first.

---

## Pre-Commit Scan

Before every commit that touches `reports/`, `SAP ERP Module/`, `docs/`, or test
fixtures, scan the staged diff:

```bash
git diff --cached | grep -nE \
  '\b[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\b|' \
  '\b[A-Z][0-9]{2}K[0-9]{6}\b|' \
  '\bDEVK[0-9]{6,}\b'
```

That catches IPv4 literals and SAP transport IDs. Pair it with
`.local/scripts/check-identifiers.sh` (gitignored — the signature would otherwise
be the leak it prevents) for the names-based families.

Rule of thumb: "would a stranger reading this file be able to identify the
customer, the system, or a live account?" If yes, redact and move under `.local/`.

---
*Last Updated: 2026-05-01*
