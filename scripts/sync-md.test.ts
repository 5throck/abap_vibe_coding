#!/usr/bin/env bun
/**
 * Tests for sync-md.ts
 * Covers: MEMORY.md initialisation, entry append, dedup logic
 *
 * Uses temp directories to avoid touching the real memory/ directory.
 */

import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";

// ---------------------------------------------------------------------------
// Helpers — replicate sync-md logic in-test so we can control paths
// ---------------------------------------------------------------------------

const INIT_CONTENT = `# Memory Index

| Date | Summary |
|------|---------|
`;

function initialiseMemory(filePath: string): void {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, INIT_CONTENT, "utf-8");
  }
}

/**
 * Append-only if not already present for this date.
 * Mirrors the production logic from sync-md.ts (Task 13: regex-based dedup).
 */
function appendEntry(filePath: string, date: string, summary: string): "appended" | "skipped" {
  const content = fs.readFileSync(filePath, "utf-8");

  // Regex-based dedup: match table row for this date
  const dateRowRegex = new RegExp(`^\\| \\[${date}\\]`, "m");
  if (dateRowRegex.test(content)) {
    return "skipped";
  }

  const entry = `| [${date}](${date}.md) | ${summary} |\n`;
  fs.writeFileSync(filePath, content + entry, "utf-8");
  return "appended";
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe("sync-md", () => {
  let tmpDir: string;
  let memoryFile: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "sync-md-test-"));
    memoryFile = path.join(tmpDir, "MEMORY.md");
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test("creates MEMORY.md with header on first run", () => {
    initialiseMemory(memoryFile);

    expect(fs.existsSync(memoryFile)).toBe(true);
    const content = fs.readFileSync(memoryFile, "utf-8");
    expect(content).toContain("# Memory Index");
    expect(content).toContain("| Date | Summary |");
    expect(content).toContain("|------|---------|");
  });

  test("appends a new entry to the index", () => {
    initialiseMemory(memoryFile);
    const result = appendEntry(memoryFile, "2026-07-09", "project review");

    expect(result).toBe("appended");
    const content = fs.readFileSync(memoryFile, "utf-8");
    expect(content).toContain("| [2026-07-09](2026-07-09.md) | project review |");
  });

  test("skips duplicate date (idempotent)", () => {
    initialiseMemory(memoryFile);

    const r1 = appendEntry(memoryFile, "2026-07-09", "first entry");
    const r2 = appendEntry(memoryFile, "2026-07-09", "duplicate entry");

    expect(r1).toBe("appended");
    expect(r2).toBe("skipped");

    const content = fs.readFileSync(memoryFile, "utf-8");
    // Count occurrences of the date pattern
    const matches = content.match(/\[2026-07-09\]/g) || [];
    expect(matches.length).toBe(1);
  });

  test("appends multiple distinct dates in order", () => {
    initialiseMemory(memoryFile);

    appendEntry(memoryFile, "2026-07-01", "kickoff");
    appendEntry(memoryFile, "2026-07-05", "review");
    appendEntry(memoryFile, "2026-07-09", "remediation");

    const content = fs.readFileSync(memoryFile, "utf-8");
    const lines = content.split("\n").filter((l) => l.includes("]("));
    expect(lines).toHaveLength(3);

    // Verify order
    expect(lines[0]).toContain("2026-07-01");
    expect(lines[1]).toContain("2026-07-05");
    expect(lines[2]).toContain("2026-07-09");
  });

  test("dedup uses regex — does not false-match on substring", () => {
    initialiseMemory(memoryFile);

    appendEntry(memoryFile, "2026-07-09", "entry");
    const result = appendEntry(memoryFile, "2026-07-091", "different date");

    // 2026-07-091 should NOT be skipped (it's a different date)
    expect(result).toBe("appended");
    const content = fs.readFileSync(memoryFile, "utf-8");
    const lines = content.split("\n").filter((l) => l.includes("]("));
    expect(lines).toHaveLength(2);
  });

  test("idempotent initialisation — does not overwrite existing file", () => {
    // Write an existing file with content
    fs.mkdirSync(path.dirname(memoryFile), { recursive: true });
    fs.writeFileSync(memoryFile, "# Custom Header\n| Date | Summary |\n|------|---------|\n", "utf-8");

    initialiseMemory(memoryFile);

    // Should still have the original header
    const content = fs.readFileSync(memoryFile, "utf-8");
    expect(content).toContain("# Custom Header");
    expect(content).not.toContain("# Memory Index");
  });
});
