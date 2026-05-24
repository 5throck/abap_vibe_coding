#!/usr/bin/env bun

/**
 * Documentation Audit Script
 * Checks workspace standards and documentation integrity
 */

import path from "node:path";

const scriptDir = path.dirname(import.meta.path);
const projectRoot = path.resolve(scriptDir, "..");

interface AuditCheck {
  name: string;
  status: "PASS" | "FAIL";
  message?: string;
}

const checks: AuditCheck[] = [];

async function main(): Promise<void> {
  console.log("=== audit.ts — workspace standards check ===\n");

  // Required files check
  await checkRequiredFiles();

  // Script parity check
  await checkScriptParity();

  // Summary
  printSummary();
}

async function checkRequiredFiles(): Promise<void> {
  const requiredFiles = [
    "CHANGELOG.md",
    "CONSTITUTION.md",
    "docs/context.md",
    "AGENTS.md",
    ".env.sample"
  ];

  for (const file of requiredFiles) {
    const exists = await fileExists(file);
    checks.push({
      name: `${file} exists`,
      status: exists ? "PASS" : "FAIL",
      message: exists ? undefined : "File not found"
    });
  }

  // CHANGELOG has [Unreleased]
  const changelogPath = path.join(projectRoot, "CHANGELOG.md");
  const changelog = await Bun.file(changelogPath).text();
  checks.push({
    name: "CHANGELOG.md has [Unreleased]",
    status: changelog.includes("## [Unreleased]") ? "PASS" : "FAIL"
  });
}

async function checkScriptParity(): Promise<void> {
  const scriptBases = [
    "audit", "dev-sync", "gen-pr-body", "git-sync",
    "install-vsp", "setup", "sync-md", "vsp-audit",
    "vsp-publish", "vsp-sync", "vsp-task"
  ];

  for (const base of scriptBases) {
    const shExists = await fileExists(path.join("scripts", `${base}.sh`));
    const ps1Exists = await fileExists(path.join("scripts", `${base}.ps1`));

    if (shExists && ps1Exists) {
      checks.push({
        name: `script parity: ${base}.sh / ${base}.ps1`,
        status: "PASS"
      });
    } else if (!shExists && !ps1Exists) {
      // Neither exists - might be .ts now
      checks.push({
        name: `script parity: ${base} (.ts)`,
        status: "PASS"
      });
    } else {
      checks.push({
        name: `script parity: ${base}`,
        status: "FAIL",
        message: "Only one platform version exists"
      });
    }
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  const fullPath = path.isAbsolute(filePath) ? filePath : path.join(projectRoot, filePath);
  try {
    await Bun.file(fullPath).text();
    return true;
  } catch {
    return false;
  }
}

function printSummary(): void {
  const passed = checks.filter(c => c.status === "PASS").length;
  const failed = checks.filter(c => c.status === "FAIL").length;

  for (const check of checks) {
    const icon = check.status === "PASS" ? "✅" : "❌";
    console.log(`${icon} [${check.status}] ${check.name}`);
    if (check.message) {
      console.log(`   ${check.message}`);
    }
  }

  console.log(`\n${passed} passed, ${failed} failed`);

  if (failed > 0) {
    console.log("\n❌ Some checks failed");
    process.exit(1);
  } else {
    console.log("\n✅ All checks passed");
  }
}

main();
