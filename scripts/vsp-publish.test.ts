// @version 1.0.0
import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

// vsp-publish.ts resolves `sourceDir` from its own script location at import time
// (path.resolve(import.meta.path, "..", "..")), so it always points at this repo's
// real scripts/.. root rather than a test fixture. These tests exercise syncAssets/
// verifyAssets against the REAL source assets (agents/, skills/, docs/*.md,
// scripts/*.ts, .mcp.json.sample) into a disposable target directory — an
// integration-style test rather than a fully isolated unit test, but it still
// verifies the actual sync + hash-verify behavior without touching CLAUDE_PLUGIN_ROOT
// or any git operations (commitAndPush is not invoked).
import { syncAssets, verifyAssets, ASSETS } from "./vsp-publish";

let targetDir: string;

beforeEach(() => {
  targetDir = mkdtempSync(path.join(tmpdir(), "vsp-publish-"));
});

afterEach(() => {
  rmSync(targetDir, { recursive: true, force: true });
});

describe("ASSETS list", () => {
  test("references only .ts scripts, not stale .sh/.ps1 files", () => {
    for (const asset of ASSETS) {
      if (asset.source.startsWith(path.join("scripts", ""))) {
        expect(asset.source.endsWith(".sh")).toBe(false);
        expect(asset.source.endsWith(".ps1")).toBe(false);
      }
    }
  });

  test("every listed source asset exists in this repo", () => {
    const sourceDir = path.resolve(import.meta.dir, "..");
    for (const asset of ASSETS) {
      expect(existsSync(path.join(sourceDir, asset.source))).toBe(true);
    }
  });
});

describe("syncAssets + verifyAssets (integration, real source assets)", () => {
  test("copies all folders and files, and verification passes with no diffs", () => {
    syncAssets(targetDir);

    expect(existsSync(path.join(targetDir, "agents"))).toBe(true);
    expect(existsSync(path.join(targetDir, "skills"))).toBe(true);
    expect(existsSync(path.join(targetDir, "commands"))).toBe(true);
    expect(existsSync(path.join(targetDir, "docs", "task-template.md"))).toBe(true);
    expect(existsSync(path.join(targetDir, "scripts", "sync-md.ts"))).toBe(true);
    expect(existsSync(path.join(targetDir, ".mcp.json.sample"))).toBe(true);

    expect(verifyAssets(targetDir)).toBe(true);
  });

  test("verification fails when a copied file is tampered with", () => {
    syncAssets(targetDir);
    writeFileSync(path.join(targetDir, "docs", "task-template.md"), "tampered content");

    expect(verifyAssets(targetDir)).toBe(false);
  });

  test("verification fails when a copied file is deleted from the target", () => {
    syncAssets(targetDir);
    rmSync(path.join(targetDir, "scripts", "sync-md.ts"));

    expect(verifyAssets(targetDir)).toBe(false);
  });

  test("re-running syncAssets is idempotent (clean folder overwrite)", () => {
    syncAssets(targetDir);
    // Simulate an orphaned file from a prior, differently-shaped agents/ folder
    writeFileSync(path.join(targetDir, "agents", "orphan.md"), "stale");

    syncAssets(targetDir);

    // Folder targets are wiped and recopied, so the orphan must be gone
    expect(existsSync(path.join(targetDir, "agents", "orphan.md"))).toBe(false);
    expect(verifyAssets(targetDir)).toBe(true);
  });
});
