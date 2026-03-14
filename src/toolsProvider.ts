import { tool, type Tool, type ToolsProvider } from "@lmstudio/sdk";
import { rm, writeFile, readdir, readFile, stat, mkdir, rename, copyFile } from "fs/promises";
import * as os from "os";
import { join, dirname, extname } from "path";
import { z } from "zod";
import { existsSync, readFileSync, realpathSync } from "fs";
import { homedir } from "os";
import { pluginConfigSchematics } from "./config";
import { validatePath, runProcess } from "./utils";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function findDenoPath(): string {
  const resolvedHome = realpathSync(homedir());
  let lmHome: string;
  const pointer = join(resolvedHome, ".lmstudio-home-pointer");
  if (existsSync(pointer)) {
    lmHome = readFileSync(pointer, "utf-8").trim();
  } else {
    const cache = join(resolvedHome, ".cache", "lm-studio");
    lmHome = existsSync(cache) ? cache : join(resolvedHome, ".lmstudio");
  }
  return join(lmHome, ".internal", "utils", process.platform === "win32" ? "deno.exe" : "deno");
}

function stripHtml(raw: string): string {
  let t = raw;
  let prev: number;
  do {
    prev = t.length;
    t = t.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
    t = t.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
  } while (t.length < prev);
  t = t.replace(/<\/(?:div|p|li|tr|section|article)>/gi, "\n");
  t = t.replace(/<br\s*\/?>/gi, "\n");
  do {
    prev = t.length;
    t = t.replace(/<[^>]+>/g, "");
  } while (t.length < prev);
  t = t.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ").replace(/&#39;/g, "'").replace(/&amp;/g, "&");
  t = t.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  return t;
}

// ---------------------------------------------------------------------------
// Tools Provider
// ---------------------------------------------------------------------------

export const toolsProvider: ToolsProvider = async (ctl) => {
  const config = ctl.getPluginConfig(pluginConfigSchematics);
  const workDir = ctl.getWorkingDirectory();
  const tools: Tool[] = [];

  // =========================================================================
  // FILE SYSTEM TOOLS (always available)
  // =========================================================================

  tools.push(tool({
    name: "list_directory",
    description: "List files and folders in a directory. Returns names with trailing '/' for directories.",
    parameters: {
      path: z.string().optional().describe("Relative path within workspace. Defaults to root."),
    },
    implementation: async ({ path }) => {
      const target = path ? validatePath(workDir, path) : workDir;
      const entries = await readdir(target, { withFileTypes: true });
      const listing = entries.map((e) => e.isDirectory() ? e.name + "/" : e.name);
      return listing.join("\n") || "(empty directory)";
    },
  }));

  tools.push(tool({
    name: "read_file",
    description: "Read the text content of a file.",
    parameters: {
      path: z.string().describe("File path relative to workspace."),
    },
    implementation: async ({ path }) => {
      const fp = validatePath(workDir, path);
      const s = await stat(fp);
      if (s.size > 5_000_000) return "Error: File exceeds 5 MB limit.";
      const buf = await readFile(fp);
      if (buf.subarray(0, Math.min(buf.length, 512)).includes(0)) {
        return "Error: File appears to be binary.";
      }
      return buf.toString("utf-8");
    },
  }));

  tools.push(tool({
    name: "write_file",
    description: "Create or overwrite a file with the given content. Parent directories are created automatically.",
    parameters: {
      path: z.string().describe("File path relative to workspace."),
      content: z.string().describe("Full file content to write."),
    },
    implementation: async ({ path, content }) => {
      const fp = validatePath(workDir, path);
      await mkdir(dirname(fp), { recursive: true });
      await writeFile(fp, content, "utf-8");
      return `File written: ${path}`;
    },
  }));

  tools.push(tool({
    name: "edit_file",
    description: "Replace an exact text match in a file. The old_text must appear exactly once.",
    parameters: {
      path: z.string().describe("File path relative to workspace."),
      old_text: z.string().describe("Exact text to find (must be unique in the file)."),
      new_text: z.string().describe("Replacement text."),
    },
    implementation: async ({ path, old_text, new_text }) => {
      const fp = validatePath(workDir, path);
      const content = await readFile(fp, "utf-8");
      if (!content.includes(old_text)) return "Error: old_text not found in file.";
      const count = content.split(old_text).length - 1;
      if (count > 1) return `Error: old_text found ${count} times. Provide more context to make it unique.`;
      await writeFile(fp, content.replace(old_text, new_text), "utf-8");
      return "Edit applied successfully.";
    },
  }));

  tools.push(tool({
    name: "delete_file",
    description: "Delete a file or directory (recursive).",
    parameters: {
      path: z.string().describe("Path relative to workspace."),
    },
    implementation: async ({ path }) => {
      const fp = validatePath(workDir, path);
      await rm(fp, { recursive: true, force: true });
      return `Deleted: ${path}`;
    },
  }));

  tools.push(tool({
    name: "find_files",
    description: "Recursively find files whose name contains the given substring (case-insensitive).",
    parameters: {
      pattern: z.string().describe("Substring to match in file names."),
    },
    implementation: async ({ pattern }) => {
      const matches: string[] = [];
      const lp = pattern.toLowerCase();
      async function walk(dir: string, depth: number) {
        if (depth > 8 || matches.length >= 100) return;
        const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
        for (const e of entries) {
          if (e.name.startsWith(".")) continue;
          const full = join(dir, e.name);
          if (e.isDirectory()) {
            if (e.name === "node_modules") continue;
            await walk(full, depth + 1);
          } else if (e.name.toLowerCase().includes(lp)) {
            matches.push(full.slice(workDir.length + 1));
          }
        }
      }
      await walk(workDir, 0);
      if (matches.length === 0) return "No files found.";
      return matches.join("\n");
    },
  }));

  tools.push(tool({
    name: "search_in_files",
    description: "Search for a text pattern across files in the workspace (like grep). Returns matching lines.",
    parameters: {
      pattern: z.string().describe("Text or regex pattern to search for."),
      path: z.string().optional().describe("Subdirectory to limit search to."),
    },
    implementation: async ({ pattern, path }) => {
      const searchDir = path ? validatePath(workDir, path) : workDir;
      const results: string[] = [];
      let regex: RegExp;
      try {
        regex = new RegExp(pattern, "i");
      } catch {
        regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      }
      async function walk(dir: string, depth: number) {
        if (depth > 6 || results.length >= 50) return;
        const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
        for (const e of entries) {
          if (e.name.startsWith(".") || e.name === "node_modules") continue;
          const full = join(dir, e.name);
          if (e.isDirectory()) {
            await walk(full, depth + 1);
          } else {
            const ext = extname(e.name).toLowerCase();
            const textExts = [".ts", ".js", ".tsx", ".jsx", ".py", ".md", ".txt", ".json",
              ".html", ".css", ".yaml", ".yml", ".toml", ".cfg", ".ini", ".sh",
              ".c", ".cpp", ".h", ".hpp", ".java", ".rs", ".go", ".rb", ".sql", ".xml", ".csv"];
            if (!textExts.includes(ext) && ext !== "") continue;
            try {
              const s = await stat(full);
              if (s.size > 1_000_000) continue;
              const content = await readFile(full, "utf-8");
              const lines = content.split("\n");
              for (let i = 0; i < lines.length && results.length < 50; i++) {
                if (regex.test(lines[i])) {
                  const rel = full.slice(workDir.length + 1);
                  results.push(`${rel}:${i + 1}: ${lines[i].trim().substring(0, 200)}`);
                }
              }
            } catch { /* skip unreadable */ }
          }
        }
      }
      await walk(searchDir, 0);
      if (results.length === 0) return "No matches found.";
      return results.join("\n");
    },
  }));

  tools.push(tool({
    name: "move_file",
    description: "Move or rename a file or directory.",
    parameters: {
      source: z.string().describe("Current path relative to workspace."),
      destination: z.string().describe("New path relative to workspace."),
    },
    implementation: async ({ source, destination }) => {
      const src = validatePath(workDir, source);
      const dst = validatePath(workDir, destination);
      await mkdir(dirname(dst), { recursive: true });
      await rename(src, dst);
      return `Moved: ${source} -> ${destination}`;
    },
  }));

  tools.push(tool({
    name: "copy_file",
    description: "Copy a file to a new location.",
    parameters: {
      source: z.string().describe("Source path relative to workspace."),
      destination: z.string().describe("Destination path relative to workspace."),
    },
    implementation: async ({ source, destination }) => {
      const src = validatePath(workDir, source);
      const dst = validatePath(workDir, destination);
      await mkdir(dirname(dst), { recursive: true });
      await copyFile(src, dst);
      return `Copied: ${source} -> ${destination}`;
    },
  }));

  tools.push(tool({
    name: "file_info",
    description: "Get metadata for a file or directory (size, dates, type).",
    parameters: {
      path: z.string().describe("Path relative to workspace."),
    },
    implementation: async ({ path }) => {
      const fp = validatePath(workDir, path);
      const s = await stat(fp);
      return [
        `path: ${path}`,
        `type: ${s.isDirectory() ? "directory" : "file"}`,
        `size: ${s.size} bytes`,
        `modified: ${s.mtime.toISOString()}`,
        `created: ${s.birthtime.toISOString()}`,
      ].join("\n");
    },
  }));

  // =========================================================================
  // EXECUTION TOOLS (gated by config)
  // =========================================================================

  const allowCommand = config.get("allowCommandExecution");
  const allowJS = config.get("allowJavascriptExecution");
  const allowPython = config.get("allowPythonExecution");

  if (allowCommand) {
    tools.push(tool({
      name: "run_command",
      description: "Execute a shell command in the workspace directory and return its output.",
      parameters: {
        command: z.string().describe("The shell command to execute."),
        timeout_seconds: z.number().optional().describe("Timeout in seconds (default 30, max 120)."),
      },
      implementation: async ({ command, timeout_seconds }) => {
        const timeout = Math.min((timeout_seconds ?? 30), 120) * 1000;
        const result = await runProcess(command, [], {
          cwd: workDir,
          shell: true,
          timeout,
        });
        const parts: string[] = [];
        if (result.stdout) parts.push(result.stdout);
        if (result.stderr) parts.push(`[stderr]\n${result.stderr}`);
        parts.push(`[exit code: ${result.exitCode}]`);
        return parts.join("\n").substring(0, 20000);
      },
    }));
  }

  if (allowJS) {
    tools.push(tool({
      name: "run_javascript",
      description: "Execute JavaScript/TypeScript in a sandboxed Deno environment with workspace file access.",
      parameters: {
        code: z.string().describe("JavaScript or TypeScript code to execute."),
        timeout_seconds: z.number().optional().describe("Timeout in seconds (default 10, max 60)."),
      },
      implementation: async ({ code, timeout_seconds }) => {
        const scriptFile = join(workDir, `.tmp_script_${Date.now()}.ts`);
        try {
          await writeFile(scriptFile, code, "utf-8");
          const timeout = Math.min((timeout_seconds ?? 10), 60) * 1000;
          const result = await runProcess(findDenoPath(), [
            "run", "--allow-read=.", "--allow-write=.", "--no-prompt",
            "--deny-net", "--deny-env", "--deny-sys", "--deny-run", "--deny-ffi",
            scriptFile,
          ], { cwd: workDir, timeout, env: { NO_COLOR: "true" } });
          const parts: string[] = [];
          if (result.stdout) parts.push(result.stdout);
          if (result.stderr) parts.push(`[stderr]\n${result.stderr}`);
          parts.push(`[exit code: ${result.exitCode}]`);
          return parts.join("\n");
        } finally {
          await rm(scriptFile, { force: true }).catch(() => {});
        }
      },
    }));
  }

  if (allowPython) {
    tools.push(tool({
      name: "run_python",
      description: "Execute a Python script in the workspace directory.",
      parameters: {
        code: z.string().describe("Python code to execute."),
        timeout_seconds: z.number().optional().describe("Timeout in seconds (default 10, max 60)."),
      },
      implementation: async ({ code, timeout_seconds }) => {
        const scriptFile = join(workDir, `.tmp_script_${Date.now()}.py`);
        try {
          await writeFile(scriptFile, code, "utf-8");
          const timeout = Math.min((timeout_seconds ?? 10), 60) * 1000;
          const pyCmd = process.platform === "win32" ? "python" : "python3";
          const result = await runProcess(pyCmd, [scriptFile], { cwd: workDir, timeout });
          const parts: string[] = [];
          if (result.stdout) parts.push(result.stdout);
          if (result.stderr) parts.push(`[stderr]\n${result.stderr}`);
          parts.push(`[exit code: ${result.exitCode}]`);
          return parts.join("\n");
        } finally {
          await rm(scriptFile, { force: true }).catch(() => {});
        }
      },
    }));
  }

  // =========================================================================
  // WEB TOOLS (always available)
  // =========================================================================

  tools.push(tool({
    name: "web_search",
    description: "Search the web using DuckDuckGo and return titles, URLs, and snippets.",
    parameters: {
      query: z.string().describe("Search query."),
    },
    implementation: async ({ query }) => {
      try {
        const { search, SafeSearchType } = await import("duck-duck-scrape");
        const r = await search(query, { safeSearch: SafeSearchType.OFF });
        if (!r.results || r.results.length === 0) return "No results found.";
        return r.results.slice(0, 8).map((item: any, i: number) =>
          `${i + 1}. ${item.title}\n   ${item.url}\n   ${item.description}`
        ).join("\n\n");
      } catch (e) {
        return `Search failed: ${e instanceof Error ? e.message : String(e)}`;
      }
    },
  }));

  tools.push(tool({
    name: "fetch_url",
    description: "Fetch a webpage and return its text content (HTML tags stripped).",
    parameters: {
      url: z.string().describe("URL to fetch."),
    },
    implementation: async ({ url }) => {
      try {
        const response = await fetch(url, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; LMStudioTools/2.0)" },
          signal: AbortSignal.timeout(15000),
        });
        if (!response.ok) return `Error: HTTP ${response.status}`;
        const html = await response.text();
        const text = stripHtml(html);
        if (text.length > 30000) {
          return text.substring(0, 30000) + "\n\n... (truncated)";
        }
        return text || "No text content extracted.";
      } catch (e) {
        return `Fetch failed: ${e instanceof Error ? e.message : String(e)}`;
      }
    },
  }));

  // =========================================================================
  // SYSTEM TOOLS
  // =========================================================================

  tools.push(tool({
    name: "system_info",
    description: "Get basic system information (OS, CPU count, memory).",
    parameters: {},
    implementation: async () => {
      return [
        `os: ${os.platform()} ${os.arch()} ${os.release()}`,
        `cpus: ${os.cpus().length}`,
        `memory: ${(os.freemem() / 1e9).toFixed(1)} GB free / ${(os.totalmem() / 1e9).toFixed(1)} GB total`,
        `node: ${process.version}`,
        `workspace: ${workDir}`,
      ].join("\n");
    },
  }));

  return tools;
};
