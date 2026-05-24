# Agent Handoff Specification

## Purpose

Define standard format for agent-to-agent handoffs to ensure context is preserved.

## Handoff Format

```json
{
  "from_agent": "agent-name",
  "to_agent": "agent-name",
  "timestamp": "ISO-8601",
  "task_id": "identifier",
  "context": {
    "user_request": "original user request",
    "previous_findings": ["key finding 1", "key finding 2"],
    "files_touched": ["path/to/file1", "path/to/file2"],
    "decisions_made": ["decision 1 with rationale"],
    "next_steps": ["step 1", "step 2"]
  },
  "artifacts": {
    "spec": "path/to/spec.md",
    "output": "path/to/output.json"
  }
}
```

## Handoff File Location

Save to: `scratch/handoff-<task-id>-<timestamp>.json`

## Usage

1. **Before handoff**: Complete context object with all relevant information
2. **Save**: Write to handoff file
3. **Pass reference**: Provide file path to next agent
4. **Verify**: Next agent confirms receipt and understanding
