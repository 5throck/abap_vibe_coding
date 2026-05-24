#!/usr/bin/env bun

/**
 * VSP Development Sync Pipeline
 * Single-source cross-platform implementation
 *
 * Usage: bun scripts/dev-sync.ts "commit message"
 */

import path from "node:path";

const scriptDir = path.dirname(import.meta.path);
const projectRoot = path.resolve(scriptDir, "..");

interface SyncResult {
  success: boolean;
  steps: Array<{ name: string; status: string; output?: string }>;
}

async function main(): Promise<void> {
  const commitMessage = process.argv[2] || "chore: sync development session";

  console.log("🔄 VSP Dev Sync Pipeline\n");
  console.log(`Commit message: "${commitMessage}"\n`);

  const results: SyncResult = {
    success: false,
    steps: []
  };

  // Step 1: Check CHANGELOG
  console.log("1️⃣  Checking CHANGELOG.md");
  const changelogResult = await checkChangelog();
  results.steps.push({ name: "Changelog Check", status: changelogResult ? "✅" : "⚠️" });

  // Step 2: Run audit
  console.log("\n2️⃣  Running documentation audit");
  const auditResult = await runAudit();
  results.steps.push({ name: "Audit", status: auditResult ? "✅" : "❌" });

  // Step 3: Stage and commit
  console.log("\n3️⃣  Committing changes");
  const commitResult = await gitCommit(commitMessage);
  results.steps.push({ name: "Commit", status: commitResult ? "✅" : "❌" });

  results.success = results.steps.every(s => s.status.includes("✅") || s.status.includes("⚠️"));

  console.log("\n" + "=".repeat(50));
  if (results.success) {
    console.log("✅ Sync complete");
  } else {
    console.log("❌ Sync failed - check errors above");
  }

  process.exit(results.success ? 0 : 1);
}

async function checkChangelog(): Promise<boolean> {
  try {
    const changelogPath = path.join(projectRoot, "CHANGELOG.md");
    const changelog = await Bun.file(changelogPath).text();
    if (!changelog.includes("## [Unreleased]")) {
      console.log("   ⚠️  No [Unreleased] section in CHANGELOG.md");
      return false;
    }
    console.log("   ✅ CHANGELOG.md has [Unreleased] section");
    return true;
  } catch (error) {
    console.log(`   ❌ Error reading CHANGELOG.md: ${error}`);
    return false;
  }
}

async function runAudit(): Promise<boolean> {
  try {
    const auditScriptPath = path.join(projectRoot, "scripts", "audit.ts");
    // Call the TypeScript audit script directly
    const proc = Bun.spawn(["bun", auditScriptPath], {
      stdout: "inherit",
      stderr: "inherit"
    });
    await proc.exited;
    return proc.exitCode === 0;
  } catch (error) {
    console.log(`   ❌ Audit failed: ${error}`);
    return false;
  }
}

async function gitCommit(message: string): Promise<boolean> {
  try {
    // Stage all changes
    const addProc = Bun.spawn(["git", "add", "-A"], {
      stdout: "inherit",
      stderr: "inherit",
      cwd: projectRoot
    });
    await addProc.exited;

    // Check if there's anything to commit
    const statusProc = Bun.spawn(["git", "status", "--porcelain"], {
      stdout: "pipe",
      cwd: projectRoot
    });
    const output = await statusProc.stdout.text();
    await statusProc.exited;

    if (output.trim().length === 0) {
      console.log("   ⚠️  No changes to commit");
      return true;
    }

    // Commit with co-authors
    const fullMessage = `${message}

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
Co-Authored-By: Gemini <noreply@google.com>`;

    const commitProc = Bun.spawn(["git", "commit", "-m", fullMessage], {
      stdout: "inherit",
      stderr: "inherit",
      cwd: projectRoot
    });
    await commitProc.exited;

    return commitProc.exitCode === 0;
  } catch (error) {
    console.log(`   ❌ Commit failed: ${error}`);
    return false;
  }
}

main();
