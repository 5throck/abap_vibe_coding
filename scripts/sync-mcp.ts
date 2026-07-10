#!/usr/bin/env bun
// sync-mcp.ts - Propagate MCP server config from .mcp.json (SSOT) to platform settings.
//
// Targets:
//   .claude/settings.json  (Claude Code)
//   .gemini/settings.json  (Gemini CLI)
//
// Only the `mcpServers` key is replaced; all other keys in the target files
// (hooks, permissions, etc.) are preserved.
//
// Usage:
//   bun scripts/sync-mcp.ts           # sync targets from .mcp.json
//   bun scripts/sync-mcp.ts --check   # report drift only, exit 1 if drift found
//
// Referenced by .githooks/pre-commit Step 5 (MCP configuration drift check).

import path from "node:path";
import * as fs from "node:fs";

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const RESET = "\x1b[0m";

const TARGETS = [".claude/settings.json", ".gemini/settings.json"];

function stableStringify(value: unknown): string {
  return JSON.stringify(value, (_key, v) => {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      return Object.fromEntries(
        Object.keys(v)
          .sort()
          .map((k) => [k, (v as Record<string, unknown>)[k]])
      );
    }
    return v;
  });
}

export function syncMcp(projectRoot: string, checkOnly: boolean): number {
  const ssotPath = path.join(projectRoot, ".mcp.json");
  if (!fs.existsSync(ssotPath)) {
    console.error(`${RED}[FAIL]${RESET} .mcp.json not found at ${ssotPath}`);
    return 1;
  }

  const ssot = JSON.parse(fs.readFileSync(ssotPath, "utf-8"));
  if (!ssot.mcpServers || typeof ssot.mcpServers !== "object") {
    console.error(`${RED}[FAIL]${RESET} .mcp.json has no mcpServers object`);
    return 1;
  }

  let drift = 0;
  for (const target of TARGETS) {
    const targetPath = path.join(projectRoot, target);
    if (!fs.existsSync(targetPath)) {
      console.log(`${YELLOW}[SKIP]${RESET} ${target} not found`);
      continue;
    }

    const settings = JSON.parse(fs.readFileSync(targetPath, "utf-8"));
    const inSync =
      stableStringify(settings.mcpServers ?? null) === stableStringify(ssot.mcpServers);

    if (inSync) {
      console.log(`${GREEN}[PASS]${RESET} ${target} in sync with .mcp.json`);
      continue;
    }

    drift++;
    if (checkOnly) {
      console.error(`${RED}[FAIL]${RESET} ${target} drifted from .mcp.json — run: bun scripts/sync-mcp.ts`);
    } else {
      settings.mcpServers = ssot.mcpServers;
      fs.writeFileSync(targetPath, JSON.stringify(settings, null, 2) + "\n", "utf-8");
      console.log(`${GREEN}[SYNC]${RESET} ${target} updated from .mcp.json`);
    }
  }

  return checkOnly && drift > 0 ? 1 : 0;
}

if (import.meta.main) {
  const scriptDir = path.dirname(import.meta.path);
  const projectRoot = path.resolve(scriptDir, "..");
  const checkOnly = process.argv.includes("--check");
  process.exit(syncMcp(projectRoot, checkOnly));
}
