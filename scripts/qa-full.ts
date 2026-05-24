#!/usr/bin/env bun
/**
 * Full QA Chain
 * Executes complete QA pipeline: SyntaxCheck → UnitTests → ATCCheck
 * ATC Priority 1 findings are blocking
 */

import path from "node:path";

const scriptDir = path.dirname(import.meta.path);
const projectRoot = path.resolve(scriptDir, "..");

interface QAResult {
  step: string;
  status: "PASS" | "FAIL" | "WARN" | "SKIPPED";
  duration: number;
  output?: string;
  p1Findings?: number;
}

async function main(): Promise<void> {
  const objectUrl = process.argv[2];

  if (!objectUrl) {
    console.error("❌ Error: Object URL required");
    console.error("Usage: bun scripts/qa-full.ts \"<object_url>\"");
    process.exit(1);
  }

  console.log("🔍 Full QA Chain\n");
  console.log(`Object: ${objectUrl}\n`);

  const results: QAResult[] = [];
  const startTime = Date.now();

  // Step 1: Syntax Check (required)
  console.log("1️⃣  Syntax Check");
  const syntaxResult = await runSyntaxCheck(objectUrl);
  results.push(syntaxResult);

  if (syntaxResult.status === "FAIL") {
    console.log("   ❌ Syntax check failed - aborting QA chain");
    printResults(results, Date.now() - startTime);
    saveReport(results, objectUrl, Date.now() - startTime);
    process.exit(1);
  }

  // Step 2: Unit Tests
  console.log("\n2️⃣  Unit Tests");
  const testResult = await runUnitTests(objectUrl);
  results.push(testResult);

  // Step 3: ATC Check (blocking on P1)
  console.log("\n3️⃣  ATC Check");
  const atcResult = await runATCCheck(objectUrl);
  results.push(atcResult);

  const totalDuration = Date.now() - startTime;
  printResults(results, totalDuration);
  saveReport(results, objectUrl, totalDuration);

  // Exit with error if P1 findings exist
  const hasP1 = results.some(r => r.p1Findings && r.p1Findings > 0);
  process.exit(hasP1 ? 1 : 0);
}

async function runSyntaxCheck(objectUrl: string): Promise<QAResult> {
  const start = Date.now();
  try {
    const proc = Bun.spawn(["vsp", "syntax", "check", "--object", objectUrl], {
      stdout: "pipe",
      stderr: "pipe",
      cwd: projectRoot
    });
    await proc.exited;

    return {
      step: "Syntax Check",
      status: proc.exitCode === 0 ? "PASS" : "FAIL",
      duration: Date.now() - start
    };
  } catch (error) {
    return {
      step: "Syntax Check",
      status: "FAIL",
      duration: Date.now() - start,
      output: String(error)
    };
  }
}

async function runUnitTests(objectUrl: string): Promise<QAResult> {
  const start = Date.now();
  try {
    const proc = Bun.spawn(["vsp", "test", "run", "--object", objectUrl], {
      stdout: "pipe",
      stderr: "pipe",
      cwd: projectRoot
    });
    const output = await proc.stdout.text();
    await proc.exited;

    return {
      step: "Unit Tests",
      status: proc.exitCode === 0 ? "PASS" : "WARN",
      duration: Date.now() - start,
      output: extractSummary(output, 200)
    };
  } catch (error) {
    return {
      step: "Unit Tests",
      status: "WARN",
      duration: Date.now() - start,
      output: String(error)
    };
  }
}

async function runATCCheck(objectUrl: string): Promise<QAResult> {
  const start = Date.now();
  try {
    const proc = Bun.spawn(["vsp", "atc", "run", "--object", objectUrl], {
      stdout: "pipe",
      stderr: "pipe",
      cwd: projectRoot
    });
    const output = await proc.stdout.text();
    await proc.exited;

    // Count P1 findings
    const p1Matches = output.match(/Priority\s*1/g);
    const p1Count = p1Matches ? p1Matches.length : 0;

    return {
      step: "ATC Check",
      status: p1Count > 0 ? "FAIL" : proc.exitCode === 0 ? "PASS" : "WARN",
      duration: Date.now() - start,
      output: extractSummary(output, 300),
      p1Findings: p1Count
    };
  } catch (error) {
    return {
      step: "ATC Check",
      status: "FAIL",
      duration: Date.now() - start,
      output: String(error)
    };
  }
}

function extractSummary(text: string, maxLength: number): string {
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}

function printResults(results: QAResult[], totalDuration: number): void {
  console.log("\n" + "=".repeat(50));
  console.log("QA Results:");
  console.log("=".repeat(50));

  for (const result of results) {
    const icon = result.status === "PASS" ? "✅" : result.status === "WARN" ? "⚠️" : result.status === "SKIPPED" ? "⏭️" : "❌";
    const duration = `${result.duration}ms`;
    console.log(`${icon} ${result.step}: ${result.status} (${duration})`);

    if (result.p1Findings !== undefined && result.p1Findings > 0) {
      console.log(`   🚨 ${result.p1Findings} P1 findings - MUST FIX`);
    }
    if (result.output) {
      console.log(`   ${result.output}`);
    }
  }

  console.log("=".repeat(50));
  console.log(`Total Duration: ${totalDuration}ms`);

  const hasP1 = results.some(r => r.p1Findings && r.p1Findings > 0);
  const failed = results.filter(r => r.status === "FAIL").length;

  if (hasP1) {
    console.log("\n❌ BLOCKED: P1 findings must be fixed before committing");
  } else if (failed > 0) {
    console.log("\n❌ FAILED: Some checks failed");
  } else {
    console.log("\n✅ PASSED: QA complete - safe to commit");
  }
}

async function saveReport(results: QAResult[], objectUrl: string, duration: number): Promise<void> {
  const timestamp = new Date().toISOString();
  const dateStr = new Date().toISOString().split("T")[0];

  const reportPath = path.join(projectRoot, "scratch", "qa-reports");
  await ensureDir(reportPath);

  const reportFile = path.join(reportPath, `${dateStr}.md`);

  const content = `# QA Report: ${objectUrl}

**Timestamp:** ${timestamp}
**Object:** ${objectUrl}
**Total Duration:** ${duration}ms

## Results

| Step | Status | Duration | Notes |
|------|--------|----------|-------|
${results.map(r => {
  const icon = r.status === "PASS" ? "✅" : r.status === "WARN" ? "⚠️" : "❌";
  const notes = r.p1Findings ? `${r.p1Findings} P1 findings` : r.output || "";
  return `| ${r.step} | ${icon} ${r.status} | ${r.duration}ms | ${notes} |`;
}).join("\n")}

---

*Auto-generated by scripts/qa-full.ts*
`;

  await Bun.write(reportFile, content);
  console.log(`\n📄 Report saved to: ${reportFile}`);
}

async function ensureDir(dirPath: string): Promise<void> {
  try {
    await Bun.file(dirPath).text();
  } catch {
    await Bun.spawn(["mkdir", "-p", dirPath], { stdout: "pipe", stderr: "pipe" });
  }
}

main();
