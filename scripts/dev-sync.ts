#!/usr/bin/env bun
// dev-sync.ts - Full pipeline: memlog → sync-md → changelog → audit → commit → push → PR
// Usage: bun scripts/dev-sync.ts "feat: description"

import path from "node:path";
import { $ } from "bun";
import * as fs from "node:fs";
import { withRetry, DEFAULT_CONFIG } from "./retry-handler.ts";

const scriptDir = path.dirname(import.meta.path);
const projectRoot = path.resolve(scriptDir, "..");

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const RESET = "\x1b[0m";

function fatal(msg: string) {
  console.error(`${RED}❌ ${msg}${RESET}`);
  if (import.meta.main) process.exit(1);
}

/**
 * Detect co-author from environment (CLAUDE / GEMINI / ANONYMOUS).
 * Returns a Co-Authored-By trailer line for the commit message.
 */
function detectCoAuthor(): string {
  const env = process.env;
  if (env.CLAUDE_CODE === "1" || env.CLAUDE_SESSION_ID) {
    return "Co-Authored-By: Claude <noreply@anthropic.com>";
  }
  if (env.GEMINI_CLI === "1" || env.GEMINI_SESSION_ID) {
    return "Co-Authored-By: Gemini <noreply@google.com>";
  }
  // Generic fallback
  return "Co-Authored-By: AI Assistant <noreply@ai.example.com>";
}

async function main() {
  const msg = process.argv.slice(2).join(" ") || "chore: update";
  const dateObj = new Date();
  const date = dateObj.toISOString().split("T")[0]; // yyyy-MM-dd

  // ── 1. Write daily session log ────────────────────────────────────────────────
  const memoryDir = path.join(projectRoot, "memory");
  if (!fs.existsSync(memoryDir)) fs.mkdirSync(memoryDir, { recursive: true });

  let gitStatus = "";
  try {
    const { stdout } = await $`git status --short`.quiet().nothrow();
    gitStatus = stdout.toString().trim();
  } catch {
    // ignore
  }

  let fileList = "N/A";
  if (gitStatus) {
    fileList = gitStatus
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const f = line.replace(/^.{2}\s+/, "").trim();
        return `- \`${f}\``;
      })
      .join(", ");
  }

  const separator = fs.existsSync(path.join(memoryDir, `${date}.md`))
    ? "\n---\n\n"
    : "";
  const logEntry = `${separator}## ${msg}
- **Session Summary**: ${fileList}
- **Changes**:
- **Decisions**:
- **Open Issues**: None
`;

  const memoryFile = path.join(memoryDir, `${date}.md`);
  fs.appendFileSync(memoryFile, logEntry, "utf-8");
  console.log(`${GREEN}✓ Session log updated: memory/${date}.md${RESET}`);

  // ── 2. Update MEMORY.md index ────────────────────────────────────────────────
  try {
    await $`bun ${path.join(scriptDir, "sync-md.ts")} ${date} "${msg}"`;
  } catch {
    fatal("sync-md.ts failed");
  }

  // ── 3. Auto-add to CHANGELOG.md [Unreleased] if the section has no entries ───
  const changelogPath = path.join(projectRoot, "CHANGELOG.md");
  if (fs.existsSync(changelogPath)) {
    const clContent = fs.readFileSync(changelogPath, "utf-8");
    const sectionMatch =
      /## \[Unreleased\]([\s\S]*?)(?=\n## |$)/.exec(clContent);

    if (sectionMatch) {
      const unreleasedSection = sectionMatch[1];

      if (!unreleasedSection.includes(msg)) {
        const categoryMap: Record<string, string> = {
          feat: "### Added",
          fix: "### Fixed",
          revert: "### Removed",
          docs: "### Added",
          style: "### Changed",
          refactor: "### Changed",
          perf: "### Changed",
          test: "### Changed",
          chore: "### Changed",
          ci: "### Changed",
        };

        const prefix = msg.split(":")[0] || "chore";
        const category = categoryMap[prefix] || "### Changed";
        const today = dateObj.toISOString().split("T")[0];

        // Check if the category header already exists in the [Unreleased] section
        const categoryExists = unreleasedSection.includes(category);
        if (categoryExists) {
          // Insert entry after the existing category header
          const updatedContent = clContent.replace(
            new RegExp(`(## \\[Unreleased\\][\\s\\S]*?)(^${category}$)`, "m"),
            `$1$2\n- **[${today}]**: ${msg}\n`
          );
          fs.writeFileSync(changelogPath, updatedContent, "utf-8");
        } else {
          // Insert new category header + entry after [Unreleased]
          const newEntry = `\n${category}\n- **[${today}]**: ${msg}\n`;
          const updatedContent = clContent.replace(
            /(## \[Unreleased\])/,
            `$1${newEntry}`
          );
          fs.writeFileSync(changelogPath, updatedContent, "utf-8");
        }
        console.log(`${GREEN}📝 Auto-added changelog entry: ${msg}${RESET}`);
      }
    }
  }

  // ── 4. Audit gate ─────────────────────────────────────────────────────────────
  console.log("");
  try {
    const auditRes = await $`bun ${path.join(scriptDir, "audit.ts")}`.nothrow();
    if (auditRes.exitCode !== 0) {
      console.error(auditRes.stderr.toString());
      fatal("Audit gate failed — fix issues before syncing.");
    }
  } catch (e) {
    fatal(`Audit script error: ${e}`);
  }

  // ── 5. Guard against committing sensitive files ────────────────────────────────
  const sensitivePattern =
    /\.(pem|key|p12|pfx|jks|keystore)$|^\.env(\.[^sa]|$)|credentials\.json|service.?account\.json|secrets\.ya?ml/;

  // Content-level secret patterns to scan in staged file diffs
  const contentSecretPatterns = [
    /password\s*[:=]\s*\S+/i,
    /secret\s*[:=]\s*\S+/i,
    /api[_-]?key\s*[:=]\s*\S+/i,
    /token\s*[:=]\s*\S+/i,
    /private[_-]?key\s*[:=]\s*["']/i,
  ];

  try {
    // Check untracked files
    const { stdout: untrackedOut } = await $`git ls-files --others --exclude-standard`.quiet().nothrow();
    const untracked = untrackedOut.toString().trim().split("\n").filter(Boolean);
    const sensitiveUntracked = untracked.filter((f) => sensitivePattern.test(f));

    // Check staged files
    const { stdout: stagedOut } = await $`git diff --cached --name-only`.quiet().nothrow();
    const staged = stagedOut.toString().trim().split("\n").filter(Boolean);
    const sensitiveStaged = staged.filter((f) => sensitivePattern.test(f));

    // Content-level scan on staged diffs
    const { stdout: diffOut } = await $`git diff --cached`.quiet().nothrow();
    const diffContent = diffOut.toString();
    const contentMatches: string[] = [];
    for (const pattern of contentSecretPatterns) {
      const match = diffContent.match(pattern);
      if (match && match.index !== undefined) {
        const lineNum = diffContent.substring(0, match.index).split("\n").length;
        contentMatches.push(`  Line ~${lineNum}: ${match[0].substring(0, 60)}...`);
      }
    }

    if (sensitiveUntracked.length > 0 || sensitiveStaged.length > 0) {
      console.error(`${RED}❌ Potentially sensitive files detected:${RESET}`);
      sensitiveUntracked.forEach((s) => console.error(`   (untracked) ${s}`));
      sensitiveStaged.forEach((s) => console.error(`   (staged) ${s}`));
      console.error(`${YELLOW}   Stage files explicitly with 'git add <file>' or add them to .gitignore.${RESET}`);
      if (import.meta.main) process.exit(1);
    }

    if (contentMatches.length > 0) {
      console.error(`${RED}❌ Potential secrets detected in staged content:${RESET}`);
      contentMatches.forEach((m) => console.error(`   ${m}`));
      console.error(`${YELLOW}   Remove secrets from staged files before committing.${RESET}`);
      if (import.meta.main) process.exit(1);
    }

    if (sensitiveUntracked.length === 0 && sensitiveStaged.length === 0 && contentMatches.length === 0) {
      console.log(`${GREEN}✓ Sensitive file guard passed.${RESET}`);
    }
  } catch (e) {
    console.error(`${YELLOW}⚠️  Sensitive file guard encountered an error: ${e}${RESET}`);
  }

  // ── 6. Branch → commit → push ────────────────────────────────────────────────
  let currentBranch = "";
  try {
    const { stdout } = await $`git rev-parse --abbrev-ref HEAD`.quiet().nothrow();
    currentBranch = stdout.toString().trim();
  } catch {
    fatal("Failed to determine current branch.");
  }

  let branch = currentBranch;
  if (currentBranch === "main" || currentBranch === "master") {
    const slug = msg
      .replace(/[^a-z0-9]/gi, "-")
      .replace(/-+/g, "-")
      .toLowerCase()
      .substring(0, 40);

    const pad = (n: number) => n.toString().padStart(2, "0");
    const d = new Date();
    const timestamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;

    branch = `pr/${timestamp}-${slug}`;
    try {
      await $`git checkout -b ${branch}`.nothrow();
    } catch {
      fatal(`Failed to create branch '${branch}'`);
    }
  } else {
    console.log(`${CYAN}ℹ️  Already on branch '${branch}' - committing here without creating a new branch.${RESET}`);
  }

  // Stage all changes (use `git add .` to respect .gitignore — avoids submodule/deleted surprises)
  try {
    await $`git add .`.nothrow();
  } catch (e) {
    fatal(`git add failed: ${e}`);
  }

  // Check if there is anything to commit
  const diffCheck = await $`git diff --cached --quiet`.nothrow();
  if (diffCheck.exitCode === 0) {
    // exit code 0 means no differences — nothing to commit
    console.log(`${CYAN}ℹ️  No changes to commit — skipping commit, push, and PR.${RESET}`);
    return;
  }

  // Commit — detect co-author from environment
  const coAuthor = detectCoAuthor();
  const commitMsg = `${msg}\n\n${coAuthor}`;
  try {
    const commitRes = await $`git commit -m ${commitMsg}`.nothrow();
    if (commitRes.exitCode !== 0) {
      throw new Error(commitRes.stderr.toString());
    }
  } catch (e) {
    fatal(`git commit failed: ${e}`);
  }
  console.log(`${GREEN}✓ Committed: ${msg}${RESET}`);

  // Push (with retry)
  const pushRetry = await withRetry(
    () => $`git push -u origin ${branch}`.nothrow(),
    {
      ...DEFAULT_CONFIG,
      maxRetries: 3,
      initialDelay: 1000,
      isSuccess: (r: any) => r.exitCode === 0,
    },
    "git push"
  );
  if (!pushRetry.success) {
    fatal(`git push failed: ${pushRetry.lastError?.message}`);
  }
  console.log(`${GREEN}✓ Pushed to ${branch}${RESET}`);

  // ── 7. Create PR ──────────────────────────────────────────────────────────────
  // Skip if a PR already exists for this branch
  const prCheck = await $`gh pr view ${branch} --json number -q .number`.quiet().nothrow();
  if (prCheck.exitCode === 0) {
    console.log(`${CYAN}ℹ️  PR already exists for branch '${branch}' — skipping PR creation.${RESET}`);
    return;
  }

  const prTemplate = path.join(projectRoot, ".github", "pull_request_template.md");
  let prCreateRetry;

  if (fs.existsSync(prTemplate)) {
    const tplContent = fs.readFileSync(prTemplate, "utf-8");
    prCreateRetry = await withRetry(
      () =>
        $`gh pr create --title ${msg} --body ${tplContent} --base main`.nothrow(),
      {
        ...DEFAULT_CONFIG,
        maxRetries: 3,
        initialDelay: 1000,
        isSuccess: (r: any) => r.exitCode === 0,
      },
      "gh pr create"
    );
  } else {
    prCreateRetry = await withRetry(
      () => $`gh pr create --title ${msg} --fill --base main`.nothrow(),
      {
        ...DEFAULT_CONFIG,
        maxRetries: 3,
        initialDelay: 1000,
        isSuccess: (r: any) => r.exitCode === 0,
      },
      "gh pr create"
    );
  }

  if (!prCreateRetry.success) {
    fatal(`gh pr create failed: ${prCreateRetry.lastError?.message}`);
  }

  console.log(`${GREEN}✓ PR created successfully.${RESET}`);
}

if (import.meta.main) {
  main().catch((e) => {
    console.error(`dev-sync: ${e}`);
    process.exit(1);
  });
}

export { main };
