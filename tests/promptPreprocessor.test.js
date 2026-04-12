const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { getSubAgentDocsCandidatePaths } = require("../dist/promptPreprocessor.js");

test("getSubAgentDocsCandidatePaths prefers plugin path then workspace fallback", () => {
  const workspace = path.resolve("C:\\temp\\workspace");
  const candidates = getSubAgentDocsCandidatePaths(workspace);

  assert.equal(candidates.length, 2);
  assert.equal(candidates[0], path.join(path.dirname(path.resolve(__dirname, "../dist")), "subagent_docs.md"));
  assert.equal(candidates[1], path.join(workspace, "subagent_docs.md"));
});
