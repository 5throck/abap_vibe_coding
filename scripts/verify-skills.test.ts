#!/usr/bin/env bun
/**
 * Tests for verify-skills.ts
 * Covers: extractSkillMetadata, verifySkill with valid/empty/malformed content
 *
 * Note: verify-skills.ts runs main() on import (no export guard), so we
 * inline the extraction logic here and test that contract. Full integration
 * tests should run via `bun scripts/verify-skills.ts`.
 */

import { describe, test, expect } from "bun:test";

// ---------------------------------------------------------------------------
// Inline copy of extractSkillMetadata (matches scripts/verify-skills.ts:92-127)
// This avoids triggering the top-level main() call.
// ---------------------------------------------------------------------------

interface SkillMetadata {
  name: string;
  description: string;
  type: string;
  triggers: string[];
}

function extractSkillMetadata(content: string): SkillMetadata {
  const metadata: SkillMetadata = {
    name: "",
    description: "",
    type: "unknown",
    triggers: [],
  };

  const frontmatterStart = content.indexOf("---");
  const frontmatterEnd = content.indexOf("---", 3);

  if (frontmatterStart !== -1 && frontmatterEnd !== -1) {
    const frontmatter = content.substring(frontmatterStart + 3, frontmatterEnd);

    const nameMatch = frontmatter.match(/name:\s*(.+)/);
    if (nameMatch) metadata.name = nameMatch[1].trim();

    const descMatch = frontmatter.match(/description:\s*(.+)/);
    if (descMatch) metadata.description = descMatch[1].trim();

    const typeMatch = frontmatter.match(/metadata:\s*\n\s*type:\s*(.+)/);
    if (typeMatch) metadata.type = typeMatch[1].trim();
  }

  // NOTE: The production regex requires a colon: "## Trigger:" or "When to Use:"
  const triggerMatch = content.match(/(?:## Trigger|When to Use):\s*\n([^#]+)/);
  if (triggerMatch) {
    const triggers = triggerMatch[1]
      .split("\n")
      .map((line) => line.trim().replace(/^[-*]\s*/, ""))
      .filter((line) => line.length > 0);
    metadata.triggers = triggers;
  }

  return metadata;
}

// ---------------------------------------------------------------------------
// Test fixtures — use the actual production regex format (heading with colon)
// ---------------------------------------------------------------------------

const VALID_SKILL = `---
name: test-skill
description: A test skill for verification
metadata:
  type: domain
---

# Test Skill

## Trigger:
- sales order
- delivery processing
- pricing

## Content

This is the body of the skill with sufficient content to pass the length check.
`;

describe("extractSkillMetadata", () => {
  test("parses name from frontmatter", () => {
    const m = extractSkillMetadata(VALID_SKILL);
    expect(m.name).toBe("test-skill");
  });

  test("parses description from frontmatter", () => {
    const m = extractSkillMetadata(VALID_SKILL);
    expect(m.description).toBe("A test skill for verification");
  });

  test("parses metadata.type from nested YAML", () => {
    const m = extractSkillMetadata(VALID_SKILL);
    expect(m.type).toBe("domain");
  });

  test("extracts triggers from ## Trigger: section", () => {
    const m = extractSkillMetadata(VALID_SKILL);
    expect(m.triggers).toEqual(["sales order", "delivery processing", "pricing"]);
  });

  test("returns defaults for empty content", () => {
    const m = extractSkillMetadata("");
    expect(m).toEqual({ name: "", description: "", type: "unknown", triggers: [] });
  });

  test("returns defaults when frontmatter is missing", () => {
    const m = extractSkillMetadata("# No frontmatter\nJust content");
    expect(m.name).toBe("");
    expect(m.type).toBe("unknown");
  });

  test("extracts triggers from 'When to Use:' heading variant", () => {
    const content = `---
name: alt-trigger
description: Alt
metadata:
  type: workflow
---
# Alt Skill

## When to Use:
- OData service design
- RFC integration

## Details
Body text here.
`;
    const m = extractSkillMetadata(content);
    expect(m.triggers).toEqual(["OData service design", "RFC integration"]);
  });

  test("ignores leading dashes in trigger list items", () => {
    const content = `---
name: dash-test
description: Test
metadata:
  type: util
---
## Trigger:
  - first item
  * second item
`;
    const m = extractSkillMetadata(content);
    expect(m.triggers).toEqual(["first item", "second item"]);
  });
});

describe("verifySkill — structural checks (in-memory)", () => {
  // Mirror the checks from verify-skills.ts:167-229
  function checkSkillStructure(content: string): { status: string; issues: string[] } {
    const issues: string[] = [];
    let status: "PASS" | "FAIL" | "WARN" = "PASS";

    if (!content.startsWith("---")) {
      issues.push("Missing frontmatter");
      status = "FAIL";
    } else {
      const frontmatterEnd = content.indexOf("---", 3);
      if (frontmatterEnd === -1) {
        issues.push("Invalid frontmatter (missing closing ---)");
        status = "FAIL";
      } else {
        const frontmatter = content.substring(3, frontmatterEnd);
        if (!frontmatter.includes("name:")) {
          issues.push("Missing 'name' field");
          status = "FAIL";
        }
        if (!frontmatter.includes("description:")) {
          issues.push("Missing 'description' field");
          status = "WARN";
        }
        if (!frontmatter.includes("metadata:")) {
          issues.push("Missing 'metadata' section");
          status = "WARN";
        }
      }
    }

    const contentStart = content.indexOf("---", 3);
    if (contentStart !== -1) {
      const bodyContent = content.substring(contentStart + 3).trim();
      if (bodyContent.length < 50) {
        issues.push("Skill content seems too short");
        status = "WARN";
      }
    }

    return { status, issues };
  }

  test("valid skill passes all checks", () => {
    const result = checkSkillStructure(VALID_SKILL);
    expect(result.status).toBe("PASS");
    expect(result.issues).toHaveLength(0);
  });

  test("missing frontmatter → FAIL", () => {
    const result = checkSkillStructure("# No frontmatter\n");
    expect(result.status).toBe("FAIL");
    expect(result.issues).toContain("Missing frontmatter");
  });

  test("missing closing --- → FAIL", () => {
    const result = checkSkillStructure("---\nname: broken\n");
    expect(result.status).toBe("FAIL");
    expect(result.issues).toContain("Invalid frontmatter (missing closing ---)");
  });

  test("missing name → FAIL (status downgrades from WARN to FAIL)", () => {
    // Production code: missing 'name' sets status = "FAIL"
    const content = `---\ndescription: no name\nmetadata:\n  type: util\n---\nBody text that is long enough to pass the fifty character minimum check.`;
    const result = checkSkillStructure(content);
    // name: missing → FAIL (overrides WARN)
    expect(result.issues).toContain("Missing 'name' field");
    expect(result.status).toBe("FAIL");
  });

  test("short body → WARN", () => {
    const content = `---\nname: short\ndescription: desc\nmetadata:\n  type: util\n---\nToo short`;
    const result = checkSkillStructure(content);
    expect(result.status).toBe("WARN");
    expect(result.issues).toContain("Skill content seems too short");
  });
});
