"use strict";
/**
 * Tests for the consult_secondary_agent orchestration loop.
 *
 * The sub-agent loop calls fetch() to talk to the secondary LLM endpoint.
 * We mock global.fetch to simulate different model responses without needing
 * a real LM Studio instance.
 *
 * Scenarios covered:
 *  - finish_task terminates the loop cleanly
 *  - TASK_COMPLETED in content terminates the loop
 *  - TASK_FAILED in content terminates the loop
 *  - Expired wall-clock deadline returns { error } immediately
 *  - Non-ok API response returns { error }
 *  - Network failure (fetch throws) returns { error }
 *  - Tools-disabled mode: returns response immediately without tool dispatch
 */
const { describe, it, before, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const os = require("os");
const path = require("path");

const { createSubAgentTools } = require("../dist/tools/subAgentTools.js");

// ── Context stub ──────────────────────────────────────────────────────────────

function makeConfig(overrides = {}) {
  const cfg = {
    secondaryAgentEndpoint: "http://localhost:1234/v1",
    secondaryModelId: "test-model",
    useMainModelForSubAgent: false,
    subAgentProfiles: "{}",
    subAgentTemperature: 0,
    subAgentTimeLimit: 600,
    enableDebugMode: false,
    enableSubAgentDebugLogging: false,
    subAgentAutoSave: false,
    showFullCodeOutput: false,
    subAgentAllowFileSystem: false,
    subAgentAllowWeb: false,
    subAgentAllowCode: false,
    subAgentAllowBrowserControl: false,
    ...overrides,
  };
  return { get: (key) => cfg[key] };
}

function makeCtx(overrides = {}) {
  return {
    cwd: os.tmpdir(),
    protectedPaths: [],
    enableSecondary: true,
    allowBrowserControl: false,
    browserSession: null,
    client: null,
    embeddingModelName: "test-model",
    pluginConfig: makeConfig(),
    ...overrides,
  };
}

async function callTool(tools, name, args) {
  const t = tools.find(t => t.name === name);
  assert.ok(t, `Tool '${name}' not found`);
  return t.implementation(args);
}

/** Build a minimal OpenAI-format chat completion response. */
function makeApiResponse(content) {
  return new Response(
    JSON.stringify({ choices: [{ message: { role: "assistant", content } }] }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

let _originalFetch;
before(() => { _originalFetch = global.fetch; });
afterEach(() => { global.fetch = _originalFetch; });

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("consult_secondary_agent orchestration", () => {

  it("tool not registered when enableSecondary is false", () => {
    const tools = createSubAgentTools(makeCtx({ enableSecondary: false }));
    assert.equal(tools.length, 0, "Should return empty array when disabled");
  });

  it("returns { error } immediately when deadline is already expired", async () => {
    // Set subAgentTimeLimit to 0 so the deadline fires before the first fetch
    const tools = createSubAgentTools(makeCtx({
      pluginConfig: makeConfig({ subAgentTimeLimit: 0 }),
    }));
    global.fetch = async () => { throw new Error("Should not reach fetch when deadline expired"); };
    const result = await callTool(tools, "consult_secondary_agent", {
      task: "do something",
      allow_tools: false,
    });
    assert.ok(result.error, "Should return error when time limit is 0");
    assert.ok(
      result.error.toLowerCase().includes("time") || result.error.toLowerCase().includes("limit") || result.error.toLowerCase().includes("exceeded"),
      `Error should mention time limit, got: ${result.error}`
    );
  });

  it("returns { error } when the API returns a non-ok status", async () => {
    global.fetch = async () => new Response("Internal Server Error", { status: 500 });
    const tools = createSubAgentTools(makeCtx());
    const result = await callTool(tools, "consult_secondary_agent", {
      task: "test task",
      allow_tools: false,
    });
    assert.ok(result.error, "Should return error on 5xx response");
    assert.ok(
      result.error.includes("500") || result.error.toLowerCase().includes("api"),
      `Error should mention status code, got: ${result.error}`
    );
  });

  it("returns { error } when fetch throws (endpoint unreachable)", async () => {
    global.fetch = async () => { throw Object.assign(new Error("ECONNREFUSED"), { code: "ECONNREFUSED" }); };
    const tools = createSubAgentTools(makeCtx());
    const result = await callTool(tools, "consult_secondary_agent", {
      task: "test task",
      allow_tools: false,
    });
    assert.ok(result.error, "Should return error on connection refused");
  });

  it("returns response immediately in no-tools mode (allow_tools: false)", async () => {
    let fetchCount = 0;
    global.fetch = async () => {
      fetchCount++;
      return makeApiResponse("Here is my answer to your task.");
    };
    const tools = createSubAgentTools(makeCtx());
    const result = await callTool(tools, "consult_secondary_agent", {
      task: "summarize something",
      allow_tools: false,
    });
    assert.ok(!result.error, `Should not error: ${result.error}`);
    assert.equal(fetchCount, 1, "Should make exactly one fetch call in no-tools mode");
    assert.ok(result.response?.includes("answer"), "Should return the model's response");
  });

  it("terminates cleanly on TASK_COMPLETED in content", async () => {
    let fetchCount = 0;
    global.fetch = async () => {
      fetchCount++;
      return makeApiResponse("I have finished the work. TASK_COMPLETED");
    };
    const tools = createSubAgentTools(makeCtx({
      pluginConfig: makeConfig({ subAgentAllowFileSystem: true }),
    }));
    const result = await callTool(tools, "consult_secondary_agent", {
      task: "do a task",
      allow_tools: true,
    });
    assert.ok(!result.error, `Should not error: ${result.error}`);
    // Loop should not have continued past the first TASK_COMPLETED
    assert.equal(fetchCount, 1, "Should stop at TASK_COMPLETED on first response");
  });

  it("terminates cleanly on TASK_FAILED in content", async () => {
    let fetchCount = 0;
    global.fetch = async () => {
      fetchCount++;
      return makeApiResponse("I cannot complete this. TASK_FAILED");
    };
    const tools = createSubAgentTools(makeCtx({
      pluginConfig: makeConfig({ subAgentAllowFileSystem: true }),
    }));
    const result = await callTool(tools, "consult_secondary_agent", {
      task: "do an impossible task",
      allow_tools: true,
    });
    // TASK_FAILED should cause the loop to break — result may be a response or error
    assert.equal(fetchCount, 1, "Should stop at TASK_FAILED on first response");
    // Should not keep looping (fetchCount would be 8 if it didn't break)
  });

  it("terminates cleanly on finish_task tool call", async () => {
    let fetchCount = 0;
    global.fetch = async () => {
      fetchCount++;
      return makeApiResponse(
        JSON.stringify({ tool: "finish_task", args: { message: "All done", status: "success" } })
      );
    };
    const tools = createSubAgentTools(makeCtx({
      pluginConfig: makeConfig({ subAgentAllowFileSystem: true }),
    }));
    const result = await callTool(tools, "consult_secondary_agent", {
      task: "finish the task",
      allow_tools: true,
    });
    assert.ok(!result.error, `Should not error on finish_task: ${result.error}`);
    assert.equal(fetchCount, 1, "Should stop after finish_task tool call");
  });

  it("extracts handoff_message from response", async () => {
    global.fetch = async () => makeApiResponse(
      "Here is what I found. [HANDOFF_MESSAGE]Key finding: the answer is 42.[/HANDOFF_MESSAGE] TASK_COMPLETED"
    );
    const tools = createSubAgentTools(makeCtx());
    const result = await callTool(tools, "consult_secondary_agent", {
      task: "research something",
      allow_tools: false,
    });
    assert.ok(!result.error, `Should not error: ${result.error}`);
    assert.ok(
      result.handoff_message?.includes("42") || result.response?.includes("42"),
      "Should surface handoff message content"
    );
  });
});
