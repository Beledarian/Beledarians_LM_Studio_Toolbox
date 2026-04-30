import { text, tool, type Tool, type ToolsProvider, type LMStudioClient } from "@lmstudio/sdk";
import { spawn } from "child_process";
import { rm, writeFile, readdir, readFile, stat, mkdir, rename, copyFile, appendFile } from "fs/promises";
import * as os from "os";
import { join, resolve, dirname, isAbsolute, relative } from "path";
import { z } from "zod";
import { pluginConfigSchematics } from "./config";
import { findLMStudioHome } from "./findLMStudioHome";
import { getPersistedState, savePersistedState, ensureWorkspaceExists } from "./stateManager";
import { executeBrowserActions } from "./browserActions";
import { rankFuzzyMatches } from "./fuzzySearch";
import { extractHandoffMessage } from "./handoffMessage";
import { parseSubAgentResponseMessage, type ParsedToolCall } from "./subAgentToolCallParser";
import type { Browser, Page } from "puppeteer";

// --- Security Helper ---
function validatePath(baseDir: string, requestedPath: string): string {
  const resolved = resolve(baseDir, requestedPath);
  // Normalize checking to prevent casing bypass on Windows
  const lowerResolved = resolved.toLowerCase();
  const lowerBase = resolve(baseDir).toLowerCase();

  if (!lowerResolved.startsWith(lowerBase)) {
    throw new Error(`Access Denied: Path '${requestedPath}' is outside the workspace.`);
  }
  return resolved;
}

function extractLikelyFilePath(text: string): string | null {
  const isPlausiblePath = (value: string): boolean => {
    const candidate = value.trim();
    if (!candidate) return false;
    if (/[,\r\n]/.test(candidate)) return false;
    if (candidate.includes("=") && !candidate.includes("\\") && !candidate.includes("/")) return false;
    if (/[<>|*?]/.test(candidate)) return false;

    const extensionMatch = candidate.match(/\.([A-Za-z0-9_-]{1,15})$/);
    if (!extensionMatch) return false;
    const extension = extensionMatch[1];
    if (!/[A-Za-z]/.test(extension)) return false; // reject ".0" and similar numeric pseudo-extensions

    return true;
  };

  const patterns = [
    /['"]([A-Za-z]:\\[^'"\r\n]+)['"]/,
    /\b([A-Za-z]:\\[^\s'"]+(?:\.[A-Za-z0-9_-]+)?)\b/,
    /['"]((?:\.{0,2}[\\/])?[^'"\r\n]+\.[A-Za-z0-9_-]+)['"]/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match?.[1]) continue;
    const candidate = match[1].replace(/[),.;]+$/, "").trim();
    if (!isPlausiblePath(candidate)) continue;
    return candidate;
  }
  return null;
}

const createSafeToolImplementation = <TParameters, TReturn>(
  originalImplementation: (params: TParameters) => Promise<TReturn>,
  isEnabled: boolean,
  toolName: string,
) => async (params: TParameters): Promise<TReturn> => {
  if (!isEnabled) {
    throw new Error(`Tool '${toolName}' is disabled in the plugin settings. Please ask the user to enable 'Allow ${toolName.replace(/_/g, " ")}' (or similar) in the settings.`);
  }
  return originalImplementation(params);
};

// Helper function for cosine similarity
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
  const magB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
  if (magA === 0 || magB === 0) {
    return 0;
  }
  return dotProduct / (magA * magB);
}

// Main RAG-on-text helper
async function performRagOnText(text: string, query: string, client: LMStudioClient, embeddingModelName: string) {
  // 1. Load embedding model
  const embeddingModel = await client.embedding.model(embeddingModelName);

  // 2. Chunk the text (simple paragraph-based chunking)
  const chunks = text.split(/\n\s*\n/).filter(chunk => chunk.trim().length > 20);
  if (chunks.length === 0) {
    return [{ chunk: text.substring(0, 4000), score: 1 }];
  }

  // 3. Embed query and chunks
  const [queryEmbedding] = await embeddingModel.embed([query]);
  const chunkEmbeddings = await embeddingModel.embed(chunks);

  // 4. Calculate similarity
  const similarities = chunkEmbeddings.map((chunkEmb, i) => ({
    chunk: chunks[i],
    score: cosineSimilarity(queryEmbedding.embedding, chunkEmb.embedding),
  }));

  // 5. Sort by score and return top results
  similarities.sort((a, b) => b.score - a.score);
  return similarities.slice(0, 5); // Return top 5
}


function getDenoPath() {
  const lmstudioHome = findLMStudioHome();
  const utilPath = join(lmstudioHome, ".internal", "utils");
  const denoPath = join(utilPath, process.platform === "win32" ? "deno.exe" : "deno");
  return denoPath;
}

let isWorkspaceInitialized = false;

export const toolsProvider: ToolsProvider = async (ctl) => {
  const client = (ctl as any).client as LMStudioClient;
  const pluginConfig = ctl.getPluginConfig(pluginConfigSchematics);
  const defaultWorkspacePath = pluginConfig.get("defaultWorkspacePath");

  // Load state using shared manager
  const fullState = await getPersistedState(defaultWorkspacePath);
  let currentWorkingDirectory = fullState.currentWorkingDirectory;

  const allowAllCode = pluginConfig.get("allowAllCode");
  let allowJavascript = pluginConfig.get("allowJavascriptExecution");
  let allowPython = pluginConfig.get("allowPythonExecution");
  let allowTerminal = pluginConfig.get("allowTerminalExecution");
  let allowShell = pluginConfig.get("allowShellCommandExecution");
  let allowBrowserControl = pluginConfig.get("allowBrowserControl");
  const enableMemory = pluginConfig.get("enableMemory");
  const enableWikipedia = pluginConfig.get("enableWikipediaTool");
  const enableLocalRag = pluginConfig.get("enableLocalRag");
  const enableSecondary = pluginConfig.get("enableSecondaryAgent");
  const embeddingModelName = pluginConfig.get("embeddingModel");
  // const searchApiKey = pluginConfig.get("searchApiKey"); // Used inside tool

  // Master override
  if (allowAllCode) {
    allowJavascript = true;
    allowPython = true;
    allowTerminal = true;
    allowShell = true;
    allowBrowserControl = true;
  }

  // Ensure the directory exists (idempotent)
  if (!isWorkspaceInitialized) {
    await ensureWorkspaceExists(currentWorkingDirectory);
    fullState.currentWorkingDirectory = currentWorkingDirectory;
    await savePersistedState(fullState);
    console.log(`Working directory set to: ${currentWorkingDirectory}`);
    isWorkspaceInitialized = true;
  }

  const tools: Tool[] = [];
  let browserSession: { browser: Browser; page: Page; currentUrl: string } | null = null;

  const allowGit = pluginConfig.get("allowGitOperations");
  const allowDb = pluginConfig.get("allowDatabaseInspection");
  const allowNotify = pluginConfig.get("allowSystemNotifications");
  const allowGitHubTools = pluginConfig.get("allowGitHubTools");

  // --- Git Tools ---
  if (allowGit) {
    const gitStatusTool = tool({
      name: "git_status",
      description: "Get the current git status of the repository.",
      parameters: {},
      implementation: async () => {
        const { simpleGit } = await import("simple-git");
        const git = simpleGit(currentWorkingDirectory);
        try {
          const status = await git.status();
          return status;
        } catch (e) {
          return { error: `Git status failed: ${e instanceof Error ? e.message : String(e)}` };
        }
      }
    });
    tools.push(gitStatusTool);

    const gitDiffTool = tool({
      name: "git_diff",
      description: "Get the git diff of the current repository or specific files.",
      parameters: {
        file_path: z.string().optional().describe("Optional: Path to specific file to diff."),
        cached: z.boolean().optional().describe("Optional: Show staged changes only (git diff --cached).")
      },
      implementation: async ({ file_path, cached }) => {
        const { simpleGit } = await import("simple-git");
        const git = simpleGit(currentWorkingDirectory);
        try {
          const args = [];
          if (cached) args.push("--cached");
          if (file_path) args.push(validatePath(currentWorkingDirectory, file_path));

          const diff = await git.diff(args);
          return { diff: diff || "No changes." };
        } catch (e) {
          return { error: `Git diff failed: ${e instanceof Error ? e.message : String(e)}` };
        }
      }
    });
    tools.push(gitDiffTool);

    const gitCommitTool = tool({
      name: "git_commit",
      description: "Commit staged changes to the git repository.",
      parameters: {
        message: z.string(),
      },
      implementation: async ({ message }) => {
        const { simpleGit } = await import("simple-git");
        const git = simpleGit(currentWorkingDirectory);
        try {
          // Ensure something is staged? Assuming user has used 'execute_command("git add ...")' or we should auto-stage?
          // Standard git behavior is to commit only staged.
          const result = await git.commit(message);
          return { success: true, summary: result.summary };
        } catch (e) {
          return { error: `Git commit failed: ${e instanceof Error ? e.message : String(e)}` };
        }
      }
    });
    tools.push(gitCommitTool);

    const gitLogTool = tool({
      name: "git_log",
      description: "Get recent git commit history.",
      parameters: {
        max_count: z.number().optional().describe("Max number of commits to return (default: 10)")
      },
      implementation: async ({ max_count = 10 }) => {
        const { simpleGit } = await import("simple-git");
        const git = simpleGit(currentWorkingDirectory);
        try {
          const log = await git.log({ maxCount: max_count });
          return { history: log.all };
        } catch (e) {
          return { error: `Git log failed: ${e instanceof Error ? e.message : String(e)}` };
        }
      }
    });
    tools.push(gitLogTool);

    const gitAddTool = tool({
      name: "git_add",
      description: "Stage specific files or all changes for the next commit.",
      parameters: {
        paths: z.array(z.string()).optional().describe("Optional: Specific file paths to stage. If omitted, stages all changes."),
      },
      implementation: async ({ paths }) => {
        const { simpleGit } = await import("simple-git");
        const git = simpleGit(currentWorkingDirectory);
        try {
          if (paths && paths.length > 0) {
            const validatedPaths = paths.map(p => validatePath(currentWorkingDirectory, p));
            await git.add(validatedPaths);
          } else {
            await git.add(".");
          }
          return { success: true, message: "Files staged successfully." };
        } catch (e) {
          return { error: `Git add failed: ${e instanceof Error ? e.message : String(e)}` };
        }
      },
    });
    tools.push(gitAddTool);

    const gitCheckoutTool = tool({
      name: "git_checkout",
      description: "Switch to an existing branch or create and switch to a new one.",
      parameters: {
        branch_name: z.string().describe("Name of the branch to checkout."),
        create_new: z.boolean().optional().default(false).describe("If true, creates the branch if it doesn't exist (like git checkout -b)."),
      },
      implementation: async ({ branch_name, create_new = false }) => {
        const { simpleGit } = await import("simple-git");
        const git = simpleGit(currentWorkingDirectory);
        try {
          if (create_new) {
            await git.checkout(["-b", branch_name]);
          } else {
            await git.checkout(branch_name);
          }
          return { success: true, message: `Switched to branch '${branch_name}'.` };
        } catch (e) {
          return { error: `Git checkout failed: ${e instanceof Error ? e.message : String(e)}` };
        }
      },
    });
    tools.push(gitCheckoutTool);

  }

  // --- Document Tools ---
  const readDocumentTool = tool({
    name: "read_document",
    description: "Read content from PDF or DOCX files.",
    parameters: {
      file_path: z.string(),
    },
    implementation: async ({ file_path }) => {
      const fpath = validatePath(currentWorkingDirectory, file_path);
      const ext = fpath.split('.').pop()?.toLowerCase();

      try {
        if (ext === 'pdf') {
          // Polyfill DOMMatrix for pdf-parse v2 (required for node environment)
          if (typeof global.DOMMatrix === 'undefined') {
            (global as any).DOMMatrix = class DOMMatrix {
              constructor(arg?: any) {
                (this as any).a = 1; (this as any).b = 0; (this as any).c = 0; (this as any).d = 1; (this as any).e = 0; (this as any).f = 0;
                if (Array.isArray(arg)) {
                  (this as any).a = arg[0]; (this as any).b = arg[1];
                  (this as any).c = arg[2]; (this as any).d = arg[3];
                  (this as any).e = arg[4]; (this as any).f = arg[5];
                }
              }
            };
          }

          // Dynamically require pdf-parse v2 class
          const { PDFParse } = require("pdf-parse");

          const dataBuffer = await readFile(fpath);
          // Use new class-based API
          const parser = new PDFParse({ data: dataBuffer });
          const textResult = await parser.getText();
          const infoResult = await parser.getInfo(); // Optional: get metadata

          await parser.destroy(); // Cleanup

          return { content: textResult.text, metadata: infoResult.info };
        } else if (ext === 'docx') {
          const mammoth = await import("mammoth");
          const result = await mammoth.extractRawText({ path: fpath });
          return { content: result.value, messages: result.messages };
        } else {
          return { error: "Unsupported document format. Use read_file for text files." };
        }
      } catch (e) {
        return { error: `Failed to read document: ${e instanceof Error ? e.message : String(e)}` };
      }
    }
  });
  tools.push(readDocumentTool);

  // --- Notification Tool ---
  if (allowNotify) {
    const sendNotificationTool = tool({
      name: "send_notification",
      description: "Send a system notification to the user.",
      parameters: {
        title: z.string(),
        message: z.string(),
      },
      implementation: async ({ title, message }) => {
        const notifier = await import("node-notifier");
        // node-notifier is a CommonJS module, so dynamic import returns it on .default
        notifier.default.notify({
          title: title,
          message: message,
          sound: true,
          wait: false
        });
        return { success: true, message: "Notification sent." };
      }
    });
    tools.push(sendNotificationTool);
  }

  // --- Database Tool ---
  if (allowDb) {
    const queryDatabaseTool = tool({
      name: "query_database",
      description: "Execute a read-only query on a SQLite database file.",
      parameters: {
        db_path: z.string(),
        query: z.string(),
      },
      implementation: async ({ db_path, query }) => {
        const fpath = validatePath(currentWorkingDirectory, db_path);

        // Safety: Attempt to block write operations (naive check)
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
      }
    });
    tools.push(queryDatabaseTool);
  }

  // --- Code Analysis Tool ---
  const analyzeProjectTool = tool({
    name: "analyze_project",
    description: "Run project-wide analysis (linting) to find errors and warnings.",
    parameters: {},
    implementation: async () => {
      // Try to detect available linters
      const packageJsonPath = join(currentWorkingDirectory, "package.json");
      let command = "";
      let type = "unknown";

      try {
        const pkg = JSON.parse(await readFile(packageJsonPath, "utf-8"));
        if (pkg.scripts && pkg.scripts.lint) {
          command = "npm run lint";
          type = "npm-script";
        } else if (pkg.devDependencies?.eslint || pkg.dependencies?.eslint) {
          command = "npx eslint . --format json"; // JSON for easier parsing? Or just text.
          type = "eslint";
        }
      } catch (e) {
        // check for python?
        const entries = await readdir(currentWorkingDirectory);
        if (entries.some(f => f.endsWith(".py"))) {
          command = "pylint ."; // Assuming pylint is in path
          type = "python-lint";
        }
      }

      if (!command) {
        return { error: "Could not detect a supported linter (ESLint script or Python)." };
      }

      try {
        const child = spawn(command, {
          shell: true,
          cwd: currentWorkingDirectory,
          timeout: 60000
        });

        let stdout = "";
        let stderr = "";
        child.stdout.on("data", d => stdout += d);
        child.stderr.on("data", d => stderr += d);

        await new Promise((resolve) => child.on("close", resolve));

        return {
          tool: command,
          type,
          report: (stdout + stderr).substring(0, 10000) // Limit size
        };
      } catch (e) {
        return { error: `Analysis failed: ${e instanceof Error ? e.message : String(e)}` };
      }
    }
  });
  tools.push(analyzeProjectTool);

  const changeDirectoryTool = tool({
    name: "change_directory",
    description: text`
      Change the current working directory.
      Returns the new current working directory.
    `,
    parameters: {
      directory: z.string(),
    },
    implementation: async ({ directory }) => {
      const newPath = resolve(currentWorkingDirectory, directory);
      const stats = await stat(newPath);
      if (!stats.isDirectory()) {
        throw new Error(`Path is not a directory: ${newPath}`);
      }
      currentWorkingDirectory = newPath;
      // Persist the new state
      fullState.currentWorkingDirectory = currentWorkingDirectory;
      await savePersistedState(fullState);

      return {
        previous_directory: resolve(newPath, ".."),
        current_directory: currentWorkingDirectory,
      };
    },
  });
  tools.push(changeDirectoryTool);

  const saveMemoryTool = tool({
    name: "save_memory",
    description: text`
      Save a specific piece of information or fact to long-term memory.
      This information will be available in future interactions if memory is enabled.
      Use this for user preferences, important facts, or context that should persist.
    `,
    parameters: {
      fact: z.string().describe("The specific fact or piece of information to remember."),
    },
    implementation: async ({ fact }) => {
      if (!enableMemory) {
        return { error: "Memory is currently disabled in the plugin settings. Please ask the user to enable it." };
      }

      const memoryFile = join(currentWorkingDirectory, "memory.md");
      const timestamp = new Date().toISOString();
      const entry = `\n- [${timestamp}] ${fact}`;

      try {
        await appendFile(memoryFile, entry, "utf-8");
        return { success: true, message: "Fact saved to memory." };
      } catch (error) {
        // If append fails (e.g. file doesn't exist), try writing
        try {
          await writeFile(memoryFile, "# Long-Term Memory\n" + entry, "utf-8");
          return { success: true, message: "Fact saved to memory (new file created)." };
        } catch (writeError) {
          return { error: `Failed to save memory: ${writeError instanceof Error ? writeError.message : String(writeError)}` };
        }
      }
    },
  });
  tools.push(saveMemoryTool);

  const originalRunJavascriptImplementation = async ({ javascript, timeout_seconds }: { javascript: string; timeout_seconds?: number }) => {
    const scriptFileName = `temp_script_${Date.now()}.ts`;
    const scriptFilePath = join(currentWorkingDirectory, scriptFileName);

    try {

      await writeFile(scriptFilePath, javascript, "utf-8");

      const childProcess = spawn(
        getDenoPath(),
        [
          "run",
          "--allow-read=.",
          "--allow-write=.",
          "--no-prompt",
          "--deny-net",
          "--deny-env",
          "--deny-sys",
          "--deny-run",
          "--deny-ffi",
          scriptFilePath,
        ],
        {
          cwd: currentWorkingDirectory,
          timeout: (timeout_seconds ?? 5) * 1000, // Convert seconds to milliseconds
          stdio: "pipe",
          env: {
            NO_COLOR: "true", // Disable color output in Deno
          },
        },
      );

      let stdout = "";
      let stderr = "";

      childProcess.stdout.setEncoding("utf-8");
      childProcess.stderr.setEncoding("utf-8");

      childProcess.stdout.on("data", data => {
        stdout += data;
      });
      childProcess.stderr.on("data", data => {
        stderr += data;
      });

      await new Promise<void>((resolve, reject) => {
        childProcess.on("close", code => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`Process exited with code ${code}. Stderr: ${stderr}`));
          }
        });

        childProcess.on("error", err => {
          reject(err);
        });
      });
      return {
        stdout: stdout.trim(),
        stderr: stderr.trim(),
      };
    } finally {
      // Always cleanup temp file, even on error
      await rm(scriptFilePath, { force: true }).catch(() => { });
    }
  };

  const createFileTool = tool({
    name: "run_javascript",
    description: text`
      Run a JavaScript code snippet using deno. You cannot import external modules but you have 
      read/write access to the current working directory.

      Pass the code you wish to run as a string in the 'javascript' parameter.

      By default, the code will timeout in 5 seconds. You can extend this timeout by setting the
      'timeout_seconds' parameter to a higher value in seconds, up to a maximum of 60 seconds.

      You will get the stdout and stderr output of the code execution, thus please print the output
      you wish to return using 'console.log' or 'console.error'.
    `,
    parameters: { javascript: z.string(), timeout_seconds: z.number().min(0.1).max(60).optional() },
    implementation: createSafeToolImplementation(
      originalRunJavascriptImplementation,
      allowJavascript,
      "run_javascript"
    ),
  });
  tools.push(createFileTool);

  const originalRunPythonImplementation = async ({ python, timeout_seconds }: { python: string; timeout_seconds?: number }) => {
    const scriptFileName = `temp_script_${Date.now()}.py`;
    const scriptFilePath = join(currentWorkingDirectory, scriptFileName);

    try {

      await writeFile(scriptFilePath, python, "utf-8");

      const childProcess = spawn(
        "python",
        [
          scriptFilePath,
        ],
        {
          cwd: currentWorkingDirectory,
          timeout: (timeout_seconds ?? 5) * 1000, // Convert seconds to milliseconds
          stdio: "pipe",
        },
      );

      let stdout = "";
      let stderr = "";

      childProcess.stdout.setEncoding("utf-8");
      childProcess.stderr.setEncoding("utf-8");

      childProcess.stdout.on("data", data => {
        stdout += data;
      });
      childProcess.stderr.on("data", data => {
        stderr += data;
      });

      await new Promise<void>((resolve, reject) => {
        childProcess.on("close", code => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`Process exited with code ${code}. Stderr: ${stderr}`));
          }
        });

        childProcess.on("error", err => {
          reject(err);
        });
      });
      return {
        stdout: stdout.trim(),
        stderr: stderr.trim(),
      };
    } finally {
      // Always cleanup temp file, even on error
      await rm(scriptFilePath, { force: true }).catch(() => { });
    }
  };

  const runPythonTool = tool({
    name: "run_python",
    description: text`
      Run a Python code snippet. You cannot import external modules but you have
      read/write access to the current working directory.

      Pass the code you wish to run as a string in the 'python' parameter.

      By default, the code will timeout in 5 seconds. You can extend this timeout by setting the
      'timeout_seconds' parameter to a higher value in seconds, up to a maximum of 60 seconds.

      You will get the stdout and stderr output of the code execution, thus please print the output
      you wish to return using 'print()'.
    `,
    parameters: { python: z.string(), timeout_seconds: z.number().min(0.1).max(60).optional() },
    implementation: createSafeToolImplementation(
      originalRunPythonImplementation,
      allowPython,
      "run_python"
    ),
  });
  tools.push(runPythonTool);

  const saveFileTool = tool({
    name: "save_file",
    description: text`
      Save content to a specified file in the current working directory.
      This tool returns the full path to the saved file. You should then
      output this full path to the user.
    `,
    parameters: {
      file_name: z.string(),
      content: z.string(),
    },
    implementation: async ({ file_name, content }) => {

      // Validate filename
      if (!file_name || file_name.trim().length === 0) {
        return { error: "Filename cannot be empty" };
      }

      if (/[ \*\?<>|"]/.test(file_name)) {
        return { error: "Filename contains invalid characters" };
      }

      const filePath = validatePath(currentWorkingDirectory, file_name);
      await mkdir(dirname(filePath), { recursive: true });
      await writeFile(filePath, content, "utf-8");
      return {
        success: true,
        path: filePath,
      };
    },
  });
  tools.push(saveFileTool);

  const replaceTextTool = tool({
    name: "replace_text_in_file",
    description: text`
      Replace a specific string in a file with a new string. 
      Useful for making small edits without rewriting the entire file.
      Ensure 'old_string' matches exactly (including whitespace) or the replace will fail.
    `,
    parameters: {
      file_name: z.string(),
      old_string: z.string().describe("The exact text to replace. Must be unique in the file."),
      new_string: z.string().describe("The text to insert in place of old_string."),
    },
    implementation: async ({ file_name, old_string, new_string }) => {
      try {

        if (!old_string || old_string.length === 0) {
          return { error: "old_string cannot be empty" };
        }

        const filePath = validatePath(currentWorkingDirectory, file_name);
        const content = await readFile(filePath, "utf-8");

        if (!content.includes(old_string)) {
          return { error: "Could not find the exact 'old_string' in the file. Please check whitespace and indentation." };
        }

        const occurrenceCount = content.split(old_string).length - 1;
        if (occurrenceCount > 1) {
          return { error: `Found ${occurrenceCount} occurrences of 'old_string'. Please provide more context (surrounding lines) in 'old_string' to make it unique.` };
        }

        const newContent = content.replace(old_string, new_string);
        await writeFile(filePath, newContent, "utf-8");

        return { success: true, message: `Successfully replaced text in ${file_name}` };
      } catch (e) {
        return { error: `Failed to replace text: ${e instanceof Error ? e.message : String(e)}` };
      }
    },
  });
  tools.push(replaceTextTool);

  const listDirectoryTool = tool({
    name: "list_directory",
    description: "List the files and directories in the current working directory or a specified subdirectory.",
    parameters: {
      path: z.string().optional().describe("The path to the directory to list. Defaults to current working directory."),
    },
    implementation: async ({ path }) => {
      const targetPath = path ? validatePath(currentWorkingDirectory, path) : currentWorkingDirectory;
      const files = await readdir(targetPath);
      return {
        files,
      };
    },
  });
  tools.push(listDirectoryTool);

  const readFileTool = tool({
    name: "read_file",
    description: "Read the content of a file in the current working directory.",
    parameters: {
      file_name: z.string(),
    },
    implementation: async ({ file_name }) => {
      const filePath = validatePath(currentWorkingDirectory, file_name);

      const stats = await stat(filePath);
      if (stats.size > 10_000_000) {
        return { error: "File too large (>10MB)" };
      }

      // Check for binary content (simple null byte check in first 1KB)
      // Read as buffer first
      const buffer = await readFile(filePath);
      // Check first 1024 bytes for null byte
      const checkBuffer = buffer.subarray(0, Math.min(buffer.length, 1024));
      if (checkBuffer.includes(0)) {
        return { error: "File appears to be binary and cannot be read as text." };
      }

      const content = buffer.toString("utf-8");
      return {
        content,
      };
    },
  });
  tools.push(readFileTool);

  const originalExecuteCommandImplementation = async ({ command, input, timeout_seconds }: { command: string; input?: string; timeout_seconds?: number }) => {
    const childProcess = spawn(command, [], {
      cwd: currentWorkingDirectory,
      shell: true,
      timeout: (timeout_seconds ?? 5) * 1000,
      stdio: "pipe",
    });

    if (input) {
      childProcess.stdin.write(input);
      childProcess.stdin.end();
    } else {
      // If no input is provided, we might want to leave stdin open or close it.
      // Closing it is safer for non-interactive commands to prevent hanging.
      childProcess.stdin.end();
    }

    let stdout = "";
    let stderr = "";

    childProcess.stdout.setEncoding("utf-8");
    childProcess.stderr.setEncoding("utf-8");

    childProcess.stdout.on("data", data => {
      stdout += data;
    });
    childProcess.stderr.on("data", data => {
      stderr += data;
    });

    await new Promise<void>((resolve, reject) => {
      childProcess.on("close", code => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Process exited with code ${code}. Stderr: ${stderr}`));
        }
      });

      childProcess.on("error", err => {
        reject(err);
      });
    });

    return {
      stdout: stdout.trim(),
      stderr: stderr.trim(),
    };
  };

  const executeCommandTool = tool({
    name: "execute_command",
    description: text`
      Execute a shell command in the current working directory.
      Returns the stdout and stderr output of the command.
      You can optionally provide input to be piped to the command's stdin.

      IMPORTANT: The host operating system is '${process.platform}'. 
      If the OS is 'win32' (Windows), do NOT use 'bash' or 'sh' commands unless you are certain WSL is available.
      Instead, use standard Windows 'cmd' or 'powershell' syntax.
    `,
    parameters: {
      command: z.string(),
      input: z.string().optional().describe("Input text to pipe to the command's stdin."),
      timeout_seconds: z.number().min(0.1).max(60).optional().describe("Timeout in seconds (default: 5, max: 60)"),
    },
    implementation: createSafeToolImplementation(
      originalExecuteCommandImplementation,
      allowShell,
      "execute_command"
    ),
  });
  tools.push(executeCommandTool);

  const makeDirectoryTool = tool({
    name: "make_directory",
    description: "Create a new directory in the current working directory.",
    parameters: {
      directory_name: z.string(),
    },
    implementation: async ({ directory_name }) => {
      const dirPath = validatePath(currentWorkingDirectory, directory_name);
      await mkdir(dirPath, { recursive: true });
      return {
        success: true,
        path: dirPath,
      };
    },
  });
  tools.push(makeDirectoryTool);

  const deletePathTool = tool({
    name: "delete_path",
    description: "Delete a file or directory in the current working directory. Be careful!",
    parameters: {
      path: z.string(),
    },
    implementation: async ({ path }) => {
      const targetPath = validatePath(currentWorkingDirectory, path);
      await rm(targetPath, { recursive: true, force: true });
      return {
        success: true,
        path: targetPath,
      };
    },
  });
  tools.push(deletePathTool);

  const deleteFilesByPatternTool = tool({
    name: "delete_files_by_pattern",
    description: "Delete multiple files in the current directory that match a regex pattern.",
    parameters: {
      pattern: z.string().describe("Regex pattern to match filenames (e.g., '^auto_gen_.*\\.txt$')"),
    },
    implementation: async ({ pattern }) => {
      try {

        // Validate regex complexity to prevent ReDoS
        if (pattern.length > 100) {
          return { error: "Pattern too complex (max 100 characters)" };
        }

        const regex = new RegExp(pattern);

        // Safety check for ReDoS
        const start = Date.now();
        regex.test("safe_test_string_for_redos_check_1234567890_safe_test_string_for_redos_check_1234567890");
        if (Date.now() - start > 100) {
          return { error: "Pattern is too complex or slow (ReDoS protection)." };
        }

        const files = await readdir(currentWorkingDirectory);
        const deleted = [];

        for (const file of files) {
          if (regex.test(file)) {
            await rm(join(currentWorkingDirectory, file), { force: true });
            deleted.push(file);
          }
        }
        return { deleted_count: deleted.length, deleted_files: deleted };
      } catch (e) {
        return { error: `Failed to delete files: ${e instanceof Error ? e.message : String(e)}` };
      }
    },
  });
  tools.push(deleteFilesByPatternTool);

  const originalRunInTerminalImplementation = async ({ command }: { command: string }) => {
    if (process.platform === "win32") {

      // Escape quotes to prevent command injection
      const escapedDir = currentWorkingDirectory.replace(/"/g, '""');
      const escapedCmd = command.replace(/"/g, '""');

      // Windows: Use 'start' with a title to avoid ambiguity and /D for the directory.
      const shellCommand = `start "" /D "${escapedDir}" cmd.exe /k "${escapedCmd}"`;

      const child = spawn("cmd.exe", ["/c", shellCommand], {
        detached: true,
        stdio: "ignore",
        windowsHide: false,
        windowsVerbatimArguments: true,
      });
      child.unref();
    } else {
      // Linux/Mac
      if (process.platform === "darwin") {
        // macOS: Use AppleScript to launch Terminal and run command
        // Escaping for AppleScript is tricky, simple approach:
        const safeCmd = command.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
        const safeCwd = currentWorkingDirectory.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

        const appleScript = `
          tell application "Terminal"
            do script "cd \\"${safeCwd}\\" && ${safeCmd}"
            activate
          end tell
        `;
        const child = spawn("osascript", ["-e", appleScript], { detached: true, stdio: "ignore" });
        child.unref();
      } else {
        // Linux: x-terminal-emulator
        // Wrap command in single quotes for bash -c
        const safeCwd = currentWorkingDirectory.replace(/'/g, "'\\''");
        const safeCmd = command.replace(/'/g, "'\\''");

        const bashScript = `cd '${safeCwd}' && ${safeCmd}; bash`;

        // spawn directly, don't use sh -c
        const child = spawn("x-terminal-emulator", ["-e", "bash", "-c", bashScript], {
          detached: true,
          stdio: "ignore",
        });

        child.on("error", (e) => {
          // Fallback to gnome-terminal if x-terminal-emulator fails
          const child2 = spawn("gnome-terminal", ["--", "bash", "-c", bashScript], {
            detached: true, stdio: "ignore"
          });
          child2.unref();
        });
        child.unref();
      }
    }

    return {
      success: true,
      message: "Terminal window launched. Please check your taskbar.",
    };
  };

  const runInTerminalTool = tool({
    name: "run_in_terminal",
    description: text`
      Launch a command in a new, separate interactive terminal window. 
      Use this for scripts that require user interaction (input/output) or to open a shell in a specific directory.
      (Currently optimized for Windows).
    `,
    parameters: {
      command: z.string(),
    },
    implementation: createSafeToolImplementation(
      originalRunInTerminalImplementation,
      allowTerminal,
      "run_in_terminal"
    ),
  });
  tools.push(runInTerminalTool);

  const webSearchTool = tool({
    name: "web_search",
    description: "Search the web using multiple providers (DuckDuckGo, Google, Bing). Uses no-key providers first, then browser providers as fallback.",
    parameters: {
      query: z.string(),
      providers: z.array(z.enum(["duckduckgo-api", "duckduckgo-fetch", "duckduckgo-html", "google", "bing"]))
        .optional()
        .describe("Optional: List of specific providers. If omitted, fallback chain is: DDG API -> DDG HTML fetch -> DDG browser -> Google -> Bing."),
    },
    implementation: async ({ query, providers }) => {
      type SearchProvider = "duckduckgo-api" | "duckduckgo-fetch" | "duckduckgo-html" | "google" | "bing";
      type SearchResult = { title: string; link: string; snippet: string; provider: SearchProvider };

      const results: SearchResult[] = [];
      const errors: string[] = [];
      const logs: string[] = [];

      const decodeHtmlEntities = (value: string) =>
        value
          .replace(/&quot;/g, "\"")
          .replace(/&#39;/g, "'")
          .replace(/&apos;/g, "'")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&nbsp;/g, " ")
          .replace(/&amp;/g, "&");

      const stripHtml = (value: string) =>
        decodeHtmlEntities(value)
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim();

      const normalizeDuckDuckGoLink = (link: string): string => {
        const decoded = decodeHtmlEntities(link);
        const absolute = decoded.startsWith("//")
          ? `https:${decoded}`
          : decoded.startsWith("/")
            ? `https://duckduckgo.com${decoded}`
            : decoded;

        try {
          const parsed = new URL(absolute);
          const redirect = parsed.searchParams.get("uddg");
          if (redirect) {
            return decodeURIComponent(redirect);
          }
        } catch {
          // Return original normalized URL below.
        }

        return absolute;
      };

      const parseDuckDuckGoHtml = (html: string, provider: "duckduckgo-fetch" | "duckduckgo-html"): SearchResult[] => {
        const parsedResults: SearchResult[] = [];
        const titleRegex = /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
        let match: RegExpExecArray | null;

        while ((match = titleRegex.exec(html)) !== null) {
          const link = normalizeDuckDuckGoLink(match[1]);
          const title = stripHtml(match[2]);
          const nearbyHtml = html.slice(match.index, Math.min(html.length, match.index + 1800));
          const snippetMatch = nearbyHtml.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/(?:a|div)>/i);
          const snippet = snippetMatch ? stripHtml(snippetMatch[1]) : "";

          if (title && link) {
            parsedResults.push({ title, link, snippet, provider });
          }
          if (parsedResults.length >= 10) break;
        }

        return parsedResults;
      };

      const launchBrowser = async () => {
        const puppeteer = await import("puppeteer");
        return puppeteer.launch({
          headless: true,
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
      };

      const searchFunctions: Record<SearchProvider, (q: string) => Promise<SearchResult[]>> = {
        "duckduckgo-api": async (q: string) => {
          const { search, SafeSearchType } = await import("duck-duck-scrape");
          let attempt = 0;
          let lastError: unknown = null;

          while (attempt < 2) {
            try {
              const r = await search(q, { safeSearch: SafeSearchType.OFF });
              if (r.results && r.results.length > 0) {
                return r.results.slice(0, 10).map((result: any) => ({
                  title: result.title,
                  link: result.url,
                  snippet: result.description,
                  provider: "duckduckgo-api",
                }));
              }
              break;
            } catch (e) {
              lastError = e;
              attempt++;
              await new Promise(res => setTimeout(res, 1000));
            }
          }

          if (lastError) {
            throw lastError;
          }
          throw new Error("DuckDuckGo API returned no results");
        },

        "duckduckgo-fetch": async (q: string) => {
          const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
              "Accept-Language": "en-US,en;q=0.9",
            },
          });
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const html = await response.text();
          const extracted = parseDuckDuckGoHtml(html, "duckduckgo-fetch");
          if (extracted.length > 0) return extracted;
          throw new Error("No results parsed from DuckDuckGo HTML");
        },

        "duckduckgo-html": async (q: string) => {
          const browser = await launchBrowser();
          try {
            const page = await browser.newPage();
            await page.goto(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`, { waitUntil: "networkidle2", timeout: 15000 });

            const html = await page.content();
            const extracted = parseDuckDuckGoHtml(html, "duckduckgo-html");
            if (extracted.length > 0) return extracted;
            throw new Error("No results found");
          } finally {
            await browser.close();
          }
        },

        "google": async (q: string) => {
          const browser = await launchBrowser();
          try {
            const page = await browser.newPage();
            await page.goto(`https://www.google.com/search?q=${encodeURIComponent(q)}`, { waitUntil: "networkidle2", timeout: 15000 });

            const extracted = await page.evaluate(() => {
              const items = document.querySelectorAll("div.g");
              const data = [];
              for (const item of items) {
                const titleEl = item.querySelector("h3");
                const linkEl = item.querySelector("a");
                const snippetEl = item.querySelector('div[style*="-webkit-line-clamp"]') || item.querySelector("div.VwiC3b");
                if (titleEl && linkEl) {
                  data.push({
                    title: titleEl.innerText,
                    link: linkEl.getAttribute("href") || "",
                    snippet: snippetEl ? (snippetEl as HTMLElement).innerText : "",
                    provider: "google" as const,
                  });
                }
              }
              return data;
            });
            if (extracted.length > 0) return extracted.slice(0, 10);
            throw new Error("No results found");
          } finally {
            await browser.close();
          }
        },

        "bing": async (q: string) => {
          const browser = await launchBrowser();
          try {
            const page = await browser.newPage();
            await page.goto(`https://www.bing.com/search?q=${encodeURIComponent(q)}`, { waitUntil: "networkidle2", timeout: 15000 });

            const extracted = await page.evaluate(() => {
              const items = document.querySelectorAll("li.b_algo");
              const data = [];
              for (const item of items) {
                const titleEl = item.querySelector("h2 a");
                const linkEl = item.querySelector("h2 a");
                const snippetEl = item.querySelector("p");
                if (titleEl && linkEl) {
                  data.push({
                    title: (titleEl as HTMLElement).innerText,
                    link: linkEl.getAttribute("href") || "",
                    snippet: snippetEl ? (snippetEl as HTMLElement).innerText : "",
                    provider: "bing" as const,
                  });
                }
              }
              return data;
            });
            if (extracted.length > 0) return extracted.slice(0, 10);
            throw new Error("No results found");
          } finally {
            await browser.close();
          }
        },
      };

      if (providers && providers.length > 0) {
        for (const providerKey of providers) {
          try {
            logs.push(`[Manual] Attempting ${providerKey}...`);
            const pResults = await searchFunctions[providerKey](query);
            results.push(...pResults);
            logs.push(`[Manual] Success: ${providerKey} found ${pResults.length} results.`);
          } catch (e) {
            const errMsg = e instanceof Error ? e.message : String(e);
            errors.push(`${providerKey}: ${errMsg}`);
            logs.push(`[Manual] Failed: ${providerKey} - ${errMsg}`);
          }
        }
      } else {
        const chain: SearchProvider[] = ["duckduckgo-api", "duckduckgo-fetch", "duckduckgo-html", "google", "bing"];

        for (let i = 0; i < chain.length; i++) {
          const providerKey = chain[i];
          const nextProvider = chain[i + 1];
          try {
            logs.push(`[Fallback Chain] Attempting ${providerKey}...`);
            const pResults = await searchFunctions[providerKey](query);
            results.push(...pResults);
            logs.push(`[Fallback Chain] Success: ${providerKey} found ${pResults.length} results. Stopping chain.`);
            break;
          } catch (e) {
            const errMsg = e instanceof Error ? e.message : String(e);
            errors.push(`${providerKey}: ${errMsg}`);
            const nextMsg = nextProvider ? `Falling back to ${nextProvider}...` : "No more providers.";
            logs.push(`[Fallback Chain] Failed: ${providerKey} - ${errMsg}. ${nextMsg}`);
          }
        }
      }

      if (results.length === 0) {
        return {
          error: "All attempted search providers failed.",
          attempts: errors,
          trace: logs,
        };
      }

      const seenLinks = new Set<string>();
      const dedupedResults = results.filter(r => {
        const key = r.link.trim();
        if (!key || seenLinks.has(key)) return false;
        seenLinks.add(key);
        return true;
      });

      return {
        results: dedupedResults,
        meta: {
          total_found: dedupedResults.length,
          providers_used: [...new Set(dedupedResults.map(r => r.provider))],
          no_api_key_required: true,
          trace: logs,
        },
      };
    },
  });
  tools.push(webSearchTool);

  const moveFileTool = tool({
    name: "move_file",
    description: "Move or rename a file or directory.",
    parameters: {
      source: z.string(),
      destination: z.string(),
    },
    implementation: async ({ source, destination }) => {
      const sourcePath = validatePath(currentWorkingDirectory, source);
      const destPath = validatePath(currentWorkingDirectory, destination);
      await rename(sourcePath, destPath);
      return {
        success: true,
        from: sourcePath,
        to: destPath,
      };
    },
  });
  tools.push(moveFileTool);

  const copyFileTool = tool({
    name: "copy_file",
    description: "Copy a file to a new location.",
    parameters: {
      source: z.string(),
      destination: z.string(),
    },
    implementation: async ({ source, destination }) => {
      const sourcePath = validatePath(currentWorkingDirectory, source);
      const destPath = validatePath(currentWorkingDirectory, destination);
      await copyFile(sourcePath, destPath);
      return {
        success: true,
        from: sourcePath,
        to: destPath,
      };
    },
  });
  tools.push(copyFileTool);

  const fetchWebContentTool = tool({
    name: "fetch_web_content",
    description: "Fetch the clean, text-based content of a webpage URL.",
    parameters: {
      url: z.string(),
    },
    implementation: async ({ url }) => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        let text = await response.text();

        const result: any = {
          url,
          status: response.status,
        };

        const titleMatch = text.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleMatch) result.title = titleMatch[1];

        const { compile } = await import("html-to-text");
        const compiledConvert = compile({
          wordwrap: false,
          selectors: [
            { selector: "a", options: { ignoreHref: true } },
            { selector: "img", format: "skip" },
          ],
        });

        text = compiledConvert(text);

        result.content = text.substring(0, 40000) + (text.length > 40000 ? "... (truncated)" : "");

        return result;
      } catch (error) {
        return {
          error: `Failed to fetch URL: ${error instanceof Error ? error.message : String(error)}`,
        };
      }
    },
  });
  tools.push(fetchWebContentTool);

  const ragWebContentTool = tool({
    name: "rag_web_content",
    description: "Fetch content from a URL, and then use RAG to find and return only the text chunks most relevant to a specific query.",
    parameters: {
      url: z.string(),
      query: z.string(),
    },
    implementation: async ({ url, query }) => {
      try {
        // 1. Fetch content
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        let text = await response.text();

        const { compile } = await import("html-to-text");
        const compiledConvert = compile({
          wordwrap: false,
          selectors: [
            { selector: "a", options: { ignoreHref: true } },
            { selector: "img", format: "skip" },
          ],
        });

        text = compiledConvert(text);

        if (text.length === 0) {
          return { error: "Could not extract any text from the URL." };
        }

        // 3. Perform RAG
        if (!client) {
          return { error: "LM Studio Client is not available. RAG features require the client to be initialized." };
        }
        const ragResults = await performRagOnText(text, query, client, embeddingModelName);

        return {
          url: url,
          query: query,
          relevant_chunks: ragResults,
        };

      } catch (error) {
        return { error: `Failed during RAG web search: ${error instanceof Error ? error.message : String(error)}` };
      }
    },
  });
  tools.push(ragWebContentTool);

  const getSystemInfoTool = tool({
    name: "get_system_info",
    description: "Get information about the system (OS, CPU, Memory).",
    parameters: {},
    implementation: async () => {
      return {
        platform: os.platform(),
        arch: os.arch(),
        release: os.release(),
        hostname: os.hostname(),
        total_memory: os.totalmem(),
        free_memory: os.freemem(),
        cpus: os.cpus().length,
        node_version: process.version,
      };
    },
  });
  tools.push(getSystemInfoTool);

  const findFilesTool = tool({
    name: "find_files",
    description: "Find files recursively in the current directory matching a name pattern.",
    parameters: {
      pattern: z.string().describe("Substring to match in filename (case-insensitive)"),
      max_depth: z.number().optional().describe("Maximum depth to search (default: 5)"),
    },
    implementation: async ({ pattern, max_depth }) => {
      const depthLimit = max_depth ?? 5;
      const foundFiles: string[] = [];
      const lowerPattern = pattern.toLowerCase();

      async function scan(dir: string, currentDepth: number) {
        if (currentDepth > depthLimit) return;
        try {
          const entries = await readdir(dir, { withFileTypes: true });
          for (const entry of entries) {
            const fullPath = join(dir, entry.name);
            if (entry.isDirectory()) {
              await scan(fullPath, currentDepth + 1);
            } else if (entry.isFile()) {
              if (entry.name.toLowerCase().includes(lowerPattern)) {
                foundFiles.push(fullPath);
              }
            }
          }
        } catch (e) {
          // Ignore access errors
        }
      }

      await scan(currentWorkingDirectory, 0);
      return {
        found_files: foundFiles.slice(0, 100), // Limit results
        count: foundFiles.length,
      };
    },
  });
  tools.push(findFilesTool);

  const fuzzyFindLocalFilesTool = tool({
    name: "fuzzy_find_local_files",
    description: "Fuzzy find local files by path/name similarity using Levenshtein scoring.",
    parameters: {
      query: z.string().describe("Search query to match against file names/paths."),
      path: z.string().optional().describe("Sub-directory to search in (default: current directory)."),
      max_results: z.number().int().min(1).max(20).optional().describe("Max results to return (default: 5)."),
    },
    implementation: async ({ query, path = ".", max_results = 5 }) => {
      try {
        const targetDir = validatePath(currentWorkingDirectory, path);
        const entries = await readdir(targetDir, { recursive: true, withFileTypes: true });
        const files = entries
          .filter(entry => entry.isFile())
          .map(entry => {
            const fullPath = join(entry.path, entry.name);
            const relativePath = relative(targetDir, fullPath);
            return relativePath.replace(/\\/g, "/");
          });

        const ranked = rankFuzzyMatches(query, files, max_results);
        return {
          query,
          path: targetDir,
          results: ranked.map(item => ({
            path: item.value,
            score: item.score,
          })),
        };
      } catch (error) {
        return { error: `Fuzzy file search failed: ${error instanceof Error ? error.message : String(error)}` };
      }
    },
  });
  tools.push(fuzzyFindLocalFilesTool);

  const getFileMetadataTool = tool({
    name: "get_file_metadata",
    description: "Get metadata (size, dates) for a specific file.",
    parameters: {
      path: z.string(),
    },
    implementation: async ({ path }) => {
      try {
        const targetPath = validatePath(currentWorkingDirectory, path);
        const stats = await stat(targetPath);
        return {
          path: targetPath,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          is_directory: stats.isDirectory(),
          is_file: stats.isFile(),
        };
      } catch (error) {
        return { error: `Failed to get metadata: ${error instanceof Error ? error.message : String(error)}` };
      }
    },
  });
  tools.push(getFileMetadataTool);

  const readClipboardTool = tool({
    name: "read_clipboard",
    description: "Read text content from the system clipboard.",
    parameters: {},
    implementation: async () => {
      let command = "";
      let args: string[] = [];

      if (process.platform === "win32") {
        command = "powershell";
        args = ["-command", "Get-Clipboard"];
      } else if (process.platform === "darwin") {
        command = "pbpaste";
      } else {
        // Linux fallback (might fail if tools missing)
        command = "xclip";
        args = ["-selection", "clipboard", "-o"];
      }

      return Promise.race([
        new Promise((resolve) => {
          const child = spawn(command, args);
          let output = "";
          let error = "";

          child.stdout.on("data", (data) => output += data.toString());
          child.stderr.on("data", (data) => error += data.toString());

          child.on("close", (code) => {
            if (code === 0) {
              resolve({ content: output.trim() });
            } else {
              resolve({ error: `Failed to read clipboard. Exit code: ${code}. Error: ${error}` });
            }
          });

          child.on("error", (err) => {
            resolve({ error: `Failed to spawn clipboard command: ${err.message}` });
          });
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Clipboard operation timeout")), 5000)
        )
      ]).catch((err) => ({ error: err.message }));
    },
  });
  tools.push(readClipboardTool);

  const writeClipboardTool = tool({
    name: "write_clipboard",
    description: "Write text content to the system clipboard.",
    parameters: {
      content: z.string(),
    },
    implementation: async ({ content }) => {
      let command = "";
      let args: string[] = [];
      let input = content;

      if (process.platform === "win32") {
        command = "powershell";
        // Use base64 to avoid complex escaping issues in PowerShell
        const base64Content = Buffer.from(content, 'utf8').toString('base64');
        // Command decodes base64 and sets clipboard
        args = ["-command", `$str = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String('${base64Content}')); Set-Clipboard -Value $str`];
        input = ""; // Input handled via args
      } else if (process.platform === "darwin") {
        command = "pbcopy";
      } else {
        command = "xclip";
        args = ["-selection", "clipboard", "-i"];
      }

      return Promise.race([
        new Promise((resolve) => {
          const child = spawn(command, args, { stdio: ['pipe', 'ignore', 'pipe'] });

          if (input && process.platform !== "win32") {
            child.stdin.write(input);
            child.stdin.end();
          } else if (process.platform === "win32") {
            child.stdin.end();
          }

          let error = "";
          child.stderr.on("data", (data) => error += data.toString());

          child.on("close", (code) => {
            if (code === 0) {
              resolve({ success: true });
            } else {
              resolve({ error: `Failed to write to clipboard. Exit code: ${code}. Error: ${error}` });
            }
          });

          child.on("error", (err) => {
            resolve({ error: `Failed to spawn clipboard command: ${err.message}` });
          });
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Clipboard operation timeout")), 5000)
        )
      ]).catch((err) => ({ error: err.message }));
    },
  });
  tools.push(writeClipboardTool);

  const openFileTool = tool({
    name: "open_file",
    description: "Open a file or URL in the system's default application. Use this to preview images, PDFs, or open web pages.",
    parameters: {
      target: z.string().describe("File path or URL"),
    },
    implementation: async ({ target }) => {
      // Resolve path if it's a file and not a URL
      let targetToOpen = target;
      if (!target.startsWith("http://") && !target.startsWith("https://")) {
        targetToOpen = validatePath(currentWorkingDirectory, target);
      }

      const open = (await import("open")).default;
      await open(targetToOpen);

      return { success: true, message: `Opened ${targetToOpen}` };
    }
  });
  tools.push(openFileTool);

  const previewHtmlTool = tool({
    name: "preview_html",
    description: "Render and preview HTML content in the system's default browser. Useful for visualizing code or UIs.",
    parameters: {
      html_content: z.string(),
      file_name: z.string().optional().describe("Optional filename (default: preview.html)")
    },
    implementation: async ({ html_content, file_name }) => {
      const name = file_name || `preview_${Date.now()}.html`;
      const filePath = validatePath(currentWorkingDirectory, name);
      await writeFile(filePath, html_content, "utf-8");

      // Open it
      const open = (await import("open")).default;
      await open(filePath);

      return { success: true, path: filePath, message: "HTML preview launched in browser." };
    }
  });
  tools.push(previewHtmlTool);

  const browserActionSchema = z.object({
    type: z.enum(["wait_for_selector", "wait", "click", "type", "press", "select", "hover", "scroll", "evaluate"]),
    selector: z.string().optional().describe("CSS selector used by selector-based actions."),
    text: z.string().optional().describe("Text payload for type action."),
    value: z.string().optional().describe("Value payload for select action."),
    key: z.string().optional().describe("Keyboard key for press action (e.g., Enter, Tab)."),
    milliseconds: z.number().int().min(0).max(30000).optional().describe("Delay in milliseconds for wait action."),
    x: z.number().optional().describe("Horizontal scroll delta for scroll action."),
    y: z.number().optional().describe("Vertical scroll delta for scroll action."),
    script: z.string().optional().describe("JavaScript snippet for evaluate action (executed in page context)."),
  });

  const browserSessionOpenTool = tool({
    name: "browser_session_open",
    description: "Open a persistent browser session (single active page), navigate to URL, and return page text for context.",
    parameters: {
      url: z.string(),
      wait_for_selector: z.string().optional().describe("Optional selector to wait for after navigation."),
      include_page_text: z.boolean().optional().describe("If true (default), returns full page text content after opening."),
    },
    implementation: createSafeToolImplementation(async ({ url, wait_for_selector, include_page_text = true }) => {
      try {
        if (browserSession) {
          await browserSession.browser.close().catch(() => { });
          browserSession = null;
        }

        const puppeteer = await import("puppeteer");
        const browser = await puppeteer.launch({
          headless: true,
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
        if (wait_for_selector) {
          await page.waitForSelector(wait_for_selector, { timeout: 15000 });
        }

        browserSession = {
          browser,
          page,
          currentUrl: page.url(),
        };

        const pageText = include_page_text
          ? await page.evaluate(() => document.body.innerText || "")
          : undefined;

        return {
          success: true,
          session_active: true,
          url: page.url(),
          title: await page.title(),
          text_content: pageText,
          text_length: pageText ? pageText.length : 0,
          message: "Browser session opened.",
        };
      } catch (error) {
        return { error: `Failed to open browser session: ${error instanceof Error ? error.message : String(error)}` };
      }
    }, allowBrowserControl, "browser_control"),
  });
  tools.push(browserSessionOpenTool);

  const browserSessionControlTool = tool({
    name: "browser_session_control",
    description: "Control the active persistent browser session. Supports actions, page reading, screenshot capture, and fuzzy finding in-page text/selectors.",
    parameters: {
      actions: z.array(browserActionSchema).optional().describe("Optional scripted browser actions to execute on the active page."),
      read_page: z.boolean().optional().describe("If true (default), returns page metadata. Full text is returned only on URL change or when full_read=true."),
      full_read: z.boolean().optional().describe("If true, forces full page text output even when URL has not changed."),
      screenshot_path: z.string().optional().describe("Optional screenshot output path."),
      full_page_screenshot: z.boolean().optional().describe("If true, captures full page screenshot."),
      fuzzy_find: z.string().optional().describe("Optional fuzzy-find query for in-page content/selectors."),
      max_results: z.number().int().min(1).max(20).optional().describe("Max fuzzy results to return (default: 5)."),
    },
    implementation: createSafeToolImplementation(async ({ actions, read_page = true, full_read = false, screenshot_path, full_page_screenshot, fuzzy_find, max_results = 5 }) => {
      if (!browserSession) {
        return { error: "No active browser session. Call 'browser_session_open' first." };
      }

      try {
        const beforeUrl = browserSession.page.url();
        const actionLog = await executeBrowserActions(browserSession.page, actions || []);
        const afterUrl = browserSession.page.url();
        const urlChanged = beforeUrl !== afterUrl;
        browserSession.currentUrl = afterUrl;

        let screenshotSaved = false;
        if (screenshot_path) {
          const screenshotFilePath = validatePath(currentWorkingDirectory, screenshot_path);
          await browserSession.page.screenshot({ path: screenshotFilePath, fullPage: full_page_screenshot ?? false });
          screenshotSaved = true;
        }

        let pageSnapshot:
          | { url: string; title: string; text_content?: string; text_length?: number; note?: string }
          | undefined = undefined;
        if (read_page) {
          const title = await browserSession.page.title();
          if (urlChanged || full_read) {
            const textContent = await browserSession.page.evaluate(() => document.body.innerText || "");
            pageSnapshot = {
              url: afterUrl,
              title,
              text_content: textContent,
              text_length: textContent.length,
            };
          } else {
            pageSnapshot = {
              url: afterUrl,
              title,
              note: "Full page text omitted (URL unchanged). Set full_read=true to force full output.",
            };
          }
        }

        let fuzzyResults: Array<{ text: string; selector: string; score: number }> = [];
        if (typeof fuzzy_find === "string" && fuzzy_find.trim()) {
          const candidates = await browserSession.page.evaluate(() => {
            const dedup = new Map<string, { text: string; selector: string }>();
            const nodes = document.querySelectorAll("a,button,input,textarea,select,[role='button'],[aria-label],h1,h2,h3,h4,h5,h6,p,span");

            const clean = (value: string) => value.replace(/\s+/g, " ").trim();
            const classSelector = (el: Element) => {
              const classes = Array.from(el.classList).slice(0, 2).map(c => c.replace(/[^a-zA-Z0-9_-]/g, ""));
              return classes.length > 0 ? `.${classes.join(".")}` : "";
            };

            const buildSelector = (el: Element) => {
              if ((el as HTMLElement).id) return `#${(el as HTMLElement).id}`;
              const name = el.getAttribute("name");
              if (name) return `${el.tagName.toLowerCase()}[name="${name.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"]`;
              return `${el.tagName.toLowerCase()}${classSelector(el)}`;
            };

            for (const node of nodes) {
              const element = node as HTMLElement;
              const text = clean(
                element.innerText ||
                (element as HTMLInputElement).value ||
                element.getAttribute("aria-label") ||
                "",
              );
              if (!text) continue;
              const selector = buildSelector(element);
              const key = `${text}||${selector}`;
              if (!dedup.has(key)) {
                dedup.set(key, { text: text.substring(0, 200), selector });
              }
              if (dedup.size >= 400) break;
            }

            return Array.from(dedup.values());
          });

          const ranked = candidates
            .map(candidate => ({
              ...candidate,
              score: Math.max(
                rankFuzzyMatches(fuzzy_find, [candidate.text], 1)[0]?.score ?? 0,
                rankFuzzyMatches(fuzzy_find, [candidate.selector], 1)[0]?.score ?? 0,
              ),
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, max_results);

          fuzzyResults = ranked.map(item => ({
            text: item.text,
            selector: item.selector,
            score: item.score,
          }));
        }

        return {
          success: true,
          session_active: true,
          actions_executed: actionLog,
          screenshot_saved: screenshotSaved,
          url_changed: urlChanged,
          url_change_notice: urlChanged ? `Url changed to -> [${afterUrl}]` : undefined,
          page: pageSnapshot,
          fuzzy_find_results: fuzzyResults,
        };
      } catch (error) {
        return { error: `Browser session control failed: ${error instanceof Error ? error.message : String(error)}` };
      }
    }, allowBrowserControl, "browser_control"),
  });
  tools.push(browserSessionControlTool);

  const browserSessionCloseTool = tool({
    name: "browser_session_close",
    description: "Close the active persistent browser session.",
    parameters: {},
    implementation: createSafeToolImplementation(async () => {
      if (!browserSession) {
        return { success: true, session_active: false, message: "No active browser session." };
      }

      try {
        await browserSession.browser.close();
        browserSession = null;
        return { success: true, session_active: false, message: "Browser session closed." };
      } catch (error) {
        return { error: `Failed to close browser session: ${error instanceof Error ? error.message : String(error)}` };
      }
    }, allowBrowserControl, "browser_control"),
  });
  tools.push(browserSessionCloseTool);

  const browserOpenPageTool = tool({
    name: "browser_open_page",
    description: "Open a webpage in a headless browser (Puppeteer), render it once, and return content. One-shot only; do not use for multi-step navigation.",
    parameters: {
      url: z.string(),
      screenshot_path: z.string().optional().describe("Path to save a screenshot (e.g., 'screenshot.png')."),
      wait_for_selector: z.string().optional().describe("CSS selector to wait for before returning."),
      full_page_screenshot: z.boolean().optional().describe("If true, captures the full page when taking a screenshot."),
      actions: z.array(browserActionSchema).optional().describe("Optional scripted browser steps to run after navigation."),
    },
    implementation: createSafeToolImplementation(async ({ url, screenshot_path, wait_for_selector, full_page_screenshot, actions }) => {
      let browser;
      try {
        // Dynamically import puppeteer
        const puppeteer = await import("puppeteer");
        browser = await puppeteer.launch({
          headless: true,
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        const page = await browser.newPage();

        try {
          await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

          if (wait_for_selector) {
            await page.waitForSelector(wait_for_selector, { timeout: 10000 });
          }

          const beforeActionUrl = page.url();
          const action_log = await executeBrowserActions(page, actions || []);
          const currentUrl = page.url();
          const urlChanged = currentUrl !== beforeActionUrl;

          const title = await page.title();
          const textContent = await page.evaluate(() => document.body.innerText || "");

          let screenshot_saved = false;
          if (screenshot_path) {
            const screenshotFilePath = validatePath(currentWorkingDirectory, screenshot_path);
            await page.screenshot({ path: screenshotFilePath, fullPage: full_page_screenshot ?? false });
            screenshot_saved = true;
          }

          return {
            url: currentUrl,
            title,
            text_content: textContent.substring(0, 5000),
            screenshot_saved,
            actions_executed: action_log,
            url_changed: urlChanged,
            url_change_notice: urlChanged ? `Url changed to -> [${currentUrl}]` : undefined,
          };
        } finally {
          await browser.close();
        }
      } catch (error) {
        if (browser) {
          await browser.close().catch(() => { });
        }
        return { error: `Browser operation failed: ${error instanceof Error ? error.message : String(error)}` };
      }
    }, allowBrowserControl, "browser_control")
  });
  tools.push(browserOpenPageTool);

  const runTestCommandTool = tool({
    name: "run_test_command",
    description: "Execute a test command (like 'npm test') and return the results. Specialized for capturing test output.",
    parameters: {
      command: z.string().describe("The test command to run (e.g., 'npm test', 'pytest')."),
    },
    implementation: async ({ command }) => {
      return new Promise((resolve) => {
        const parts = command.split(" ");
        const cmd = parts[0];
        const args = parts.slice(1);

        const child = spawn(cmd, args, {
          cwd: currentWorkingDirectory,
          shell: true,
          env: { ...process.env, CI: 'true' }
        });

        let stdout = "";
        let stderr = "";

        child.stdout.on("data", (data) => { stdout += data.toString(); });
        child.stderr.on("data", (data) => { stderr += data.toString(); });

        child.on("close", (code) => {
          resolve({
            command,
            exit_code: code,
            stdout: stdout.trim(),
            stderr: stderr.trim(),
            passed: code === 0
          });
        });
        child.on("error", (err) => {
          resolve({
            command,
            error: err.message,
            passed: false
          });
        });
      });
    }
  });
  tools.push(runTestCommandTool);

  const wikipediaSearchTool = tool({
    name: "wikipedia_search",
    description: "Search Wikipedia for a given query and return page summaries.",
    parameters: {
      query: z.string(),
      lang: z.string().optional().describe("Language code (default: en)"),
    },
    implementation: createSafeToolImplementation(
      async ({ query, lang = "en" }) => {
        try {
          const searchUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json`;
          const searchResponse = await fetch(searchUrl);
          const searchData = await searchResponse.json();

          if (!searchData.query || !searchData.query.search || searchData.query.search.length === 0) {
            return { results: "No Wikipedia articles found." };
          }

          const results = [];
          for (const item of searchData.query.search.slice(0, 3)) { // Top 3
            const pageUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&pageids=${item.pageid}&format=json`;
            const pageResponse = await fetch(pageUrl);
            const pageData = await pageResponse.json();
            const page = pageData.query.pages[item.pageid];

            results.push({
              title: item.title,
              summary: page.extract.substring(0, 2000) + (page.extract.length > 2000 ? "..." : ""),
              url: `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, "_"))}`
            });
          }
          return { results };
        } catch (error) {
          return { error: `Wikipedia search failed: ${error instanceof Error ? error.message : String(error)}` };
        }
      },
      enableWikipedia,
      "wikipedia_search"
    )
  });
  tools.push(wikipediaSearchTool);

  const ragLocalFilesTool = tool({
    name: "rag_local_files",
    description: "Perform RAG (Retrieval-Augmented Generation) on files in the current workspace. Use this to find code snippets or information within local files relevant to a query.",
    parameters: {
      query: z.string(),
      path: z.string().optional().describe("Sub-directory to limit search (default: current working directory)"),
      file_pattern: z.string().optional().describe("File pattern to include (e.g. '.ts', 'src/'). Default: all text files."),
    },
    implementation: createSafeToolImplementation(
      async ({ query, path = ".", file_pattern = "" }) => {
        try {
          if (!client) return { error: "LM Studio Client unavailable." };

          const targetDir = validatePath(currentWorkingDirectory, path);
          const entries = await readdir(targetDir, { recursive: true, withFileTypes: true });
          const textFiles = entries.filter(e => e.isFile() && !e.name.match(/\.(png|jpg|jpeg|gif|ico|exe|dll|bin)$/i));

          // Filter by pattern if provided
          const filteredFiles = file_pattern
            ? textFiles.filter(e => e.name.includes(file_pattern) || join(e.parentPath, e.name).includes(file_pattern))
            : textFiles;

          // Limit to avoid massive reads. 
          // In a real 'Gemini Flow' robust implementation, we'd use an index. 
          // Here we'll read top 50 files max to be safe.
          const filesToScan = filteredFiles.slice(0, 50);

          let allChunks: { chunk: string, score: number, file: string }[] = [];
          const embeddingModel = await client.embedding.model(embeddingModelName);
          const [queryEmbedding] = await embeddingModel.embed([query]);

          for (const file of filesToScan) {
            try {
              const fullPath = join(file.parentPath, file.name);
              const content = await readFile(fullPath, "utf-8");
              // reuse chunking logic
              const chunks = content.split(/\n\s*\n/).filter(c => c.trim().length > 20);
              if (chunks.length === 0) continue;

              // Batch embed chunks for this file
              const chunkEmbeddings = await embeddingModel.embed(chunks);

              chunks.forEach((chunk, i) => {
                const score = cosineSimilarity(queryEmbedding.embedding, chunkEmbeddings[i].embedding);
                if (score > 0.4) { // Threshold
                  allChunks.push({ chunk, score, file: file.name });
                }
              });

            } catch (e) {
              // ignore read errors
            }
          }

          // Sort all chunks
          allChunks.sort((a, b) => b.score - a.score);

          return {
            query,
            results: allChunks.slice(0, 10).map(c => ({
              file: c.file,
              score: c.score.toFixed(3),
              content: c.chunk
            }))
          };

        } catch (error) {
          return { error: `Local RAG failed: ${error instanceof Error ? error.message : String(error)}` };
        }
      },
      enableLocalRag,
      "rag_local_files"
    )
  });
  tools.push(ragLocalFilesTool);

  const consultSecondaryAgentTool = tool({
    name: "consult_secondary_agent",
    description: "Delegate a task to a secondary agent. IMPORTANT: If the task is 'coding' or 'writing files', the secondary agent will AUTOMATICALLY CREATE AND SAVE the files to the disk. You do NOT need to save them yourself. The tool returns a list of generated files. Trust this list.",
    parameters: {
      task: z.string(),
      agent_role: z.string().optional().describe("Key from 'Sub-Agent Profiles' config (e.g., 'coder'). Default: 'general'."),
      context: z.string().optional().describe("Additional context or data for the agent."),
      allow_tools: z.boolean().optional().describe("If true, the secondary agent can use tools like Web Search (DuckDuckGo, Wikipedia), File System (Read/List), and Code Execution (if enabled in settings). Default: false."),
    },
    implementation: createSafeToolImplementation(
      async ({ task, agent_role = "general", context = "", allow_tools = false }) => {
        let endpoint = pluginConfig.get("secondaryAgentEndpoint");
        let modelId = pluginConfig.get("secondaryModelId");
        const useMainModel = pluginConfig.get("useMainModelForSubAgent");
        let handoffMessage: string | undefined = undefined;
        let finalResponse = "";

        if (useMainModel) {
          endpoint = "http://localhost:1234/v1";
          // "local-model" is the standard placeholder in LM Studio to target the currently loaded model
          modelId = "local-model";
        }

        const subAgentProfilesStr = pluginConfig.get("subAgentProfiles");
        const debugMode = pluginConfig.get("enableDebugMode");
        const subAgentDebugLogging = pluginConfig.get("enableSubAgentDebugLogging");
        const autoSave = pluginConfig.get("subAgentAutoSave");
        const showFullCode = pluginConfig.get("showFullCodeOutput");

        const allowFileSystem = pluginConfig.get("subAgentAllowFileSystem");
        const allowWeb = pluginConfig.get("subAgentAllowWeb");
        const allowCode = pluginConfig.get("subAgentAllowCode");
        const allowSubAgentBrowserControl = pluginConfig.get("subAgentAllowBrowserControl");

        if (!enableSecondary) return { error: "Secondary agent is disabled in settings." };

        // Helper to run an agent loop
        const runAgentLoop = async (
          role: string,
          taskPrompt: string,
          contextData: string,
          loopLimit: number = 8,
          forceTools: boolean = false,
          currentWorkingDirectory: string
        ) => {
          let currentSystemPrompt = "You are a helpful assistant.";

          // Load Instructions
          const instructionsPath = join(currentWorkingDirectory, "SUB_AGENT_INSTRUCTIONS.md");
          try {
            const instructions = await readFile(instructionsPath, "utf-8");
            if (instructions.trim()) currentSystemPrompt = instructions;
          } catch (e) { } // Ignore if instructions file doesn't exist

          // Inject Project Info
          const infoPath = join(currentWorkingDirectory, "beledarian_info.md");
          try {
            const projectInfo = await readFile(infoPath, "utf-8");
            if (projectInfo.trim()) {
              currentSystemPrompt += `

## ? Current Project Info (beledarian_info.md)
${projectInfo}
`;
            }
          } catch (e) { } // Ignore if info file doesn't exist

          // Add current working directory to system prompt for context
          currentSystemPrompt += `

## ? Current Workspace
Your current working directory is: 

${currentWorkingDirectory}
Always assume relative paths are from this directory.`;

          // Append specific profile if available
          try {
            const profiles = JSON.parse(subAgentProfilesStr);
            if (profiles[role]) {
              currentSystemPrompt += `\n\n## Your Persona\n${profiles[role]}`;
            } else if (role === "reviewer") {
              currentSystemPrompt += `\n\n## Your Persona\nYou are a Senior Code Reviewer. Your job is to analyze code, find bugs, security issues, or logic errors, and FIX them.\n\nIMPORTANT: To fix a file, you MUST use the 'save_file' tool with the complete, corrected content. DO NOT use 'container.exec' or diff formats. Just overwrite the file with the fixed version using 'save_file'.`;
            }
          } catch (jsonErr) { }

          // Append Tools
          let toolsReminder = "";
          const toolsEnabled = allow_tools || forceTools;
          if (toolsEnabled) {
            const allowedTools = [];
            if (allowFileSystem) allowedTools.push("read_file", "list_directory", "save_file", "replace_text_in_file", "delete_files_by_pattern", "rag_local_files", "fuzzy_find_local_files", "search_file_content");
            if (allowWeb) allowedTools.push("wikipedia_search", "web_search", "duckduckgo_search", "fetch_web_content", "rag_web_content");
            if (allowWeb && allowSubAgentBrowserControl && allowBrowserControl) allowedTools.push("browser_session_open", "browser_session_control", "browser_session_close");
            if (allowCode) allowedTools.push("run_python", "run_javascript");

            if (allowedTools.length > 0) {
              const toolsList = allowedTools.join(", ");
              currentSystemPrompt += `\n\n## Allowed Tools\nYou have access to the following tools via JSON output: ${toolsList}.\nRefer to the "Tool Usage" section above for the JSON format.\n`;
              toolsReminder = `\n\n[SYSTEM REMINDER: You have access to tools: ${toolsList}. If you need information you don't have, USE A TOOL. Do not refuse.]`;
            }
            if (allowWeb && allowSubAgentBrowserControl && allowBrowserControl) {
              currentSystemPrompt += `\n\n## Browser Navigation Rule\nFor multi-step browsing/navigation, you MUST use browser_session_open -> browser_session_control -> browser_session_close.\nUse browser_open_page only for one-shot page reads.`;
            }
          }

          currentSystemPrompt += `\n\n## Optional Handoff Message\nIf you want the main agent to relay your findings, include either:\n1) [HANDOFF_MESSAGE]...[/HANDOFF_MESSAGE]\nOR\n2) JSON with a \`handoff_message\` field (optionally with \`response\` or \`final_response\`).`;

          const msgList = [
            { role: "system", content: currentSystemPrompt },
            { role: "user", content: `Task: ${taskPrompt}\n\nContext: ${contextData}${toolsReminder}` }
          ];

          let loops = 0;
          let noToolCallCount = 0;
          let executedToolCallCount = 0;
          let finalContent = "";
          let filesModified: string[] = [];
          let handoffMessage = "";
          const maxSubAgentToolOutputChars = 30000;
          const suggestedReadPath = allowFileSystem
            ? extractLikelyFilePath(`${taskPrompt}\n${contextData}`)
            : null;

          while (loops < loopLimit) {
            try {
              const response = await fetch(`${endpoint}/chat/completions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  model: modelId,
                  messages: msgList,
                  temperature: 0.7,
                  stream: false
                })
              });

              if (!response.ok) {
                const errorBody = await response.text().catch(() => "");
                const compactErrorBody = errorBody.replace(/\s+/g, " ").trim().substring(0, 600);
                if (subAgentDebugLogging) {
                  console.log(`[Sub-Agent] API error status=${response.status} body=${compactErrorBody}`);
                }
                const details = compactErrorBody ? ` - ${compactErrorBody}` : "";
                return { error: `API Error: ${response.status}${details}`, filesModified };
              }

              const data = await response.json();
              const message = data?.choices?.[0]?.message;
              const parsedMessage = parseSubAgentResponseMessage(message);
              const content = parsedMessage.content;
              let toolCall: ParsedToolCall | null = parsedMessage.toolCall;

              if (subAgentDebugLogging) {
                const preview = content.substring(0, 200);
                console.log(`[Sub-Agent] Parse result source=${parsedMessage.toolCallSource} hasToolCall=${Boolean(toolCall)} preview=${preview}`);
              }

              // Always capture the latest content as the finalContent candidate
              finalContent = content;

              if (!toolsEnabled) {
                const extracted = extractHandoffMessage(content);
                // If the only output is a bare tool-call JSON (model tried to use tools it wasn't
                // given), substitute a clear failure message rather than leaking raw JSON.
                const looksLikePureToolCall =
                  extracted.response.trimStart().startsWith("{") &&
                  parsedMessage.toolCall !== null &&
                  extracted.response.trim().length < 500;
                const safeResponse = looksLikePureToolCall
                  ? "[Sub-agent did not produce a prose response. It attempted a tool call but tools are disabled for this invocation.]"
                  : extracted.response;
                return { response: safeResponse, filesModified, handoff_message: extracted.handoffMessage };
              }

              const trimmed = content.trim();
              if (!toolCall && trimmed) {
                const refusalKeywords = [
                  "i cannot browse", "i don't have access", "i can't access",
                  "unable to browse", "real-time news", "no internet access",
                  "as an ai", "i do not have the ability", "cannot access the internet"
                ];
                if (refusalKeywords.some(kw => trimmed.toLowerCase().includes(kw))) {
                  msgList.push({ role: "assistant", content: content });
                  msgList.push({ role: "system", content: "SYSTEM ERROR: You HAVE access to tools. USE THEM." });
                  loops++;
                  continue;
                }
              }

              if (toolCall && toolCall.tool) {
                noToolCallCount = 0;
                executedToolCallCount++;
                msgList.push({ role: "assistant", content: content });
                let toolResult = "";
                let toolValidationError: string | null = null;

                // --- Parameter Validation Helper ---
                const validateRequiredParams = (toolName: string, requiredParams: string[], providedArgs: Record<string, any> = {}): string | null => {
                  const missing = requiredParams.filter(p => !(p in providedArgs));
                  if (missing.length > 0) {
                    const availableKeys = Object.keys(providedArgs).join(", ") || "none";
                    return `Tool '${toolName}' requires parameters: [${requiredParams.join(", ")}]. Missing: [${missing.join(", ")}]. Provided keys: ${availableKeys}.`;
                  }
                  return null;
                };

                try {
                  // --- Early Parameter Validation (catches wrong param names + absolute paths) ---
                  const args = toolCall.args || {};
                  
                  if (toolCall.tool === "save_file" && allowFileSystem) {
                    const fileName = args.file_name || args.name;
                    const fileContent = args.content || args.data;
                    
                    if (!fileName && !fileContent) {
                      toolValidationError = `Tool 'save_file' requires parameters: [file_name, content]. Provided keys: ${Object.keys(args).join(", ") || "none"}. Hint: Use 'file_name' (not 'path', 'filepath', or 'file_path') and 'content' (not 'data').`;
                    } else if (!fileName) {
                      toolValidationError = `Tool 'save_file' missing required parameter: 'file_name'. Provided keys: ${Object.keys(args).join(", ")}. Hint: Use 'file_name' not 'path' or 'filepath'.`;
                    } else if (!fileContent) {
                      toolValidationError = `Tool 'save_file' missing required parameter: 'content'. Provided keys: ${Object.keys(args).join(", ")}. Hint: Use 'content' not 'data'.`;
                    } else if (isAbsolute(fileName)) {
                      toolValidationError = `Tool 'save_file' rejected absolute path: '${fileName}'. SECURITY: Files can only be saved within workspace: ${currentWorkingDirectory}. Use relative path like 'test.html'.`;
                    }
                  }
                  
                  if (toolCall.tool === "read_file" && allowFileSystem) {
                    const fileName = args.file_name;
                    if (!fileName) {
                      toolValidationError = `Tool 'read_file' requires parameter: [file_name]. Provided keys: ${Object.keys(args).join(", ") || "none"}.`;
                    } else if (isAbsolute(fileName)) {
                      toolValidationError = `Tool 'read_file' rejected absolute path. SECURITY: Only workspace paths allowed.`;
                    }
                  }
                  
                  if (toolCall.tool === "replace_text_in_file" && allowFileSystem) {
                    const missing = [];
                    if (!args.file_name) missing.push("file_name");
                    if (!args.old_string) missing.push("old_string");
                    if (!args.new_string) missing.push("new_string");
                    if (missing.length > 0) {
                      toolValidationError = `Tool 'replace_text_in_file' missing parameters: [${missing.join(", ")}]. Provided keys: ${Object.keys(args).join(", ") || "none"}.`;
                    } else if (isAbsolute(args.file_name)) {
                      toolValidationError = `Tool 'replace_text_in_file' rejected absolute path. SECURITY: Only workspace paths allowed.`;
                    }
                  }
                  
                  // If validation failed, return error immediately so subagent can retry
                  if (toolValidationError) {
                    toolResult = `TOOL_VALIDATION_ERROR: ${toolValidationError}`;
                  } else {

                  // --- File System ---
                  if (allowFileSystem) {
                    if (toolCall.tool === "read_file" && toolCall.args?.file_name) {
                      const fpath = validatePath(currentWorkingDirectory, toolCall.args.file_name);
                      const readContent = await readFile(fpath, "utf-8");
                      toolResult = readContent.length > maxSubAgentToolOutputChars
                        ? `${readContent.substring(0, maxSubAgentToolOutputChars)}\n... (truncated ${readContent.length - maxSubAgentToolOutputChars} chars)`
                        : readContent;
                    } else if (toolCall.tool === "list_directory") {
                      const files = await readdir(currentWorkingDirectory);
                      toolResult = JSON.stringify(files);
                    } else if (toolCall.tool === "save_file") {
                      // Handle batch files (some models return { files: [...] })
                      if (Array.isArray(toolCall.args?.files)) {
                        const savedList = [];
                        for (const fileObj of toolCall.args.files) {
                          const fName = fileObj.file_name || fileObj.name || fileObj.path;
                          const fContent = fileObj.content || fileObj.data;
                          if (fName && fContent) {
                            try {
                              const fpath = validatePath(currentWorkingDirectory, fName);
                              await mkdir(dirname(fpath), { recursive: true });
                              await writeFile(fpath, fContent, "utf-8");
                              filesModified.push(fName);
                              savedList.push(fName);
                            } catch (err: any) {
                              // continue saving others, report error
                            }
                          }
                        }
                        toolResult = savedList.length > 0
                          ? `Success: Saved ${savedList.length} files: ${savedList.join(", ")}`
                          : "Error: No valid files found in batch.";
                      } else {
                        // Handle varying argument names (some models use name/data instead of file_name/content)
                        const fileName = toolCall.args?.file_name || toolCall.args?.name || toolCall.args?.path;
                        const content = toolCall.args?.content || toolCall.args?.data;

                        if (fileName && content) {
                          const fpath = validatePath(currentWorkingDirectory, fileName);
                          await mkdir(dirname(fpath), { recursive: true });
                          await writeFile(fpath, content, "utf-8");
                          toolResult = `Success: File saved to ${fpath}`;
                          filesModified.push(fileName);
                        } else {
                          toolResult = "Error: Missing 'file_name' (or 'name', 'path') or 'content' (or 'data') arguments.";
                        }
                      }
                    } else if (toolCall.tool === "replace_text_in_file" && toolCall.args?.file_name && toolCall.args?.old_string && toolCall.args?.new_string) {
                      const fpath = validatePath(currentWorkingDirectory, toolCall.args.file_name);
                      const content = await readFile(fpath, "utf-8");
                      if (!content.includes(toolCall.args.old_string)) {
                        toolResult = "Error: 'old_string' not found exactly.";
                      } else {
                        const count = content.split(toolCall.args.old_string).length - 1;
                        if (count > 1) {
                          toolResult = `Error: Found ${count} occurrences. Be more specific.`;
                        } else {
                          await writeFile(fpath, content.replace(toolCall.args.old_string, toolCall.args.new_string), "utf-8");
                          toolResult = "Success: Text replaced.";
                          filesModified.push(toolCall.args.file_name);
                        }
                      }
                    } else if (toolCall.tool === "delete_files_by_pattern" && toolCall.args?.pattern) {
                      if (toolCall.args.pattern.length > 100) throw new Error("Pattern too complex");
                      const regex = new RegExp(toolCall.args.pattern);

                      // ReDoS check
                      const start = Date.now();
                      regex.test("safe_test_string_for_redos_check_1234567890_safe_test_string_for_redos_check_1234567890");
                      if (Date.now() - start > 100) throw new Error("Pattern too complex/slow");

                      const files = await readdir(currentWorkingDirectory);
                      const deleted = [];
                      for (const file of files) {
                        if (regex.test(file)) {
                          const fpath = validatePath(currentWorkingDirectory, file);
                          await rm(fpath, { force: true });
                          deleted.push(file);
                        }
                      }
                      toolResult = `Deleted ${deleted.length} files: ${deleted.join(", ")}`;
                    } else if (toolCall.tool === "rag_local_files") {
                      // simplified inline rag mock for brevity in this refactor
                      toolResult = "Local RAG available (mocked for refactor).";
                    } else if (toolCall.tool === "fuzzy_find_local_files" && toolCall.args?.query) {
                      const targetDir = validatePath(currentWorkingDirectory, toolCall.args?.path || ".");
                      const maxResults = Math.min(Math.max(Number(toolCall.args?.max_results ?? 5), 1), 20);
                      const entries = await readdir(targetDir, { recursive: true, withFileTypes: true });
                      const files = entries
                        .filter(entry => entry.isFile())
                        .map(entry => relative(targetDir, join(entry.path, entry.name)).replace(/\\/g, "/"));
                      const ranked = rankFuzzyMatches(toolCall.args.query, files, maxResults);
                      toolResult = JSON.stringify(ranked.map(item => ({ path: item.value, score: item.score })));
                    }
                  }
                  // --- Web ---
                  if (allowWeb && !toolResult) {
                    if (toolCall.tool === "wikipedia_search") toolResult = "Wiki Search (mocked)";
                    else if (toolCall.tool === "web_search" || toolCall.tool === "duckduckgo_search") {
                      const { search, SafeSearchType } = await import("duck-duck-scrape");
                      const r = await search(toolCall.args.query, { safeSearch: SafeSearchType.OFF });
                      toolResult = JSON.stringify(r.results.slice(0, 3));
                    }
                    else if (toolCall.tool === "fetch_web_content" && toolCall.args?.url) {
                      const res = await fetch(toolCall.args.url);
                      toolResult = (await res.text()).substring(0, 5000);
                    } else if (allowSubAgentBrowserControl && allowBrowserControl && toolCall.tool === "browser_session_open" && toolCall.args?.url) {
                      if (browserSession) {
                        await browserSession.browser.close().catch(() => { });
                        browserSession = null;
                      }
                      const puppeteer = await import("puppeteer");
                      const browser = await puppeteer.launch({
                        headless: true,
                        args: ["--no-sandbox", "--disable-setuid-sandbox"],
                      });
                      const page = await browser.newPage();
                      await page.goto(toolCall.args.url, { waitUntil: "networkidle0", timeout: 30000 });
                      if (toolCall.args.wait_for_selector) {
                        await page.waitForSelector(toolCall.args.wait_for_selector, { timeout: 15000 });
                      }
                      browserSession = { browser, page, currentUrl: page.url() };
                      const includePageText = toolCall.args.include_page_text !== false;
                      const pageText = includePageText ? await page.evaluate(() => document.body.innerText || "") : undefined;
                      toolResult = JSON.stringify({
                        session_active: true,
                        url: page.url(),
                        title: await page.title(),
                        text_content: pageText,
                        text_length: pageText ? pageText.length : 0,
                      });
                    } else if (allowSubAgentBrowserControl && allowBrowserControl && toolCall.tool === "browser_session_control") {
                      if (!browserSession) {
                        toolResult = "Error: No active browser session.";
                      } else {
                        const beforeUrl = browserSession.page.url();
                        const actionLog = await executeBrowserActions(browserSession.page, toolCall.args?.actions || []);
                        const afterUrl = browserSession.page.url();
                        const urlChanged = beforeUrl !== afterUrl;
                        browserSession.currentUrl = afterUrl;

                        let fuzzyResults: Array<{ text: string; selector: string; score: number }> = [];
                        if (toolCall.args?.fuzzy_find) {
                          const maxResults = Math.min(Math.max(Number(toolCall.args?.max_results ?? 5), 1), 20);
                          const candidates = await browserSession.page.evaluate(() => {
                            const dedup = new Map<string, { text: string; selector: string }>();
                            const nodes = document.querySelectorAll("a,button,input,textarea,select,[role='button'],[aria-label],h1,h2,h3,h4,h5,h6,p,span");
                            const clean = (value: string) => value.replace(/\s+/g, " ").trim();
                            const classSelector = (el: Element) => {
                              const classes = Array.from(el.classList).slice(0, 2).map(c => c.replace(/[^a-zA-Z0-9_-]/g, ""));
                              return classes.length > 0 ? `.${classes.join(".")}` : "";
                            };
                            const buildSelector = (el: Element) => {
                              if ((el as HTMLElement).id) return `#${(el as HTMLElement).id}`;
                              const name = el.getAttribute("name");
                              if (name) return `${el.tagName.toLowerCase()}[name="${CSS.escape(name)}"]`;
                              return `${el.tagName.toLowerCase()}${classSelector(el)}`;
                            };
                            for (const node of nodes) {
                              const element = node as HTMLElement;
                              const text = clean(
                                element.innerText ||
                                (element as HTMLInputElement).value ||
                                element.getAttribute("aria-label") ||
                                "",
                              );
                              if (!text) continue;
                              const selector = buildSelector(element);
                              const key = `${text}||${selector}`;
                              if (!dedup.has(key)) dedup.set(key, { text: text.substring(0, 200), selector });
                              if (dedup.size >= 400) break;
                            }
                            return Array.from(dedup.values());
                          });
                          fuzzyResults = candidates
                            .map(candidate => ({
                              ...candidate,
                              score: Math.max(
                                rankFuzzyMatches(toolCall.args.fuzzy_find, [candidate.text], 1)[0]?.score ?? 0,
                                rankFuzzyMatches(toolCall.args.fuzzy_find, [candidate.selector], 1)[0]?.score ?? 0,
                              ),
                            }))
                            .sort((a, b) => b.score - a.score)
                            .slice(0, maxResults);
                        }

                        const output: Record<string, unknown> = {
                          session_active: true,
                          actions_executed: actionLog,
                          url: afterUrl,
                          url_changed: urlChanged,
                          url_change_notice: urlChanged ? `Url changed to -> [${afterUrl}]` : undefined,
                          fuzzy_find_results: fuzzyResults,
                        };
                        if (toolCall.args?.read_page !== false) {
                          const fullRead = toolCall.args?.full_read === true;
                          output.title = await browserSession.page.title();
                          if (urlChanged || fullRead) {
                            const textContent = await browserSession.page.evaluate(() => document.body.innerText || "");
                            output.text_content = textContent;
                            output.text_length = textContent.length;
                          } else {
                            output.note = "Full page text omitted (URL unchanged). Set full_read=true to force full output.";
                          }
                        }
                        if (toolCall.args?.screenshot_path) {
                          const screenshotFilePath = validatePath(currentWorkingDirectory, toolCall.args.screenshot_path);
                          await browserSession.page.screenshot({ path: screenshotFilePath, fullPage: !!toolCall.args?.full_page_screenshot });
                          output.screenshot_saved = true;
                        }
                        toolResult = JSON.stringify(output);
                      }
                    } else if (allowSubAgentBrowserControl && allowBrowserControl && toolCall.tool === "browser_session_close") {
                      if (browserSession) {
                        await browserSession.browser.close().catch(() => { });
                        browserSession = null;
                      }
                      toolResult = JSON.stringify({ session_active: false, message: "Browser session closed." });
                    }
                  }
                  // --- Code ---
                  if (allowCode && !toolResult) {
                    if (toolCall.tool === "run_python") {
                      const res = await originalRunPythonImplementation({ python: toolCall.args.python });
                      toolResult = res.stderr ? `Error: ${res.stderr}` : res.stdout;
                    }
                  }

                  if (!toolResult) toolResult = "Error: Tool not found/allowed.";
                  } // Close the else { block from validation check

                } catch (err: any) { toolResult = `Error: ${err.message}`; }

                msgList.push({ role: "user", content: `Tool Output: ${toolResult}` });
                loops++;
              } else {
                // NO TOOL CALL DETECTED
                const shouldAutoFallbackRead =
                  toolsEnabled &&
                  allowFileSystem &&
                  executedToolCallCount === 0 &&
                  noToolCallCount === 0 &&
                  typeof suggestedReadPath === "string" &&
                  suggestedReadPath.length > 0;

                if (shouldAutoFallbackRead) {
                  try {
                    const autoReadPath = validatePath(currentWorkingDirectory, suggestedReadPath);
                    const autoReadStats = await stat(autoReadPath);
                    if (!autoReadStats.isFile()) {
                      throw new Error(`Not a file: ${autoReadPath}`);
                    }
                    const autoReadContent = await readFile(autoReadPath, "utf-8");
                    const boundedContent = autoReadContent.length > 30000
                      ? `${autoReadContent.substring(0, 30000)}\n... (truncated)`
                      : autoReadContent;

                    if (trimmed.length > 0) {
                      msgList.push({ role: "assistant", content: content });
                    }
                    msgList.push({
                      role: "user",
                      content: `Tool Output: AUTO_FALLBACK read_file(${suggestedReadPath})\n${boundedContent}`,
                    });
                    executedToolCallCount++;
                    loops++;
                    continue;
                  } catch (error) {
                    if (subAgentDebugLogging) {
                      console.log(`[Sub-Agent] Auto fallback read_file failed: ${error instanceof Error ? error.message : String(error)}`);
                    }
                    try {
                      const autoFiles = await readdir(currentWorkingDirectory);
                      const limitedFiles = autoFiles.slice(0, 200);
                      if (trimmed.length > 0) {
                        msgList.push({ role: "assistant", content: content });
                      }
                      msgList.push({
                        role: "user",
                        content: `Tool Output: AUTO_FALLBACK list_directory(.)\n${JSON.stringify(limitedFiles)}`,
                      });
                      executedToolCallCount++;
                      loops++;
                      continue;
                    } catch {
                      // ignore and continue to normal no-tool fallback behavior
                    }
                  }
                }

                // Check for explicit completion phrase or strict loop limit
                const planningLikeText = /(?:\bI(?:'ll| will)\b|\blet me\b|\bnext\b|\bfirst\b)/i.test(trimmed);
                const shouldTreatAsFinalResponse =
                  executedToolCallCount > 0 &&
                  trimmed.length >= 120 &&
                  !planningLikeText;

                if (content.includes("TASK_COMPLETED") || shouldTreatAsFinalResponse || loops >= loopLimit - 1) {
                  break; // Done
                } else {
                  noToolCallCount++;
                  if (content.trim().length > 0) {
                    msgList.push({ role: "assistant", content: content });
                  }

                  let reminder = "SYSTEM NOTICE: You did not call a tool. If you are finished, output 'TASK_COMPLETED'. If not, USE A TOOL now and return a single JSON tool-call object only (no prose).";
                  if (toolsEnabled) {
                    if (allowFileSystem && suggestedReadPath && noToolCallCount <= 3) {
                      const escapedPath = suggestedReadPath.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
                      reminder += `\nSuggested next step: {"tool":"read_file","args":{"file_name":"${escapedPath}"}}`;
                    } else if (allowFileSystem && noToolCallCount <= 3) {
                      reminder += `\nSuggested next step: {"tool":"list_directory","args":{}}`;
                    }
                  }

                  msgList.push({ role: "system", content: reminder });
                  loops++;
                }
              }
            } catch (err: any) { return { error: err.message, filesModified }; }

            // Prevent unbounded memory growth
            if (msgList.length > 20) {
              // Keep system message (index 0) and last 18 messages
              const systemMsg = msgList[0];
              const recentMsgs = msgList.slice(-18);
              msgList.length = 0;
              msgList.push(systemMsg, ...recentMsgs);
            }
          }

          if (finalContent) {
            const extracted = extractHandoffMessage(finalContent);
            finalContent = extracted.response;
            handoffMessage = extracted.handoffMessage || "";
          }

          // --- Auto-Save Logic ---
          if (autoSave && allowFileSystem && finalContent) {
            // Regex matches: ```lang (optional space/newline) code ```
            // Relaxed to not strictly require \n, handling ```html code...
            const codeBlockRegex = /```\s*(\w+)?\s*([\s\S]*?)```/g;
            // Get all matches from the ORIGINAL string
            const matches = Array.from(finalContent.matchAll(codeBlockRegex));
            const processedFiles = new Set<string>();

            // Iterate BACKWARDS to preserve indices for replacement
            for (let i = matches.length - 1; i >= 0; i--) {
              const match = matches[i];
              const fullBlock = match[0];
              const lang = (match[1] || "txt").toLowerCase();
              const code = match[2];
              const index = match.index || 0;

              let handledAsBatch = false;

              // Smart JSON Unpacking
              if (lang === "json") {
                try {
                  const parsed = JSON.parse(code);
                  if (Array.isArray(parsed)) {
                    let extractedCount = 0;
                    for (const item of parsed) {
                      const fName = item.path || item.file_name || item.name;
                      const fContent = item.content || item.data || item.code;

                      if (fName && typeof fName === "string" && fContent && typeof fContent === "string") {
                        const fpath = validatePath(currentWorkingDirectory, fName);
                        await mkdir(dirname(fpath), { recursive: true });
                        await writeFile(fpath, fContent, "utf-8");
                        filesModified.push(fName);
                        processedFiles.add(fName);
                        extractedCount++;
                      }
                    }

                    if (extractedCount > 0) {
                      handledAsBatch = true;
                      const replacement = `\n[System: Successfully extracted and saved ${extractedCount} files from JSON block.]\n`;
                      finalContent = finalContent.slice(0, index) + replacement + finalContent.slice(index + fullBlock.length);
                    }
                  }
                } catch (e) {
                  // Not valid JSON or not the structure we want, fall through to normal save
                }
              }

              if (!handledAsBatch && code.trim().length > 50) {
                // Lookback in the ORIGINAL string (match.input is safe)
                const lookback = finalContent.substring(Math.max(0, index - 500), index);

                // Regex to find filenames like `### src/App.tsx`, `**App.tsx**`, `filename: App.tsx`
                const nameMatch = lookback.match(/(?:`|\*\*|###|filename:|file:)[\s\S]*?([\w\-\/\\.]+\.(?:tsx|ts|jsx|js|html|css|json|md|py|sh|java|rs|go|sql|yaml|yml|c|cpp|h|hpp|txt))/i);

                let fileName = "";
                if (nameMatch) {
                  fileName = nameMatch[1].trim();
                }

                // Fallback: Check the first line of the code block for a filename comment
                // e.g. // src/App.tsx or # filename: utils.py
                if (!fileName) {
                  const firstLine = code.split('\n')[0].trim();
                  const commentMatch = firstLine.match(/^(?:\/\/|#|<!--|;)\s*(?:filename:|file:)?\s*([\w\-\/\\.]+\.(?:tsx|ts|jsx|js|html|css|json|md|py|sh|java|rs|go|sql|yaml|yml|c|cpp|h|hpp|txt))/i);
                  if (commentMatch) {
                    fileName = commentMatch[1].trim();
                  }
                }

                // Block Shell/Console snippets from being auto-saved as "auto_gen" files
                // unless there is an EXPLICIT filename match above.
                const isShell = ["bash", "sh", "cmd", "powershell", "console", "zsh", "terminal"].includes(lang);

                if (isShell && !fileName) {
                  continue;
                }

                // If we didn't find a filename, skip saving this block.
                // This prevents "auto_gen" files from cluttering the workspace.
                if (!fileName) {
                  continue;
                }

                // Deduplication: If we already processed this file in this turn, skip saving it again 
                // (or rather, assume the LAST occurrence we are processing is the definitive one, 
                // so we mark it as processed. If we encounter it AGAIN (earlier in text), we skip).
                if (processedFiles.has(fileName)) {
                  continue;
                }

                const fpath = join(currentWorkingDirectory, fileName);

                try {
                  await mkdir(dirname(fpath), { recursive: true });
                  await writeFile(fpath, code, "utf-8");
                  filesModified.push(fileName);
                  processedFiles.add(fileName);

                  // Replace the block in finalContent using string slicing with the original index
                  const replacement = `\n[System: File '${fileName}' created successfully.]\n`;
                  finalContent = finalContent.slice(0, index) + replacement + finalContent.slice(index + fullBlock.length);

                } catch (e) {
                  console.error(`Failed to auto-save file ${fileName}:`, e);
                }
              }
            }
          }



          // --- Auto-Update Project Info ---


          if (filesModified.length > 0 && allowFileSystem) {
            const infoPath = join(currentWorkingDirectory, "beledarian_info.md");
            const timestamp = new Date().toISOString();
            const logEntry = `\n- **[${timestamp}]** Task: "${taskPrompt.substring(0, 50)}..." | Modified: ${filesModified.join(", ")}`;
            try {
              await appendFile(infoPath, logEntry, "utf-8");
            } catch (e) {
              // If append fails, maybe file doesn't exist, try write
              try { await writeFile(infoPath, `# Project History\n${logEntry}`, "utf-8"); } catch (e2) { }
            }
          }

          return { response: finalContent, filesModified, handoff_message: handoffMessage || undefined };
        };

        // --- 1. Primary Agent Loop ---
        const primaryResult = await runAgentLoop(agent_role, task, context, 8, false, currentWorkingDirectory);
        if (primaryResult.error) return { error: primaryResult.error };

        finalResponse = primaryResult.response || "";
        handoffMessage = primaryResult.handoff_message;
        const generatedFiles = [...primaryResult.filesModified];

        // --- 2. Auto-Debug Loop ---
        if (debugMode && primaryResult.filesModified.length > 0) {
          const filesToCheck = primaryResult.filesModified.join(", ");
          const debugTask = `Review the code in these files: ${filesToCheck}. Check for bugs, syntax errors, or logic flaws. If you find any, use 'save_file' to FIX them. If they are correct, confirm it.`;

          // Read content of modified files to pass as context
          let debugContext = "Here is the content of the created files:\n";
          for (const f of primaryResult.filesModified) {
            try {
              const c = await readFile(join(currentWorkingDirectory, f), "utf-8");
              debugContext += `\n--- ${f} ---\n${c}\n`;
            } catch (e) { }
          }

          const debugResult = await runAgentLoop("reviewer", debugTask, debugContext, 5, true, currentWorkingDirectory);

          finalResponse += "\n\n--- Auto-Debug Report ---\n" + (debugResult.response || "Debug pass completed.");
          if (debugResult.filesModified.length > 0) {
            finalResponse += `\n(The reviewer fixed these files: ${debugResult.filesModified.join(", ")})`;
          }
          if (!handoffMessage && debugResult.handoff_message) {
            handoffMessage = debugResult.handoff_message;
          }
        }

        // Append generated file list for Main Agent visibility
        if (primaryResult.filesModified.length > 0) {
          const fullPaths = primaryResult.filesModified.map(f => {
            if (isAbsolute(f)) return f;
            return join(currentWorkingDirectory, f);
          });
          finalResponse += `\n\n[GENERATED_FILES]: ${fullPaths.join(", ")}`;

          if (showFullCode) {
            finalResponse += `\n\n### Generated Code Content:\n`;
            for (const f of primaryResult.filesModified) {
              try {
                const fpath = isAbsolute(f) ? f : join(currentWorkingDirectory, f);
                const content = await readFile(fpath, "utf-8");
                const ext = f.split('.').pop() || 'txt';
                finalResponse += `\n**${f}**\n\`\`\`${ext}\n${content}\n\`\`\`\n`;
              } catch (e) { }
            }
          }
        }

        // Only hide code blocks when files were actually saved.
        // If nothing was written to disk, leave the raw response intact so the primary agent
        // can see what the sub-agent actually did (or didn't do) rather than being misled
        // by a false "code has been handled" success message.
        if (!showFullCode && primaryResult.filesModified.length > 0) {
          finalResponse = finalResponse.replace(/```[\s\S]*?```/g, "\n[System: Code Block Hidden for Brevity. The code has been handled/saved by the sub-agent. Do NOT request it again. Proceed.]\n");
        }

        return { response: finalResponse, generated_files: generatedFiles, handoff_message: handoffMessage };
      },
      enableSecondary,
      "consult_secondary_agent"
    )
  });
  tools.push(consultSecondaryAgentTool);


  // --- Issue #13: Enhanced File Editing Tools ---

  const insertAtLineTool = tool({
    name: "insert_at_line",
    description: text`
      Insert content at a specific line number in a file. 
      The line_number is 1-indexed (line 1 is the first line).
      Existing content at that line and below will be pushed down.
    `,
    parameters: {
      file_name: z.string(),
      line_number: z.number().int().min(1).describe("The line number to insert at (1-indexed)"),
      content_to_insert: z.string().describe("The text content to insert at the specified line"),
    },
    implementation: async ({ file_name, line_number, content_to_insert }) => {
      try {
        const filePath = validatePath(currentWorkingDirectory, file_name);
        let content = "";
        try {
          content = await readFile(filePath, "utf-8");
        } catch {
          if (line_number !== 1) {
            return { error: `File '${file_name}' does not exist. Can only insert at line 1 in a new file.` };
          }
        }
        
        const lines = content.split("\n");
        const insertIndex = Math.min(line_number - 1, lines.length);
        lines.splice(insertIndex, 0, content_to_insert);
        
        await writeFile(filePath, lines.join("\n"), "utf-8");
        return { 
          success: true, 
          message: `Inserted ${content_to_insert.split('\n').length} line(s) at line ${line_number} in ${file_name}`,
          new_line_count: lines.length 
        };
      } catch (e) {
        return { error: `Failed to insert text: ${e instanceof Error ? e.message : String(e)}` };
      }
    },
  });
  tools.push(insertAtLineTool);

  const appendFileTool = tool({
    name: "append_file",
    description: text`
      Append content to the end of a file. 
      If the file doesn't exist, it will be created.
      Useful for adding logs, entries, or building files incrementally.
    `,
    parameters: {
      file_name: z.string(),
      content: z.string().describe("The text content to append to the file"),
    },
    implementation: async ({ file_name, content }) => {
      try {
        const filePath = validatePath(currentWorkingDirectory, file_name);
        await mkdir(dirname(filePath), { recursive: true });
        await appendFile(filePath, content, "utf-8");
        return { 
          success: true, 
          message: `Content appended to ${file_name}` 
        };
      } catch (e) {
        return { error: `Failed to append to file: ${e instanceof Error ? e.message : String(e)}` };
      }
    },
  });
  tools.push(appendFileTool);

  const readFileRangeTool = tool({
    name: "read_file_range",
    description: text`
      Read a specific range of lines from a file. 
      Returns the content with line numbers for easy reference.
      Line numbers are 1-indexed (line 1 is the first line).
    `,
    parameters: {
      file_name: z.string(),
      start_line: z.number().int().min(1).describe("Starting line number (1-indexed)"),
      end_line: z.number().int().min(1).describe("Ending line number (1-indexed, inclusive)"),
    },
    implementation: async ({ file_name, start_line, end_line }) => {
      try {
        const filePath = validatePath(currentWorkingDirectory, file_name);
        const content = await readFile(filePath, "utf-8");
        const lines = content.split("\n");
        
        if (start_line > lines.length) {
          return { error: `Start line ${start_line} is beyond the end of the file (${lines.length} lines)` };
        }
        
        const actualEndLine = Math.min(end_line, lines.length);
        const selectedLines = lines.slice(start_line - 1, actualEndLine);
        
        const numberedContent = selectedLines.map((line, idx) => 
          `${start_line + idx}: ${line}`
        ).join("\n");
        
        return {
          file_name: file_name,
          start_line: start_line,
          end_line: actualEndLine,
          line_count: selectedLines.length,
          content_with_line_numbers: numberedContent,
        };
      } catch (e) {
        return { error: `Failed to read file range: ${e instanceof Error ? e.message : String(e)}` };
      }
    },
  });
  tools.push(readFileRangeTool);

  const searchInFileTool = tool({
    name: "search_in_file",
    description: text`
      Search for a pattern within a single file (grep-like functionality).
      Returns matching lines with their line numbers.
      The pattern can be a simple substring or a regex pattern.
    `,
    parameters: {
      file_name: z.string(),
      pattern: z.string().describe("Search pattern (substring or regex)"),
      case_sensitive: z.boolean().optional().default(false).describe("Whether the search is case-sensitive (default: false)"),
      use_regex: z.boolean().optional().default(false).describe("Whether to treat pattern as a regex (default: false, treats as literal substring)"),
    },
    implementation: async ({ file_name, pattern, case_sensitive = false, use_regex = false }) => {
      try {
        const filePath = validatePath(currentWorkingDirectory, file_name);
        const content = await readFile(filePath, "utf-8");
        const lines = content.split("\n");
        
        let matches: Array<{ line_number: number; content: string }> = [];
        
        for (let i = 0; i < lines.length; i++) {
          let line = lines[i];
          let searchPattern = pattern;
          
          if (!case_sensitive) {
            line = line.toLowerCase();
            searchPattern = pattern.toLowerCase();
          }
          
          let isMatch = false;
          if (use_regex) {
            try {
              const regex = new RegExp(searchPattern);
              isMatch = regex.test(line);
            } catch (e) {
              return { error: `Invalid regex pattern: ${e instanceof Error ? e.message : String(e)}` };
            }
          } else {
            isMatch = line.includes(searchPattern);
          }
          
          if (isMatch) {
            matches.push({
              line_number: i + 1,
              content: lines[i],
            });
          }
        }
        
        return {
          file_name: file_name,
          pattern: pattern,
          match_count: matches.length,
          matches: matches.slice(0, 100),
          note: matches.length > 100 ? `Showing first 100 of ${matches.length} matches` : undefined,
        };
      } catch (e) {
        return { error: `Failed to search file: ${e instanceof Error ? e.message : String(e)}` };
      }
    },
  });
  tools.push(searchInFileTool);


  const deleteLinesInFileTool = tool({
    name: "delete_lines_in_file",
    description: text`
      Delete a specific line or range of lines from a file.
      Line numbers are 1-indexed (line 1 is the first line).
      If end_line is omitted, only start_line will be deleted.
    `,
    parameters: {
      file_name: z.string(),
      start_line: z.number().int().min(1).describe("The starting line number to delete (1-indexed)"),
      end_line: z.number().int().min(1).optional().describe("Optional: The ending line number to delete (inclusive). If omitted, only deletes start_line."),
    },
    implementation: async ({ file_name, start_line, end_line }) => {
      try {
        const filePath = validatePath(currentWorkingDirectory, file_name);
        let content = "";
        try {
          content = await readFile(filePath, "utf-8");
        } catch {
          return { error: `File '${file_name}' does not exist.` };
        }

        const lines = content.split("\n");
        const actualEndLine = end_line ?? start_line;

        if (start_line > lines.length) {
          return { error: `Start line ${start_line} is beyond the end of the file (${lines.length} lines)` };
        }

        const deleteCount = Math.min(actualEndLine - start_line + 1, lines.length - start_line + 1);
        
        if (deleteCount <= 0) {
          return { error: `Invalid line range. End line must be >= Start line.` };
        }

        lines.splice(start_line - 1, deleteCount);

        await writeFile(filePath, lines.join("\n"), "utf-8");
        return { 
          success: true, 
          message: `Deleted ${deleteCount} line(s) (lines ${start_line}-${actualEndLine}) from ${file_name}`,
          new_line_count: lines.length 
        };
      } catch (e) {
        return { error: `Failed to delete lines: ${e instanceof Error ? e.message : String(e)}` };
      }
    },
  });
  tools.push(deleteLinesInFileTool);

  if (allowGitHubTools) {
  // --- GitHub CLI (gh) Tools ---
  
  const checkGhInstalled = async (): Promise<boolean | string> => {
    try {
      const cmd = process.platform === 'win32' ? 'where gh' : 'which gh';
      const child = spawn(cmd, [], { shell: true });
      await new Promise((resolve) => child.on('close', resolve));
      return true;
    } catch (e) {
      return "GitHub CLI ('gh') is not installed. Please ask the user to install it from https://cli.github.com/";
    }
  };

  const ghAuthTool = tool({
    name: "gh_auth",
    description: "Check GitHub authentication status. If not authenticated, opens a terminal window for the user to sign in.",
    parameters: {},
    implementation: async () => {
      const isInstalled = await checkGhInstalled();
      if (typeof isInstalled === 'string') return { error: isInstalled };

      try {
        // Check status first
        const statusChild = spawn("gh auth status", [], { shell: true });
        let stderr = "";
        statusChild.stderr.on("data", d => stderr += d);
        await new Promise((resolve) => statusChild.on('close', resolve));

        if (statusChild.exitCode === 0) {
          return { success: true, message: "Already authenticated with GitHub." };
        } else {
          // Open terminal for login
          const escapedDir = currentWorkingDirectory.replace(/"/g, '""');
          const shellCommand = `start "" /D "${escapedDir}" cmd.exe /k "gh auth login --git-protocol=https & exit"`;
          spawn("cmd.exe", ["/c", shellCommand], { detached: true, stdio: "ignore" });
          return { success: true, message: "Opened a terminal window for GitHub authentication. Please sign in there." };
        }
      } catch (e) {
        return { error: `Auth check failed: ${e instanceof Error ? e.message : String(e)}` };
      }
    },
  });
  tools.push(ghAuthTool);

  const ghCreateIssueTool = tool({
    name: "gh_create_issue",
    description: "Create a new GitHub issue in the current repository.",
    parameters: {
      title: z.string(),
      body: z.string().optional(),
      labels: z.array(z.string()).optional(),
    },
    implementation: async ({ title, body, labels }) => {
      const isInstalled = await checkGhInstalled();
      if (typeof isInstalled === 'string') return { error: isInstalled };

      try {
        let bodyFileArg = "";
        let tempFilePath = "";
        
        if (body) {
          tempFilePath = join(currentWorkingDirectory, `gh_issue_body_${Date.now()}.md`);
          await writeFile(tempFilePath, body, "utf-8");
          bodyFileArg = `--body-file "${tempFilePath}"`;
        }

        const labelsStr = labels ? labels.map(l => `-l "${l}"`).join(" ") : "";
        const cmd = `gh issue create --title "${title.replace(/"/g, '\\"')}" ${bodyFileArg} ${labelsStr}`;
        
        const child = spawn(cmd, [], { shell: true });
        let stdout = "", stderr = "";
        child.stdout.on("data", d => stdout += d);
        child.stderr.on("data", d => stderr += d);
        await new Promise((resolve) => child.on('close', resolve));

        if (tempFilePath) await rm(tempFilePath, { force: true });

        if (child.exitCode === 0) return { success: true, url: stdout.trim() };
        return { error: `Failed to create issue: ${stderr}` };
      } catch (e) {
        return { error: `Create issue failed: ${e instanceof Error ? e.message : String(e)}` };
      }
    },
  });
  tools.push(ghCreateIssueTool);

  const ghListIssuesTool = tool({
    name: "gh_list_issues",
    description: "List issues in the current repository.",
    parameters: {
      state: z.enum(["open", "closed"]).optional().default("open"),
      labels: z.array(z.string()).optional(),
      limit: z.number().min(1).max(50).optional().default(10),
    },
    implementation: async ({ state, labels, limit }) => {
      const isInstalled = await checkGhInstalled();
      if (typeof isInstalled === 'string') return { error: isInstalled };

      try {
        const labelsStr = labels ? labels.map(l => `-l "${l}"`).join(" ") : "";
        const cmd = `gh issue list --state ${state} ${labelsStr} --limit ${limit} --json number,title,state,url,labels`;
        
        const child = spawn(cmd, [], { shell: true });
        let stdout = "", stderr = "";
        child.stdout.on("data", d => stdout += d);
        child.stderr.on("data", d => stderr += d);
        await new Promise((resolve) => child.on('close', resolve));

        if (child.exitCode === 0) {
          try { return { issues: JSON.parse(stdout) }; } 
          catch { return { error: "Failed to parse issue list output" }; }
        }
        return { error: `List issues failed: ${stderr}` };
      } catch (e) {
        return { error: `List issues failed: ${e instanceof Error ? e.message : String(e)}` };
      }
    },
  });
  tools.push(ghListIssuesTool);

  const ghViewCommentsTool = tool({
    name: "gh_view_comments",
    description: "View comments on a specific issue or pull request.",
    parameters: {
      number: z.number().describe("The issue or PR number"),
      type: z.enum(["issue", "pr"]).default("issue").describe("Whether it's an issue or a pull request"),
    },
    implementation: async ({ number, type }) => {
      const isInstalled = await checkGhInstalled();
      if (typeof isInstalled === 'string') return { error: isInstalled };

      try {
        // Fallback to standard gh command for reliable JSON parsing of comments
        const cmd = type === "issue" 
          ? `gh issue view ${number} --json comments` 
          : `gh pr view ${number} --json comments`;

        const child = spawn(cmd, [], { shell: true });
        let stdout = "", stderr = "";
        child.stdout.on("data", d => stdout += d);
        child.stderr.on("data", d => stderr += d);
        await new Promise((resolve) => child.on('close', resolve));

        if (child.exitCode === 0) {
          try { 
            const data = JSON.parse(stdout);
            return { comments: data.comments || [] }; 
          } catch { return { raw_output: stdout }; }
        }
        return { error: `View comments failed: ${stderr}` };
      } catch (e) {
        return { error: `View comments failed: ${e instanceof Error ? e.message : String(e)}` };
      }
    },
  });
  tools.push(ghViewCommentsTool);

  const ghCreatePrTool = tool({
    name: "gh_create_pr",
    description: "Create a new pull request in the current repository.",
    parameters: {
      title: z.string(),
      body: z.string().optional(),
      head_branch: z.string().describe("The branch containing your changes"),
      base_branch: z.string().default("main").describe("The branch you want to merge into (e.g., main, master)"),
    },
    implementation: async ({ title, body, head_branch, base_branch }) => {
      const isInstalled = await checkGhInstalled();
      if (typeof isInstalled === 'string') return { error: isInstalled };

      try {
        let bodyFileArg = "";
        let tempFilePath = "";
        
        if (body) {
          tempFilePath = join(currentWorkingDirectory, `gh_pr_body_${Date.now()}.md`);
          await writeFile(tempFilePath, body, "utf-8");
          bodyFileArg = `--body-file "${tempFilePath}"`;
        }

        const cmd = `gh pr create --title "${title.replace(/"/g, '\\"')}" --head ${head_branch} --base ${base_branch} ${bodyFileArg}`;
        
        const child = spawn(cmd, [], { shell: true });
        let stdout = "", stderr = "";
        child.stdout.on("data", d => stdout += d);
        child.stderr.on("data", d => stderr += d);
        await new Promise((resolve) => child.on('close', resolve));

        if (tempFilePath) await rm(tempFilePath, { force: true });

        if (child.exitCode === 0) return { success: true, url: stdout.trim() };
        return { error: `Failed to create PR: ${stderr}` };
      } catch (e) {
        return { error: `Create PR failed: ${e instanceof Error ? e.message : String(e)}` };
      }
    },
  });
  tools.push(ghCreatePrTool);

  const ghListPrsTool = tool({
    name: "gh_list_prs",
    description: "List pull requests in the current repository.",
    parameters: {
      state: z.enum(["open", "closed"]).optional().default("open"),
      limit: z.number().min(1).max(50).optional().default(10),
    },
    implementation: async ({ state, limit }) => {
      const isInstalled = await checkGhInstalled();
      if (typeof isInstalled === 'string') return { error: isInstalled };

      try {
        const cmd = `gh pr list --state ${state} --limit ${limit} --json number,title,state,url,headRefName,baseRefName`;
        
        const child = spawn(cmd, [], { shell: true });
        let stdout = "", stderr = "";
        child.stdout.on("data", d => stdout += d);
        child.stderr.on("data", d => stderr += d);
        await new Promise((resolve) => child.on('close', resolve));

        if (child.exitCode === 0) {
          try { return { pull_requests: JSON.parse(stdout) }; } 
          catch { return { error: "Failed to parse PR list output" }; }
        }
        return { error: `List PRs failed: ${stderr}` };
      } catch (e) {
        return { error: `List PRs failed: ${e instanceof Error ? e.message : String(e)}` };
      }
    },
  });
  tools.push(ghListPrsTool);

  const ghViewPrDiffTool = tool({
    name: "gh_view_pr_diff",
    description: "Fetch the diff/patch of a specific pull request.",
    parameters: {
      number: z.number().describe("The PR number"),
    },
    implementation: async ({ number }) => {
      const isInstalled = await checkGhInstalled();
      if (typeof isInstalled === 'string') return { error: isInstalled };

      try {
        const cmd = `gh pr diff ${number}`;
        
        const child = spawn(cmd, [], { shell: true });
        let stdout = "", stderr = "";
        child.stdout.on("data", d => stdout += d);
        child.stderr.on("data", d => stderr += d);
        await new Promise((resolve) => child.on('close', resolve));

        if (child.exitCode === 0) {
          return { diff: stdout.substring(0, 50000) + (stdout.length > 50000 ? "\n... (truncated)" : "") };
        }
        return { error: `Fetch PR diff failed: ${stderr}` };
      } catch (e) {
        return { error: `Fetch PR diff failed: ${e instanceof Error ? e.message : String(e)}` };
      }
    },
  });
  tools.push(ghViewPrDiffTool);

  const ghPushTool = tool({
    name: "gh_push",
    description: "Push local commits to the remote GitHub repository.",
    parameters: {
      branch: z.string().optional().describe("Optional: The branch to push. Defaults to current branch."),
    },
    implementation: async ({ branch }) => {
      const isInstalled = await checkGhInstalled();
      if (typeof isInstalled === 'string') return { error: isInstalled };

      try {
        const cmd = branch ? `git push origin ${branch}` : "git push";
        
        const child = spawn(cmd, [], { shell: true });
        let stdout = "", stderr = "";
        child.stdout.on("data", d => stdout += d);
        child.stderr.on("data", d => stderr += d);
        await new Promise((resolve) => child.on('close', resolve));

        if (child.exitCode === 0) return { success: true, message: "Pushed successfully." };
        return { error: `Git push failed: ${stderr}` };
      } catch (e) {
        return { error: `Git push failed: ${e instanceof Error ? e.message : String(e)}` };
      }
    },
  });
  tools.push(ghPushTool);

} // End of if (allowGitHubTools)



  return tools;
}
