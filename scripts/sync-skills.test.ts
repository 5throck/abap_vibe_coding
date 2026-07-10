import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { copySkillIfExists, collectSkills, SHORTCUT_SKILL_NAMES } from "./sync-skills";

let root: string;

beforeEach(() => {
  root = mkdtempSync(path.join(tmpdir(), "sync-skills-"));
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("copySkillIfExists", () => {
  test("copies SKILL.md when source exists", () => {
    const src = path.join(root, "src", "abap-dev");
    mkdirSync(src, { recursive: true });
    writeFileSync(path.join(src, "SKILL.md"), "# ABAP Dev");

    const dest = path.join(root, "dest", "abap-dev");
    expect(copySkillIfExists(src, dest)).toBe(true);
    expect(readFileSync(path.join(dest, "SKILL.md"), "utf-8")).toBe("# ABAP Dev");
  });

  test("returns false when source directory does not exist", () => {
    const dest = path.join(root, "dest", "missing");
    expect(copySkillIfExists(path.join(root, "src", "missing"), dest)).toBe(false);
    expect(existsSync(dest)).toBe(false);
  });

  test("returns false when source has no SKILL.md", () => {
    const src = path.join(root, "src", "empty-skill");
    mkdirSync(src, { recursive: true });
    writeFileSync(path.join(src, ".gitkeep"), "");

    expect(copySkillIfExists(src, path.join(root, "dest", "empty-skill"))).toBe(false);
  });

  test("ignores non-directory source paths", () => {
    const srcFile = path.join(root, "not-a-dir");
    writeFileSync(srcFile, "oops");
    expect(copySkillIfExists(srcFile, path.join(root, "dest", "x"))).toBe(false);
  });
});

describe("collectSkills", () => {
  test("returns only directories containing SKILL.md", () => {
    mkdirSync(path.join(root, "skills", "abap-dev"), { recursive: true });
    writeFileSync(path.join(root, "skills", "abap-dev", "SKILL.md"), "# x");

    mkdirSync(path.join(root, "skills", "no-skill-file"), { recursive: true });
    writeFileSync(path.join(root, "skills", "no-skill-file", ".gitkeep"), "");

    writeFileSync(path.join(root, "skills", "README.md"), "not a skill dir");

    const result = collectSkills(path.join(root, "skills"));
    expect(result).toEqual(["abap-dev"]);
  });

  test("returns empty array when directory does not exist", () => {
    expect(collectSkills(path.join(root, "nope"))).toEqual([]);
  });

  test("excludes non-SKILL.md files (e.g. .DS_Store, .gitkeep)", () => {
    mkdirSync(path.join(root, "skills"), { recursive: true });
    writeFileSync(path.join(root, "skills", ".DS_Store"), "");
    expect(collectSkills(path.join(root, "skills"))).toEqual([]);
  });
});

describe("SHORTCUT_SKILL_NAMES", () => {
  test("is a known, explicit whitelist (not auto-derived)", () => {
    expect(Array.isArray(SHORTCUT_SKILL_NAMES)).toBe(true);
    expect(SHORTCUT_SKILL_NAMES).toContain("meeting");
  });
});

describe("cross-platform path filtering (Phase 2 regression guard)", () => {
  // Regression test for the path.sep bug fixed in the 2026-07-09 remediation:
  // filtering by string concatenation with path.sep broke on Windows because
  // path.join normalizes separators inconsistently with raw string concat.
  test("path.normalize comparison correctly excludes the .agents/skills self-target", () => {
    const agentsSkillsDir = path.join(root, ".agents", "skills");
    const targets = [
      path.join(root, ".claude", "skills"),
      path.join(root, ".gemini", "skills"),
      agentsSkillsDir,
    ];
    const normalizedAgentsDir = path.normalize(agentsSkillsDir);
    const filtered = targets.filter((t) => path.normalize(t) !== normalizedAgentsDir);
    expect(filtered).toHaveLength(2);
    expect(filtered).not.toContain(agentsSkillsDir);
  });
});
