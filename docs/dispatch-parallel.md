# Parallel Dispatch Template

Use this template when dispatching multiple read-only subagents simultaneously.

## When to Use

- Read-only research (codebase scan, schema inspection, business data queries)
- Independent analysis tasks that don't share state
- Phase 1 triage and investigation

## Template

```
Agent(
  description = "Brief description of subagent 1",
  model = "haiku", // Use short alias: opus, sonnet, or haiku
  prompt = """You are a [role]. Your task is to [specific task].

Context: [relevant context, file paths, expectations]

Output format: [expected output format]
"""
)

Agent(
  description = "Brief description of subagent 2",
  model = "haiku", // Use short alias: opus, sonnet, or haiku
  prompt = """You are a [role]. Your task is to [specific task].

Context: [relevant context, file paths, expectations]

Output format: [expected output format]
"""
)
```

## Important

- Dispatch all parallel agents in a single message (multiple tool calls)
- Wait for ALL to return before proceeding
- Merge results before next step
