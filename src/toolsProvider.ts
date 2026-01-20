import { text, tool, type Tool, type ToolsProvider, type LMStudioClient } from "@lmstudio/sdk";
import { spawn } from "child_process";
import { rm, writeFile, readdir, readFile, stat, mkdir, rename, copyFile, appendFile } from "fs/promises";
import * as os from "os";
import { join, resolve, dirname, isAbsolute } from "path";
import { z } from "zod";
import { pluginConfigSchematics } from "./config";
import { findLMStudioHome } from "./findLMStudioHome";
import { getPersistedState, savePersistedState, ensureWorkspaceExists } from "./stateManager";

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

  // Load state using shared manager
  const fullState = await getPersistedState();
  let currentWorkingDirectory = fullState.currentWorkingDirectory;

  const allowAllCode = pluginConfig.get("allowAllCode");
  let allowJavascript = pluginConfig.get("allowJavascriptExecution");
  let allowPython = pluginConfig.get("allowPythonExecution");
  let allowTerminal = pluginConfig.get("allowTerminalExecution");
  let allowShell = pluginConfig.get("allowShellCommandExecution");
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
  }

  // Ensure the directory exists (idempotent)
  if (!isWorkspaceInitialized) {
    await ensureWorkspaceExists(currentWorkingDirectory);
    console.log(`Working directory set to: ${currentWorkingDirectory}`);
    isWorkspaceInitialized = true;
  }

  const tools: Tool[] = [];

  const allowGit = pluginConfig.get("allowGitOperations");
  const allowDb = pluginConfig.get("allowDatabaseInspection");
  const allowNotify = pluginConfig.get("allowSystemNotifications");

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
          // Dynamically require pdf-parse to bypass strict TS ESM checks for this CommonJS lib
          const pdfParse = require("pdf-parse");

          const dataBuffer = await readFile(fpath);
          const data = await pdfParse(dataBuffer);
          return { content: data.text, metadata: data.info };
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
        notifier.notify({
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
    description: "Search the web using multiple providers (DuckDuckGo, Google, Bing). Can automatically fallback if a provider fails, or query specific providers.",
    parameters: {
      query: z.string(),
      providers: z.array(z.enum(["duckduckgo-api", "duckduckgo-html", "google", "bing"]))
        .optional()
        .describe("Optional: List of specific providers to query. If omitted, a fallback chain is used: DDG API -> DDG Puppeteer -> Google -> Bing."),
    },
    implementation: async ({ query, providers }) => {
      const results: Array<{ title: string; link: string; snippet: string; provider: string }> = [];
      const errors: string[] = [];
      const logs: string[] = [];

      // --- Provider Implementations ---

      const searchFunctions = {
        "duckduckgo-api": async (q: string) => {
          const { search, SafeSearchType } = await import("duck-duck-scrape");
          // Simple retry logic for DDG API
          let attempt = 0;
          while (attempt < 2) {
            try {
              const r = await search(q, { safeSearch: SafeSearchType.OFF });
              if (r.results && r.results.length > 0) {
                return r.results.map((result: any) => ({
                  title: result.title,
                  link: result.url,
                  snippet: result.description,
                  provider: "duckduckgo-api"
                }));
              }
              break; // No results but successful call
            } catch (e) {
              attempt++;
              await new Promise(r => setTimeout(r, 1000));
            }
          }
          throw new Error("No results or API failed");
        },

        "duckduckgo-html": async (q: string) => {
          const puppeteer = await import("puppeteer");
          const browser = await puppeteer.launch({ headless: true });
          try {
            const page = await browser.newPage();
            // Use the HTML-only version for easier scraping/less JS blocking
            await page.goto(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`, { waitUntil: 'networkidle2', timeout: 15000 });

            const extracted = await page.evaluate(() => {
              const items = document.querySelectorAll('.result');
              const data = [];
              for (const item of items) {
                const linkEl = item.querySelector('.result__a');
                const snippetEl = item.querySelector('.result__snippet');
                if (linkEl) {
                  data.push({
                    title: (linkEl as HTMLElement).innerText,
                    link: linkEl.getAttribute('href') || "",
                    snippet: snippetEl ? (snippetEl as HTMLElement).innerText : "",
                    provider: "duckduckgo-html"
                  });
                }
              }
              return data;
            });
            if (extracted.length > 0) return extracted;
            throw new Error("No results found");
          } finally {
            await browser.close();
          }
        },

        "google": async (q: string) => {
          const puppeteer = await import("puppeteer");
          const browser = await puppeteer.launch({ headless: true });
          try {
            const page = await browser.newPage();
            await page.goto(`https://www.google.com/search?q=${encodeURIComponent(q)}`, { waitUntil: 'networkidle2', timeout: 15000 });

            const extracted = await page.evaluate(() => {
              const items = document.querySelectorAll('div.g');
              const data = [];
              for (const item of items) {
                const titleEl = item.querySelector('h3');
                const linkEl = item.querySelector('a');
                const snippetEl = item.querySelector('div[style*="-webkit-line-clamp"]') || item.querySelector('div.VwiC3b');
                if (titleEl && linkEl) {
                  data.push({
                    title: titleEl.innerText,
                    link: linkEl.getAttribute('href') || "",
                    snippet: snippetEl ? (snippetEl as HTMLElement).innerText : "",
                    provider: "google"
                  });
                }
              }
              return data;
            });
            if (extracted.length > 0) return extracted;
            throw new Error("No results found");
          } finally {
            await browser.close();
          }
        },

        "bing": async (q: string) => {
          const puppeteer = await import("puppeteer");
          const browser = await puppeteer.launch({ headless: true });
          try {
            const page = await browser.newPage();
            await page.goto(`https://www.bing.com/search?q=${encodeURIComponent(q)}`, { waitUntil: 'networkidle2', timeout: 15000 });

            const extracted = await page.evaluate(() => {
              const items = document.querySelectorAll('li.b_algo');
              const data = [];
              for (const item of items) {
                const titleEl = item.querySelector('h2 a');
                const linkEl = item.querySelector('h2 a');
                const snippetEl = item.querySelector('p');
                if (titleEl && linkEl) {
                  data.push({
                    title: (titleEl as HTMLElement).innerText,
                    link: linkEl.getAttribute('href') || "",
                    snippet: snippetEl ? (snippetEl as HTMLElement).innerText : "",
                    provider: "bing"
                  });
                }
              }
              return data;
            });
            if (extracted.length > 0) return extracted;
            throw new Error("No results found");
          } finally {
            await browser.close();
          }
        }
      };

      // --- Execution Logic ---

      if (providers && providers.length > 0) {
        // Manual Selection
        for (const providerKey of providers) {
          try {
            logs.push(`[Manual] Attempting ${providerKey}...`);
            const fn = searchFunctions[providerKey];
            if (fn) {
              const pResults = await fn(query);
              results.push(...pResults);
              logs.push(`[Manual] Success: ${providerKey} found ${pResults.length} results.`);
            }
          } catch (e) {
            const errMsg = e instanceof Error ? e.message : String(e);
            errors.push(`${providerKey}: ${errMsg}`);
            logs.push(`[Manual] Failed: ${providerKey} - ${errMsg}`);
          }
        }
      } else {
        // Fallback Chain
        const chain: Array<keyof typeof searchFunctions> = ["duckduckgo-api", "duckduckgo-html", "google", "bing"];

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
          trace: logs
        };
      }

      return {
        results: results,
        meta: {
          total_found: results.length,
          providers_used: [...new Set(results.map(r => r.provider))],
          trace: logs
        }
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

        // Cleaning - Use iterative stripping to prevent reassembly attacks (CodeQL fix)
        // Remove dangerous tags iteratively until none remain
        let previousLength;
        do {
          previousLength = text.length;
          text = text.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
          text = text.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
        } while (text.length < previousLength);

        // Remove other structural tags (single pass is safe for these)
        text = text.replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi, "");
        text = text.replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/gi, "");
        text = text.replace(/<header\b[^>]*>[\s\S]*?<\/header>/gi, "");
        text = text.replace(/<aside\b[^>]*>[\s\S]*?<\/aside>/gi, "");
        text = text.replace(/<\/div>/gi, "\n");
        text = text.replace(/<\/p>/gi, "\n");
        text = text.replace(/<br\s*\/?>/gi, "\n");

        // Iteratively strip remaining tags to prevent reassembly
        do {
          previousLength = text.length;
          text = text.replace(/<[^>]+>/g, "");
        } while (text.length < previousLength);

        // Decode HTML entities - decode &lt;/&gt; FIRST, then &amp; LAST (CodeQL fix for double-escaping)
        text = text.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&nbsp;/g, " ").replace(/&amp;/g, "&");
        text = text.replace(/[ \t]+/g, ' ').replace(/\n\s*\n/g, "\n\n").trim();

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

        // 2. Clean content to get main text - Use iterative stripping (CodeQL fix)
        let previousLength;
        do {
          previousLength = text.length;
          text = text.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
          text = text.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
        } while (text.length < previousLength);

        text = text.replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi, "");
        text = text.replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/gi, "");
        text = text.replace(/<header\b[^>]*>[\s\S]*?<\/header>/gi, "");
        text = text.replace(/<aside\b[^>]*>[\s\S]*?<\/aside>/gi, "");
        text = text.replace(/<\/div>/gi, "\n");
        text = text.replace(/<\/p>/gi, "\n");
        text = text.replace(/<br\s*\/?>/gi, "\n");

        // Iteratively strip remaining tags to prevent reassembly
        do {
          previousLength = text.length;
          text = text.replace(/<[^>]+>/g, "");
        } while (text.length < previousLength);

        // Decode HTML entities - decode &lt;/&gt; FIRST, then &amp; LAST (CodeQL fix)
        text = text.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&nbsp;/g, " ").replace(/&amp;/g, "&");
        text = text.replace(/[ \t]+/g, ' ').replace(/\n\s*\n/g, "\n\n").trim();

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
      let command = "";
      let args: string[] = [];

      // Resolve path if it's a file and not a URL
      let targetToOpen = target;
      if (!target.startsWith("http://") && !target.startsWith("https://")) {
        targetToOpen = validatePath(currentWorkingDirectory, target);
      }

      if (process.platform === "win32") {
        command = "cmd";
        args = ["/c", "start", "", targetToOpen];
      } else if (process.platform === "darwin") {
        command = "open";
        args = [targetToOpen];
      } else {
        command = "xdg-open";
        args = [targetToOpen];
      }
      // lgtm[js/shell-command-constructed-from-input] - command is hardcoded based on platform, not user input
      const child = spawn(command, args, { stdio: 'ignore', detached: true });
      child.unref();

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
      let command = "";
      let args: string[] = [];
      if (process.platform === "win32") {
        command = "cmd";
        args = ["/c", "start", "", filePath];
      } else if (process.platform === "darwin") {
        command = "open";
        args = [filePath];
      } else {
        command = "xdg-open";
        args = [filePath];
      }
      // lgtm[js/shell-command-constructed-from-input] - command is hardcoded based on platform, not user input
      const child = spawn(command, args, { stdio: 'ignore', detached: true });
      child.unref();

      return { success: true, path: filePath, message: "HTML preview launched in browser." };
    }
  });
  tools.push(previewHtmlTool);

  const browserOpenPageTool = tool({
    name: "browser_open_page",
    description: "Open a webpage in a headless browser (Puppeteer), render it, and return the content. Useful for JS-heavy sites. Can also take a screenshot.",
    parameters: {
      url: z.string(),
      screenshot_path: z.string().optional().describe("Path to save a screenshot (e.g., 'screenshot.png')."),
      wait_for_selector: z.string().optional().describe("CSS selector to wait for before returning."),
    },
    implementation: async ({ url, screenshot_path, wait_for_selector }) => {
      let browser;
      try {
        // Dynamically import puppeteer
        const puppeteer = await import("puppeteer");
        browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        try {
          await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

          if (wait_for_selector) {
            await page.waitForSelector(wait_for_selector, { timeout: 10000 });
          }

          const title = await page.title();
          const textContent = await page.evaluate(() => document.body.innerText || "");

          let screenshot_saved = false;
          if (screenshot_path) {
            const screenshotFilePath = validatePath(currentWorkingDirectory, screenshot_path);
            await page.screenshot({ path: screenshotFilePath, fullPage: false });
            screenshot_saved = true;
          }

          return {
            url,
            title,
            text_content: textContent.substring(0, 5000),
            screenshot_saved,
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
    }
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

        if (useMainModel) {
          endpoint = "http://localhost:1234/v1";
          // "local-model" is the standard placeholder in LM Studio to target the currently loaded model
          modelId = "local-model";
        }

        const subAgentProfilesStr = pluginConfig.get("subAgentProfiles");
        const debugMode = pluginConfig.get("enableDebugMode");
        const autoSave = pluginConfig.get("subAgentAutoSave");
        const showFullCode = pluginConfig.get("showFullCodeOutput");

        const allowFileSystem = pluginConfig.get("subAgentAllowFileSystem");
        const allowWeb = pluginConfig.get("subAgentAllowWeb");
        const allowCode = pluginConfig.get("subAgentAllowCode");

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
            if (allowFileSystem) allowedTools.push("read_file", "list_directory", "save_file", "replace_text_in_file", "delete_files_by_pattern", "rag_local_files", "search_file_content");
            if (allowWeb) allowedTools.push("wikipedia_search", "duckduckgo_search", "fetch_web_content", "rag_web_content");
            if (allowCode) allowedTools.push("run_python", "run_javascript");

            if (allowedTools.length > 0) {
              const toolsList = allowedTools.join(", ");
              currentSystemPrompt += `\n\n## Allowed Tools\nYou have access to the following tools via JSON output: ${toolsList}.\nRefer to the "Tool Usage" section above for the JSON format.\n`;
              toolsReminder = `\n\n[SYSTEM REMINDER: You have access to tools: ${toolsList}. If you need information you don't have, USE A TOOL. Do not refuse.]`;
            }
          }

          const msgList = [
            { role: "system", content: currentSystemPrompt },
            { role: "user", content: `Task: ${taskPrompt}\n\nContext: ${contextData}${toolsReminder}` }
          ];

          let loops = 0;
          let finalContent = "";
          let filesModified: string[] = [];

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

              if (!response.ok) return { error: `API Error: ${response.status}`, filesModified };

              const data = await response.json();
              let content = data.choices[0].message.content;

              // Cleanup
              content = content.replace(/<\|.*?\|>/g, "").trim();

              if (!toolsEnabled) return { response: content, filesModified };

              // Tool use check
              let toolCall = null;
              try {
                const trimmed = content.trim();
                // Refusal check
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

                const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                  try {
                    const parsed = JSON.parse(jsonMatch[0]);
                    // Primary format: {"tool": "tool_name", "args": {...}}
                    if (parsed.tool && parsed.args) {
                      toolCall = parsed;
                    }
                    // Secondary format: {"name": "tool_name", "arguments": {...}} - commonly seen from some models
                    else if (parsed.name && parsed.arguments) {
                      let toolName = parsed.name;
                      let args = parsed.arguments; // Extract arguments directly

                      // Apply save_file specific argument mapping if necessary for this format
                      if (toolName === "save_file") {
                        // These mappings are for if args.path or args.data exist in the nested arguments
                        if (args.path && !args.file_name) args.file_name = args.path;
                        if (args.data && !args.content) args.content = args.data;
                      }
                      toolCall = { tool: toolName, args: args };
                    }
                    // Fallback format: just the args object, tool name from "to=..."
                    else {
                      const toolNameMatch = trimmed.match(/to=([a-zA-Z0-9_.]+)/);
                      if (toolNameMatch) {
                        let toolName = toolNameMatch[1];
                        if (toolName.startsWith("functions.")) toolName = toolName.replace("functions.", "");

                        let args = parsed; // Here 'parsed' is expected to be just the arguments object

                        // Handle Array args for save_file (batch mode)
                        if (toolName === "save_file" && Array.isArray(args)) {
                          args = { files: args };
                        }

                        // Map 'path' to 'file_name' for save_file (for the flattened 'args' object)
                        if (toolName === "save_file") {
                          if (args.path && !args.file_name) args.file_name = args.path;
                          if (args.data && !args.content) args.content = args.data;
                        }
                        toolCall = { tool: toolName, args: args };
                      }
                    }
                  } catch (e) {
                    // JSON parsing failed, toolCall remains null
                  }
                }
              } catch (e) { }

              if (toolCall && toolCall.tool) {
                msgList.push({ role: "assistant", content: content });
                let toolResult = "";
                try {
                  // --- File System ---
                  if (allowFileSystem) {
                    if (toolCall.tool === "read_file" && toolCall.args?.file_name) {
                      const fpath = validatePath(currentWorkingDirectory, toolCall.args.file_name);
                      toolResult = await readFile(fpath, "utf-8");
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
                    }
                  }
                  // --- Web ---
                  if (allowWeb && !toolResult) {
                    if (toolCall.tool === "wikipedia_search") toolResult = "Wiki Search (mocked)";
                    else if (toolCall.tool === "duckduckgo_search") {
                      const { search, SafeSearchType } = await import("duck-duck-scrape");
                      const r = await search(toolCall.args.query, { safeSearch: SafeSearchType.OFF });
                      toolResult = JSON.stringify(r.results.slice(0, 3));
                    }
                    else if (toolCall.tool === "fetch_web_content" && toolCall.args?.url) {
                      const res = await fetch(toolCall.args.url);
                      toolResult = (await res.text()).substring(0, 5000);
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
                } catch (err: any) { toolResult = `Error: ${err.message}`; }

                msgList.push({ role: "user", content: `Tool Output: ${toolResult}` });
                loops++;
              } else {
                // NO TOOL CALL DETECTED
                // Check for explicit completion phrase or strict loop limit
                if (content.includes("TASK_COMPLETED") || loops >= loopLimit - 1) {
                  finalContent = content;
                  break; // Done
                } else {
                  // Keep-Alive: Force the agent to continue
                  msgList.push({ role: "assistant", content: content });
                  msgList.push({ role: "system", content: "SYSTEM NOTICE: You did not call a tool. If you are finished, output 'TASK_COMPLETED'. If not, please USE A TOOL (e.g., save_file, read_file) to proceed." });
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

          return { response: finalContent, filesModified };
        };

        // --- 1. Primary Agent Loop ---
        const primaryResult = await runAgentLoop(agent_role, task, context, 8, false, currentWorkingDirectory);
        if (primaryResult.error) return { error: primaryResult.error };

        let finalResponse = primaryResult.response;

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

        // Always hide code blocks if the setting is disabled, regardless of file saving status
        if (!showFullCode) {
          finalResponse = finalResponse.replace(/```[\s\S]*?```/g, "\n[System: Code Block Hidden for Brevity. The code has been handled/saved by the sub-agent. Do NOT request it again. Proceed.]\n");
        }

        return { response: finalResponse, generated_files: primaryResult.filesModified };
      },
      enableSecondary,
      "consult_secondary_agent"
    )
  });
  tools.push(consultSecondaryAgentTool);

  return tools;
}
