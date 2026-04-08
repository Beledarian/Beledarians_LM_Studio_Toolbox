const test = require("node:test");
const assert = require("node:assert/strict");
const { executeBrowserActions } = require("../dist/browserActions.js");

function createMockPage(options = {}) {
  const calls = [];
  let remainingClickFailures =
    typeof options.clickFailCount === "number"
      ? options.clickFailCount
      : options.clickThrows
        ? Number.MAX_SAFE_INTEGER
        : 0;
  const mockPage = {
    calls,
    waitForSelector: async (selector, config) => { calls.push(["waitForSelector", selector, config]); },
    click: async (selector, config) => {
      calls.push(["click", selector, config]);
      if (remainingClickFailures > 0) {
        remainingClickFailures--;
        throw new Error("Node is either not clickable or not an Element");
      }
    },
    type: async (selector, text, config) => { calls.push(["type", selector, text, config]); },
    select: async (selector, value) => {
      calls.push(["select", selector, value]);
      return options.selectReturns ?? [value];
    },
    hover: async (selector) => { calls.push(["hover", selector]); },
    keyboard: {
      press: async (key) => { calls.push(["press", key]); },
    },
    evaluate: async (_fn, ...args) => {
      calls.push(["evaluate", args]);
      return options.evaluateReturns;
    },
  };
  return mockPage;
}

test("executeBrowserActions handles all supported action types", async () => {
  const page = createMockPage();
  const log = await executeBrowserActions(page, [
    { type: "wait_for_selector", selector: "#app" },
    { type: "wait", milliseconds: 1 },
    { type: "click", selector: "#btn" },
    { type: "type", selector: "#query", text: "hello" },
    { type: "press", key: "Enter" },
    { type: "select", selector: "#sort", value: "relevance" },
    { type: "hover", selector: ".menu" },
    { type: "scroll", y: 300 },
    { type: "scroll", selector: "#result-1" },
    { type: "evaluate", script: "return 1 + 1;" },
  ]);

  assert.deepEqual(log, [
    "wait_for_selector:#app",
    "wait:1",
    "click:#btn",
    "type:#query",
    "press:Enter",
    "select:#sort",
    "hover:.menu",
    "scroll:0,300",
    "scroll_into_view:#result-1",
    "evaluate",
  ]);

  assert.equal(page.calls.some(c => c[0] === "waitForSelector" && c[1] === "#app"), true);
  assert.equal(page.calls.some(c => c[0] === "click" && c[1] === "#btn"), true);
  assert.equal(page.calls.some(c => c[0] === "type" && c[1] === "#query" && c[2] === "hello"), true);
  assert.equal(page.calls.some(c => c[0] === "press" && c[1] === "Enter"), true);
  assert.equal(page.calls.some(c => c[0] === "select" && c[1] === "#sort" && c[2] === "relevance"), true);
  assert.equal(page.calls.some(c => c[0] === "hover" && c[1] === ".menu"), true);
  assert.equal(page.calls.filter(c => c[0] === "evaluate").length, 3); // scroll + scrollIntoView + evaluate
});

test("executeBrowserActions validates required fields", async () => {
  const page = createMockPage();
  await assert.rejects(
    executeBrowserActions(page, [{ type: "click" }]),
    /requires 'selector'/
  );
});

test("executeBrowserActions throws if select option is missing", async () => {
  const page = createMockPage({ selectReturns: [] });
  await assert.rejects(
    executeBrowserActions(page, [{ type: "select", selector: "#mode", value: "missing" }]),
    /found no matching option/
  );
});

test("executeBrowserActions falls back to DOM click when Puppeteer click fails", async () => {
  const page = createMockPage({ clickThrows: true, evaluateReturns: { ok: true } });
  await executeBrowserActions(page, [{ type: "click", selector: "a.Link--primary" }]);
  assert.equal(page.calls.some(c => c[0] === "evaluate"), true);
});

test("executeBrowserActions retries native click before DOM fallback", async () => {
  const page = createMockPage({ clickFailCount: 1 });
  await executeBrowserActions(page, [{ type: "click", selector: "a.Link--primary" }]);
  assert.equal(page.calls.filter(c => c[0] === "click").length, 2);
  assert.equal(page.calls.some(c => c[0] === "evaluate"), false);
});
