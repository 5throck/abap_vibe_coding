# New Task

Create a new task file in scratch/ from the task template.

Run the following command, where $ARGUMENTS is used as the task name:

```bash
bash scripts/vsp-task.sh "$ARGUMENTS"
```

If $ARGUMENTS is empty, use "new-task" as the default name.

After the script runs:
1. Display the full path of the created file
2. Show the user the task template so they can fill in the request details
3. Remind them to paste the original user request into the "Request" section
