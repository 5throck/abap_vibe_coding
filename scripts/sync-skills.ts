#!/usr/bin/env bun
/**
 * sync-skills.ts — L0 → L1 platform skill distribution
 *
 * Distributes skill definitions from the canonical skills/ (L0 SSOT) to
 * all three platform directories:
 *   - .claude/skills/   (Claude Code)
 *   - .gemini/skills/   (Gemini CLI / Antigravity)
 *   - .agents/skills/   (Antigravity-specific shortcuts)
 *
 * Phase 1: skills/ → all platform skill directories
 * Phase 2: .agents/skills/ shortcut skills → .claude/skills/ and .gemini/skills/
 *
 * @version 1.0.0
 * @owner pm
 */

import * as fs from "node:fs";
import * as path from "node:path";

const scriptDir = path.dirname(import.meta.path);
const projectRoot = path.resolve(scriptDir, "..");

// L0 SSOT source
const skillsRoot = path.join(projectRoot, "skills");

// L1 platform targets
const platformTargets = [
  path.join(projectRoot, ".claude", "skills"),
  path.join(projectRoot, ".gemini", "skills"),
  path.join(projectRoot, ".agents", "skills"),
];

// Shortcut skills that live only in .agents/skills/ and get back-propagated
// Skills that already exist in L0 (skills/) do NOT need shortcuts — Phase 1 handles them.
const shortcutSkillNames = ["meeting"];

function copyDirIfExists(src: string, dest: string): boolean {
  if (!fs.existsSync(src)) return false;
  const stat = fs.statSync(src);
  if (!stat.isDirectory()) return false;

  const entries = fs.readdirSync(src);
  if (entries.length === 0) return true;

  fs.mkdirSync(dest, { recursive: true });

  for (const entry of entries) {
    const srcFile = path.join(src, entry);
    const destFile = path.join(dest, entry);
    fs.copyFileSync(srcFile, destFile);
  }
  return true;
}

function collectSkills(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((e) => {
      const fullPath = path.join(dir, e);
      return fs.statSync(fullPath).isDirectory() && fs.existsSync(path.join(fullPath, "SKILL.md"));
    });
}

function phase1(): void {
  console.log("=== Phase 1: Distribute L0 skills/ → platform directories ===\n");

  const ssotSkills = collectSkills(skillsRoot);
  console.log(`L0 SSOT skills: ${ssotSkills.join(", ") || "(none)"}\n`);

  let copied = 0;
  let skipped = 0;

  for (const skillName of ssotSkills) {
    const src = path.join(skillsRoot, skillName);
    let anyCopied = false;

    for (const target of platformTargets) {
      const dest = path.join(target, skillName);
      const result = copyDirIfExists(src, dest);
      if (result) {
        if (!anyCopied) console.log(`  ✅ ${skillName}`);
        anyCopied = true;
        copied++;
      }
    }

    if (!anyCopied) {
      console.log(`  ⏭️  ${skillName} (no SKILL.md found)`);
      skipped++;
    }
  }

  console.log(`\nPhase 1 result: ${copied} copies, ${skipped} skipped\n`);
}

function phase2(): void {
  console.log("=== Phase 2: Back-propagate .agents/skills/ shortcuts ===\n");

  const agentsSkillsDir = path.join(projectRoot, ".agents", "skills");
  const agentsSkills = collectSkills(agentsSkillsDir);

  // Only propagate shortcut skills (not SSOT skills already distributed in Phase 1)
  const shortcuts = agentsSkills.filter((s) => shortcutSkillNames.includes(s));
  console.log(`Shortcut skills: ${shortcuts.join(", ") || "(none)"}\n`);

  // Targets for back-propagation (exclude .agents/ itself)
  const backPropTargets = platformTargets.filter(
    (t) => !t.includes(".agents" + path.sep + "skills")
  );

  let propagated = 0;
  for (const skillName of shortcuts) {
    const src = path.join(agentsSkillsDir, skillName);

    for (const target of backPropTargets) {
      const dest = path.join(target, skillName);
      fs.mkdirSync(dest, { recursive: true });
      fs.copyFileSync(path.join(src, "SKILL.md"), path.join(dest, "SKILL.md"));
      propagated++;
    }

    console.log(`  ✅ ${skillName} → .claude/skills/, .gemini/skills/`);
  }

  console.log(`\nPhase 2 result: ${propagated} back-propagations\n`);
}

function main(): void {
  console.log("sync-skills.ts — L0 → L1 platform skill distribution\n");
  console.log(`Project root : ${projectRoot}`);
  console.log(`L0 SSOT      : ${skillsRoot}`);
  console.log(`L1 targets   : ${platformTargets.map((t) => path.relative(projectRoot, t)).join(", ")}`);
  console.log("");

  phase1();
  phase2();

  console.log("✅ Skill distribution complete.");
}

if (import.meta.main) {
  main();
}
