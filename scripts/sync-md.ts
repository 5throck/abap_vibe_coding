#!/usr/bin/env bun
// sync-md.ts - Update memory/MEMORY.md index
// Usage: bun scripts/sync-md.ts "YYYY-MM-DD" "summary"

import path from "node:path";
import * as fs from "node:fs";

const scriptDir = path.dirname(import.meta.path);
const projectRoot = path.resolve(scriptDir, "..");

const MEMORY_FILE = path.join(projectRoot, "memory", "MEMORY.md");

const INIT_CONTENT = `# Memory Index

| Date | Summary |
|------|---------|
`;

async function main() {
  const args = process.argv.slice(2);
  const date: string = args[0] ?? new Date().toISOString().split("T")[0];
  const summary: string = args[1] ?? "update";

  // Ensure memory directory exists
  const memoryDir = path.join(projectRoot, "memory");
  if (!fs.existsSync(memoryDir)) {
    fs.mkdirSync(memoryDir, { recursive: true });
  }

  // Initialize MEMORY.md if missing
  const file = Bun.file(MEMORY_FILE);
  if (!(await file.exists())) {
    await Bun.write(MEMORY_FILE, INIT_CONTENT);
  }

  const content = await Bun.file(MEMORY_FILE).text();

  // Dedup: only append if this date is not already in the index (regex-based — avoids substring false matches)
  const dateRowRegex = new RegExp(`^\\| \\[${date}\\]`, "m");
  if (!dateRowRegex.test(content)) {
    const entry = `| [${date}](${date}.md) | ${summary} |\n`;
    await Bun.write(MEMORY_FILE, content + entry);
    console.log(`✓ Memory index updated: ${date} — ${summary}`);
  } else {
    console.log(`ℹ️  Memory index already has entry for ${date} — skipping.`);
  }
}

if (import.meta.main) {
  main().catch((e) => {
    console.error(`sync-md: ${e.message}`);
    process.exit(1);
  });
}

export { main };
