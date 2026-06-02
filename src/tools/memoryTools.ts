import { tool, text, type Tool } from "@lmstudio/sdk";
import { z } from "zod";
import { join } from "path";
import { readFile, rename } from "fs/promises";
import type { ToolContext } from "./context";

const DB_FILE = ".memories.db";
const DISABLED_MSG = "Memory is currently disabled in the plugin settings. Please ask the user to enable 'Enable Memory' in the plugin settings.";

/**
 * Module-level connection cache keyed by absolute DB path.
 * Keeps a single open connection per workspace so tools don't pay the
 * open/close overhead on every call (PERF-1).  The `migrationDone` flag
 * ensures the legacy memory.md import runs at most once per session.
 */
const _dbCache = new Map<string, { db: any; migrationDone: boolean }>();

/** Return the cached (or freshly opened) database for the given workspace. */
async function getDb(cwd: string): Promise<{ db: any; migrationDone: boolean }> {
  const dbPath = join(cwd, DB_FILE);
  let entry = _dbCache.get(dbPath);
  if (entry) return entry;

  // Use require() rather than dynamic import(): in a CJS-compiled module,
  // `await import()` of a native addon goes through a different resolution
  // path that can fail on some Node versions even when require() works fine.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Database: new (path: string) => any = require("better-sqlite3");
  const db = new Database(dbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS memories (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      fact        TEXT    NOT NULL,
      tags        TEXT    NOT NULL DEFAULT '',
      created_at  TEXT    NOT NULL,
      updated_at  TEXT    NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_memories_tags ON memories(tags);
  `);
  entry = { db, migrationDone: false };
  _dbCache.set(dbPath, entry);
  return entry;
}

/**
 * One-time migration: if a legacy memory.md exists in the workspace, import
 * its bullet-point entries into SQLite and rename the file so it isn't
 * migrated twice.
 */
async function migrateLegacyFile(cwd: string, db: any): Promise<number> {
  const mdPath = join(cwd, "memory.md");
  let raw: string;
  try {
    raw = await readFile(mdPath, "utf-8");
  } catch {
    return 0; // no legacy file — nothing to do
  }

  const lines = raw.split("\n");
  const insert = db.prepare(
    "INSERT INTO memories (fact, tags, created_at, updated_at) VALUES (?, '', ?, ?)"
  );
  const now = new Date().toISOString();
  let count = 0;

  for (const line of lines) {
    // Match lines like:  - [2024-01-01T00:00:00.000Z] Some fact here
    const m = line.match(/^-\s+\[([^\]]+)\]\s+(.+)$/);
    if (m) {
      const [, ts, fact] = m;
      const created = ts || now;
      insert.run(fact.trim(), created, created);
      count++;
    }
  }

  if (count > 0) {
    await rename(mdPath, join(cwd, "memory.md.migrated"));
  }

  return count;
}

export function createMemoryTools(ctx: ToolContext): Tool[] {
  const tools: Tool[] = [];

  // ─── save_memory ─────────────────────────────────────────────────────────────

  tools.push(tool({
    name: "save_memory",
    description: text`
      Save a specific piece of information or fact to long-term memory.
      Memories persist across conversations and can be tagged for organisation.
      Use this for user preferences, project details, or any fact that should
      be retrievable later.
    `,
    parameters: {
      fact: z.string().describe("The fact or piece of information to remember."),
      tags: z.string().optional().describe("Optional comma-separated tags (e.g. 'preference,ui')."),
    },
    implementation: async ({ fact, tags = "" }) => {
      if (!ctx.enableMemory) return { error: DISABLED_MSG };
      try {
        const entry = await getDb(ctx.cwd);
        let migrated = 0;
        if (!entry.migrationDone) {
          migrated = await migrateLegacyFile(ctx.cwd, entry.db);
          entry.migrationDone = true;
        }
        const now = new Date().toISOString();
        const result = entry.db.prepare(
          "INSERT INTO memories (fact, tags, created_at, updated_at) VALUES (?, ?, ?, ?)"
        ).run(fact.trim(), tags.trim(), now, now);
        const note = migrated > 0 ? ` (also migrated ${migrated} entries from legacy memory.md)` : "";
        return { success: true, id: result.lastInsertRowid, fact, tags, created_at: now, note };
      } catch (e) {
        return { error: `Failed to save memory: ${e instanceof Error ? e.message : String(e)}` };
      }
    },
  }));

  // ─── list_memories ────────────────────────────────────────────────────────────

  tools.push(tool({
    name: "list_memories",
    description: text`
      List stored memories. Optionally filter by tag.
      Returns each memory's ID, fact, tags, and timestamps.
      Use the ID with delete_memory or update_memory.
    `,
    parameters: {
      tag: z.string().optional().describe("Filter to memories that include this tag."),
      limit: z.number().int().min(1).max(200).optional().describe("Max entries to return (default: 50)."),
    },
    implementation: async ({ tag, limit = 50 }) => {
      if (!ctx.enableMemory) return { error: DISABLED_MSG };
      try {
        const { db, migrationDone } = await getDb(ctx.cwd);
        if (!migrationDone) { await migrateLegacyFile(ctx.cwd, db); _dbCache.get(join(ctx.cwd, DB_FILE))!.migrationDone = true; }
        const rows: any[] = tag
          ? db.prepare("SELECT id, fact, tags, created_at, updated_at FROM memories WHERE tags LIKE ? ORDER BY id DESC LIMIT ?").all(`%${tag}%`, limit)
          : db.prepare("SELECT id, fact, tags, created_at, updated_at FROM memories ORDER BY id DESC LIMIT ?").all(limit);
        return { count: rows.length, memories: rows };
      } catch (e) {
        return { error: `Failed to list memories: ${e instanceof Error ? e.message : String(e)}` };
      }
    },
  }));

  // ─── search_memories ──────────────────────────────────────────────────────────

  tools.push(tool({
    name: "search_memories",
    description: text`
      Search stored memories by keyword. Matches against both the fact text
      and any tags. Case-insensitive. Returns results ranked by recency.
    `,
    parameters: {
      query: z.string().describe("Keyword or phrase to search for."),
      limit: z.number().int().min(1).max(50).optional().describe("Max results to return (default: 10)."),
    },
    implementation: async ({ query, limit = 10 }) => {
      if (!ctx.enableMemory) return { error: DISABLED_MSG };
      try {
        const { db, migrationDone } = await getDb(ctx.cwd);
        if (!migrationDone) { await migrateLegacyFile(ctx.cwd, db); _dbCache.get(join(ctx.cwd, DB_FILE))!.migrationDone = true; }
        const pattern = `%${query}%`;
        const rows = db.prepare(
          "SELECT id, fact, tags, created_at, updated_at FROM memories WHERE fact LIKE ? OR tags LIKE ? ORDER BY id DESC LIMIT ?"
        ).all(pattern, pattern, limit);
        return { query, count: rows.length, memories: rows };
      } catch (e) {
        return { error: `Failed to search memories: ${e instanceof Error ? e.message : String(e)}` };
      }
    },
  }));

  // ─── update_memory ────────────────────────────────────────────────────────────

  tools.push(tool({
    name: "update_memory",
    description: text`
      Update the fact text and/or tags of an existing memory by its ID.
      Use list_memories or search_memories to find the ID first.
    `,
    parameters: {
      id: z.number().int().describe("The ID of the memory to update."),
      fact: z.string().optional().describe("New fact text (omit to keep existing)."),
      tags: z.string().optional().describe("New tags (omit to keep existing)."),
    },
    implementation: async ({ id, fact, tags }) => {
      if (!ctx.enableMemory) return { error: DISABLED_MSG };
      if (fact === undefined && tags === undefined) {
        return { error: "Provide at least one of 'fact' or 'tags' to update." };
      }
      try {
        const { db } = await getDb(ctx.cwd);
        const existing: any = db.prepare("SELECT id, fact, tags FROM memories WHERE id = ?").get(id);
        if (!existing) return { error: `No memory found with ID ${id}.` };
        const newFact = fact !== undefined ? fact.trim() : existing.fact;
        const newTags = tags !== undefined ? tags.trim() : existing.tags;
        const now = new Date().toISOString();
        db.prepare("UPDATE memories SET fact = ?, tags = ?, updated_at = ? WHERE id = ?").run(newFact, newTags, now, id);
        return { success: true, id, fact: newFact, tags: newTags, updated_at: now };
      } catch (e) {
        return { error: `Failed to update memory: ${e instanceof Error ? e.message : String(e)}` };
      }
    },
  }));

  // ─── delete_memory ────────────────────────────────────────────────────────────

  tools.push(tool({
    name: "delete_memory",
    description: text`
      Permanently delete a memory by its ID.
      Use list_memories or search_memories to find the ID first.
    `,
    parameters: {
      id: z.number().int().describe("The ID of the memory to delete."),
    },
    implementation: async ({ id }) => {
      if (!ctx.enableMemory) return { error: DISABLED_MSG };
      try {
        const { db } = await getDb(ctx.cwd);
        const existing: any = db.prepare("SELECT fact FROM memories WHERE id = ?").get(id);
        if (!existing) return { error: `No memory found with ID ${id}.` };
        db.prepare("DELETE FROM memories WHERE id = ?").run(id);
        return { success: true, deleted_id: id, deleted_fact: existing.fact };
      } catch (e) {
        return { error: `Failed to delete memory: ${e instanceof Error ? e.message : String(e)}` };
      }
    },
  }));

  return tools;
}
