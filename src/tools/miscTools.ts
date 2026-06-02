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

  tools.push(tool({
    name: "read_clipboard",
    description: "Read text content from the system clipboard.",
    parameters: {},
    implementation: async () => {
      let command = "";
      let args: string[] = [];

      if (process.platform === "win32") { command = "powershell"; args = ["-command", "Get-Clipboard"]; }
      else if (process.platform === "darwin") { command = "pbpaste"; }
      else { command = "xclip"; args = ["-selection", "clipboard", "-o"]; }

      return Promise.race([
        new Promise(resolve => {
          const child = spawn(command, args);
          let output = "", error = "";
          child.stdout.on("data", d => output += d.toString());
          child.stderr.on("data", d => error += d.toString());
          child.on("close", code => { resolve(code === 0 ? { content: output.trim() } : { error: `Failed to read clipboard. Exit code: ${code}. Error: ${error}` }); });
          child.on("error", err => resolve({ error: `Failed to spawn clipboard command: ${err.message}` }));
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Clipboard operation timeout")), 5000)),
      ]).catch(err => ({ error: err.message }));
    },
  }));

  tools.push(tool({
    name: "write_clipboard",
    description: "Write text content to the system clipboard.",
    parameters: { content: z.string() },
    implementation: async ({ content }) => {
      let command = "";
      let args: string[] = [];
      let input = content;

      if (process.platform === "win32") {
        command = "powershell";
        const base64Content = Buffer.from(content, "utf8").toString("base64");
        args = ["-command", `$str = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String('${base64Content}')); Set-Clipboard -Value $str`];
        input = "";
      } else if (process.platform === "darwin") {
        command = "pbcopy";
      } else {
        command = "xclip"; args = ["-selection", "clipboard", "-i"];
      }

      return Promise.race([
        new Promise(resolve => {
          const child = spawn(command, args, { stdio: ["pipe", "ignore", "pipe"] });
          if (input && process.platform !== "win32") { child.stdin.write(input); child.stdin.end(); }
          else { child.stdin.end(); }
          let error = "";
          child.stderr.on("data", d => error += d.toString());
          child.on("close", code => resolve(code === 0 ? { success: true } : { error: `Failed to write to clipboard. Exit code: ${code}. Error: ${error}` }));
          child.on("error", err => resolve({ error: `Failed to spawn clipboard command: ${err.message}` }));
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Clipboard operation timeout")), 5000)),
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
        targetToOpen = validatePath(ctx.cwd, target);
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
      const filePath = validatePath(ctx.cwd, name);
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
      const fpath = validatePath(ctx.cwd, file_path);
      const ext = fpath.split(".").pop()?.toLowerCase();
      try {
        if (ext === "pdf") {
          if (typeof (global as any).DOMMatrix === "undefined") {
            (global as any).DOMMatrix = class DOMMatrix {
              constructor(arg?: any) {
                (this as any).a = 1; (this as any).b = 0; (this as any).c = 0;
                (this as any).d = 1; (this as any).e = 0; (this as any).f = 0;
                if (Array.isArray(arg)) { (this as any).a = arg[0]; (this as any).b = arg[1]; (this as any).c = arg[2]; (this as any).d = arg[3]; (this as any).e = arg[4]; (this as any).f = arg[5]; }
              }
            };
          }
          const { PDFParse } = require("pdf-parse");
          const dataBuffer = await readFile(fpath);
          const parser = new PDFParse({ data: dataBuffer });
          const textResult = await parser.getText();
          const infoResult = await parser.getInfo();
          await parser.destroy();
          return { content: textResult.text, metadata: infoResult.info };
        } else if (ext === "docx") {
          const mammoth = await import("mammoth");
          const result = await mammoth.extractRawText({ path: fpath });
          return { content: result.value, messages: result.messages };
        } else {
          return { error: "Unsupported document format. Use read_file for text files." };
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
        const fpath = validatePath(ctx.cwd, db_path);
        if (/^\s*(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|REPLACE)\b/i.test(query)) {
          return { error: "Only SELECT/read queries are allowed for safety." };
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

          const targetDir = validatePath(ctx.cwd, path);
          const entries = await readdir(targetDir, { recursive: true, withFileTypes: true });
          const textFiles = entries.filter(e => e.isFile() && !e.name.match(/\.(png|jpg|jpeg|gif|ico|exe|dll|bin)$/i));
          const filteredFiles = file_pattern
            ? textFiles.filter(e => e.name.includes(file_pattern) || join((e as any).parentPath ?? (e as any).path, e.name).includes(file_pattern))
            : textFiles;

          const filesToScan = filteredFiles.slice(0, 50);
          let allChunks: { chunk: string; score: number; file: string }[] = [];

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
