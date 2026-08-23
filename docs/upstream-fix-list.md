# Upstream Fix List — co-abap → workspace root

Status (2026-08-24 review): **§1 RESOLVED** (#631, propagated). Open items: **§6 dev-sync
spec-exempt arg bug (High)**, **§5 CRLF stripComment (Med-High)**, **§4 validators import (Med)**,
**§7 ADR-0058 prune upgrade-path hole (Med, new)**, **§2 patch-ledger (Med, framing updated)**.
§6–§7 discovered during the 2026-08-24 L0↔L1 comparison analysis.

## 6. NEW (2026-08-24, High): dev-sync `--spec-exempt` CLI flag is inert inside the pipeline

`dev-sync.ts` line ~244 interpolates the exemption into the Bun `$` shell template:

```ts
const specRes = await $`bun scripts/audit.ts --spec-check --lifecycle-only${specExempt ? ` --spec-exempt=${specExempt}` : ''}`.nothrow();
```

The interpolated value `" --spec-exempt=E3"` (leading space included) is passed by Bun's shell as a
**single argv word**, so audit.ts's `process.argv.find(a => a.startsWith('--spec-exempt='))` never
matches. Net effect: the ADR-0055 Stage 2 escape hatch works when audit is invoked directly but is
**silently inert on every `/sync` run** — exactly when it is needed. Root happened to pass its last
runs on genuine spec activity, masking the defect. The documented env fallback
(`SYNC_SPEC_EXEMPT`, audit.ts SPEC_EXEMPT_RAW) works fine. Local fix (co-abap `dev-sync.ts`
1.7.2): pass via `.env({ ...process.env, SYNC_SPEC_EXEMPT: specExempt })`. Upstream options:
port that, or trim in audit's parser (`arg.trim().startsWith(...)`).

## 4. audit.ts L0-only import breaks variant strict tsc

Upstream `audit.ts` 2.21.0 wires the variant-registry validator framework:

```ts
if (fs.existsSync(path.join('scripts', 'validators', 'index.ts')) && fs.existsSync('templates')) {
    const { runAllValidators } = await import('./validators/index.ts');
```

`scripts/validators/` is deliberately L0-only (never propagated), so the runtime guard is correct —
but the static literal specifier makes `tsc --noEmit` fail with TS2307 in every L1/L2 checkout where
the directory legitimately doesn't exist. Locally suppressed via documented `@ts-expect-error`
(co-abap local 2.21.1). Upstream fix options: use a non-literal specifier
(`await import(path.join('scripts','validators','index.ts'))`), or scope the import behind an
indirection that variants don't typecheck, or ship a stub module.

## 2. upgrade-project.ts — local-patch overwrite hazard (framing updated 2026-08-24)

Original LOCKED-overwrite class is largely resolved upstream (v1.10.0 moved `.gitleaks.toml` to
`mergeGitleaksToml()`; LOCKED list now only githooks + `.gitattributes`; context.md moved to
VARIANT_DOCS_SYNC in v1.9.0). The remaining vector is **SYNC-category script copies**: local
fixes to template-synced scripts were silently reverted twice (2026-08-21: sync-md module marker,
dev-sync typing fixes; 2026-08-24: lifecycle-sync-audit Dirent annotations). Recommendation:
a lightweight **patch ledger** — after each sync, record sha256 of every SYNC-category file; on the
next upgrade, if a project-side file's hash differs from both the previous ledger entry and the new
template, WARN with a diff pointer before overwriting (mirrors `mergeGitleaksToml`'s philosophy).
Operational stopgap until then: local emergency patches must be upstreamed within ~48h (the
#631 flow worked well).

## 5. audit.ts nul-lint stripComment is not CRLF-safe

`audit.ts` 2.21.x `stripComment()` anchors both regexes with `$` (no `m` flag). Under
`core.autocrlf=true` checkouts every line ends `\r`, and since JS `.` does not match `\r`,
`.*$` fails to reach the anchor — comment stripping silently no-ops and the scanner then flags
its own prose comments that mention `> nul`. Root passes only because its `.gitattributes`
enforces `*.ts eol=lf`; variants without that attribute line (e.g. co-abap) check out CRLF and
trip the lint. Local fix (co-abap 2.21.2): prepend `.replace(/\r$/, "")` inside `stripComment`.
Upstream fix: same normalization in the root copy (defense in depth), plus consider adding
`eol=lf` coverage guidance for variant `.gitattributes`.

## 7. NEW (2026-08-24, Med): country-scoped prune never runs on the upgrade path

ADR-0058 wires `helpers/prune-country-scoped-assets.ts` into `new-project.ts` and
`create-l3-scaffold.ts`, but **not** into `upgrade-project.ts`. Consequence (observed): the
region-neutral co-abap project (no `country=` marker in `.claude/template-version.txt`, no
`docs/countries/`) received `k-kosis` — and already holds `k-dart`/`k-law` — through upgrades,
which scaffolding would have pruned. Suggested direction: at upgrade time, read the project's
country marker; if absent/region-neutral and scoped skills exist, either auto-prune (matching
scaffold semantics) or emit a visible WARN naming the files and the manual command. Auto-prune
needs care for pre-marker legacy projects that intentionally keep k-* — hence possibly
WARN-first burn-in, mirroring the ADR-0055 Stage pattern.

---

Historical sections retained below for provenance.

## 1. dev-sync.ts — 7 type errors (typing-only; runtime is unaffected) — ✅ FIXED UPSTREAM (#631)

`tsc --noEmit -p scripts/tsconfig.json` fails with 7 errors. All are typing issues in the
Bun Shell (`$`) result types and `withRetry` callback contracts.

### 1a. `ShellResult.stderr.trim()` on Buffer-typed stderr (lines 251, 298)

Bun's `$` shell types `stderr` as `Buffer`, but at runtime it is a string.
Fix — coerce before trimming:

```ts
// line 251
if (testResult.stderr) console.warn(String(testResult.stderr).trim());
// line 298
if (syncSkillsResult.stderr) console.warn(String(syncSkillsResult.stderr).trim());
```

### 1b. `isSuccess` callback typed too narrowly for `unknown` contract (lines 450, 529, 535, 542, 548)

`withRetry`'s options type declares `isSuccess?: (result: unknown) => boolean`, but all five call
sites pass `(r: { exitCode: number }) => boolean`. A function accepting `{ exitCode }` is not
assignable where `unknown` may arrive (contravariance). Fix at each call site:

```ts
{ ...DEFAULT_CONFIG, maxRetries: 3, initialDelay: 1000, isSuccess: (r: unknown) =>
    typeof r === "object" && r !== null && (r as { exitCode: number }).exitCode === 0 },
```

Alternatively (single-point fix, preferred): widen the five call sites' lambda parameter type by
changing `withRetry`'s `RetryOptions.isSuccess` signature to
`isSuccess?: (result: unknown) => boolean` **and** adding an overload/helper
`exitCodeZero = (r: unknown): boolean => ...` exported from `retry-handler.ts`, then replacing the
five lambdas with `isSuccess: exitCodeZero`.

## 3. scripts/co-abap/install-vsp.ts — shebang order (fixed locally 2026-08-23)

The variant payload copy had `// @version 1.0.0` on line 1 and the shebang on line 2, which is a
Bun syntax error when executed. Fixed locally by moving the shebang to line 1. If this copy is
generated from a workspace-root source, fix the generator/source there too. Status check
2026-08-24: the 2026-08-24 upgrade did NOT touch this file — local fix intact.

---

*Source: co-abap full project review (2026-08-23) + follow-up remediation sessions.*
