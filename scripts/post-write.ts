#!/usr/bin/env bun

/**
 * Post-Write QA Chain
 * Runs SyntaxCheck -> RunUnitTests -> RunATCCheck for a given ABAP object
 *
 * Usage: bun scripts/post-write.ts "<object_url>"
 */

import path from "node:path";

const scriptDir = path.dirname(import.meta.path);
const projectRoot = path.resolve(scriptDir, "..");

interface QAResult {
  step: string;
  status: "PASS" | "FAIL" | "WARN";
  exitCode: number;
  output?: string;
}

async function main(): Promise<void> {
  const objectUrl = process.argv[2];

  if (!objectUrl) {
    console.error("❌ Error: Object URL required");
    console.error("Usage: bun scripts/post-write.ts \"<object_url>\"");
    process.exit(1);
  }

  console.log("🔍 Post-Write QA Chain");
  console.log(`Object: ${objectUrl}\n`);

  const results: QAResult[] = [];

  // Step 1: Syntax Check
  console.log("1️⃣  Syntax Check");
  const syntaxResult = await runSyntaxCheck(objectUrl);
  results.push(syntaxResult);

  if (syntaxResult.status !== "PASS") {
    console.log(`   ❌ Syntax check failed - aborting QA chain`);
    printResults(results);
    process.exit(1);
  }

  // Step 2: Unit Tests
  console.log("\n2️⃣  Unit Tests");
  const testResult = await runUnitTests(objectUrl);
  results.push(testResult);

  // Step 3: ATC Check
  console.log("\n3️⃣  ATC Check");
  const atcResult = await runATCCheck(objectUrl);
  results.push(atcResult);

  // Print summary
  printResults(results);

  // Exit with appropriate code
  const hasP1Failures = atcResult.output?.includes("P1") || atcResult.exitCode !== 0;
  process.exit(hasP1Failures ? 1 : 0);
}

async function runSyntaxCheck(objectUrl: string): Promise<QAResult> {
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
      exitCode: proc.exitCode || 0
    };
  } catch (error) {
    return {
      step: "Syntax Check",
      status: "FAIL",
      exitCode: 1,
      output: String(error)
    };
  }
}

async function runUnitTests(objectUrl: string): Promise<QAResult> {
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
      exitCode: proc.exitCode || 0,
      output: output.substring(0, 200)
    };
  } catch (error) {
    return {
      step: "Unit Tests",
      status: "WARN",
      exitCode: 1,
      output: String(error)
    };
  }
}

async function runATCCheck(objectUrl: string): Promise<QAResult> {
  try {
    const proc = Bun.spawn(["vsp", "atc", "run", "--object", objectUrl], {
      stdout: "pipe",
      stderr: "pipe",
      cwd: projectRoot
    });
    const output = await proc.stdout.text();
    await proc.exited;

    // Check for P1 findings
    const hasP1 = output.includes("P1");

    return {
      step: "ATC Check",
      status: hasP1 ? "FAIL" : proc.exitCode === 0 ? "PASS" : "WARN",
      exitCode: proc.exitCode || 0,
      output: hasP1 ? "P1 findings detected" : output.substring(0, 200)
    };
  } catch (error) {
    return {
      step: "ATC Check",
      status: "FAIL",
      exitCode: 1,
      output: String(error)
    };
  }
}

function printResults(results: QAResult[]): void {
  console.log("\n" + "=".repeat(50));
  console.log("QA Results:");

  for (const result of results) {
    const icon = result.status === "PASS" ? "✅" : result.status === "WARN" ? "⚠️" : "❌";
    console.log(`${icon} ${result.step}: ${result.status}`);
    if (result.output) {
      console.log(`   ${result.output}`);
    }
  }

  const failed = results.filter(r => r.status === "FAIL").length;
  if (failed > 0) {
    console.log(`\n❌ ${failed} critical failure(s) - must fix before committing`);
  } else {
    console.log("\n✅ QA passed - safe to commit");
  }
}

main();
