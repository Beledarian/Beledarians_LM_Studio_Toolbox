const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { getSubAgentDocsCandidatePaths } = require("../dist/promptPreprocessor.js");

test("getSubAgentDocsCandidatePaths prefers plugin path then workspace fallback", () => {
  const workspace = path.resolve("/tmp/workspace");
  const candidates = getSubAgentDocsCandidatePaths(workspace);

  // Returns 2 paths: plugin root and workspace fallback
  assert.equal(candidates.length, 2);
  // Plugin path comes first
  assert.ok(candidates[0].endsWith("subagent_docs.md"));
  // Workspace fallback comes second
  assert.ok(candidates[1].includes(workspace) || candidates[1].includes("\tmp\workspace") || candidates[1].includes("/tmp/workspace"));
});
