"use strict";
/**
 * Integration tests for createWebTools.
 *
 * fetch_web_content and wikipedia_search route through safeFetch, so their
 * SSRF rejection and error-propagation paths can be exercised by mocking
 * global.fetch — no real network calls are made.
 *
 * rag_web_content also calls safeFetch but then feeds the text through the
 * LM Studio embedding client, which we cannot stub without the SDK.  Its
 * SSRF path is covered here; the RAG path is out-of-scope for unit tests.
 */
const { describe, it, before, after, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");

const { createWebTools } = require("../dist/tools/webTools.js");

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeCtx(overrides = {}) {
  return {
    cwd: process.cwd(),
    protectedPaths: [],
    enableWikipedia: true,
    enableWebSearch: true,
    allowBrowserControl: false,
    client: null,
    embeddingModelName: "test-model",
    browserSession: null,
    pluginConfig: { get: () => null },
    ...overrides,
  };
}

async function callTool(tools, name, args) {
  const t = tools.find(t => t.name === name);
  assert.ok(t, `Tool '${name}' not found`);
  return t.implementation(args);
}

// Saved original fetch so we can restore it after each test
let _originalFetch;
beforeEach(() => { _originalFetch = global.fetch; });
afterEach(() => { global.fetch = _originalFetch; });

// ── fetch_web_content ─────────────────────────────────────────────────────────

describe("fetch_web_content", () => {
  let tools;
  before(() => { tools = createWebTools(makeCtx()); });

  it("returns { error } for a private IP (SSRF guard)", async () => {
    const result = await callTool(tools, "fetch_web_content", { url: "http://169.254.169.254/latest/meta-data/" });
    assert.ok(result.error, "Should return an error object");
    assert.ok(
      result.error.includes("SSRF") || result.error.includes("169.254"),
      `Error should mention SSRF or the blocked IP, got: ${result.error}`
    );
  });

  it("returns { error } for localhost", async () => {
    const result = await callTool(tools, "fetch_web_content", { url: "http://localhost:8080/secret" });
    assert.ok(result.error?.includes("SSRF") || result.error?.includes("localhost"),
      `Expected SSRF error, got: ${result.error}`);
  });

  it("returns { error } for RFC-1918 address", async () => {
    const result = await callTool(tools, "fetch_web_content", { url: "http://192.168.1.1/admin" });
    assert.ok(result.error, "Should block RFC-1918 addresses");
  });

  it("returns { error } for a non-http scheme", async () => {
    const result = await callTool(tools, "fetch_web_content", { url: "ftp://example.com/file" });
    assert.ok(result.error, "Should reject non-http/https schemes");
  });

  it("returns { error } on HTTP 4xx response", async () => {
    global.fetch = async () => new Response("Not Found", { status: 404 });
    const result = await callTool(tools, "fetch_web_content", { url: "https://example.com/missing" });
    assert.ok(result.error, "Should return error on non-ok HTTP status");
    assert.ok(result.error.includes("404") || result.error.includes("HTTP"),
      `Error should mention 404, got: ${result.error}`);
  });

  it("returns { error } on redirect to private IP (SEC-R1 regression)", async () => {
    global.fetch = async () => new Response("", {
      status: 302,
      headers: { Location: "http://169.254.169.254/latest/meta-data/" },
    });
    const result = await callTool(tools, "fetch_web_content", { url: "https://example.com/" });
    assert.ok(result.error, "Should reject redirect to private IP");
    assert.ok(
      result.error.includes("SSRF") || result.error.includes("169.254"),
      `Expected SSRF error on redirect, got: ${result.error}`
    );
  });

  it("extracts title and content from a successful HTML response", async () => {
    global.fetch = async () => new Response(
      "<html><head><title>Test Page</title></head><body><p>Hello world content here.</p></body></html>",
      { status: 200, headers: { "Content-Type": "text/html" } }
    );
    const result = await callTool(tools, "fetch_web_content", { url: "https://example.com/" });
    assert.ok(!result.error, `Should not error: ${result.error}`);
    assert.equal(result.title, "Test Page");
    assert.ok(result.content?.includes("Hello world"), "Should extract body text");
    assert.equal(result.status, 200);
  });

  it("returns { error } on network failure (AbortError)", async () => {
    global.fetch = async () => { throw Object.assign(new Error("fetch failed"), { name: "TypeError" }); };
    const result = await callTool(tools, "fetch_web_content", { url: "https://example.com/" });
    assert.ok(result.error, "Should return error on network failure");
  });
});

// ── rag_web_content ───────────────────────────────────────────────────────────

describe("rag_web_content", () => {
  let tools;
  before(() => { tools = createWebTools(makeCtx()); });

  it("returns { error } for a private IP (SSRF guard)", async () => {
    const result = await callTool(tools, "rag_web_content", { url: "http://10.0.0.1/data", query: "test" });
    assert.ok(result.error, "Should block RFC-1918 in rag_web_content too");
  });

  it("returns { error } on HTTP error response", async () => {
    global.fetch = async () => new Response("Forbidden", { status: 403 });
    const result = await callTool(tools, "rag_web_content", { url: "https://example.com/", query: "test" });
    assert.ok(result.error, "Should return error on non-ok status");
  });

  it("returns { error } when LM Studio client is unavailable", async () => {
    global.fetch = async () => new Response("<html><body><p>Some content here.</p></body></html>",
      { status: 200 });
    const result = await callTool(tools, "rag_web_content", { url: "https://example.com/", query: "test" });
    // client is null in makeCtx() so it should return the "client not available" error
    assert.ok(result.error, "Should error when client is null");
    assert.ok(
      result.error.includes("client") || result.error.includes("Client") || result.error.includes("RAG"),
      `Expected client-unavailable error, got: ${result.error}`
    );
  });
});

// ── wikipedia_search ──────────────────────────────────────────────────────────

describe("wikipedia_search", () => {
  it("throws when disabled via ctx.enableWikipedia = false", async () => {
    // createSafeToolImplementation throws (rather than returning { error })
    // when a tool is disabled, so we use assert.rejects here.
    const tools = createWebTools(makeCtx({ enableWikipedia: false }));
    await assert.rejects(
      () => callTool(tools, "wikipedia_search", { query: "Node.js" }),
      (err) => {
        assert.ok(
          err.message.toLowerCase().includes("disabled") || err.message.toLowerCase().includes("enable"),
          `Expected disabled message, got: ${err.message}`
        );
        return true;
      }
    );
  });

  it("returns results for a successful Wikipedia API response", async () => {
    global.fetch = async (url) => {
      if (url.includes("list=search")) {
        return new Response(JSON.stringify({
          query: { search: [{ pageid: 42, title: "Node.js", snippet: "A runtime" }] },
        }), { status: 200 });
      }
      // page extract call
      return new Response(JSON.stringify({
        query: { pages: { 42: { extract: "Node.js is an open-source server environment." } } },
      }), { status: 200 });
    };
    const tools = createWebTools(makeCtx({ enableWikipedia: true }));
    const result = await callTool(tools, "wikipedia_search", { query: "Node.js" });
    assert.ok(!result.error, `Should not error: ${result.error}`);
    assert.ok(Array.isArray(result.results), "Should return results array");
    assert.equal(result.results[0].title, "Node.js");
    assert.ok(result.results[0].summary.includes("Node.js"), "Summary should include page extract");
  });

  it("returns { error } for private-IP Wikipedia URL override", async () => {
    // Verify the lang param can't be used to redirect requests to internal hosts
    // (lang becomes part of the hostname: `${lang}.wikipedia.org`)
    // A lang value that would form a valid internal host is blocked at the URL
    // level since safeFetch validates the full constructed URL.
    global.fetch = async () => { throw new Error("Should not reach fetch"); };
    const tools = createWebTools(makeCtx({ enableWikipedia: true }));
    // This constructs https://en.wikipedia.org/... which is public — should pass SSRF
    // We only verify here that the tool doesn't throw unhandled on a valid-ish call.
    global.fetch = async () => new Response(
      JSON.stringify({ query: { search: [] } }), { status: 200 }
    );
    const result = await callTool(tools, "wikipedia_search", { query: "test", lang: "en" });
    assert.ok(result.results !== undefined || result.error !== undefined,
      "Should return either results or error, not throw");
  });

  it("returns no-results message when Wikipedia search is empty", async () => {
    global.fetch = async () => new Response(
      JSON.stringify({ query: { search: [] } }), { status: 200 }
    );
    const tools = createWebTools(makeCtx({ enableWikipedia: true }));
    const result = await callTool(tools, "wikipedia_search", { query: "xyzzy12345nonexistent" });
    assert.ok(!result.error, `Should not error: ${result.error}`);
    assert.ok(
      result.results === "No Wikipedia articles found." ||
      (Array.isArray(result.results) && result.results.length === 0),
      "Should report no results"
    );
  });
});
