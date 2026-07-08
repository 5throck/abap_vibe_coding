---
name: meeting
status: active
scope: common
description: >
  Shortcut alias for the meeting-facilitation skill. Facilitates structured multi-agent
  meetings for collaborative decision-making and problem resolution.
owner: pm
version: 1.1.0
last_reviewed: 2026-07-09
metadata:
  type: process
  triggers:
    - meeting
    - agent discussion
    - collaborative decision
    - multi-agent coordination
    - facilitate meeting
---

Shortcut skill for `meeting-facilitation`. Run via the platform-specific command:

| Platform | Command |
|----------|---------|
| Claude Code | `/meeting "topic" --agents agent1,agent2 --rounds 2 --dialogue` |
| Gemini CLI | Read `.gemini/commands/meeting.md` and follow the full procedure |
| Antigravity | Read `.gemini/commands/meeting.md` and follow the full procedure |

Full skill definition: `skills/meeting-facilitation/SKILL.md`
