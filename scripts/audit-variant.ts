#!/usr/bin/env bun
/**
 * Variant-Specific Audit Hook (co-abap)
 * @version 1.1.0
 * Pluggable hook invoked by scripts/audit.ts (check #27). Core scripts stay
 * standardized across variants; variant projects add custom verification here.
 *
 * Each check guards a project-specific invariant that has regressed at least
 * once in this variant's history:
 *   1. .gitleaks.toml keeps the two co-abap allowlist entries (dropped by the
 *      2026-08 upgrade's LOCKED-file overwrite; restored in PR #96)
 *   2. .mcp.json.sample keeps the SAP_ALLOWED_PACKAGES package guard (the SAP
 *      write-scope security boundary)
 *   3. AGENTS.md keeps the co-abap variant header and paired VARIANT-AGENTS
 *      markers
 *   4. scripts/co-abap/dispatch-*.ts wrappers import the common dispatchers
 *      via ../dispatch-*.ts (broken ../../ path fixed in PR #95)
 *
 * Usage: bun scripts/audit-variant.ts   (exit 0 = pass, exit 1 = fail)
 */

import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const ROOT = process.cwd();
const failures: string[] = [];

function check(name: string, ok: boolean, detail: string): void {
  if (ok) {
    console.log(`[PASS] ${name}`);
  } else {
    console.log(`[FAIL] ${name} — ${detail}`);
    failures.push(name);
  }
}

// ── Check 1: .gitleaks.toml project-specific allowlist entries ──────────────
const gitleaksPath = join(ROOT, ".gitleaks.toml");
if (existsSync(gitleaksPath)) {
  const gitleaks = readFileSync(gitleaksPath, "utf-8");
  check(
    "gitleaks: SAP developer-trial default credential allowlisted",
    /DEVELOPER:Down1oad/.test(gitleaks),
    "allowlist regex 'DEVELOPER:Down1oad' missing from .gitleaks.toml — pushes will false-positive on docs/setup-guide.md"
  );
  check(
    "gitleaks: scratch/ path exclusion present",
    /(^|[^\w])scratch\//.test(gitleaks),
    "'(^|/)scratch/' paths exclusion missing from .gitleaks.toml — vendored ABAP source will trip generic-api-key rules"
  );
} else {
  check("gitleaks config exists", false, ".gitleaks.toml not found at project root");
}

// ── Check 2: .mcp.json.sample SAP package guard ─────────────────────────────
const mcpSamplePath = join(ROOT, ".mcp.json.sample");
if (existsSync(mcpSamplePath)) {
  const mcpSample = readFileSync(mcpSamplePath, "utf-8");
  check(
    "MCP sample: SAP_ALLOWED_PACKAGES guard present",
    mcpSample.includes("SAP_ALLOWED_PACKAGES"),
    "SAP_ALLOWED_PACKAGES missing from .mcp.json.sample — SAP write scope would be unbounded for generated projects"
  );
} else {
  check("MCP sample config exists", false, ".mcp.json.sample not found at project root");
}

// ── Check 3: AGENTS.md variant markers ───────────────────────────────────────
const agentsPath = join(ROOT, "AGENTS.md");
if (existsSync(agentsPath)) {
  const agents = readFileSync(agentsPath, "utf-8");
  const startCount = (agents.match(/VARIANT-AGENTS-START/g) ?? []).length;
  const endCount = (agents.match(/VARIANT-AGENTS-END/g) ?? []).length;
  check("AGENTS.md: variant header marker", agents.includes("<!-- variant: co-abap"), "missing '<!-- variant: co-abap -->' header comment");
  check(
    "AGENTS.md: VARIANT-AGENTS markers paired",
    startCount === 1 && endCount === 1,
    `expected 1 START / 1 END pair, found ${startCount}/${endCount}`
  );
} else {
  check("AGENTS.md exists", false, "AGENTS.md not found at project root");
}

// ── Check 4: co-abap dispatch wrapper import paths ───────────────────────────
for (const wrapper of ["dispatch-parallel.ts", "dispatch-serial.ts"]) {
  const wrapperPath = join(ROOT, "scripts", "co-abap", wrapper);
  if (!existsSync(wrapperPath)) {
    check(`wrapper exists: scripts/co-abap/${wrapper}`, false, "file not found");
    continue;
  }
  const content = readFileSync(wrapperPath, "utf-8");
  const badImport = /from\s+['"]\.\.\/\.\.\//.test(content);
  const goodImport = /from\s+['"]\.\.\//.test(content);
  check(
    `wrapper import path: scripts/co-abap/${wrapper}`,
    goodImport && !badImport,
    "must import common dispatchers via '../dispatch-*.ts' ('../../' resolves outside scripts/ and breaks importability)"
  );
}

console.log("");

// ── Skill-graph drift gate (ADR-0060) ────────────────────────────────────────
// The committed docs/skill-graph.json projection must match the SSOTs
// (agents/ + skills/ + procedures/). verify-skill-graph.ts re-derives the
// graph and exits 1 on drift; the remedy is regenerating + committing.
{
  const res = spawnSync(process.execPath, ["scripts/verify-skill-graph.ts"], {
    cwd: ROOT,
    encoding: "utf-8",
  });
  check(
    "skill-graph projection in sync with SSOTs",
    res.status === 0,
    (res.stdout || "") + (res.stderr || "verify-skill-graph.ts failed — regenerate docs/skill-graph.json and commit")
  );
}

if (failures.length > 0) {
  console.log(`❌ co-abap variant audit: ${failures.length} check(s) failed`);
  process.exit(1);
}
console.log("✅ co-abap variant audit: all checks passed");
