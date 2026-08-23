# Upstream Fix List — co-abap → workspace root

Status: **pending upstream**. These fixes cannot be applied locally because this project is an
L2 variant and `scripts/dev-sync.ts` is a core script that must remain identical to the
workspace-root template (variant-integrity rule, AGENTS.md "Pluggable Variant Audit Hooks").

Apply these in the **workspace-root repository**, then propagate via
`upgrade-project.ts` (or the next reconciliation pipeline).

---

## 1. dev-sync.ts — 7 type errors (typing-only; runtime is unaffected)

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

## 2. upgrade-project.ts — local-fix regression hazard

Two fixes applied locally on **2026-08-15** were reverted by the **2026-08-21**
`upgrade-project.ts --variant co-abap` sync (template common → 0.5.3):

| File | Fix lost | Re-applied locally |
|------|----------|--------------------|
| `sync-md.ts` | missing module marker (`export {}`) needed for top-level `await` (8 × TS1375) | yes (2026-08-23) |
| `dev-sync.ts` | `stderr.trim()` / narrow `isSuccess` typing fixes from PR #88-era work | no — core script, see §1 |

Recommendation: add a regression check or merge-awareness for previously-fixed variant patches in
`upgrade-project.ts` (e.g., consult a "local patch ledger" before overwriting LOCKED-adjacent
files), mirroring the project-aware `.gitleaks.toml` merge gap documented in CHANGELOG
2026-08-21.

## 3. scripts/co-abap/install-vsp.ts — shebang order (fixed locally 2026-08-23)

The variant payload copy had `// @version 1.0.0` on line 1 and the shebang on line 2, which is a
Bun syntax error when executed. Fixed locally by moving the shebang to line 1. If this copy is
generated from a workspace-root source, fix the generator/source there too.

---

*Source: co-abap full project review (2026-08-23) + follow-up remediation session.*
