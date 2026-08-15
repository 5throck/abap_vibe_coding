#!/usr/bin/env bun
// @version 1.0.0
/**
 * Tests for retry-handler.ts
 * Covers: withRetry success/failure/backoff, classifyError, getRecoverySuggestion
 */

import { describe, test, expect, mock, spyOn } from "bun:test";
import {
  withRetry,
  classifyError,
  getRecoverySuggestion,
  DEFAULT_CONFIG,
} from "./retry-handler";

describe("withRetry", () => {
  test("returns success on first attempt", async () => {
    const fn = mock(async () => "ok");
    const result = await withRetry(fn, { ...DEFAULT_CONFIG, maxRetries: 1 }, "test");

    expect(result.success).toBe(true);
    expect(result.attempts).toBe(1);
    expect(result.result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test("retries on failure and succeeds on later attempt", async () => {
    let callCount = 0;
    const fn = mock(async () => {
      callCount++;
      if (callCount < 2) throw new Error("fail");
      return "recovered";
    });

    const result = await withRetry(fn, { ...DEFAULT_CONFIG, maxRetries: 3, initialDelay: 1 }, "test");

    expect(result.success).toBe(true);
    expect(result.attempts).toBe(2);
    expect(result.result).toBe("recovered");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  test("returns failure after exhausting all retries", async () => {
    const fn = mock(async () => {
      throw new Error("permanent failure");
    });

    const result = await withRetry(fn, { ...DEFAULT_CONFIG, maxRetries: 3, initialDelay: 1 }, "test");

    expect(result.success).toBe(false);
    expect(result.attempts).toBe(3);
    expect(result.lastError?.message).toBe("permanent failure");
    expect(result.result).toBeUndefined();
  });

  test("respects isSuccess predicate — treats false return as failure", async () => {
    const fn = mock(async () => ({ ok: false }));

    const result = await withRetry(
      fn,
      {
        ...DEFAULT_CONFIG,
        maxRetries: 2,
        initialDelay: 1,
        isSuccess: (r) => (r as { ok: boolean }).ok === true,
      },
      "test"
    );

    expect(result.success).toBe(false);
    expect(result.attempts).toBe(2);
  });

  test("succeeds when isSuccess predicate passes", async () => {
    const fn = mock(async () => ({ ok: true }));

    const result = await withRetry(
      fn,
      {
        ...DEFAULT_CONFIG,
        maxRetries: 2,
        initialDelay: 1,
        isSuccess: (r) => (r as { ok: boolean }).ok === true,
      },
      "test"
    );

    expect(result.success).toBe(true);
    expect(result.attempts).toBe(1);
  });

  test("applies exponential backoff (totalTime reflects delays)", async () => {
    let callCount = 0;
    const fn = mock(async () => {
      callCount++;
      if (callCount < 3) throw new Error("fail");
      return "done";
    });

    const start = Date.now();
    await withRetry(fn, { ...DEFAULT_CONFIG, maxRetries: 3, initialDelay: 50, backoffMultiplier: 2, maxDelay: 5000 }, "test");
    const elapsed = Date.now() - start;

    // Should wait ~50ms + ~100ms between retries → at least 100ms total overhead
    expect(elapsed).toBeGreaterThanOrEqual(100);
  });

  test("caps delay at maxDelay", async () => {
    let callCount = 0;
    const fn = mock(async () => {
      callCount++;
      if (callCount < 3) throw new Error("fail");
      return "done";
    });

    const start = Date.now();
    await withRetry(fn, { ...DEFAULT_CONFIG, maxRetries: 3, initialDelay: 10, backoffMultiplier: 1000, maxDelay: 20 }, "test");
    const elapsed = Date.now() - start;

    // Both delays capped at 20ms → at most ~40ms overhead + tolerance
    expect(elapsed).toBeLessThan(200);
  });
});

describe("classifyError", () => {
  test("classifies timeout/network errors as external", () => {
    expect(classifyError(new Error("request timeout"))).toBe("external");
    expect(classifyError(new Error("network unreachable"))).toBe("external");
    expect(classifyError(new Error("connection refused"))).toBe("external");
  });

  test("classifies not-found errors as context", () => {
    expect(classifyError(new Error("file not found"))).toBe("context");
    expect(classifyError(new Error("path does not exist"))).toBe("context");
  });

  test("classifies permission errors as tool", () => {
    expect(classifyError(new Error("permission denied"))).toBe("tool");
    expect(classifyError(new Error("access denied"))).toBe("tool");
  });

  test("classifies everything else as logic", () => {
    expect(classifyError(new Error("unexpected null"))).toBe("logic");
    expect(classifyError(new Error("invalid argument"))).toBe("logic");
  });
});

describe("getRecoverySuggestion", () => {
  test("returns correct suggestion for each error type", () => {
    expect(getRecoverySuggestion("tool")).toContain("permissions");
    expect(getRecoverySuggestion("context")).toContain("files");
    expect(getRecoverySuggestion("logic")).toContain("logic");
    expect(getRecoverySuggestion("external")).toContain("network");
  });

  test("returns fallback for unknown type", () => {
    expect(getRecoverySuggestion("unknown")).toBe("Unknown error type");
  });
});
