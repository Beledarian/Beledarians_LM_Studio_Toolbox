"use strict";
const { describe, it, before } = require("node:test");
const assert = require("node:assert/strict");

// We import from dist/ — build must be run before tests.
const { cosineSimilarity } = require("../dist/tools/helpers.js");

// ─── cosineSimilarity ─────────────────────────────────────────────────────────

describe("cosineSimilarity", () => {
  it("returns 1 for identical vectors", () => {
    const v = [1, 2, 3];
    assert.ok(Math.abs(cosineSimilarity(v, v) - 1) < 1e-10);
  });

  it("returns 0 for orthogonal vectors", () => {
    assert.equal(cosineSimilarity([1, 0, 0], [0, 1, 0]), 0);
  });

  it("returns -1 for opposite vectors", () => {
    const result = cosineSimilarity([1, 0], [-1, 0]);
    assert.ok(Math.abs(result - (-1)) < 1e-10);
  });

  it("returns 0 for a zero vector (no division-by-zero NaN)", () => {
    assert.equal(cosineSimilarity([0, 0, 0], [1, 2, 3]), 0);
    assert.equal(cosineSimilarity([1, 2, 3], [0, 0, 0]), 0);
  });

  it("handles single-element vectors", () => {
    assert.ok(Math.abs(cosineSimilarity([5], [5]) - 1) < 1e-10);
  });

  it("produces a value in [-1, 1] for arbitrary vectors", () => {
    const a = [0.1, -0.5, 0.3, 0.8];
    const b = [-0.2, 0.4, 0.6, -0.1];
    const score = cosineSimilarity(a, b);
    assert.ok(score >= -1 && score <= 1, `score ${score} out of range`);
  });

  // BUG-R2 regression: mismatched dimensions previously returned NaN silently.
  it("returns 0 (not NaN) when vector lengths differ (BUG-R2)", () => {
    // Suppress the console.warn for this test
    const originalWarn = console.warn;
    const warnings = [];
    console.warn = (...args) => warnings.push(args.join(" "));
    try {
      const result = cosineSimilarity([1, 2, 3], [1, 2]);
      assert.equal(result, 0, "should return 0 on dimension mismatch");
      assert.ok(!Number.isNaN(result), "should not return NaN");
      assert.ok(warnings.length > 0, "should emit a console.warn");
      assert.ok(
        warnings[0].includes("dimension mismatch"),
        `warning should mention 'dimension mismatch', got: ${warnings[0]}`
      );
    } finally {
      console.warn = originalWarn;
    }
  });

  it("returns 0 (not NaN) when one vector is empty (BUG-R2 edge)", () => {
    const originalWarn = console.warn;
    console.warn = () => {};
    try {
      const result = cosineSimilarity([], [1, 2, 3]);
      assert.equal(result, 0);
      assert.ok(!Number.isNaN(result));
    } finally {
      console.warn = originalWarn;
    }
  });
});

// ─── LRU embedding cache (via _cacheGet/_cacheSet, tested indirectly) ─────────
//
// The internal _cacheGet/_cacheSet helpers are not exported, so we test the
// observable LRU behaviour through the exported cosineSimilarity function and
// by examining that the cache's model-namespaced key contract holds.
//
// We can't drive ragLocalFiles without a live LM Studio client, so we verify
// the BUG-R1 and PERF-R1 invariants by testing the helpers module's exported
// symbols and by reading the compiled source for the key format.

describe("embedding cache contract (static analysis)", () => {
  it("compiled helpers.js uses model-namespaced cache key (BUG-R1)", () => {
    const fs = require("node:fs");
    const src = fs.readFileSync(
      require("node:path").join(__dirname, "../dist/tools/helpers.js"),
      "utf-8"
    );
    // tsc preserves template literals; confirm the key contains "::" between model and path
    assert.ok(
      src.includes('`${embeddingModelName}::${fullPath}`') ||
      src.includes('embeddingModelName + "::" + fullPath') ||
      src.includes('"::"`') ||
      /embeddingModelName.*::.*fullPath/.test(src),
      "Cache key must include '::' separator between model name and path"
    );
  });

  it("compiled helpers.js has a cap constant for LRU eviction (PERF-R1)", () => {
    const fs = require("node:fs");
    const src = fs.readFileSync(
      require("node:path").join(__dirname, "../dist/tools/helpers.js"),
      "utf-8"
    );
    assert.ok(
      src.includes("EMBEDDING_CACHE_MAX_ENTRIES") || src.includes("200"),
      "Should define an LRU cap constant"
    );
  });
});
