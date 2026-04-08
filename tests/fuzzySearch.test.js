const test = require("node:test");
const assert = require("node:assert/strict");
const { levenshteinDistance, computeFuzzyScore, rankFuzzyMatches } = require("../dist/fuzzySearch.js");

test("levenshteinDistance computes expected distance", () => {
  assert.equal(levenshteinDistance("kitten", "sitting"), 3);
  assert.equal(levenshteinDistance("abc", "abc"), 0);
});

test("computeFuzzyScore favors close matches", () => {
  const exact = computeFuzzyScore("browser session", "browser session");
  const close = computeFuzzyScore("browser session", "browser sesion");
  const far = computeFuzzyScore("browser session", "local file search");
  assert.ok(exact > close);
  assert.ok(close > far);
});

test("rankFuzzyMatches returns sorted top matches", () => {
  const ranked = rankFuzzyMatches("tools provider", [
    "src/toolsProvider.ts",
    "README.md",
    "src/fuzzySearch.ts",
    "src/toolsDocumentation.ts",
  ], 3);

  assert.equal(ranked.length, 3);
  assert.equal(ranked[0].value, "src/toolsProvider.ts");
  assert.ok(ranked[0].score >= ranked[1].score);
});
