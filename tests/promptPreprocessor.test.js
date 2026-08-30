const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { getDateTimeContext, getSubAgentDocsCandidatePaths } = require("../dist/promptPreprocessor.js");

test("getDateTimeContext includes unambiguous UTC and local time", () => {
  const context = getDateTimeContext(new Date("2026-08-30T10:15:30.000Z"), "Europe/Berlin");

  assert.match(context, /UTC: 2026-08-30T10:15:30\.000Z/);
  assert.match(context, /Local \(Europe\/Berlin\)/);
  assert.match(context, /12:15:30/);
});

test("getSubAgentDocsCandidatePaths prefers plugin path then workspace fallback", () => {
  const workspace = path.resolve("/tmp/workspace");
  const candidates = getSubAgentDocsCandidatePaths(workspace);

  // Returns 4 paths: plugin root, plugin instructions/, workspace instructions/, workspace root
  assert.equal(candidates.length, 4);
  
  // Plugin paths come first (root and instructions/)
  assert.ok(candidates[0].endsWith("subagent_docs.md"));
  assert.ok(candidates[1].includes("instructions") && candidates[1].endsWith("subagent_docs.md"));
  
  // Workspace fallbacks come last (instructions/ then root)
  assert.ok(candidates[2].includes(workspace) || candidates[2].includes("\\tmp\\workspace") || candidates[2].includes("/tmp/workspace"));
  assert.ok(candidates[3].includes(workspace) || candidates[3].includes("\\tmp\\workspace") || candidates[3].includes("/tmp/workspace"));
});
