#!/usr/bin/env bun
// git-sync.ts - Commits and pushes all changes to the current branch
// Usage: bun scripts/git-sync.ts [message]

import path from "node:path";
import { $ } from "bun";

const scriptDir = path.dirname(import.meta.path);
const projectRoot = path.resolve(scriptDir, "..");

const GREEN = "\x1b[32m";
const CYAN = "\x1b[36m";
const RESET = "\x1b[0m";

async function main() {
  const message = process.argv.slice(2).join(" ") || "chore: auto-sync documentation and configuration";

  // Get current branch
  const { stdout: branchOut } = await $`git rev-parse --abbrev-ref HEAD`.quiet().nothrow();
  const branch = branchOut.toString().trim();

  console.log("--- Git Sync ---");
  console.log(`Branch: ${branch}`);

  // Stage all changes
  await $`git add .`.quiet().nothrow();

  // Check if there is anything to commit
  const diffCheck = await $`git diff --cached --quiet`.nothrow();
  if (diffCheck.exitCode === 0) {
    console.log(`${CYAN}No changes to sync.${RESET}`);
    return;
  }

  await $`git commit -m ${message}`.quiet().nothrow();
  await $`git push origin ${branch}`.quiet().nothrow();

  console.log(`${GREEN}Successfully synced to Git.${RESET}`);
}

if (import.meta.main) {
  main().catch((e) => {
    console.error(`git-sync: ${e}`);
    process.exit(1);
  });
}

export { main };
