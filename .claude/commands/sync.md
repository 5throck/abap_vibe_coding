---
name: sync
description: Sync today's development session to Git — run the documentation audit, update the memory index, and commit all changes with a conventional commit message.
argument-hint: "<conventional-commit-message>"
allowed-tools: ["Bash"]
---

# Sync

Sync today's development session to Git: run the documentation audit, update the memory index, and commit all changes.

Run:

```bash
bash "${CLAUDE_PLUGIN_ROOT:-.}/scripts/vsp-sync.sh" "$ARGUMENTS"
```

$ARGUMENTS should be a conventional commit message (e.g. `feat: add ZCL_MY_CLASS`).
If $ARGUMENTS is empty, prompt the user for a commit message before running.

The script will:
1. Run the documentation audit (vsp-audit) — aborts if audit fails
2. Verify today's memory log exists in memory/YYYY-MM-DD.md
3. Update the MEMORY.md index
4. Commit all staged changes with the provided message

Report the result clearly (success or failure with reason).
