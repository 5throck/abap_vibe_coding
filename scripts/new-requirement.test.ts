import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { slugify, nextReqId, insertRtmRow, scaffoldRequirement, parseArgs } from "./new-requirement";

let root: string;

const INDEX_CONTENT = `# Global Deliverables Index

## Requirements Traceability Matrix

| REQ ID | Title | Module | Current Stage | Primary Owner | Status | Link | Implemented Objects | QA Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Example** | *Pricing Condition Optimization* | *SD / FI* | *Stage 5* | *SD Analyst* | *Completed* | [Link](./REQ-000-example/) | \`ZCL_SD_PRICING_CALC\` | \`PASSED\` |
`;

function setupDeliverables(r: string) {
  const deliverablesDir = path.join(r, "deliverables");
  mkdirSync(path.join(deliverablesDir, "templates"), { recursive: true });
  writeFileSync(
    path.join(deliverablesDir, "templates", "01_srs.md"),
    "# SRS\n## [REQ-NNN] [Requirement Title]\n\n- **Requirement ID**: REQ-NNN\n- **Title**: [Requirement Name]\n"
  );
  writeFileSync(path.join(deliverablesDir, "index.md"), INDEX_CONTENT);
}

beforeEach(() => {
  root = mkdtempSync(path.join(tmpdir(), "new-req-"));
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("slugify", () => {
  test.each([
    ["Pricing Condition Optimization", "pricing-condition-optimization"],
    ["SD/FI Cross-Module Integration!", "sd-fi-cross-module-integration"],
    ["  leading and trailing  ", "leading-and-trailing"],
  ])("slugifies '%s' -> '%s'", (input, expected) => {
    expect(slugify(input)).toBe(expected);
  });
});

describe("parseArgs", () => {
  test("extracts title, module, and owner from mixed-order args", () => {
    const result = parseArgs(["New", "Pricing", "Rule", "--module", "SD", "--owner", "SD Analyst"]);
    expect(result.title).toBe("New Pricing Rule");
    expect(result.module).toBe("SD");
    expect(result.owner).toBe("SD Analyst");
  });

  test("does not leak --module/--owner values into the title (regression)", () => {
    const result = parseArgs(["Smoke Test Requirement", "--module", "SD", "--owner", "SD Analyst"]);
    expect(result.title).toBe("Smoke Test Requirement");
    expect(result.title).not.toContain("SD");
    expect(result.title).not.toContain("Analyst");
  });

  test("defaults module to CROSS and owner to TBD when omitted", () => {
    const result = parseArgs(["Just", "A", "Title"]);
    expect(result.module).toBe("CROSS");
    expect(result.owner).toBe("TBD");
    expect(result.title).toBe("Just A Title");
  });

  test("handles flags interleaved before the title text", () => {
    const result = parseArgs(["--module", "FI", "Journal", "Entry", "Automation"]);
    expect(result.title).toBe("Journal Entry Automation");
    expect(result.module).toBe("FI");
  });
});

describe("nextReqId", () => {
  test("returns REQ-001 when deliverables/ does not exist", () => {
    expect(nextReqId(path.join(root, "deliverables"))).toBe("REQ-001");
  });

  test("returns REQ-001 when deliverables/ has no REQ- folders", () => {
    const dir = path.join(root, "deliverables");
    mkdirSync(path.join(dir, "templates"), { recursive: true });
    expect(nextReqId(dir)).toBe("REQ-001");
  });

  test("increments from the highest existing REQ number", () => {
    const dir = path.join(root, "deliverables");
    mkdirSync(path.join(dir, "REQ-001-first"), { recursive: true });
    mkdirSync(path.join(dir, "REQ-007-seventh"), { recursive: true });
    mkdirSync(path.join(dir, "REQ-003-third"), { recursive: true });
    expect(nextReqId(dir)).toBe("REQ-008");
  });
});

describe("insertRtmRow", () => {
  test("inserts a new row directly after the table header", () => {
    const result = insertRtmRow(INDEX_CONTENT, "REQ-001", "New Feature", "SD", "SD Analyst", "REQ-001-new-feature");
    const lines = result.split("\n");
    const headerIdx = lines.findIndex((l) => l.startsWith("| :---"));
    expect(lines[headerIdx + 1]).toContain("REQ-001");
    expect(lines[headerIdx + 1]).toContain("New Feature");
    expect(lines[headerIdx + 1]).toContain("Stage 1");
    expect(lines[headerIdx + 1]).toContain("Draft");
    // Existing example row must still be present, just pushed down
    expect(result).toContain("Pricing Condition Optimization");
  });

  test("falls back to appending when the header marker is not found", () => {
    const noHeader = "# Index\n\nNo table here.\n";
    const result = insertRtmRow(noHeader, "REQ-001", "X", "SD", "Owner", "REQ-001-x");
    expect(result).toContain("REQ-001");
    expect(result.startsWith("# Index")).toBe(true);
  });

  test("inserts correctly on CRLF line endings (Windows checkout regression)", () => {
    const crlfContent = INDEX_CONTENT.replace(/\n/g, "\r\n");
    const result = insertRtmRow(crlfContent, "REQ-001", "New Feature", "SD", "SD Analyst", "REQ-001-new-feature");
    const lines = result.split("\r\n");
    const headerIdx = lines.findIndex((l) => l.startsWith("| :---"));
    expect(headerIdx).toBeGreaterThan(-1);
    expect(lines[headerIdx + 1]).toContain("REQ-001");
    // Must not be appended at the very end of the file
    expect(lines[lines.length - 1]).not.toContain("REQ-001");
  });
});

describe("scaffoldRequirement", () => {
  test("creates REQ folder with filled-in 01_srs.md and updates index.md", () => {
    setupDeliverables(root);

    const { reqId, folderPath } = scaffoldRequirement(root, "New Pricing Rule", "SD", "SD Analyst");

    expect(reqId).toBe("REQ-001");
    expect(existsSync(folderPath)).toBe(true);

    const srsContent = readFileSync(path.join(folderPath, "01_srs.md"), "utf-8");
    expect(srsContent).toContain("REQ-001");
    expect(srsContent).toContain("New Pricing Rule");
    expect(srsContent).not.toContain("REQ-NNN");

    const indexContent = readFileSync(path.join(root, "deliverables", "index.md"), "utf-8");
    expect(indexContent).toContain("REQ-001");
    expect(indexContent).toContain("New Pricing Rule");
    expect(indexContent).toContain("Stage 1");
  });

  test("second call increments the REQ id and does not collide", () => {
    setupDeliverables(root);
    const first = scaffoldRequirement(root, "First Requirement", "FI", "FI Analyst");
    const second = scaffoldRequirement(root, "Second Requirement", "MM", "MM Analyst");

    expect(first.reqId).toBe("REQ-001");
    expect(second.reqId).toBe("REQ-002");
    expect(existsSync(first.folderPath)).toBe(true);
    expect(existsSync(second.folderPath)).toBe(true);
  });
});
