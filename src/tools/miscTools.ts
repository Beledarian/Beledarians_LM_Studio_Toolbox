import { tool, type Tool } from "@lmstudio/sdk";
import { z } from "zod";
import { spawn } from "child_process";
import { readFile } from "fs/promises";
import * as os from "os";
import type { ToolContext } from "./context";
import { validatePath, ragLocalFiles } from "./helpers";
import { savePersistedState } from "../stateManager";
import { writeFile as fsWriteFile } from "fs/promises";
import { join as pathJoin } from "path";
import { homedir } from "os";
import { parseProtectedPaths } from "./helpers";

export function createMiscTools(ctx: ToolContext): Tool[] {
  const tools: Tool[] = [];

  // ─── System Info ─────────────────────────────────────────────────────────────

  tools.push(tool({
    name: "get_system_info",
    description: "Get information about the system (OS, CPU, Memory).",
    parameters: {},
    implementation: async () => ({
      platform: os.platform(), arch: os.arch(), release: os.release(),
      hostname: os.hostname(), total_memory: os.totalmem(), free_memory: os.freemem(),
      cpus: os.cpus().length, node_version: process.version,
    }),
  }));

  // ─── Clipboard ───────────────────────────────────────────────────────────────

  /** Try each {command, args} pair in order; return the first that succeeds. */
  async function tryClipboardCmds(
    candidates: Array<{ cmd: string; args: string[]; stdin?: string }>,
    isRead: boolean,
  ): Promise<Record<string, unknown>> {
    for (const { cmd, args, stdin } of candidates) {
      const result = await new Promise<Record<string, unknown>>(resolve => {
        const child = spawn(cmd, args, { stdio: ["pipe", "pipe", "pipe"] });
        let output = "", error = "";
        child.stdout.on("data", d => output += d.toString());
        child.stderr.on("data", d => error += d.toString());
        child.on("close", code => {
          if (code === 0) resolve(isRead ? { content: output.trim() } : { success: true });
          else resolve({ _failed: true, error: `${cmd}: exit ${code}. ${error.trim()}` });
        });
        child.on("error", () => resolve({ _failed: true, error: `${cmd}: not found` }));
        if (stdin !== undefined) { child.stdin.write(stdin); child.stdin.end(); }
        else child.stdin.end();
      });
      if (!result._failed) return result;
    }
    return { error: "No clipboard tool found. Install xclip, xsel, or wl-clipboard." };
  }

  tools.push(tool({
    name: "read_clipboard",
    description: "Read text content from the system clipboard.",
    parameters: {},
    implementation: async () => {
      let candidates: Array<{ cmd: string; args: string[] }>;

      if (process.platform === "win32") {
        candidates = [{ cmd: "powershell", args: ["-command", "Get-Clipboard"] }];
      } else if (process.platform === "darwin") {
        candidates = [{ cmd: "pbpaste", args: [] }];
      } else {
        // Linux: try Wayland first, then X11 tools
        candidates = [
          { cmd: "wl-paste", args: ["--no-newline"] },
          { cmd: "xclip", args: ["-selection", "clipboard", "-o"] },
          { cmd: "xsel", args: ["--clipboard", "--output"] },
        ];
      }

      return Promise.race([
        tryClipboardCmds(candidates, true),
        new Promise<Record<string, unknown>>((_, reject) =>
          setTimeout(() => reject(new Error("Clipboard operation timeout")), 5000)
        ),
      ]).catch(err => ({ error: err.message }));
    },
  }));

  tools.push(tool({
    name: "write_clipboard",
    description: "Write text content to the system clipboard.",
    parameters: { content: z.string() },
    implementation: async ({ content }) => {
      let candidates: Array<{ cmd: string; args: string[]; stdin?: string }>;

      if (process.platform === "win32") {
        const b64 = Buffer.from(content, "utf8").toString("base64");
        candidates = [{
          cmd: "powershell",
          args: ["-command", `$str=[System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String('${b64}')); Set-Clipboard -Value $str`],
        }];
      } else if (process.platform === "darwin") {
        candidates = [{ cmd: "pbcopy", args: [], stdin: content }];
      } else {
        candidates = [
          { cmd: "wl-copy", args: [], stdin: content },
          { cmd: "xclip", args: ["-selection", "clipboard", "-i"], stdin: content },
          { cmd: "xsel", args: ["--clipboard", "--input"], stdin: content },
        ];
      }

      return Promise.race([
        tryClipboardCmds(candidates, false),
        new Promise<Record<string, unknown>>((_, reject) =>
          setTimeout(() => reject(new Error("Clipboard operation timeout")), 5000)
        ),
      ]).catch(err => ({ error: err.message }));
    },
  }));

  // ─── Open / Preview ──────────────────────────────────────────────────────────

  tools.push(tool({
    name: "open_file",
    description: "Open a file or URL in the system's default application. Use this to preview images, PDFs, or open web pages.",
    parameters: { target: z.string().describe("File path or URL") },
    implementation: async ({ target }) => {
      let targetToOpen = target;
      if (!target.startsWith("http://") && !target.startsWith("https://")) {
        targetToOpen = validatePath(ctx.cwd, target, ctx.protectedPaths);
      }
      const open = (await import("open")).default;
      await open(targetToOpen);
      return { success: true, message: `Opened ${targetToOpen}` };
    },
  }));

  tools.push(tool({
    name: "preview_html",
    description: "Render and preview HTML content in the system's default browser. Useful for visualizing code or UIs.",
    parameters: {
      html_content: z.string(),
      file_name: z.string().optional().describe("Optional filename (default: preview.html)"),
    },
    implementation: async ({ html_content, file_name }) => {
      const { writeFile } = await import("fs/promises");
      const name = file_name || `preview_${Date.now()}.html`;
      const filePath = validatePath(ctx.cwd, name, ctx.protectedPaths);
      await writeFile(filePath, html_content, "utf-8");
      const open = (await import("open")).default;
      await open(filePath);
      return { success: true, path: filePath, message: "HTML preview launched in browser." };
    },
  }));

  // ─── Documents ───────────────────────────────────────────────────────────────

  tools.push(tool({
    name: "read_document",
    description: "Read content from a file, with intelligent handling for common formats. Supports PDF, DOCX, plain text (.txt, .md, .csv, .json, .xml, .html, and other text files). Large files are automatically truncated to 40,000 characters.",
    parameters: { file_path: z.string() },
    implementation: async ({ file_path }) => {
      const fpath = validatePath(ctx.cwd, file_path, ctx.protectedPaths);
      const ext = fpath.split(".").pop()?.toLowerCase() ?? "";
      const MAX_CHARS = 40_000;
      try {
        if (ext === "pdf") {
          // pdf-parse is a CJS module — use require() for consistency with other
          // native/CJS deps in this codebase (same reason as better-sqlite3).
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string; info: Record<string, unknown>; numpages: number }>;
          const dataBuffer = await readFile(fpath);
          const data = await pdfParse(dataBuffer);
          const text = data.text.substring(0, MAX_CHARS);
          return { content: text, metadata: data.info, pages: data.numpages, truncated: data.text.length > MAX_CHARS };
        }

        if (ext === "docx") {
          // mammoth has proper ESM types — dynamic import works fine here.
          const mammoth = await import("mammoth");
          const result = await mammoth.extractRawText({ path: fpath });
          const text = result.value.substring(0, MAX_CHARS);
          return { content: text, messages: result.messages, truncated: result.value.length > MAX_CHARS };
        }

        // Phase L: general text-file handling (txt, md, csv, json, xml, html, etc.)
        const raw = await readFile(fpath, "utf-8");
        const truncated = raw.length > MAX_CHARS;
        const content = raw.substring(0, MAX_CHARS) + (truncated ? "\n… [truncated]" : "");

        if (ext === "json") {
          try {
            JSON.parse(raw); // validate; surface parse errors as part of the result
            return { content, format: "json", truncated, valid_json: true };
          } catch (parseErr) {
            return { content, format: "json", truncated, valid_json: false, parse_error: String(parseErr) };
          }
        }

        if (ext === "csv") {
          const lines = raw.split("\n");
          return { content, format: "csv", truncated, row_count: lines.length, header: lines[0] ?? "" };
        }

        // txt, md, xml, html, and everything else — return as plain text
        return { content, format: ext || "text", truncated };
      } catch (e) {
        return { error: `Failed to read document: ${e instanceof Error ? e.message : String(e)}` };
      }
    },
  }));

  // ─── Notifications ───────────────────────────────────────────────────────────

  if (ctx.allowNotify) {
    tools.push(tool({
      name: "send_notification",
      description: "Send a system notification to the user.",
      parameters: { title: z.string(), message: z.string() },
      implementation: async ({ title, message }) => {
        const notifier = await import("node-notifier");
        notifier.default.notify({ title, message, sound: true, wait: false });
        return { success: true, message: "Notification sent." };
      },
    }));
  }

  // ─── Database ────────────────────────────────────────────────────────────────

  if (ctx.allowDb) {
    tools.push(tool({
      name: "query_database",
      description: "Execute a read-only query on a SQLite database file.",
      parameters: { db_path: z.string(), query: z.string() },
      implementation: async ({ db_path, query }) => {
        const fpath = validatePath(ctx.cwd, db_path, ctx.protectedPaths);
        if (/^\s*(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|REPLACE|ATTACH|DETACH|PRAGMA)\b/i.test(query)) {
          return { error: "Only SELECT/read queries are allowed. Statements that modify data or attach external databases are blocked." };
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let db: any = null;
        try {
          const Database = (await import("better-sqlite3")).default;
          db = new Database(fpath, { readonly: true });
          const stmt = db.prepare(query);
          const results = stmt.all();
          return { results };
        } catch (e) {
          return { error: `Database query failed: ${e instanceof Error ? e.message : String(e)}` };
        } finally {
          db?.close();
        }
      },
    }));
  }

  // ─── RAG on Local Files ──────────────────────────────────────────────────────

  if (ctx.enableLocalRag) {
    tools.push(tool({
      name: "rag_local_files",
      description: "Perform RAG (Retrieval-Augmented Generation) on files in the current workspace. Use this to find code snippets or information within local files relevant to a query.",
      parameters: {
        query: z.string(),
        path: z.string().optional().describe("Sub-directory to limit search (default: current working directory)"),
        file_pattern: z.string().optional().describe("File pattern to include (e.g. '.ts', 'src/'). Default: all text files."),
      },
      implementation: async ({ query, path = ".", file_pattern = "" }, toolCtx) => {
        try {
          if (!ctx.client) return { error: "LM Studio Client unavailable." };
          const targetDir = validatePath(ctx.cwd, path, ctx.protectedPaths);
          toolCtx?.status?.("Scanning workspace files…");
          const results = await ragLocalFiles({
            query, targetDir, filePattern: file_pattern,
            client: ctx.client, embeddingModelName: ctx.embeddingModelName,
            onStatus: (text) => toolCtx?.status?.(text),
          });
          return { query, results: results.map(r => ({ file: r.file, score: r.score.toFixed(3), content: r.content })) };
        } catch (error) {
          return { error: `Local RAG failed: ${error instanceof Error ? error.message : String(error)}` };
        }
      },
    }));
  }

  // ── M.3: save_session_note ────────────────────────────────────────────────

  tools.push(tool({
    name: "save_session_note",
    description: "Save a free-text note about your current progress or next steps. The note is persisted to disk and will be injected into the context at the start of the next conversation, helping you resume exactly where you left off after a context reset.",
    parameters: {
      note: z.string().describe("Brief summary of current state, progress made, and next steps. Injected at conversation start on resume."),
    },
    implementation: async ({ note }) => {
      ctx.fullState.sessionNotes = note.trim();
      await savePersistedState(ctx.fullState);
      return { success: true, message: "Session note saved. It will appear in context when this conversation is resumed." };
    },
  }));

  // ── M.4: Workspace Profiles ───────────────────────────────────────────────

  const PROFILES_PATH = pathJoin(homedir(), ".lm-studio-toolbox", "profiles.json");

  async function loadProfiles(): Promise<Record<string, { cwd: string; protectedPaths: string[]; notes?: string }>> {
    try {
      const raw = await readFile(PROFILES_PATH, "utf-8");
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  async function saveProfiles(profiles: Record<string, { cwd: string; protectedPaths: string[]; notes?: string }>): Promise<void> {
    const dir = pathJoin(homedir(), ".lm-studio-toolbox");
    const { mkdir: fsMkdir } = await import("fs/promises");
    await fsMkdir(dir, { recursive: true });
    await fsWriteFile(PROFILES_PATH, JSON.stringify(profiles, null, 2), "utf-8");
  }

  tools.push(tool({
    name: "save_workspace_profile",
    description: "Save the current workspace as a named profile (CWD + protected paths + optional note). Switch between profiles with switch_workspace_profile.",
    parameters: {
      name: z.string().describe("Profile name (e.g. 'frontend', 'api', 'infra')."),
      notes: z.string().optional().describe("Optional description of this workspace context."),
    },
    implementation: async ({ name, notes }) => {
      const profiles = await loadProfiles();
      profiles[name] = {
        cwd: ctx.cwd,
        protectedPaths: ctx.protectedPaths,
        ...(notes ? { notes } : {}),
      };
      await saveProfiles(profiles);
      return { success: true, message: `Profile '${name}' saved (cwd: ${ctx.cwd}).` };
    },
  }));

  tools.push(tool({
    name: "switch_workspace_profile",
    description: "Switch to a saved workspace profile, updating the current directory and protected paths instantly.",
    parameters: {
      name: z.string().describe("Name of the profile to switch to."),
    },
    implementation: async ({ name }) => {
      const profiles = await loadProfiles();
      const profile = profiles[name];
      if (!profile) {
        const available = Object.keys(profiles);
        return { error: `Profile '${name}' not found. Available: ${available.length > 0 ? available.join(", ") : "(none)"}` };
      }
      ctx.cwd = profile.cwd;
      ctx.protectedPaths = parseProtectedPaths(profile.protectedPaths.join(","));
      ctx.fullState.currentWorkingDirectory = profile.cwd;
      await savePersistedState(ctx.fullState);
      return {
        success: true,
        cwd: ctx.cwd,
        protected_paths: ctx.protectedPaths,
        notes: profile.notes,
        message: `Switched to profile '${name}'. CWD is now: ${ctx.cwd}`,
      };
    },
  }));

  tools.push(tool({
    name: "list_workspace_profiles",
    description: "List all saved workspace profiles.",
    parameters: {},
    implementation: async () => {
      const profiles = await loadProfiles();
      const keys = Object.keys(profiles);
      if (keys.length === 0) return { profiles: [], message: "No workspace profiles saved yet. Use save_workspace_profile to create one." };
      return {
        profiles: keys.map(k => ({
          name: k,
          cwd: profiles[k].cwd,
          notes: profiles[k].notes,
          current: profiles[k].cwd === ctx.cwd,
        })),
      };
    },
  }));

  // ── N.6: analyze_project ─────────────────────────────────────────────────

  tools.push(tool({
    name: "analyze_project",
    description: "Get a comprehensive snapshot of the current workspace to orient yourself at the start of a session. Returns directory structure, package manifest summary, git status, recent commits, detected test/build commands, and file counts — in one call instead of six.",
    parameters: {
      depth: z.number().int().min(1).max(4).optional().default(2).describe("Directory tree depth (default: 2, max: 4)."),
    },
    implementation: async ({ depth = 2 }) => {
      const result: Record<string, unknown> = { cwd: ctx.cwd };

      // ── 1. Directory tree ─────────────────────────────────────────────────
      const SKIP_DIRS = new Set(["node_modules", ".git", "dist", "build", ".next", "__pycache__", ".cache", "coverage"]);
      async function buildTree(dir: string, currentDepth: number): Promise<Record<string, unknown>> {
        const tree: Record<string, unknown> = {};
        try {
          const { readdir: fsReaddir, stat: fsStat } = await import("fs/promises");
          const items = await fsReaddir(dir, { withFileTypes: true });
          for (const item of items) {
            if (item.name.startsWith(".") && item.name !== ".env.example") continue;
            if (SKIP_DIRS.has(item.name)) { tree[item.name] = "(skipped)"; continue; }
            if (item.isDirectory() && currentDepth < depth) {
              tree[item.name + "/"] = await buildTree(pathJoin(dir, item.name), currentDepth + 1);
            } else if (item.isDirectory()) {
              tree[item.name + "/"] = "…";
            } else {
              tree[item.name] = (await fsStat(pathJoin(dir, item.name))).size;
            }
          }
        } catch { /* unreadable */ }
        return tree;
      }
      result.directory_tree = await buildTree(ctx.cwd, 1);

      // ── 2. Package manifest ───────────────────────────────────────────────
      const manifestCandidates = ["package.json", "pyproject.toml", "Cargo.toml", "go.mod", "composer.json"];
      for (const manifest of manifestCandidates) {
        try {
          const raw = await readFile(pathJoin(ctx.cwd, manifest), "utf-8");
          if (manifest === "package.json") {
            const pkg = JSON.parse(raw);
            result.package = {
              name: pkg.name, version: pkg.version, description: pkg.description,
              scripts: pkg.scripts ?? {},
              dependencies: Object.keys(pkg.dependencies ?? {}).length,
              devDependencies: Object.keys(pkg.devDependencies ?? {}).length,
            };
          } else {
            result.manifest = { file: manifest, preview: raw.substring(0, 500) };
          }
          break;
        } catch { /* not found */ }
      }

      // ── 3. Git info ───────────────────────────────────────────────────────
      try {
        const { simpleGit } = await import("simple-git");
        const git = simpleGit(ctx.cwd);
        const [status, log, branch] = await Promise.all([
          git.status().catch(() => null),
          git.log({ maxCount: 5 }).catch(() => null),
          git.revparse(["--abbrev-ref", "HEAD"]).catch(() => null),
        ]);
        result.git = {
          branch: branch?.trim() ?? "unknown",
          modified: status?.modified.length ?? 0,
          staged: status?.staged.length ?? 0,
          untracked: status?.not_added.length ?? 0,
          recent_commits: log?.all.map(c => ({
            hash: c.hash.substring(0, 7),
            message: c.message.substring(0, 80),
            date: c.date,
          })) ?? [],
        };
      } catch { /* not a git repo */ }

      // ── 4. File counts by extension ───────────────────────────────────────
      try {
        const { readdir: fsReaddir2 } = await import("fs/promises");
        const extCounts: Record<string, number> = {};
        async function countExts(dir: string, d: number): Promise<void> {
          if (d > 3) return;
          const items = await fsReaddir2(dir, { withFileTypes: true });
          for (const item of items) {
            if (item.name.startsWith(".") || SKIP_DIRS.has(item.name)) continue;
            if (item.isDirectory()) await countExts(pathJoin(dir, item.name), d + 1);
            else {
              const ext = item.name.includes(".") ? "." + item.name.split(".").pop()! : "(no ext)";
              extCounts[ext] = (extCounts[ext] ?? 0) + 1;
            }
          }
        }
        await countExts(ctx.cwd, 0);
        result.file_counts = Object.fromEntries(
          Object.entries(extCounts).sort((a, b) => b[1] - a[1]).slice(0, 15)
        );
      } catch { /* ignore */ }

      // ── 5. Detected commands hint ─────────────────────────────────────────
      const scripts = (result.package as any)?.scripts ?? {};
      const hints: string[] = [];
      if (scripts.test) hints.push(`test: ${scripts.test}`);
      if (scripts.build) hints.push(`build: ${scripts.build}`);
      if (scripts.dev) hints.push(`dev: ${scripts.dev}`);
      if (scripts.lint) hints.push(`lint: ${scripts.lint}`);
      if (hints.length) result.detected_commands = hints;

      return result;
    },
  }));

  return tools;
}
