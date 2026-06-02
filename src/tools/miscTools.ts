import { tool, type Tool } from "@lmstudio/sdk";
import { z } from "zod";
import { spawn } from "child_process";
import { readFile } from "fs/promises";
import * as os from "os";
import type { ToolContext } from "./context";
import { validatePath } from "./helpers";
import { cosineSimilarity } from "./helpers";

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
    description: "Read content from PDF or DOCX files.",
    parameters: { file_path: z.string() },
    implementation: async ({ file_path }) => {
      const fpath = validatePath(ctx.cwd, file_path, ctx.protectedPaths);
      const ext = fpath.split(".").pop()?.toLowerCase();
      try {
        if (ext === "pdf") {
          // pdf-parse is a CJS module — use require() for consistency with other
          // native/CJS deps in this codebase (same reason as better-sqlite3).
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string; info: Record<string, unknown>; numpages: number }>;
          const dataBuffer = await readFile(fpath);
          const data = await pdfParse(dataBuffer);
          return { content: data.text, metadata: data.info, pages: data.numpages };
        } else if (ext === "docx") {
          // mammoth has proper ESM types — dynamic import works fine here.
          const mammoth = await import("mammoth");
          const result = await mammoth.extractRawText({ path: fpath });
          return { content: result.value, messages: result.messages };
        } else {
          return { error: "Unsupported document format. Use read_file for plain text files." };
        }
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
        try {
          const Database = (await import("better-sqlite3")).default;
          const db = new Database(fpath, { readonly: true });
          const stmt = db.prepare(query);
          const results = stmt.all();
          db.close();
          return { results };
        } catch (e) {
          return { error: `Database query failed: ${e instanceof Error ? e.message : String(e)}` };
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
      implementation: async ({ query, path = ".", file_pattern = "" }) => {
        try {
          if (!ctx.client) return { error: "LM Studio Client unavailable." };
          const { readdir, readFile } = await import("fs/promises");
          const { join } = await import("path");

          const targetDir = validatePath(ctx.cwd, path, ctx.protectedPaths);
          const entries = await readdir(targetDir, { recursive: true, withFileTypes: true });
          const textFiles = entries.filter(e => e.isFile() && !e.name.match(/\.(png|jpg|jpeg|gif|ico|exe|dll|bin)$/i));
          const filteredFiles = file_pattern
            ? textFiles.filter(e => e.name.includes(file_pattern) || join((e as any).parentPath ?? (e as any).path, e.name).includes(file_pattern))
            : textFiles;

          const filesToScan = filteredFiles.slice(0, 50);
          const allChunks: { chunk: string; score: number; file: string }[] = [];

          const embeddingModel = await ctx.client.embedding.model(ctx.embeddingModelName);
          const [queryEmbedding] = await embeddingModel.embed([query]);

          for (const file of filesToScan) {
            try {
              const fullPath = join((file as any).parentPath ?? (file as any).path, file.name);
              const content = await readFile(fullPath, "utf-8");
              const chunks = content.split(/\n\s*\n/).filter(c => c.trim().length > 20);
              if (chunks.length === 0) continue;

              const chunkEmbeddings = await embeddingModel.embed(chunks);
              chunks.forEach((chunk, i) => {
                const score = cosineSimilarity(queryEmbedding.embedding, chunkEmbeddings[i].embedding);
                if (score > 0.4) allChunks.push({ chunk, score, file: file.name });
              });
            } catch { /* ignore read errors */ }
          }

          allChunks.sort((a, b) => b.score - a.score);
          return { query, results: allChunks.slice(0, 10).map(c => ({ file: c.file, score: c.score.toFixed(3), content: c.chunk })) };
        } catch (error) {
          return { error: `Local RAG failed: ${error instanceof Error ? error.message : String(error)}` };
        }
      },
    }));
  }

  return tools;
}
