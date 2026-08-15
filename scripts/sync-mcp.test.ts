// @version 1.0.0
import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { syncMcp } from "./sync-mcp";

const SSOT = { mcpServers: { abap: { command: "./vsp", args: ["--mode", "hyperfocused"] } } };

let root: string;

function write(rel: string, data: unknown) {
  const p = path.join(root, rel);
  mkdirSync(path.dirname(p), { recursive: true });
  writeFileSync(p, JSON.stringify(data, null, 2));
}

function readJson(rel: string) {
  return JSON.parse(readFileSync(path.join(root, rel), "utf-8"));
}

beforeEach(() => {
  root = mkdtempSync(path.join(tmpdir(), "sync-mcp-"));
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("syncMcp", () => {
  test("fails when .mcp.json is missing", () => {
    expect(syncMcp(root, false)).toBe(1);
  });

  test("fails when .mcp.json has no mcpServers", () => {
    write(".mcp.json", { other: true });
    expect(syncMcp(root, false)).toBe(1);
  });

  test("syncs drifted target and preserves unrelated keys", () => {
    write(".mcp.json", SSOT);
    write(".claude/settings.json", { mcpServers: { old: {} }, hooks: { keep: true } });
    expect(syncMcp(root, false)).toBe(0);
    const updated = readJson(".claude/settings.json");
    expect(updated.mcpServers).toEqual(SSOT.mcpServers);
    expect(updated.hooks).toEqual({ keep: true });
  });

  test("check mode reports drift with exit 1 and does not modify files", () => {
    write(".mcp.json", SSOT);
    write(".gemini/settings.json", { mcpServers: { old: {} } });
    expect(syncMcp(root, true)).toBe(1);
    expect(readJson(".gemini/settings.json").mcpServers).toEqual({ old: {} });
  });

  test("check mode passes when in sync (key order independent)", () => {
    write(".mcp.json", SSOT);
    write(".claude/settings.json", {
      mcpServers: { abap: { args: ["--mode", "hyperfocused"], command: "./vsp" } },
    });
    expect(syncMcp(root, true)).toBe(0);
  });

  test("skips missing targets without error", () => {
    write(".mcp.json", SSOT);
    expect(syncMcp(root, true)).toBe(0);
  });
});
