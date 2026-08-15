// @version 1.0.0
import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, readdirSync, utimesSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { getDirStats, purgeTemp, archiveTasks } from "./scratch-cleanup";

let root: string;

function touch(filePath: string, daysAgo: number, content = "x") {
  writeFileSync(filePath, content);
  const t = new Date(Date.now() - daysAgo * 86400000);
  utimesSync(filePath, t, t);
}

beforeEach(() => {
  root = mkdtempSync(path.join(tmpdir(), "scratch-cleanup-"));
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("getDirStats", () => {
  test("returns zeroed stats for a missing directory", () => {
    const stats = getDirStats(path.join(root, "nope"));
    expect(stats.fileCount).toBe(0);
    expect(stats.totalSize).toBe(0);
    expect(stats.oldestFile).toBeNull();
  });

  test("counts files and tracks oldest/newest by mtime", () => {
    const dir = path.join(root, "temp");
    mkdirSync(dir, { recursive: true });
    touch(path.join(dir, "old.txt"), 10, "aaaa");
    touch(path.join(dir, "new.txt"), 1, "b");

    const stats = getDirStats(dir);
    expect(stats.fileCount).toBe(2);
    expect(stats.totalSize).toBe(5);
    expect(stats.oldestFile).toBe("old.txt");
    expect(stats.newestFile).toBe("new.txt");
  });

  test("ignores directories nested inside (only counts files)", () => {
    const dir = path.join(root, "temp");
    mkdirSync(path.join(dir, "subdir"), { recursive: true });
    touch(path.join(dir, "file.txt"), 0);
    const stats = getDirStats(dir);
    expect(stats.fileCount).toBe(1);
  });
});

describe("purgeTemp", () => {
  test("deletes files older than the age threshold, keeps newer ones", () => {
    const tempDir = path.join(root, "scratch", "temp");
    mkdirSync(tempDir, { recursive: true });
    touch(path.join(tempDir, "old.txt"), 10);
    touch(path.join(tempDir, "new.txt"), 1);

    purgeTemp(7, false, root);

    const remaining = readdirSync(tempDir);
    expect(remaining).toEqual(["new.txt"]);
  });

  test("dry-run does not delete anything", () => {
    const tempDir = path.join(root, "scratch", "temp");
    mkdirSync(tempDir, { recursive: true });
    touch(path.join(tempDir, "old.txt"), 10);

    purgeTemp(7, true, root);

    expect(existsSync(path.join(tempDir, "old.txt"))).toBe(true);
  });

  test("no-ops when scratch/temp/ does not exist", () => {
    expect(() => purgeTemp(7, false, root)).not.toThrow();
  });

  test("no-ops on an already-empty temp dir", () => {
    const tempDir = path.join(root, "scratch", "temp");
    mkdirSync(tempDir, { recursive: true });
    expect(() => purgeTemp(7, false, root)).not.toThrow();
    expect(readdirSync(tempDir)).toEqual([]);
  });
});

describe("archiveTasks", () => {
  test("archives tasks marked status: done regardless of age", () => {
    const tasksDir = path.join(root, "scratch", "tasks");
    mkdirSync(tasksDir, { recursive: true });
    touch(path.join(tasksDir, "task-done.md"), 0, "# Task\nstatus: done\n");
    touch(path.join(tasksDir, "task-active.md"), 0, "# Task\nstatus: in-progress\n");

    archiveTasks(30, false, root);

    expect(existsSync(path.join(tasksDir, "archive", "task-done.md"))).toBe(true);
    expect(existsSync(path.join(tasksDir, "task-active.md"))).toBe(true);
  });

  test("archives old tasks even without status: done", () => {
    const tasksDir = path.join(root, "scratch", "tasks");
    mkdirSync(tasksDir, { recursive: true });
    touch(path.join(tasksDir, "task-old.md"), 45, "# Old task\n");

    archiveTasks(30, false, root);

    expect(existsSync(path.join(tasksDir, "archive", "task-old.md"))).toBe(true);
  });

  test("dry-run does not move any files", () => {
    const tasksDir = path.join(root, "scratch", "tasks");
    mkdirSync(tasksDir, { recursive: true });
    touch(path.join(tasksDir, "task-done.md"), 0, "status: done\n");

    archiveTasks(30, true, root);

    expect(existsSync(path.join(tasksDir, "task-done.md"))).toBe(true);
    expect(existsSync(path.join(tasksDir, "archive"))).toBe(false);
  });

  test("skips README.md", () => {
    const tasksDir = path.join(root, "scratch", "tasks");
    mkdirSync(tasksDir, { recursive: true });
    touch(path.join(tasksDir, "README.md"), 100, "status: done\n");

    archiveTasks(30, false, root);

    expect(existsSync(path.join(tasksDir, "README.md"))).toBe(true);
    expect(existsSync(path.join(tasksDir, "archive"))).toBe(false);
  });

  test("no-ops when scratch/tasks/ does not exist", () => {
    expect(() => archiveTasks(30, false, root)).not.toThrow();
  });
});
