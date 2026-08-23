# Upstream Fix List — co-abap → workspace root

Status: **§1 RESOLVED (2026-08-24)** — applied upstream in ai-workspace-standards PR #631
(`dev-sync.ts` 1.7.1) and propagated to this project by the 2026-08-24 `upgrade-project` resync;
the temporary tsconfig exclusion has been removed. §2 remains open (regression hazard confirmed
again during that same upgrade). §4 is new.

## 4. NEW (2026-08-24): audit.ts L0-only import breaks variant strict tsc

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

## 2. upgrade-project.ts — local-fix regression hazard (CONFIRMED AGAIN 2026-08-24)

The 2026-08-24 upgrade re-introduced the `lifecycle-sync-audit.ts` Dirent typing bug fixed locally
one day earlier (template copy overwrote the patch; re-applied as 1.4.8 locally). Combined with the
two 2026-08-15 fixes reverted on 2026-08-21, this is now a pattern, not an incident. Recommendation
unchanged: merge-awareness or a "local patch ledger" in `upgrade-project.ts` before overwriting
LOCKED-adjacent files.

## 5. NEW (2026-08-24): audit.ts nul-lint stripComment is not CRLF-safe

`audit.ts` 2.21.x `stripComment()` anchors both regexes with `$` (no `m` flag). Under
`core.autocrlf=true` checkouts every line ends `\r`, and since JS `.` does not match `\r`,
`.*$` fails to reach the anchor — comment stripping silently no-ops and the scanner then flags
its own prose comments that mention `> nul`. Root passes only because its working tree is LF.
Local fix (co-abap 2.21.2): prepend `.replace(/\r$/, "")` inside `stripComment`. Upstream fix:
apply the same normalization (or split on `/\r?\n/`) in the root copy so Windows/autocrlf
checkouts of every variant pass the lint out of the box.

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
