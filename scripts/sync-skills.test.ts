// @version 1.0.0
import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { dirsEqual, syncSkills, type SkillSyncDirs } from "./sync-skills";

let root: string;

beforeEach(() => {
  root = mkdtempSync(path.join(tmpdir(), "sync-skills-"));
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

function makeDirs(r: string): SkillSyncDirs {
  return {
    ssotSkills: path.join(r, "skills"),
    claudeSkills: path.join(r, ".claude", "skills"),
    geminiSkills: path.join(r, ".gemini", "skills"),
    agentsSkills: path.join(r, ".agents", "skills"),
  };
}

function writeSkill(skillDir: string, content = "---\nname: test\n---\nBody") {
  mkdirSync(skillDir, { recursive: true });
  writeFileSync(path.join(skillDir, "SKILL.md"), content);
}

describe("dirsEqual", () => {
  test("returns false when either path is missing", () => {
    const a = path.join(root, "a");
    const b = path.join(root, "b");
    writeSkill(a);
    expect(dirsEqual(a, b)).toBe(false);
  });

  test("returns true for two directories with identical file content", () => {
    const a = path.join(root, "a");
    const b = path.join(root, "b");
    writeSkill(a, "same content");
    writeSkill(b, "same content");
    expect(dirsEqual(a, b)).toBe(true);
  });

  test("returns false when file content differs", () => {
    const a = path.join(root, "a");
    const b = path.join(root, "b");
    writeSkill(a, "content A");
    writeSkill(b, "content B");
    expect(dirsEqual(a, b)).toBe(false);
  });

  test("returns false when entry sets differ", () => {
    const a = path.join(root, "a");
    const b = path.join(root, "b");
    writeSkill(a);
    mkdirSync(b, { recursive: true });
    writeFileSync(path.join(b, "SKILL.md"), "---\nname: test\n---\nBody");
    writeFileSync(path.join(b, "extra.md"), "extra");
    expect(dirsEqual(a, b)).toBe(false);
  });

  test("compares plain files (non-directories) by content", () => {
    const a = path.join(root, "file-a.txt");
    const b = path.join(root, "file-b.txt");
    writeFileSync(a, "hello");
    writeFileSync(b, "hello");
    expect(dirsEqual(a, b)).toBe(true);
  });
});

describe("syncSkills — Phase 1 (SSOT distribution)", () => {
  test("copies every SSOT skill to all three platform directories", async () => {
    const dirs = makeDirs(root);
    writeSkill(path.join(dirs.ssotSkills, "abap-dev"), "---\nname: abap-dev\n---\nBody");

    const { errors } = await syncSkills(dirs);

    expect(errors).toEqual([]);
    for (const target of [dirs.claudeSkills, dirs.geminiSkills, dirs.agentsSkills]) {
      const copied = path.join(target, "abap-dev", "SKILL.md");
      expect(existsSync(copied)).toBe(true);
      expect(readFileSync(copied, "utf-8")).toBe("---\nname: abap-dev\n---\nBody");
    }
  });

  test("skips non-skill entries in the SSOT directory (no SKILL.md)", async () => {
    const dirs = makeDirs(root);
    mkdirSync(dirs.ssotSkills, { recursive: true });
    writeFileSync(path.join(dirs.ssotSkills, "README.md"), "not a skill");

    const { errors } = await syncSkills(dirs);

    expect(errors).toEqual([]);
    expect(existsSync(path.join(dirs.claudeSkills, "README.md"))).toBe(false);
  });

  test("excludes security-gate: true skills from platform distribution", async () => {
    const dirs = makeDirs(root);
    writeSkill(
      path.join(dirs.ssotSkills, "gated-skill"),
      "---\nname: gated-skill\nsecurity-gate: true\n---\nBody"
    );

    const { errors } = await syncSkills(dirs);

    expect(errors).toEqual([]);
    expect(existsSync(path.join(dirs.claudeSkills, "gated-skill"))).toBe(false);
    expect(existsSync(path.join(dirs.geminiSkills, "gated-skill"))).toBe(false);
    expect(existsSync(path.join(dirs.agentsSkills, "gated-skill"))).toBe(false);
  });

  test("is idempotent — a second run with unchanged content performs no copies", async () => {
    const dirs = makeDirs(root);
    writeSkill(path.join(dirs.ssotSkills, "abap-dev"));

    let copyCount = 0;
    const countingCopy = (src: string, dest: string) => {
      copyCount++;
      mkdirSync(dest, { recursive: true });
      writeFileSync(path.join(dest, "SKILL.md"), readFileSync(path.join(src, "SKILL.md")));
    };

    await syncSkills(dirs, { copyDir: countingCopy });
    expect(copyCount).toBe(3); // claude, gemini, agents

    copyCount = 0;
    await syncSkills(dirs, { copyDir: countingCopy });
    expect(copyCount).toBe(0); // content already matches — no-op
  });

  test("special-cases meeting-facilitation into .claude/commands and .gemini/commands", async () => {
    const dirs = makeDirs(root);
    writeSkill(path.join(dirs.ssotSkills, "meeting-facilitation"), "# Meeting Facilitation\nBody");

    await syncSkills(dirs);

    expect(existsSync(path.join(root, ".claude", "commands", "meeting.md"))).toBe(true);
    expect(existsSync(path.join(root, ".gemini", "commands", "meeting.md"))).toBe(true);
  });

  test("collects a per-item error without aborting the rest of the batch", async () => {
    const dirs = makeDirs(root);
    writeSkill(path.join(dirs.ssotSkills, "good-skill"));
    writeSkill(path.join(dirs.ssotSkills, "bad-skill"));

    const throwingCopy = (src: string, dest: string) => {
      if (src.includes("bad-skill")) throw new Error("simulated copy failure");
      mkdirSync(dest, { recursive: true });
      writeFileSync(path.join(dest, "SKILL.md"), readFileSync(path.join(src, "SKILL.md")));
    };

    const { errors } = await syncSkills(dirs, { copyDir: throwingCopy });

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.includes("bad-skill"))).toBe(true);
    // good-skill still got synced despite bad-skill's failure
    expect(existsSync(path.join(dirs.claudeSkills, "good-skill", "SKILL.md"))).toBe(true);
  });

  test("no-ops cleanly when the SSOT directory does not exist", async () => {
    const dirs = makeDirs(root);
    const { errors } = await syncSkills(dirs);
    expect(errors).toEqual([]);
  });
});

describe("syncSkills — Phase 2 (shortcut back-sync)", () => {
  test("back-syncs known shortcut skills from .agents/skills/ to .claude and .gemini", async () => {
    const dirs = makeDirs(root);
    mkdirSync(dirs.ssotSkills, { recursive: true }); // empty SSOT — Phase 1 no-ops
    writeSkill(path.join(dirs.agentsSkills, "sync"), "# Sync shortcut");

    const { errors } = await syncSkills(dirs);

    expect(errors).toEqual([]);
    expect(existsSync(path.join(dirs.claudeSkills, "sync", "SKILL.md"))).toBe(true);
    expect(existsSync(path.join(dirs.geminiSkills, "sync", "SKILL.md"))).toBe(true);
  });

  test("ignores .agents/skills/ entries that are not on the shortcut whitelist", async () => {
    const dirs = makeDirs(root);
    mkdirSync(dirs.ssotSkills, { recursive: true });
    writeSkill(path.join(dirs.agentsSkills, "not-a-shortcut"));

    await syncSkills(dirs);

    expect(existsSync(path.join(dirs.claudeSkills, "not-a-shortcut"))).toBe(false);
  });
});
