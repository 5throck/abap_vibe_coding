---
name: post-write
description: Run the Post-Write quality gate chain (SyntaxCheck → RunUnitTests → RunATCCheck) for the specified ABAP object. Use after any WriteSource or EditSource operation in Desktop App or Antigravity where hooks do not fire automatically.
argument-hint: "<object-name>"
allowed-tools: ["mcp__abap__SyntaxCheck", "mcp__abap__RunUnitTests", "mcp__abap__RunATCCheck"]
---

# Post-Write Mandatory Chain

Run the Post-Write quality gate chain for the ABAP object specified in $ARGUMENTS.

If no object name is given, ask the user which object was last modified.

## Steps (in order — stop immediately if any step fails)

1. **SyntaxCheck** — Run SyntaxCheck on the object. Must return 0 errors.
2. **RunUnitTests** — Run unit tests for the object's package ($TMP or the object's package). Must return 0 failures.
3. **RunATCCheck** — Run ATC check on the object. Priority-1 findings block progress; Priority-2 requires PM review; Priority-3 is logged only.

## Output format

Report each step result clearly:

```
✅ SyntaxCheck — PASSED
✅ RunUnitTests — PASSED (N tests, 0 failures)
✅ RunATCCheck — PASSED (0 Priority-1, 0 Priority-2, N Priority-3)
```

If any step fails:

```
❌ SyntaxCheck — FAILED
  Error: <error message>
  Line: <line number>
Action required: Fix the syntax error before proceeding.
```

## When to use

- After any WriteSource or EditSource call in Claude Code Desktop App (hooks do not fire automatically)
- After any ABAP code change in Antigravity
- Whenever you want to manually verify the quality gate
