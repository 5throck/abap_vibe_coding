---
name: sync
status: active
scope: common
description: >
  Runs the full project sync pipeline: memory session log, CHANGELOG verification,
  workspace audit, commit, push, and GitHub PR creation.
owner: pm
version: 1.0.0
last_reviewed: 2026-07-08
metadata:
  type: process
  triggers:
    - sync
    - commit and push
    - create PR
    - push changes
---

This is merely a registration stub. The actual implementation resides in `.claude/commands/sync.md`. The full skill definition is in `skills/sync/SKILL.md`.
