import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { main } from "./audit";

let root: string;

function writeMinimalWorkspaceRoot(r: string) {
  writeFileSync(path.join(r, "CHANGELOG.md"), "# Changelog\n\n## [Unreleased]\n");
  writeFileSync(path.join(r, "AGENTS.md"), "# Agents\n");
  mkdirSync(path.join(r, "agents"), { recursive: true });
  writeFileSync(path.join(r, "agents", "pm.md"), "# PM\n");
}

function writeProjectLevelFiles(r: string) {
  mkdirSync(path.join(r, "docs"), { recursive: true });
  writeFileSync(path.join(r, "docs", "context.md"), "# Context\n\n## Coding Guidelines\n");
  writeFileSync(path.join(r, ".env.sample"), "SAP_URL=\n");
}

beforeEach(() => {
  root = mkdtempSync(path.join(tmpdir(), "audit-test-"));
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("audit.ts main()", () => {
  test("fails when CHANGELOG.md is missing", async () => {
    mkdirSync(path.join(root, "agents"), { recursive: true });
    writeFileSync(path.join(root, "agents", "pm.md"), "# PM\n");
    writeFileSync(path.join(root, "AGENTS.md"), "# Agents\n");

    const errCount = await main(root);
    expect(errCount).toBeGreaterThan(0);
  });

  test("fails when AGENTS.md is missing", async () => {
    writeFileSync(path.join(root, "CHANGELOG.md"), "## [Unreleased]\n");
    mkdirSync(path.join(root, "agents"), { recursive: true });
    writeFileSync(path.join(root, "agents", "pm.md"), "# PM\n");

    const errCount = await main(root);
    expect(errCount).toBeGreaterThan(0);
  });

  test("fails when agents/ is empty", async () => {
    writeMinimalWorkspaceRoot(root);
    rmSync(path.join(root, "agents"), { recursive: true, force: true });
    mkdirSync(path.join(root, "agents"), { recursive: true });

    const errCount = await main(root);
    expect(errCount).toBeGreaterThan(0);
  });

  test("fails when CHANGELOG.md has no [Unreleased] section", async () => {
    writeMinimalWorkspaceRoot(root);
    writeFileSync(path.join(root, "CHANGELOG.md"), "# Changelog\n\n## [1.0.0]\n");

    const errCount = await main(root);
    expect(errCount).toBeGreaterThan(0);
  });

  test("passes on a minimal valid workspace-root layout (no docs/context.md)", async () => {
    writeMinimalWorkspaceRoot(root);
    const errCount = await main(root);
    expect(errCount).toBe(0);
  });

  test("passes on a minimal valid project layout (with docs/context.md)", async () => {
    writeMinimalWorkspaceRoot(root);
    writeProjectLevelFiles(root);
    const errCount = await main(root);
    expect(errCount).toBe(0);
  });

  test("fails when docs/context.md is missing '## Coding Guidelines'", async () => {
    writeMinimalWorkspaceRoot(root);
    mkdirSync(path.join(root, "docs"), { recursive: true });
    writeFileSync(path.join(root, "docs", "context.md"), "# Context\n\nNo guidelines here.\n");

    const errCount = await main(root);
    expect(errCount).toBeGreaterThan(0);
  });

  test("warns (does not fail) on residual .sh/.ps1 scripts other than vsp-publish", async () => {
    writeMinimalWorkspaceRoot(root);
    writeProjectLevelFiles(root);
    mkdirSync(path.join(root, "scripts"), { recursive: true });
    writeFileSync(path.join(root, "scripts", "legacy.sh"), "#!/bin/bash\n");

    const errCount = await main(root);
    expect(errCount).toBe(0); // residual scripts are a warning, not a failure
  });

  test("does not flag vsp-publish.sh/.ps1 as residual", async () => {
    writeMinimalWorkspaceRoot(root);
    writeProjectLevelFiles(root);
    mkdirSync(path.join(root, "scripts"), { recursive: true });
    writeFileSync(path.join(root, "scripts", "vsp-publish.sh"), "#!/bin/bash\n");
    writeFileSync(path.join(root, "scripts", "vsp-publish.ps1"), "");

    const errCount = await main(root);
    expect(errCount).toBe(0);
  });

  test("resets error count across repeated calls (no state leakage between runs)", async () => {
    // First call: broken workspace
    const first = await main(root);
    expect(first).toBeGreaterThan(0);

    // Second call: fixed workspace — must not carry over errors from the first run
    writeMinimalWorkspaceRoot(root);
    const second = await main(root);
    expect(second).toBe(0);
  });
});
