#!/usr/bin/env bun

/**
 * MCP Configuration Sync Script
 * Reads .mcp.json and syncs to .claude/settings.json and .gemini/settings.json
 */

import path from "node:path";

// Resolve paths relative to script location, not current working directory
const scriptDir = path.dirname(import.meta.path);
const projectRoot = path.resolve(scriptDir, "..");

interface MCPServerConfig {
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  type?: string;
  url?: string;
}

interface MCPConfig {
  mcpServers: Record<string, MCPServerConfig>;
}

async function main(): Promise<void> {
  console.log("🔄 MCP Configuration Sync\n");

  // Read source .mcp.json
  const mcpConfig = await readMCPConfig();
  if (!mcpConfig) {
    console.error("❌ Failed to read .mcp.json");
    process.exit(1);
  }

  // Sync to Claude settings
  console.log("1️⃣  Syncing to .claude/settings.json");
  await syncToClaude(mcpConfig);

  // Sync to Gemini settings
  console.log("\n2️⃣  Syncing to .gemini/settings.json");
  await syncToGemini(mcpConfig);

  console.log("\n✅ MCP configuration synced successfully");
}

async function readMCPConfig(): Promise<MCPConfig | null> {
  try {
    const mcpPath = path.join(projectRoot, ".mcp.json");
    const content = await Bun.file(mcpPath).text();
    return JSON.parse(content);
  } catch (error) {
    console.error("Error reading .mcp.json:", error);
    return null;
  }
}

async function syncToClaude(mcpConfig: MCPConfig): Promise<void> {
  const settingsPath = path.join(projectRoot, ".claude/settings.json");
  const existingSettings = await readSettings(settingsPath);

  const newSettings = {
    ...existingSettings,
    mcpServers: mcpConfig.mcpServers
  };

  await writeSettings(settingsPath, newSettings);
  console.log("   ✅ .claude/settings.json updated");
}

async function syncToGemini(mcpConfig: MCPConfig): Promise<void> {
  const settingsPath = path.join(projectRoot, ".gemini/settings.json");
  const existingSettings = await readSettings(settingsPath);

  const newSettings = {
    ...existingSettings,
    mcpServers: mcpConfig.mcpServers
  };

  await writeSettings(settingsPath, newSettings);
  console.log("   ✅ .gemini/settings.json updated");
}

async function readSettings(path: string): Promise<Record<string, unknown>> {
  try {
    const content = await Bun.file(path).text();
    return JSON.parse(content);
  } catch {
    // File doesn't exist or is invalid, return empty object
    return {};
  }
}

async function writeSettings(path: string, settings: Record<string, unknown>): Promise<void> {
  const content = JSON.stringify(settings, null, 2);
  await Bun.write(path, content);
}

main();
