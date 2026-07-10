#!/usr/bin/env bun
// audit.ts - Workspace standards / documentation integrity check
// Exit code 0 = pass, non-zero = fail.

import path from "node:path";
import * as fs from "node:fs";

const scriptDir = path.dirname(import.meta.path);
const projectRoot = path.resolve(scriptDir, "..");

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const RESET = "\x1b[0m";

let errors = 0;

function pass(msg: string) {
  console.log(`${GREEN}[PASS]${RESET} ${msg}`);
}

function fail(msg: string) {
  console.error(`${RED}[FAIL]${RESET} ${msg}`);
  errors++;
}

function warn(msg: string) {
  console.log(`${YELLOW}[WARN]${RESET} ${msg}`);
}

async function main() {
  console.log(`${CYAN}=== audit.ts - workspace standards check ===${RESET}\n`);

  // 1. CHANGELOG.md must exist
  if (fs.existsSync(path.join(projectRoot, "CHANGELOG.md"))) {
    pass("CHANGELOG.md exists");
  } else {
    fail("CHANGELOG.md missing");
  }

  // 2. CONSTITUTION.md (workspace-level — warn if absent, not a project blocker)
  if (
    fs.existsSync(path.join(projectRoot, "CONSTITUTION.md")) ||
    fs.existsSync(path.join(projectRoot, "..", "CONSTITUTION.md")) ||
    fs.existsSync(path.join(projectRoot, "..", "..", "CONSTITUTION.md"))
  ) {
    pass("CONSTITUTION.md accessible");
  } else {
    warn("CONSTITUTION.md not found (expected at ./, ../, or ../../) — this is a workspace-level check, not a project blocker");
  }

  // 3. CHANGELOG.md must have [Unreleased] section
  const changelogPath = path.join(projectRoot, "CHANGELOG.md");
  if (fs.existsSync(changelogPath)) {
    const content = fs.readFileSync(changelogPath, "utf-8");
    if (content.includes("[Unreleased]")) {
      pass("CHANGELOG.md has [Unreleased] section");
    } else {
      fail("CHANGELOG.md is missing '[Unreleased]' section");
    }
  }

  // 4. AGENTS.md must exist
  if (fs.existsSync(path.join(projectRoot, "AGENTS.md"))) {
    pass("AGENTS.md exists");
  } else {
    fail("AGENTS.md missing (required for agent-first projects)");
  }

  // 5. At least one agent file must exist in agents/
  const agentsDir = path.join(projectRoot, "agents");
  try {
    const agentFiles = fs.readdirSync(agentsDir).filter((f) => f.endsWith(".md"));
    if (agentFiles.length > 0) {
      pass("agents/ has agent files");
    } else {
      fail("agents/ is empty or missing - create at least agents/pm.md");
    }
  } catch {
    fail("agents/ is empty or missing - create at least agents/pm.md");
  }

  // Project-level checks (only when docs/context.md exists)
  const ctxPath = path.join(projectRoot, "docs", "context.md");
  if (fs.existsSync(ctxPath)) {
    // 6. docs/context.md must have ## Coding Guidelines
    const ctxContent = fs.readFileSync(ctxPath, "utf-8");
    if (/^## Coding Guidelines/m.test(ctxContent)) {
      pass("docs/context.md has ## Coding Guidelines");
    } else {
      fail("docs/context.md is missing '## Coding Guidelines' section");
    }

    // 7. .env.sample must exist
    if (fs.existsSync(path.join(projectRoot, ".env.sample"))) {
      pass(".env.sample exists");
    } else {
      warn(".env.sample not found - add one if this project uses environment variables");
    }

    // 8. Check for residual .sh/.ps1 scripts that should have been converted to .ts
    const scriptsDir = path.join(projectRoot, "scripts");
    try {
      const scriptFiles = fs.readdirSync(scriptsDir);
      const residualSh = scriptFiles.filter(
        (f) => f.endsWith(".sh") && !f.startsWith("vsp-publish")
      );
      const residualPs1 = scriptFiles.filter(
        (f) => f.endsWith(".ps1") && !f.startsWith("vsp-publish")
      );
      // vsp-publish.sh/.ps1 are an ADR-0036 exception (plugin packaging; TS port pending)
      // — excluded from failure above, but surfaced here so the exemption stays visible.
      const exempted = scriptFiles.filter((f) => f.startsWith("vsp-publish"));
      if (residualSh.length === 0 && residualPs1.length === 0) {
        if (exempted.length > 0) {
          warn(
            `scripts/ has ADR-0036 exempted legacy script(s): ${exempted.join(", ")} (TS port pending)`
          );
        }
        pass("scripts/ fully migrated to TypeScript (no residual .sh/.ps1)");
      } else {
        for (const f of residualSh) {
          warn(`scripts/ has residual .sh file: ${f}`);
        }
        for (const f of residualPs1) {
          warn(`scripts/ has residual .ps1 file: ${f}`);
        }
      }
    } catch {
      // scripts/ directory might not exist in some contexts
    }

    // 9. Check scratch/ workspace hygiene
    const scratchDir = path.join(projectRoot, "scratch");
    if (fs.existsSync(scratchDir)) {
      const scratchRootFiles = fs.readdirSync(scratchDir).filter(
        (f) => !fs.statSync(path.join(scratchDir, f)).isDirectory() && !f.startsWith(".")
      );
      if (scratchRootFiles.length > 0) {
        warn(`scratch/ has ${scratchRootFiles.length} root-level file(s) — organize into stable/, tasks/, or remove`);
      } else {
        pass("scratch/ root is clean (no stray files)");
      }

      const tempDir = path.join(scratchDir, "temp");
      if (fs.existsSync(tempDir)) {
        const tempFiles = fs.readdirSync(tempDir).filter((f) => !f.startsWith("."));
        if (tempFiles.length > 0) {
          warn(`scratch/temp/ has ${tempFiles.length} tracked file(s) — temp/ should be empty (add to .gitignore)`);
        } else {
          pass("scratch/temp/ is empty");
        }
      }
    }
  } else {
    warn("docs/context.md not found - skipping project-level checks (workspace root)");
  }

  console.log("");
  if (errors === 0) {
    console.log(`${GREEN}✅ All checks passed.${RESET}`);
    process.exit(0);
  } else {
    console.log(`${RED}❌ ${errors} check(s) failed. Fix before committing.${RESET}`);
    process.exit(1);
  }
}

if (import.meta.main) {
  main().catch((e) => {
    console.error(`audit: ${e.message}`);
    process.exit(1);
  });
}

export { main };
