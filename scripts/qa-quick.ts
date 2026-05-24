#!/usr/bin/env bun
/**
 * Quick Syntax Check
 * Fast syntax-only validation for development workflow
 */

import path from "node:path";

const scriptDir = path.dirname(import.meta.path);
const projectRoot = path.resolve(scriptDir, "..");

async function main(): Promise<void> {
  const objectUrl = process.argv[2];

  if (!objectUrl) {
    console.error("❌ Error: Object URL required");
    console.error("Usage: bun scripts/qa-quick.ts \"<object_url>\"");
    process.exit(1);
  }

  console.log("⚡ Quick Syntax Check");

  const proc = Bun.spawn(["vsp", "syntax", "check", "--object", objectUrl], {
    stdout: "inherit",
    stderr: "inherit",
    cwd: projectRoot
  });

  await proc.exited;
  process.exit(proc.exitCode ?? 0);
}

main();
