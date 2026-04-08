const test = require("node:test");
const assert = require("node:assert/strict");
const { extractHandoffMessage } = require("../dist/handoffMessage.js");

test("extractHandoffMessage reads marker syntax", () => {
  const input = "Summary text.\n[HANDOFF_MESSAGE]Key findings for relay[/HANDOFF_MESSAGE]";
  const extracted = extractHandoffMessage(input);
  assert.equal(extracted.handoffMessage, "Key findings for relay");
  assert.equal(extracted.response, "Summary text.");
});

test("extractHandoffMessage reads JSON payload", () => {
  const input = JSON.stringify({
    response: "Final review completed.",
    handoff_message: "No critical issues found.",
  });
  const extracted = extractHandoffMessage(input);
  assert.equal(extracted.handoffMessage, "No critical issues found.");
  assert.equal(extracted.response, "Final review completed.");
});

test("extractHandoffMessage leaves normal text untouched", () => {
  const input = "Plain assistant response.";
  const extracted = extractHandoffMessage(input);
  assert.equal(extracted.handoffMessage, undefined);
  assert.equal(extracted.response, input);
});
