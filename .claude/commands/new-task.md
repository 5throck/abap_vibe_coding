---
name: new-task
description: Create a new task file in scratch/tasks/ from the task template for tracking ABAP development work.
argument-hint: "[task-name]"
allowed-tools: ["Bash"]
---

# New Task

Create a new task file in scratch/tasks/ from the task template.

Run:
```bash
bun "${CLAUDE_PLUGIN_ROOT:-.}/scripts/vsp-task.ts" "$ARGUMENTS"
```

If $ARGUMENTS is empty, use "new-task" as the default name.

After the script runs:
1. Display the full path of the created file
2. Show the user the task template structure so they can fill in the request details
3. Remind them to paste the original user request into the "Request" section
