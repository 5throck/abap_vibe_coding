#!/usr/bin/env bun
/**
 * ⚠️  DEPRECATED — Use `dev-sync.ts` instead.
 *
 * git-sync.ts is superseded by dev-sync.ts which provides the full pipeline:
 * memlog → sync-md → changelog → audit → sensitive-guard → commit → push → PR
 *
 * This file is kept for backward compatibility only and will be removed in a future release.
 * Usage: bun scripts/dev-sync.ts "feat: description"
 */

import path from "node:path";
import { $ } from "bun";

const scriptDir = path.dirname(import.meta.path);
const projectRoot = path.resolve(scriptDir, "..");

const GREEN = "\x1b[32m";
const CYAN = "\x1b[36m";
const YELLOW = "\x1b[33m";
const RESET = "\x1b[0m";

async function main() {
  console.error(`${YELLOW}⚠️  DEPRECATED: git-sync.ts is superseded by dev-sync.ts.${RESET}`);
  console.error(`${YELLOW}   Use: bun scripts/dev-sync.ts \"feat: description\"${RESET}\n`);

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
