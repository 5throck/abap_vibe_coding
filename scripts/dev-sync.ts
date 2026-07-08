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
- **Files**: ${fileList}
- **Purpose**:
- **Decisions**:
- **Issues**: None
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
          docs: "### Changed",
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

        // Insert after the [Unreleased] header line
        const newEntry = `\n${category}\n- **[${today}]**: ${msg}\n`;
        const updatedContent = clContent.replace(
          /(## \[Unreleased\])/,
          `$1${newEntry}`
        );
        fs.writeFileSync(changelogPath, updatedContent, "utf-8");
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
  try {
    const { stdout } = await $`git ls-files --others --exclude-standard`.quiet().nothrow();
    const untracked = stdout.toString().trim().split("\n").filter(Boolean);
    const sensitivePattern =
      /\.(pem|key|p12|pfx|jks|keystore)$|^\.env(\.[^sa]|$)|credentials\.json|service.?account\.json|secrets\.ya?ml/;
    const sensitive = untracked.filter((f) => sensitivePattern.test(f));

    if (sensitive.length > 0) {
      console.error(`${RED}❌ Potentially sensitive untracked files detected - refusing git add -A:${RESET}`);
      sensitive.forEach((s) => console.error(`   ${s}`));
      console.error(`${YELLOW}   Stage files explicitly with 'git add <file>' or add them to .gitignore.${RESET}`);
      if (import.meta.main) process.exit(1);
    }
  } catch {
    // ignore
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

  // Stage all changes
  try {
    await $`git add -A`.nothrow();
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

  // Commit
  const commitMsg = `${msg}\n\nCo-Authored-By: Claude <noreply@anthropic.com>`;
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
