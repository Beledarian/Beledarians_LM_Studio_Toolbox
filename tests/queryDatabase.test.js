"use strict";
/**
 * Tests for query_database in createMiscTools.
 *
 * The write-blocking regex is tested without a real DB (no native binding
 * needed).  The SELECT happy-path and connection-leak fix require better-sqlite3
 * and are skipped when the native binding is unavailable (same pattern as
 * memoryTools.test.js).
 */
const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs/promises");
const path = require("path");
const os = require("os");

const { createMiscTools } = require("../dist/tools/miscTools.js");

// ── Minimal context stubs ─────────────────────────────────────────────────────

function makeCtx(tmpDir, overrides = {}) {
  return {
    cwd: tmpDir,
    protectedPaths: [],
    allowDb: true,
    allowNotifications: false,
    enableRagLocalFiles: false,
    client: null,
    embeddingModelName: "test-model",
    ...overrides,
  };
}

async function callTool(tools, name, args) {
  const t = tools.find(t => t.name === name);
  assert.ok(t, `Tool '${name}' not found`);
  return t.implementation(args);
}

// Check if better-sqlite3 native binding is available by actually opening a DB.
// require("better-sqlite3") succeeds even without bindings (lazy load); the
// error only surfaces when instantiating Database(), so we must probe that.
let sqliteAvailable = false;
try {
  const Database = require("better-sqlite3");
  new Database(":memory:").close();
  sqliteAvailable = true;
} catch {
  sqliteAvailable = false;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

let tmpDir;
let tools;

describe("query_database", () => {
  before(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "querydb-test-"));
    tools = createMiscTools(makeCtx(tmpDir));
  });

  after(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  // ── Write-blocking (regex-only, no DB needed) ──────────────────────────────

  it("blocks ATTACH DATABASE (SEC-6)", async () => {
    const result = await callTool(tools, "query_database", {
      db_path: "test.db",
      query: "ATTACH DATABASE '/etc/passwd' AS x",
    });
    assert.ok(result.error, "Should block ATTACH");
    assert.ok(result.error.includes("SELECT") || result.error.includes("blocked") || result.error.includes("Only"),
      `Should explain the restriction, got: ${result.error}`);
  });

  it("blocks DETACH (SEC-6)", async () => {
    const result = await callTool(tools, "query_database", { db_path: "test.db", query: "DETACH mydb" });
    assert.ok(result.error, "Should block DETACH");
  });

  it("blocks PRAGMA (SEC-6)", async () => {
    const result = await callTool(tools, "query_database", { db_path: "test.db", query: "PRAGMA journal_mode=WAL" });
    assert.ok(result.error, "Should block PRAGMA");
  });

  it("blocks INSERT", async () => {
    const result = await callTool(tools, "query_database", {
      db_path: "test.db",
      query: "INSERT INTO users (name) VALUES ('x')",
    });
    assert.ok(result.error, "Should block INSERT");
  });

  it("blocks UPDATE", async () => {
    const result = await callTool(tools, "query_database", {
      db_path: "test.db",
      query: "UPDATE users SET name='y' WHERE id=1",
    });
    assert.ok(result.error, "Should block UPDATE");
  });

  it("blocks DELETE", async () => {
    const result = await callTool(tools, "query_database", {
      db_path: "test.db",
      query: "DELETE FROM users",
    });
    assert.ok(result.error, "Should block DELETE");
  });

  it("blocks DROP TABLE", async () => {
    const result = await callTool(tools, "query_database", {
      db_path: "test.db",
      query: "DROP TABLE users",
    });
    assert.ok(result.error, "Should block DROP");
  });

  it("blocks CREATE TABLE", async () => {
    const result = await callTool(tools, "query_database", {
      db_path: "test.db",
      query: "CREATE TABLE x (id INTEGER)",
    });
    assert.ok(result.error, "Should block CREATE");
  });

  it("blocks case-insensitive write statements", async () => {
    const result = await callTool(tools, "query_database", {
      db_path: "test.db",
      query: "insert into users values(1)",
    });
    assert.ok(result.error, "Should block lowercase insert");
  });

  it("blocks whitespace-prefixed write statements", async () => {
    const result = await callTool(tools, "query_database", {
      db_path: "test.db",
      query: "  \n DELETE FROM users",
    });
    assert.ok(result.error, "Should block whitespace-prefixed DELETE");
  });

  it("blocks path traversal (db_path outside workspace)", async () => {
    // validatePath throws an Error (doesn't return { error }) for path violations;
    // the SDK wrapper re-throws it, so we use assert.rejects here.
    await assert.rejects(
      () => callTool(tools, "query_database", { db_path: "../../etc/shadow.db", query: "SELECT 1" }),
      (err) => {
        assert.ok(err.message.includes("Access Denied") || err.message.includes("outside"),
          `Expected Access Denied, got: ${err.message}`);
        return true;
      }
    );
  });

  // ── Happy path (requires better-sqlite3 native binding) ───────────────────

  it("SELECT returns rows from a real SQLite database", { skip: !sqliteAvailable ? "better-sqlite3 native binding not available" : false }, async () => {
    // Create a test DB using the native binding directly
    const Database = require("better-sqlite3");
    const dbPath = path.join(tmpDir, "test.db");
    const db = new Database(dbPath);
    db.exec("CREATE TABLE items (id INTEGER PRIMARY KEY, name TEXT); INSERT INTO items VALUES (1, 'apple'); INSERT INTO items VALUES (2, 'banana');");
    db.close();

    const result = await callTool(tools, "query_database", {
      db_path: "test.db",
      query: "SELECT * FROM items ORDER BY id",
    });
    assert.ok(!result.error, `Should not error: ${result.error}`);
    assert.ok(Array.isArray(result.results), "Should return an array of results");
    assert.equal(result.results.length, 2);
    assert.equal(result.results[0].name, "apple");
    assert.equal(result.results[1].name, "banana");
  });

  it("returns { error } on bad SQL (not a throw)", { skip: !sqliteAvailable ? "better-sqlite3 native binding not available" : false }, async () => {
    const Database = require("better-sqlite3");
    const dbPath = path.join(tmpDir, "test2.db");
    const db = new Database(dbPath);
    db.exec("CREATE TABLE things (id INTEGER)");
    db.close();

    const result = await callTool(tools, "query_database", {
      db_path: "test2.db",
      query: "SELECT * FROM nonexistent_table",
    });
    assert.ok(result.error, "Bad SQL should return { error }, not throw");
    assert.ok(result.error.includes("no such table") || result.error.includes("Database query failed"),
      `Should describe the SQL error, got: ${result.error}`);
  });

  // ── query_database disabled ───────────────────────────────────────────────

  it("tool not present when allowDb is false", () => {
    const disabledCtx = makeCtx(tmpDir, { allowDb: false });
    const disabledTools = createMiscTools(disabledCtx);
    const t = disabledTools.find(t => t.name === "query_database");
    assert.equal(t, undefined, "query_database should not be registered when allowDb is false");
  });
});
