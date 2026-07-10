import { describe, test, expect } from "bun:test";
import {
  detectCoAuthor,
  categorizeCommitMessage,
  insertChangelogEntry,
  SENSITIVE_FILE_PATTERN,
  CONTENT_SECRET_PATTERNS,
} from "./dev-sync";

describe("detectCoAuthor", () => {
  test("detects Claude from CLAUDE_CODE env var", () => {
    expect(detectCoAuthor({ CLAUDE_CODE: "1" } as NodeJS.ProcessEnv)).toContain("Claude");
  });

  test("detects Claude from CLAUDE_SESSION_ID env var", () => {
    expect(detectCoAuthor({ CLAUDE_SESSION_ID: "abc" } as NodeJS.ProcessEnv)).toContain("Claude");
  });

  test("detects Gemini from GEMINI_CLI env var", () => {
    expect(detectCoAuthor({ GEMINI_CLI: "1" } as NodeJS.ProcessEnv)).toContain("Gemini");
  });

  test("falls back to generic AI Assistant", () => {
    expect(detectCoAuthor({} as NodeJS.ProcessEnv)).toContain("AI Assistant");
  });
});

describe("categorizeCommitMessage", () => {
  test.each([
    ["feat: add thing", "### Added"],
    ["fix: broken thing", "### Fixed"],
    ["revert: undo thing", "### Removed"],
    ["docs: update readme", "### Added"],
    ["chore: bump deps", "### Changed"],
    ["refactor: cleanup", "### Changed"],
    ["ci: add job", "### Changed"],
    ["unknownprefix: whatever", "### Changed"],
    ["no colon here", "### Changed"],
  ])("categorizes '%s' as %s", (msg, expected) => {
    expect(categorizeCommitMessage(msg)).toBe(expected);
  });
});

describe("insertChangelogEntry", () => {
  const base = `# Changelog\n\n## [Unreleased]\n### Added\n- existing entry\n\n---\n\n## [1.0.0] — 2026-01-01\n### Added\n- old release entry\n`;

  test("inserts under existing category header", () => {
    const result = insertChangelogEntry(base, "feat: new thing", "### Added", "2026-07-11");
    expect(result).toContain("### Added\n- **[2026-07-11]**: feat: new thing\n\n- existing entry");
  });

  test("creates new category header when absent", () => {
    const result = insertChangelogEntry(base, "fix: bug", "### Fixed", "2026-07-11");
    expect(result).toContain("### Fixed\n- **[2026-07-11]**: fix: bug");
  });

  test("does not duplicate an entry already present", () => {
    const withEntry = insertChangelogEntry(base, "feat: new thing", "### Added", "2026-07-11");
    const again = insertChangelogEntry(withEntry, "feat: new thing", "### Added", "2026-07-11");
    expect(again).toBe(withEntry);
  });

  test("does not touch content outside [Unreleased] section", () => {
    const result = insertChangelogEntry(base, "fix: bug", "### Fixed", "2026-07-11");
    expect(result).toContain("## [1.0.0] — 2026-01-01\n### Added\n- old release entry");
  });

  test("returns content unchanged when no [Unreleased] section exists", () => {
    const noUnreleased = "# Changelog\n\n## [1.0.0]\n### Added\n- entry\n";
    expect(insertChangelogEntry(noUnreleased, "feat: x", "### Added", "2026-07-11")).toBe(
      noUnreleased
    );
  });
});

describe("SENSITIVE_FILE_PATTERN", () => {
  test.each([
    [".env", true],
    [".env.local", true],
    ["id_rsa.pem", true],
    ["cert.p12", true],
    ["service_account.json", true],
    ["secrets.yaml", true],
    [".env.sample", false],
    ["README.md", false],
    ["scripts/audit.ts", false],
  ])("matches '%s' -> %s", (file, expected) => {
    expect(SENSITIVE_FILE_PATTERN.test(file)).toBe(expected);
  });
});

describe("CONTENT_SECRET_PATTERNS", () => {
  test("detects password assignment", () => {
    const found = CONTENT_SECRET_PATTERNS.some((p) => p.test('password: "hunter2"'));
    expect(found).toBe(true);
  });

  test("detects api key assignment", () => {
    const found = CONTENT_SECRET_PATTERNS.some((p) => p.test("api_key=abc123xyz"));
    expect(found).toBe(true);
  });

  test("does not flag normal code", () => {
    const found = CONTENT_SECRET_PATTERNS.some((p) => p.test("const total = price * qty;"));
    expect(found).toBe(false);
  });
});
