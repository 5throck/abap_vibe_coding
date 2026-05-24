#!/usr/bin/env bun

/**
 * System Health Check Script
 * Monitors SAP connectivity, MCP servers, git status, and memory logs
 */

import path from "node:path";

const scriptDir = path.dirname(import.meta.path);
const projectRoot = path.resolve(scriptDir, "..");

interface HealthCheck {
  name: string;
  status: "OK" | "WARN" | "FAIL";
  details?: string;
}

async function main(): Promise<void> {
  console.log("🏥 VSP System Health Check\n");

  const checks: HealthCheck[] = [];

  // Check vsp binary
  checks.push(await checkVSPBinary());

  // Check MCP servers
  checks.push(await checkMCPConfig());

  // Check git status
  checks.push(await checkGitStatus());

  // Check memory log
  checks.push(await checkMemoryLog());

  // Print results
  printResults(checks);

  // Generate status file
  await generateStatusFile(checks);
}

async function checkVSPBinary(): Promise<HealthCheck> {
  try {
    const proc = Bun.spawn(["./vsp", "health"], {
      stdout: "pipe",
      stderr: "pipe",
      cwd: projectRoot
    });
    await proc.exited;

    if (proc.exitCode === 0) {
      return { name: "VSP Binary", status: "OK" };
    } else {
      return {
        name: "VSP Binary",
        status: "FAIL",
        details: "vsp health check failed"
      };
    }
  } catch {
    return {
      name: "VSP Binary",
      status: "FAIL",
      details: "vsp binary not found or not executable"
    };
  }
}

async function checkMCPConfig(): Promise<HealthCheck> {
  try {
    const mcpPath = path.join(projectRoot, ".mcp.json");
    const mcpConfig = await Bun.file(mcpPath).text();
    const config = JSON.parse(mcpConfig);

    if (config.mcpServers && Object.keys(config.mcpServers).length > 0) {
      const servers = Object.keys(config.mcpServers).join(", ");
      return {
        name: "MCP Config",
        status: "OK",
        details: `Servers: ${servers}`
      };
    } else {
      return {
        name: "MCP Config",
        status: "WARN",
        details: "No MCP servers configured"
      };
    }
  } catch {
    return {
      name: "MCP Config",
      status: "FAIL",
      details: ".mcp.json not found or invalid"
    };
  }
}

async function checkGitStatus(): Promise<HealthCheck> {
  try {
    const proc = Bun.spawn(["git", "status", "--porcelain"], {
      stdout: "pipe",
      cwd: projectRoot
    });
    const output = await proc.stdout.text();
    await proc.exited;

    if (output.trim().length > 0) {
      const lines = output.trim().split("\n").length;
      return {
        name: "Git Status",
        status: "WARN",
        details: `${lines} uncommitted changes`
      };
    } else {
      return { name: "Git Status", status: "OK" };
    }
  } catch {
    return {
      name: "Git Status",
      status: "FAIL",
      details: "git command failed"
    };
  }
}

async function checkMemoryLog(): Promise<HealthCheck> {
  const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const memoryPath = path.join(projectRoot, "memory", `${today}.md`);

  try {
    await Bun.file(memoryPath).text();
    return {
      name: "Memory Log",
      status: "OK",
      details: `Today's log exists: memory/${today}.md`
    };
  } catch {
    return {
      name: "Memory Log",
      status: "WARN",
      details: `Today's log not found: memory/${today}.md`
    };
  }
}

function printResults(checks: HealthCheck[]): void {
  for (const check of checks) {
    const icon = check.status === "OK" ? "✅" : check.status === "WARN" ? "⚠️" : "❌";
    console.log(`${icon} ${check.name}: ${check.status}`);
    if (check.details) {
      console.log(`   ${check.details}`);
    }
  }

  const failed = checks.filter(c => c.status === "FAIL").length;
  if (failed > 0) {
    console.log(`\n❌ ${failed} check(s) failed`);
    process.exit(1);
  }
}

async function generateStatusFile(checks: HealthCheck[]): Promise<void> {
  const timestamp = new Date().toISOString();
  const content = `# VSP System Status

Generated: ${timestamp}

| Check | Status | Details |
|-------|--------|---------|
${checks.map(c => {
    const icon = c.status === "OK" ? "✅" : c.status === "WARN" ? "⚠️" : "❌";
    return `| ${c.name} | ${icon} ${c.status} | ${c.details || ""} |`;
  }).join("\n")}

`;

  const statusPath = path.join(projectRoot, "scratch", "status.md");
  await Bun.write(statusPath, content);
  console.log("\n📄 Status saved to scratch/status.md");
}

main();
