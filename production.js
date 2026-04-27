"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// C:/Users/Victor/.lmstudio/extensions/plugins/beledarian/beledarians-lm-studio-tools/src/config.ts
var import_sdk, pluginConfigSchematics;
var init_config = __esm({
  "C:/Users/Victor/.lmstudio/extensions/plugins/beledarian/beledarians-lm-studio-tools/src/config.ts"() {
    "use strict";
    import_sdk = require("@lmstudio/sdk");
    pluginConfigSchematics = (0, import_sdk.createConfigSchematics)().field("retrievalLimit", "numeric", {
      int: true,
      min: 1,
      displayName: "Retrieval Limit",
      subtitle: "When retrieval is triggered, this is the maximum number of chunks to return.",
      slider: { min: 1, max: 10, step: 1 }
    }, 3).field("retrievalAffinityThreshold", "numeric", {
      min: 0,
      max: 1,
      displayName: "Retrieval Affinity Threshold",
      subtitle: "The minimum similarity score for a chunk to be considered relevant.",
      slider: { min: 0, max: 1, step: 0.01 }
    }, 0.5).field("allowJavascriptExecution", "boolean", {
      displayName: "Allow JavaScript Execution",
      subtitle: "Enable the 'run_javascript' tool. DANGER: Code runs on your machine."
    }, false).field("allowPythonExecution", "boolean", {
      displayName: "Allow Python Execution",
      subtitle: "Enable the 'run_python' tool. DANGER: Code runs on your machine."
    }, false).field("allowTerminalExecution", "boolean", {
      displayName: "Allow Terminal Execution",
      subtitle: "Enable the 'run_in_terminal' tool. Opens real terminal windows."
    }, false).field("allowShellCommandExecution", "boolean", {
      displayName: "Allow Shell Command Execution",
      subtitle: "Enable the 'execute_command' tool. DANGER: Commands run on your machine."
    }, false).field("allowGitOperations", "boolean", {
      displayName: "Allow Git Operations",
      subtitle: "Enable git tools (status, commit, diff, log)."
    }, true).field("allowDatabaseInspection", "boolean", {
      displayName: "Allow Database Inspection",
      subtitle: "Enable 'query_database' for SQLite files."
    }, false).field("allowSystemNotifications", "boolean", {
      displayName: "Allow System Notifications",
      subtitle: "Enable the agent to send OS notifications."
    }, true).field("allowAllCode", "boolean", {
      displayName: "Allow All Code Execution",
      subtitle: "MASTER SWITCH: Overrides all other settings to enable ALL execution tools."
    }, false).field("searchApiKey", "string", {
      displayName: "Search API Key",
      subtitle: "Optional API key for search services (if supported) to avoid rate limits."
    }, "").field("embeddingModel", "string", {
      displayName: "Embedding Model",
      subtitle: "Model to use for RAG features (default: nomic-ai/nomic-embed-text-v1.5-GGUF)"
    }, "nomic-ai/nomic-embed-text-v1.5-GGUF").field("enableMemory", "boolean", {
      displayName: "Enable Memory",
      subtitle: "If enabled, the model can save and recall information from a 'memory.md' file in the workspace."
    }, false).field("enableWikipediaTool", "boolean", {
      displayName: "Enable Wikipedia Tool",
      subtitle: "Enable the 'wikipedia_search' tool."
    }, true).field("enableLocalRag", "boolean", {
      displayName: "Enable Local RAG",
      subtitle: "Enable the 'rag_local_files' tool for searching workspace files."
    }, true).field("enableSecondaryAgent", "boolean", {
      displayName: "Enable Secondary Agent/Model",
      subtitle: "Allow the main model to delegate tasks to a secondary model (e.g., for summarization)."
    }, false).field("useMainModelForSubAgent", "boolean", {
      displayName: "Use Main Model as Sub-Agent",
      subtitle: "If enabled, the sub-agent loop will use your main LM Studio server (localhost:1234). Ignores 'Endpoint' setting."
    }, false).field("secondaryAgentEndpoint", "string", {
      displayName: "Secondary Agent Endpoint",
      subtitle: "The API endpoint for the secondary model (e.g., 'http://localhost:1234/v1')."
    }, "http://localhost:1234/v1").field("secondaryModelId", "string", {
      displayName: "Secondary Model ID",
      subtitle: "The ID of the model to use for the secondary agent (must be loaded/available)."
    }, "local-model").field("subAgentProfiles", "string", {
      displayName: "Sub-Agent Profiles (JSON)",
      subtitle: 'Define available sub-agents. Format: {"coder": "You are a coding expert...", ...}'
    }, '{"summarizer": "You are a summarization expert. Summarize the content concisely.", "coder": "You are a software engineer. Write efficient and safe code."}').field("subAgentFrequency", "string", {
      displayName: "Sub-Agent Frequency",
      subtitle: "Controls how often the agent is encouraged to delegate. Options: 'always', 'when_useful', 'hard_tasks', 'never'."
    }, "when_useful").field("subAgentAllowFileSystem", "boolean", {
      displayName: "Sub-Agent: Allow File System",
      subtitle: "If enabled, sub-agents can read/list files."
    }, true).field("subAgentAllowWeb", "boolean", {
      displayName: "Sub-Agent: Allow Web Search",
      subtitle: "If enabled, sub-agents can use Wikipedia and DuckDuckGo."
    }, true).field("subAgentAllowCode", "boolean", {
      displayName: "Sub-Agent: Allow Code Execution",
      subtitle: "If enabled, sub-agents can run Python/JS code. DANGER!"
    }, false).field("enableDebugMode", "boolean", {
      displayName: "Enable Auto-Debug Mode",
      subtitle: "If enabled, coding tasks delegated to sub-agents will automatically trigger a second 'Reviewer' pass to check for errors."
    }, false).field("subAgentAutoSave", "boolean", {
      displayName: "Sub-Agent: Auto-Save Code",
      subtitle: "If enabled, code blocks generated by the sub-agent that aren't explicitly saved will be automatically saved to files."
    }, true).field("showFullCodeOutput", "boolean", {
      displayName: "Show Full Code Output",
      subtitle: "If enabled, the Main Agent will display the full code content of generated files instead of just the file paths."
    }, false).build();
  }
});

// C:/Users/Victor/.lmstudio/extensions/plugins/beledarian/beledarians-lm-studio-tools/src/findLMStudioHome.ts
function findLMStudioHome() {
  if (lmstudioHome !== null) {
    return lmstudioHome;
  }
  const resolvedHomeDir = (0, import_fs.realpathSync)((0, import_os.homedir)());
  const pointerFilePath = (0, import_path.join)(resolvedHomeDir, ".lmstudio-home-pointer");
  if ((0, import_fs.existsSync)(pointerFilePath)) {
    lmstudioHome = (0, import_fs.readFileSync)(pointerFilePath, "utf-8").trim();
    return lmstudioHome;
  }
  const cacheHome = (0, import_path.join)(resolvedHomeDir, ".cache", "lm-studio");
  if ((0, import_fs.existsSync)(cacheHome)) {
    lmstudioHome = cacheHome;
    (0, import_fs.writeFileSync)(pointerFilePath, lmstudioHome, "utf-8");
    return lmstudioHome;
  }
  const home = (0, import_path.join)(resolvedHomeDir, ".lmstudio");
  lmstudioHome = home;
  (0, import_fs.writeFileSync)(pointerFilePath, lmstudioHome, "utf-8");
  return lmstudioHome;
}
var import_fs, import_os, import_path, lmstudioHome;
var init_findLMStudioHome = __esm({
  "C:/Users/Victor/.lmstudio/extensions/plugins/beledarian/beledarians-lm-studio-tools/src/findLMStudioHome.ts"() {
    "use strict";
    import_fs = require("fs");
    import_os = require("os");
    import_path = require("path");
    lmstudioHome = null;
  }
});

// C:/Users/Victor/.lmstudio/extensions/plugins/beledarian/beledarians-lm-studio-tools/src/stateManager.ts
async function getPersistedState() {
  try {
    const statePath = (0, import_path2.join)(os.homedir(), ".beledarians-llm-toolbox", CONFIG_FILE_NAME);
    const content = await (0, import_promises.readFile)(statePath, "utf-8");
    const state = JSON.parse(content);
    return {
      currentWorkingDirectory: state.currentWorkingDirectory ?? DEFAULT_DIR,
      messageCount: state.messageCount ?? 0,
      dontAskToCompress: state.dontAskToCompress ?? false,
      subAgentDocsInjected: state.subAgentDocsInjected ?? false
    };
  } catch (error) {
    return {
      currentWorkingDirectory: DEFAULT_DIR,
      messageCount: 0,
      dontAskToCompress: false,
      subAgentDocsInjected: false
    };
  }
}
async function savePersistedState(state) {
  try {
    const statePath = (0, import_path2.join)(os.homedir(), ".beledarians-llm-toolbox", CONFIG_FILE_NAME);
    const dir = (0, import_path2.join)(os.homedir(), ".beledarians-llm-toolbox");
    await (0, import_promises.mkdir)(dir, { recursive: true });
    await (0, import_promises.writeFile)(statePath, JSON.stringify(state, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to save plugin state:", error);
  }
}
async function ensureWorkspaceExists(path) {
  try {
    await (0, import_promises.mkdir)(path, { recursive: true });
  } catch (error) {
    console.error(`Failed to create/access directory ${path}`, error);
  }
}
var import_promises, import_path2, os, CONFIG_FILE_NAME, DEFAULT_DIR;
var init_stateManager = __esm({
  "C:/Users/Victor/.lmstudio/extensions/plugins/beledarian/beledarians-lm-studio-tools/src/stateManager.ts"() {
    "use strict";
    import_promises = require("fs/promises");
    import_path2 = require("path");
    os = __toESM(require("os"));
    CONFIG_FILE_NAME = ".plugin_state.json";
    DEFAULT_DIR = (0, import_path2.join)(os.homedir(), ".beledarians-llm-toolbox", "workspace");
  }
});

// C:/Users/Victor/.lmstudio/extensions/plugins/beledarian/beledarians-lm-studio-tools/src/toolsProvider.ts
function validatePath(baseDir, requestedPath) {
  const resolved = (0, import_path3.resolve)(baseDir, requestedPath);
  const lowerResolved = resolved.toLowerCase();
  const lowerBase = (0, import_path3.resolve)(baseDir).toLowerCase();
  if (!lowerResolved.startsWith(lowerBase)) {
    throw new Error(`Access Denied: Path '${requestedPath}' is outside the workspace.`);
  }
  return resolved;
}
function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
  const magB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
  if (magA === 0 || magB === 0) {
    return 0;
  }
  return dotProduct / (magA * magB);
}
async function performRagOnText(text3, query, client2, embeddingModelName) {
  const embeddingModel = await client2.embedding.model(embeddingModelName);
  const chunks = text3.split(/\n\s*\n/).filter((chunk) => chunk.trim().length > 20);
  if (chunks.length === 0) {
    return [{ chunk: text3.substring(0, 4e3), score: 1 }];
  }
  const [queryEmbedding] = await embeddingModel.embed([query]);
  const chunkEmbeddings = await embeddingModel.embed(chunks);
  const similarities = chunkEmbeddings.map((chunkEmb, i) => ({
    chunk: chunks[i],
    score: cosineSimilarity(queryEmbedding.embedding, chunkEmb.embedding)
  }));
  similarities.sort((a, b) => b.score - a.score);
  return similarities.slice(0, 5);
}
function getDenoPath() {
  const lmstudioHome2 = findLMStudioHome();
  const utilPath = (0, import_path3.join)(lmstudioHome2, ".internal", "utils");
  const denoPath = (0, import_path3.join)(utilPath, process.platform === "win32" ? "deno.exe" : "deno");
  return denoPath;
}
var import_sdk2, import_child_process, import_promises2, os2, import_path3, import_zod, createSafeToolImplementation, isWorkspaceInitialized, toolsProvider;
var init_toolsProvider = __esm({
  "C:/Users/Victor/.lmstudio/extensions/plugins/beledarian/beledarians-lm-studio-tools/src/toolsProvider.ts"() {
    "use strict";
    import_sdk2 = require("@lmstudio/sdk");
    import_child_process = require("child_process");
    import_promises2 = require("fs/promises");
    os2 = __toESM(require("os"));
    import_path3 = require("path");
    import_zod = require("zod");
    init_config();
    init_findLMStudioHome();
    init_stateManager();
    createSafeToolImplementation = (originalImplementation, isEnabled, toolName) => async (params) => {
      if (!isEnabled) {
        throw new Error(`Tool '${toolName}' is disabled in the plugin settings. Please ask the user to enable 'Allow ${toolName.replace(/_/g, " ")}' (or similar) in the settings.`);
      }
      return originalImplementation(params);
    };
    isWorkspaceInitialized = false;
    toolsProvider = async (ctl) => {
      const client2 = ctl.client;
      const pluginConfig = ctl.getPluginConfig(pluginConfigSchematics);
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
      if (allowAllCode) {
        allowJavascript = true;
        allowPython = true;
        allowTerminal = true;
        allowShell = true;
      }
      if (!isWorkspaceInitialized) {
        await ensureWorkspaceExists(currentWorkingDirectory);
        console.log(`Working directory set to: ${currentWorkingDirectory}`);
        isWorkspaceInitialized = true;
      }
      const tools = [];
      const allowGit = pluginConfig.get("allowGitOperations");
      const allowDb = pluginConfig.get("allowDatabaseInspection");
      const allowNotify = pluginConfig.get("allowSystemNotifications");





      if (allowGit) {
        const gitStatusTool = (0, import_sdk2.tool)({
          name: "git_get_status_current",
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





        const gitDiffTool = (0, import_sdk2.tool)({
          name: "git_get_diff",
          description: "Get the git diff of the current repository or specific files.",
          parameters: {
            file_path: import_zod.z.string().optional().describe("Optional: Path to specific file to diff."),
            cached: import_zod.z.boolean().optional().describe("Optional: Show staged changes only (git diff --cached).")
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





        const gitCommitTool = (0, import_sdk2.tool)({
          name: "git_commit_changes_to_repository",
          description: "Commit staged changes to the git repository.",
          parameters: {
            message: import_zod.z.string()
          },
          implementation: async ({ message }) => {
            const { simpleGit } = await import("simple-git");
            const git = simpleGit(currentWorkingDirectory);
            try {
              const result = await git.commit(message);
              return { success: true, summary: result.summary };
            } catch (e) {
              return { error: `Git commit failed: ${e instanceof Error ? e.message : String(e)}` };
            }
          }
        });
        tools.push(gitCommitTool);
        const gitLogTool = (0, import_sdk2.tool)({
          name: "git_log",
          description: "Get recent git commit history.",
          parameters: {
            max_count: import_zod.z.number().optional().describe("Max number of commits to return (default: 10)")
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





      const readDocumentTool = (0, import_sdk2.tool)({
        name: "document_pdf_docx_content_read",
        description: "Read content from PDF or DOCX files.",
        parameters: {
          file_path: import_zod.z.string()
        },
        implementation: async ({ file_path }) => {
          const fpath = validatePath(currentWorkingDirectory, file_path);
          const ext = fpath.split(".").pop()?.toLowerCase();
          try {
            if (ext === "pdf") {
              if (typeof global.DOMMatrix === "undefined") {
                global.DOMMatrix = class DOMMatrix {
                  constructor(arg) {
                    this.a = 1;
                    this.b = 0;
                    this.c = 0;
                    this.d = 1;
                    this.e = 0;
                    this.f = 0;
                    if (Array.isArray(arg)) {
                      this.a = arg[0];
                      this.b = arg[1];
                      this.c = arg[2];
                      this.d = arg[3];
                      this.e = arg[4];
                      this.f = arg[5];
                    }
                  }
                };
              }
              const { PDFParse } = require("pdf-parse");
              const dataBuffer = await (0, import_promises2.readFile)(fpath);
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
        }
      });
      tools.push(readDocumentTool);





      if (allowNotify) {
        const sendNotificationTool = (0, import_sdk2.tool)({
          name: "notification_send",
          description: "Send a system notification to the user.",
          parameters: {
            title: import_zod.z.string(),
            message: import_zod.z.string()
          },
          implementation: async ({ title, message }) => {
            const notifier = await import("node-notifier");
            notifier.notify({
              title,
              message,
              sound: true,
              wait: false
            });
            return { success: true, message: "Notification sent." };
          }
        });
        tools.push(sendNotificationTool);
      }





      if (allowDb) {
        const queryDatabaseTool = (0, import_sdk2.tool)({
          name: "database_sqlite_query_execute",
          description: "Execute a read-only query on a SQLite database file.",
          parameters: {
            db_path: import_zod.z.string(),
            query: import_zod.z.string()
          },
          implementation: async ({ db_path, query }) => {
            const fpath = validatePath(currentWorkingDirectory, db_path);
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





      const analyzeProjectTool = (0, import_sdk2.tool)({
        name: "project_analyze",
        description: "Run project-wide analysis (linting) to find errors and warnings.",
        parameters: {},
        implementation: async () => {
          const packageJsonPath = (0, import_path3.join)(currentWorkingDirectory, "package.json");
          let command = "";
          let type = "unknown";
          try {
            const pkg = JSON.parse(await (0, import_promises2.readFile)(packageJsonPath, "utf-8"));
            if (pkg.scripts && pkg.scripts.lint) {
              command = "npm run lint";
              type = "npm-script";
            } else if (pkg.devDependencies?.eslint || pkg.dependencies?.eslint) {
              command = "npx eslint . --format json";
              type = "eslint";
            }
          } catch (e) {
            const entries = await (0, import_promises2.readdir)(currentWorkingDirectory);
            if (entries.some((f) => f.endsWith(".py"))) {
              command = "pylint .";
              type = "python-lint";
            }
          }
          if (!command) {
            return { error: "Could not detect a supported linter (ESLint script or Python)." };
          }
          try {
            const child = (0, import_child_process.spawn)(command, {
              shell: true,
              cwd: currentWorkingDirectory,
              timeout: 6e4
            });
            let stdout = "";
            let stderr = "";
            child.stdout.on("data", (d) => stdout += d);
            child.stderr.on("data", (d) => stderr += d);
            await new Promise((resolve2) => child.on("close", resolve2));
            return {
              tool: command,
              type,
              report: (stdout + stderr).substring(0, 1e4)
              // Limit size
            };
          } catch (e) {
            return { error: `Analysis failed: ${e instanceof Error ? e.message : String(e)}` };
          }
        }
      });
      tools.push(analyzeProjectTool);





      const changeDirectoryTool = (0, import_sdk2.tool)({
        name: "directory_current_change",
        description: import_sdk2.text`
      Change the current working directory.
      Returns the new current working directory.
    `,
        parameters: {
          directory: import_zod.z.string()
        },
        implementation: async ({ directory }) => {
          const newPath = (0, import_path3.resolve)(currentWorkingDirectory, directory);
          const stats = await (0, import_promises2.stat)(newPath);
          if (!stats.isDirectory()) {
            throw new Error(`Path is not a directory: ${newPath}`);
          }
          currentWorkingDirectory = newPath;
          fullState.currentWorkingDirectory = currentWorkingDirectory;
          await savePersistedState(fullState);
          return {
            previous_directory: (0, import_path3.resolve)(newPath, ".."),
            current_directory: currentWorkingDirectory
          };
        }
      });
      tools.push(changeDirectoryTool);





      const saveMemoryTool = (0, import_sdk2.tool)({
        name: "memory_longterm_save",
        description: import_sdk2.text`
      Save a specific piece of information or fact to long-term memory.
      This information will be available in future interactions if memory is enabled.
      Use this for user preferences, important facts, or context that should persist.
    `,
        parameters: {
          fact: import_zod.z.string().describe("The specific fact or piece of information to remember.")
        },
        implementation: async ({ fact }) => {
          if (!enableMemory) {
            return { error: "Memory is currently disabled in the plugin settings. Please ask the user to enable it." };
          }
          const memoryFile = (0, import_path3.join)(currentWorkingDirectory, "memory.md");
          const timestamp = (/* @__PURE__ */ new Date()).toISOString();
          const entry = `
- [${timestamp}] ${fact}`;
          try {
            await (0, import_promises2.appendFile)(memoryFile, entry, "utf-8");
            return { success: true, message: "Fact saved to memory." };
          } catch (error) {
            try {
              await (0, import_promises2.writeFile)(memoryFile, "# Long-Term Memory\n" + entry, "utf-8");
              return { success: true, message: "Fact saved to memory (new file created)." };
            } catch (writeError) {
              return { error: `Failed to save memory: ${writeError instanceof Error ? writeError.message : String(writeError)}` };
            }
          }
        }
      });
      tools.push(saveMemoryTool);





      const originalRunJavascriptImplementation = async ({ javascript, timeout_seconds }) => {
        const scriptFileName = `temp_script_${Date.now()}.ts`;
        const scriptFilePath = (0, import_path3.join)(currentWorkingDirectory, scriptFileName);
        try {
          await (0, import_promises2.writeFile)(scriptFilePath, javascript, "utf-8");
          const childProcess = (0, import_child_process.spawn)(
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
              scriptFilePath
            ],
            {
              cwd: currentWorkingDirectory,
              timeout: (timeout_seconds ?? 5) * 1e3,
              // Convert seconds to milliseconds
              stdio: "pipe",
              env: {
                NO_COLOR: "true"
                // Disable color output in Deno
              }
            }
          );
          let stdout = "";
          let stderr = "";
          childProcess.stdout.setEncoding("utf-8");
          childProcess.stderr.setEncoding("utf-8");
          childProcess.stdout.on("data", (data) => {
            stdout += data;
          });
          childProcess.stderr.on("data", (data) => {
            stderr += data;
          });
          await new Promise((resolve2, reject) => {
            childProcess.on("close", (code) => {
              if (code === 0) {
                resolve2();
              } else {
                reject(new Error(`Process exited with code ${code}. Stderr: ${stderr}`));
              }
            });
            childProcess.on("error", (err) => {
              reject(err);
            });
          });
          return {
            stdout: stdout.trim(),
            stderr: stderr.trim()
          };
        } finally {
          await (0, import_promises2.rm)(scriptFilePath, { force: true }).catch(() => {
          });
        }
      };





      const createFileTool = (0, import_sdk2.tool)({
        name: "run_javascript",
        description: import_sdk2.text`
      Run a JavaScript code snippet using deno. You cannot import external modules but you have 
      read/write access to the current working directory.

      Pass the code you wish to run as a string in the 'javascript' parameter.

      By default, the code will timeout in 5 seconds. You can extend this timeout by setting the
      'timeout_seconds' parameter to a higher value in seconds, up to a maximum of 60 seconds.

      You will get the stdout and stderr output of the code execution, thus please print the output
      you wish to return using 'console.log' or 'console.error'.
    `,
        parameters: { javascript: import_zod.z.string(), timeout_seconds: import_zod.z.number().min(0.1).max(60).optional() },
        implementation: createSafeToolImplementation(
          originalRunJavascriptImplementation,
          allowJavascript,
          "run_javascript"
        )
      });
      tools.push(createFileTool);
      const originalRunPythonImplementation = async ({ python, timeout_seconds }) => {
        const scriptFileName = `temp_script_${Date.now()}.py`;
        const scriptFilePath = (0, import_path3.join)(currentWorkingDirectory, scriptFileName);
        try {
          await (0, import_promises2.writeFile)(scriptFilePath, python, "utf-8");
          const childProcess = (0, import_child_process.spawn)(
            "python",
            [
              scriptFilePath
            ],
            {
              cwd: currentWorkingDirectory,
              timeout: (timeout_seconds ?? 5) * 1e3,
              // Convert seconds to milliseconds
              stdio: "pipe"
            }
          );
          let stdout = "";
          let stderr = "";
          childProcess.stdout.setEncoding("utf-8");
          childProcess.stderr.setEncoding("utf-8");
          childProcess.stdout.on("data", (data) => {
            stdout += data;
          });
          childProcess.stderr.on("data", (data) => {
            stderr += data;
          });
          await new Promise((resolve2, reject) => {
            childProcess.on("close", (code) => {
              if (code === 0) {
                resolve2();
              } else {
                reject(new Error(`Process exited with code ${code}. Stderr: ${stderr}`));
              }
            });
            childProcess.on("error", (err) => {
              reject(err);
            });
          });
          return {
            stdout: stdout.trim(),
            stderr: stderr.trim()
          };
        } finally {
          await (0, import_promises2.rm)(scriptFilePath, { force: true }).catch(() => {
          });
        }
      };





      const runPythonTool = (0, import_sdk2.tool)({
        name: "run_python",
        description: import_sdk2.text`
      Run a Python code snippet. You cannot import external modules but you have
      read/write access to the current working directory.

      Pass the code you wish to run as a string in the 'python' parameter.

      By default, the code will timeout in 5 seconds. You can extend this timeout by setting the
      'timeout_seconds' parameter to a higher value in seconds, up to a maximum of 60 seconds.

      You will get the stdout and stderr output of the code execution, thus please print the output
      you wish to return using 'print()'.
    `,
        parameters: { python: import_zod.z.string(), timeout_seconds: import_zod.z.number().min(0.1).max(60).optional() },
        implementation: createSafeToolImplementation(
          originalRunPythonImplementation,
          allowPython,
          "run_python"
        )
      });
      tools.push(runPythonTool);





      const saveFileTool = (0, import_sdk2.tool)({
        name: "save_file",
        description: import_sdk2.text`
      Save content to a specified file in the current working directory.
      This tool returns the full path to the saved file. You should then
      output this full path to the user.
    `,
        parameters: {
          file_name: import_zod.z.string(),
          content: import_zod.z.string()
        },
        implementation: async ({ file_name, content }) => {
          if (!file_name || file_name.trim().length === 0) {
            return { error: "Filename cannot be empty" };
          }
          if (/[ \*\?<>|"]/.test(file_name)) {
            return { error: "Filename contains invalid characters" };
          }
          const filePath = validatePath(currentWorkingDirectory, file_name);
          await (0, import_promises2.mkdir)((0, import_path3.dirname)(filePath), { recursive: true });
          await (0, import_promises2.writeFile)(filePath, content, "utf-8");
          return {
            success: true,
            path: filePath
          };
        }
      });
      tools.push(saveFileTool);





      const replaceTextTool = (0, import_sdk2.tool)({
        name: "file_replace_text_within",
        description: import_sdk2.text`
      Replace a specific string in a file with a new string. 
      Useful for making small edits without rewriting the entire file.
      Ensure 'old_string' matches exactly (including whitespace) or the replace will fail.
    `,
        parameters: {
          file_name: import_zod.z.string(),
          old_string: import_zod.z.string().describe("The exact text to replace. Must be unique in the file."),
          new_string: import_zod.z.string().describe("The text to insert in place of old_string.")
        },
        implementation: async ({ file_name, old_string, new_string }) => {
          try {
            if (!old_string || old_string.length === 0) {
              return { error: "old_string cannot be empty" };
            }
            const filePath = validatePath(currentWorkingDirectory, file_name);
            const content = await (0, import_promises2.readFile)(filePath, "utf-8");
            if (!content.includes(old_string)) {
              return { error: "Could not find the exact 'old_string' in the file. Please check whitespace and indentation." };
            }
            const occurrenceCount = content.split(old_string).length - 1;
            if (occurrenceCount > 1) {
              return { error: `Found ${occurrenceCount} occurrences of 'old_string'. Please provide more context (surrounding lines) in 'old_string' to make it unique.` };
            }
            const newContent = content.replace(old_string, new_string);
            await (0, import_promises2.writeFile)(filePath, newContent, "utf-8");
            return { success: true, message: `Successfully replaced text in ${file_name}` };
          } catch (e) {
            return { error: `Failed to replace text: ${e instanceof Error ? e.message : String(e)}` };
          }
        }
      });
      tools.push(replaceTextTool);





      const listDirectoryTool = (0, import_sdk2.tool)({
        name: "directory_list_files_dirs",
        description: "List the files and directories in the current working directory or a specified subdirectory.",
        parameters: {
          path: import_zod.z.string().optional().describe("The path to the directory to list. Defaults to current working directory.")
        },
        implementation: async ({ path }) => {
          const targetPath = path ? validatePath(currentWorkingDirectory, path) : currentWorkingDirectory;
          const files = await (0, import_promises2.readdir)(targetPath);
          return {
            files
          };
        }
      });
      tools.push(listDirectoryTool);





      const readFileTool = (0, import_sdk2.tool)({
        name: "file_read_content",
        description: "Read the content of a file in the current working directory.",
        parameters: {
          file_name: import_zod.z.string()
        },
        implementation: async ({ file_name }) => {
          const filePath = validatePath(currentWorkingDirectory, file_name);
          const stats = await (0, import_promises2.stat)(filePath);
          if (stats.size > 1e7) {
            return { error: "File too large (>10MB)" };
          }
          const buffer = await (0, import_promises2.readFile)(filePath);
          const checkBuffer = buffer.subarray(0, Math.min(buffer.length, 1024));
          if (checkBuffer.includes(0)) {
            return { error: "File appears to be binary and cannot be read as text." };
          }
          const content = buffer.toString("utf-8");
          return {
            content
          };
        }
      });
      tools.push(readFileTool);





      const originalExecuteCommandImplementation = async ({ command, input, timeout_seconds }) => {
        const childProcess = (0, import_child_process.spawn)(command, [], {
          cwd: currentWorkingDirectory,
          shell: true,
          timeout: (timeout_seconds ?? 5) * 1e3,
          stdio: "pipe"
        });
        if (input) {
          childProcess.stdin.write(input);
          childProcess.stdin.end();
        } else {
          childProcess.stdin.end();
        }
        let stdout = "";
        let stderr = "";
        childProcess.stdout.setEncoding("utf-8");
        childProcess.stderr.setEncoding("utf-8");
        childProcess.stdout.on("data", (data) => {
          stdout += data;
        });
        childProcess.stderr.on("data", (data) => {
          stderr += data;
        });
        await new Promise((resolve2, reject) => {
          childProcess.on("close", (code) => {
            if (code === 0) {
              resolve2();
            } else {
              reject(new Error(`Process exited with code ${code}. Stderr: ${stderr}`));
            }
          });
          childProcess.on("error", (err) => {
            reject(err);
          });
        });
        return {
          stdout: stdout.trim(),
          stderr: stderr.trim()
        };
      };





      const executeCommandTool = (0, import_sdk2.tool)({
        name: "shell_command_execute",
        description: import_sdk2.text`
      Execute a shell command in the current working directory.
      Returns the stdout and stderr output of the command.
      You can optionally provide input to be piped to the command's stdin.

      IMPORTANT: The host operating system is '${process.platform}'. 
      If the OS is 'win32' (Windows), do NOT use 'bash' or 'sh' commands unless you are certain WSL is available.
      Instead, use standard Windows 'cmd' or 'powershell' syntax.
    `,
        parameters: {
          command: import_zod.z.string(),
          input: import_zod.z.string().optional().describe("Input text to pipe to the command's stdin."),
          timeout_seconds: import_zod.z.number().min(0.1).max(60).optional().describe("Timeout in seconds (default: 5, max: 60)")
        },
        implementation: createSafeToolImplementation(
          originalExecuteCommandImplementation,
          allowShell,
          "execute_command"
        )
      });
      tools.push(executeCommandTool);





      const makeDirectoryTool = (0, import_sdk2.tool)({
        name: "directory_make_mkdir",
        description: "Create a new directory in the current working directory.",
        parameters: {
          directory_name: import_zod.z.string()
        },
        implementation: async ({ directory_name }) => {
          const dirPath = validatePath(currentWorkingDirectory, directory_name);
          await (0, import_promises2.mkdir)(dirPath, { recursive: true });
          return {
            success: true,
            path: dirPath
          };
        }
      });
      tools.push(makeDirectoryTool);





      const deletePathTool = (0, import_sdk2.tool)({
        name: "path_delete",
        description: "Delete a file or directory in the current working directory. Be careful!",
        parameters: {
          path: import_zod.z.string()
        },
        implementation: async ({ path }) => {
          const targetPath = validatePath(currentWorkingDirectory, path);
          await (0, import_promises2.rm)(targetPath, { recursive: true, force: true });
          return {
            success: true,
            path: targetPath
          };
        }
      });
      tools.push(deletePathTool);





      const deleteFilesByPatternTool = (0, import_sdk2.tool)({
        name: "files_by_pattern_delete",
        description: "Delete multiple files in the current directory that match a regex pattern.",
        parameters: {
          pattern: import_zod.z.string().describe("Regex pattern to match filenames (e.g., '^auto_gen_.*\\.txt$')")
        },
        implementation: async ({ pattern }) => {
          try {
            if (pattern.length > 100) {
              return { error: "Pattern too complex (max 100 characters)" };
            }
            const regex = new RegExp(pattern);
            const start = Date.now();
            regex.test("safe_test_string_for_redos_check_1234567890_safe_test_string_for_redos_check_1234567890");
            if (Date.now() - start > 100) {
              return { error: "Pattern is too complex or slow (ReDoS protection)." };
            }
            const files = await (0, import_promises2.readdir)(currentWorkingDirectory);
            const deleted = [];
            for (const file of files) {
              if (regex.test(file)) {
                await (0, import_promises2.rm)((0, import_path3.join)(currentWorkingDirectory, file), { force: true });
                deleted.push(file);
              }
            }
            return { deleted_count: deleted.length, deleted_files: deleted };
          } catch (e) {
            return { error: `Failed to delete files: ${e instanceof Error ? e.message : String(e)}` };
          }
        }
      });
      tools.push(deleteFilesByPatternTool);





      const originalRunInTerminalImplementation = async ({ command }) => {
        if (process.platform === "win32") {
          const escapedDir = currentWorkingDirectory.replace(/"/g, '""');
          const escapedCmd = command.replace(/"/g, '""');
          const shellCommand = `start "" /D "${escapedDir}" cmd.exe /k "${escapedCmd}"`;
          const child = (0, import_child_process.spawn)("cmd.exe", ["/c", shellCommand], {
            detached: true,
            stdio: "ignore",
            windowsHide: false
          });
          child.unref();
        } else {
          if (process.platform === "darwin") {
            const safeCmd = command.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
            const safeCwd = currentWorkingDirectory.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
            const appleScript = `
          tell application "Terminal"
            do script "cd \\"${safeCwd}\\" && ${safeCmd}"
            activate
          end tell
        `;
            const child = (0, import_child_process.spawn)("osascript", ["-e", appleScript], { detached: true, stdio: "ignore" });
            child.unref();
          } else {
            const safeCwd = currentWorkingDirectory.replace(/'/g, "'\\''");
            const safeCmd = command.replace(/'/g, "'\\''");
            const bashScript = `cd '${safeCwd}' && ${safeCmd}; bash`;
            const child = (0, import_child_process.spawn)("x-terminal-emulator", ["-e", "bash", "-c", bashScript], {
              detached: true,
              stdio: "ignore"
            });
            child.on("error", (e) => {
              const child2 = (0, import_child_process.spawn)("gnome-terminal", ["--", "bash", "-c", bashScript], {
                detached: true,
                stdio: "ignore"
              });
              child2.unref();
            });
            child.unref();
          }
        }
        return {
          success: true,
          message: "Terminal window launched. Please check your taskbar."
        };
      };





      const runInTerminalTool = (0, import_sdk2.tool)({
        name: "terminal_open_command_run",
        description: import_sdk2.text`
      Launch a command in a new, separate interactive terminal window. 
      Use this for scripts that require user interaction (input/output) or to open a shell in a specific directory.
      (Currently optimized for Windows).
    `,
        parameters: {
          command: import_zod.z.string()
        },
        implementation: createSafeToolImplementation(
          originalRunInTerminalImplementation,
          allowTerminal,
          "run_in_terminal"
        )
      });
      tools.push(runInTerminalTool);





      const webSearchTool = (0, import_sdk2.tool)({
        name: "web_search_with_providers",
        description: "Search the web using multiple providers (DuckDuckGo, Google, Bing). Can automatically fallback if a provider fails, or query specific providers.",
        parameters: {
          query: import_zod.z.string(),
          providers: import_zod.z.array(import_zod.z.enum(["duckduckgo-api", "duckduckgo-html", "google", "bing"])).optional().describe("Optional: List of specific providers to query. If omitted, a fallback chain is used: DDG API -> DDG Puppeteer -> Google -> Bing.")
        },
        implementation: async ({ query, providers }) => {
          const results = [];
          const errors = [];
          const logs = [];
          const searchFunctions = {
            "duckduckgo-api": async (q) => {
              const { search, SafeSearchType } = await import("duck-duck-scrape");
              let attempt = 0;
              while (attempt < 2) {
                try {
                  const r = await search(q, { safeSearch: SafeSearchType.OFF });
                  if (r.results && r.results.length > 0) {
                    return r.results.map((result) => ({
                      title: result.title,
                      link: result.url,
                      snippet: result.description,
                      provider: "duckduckgo-api"
                    }));
                  }
                  break;
                } catch (e) {
                  attempt++;
                  await new Promise((r) => setTimeout(r, 1e3));
                }
              }
              throw new Error("No results or API failed");
            },
            "duckduckgo-html": async (q) => {
              const puppeteer = await import("puppeteer");
              const browser = await puppeteer.launch({ headless: true });
              try {
                const page = await browser.newPage();
                await page.goto(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`, { waitUntil: "networkidle2", timeout: 15e3 });
                const extracted = await page.evaluate(() => {
                  const items = document.querySelectorAll(".result");
                  const data = [];
                  for (const item of items) {
                    const linkEl = item.querySelector(".result__a");
                    const snippetEl = item.querySelector(".result__snippet");
                    if (linkEl) {
                      data.push({
                        title: linkEl.innerText,
                        link: linkEl.getAttribute("href") || "",
                        snippet: snippetEl ? snippetEl.innerText : "",
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
            "google": async (q) => {
              const puppeteer = await import("puppeteer");
              const browser = await puppeteer.launch({ headless: true });
              try {
                const page = await browser.newPage();
                await page.goto(`https://www.google.com/search?q=${encodeURIComponent(q)}`, { waitUntil: "networkidle2", timeout: 15e3 });
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
                        snippet: snippetEl ? snippetEl.innerText : "",
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
            "bing": async (q) => {
              const puppeteer = await import("puppeteer");
              const browser = await puppeteer.launch({ headless: true });
              try {
                const page = await browser.newPage();
                await page.goto(`https://www.bing.com/search?q=${encodeURIComponent(q)}`, { waitUntil: "networkidle2", timeout: 15e3 });
                const extracted = await page.evaluate(() => {
                  const items = document.querySelectorAll("li.b_algo");
                  const data = [];
                  for (const item of items) {
                    const titleEl = item.querySelector("h2 a");
                    const linkEl = item.querySelector("h2 a");
                    const snippetEl = item.querySelector("p");
                    if (titleEl && linkEl) {
                      data.push({
                        title: titleEl.innerText,
                        link: linkEl.getAttribute("href") || "",
                        snippet: snippetEl ? snippetEl.innerText : "",
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
          if (providers && providers.length > 0) {
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
            const chain = ["duckduckgo-api", "duckduckgo-html", "google", "bing"];
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
            results,
            meta: {
              total_found: results.length,
              providers_used: [...new Set(results.map((r) => r.provider))],
              trace: logs
            }
          };
        }
      });
      tools.push(webSearchTool);





      const moveFileTool = (0, import_sdk2.tool)({
        name: "file_or_directory_move_or_rename",
        description: "Move or rename a file or directory.",
        parameters: {
          source: import_zod.z.string(),
          destination: import_zod.z.string()
        },
        implementation: async ({ source, destination }) => {
          const sourcePath = validatePath(currentWorkingDirectory, source);
          const destPath = validatePath(currentWorkingDirectory, destination);
          await (0, import_promises2.rename)(sourcePath, destPath);
          return {
            success: true,
            from: sourcePath,
            to: destPath
          };
        }
      });
      tools.push(moveFileTool);





      const copyFileTool = (0, import_sdk2.tool)({
        name: "file_copy",
        description: "Copy a file to a new location.",
        parameters: {
          source: import_zod.z.string(),
          destination: import_zod.z.string()
        },
        implementation: async ({ source, destination }) => {
          const sourcePath = validatePath(currentWorkingDirectory, source);
          const destPath = validatePath(currentWorkingDirectory, destination);
          await (0, import_promises2.copyFile)(sourcePath, destPath);
          return {
            success: true,
            from: sourcePath,
            to: destPath
          };
        }
      });
      tools.push(copyFileTool);





      const fetchWebContentTool = (0, import_sdk2.tool)({
        name: "web_URL_content_fetch_text",
        description: "Fetch the clean, text-based content of a webpage URL.",
        parameters: {
          url: import_zod.z.string()
        },
        implementation: async ({ url }) => {
          try {
            const response = await fetch(url);
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            let text3 = await response.text();
            const result = {
              url,
              status: response.status
            };
            const titleMatch = text3.match(/<title[^>]*>([^<]+)<\/title>/i);
            if (titleMatch) result.title = titleMatch[1];
            let previousLength;
            do {
              previousLength = text3.length;
              text3 = text3.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
              text3 = text3.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
            } while (text3.length < previousLength);
            text3 = text3.replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi, "");
            text3 = text3.replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/gi, "");
            text3 = text3.replace(/<header\b[^>]*>[\s\S]*?<\/header>/gi, "");
            text3 = text3.replace(/<aside\b[^>]*>[\s\S]*?<\/aside>/gi, "");
            text3 = text3.replace(/<\/div>/gi, "\n");
            text3 = text3.replace(/<\/p>/gi, "\n");
            text3 = text3.replace(/<br\s*\/?>/gi, "\n");
            do {
              previousLength = text3.length;
              text3 = text3.replace(/<[^>]+>/g, "");
            } while (text3.length < previousLength);
            text3 = text3.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&nbsp;/g, " ").replace(/&amp;/g, "&");
            text3 = text3.replace(/[ \t]+/g, " ").replace(/\n\s*\n/g, "\n\n").trim();
            result.content = text3.substring(0, 4e4) + (text3.length > 4e4 ? "... (truncated)" : "");
            return result;
          } catch (error) {
            return {
              error: `Failed to fetch URL: ${error instanceof Error ? error.message : String(error)}`
            };
          }
        }
      });
      tools.push(fetchWebContentTool);





      const ragWebContentTool = (0, import_sdk2.tool)({
        name: "rag_on_web_URL_text",
        description: "Fetch content from a URL, and then use RAG to find and return only the text chunks most relevant to a specific query.",
        parameters: {
          url: import_zod.z.string(),
          query: import_zod.z.string()
        },
        implementation: async ({ url, query }) => {
          try {
            const response = await fetch(url);
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            let text3 = await response.text();
            let previousLength;
            do {
              previousLength = text3.length;
              text3 = text3.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
              text3 = text3.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
            } while (text3.length < previousLength);
            text3 = text3.replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi, "");
            text3 = text3.replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/gi, "");
            text3 = text3.replace(/<header\b[^>]*>[\s\S]*?<\/header>/gi, "");
            text3 = text3.replace(/<aside\b[^>]*>[\s\S]*?<\/aside>/gi, "");
            text3 = text3.replace(/<\/div>/gi, "\n");
            text3 = text3.replace(/<\/p>/gi, "\n");
            text3 = text3.replace(/<br\s*\/?>/gi, "\n");
            do {
              previousLength = text3.length;
              text3 = text3.replace(/<[^>]+>/g, "");
            } while (text3.length < previousLength);
            text3 = text3.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&nbsp;/g, " ").replace(/&amp;/g, "&");
            text3 = text3.replace(/[ \t]+/g, " ").replace(/\n\s*\n/g, "\n\n").trim();
            if (text3.length === 0) {
              return { error: "Could not extract any text from the URL." };
            }
            if (!client2) {
              return { error: "LM Studio Client is not available. RAG features require the client to be initialized." };
            }
            const ragResults = await performRagOnText(text3, query, client2, embeddingModelName);
            return {
              url,
              query,
              relevant_chunks: ragResults
            };
          } catch (error) {
            return { error: `Failed during RAG web search: ${error instanceof Error ? error.message : String(error)}` };
          }
        }
      });
      tools.push(ragWebContentTool);





      const getSystemInfoTool = (0, import_sdk2.tool)({
        name: "system_get_info",
        description: "Get information about the system (OS, CPU, Memory).",
        parameters: {},
        implementation: async () => {
          return {
            platform: os2.platform(),
            arch: os2.arch(),
            release: os2.release(),
            hostname: os2.hostname(),
            total_memory: os2.totalmem(),
            free_memory: os2.freemem(),
            cpus: os2.cpus().length,
            node_version: process.version
          };
        }
      });
      tools.push(getSystemInfoTool);





      const findFilesTool = (0, import_sdk2.tool)({
        name: "files_by_pattern_find",
        description: "Find files recursively in the current directory matching a name pattern.",
        parameters: {
          pattern: import_zod.z.string().describe("Substring to match in filename (case-insensitive)"),
          max_depth: import_zod.z.number().optional().describe("Maximum depth to search (default: 5)")
        },
        implementation: async ({ pattern, max_depth }) => {
          const depthLimit = max_depth ?? 5;
          const foundFiles = [];
          const lowerPattern = pattern.toLowerCase();
          async function scan(dir, currentDepth) {
            if (currentDepth > depthLimit) return;
            try {
              const entries = await (0, import_promises2.readdir)(dir, { withFileTypes: true });
              for (const entry of entries) {
                const fullPath = (0, import_path3.join)(dir, entry.name);
                if (entry.isDirectory()) {
                  await scan(fullPath, currentDepth + 1);
                } else if (entry.isFile()) {
                  if (entry.name.toLowerCase().includes(lowerPattern)) {
                    foundFiles.push(fullPath);
                  }
                }
              }
            } catch (e) {
            }
          }
          await scan(currentWorkingDirectory, 0);
          return {
            found_files: foundFiles.slice(0, 100),
            // Limit results
            count: foundFiles.length
          };
        }
      });
      tools.push(findFilesTool);





      const getFileMetadataTool = (0, import_sdk2.tool)({
        name: "file_get_metadata",
        description: "Get metadata (size, dates) for a specific file.",
        parameters: {
          path: import_zod.z.string()
        },
        implementation: async ({ path }) => {
          try {
            const targetPath = validatePath(currentWorkingDirectory, path);
            const stats = await (0, import_promises2.stat)(targetPath);
            return {
              path: targetPath,
              size: stats.size,
              created: stats.birthtime,
              modified: stats.mtime,
              is_directory: stats.isDirectory(),
              is_file: stats.isFile()
            };
          } catch (error) {
            return { error: `Failed to get metadata: ${error instanceof Error ? error.message : String(error)}` };
          }
        }
      });
      tools.push(getFileMetadataTool);





      const readClipboardTool = (0, import_sdk2.tool)({
        name: "clipboard_read_text",
        description: "Read text content from the system clipboard.",
        parameters: {},
        implementation: async () => {
          let command = "";
          let args = [];
          if (process.platform === "win32") {
            command = "powershell";
            args = ["-command", "Get-Clipboard"];
          } else if (process.platform === "darwin") {
            command = "pbpaste";
          } else {
            command = "xclip";
            args = ["-selection", "clipboard", "-o"];
          }
          return Promise.race([
            new Promise((resolve2) => {
              const child = (0, import_child_process.spawn)(command, args);
              let output = "";
              let error = "";
              child.stdout.on("data", (data) => output += data.toString());
              child.stderr.on("data", (data) => error += data.toString());
              child.on("close", (code) => {
                if (code === 0) {
                  resolve2({ content: output.trim() });
                } else {
                  resolve2({ error: `Failed to read clipboard. Exit code: ${code}. Error: ${error}` });
                }
              });
              child.on("error", (err) => {
                resolve2({ error: `Failed to spawn clipboard command: ${err.message}` });
              });
            }),
            new Promise(
              (_, reject) => setTimeout(() => reject(new Error("Clipboard operation timeout")), 5e3)
            )
          ]).catch((err) => ({ error: err.message }));
        }
      });
      tools.push(readClipboardTool);





      const writeClipboardTool = (0, import_sdk2.tool)({
        name: "clipboard_write_text",
        description: "Write text content to the system clipboard.",
        parameters: {
          content: import_zod.z.string()
        },
        implementation: async ({ content }) => {
          let command = "";
          let args = [];
          let input = content;
          if (process.platform === "win32") {
            command = "powershell";
            const base64Content = Buffer.from(content, "utf8").toString("base64");
            args = ["-command", `$str = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String('${base64Content}')); Set-Clipboard -Value $str`];
            input = "";
          } else if (process.platform === "darwin") {
            command = "pbcopy";
          } else {
            command = "xclip";
            args = ["-selection", "clipboard", "-i"];
          }
          return Promise.race([
            new Promise((resolve2) => {
              const child = (0, import_child_process.spawn)(command, args, { stdio: ["pipe", "ignore", "pipe"] });
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
                  resolve2({ success: true });
                } else {
                  resolve2({ error: `Failed to write to clipboard. Exit code: ${code}. Error: ${error}` });
                }
              });
              child.on("error", (err) => {
                resolve2({ error: `Failed to spawn clipboard command: ${err.message}` });
              });
            }),
            new Promise(
              (_, reject) => setTimeout(() => reject(new Error("Clipboard operation timeout")), 5e3)
            )
          ]).catch((err) => ({ error: err.message }));
        }
      });
      tools.push(writeClipboardTool);





      const openFileTool = (0, import_sdk2.tool)({
        name: "file_or_URL_open_defaultapp",
        description: "Open a file or URL in the system's default application. Use this to preview images, PDFs, or open web pages.",
        parameters: {
          target: import_zod.z.string().describe("File path or URL")
        },
        implementation: async ({ target }) => {
          let command = "";
          let args = [];
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
          const child = (0, import_child_process.spawn)(command, args, { stdio: "ignore", detached: true });
          child.unref();
          return { success: true, message: `Opened ${targetToOpen}` };
        }
      });
      tools.push(openFileTool);





      const previewHtmlTool = (0, import_sdk2.tool)({
        name: "HTML_render_preview",
        description: "Render and preview HTML content in the system's default browser. Useful for visualizing code or UIs.",
        parameters: {
          html_content: import_zod.z.string(),
          file_name: import_zod.z.string().optional().describe("Optional filename (default: preview.html)")
        },
        implementation: async ({ html_content, file_name }) => {
          const name = file_name || `preview_${Date.now()}.html`;
          const filePath = validatePath(currentWorkingDirectory, name);
          await (0, import_promises2.writeFile)(filePath, html_content, "utf-8");
          let command = "";
          let args = [];
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
          const child = (0, import_child_process.spawn)(command, args, { stdio: "ignore", detached: true });
          child.unref();
          return { success: true, path: filePath, message: "HTML preview launched in browser." };
        }
      });
      tools.push(previewHtmlTool);





      const browserOpenPageTool = (0, import_sdk2.tool)({
        name: "web_browser_open_page",
        description: "Open a webpage in a headless browser (Puppeteer), render it, and return the content. Useful for JS-heavy sites. Can also take a screenshot.",
        parameters: {
          url: import_zod.z.string(),
          screenshot_path: import_zod.z.string().optional().describe("Path to save a screenshot (e.g., 'screenshot.png')."),
          wait_for_selector: import_zod.z.string().optional().describe("CSS selector to wait for before returning.")
        },
        implementation: async ({ url, screenshot_path, wait_for_selector }) => {
          let browser;
          try {
            const puppeteer = await import("puppeteer");
            browser = await puppeteer.launch({ headless: true });
            const page = await browser.newPage();
            try {
              await page.goto(url, { waitUntil: "networkidle0", timeout: 3e4 });
              if (wait_for_selector) {
                await page.waitForSelector(wait_for_selector, { timeout: 1e4 });
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
                text_content: textContent.substring(0, 5e3),
                screenshot_saved
              };
            } finally {
              await browser.close();
            }
          } catch (error) {
            if (browser) {
              await browser.close().catch(() => {
              });
            }
            return { error: `Browser operation failed: ${error instanceof Error ? error.message : String(error)}` };
          }
        }
      });
      tools.push(browserOpenPageTool);





      const runTestCommandTool = (0, import_sdk2.tool)({
        name: "command_as_test_run",
        description: "Execute a test command (like 'npm test') and return the results. Specialized for capturing test output.",
        parameters: {
          command: import_zod.z.string().describe("The test command to run (e.g., 'npm test', 'pytest').")
        },
        implementation: async ({ command }) => {
          return new Promise((resolve2) => {
            const parts = command.split(" ");
            const cmd = parts[0];
            const args = parts.slice(1);
            const child = (0, import_child_process.spawn)(cmd, args, {
              cwd: currentWorkingDirectory,
              shell: true,
              env: { ...process.env, CI: "true" }
            });
            let stdout = "";
            let stderr = "";
            child.stdout.on("data", (data) => {
              stdout += data.toString();
            });
            child.stderr.on("data", (data) => {
              stderr += data.toString();
            });
            child.on("close", (code) => {
              resolve2({
                command,
                exit_code: code,
                stdout: stdout.trim(),
                stderr: stderr.trim(),
                passed: code === 0
              });
            });
            child.on("error", (err) => {
              resolve2({
                command,
                error: err.message,
                passed: false
              });
            });
          });
        }
      });
      tools.push(runTestCommandTool);





      const wikipediaSearchTool = (0, import_sdk2.tool)({
        name: "web_search_on_wikipedia_english",
        description: "Search Wikipedia for a given query and return page summaries.",
        parameters: {
          query: import_zod.z.string(),
          lang: import_zod.z.string().optional().describe("Language code (default: en)")
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
              for (const item of searchData.query.search.slice(0, 3)) {
                const pageUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&pageids=${item.pageid}&format=json`;
                const pageResponse = await fetch(pageUrl);
                const pageData = await pageResponse.json();
                const page = pageData.query.pages[item.pageid];
                results.push({
                  title: item.title,
                  summary: page.extract.substring(0, 2e3) + (page.extract.length > 2e3 ? "..." : ""),
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





      const ragLocalFilesTool = (0, import_sdk2.tool)({
        name: "rag_on_files_local",
        description: "Perform RAG (Retrieval-Augmented Generation) on files in the current workspace. Use this to find code snippets or information within local files relevant to a query.",
        parameters: {
          query: import_zod.z.string(),
          path: import_zod.z.string().optional().describe("Sub-directory to limit search (default: current working directory)"),
          file_pattern: import_zod.z.string().optional().describe("File pattern to include (e.g. '.ts', 'src/'). Default: all text files.")
        },
        implementation: createSafeToolImplementation(
          async ({ query, path = ".", file_pattern = "" }) => {
            try {
              if (!client2) return { error: "LM Studio Client unavailable." };
              const targetDir = validatePath(currentWorkingDirectory, path);
              const entries = await (0, import_promises2.readdir)(targetDir, { recursive: true, withFileTypes: true });
              const textFiles = entries.filter((e) => e.isFile() && !e.name.match(/\.(png|jpg|jpeg|gif|ico|exe|dll|bin)$/i));
              const filteredFiles = file_pattern ? textFiles.filter((e) => e.name.includes(file_pattern) || (0, import_path3.join)(e.parentPath, e.name).includes(file_pattern)) : textFiles;
              const filesToScan = filteredFiles.slice(0, 50);
              let allChunks = [];
              const embeddingModel = await client2.embedding.model(embeddingModelName);
              const [queryEmbedding] = await embeddingModel.embed([query]);
              for (const file of filesToScan) {
                try {
                  const fullPath = (0, import_path3.join)(file.parentPath, file.name);
                  const content = await (0, import_promises2.readFile)(fullPath, "utf-8");
                  const chunks = content.split(/\n\s*\n/).filter((c) => c.trim().length > 20);
                  if (chunks.length === 0) continue;
                  const chunkEmbeddings = await embeddingModel.embed(chunks);
                  chunks.forEach((chunk, i) => {
                    const score = cosineSimilarity(queryEmbedding.embedding, chunkEmbeddings[i].embedding);
                    if (score > 0.4) {
                      allChunks.push({ chunk, score, file: file.name });
                    }
                  });
                } catch (e) {
                }
              }
              allChunks.sort((a, b) => b.score - a.score);
              return {
                query,
                results: allChunks.slice(0, 10).map((c) => ({
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





      const consultSecondaryAgentTool = (0, import_sdk2.tool)({
        name: "agent_secondary_consult",
        description: "Delegate a task to a secondary agent. IMPORTANT: If the task is 'coding' or 'writing files', the secondary agent will AUTOMATICALLY CREATE AND SAVE the files to the disk. You do NOT need to save them yourself. The tool returns a list of generated files. Trust this list.",
        parameters: {
          task: import_zod.z.string(),
          agent_role: import_zod.z.string().optional().describe("Key from 'Sub-Agent Profiles' config (e.g., 'coder'). Default: 'general'."),
          context: import_zod.z.string().optional().describe("Additional context or data for the agent."),
          allow_tools: import_zod.z.boolean().optional().describe("If true, the secondary agent can use tools like Web Search (DuckDuckGo, Wikipedia), File System (Read/List), and Code Execution (if enabled in settings). Default: false.")
        },
        implementation: createSafeToolImplementation(
          async ({ task, agent_role = "general", context = "", allow_tools = false }) => {
            let endpoint = pluginConfig.get("secondaryAgentEndpoint");
            let modelId = pluginConfig.get("secondaryModelId");
            const useMainModel = pluginConfig.get("useMainModelForSubAgent");
            if (useMainModel) {
              endpoint = "http://localhost:1234/v1";
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
            const runAgentLoop = async (role, taskPrompt, contextData, loopLimit = 8, forceTools = false, currentWorkingDirectory2) => {
              let currentSystemPrompt = "You are a helpful assistant.";
              const instructionsPath = (0, import_path3.join)(currentWorkingDirectory2, "SUB_AGENT_INSTRUCTIONS.md");
              try {
                const instructions = await (0, import_promises2.readFile)(instructionsPath, "utf-8");
                if (instructions.trim()) currentSystemPrompt = instructions;
              } catch (e) {
              }
              const infoPath = (0, import_path3.join)(currentWorkingDirectory2, "beledarian_info.md");
              try {
                const projectInfo = await (0, import_promises2.readFile)(infoPath, "utf-8");
                if (projectInfo.trim()) {
                  currentSystemPrompt += `

## ? Current Project Info (beledarian_info.md)
${projectInfo}
`;
                }
              } catch (e) {
              }
              currentSystemPrompt += `

## ? Current Workspace
Your current working directory is: 

${currentWorkingDirectory2}
Always assume relative paths are from this directory.`;
              try {
                const profiles = JSON.parse(subAgentProfilesStr);
                if (profiles[role]) {
                  currentSystemPrompt += `

## Your Persona
${profiles[role]}`;
                } else if (role === "reviewer") {
                  currentSystemPrompt += `

## Your Persona
You are a Senior Code Reviewer. Your job is to analyze code, find bugs, security issues, or logic errors, and FIX them.

IMPORTANT: To fix a file, you MUST use the 'save_file' tool with the complete, corrected content. DO NOT use 'container.exec' or diff formats. Just overwrite the file with the fixed version using 'save_file'.`;
                }
              } catch (jsonErr) {
              }
              let toolsReminder = "";
              const toolsEnabled = allow_tools || forceTools;
              if (toolsEnabled) {
                const allowedTools = [];
                if (allowFileSystem) allowedTools.push("file_read_content", "directory_list_files_dirs", "file_save", "file_replace_text_within", "files_by_pattern_delete", "rag_on_files_local", "search_file_content");
                if (allowWeb) allowedTools.push("web_search_on_wikipedia_english", "web_search_with_providers", "web_URL_content_fetch_text", "rag_on_web_URL_text");
                if (allowCode) allowedTools.push("run_python", "run_javascript");
                if (allowedTools.length > 0) {
                  const toolsList = allowedTools.join(", ");
                  currentSystemPrompt += `

## Allowed Tools
You have access to the following tools via JSON output: ${toolsList}.
Refer to the "Tool Usage" section above for the JSON format.
`;
                  toolsReminder = `

[SYSTEM REMINDER: You have access to tools: ${toolsList}. If you need information you don't have, USE A TOOL. Do not refuse.]`;
                }
              }
              const msgList = [
                { role: "system", content: currentSystemPrompt },
                { role: "user", content: `Task: ${taskPrompt}

Context: ${contextData}${toolsReminder}` }
              ];
              let loops = 0;
              let finalContent = "";
              let filesModified = [];
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
                  content = content.replace(/<\|.*?\|>/g, "").trim();
                  if (!toolsEnabled) return { response: content, filesModified };
                  let toolCall = null;
                  try {
                    const trimmed = content.trim();
                    const refusalKeywords = [
                      "i cannot browse",
                      "i don't have access",
                      "i can't access",
                      "unable to browse",
                      "real-time news",
                      "no internet access",
                      "as an ai",
                      "i do not have the ability",
                      "cannot access the internet"
                    ];
                    if (refusalKeywords.some((kw) => trimmed.toLowerCase().includes(kw))) {
                      msgList.push({ role: "assistant", content });
                      msgList.push({ role: "system", content: "SYSTEM ERROR: You HAVE access to tools. USE THEM." });
                      loops++;
                      continue;
                    }
                    const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                      try {
                        const parsed = JSON.parse(jsonMatch[0]);
                        if (parsed.tool && parsed.args) {
                          toolCall = parsed;
                        } else if (parsed.name && parsed.arguments) {
                          let toolName = parsed.name;
                          let args = parsed.arguments;
                          if (toolName === "save_file") {
                            if (args.path && !args.file_name) args.file_name = args.path;
                            if (args.data && !args.content) args.content = args.data;
                          }
                          toolCall = { tool: toolName, args };
                        } else {
                          const toolNameMatch = trimmed.match(/to=([a-zA-Z0-9_.]+)/);
                          if (toolNameMatch) {
                            let toolName = toolNameMatch[1];
                            if (toolName.startsWith("functions.")) toolName = toolName.replace("functions.", "");
                            let args = parsed;
                            if (toolName === "save_file" && Array.isArray(args)) {
                              args = { files: args };
                            }
                            if (toolName === "save_file") {
                              if (args.path && !args.file_name) args.file_name = args.path;
                              if (args.data && !args.content) args.content = args.data;
                            }
                            toolCall = { tool: toolName, args };
                          }
                        }
                      } catch (e) {
                      }
                    }
                  } catch (e) {
                  }
                  if (toolCall && toolCall.tool) {
                    msgList.push({ role: "assistant", content });
                    let toolResult = "";
                    try {
                      if (allowFileSystem) {
                        if (toolCall.tool === "read_file" && toolCall.args?.file_name) {
                          const fpath = validatePath(currentWorkingDirectory2, toolCall.args.file_name);
                          toolResult = await (0, import_promises2.readFile)(fpath, "utf-8");
                        } else if (toolCall.tool === "list_directory") {
                          const files = await (0, import_promises2.readdir)(currentWorkingDirectory2);
                          toolResult = JSON.stringify(files);
                        } else if (toolCall.tool === "save_file") {
                          if (Array.isArray(toolCall.args?.files)) {
                            const savedList = [];
                            for (const fileObj of toolCall.args.files) {
                              const fName = fileObj.file_name || fileObj.name || fileObj.path;
                              const fContent = fileObj.content || fileObj.data;
                              if (fName && fContent) {
                                try {
                                  const fpath = validatePath(currentWorkingDirectory2, fName);
                                  await (0, import_promises2.mkdir)((0, import_path3.dirname)(fpath), { recursive: true });
                                  await (0, import_promises2.writeFile)(fpath, fContent, "utf-8");
                                  filesModified.push(fName);
                                  savedList.push(fName);
                                } catch (err) {
                                }
                              }
                            }
                            toolResult = savedList.length > 0 ? `Success: Saved ${savedList.length} files: ${savedList.join(", ")}` : "Error: No valid files found in batch.";
                          } else {
                            const fileName = toolCall.args?.file_name || toolCall.args?.name || toolCall.args?.path;
                            const content2 = toolCall.args?.content || toolCall.args?.data;
                            if (fileName && content2) {
                              const fpath = validatePath(currentWorkingDirectory2, fileName);
                              await (0, import_promises2.mkdir)((0, import_path3.dirname)(fpath), { recursive: true });
                              await (0, import_promises2.writeFile)(fpath, content2, "utf-8");
                              toolResult = `Success: File saved to ${fpath}`;
                              filesModified.push(fileName);
                            } else {
                              toolResult = "Error: Missing 'file_name' (or 'name', 'path') or 'content' (or 'data') arguments.";
                            }
                          }
                        } else if (toolCall.tool === "replace_text_in_file" && toolCall.args?.file_name && toolCall.args?.old_string && toolCall.args?.new_string) {
                          const fpath = validatePath(currentWorkingDirectory2, toolCall.args.file_name);
                          const content2 = await (0, import_promises2.readFile)(fpath, "utf-8");
                          if (!content2.includes(toolCall.args.old_string)) {
                            toolResult = "Error: 'old_string' not found exactly.";
                          } else {
                            const count = content2.split(toolCall.args.old_string).length - 1;
                            if (count > 1) {
                              toolResult = `Error: Found ${count} occurrences. Be more specific.`;
                            } else {
                              await (0, import_promises2.writeFile)(fpath, content2.replace(toolCall.args.old_string, toolCall.args.new_string), "utf-8");
                              toolResult = "Success: Text replaced.";
                              filesModified.push(toolCall.args.file_name);
                            }
                          }
                        } else if (toolCall.tool === "delete_files_by_pattern" && toolCall.args?.pattern) {
                          if (toolCall.args.pattern.length > 100) throw new Error("Pattern too complex");
                          const regex = new RegExp(toolCall.args.pattern);
                          const start = Date.now();
                          regex.test("safe_test_string_for_redos_check_1234567890_safe_test_string_for_redos_check_1234567890");
                          if (Date.now() - start > 100) throw new Error("Pattern too complex/slow");
                          const files = await (0, import_promises2.readdir)(currentWorkingDirectory2);
                          const deleted = [];
                          for (const file of files) {
                            if (regex.test(file)) {
                              const fpath = validatePath(currentWorkingDirectory2, file);
                              await (0, import_promises2.rm)(fpath, { force: true });
                              deleted.push(file);
                            }
                          }
                          toolResult = `Deleted ${deleted.length} files: ${deleted.join(", ")}`;
                        } else if (toolCall.tool === "rag_local_files") {
                          toolResult = "Local RAG available (mocked for refactor).";
                        }
                      }
                      if (allowWeb && !toolResult) {
                        if (toolCall.tool === "wikipedia_search") toolResult = "Wiki Search (mocked)";
                        else if (toolCall.tool === "duckduckgo_search") {
                          const { search, SafeSearchType } = await import("duck-duck-scrape");
                          const r = await search(toolCall.args.query, { safeSearch: SafeSearchType.OFF });
                          toolResult = JSON.stringify(r.results.slice(0, 3));
                        } else if (toolCall.tool === "fetch_web_content" && toolCall.args?.url) {
                          const res = await fetch(toolCall.args.url);
                          toolResult = (await res.text()).substring(0, 5e3);
                        }
                      }
                      if (allowCode && !toolResult) {
                        if (toolCall.tool === "run_python") {
                          const res = await originalRunPythonImplementation({ python: toolCall.args.python });
                          toolResult = res.stderr ? `Error: ${res.stderr}` : res.stdout;
                        }
                      }
                      if (!toolResult) toolResult = "Error: Tool not found/allowed.";
                    } catch (err) {
                      toolResult = `Error: ${err.message}`;
                    }
                    msgList.push({ role: "user", content: `Tool Output: ${toolResult}` });
                    loops++;
                  } else {
                    if (content.includes("TASK_COMPLETED") || loops >= loopLimit - 1) {
                      finalContent = content;
                      break;
                    } else {
                      msgList.push({ role: "assistant", content });
                      msgList.push({ role: "system", content: "SYSTEM NOTICE: You did not call a tool. If you are finished, output 'TASK_COMPLETED'. If not, please USE A TOOL (e.g., save_file, read_file) to proceed." });
                      loops++;
                    }
                  }
                } catch (err) {
                  return { error: err.message, filesModified };
                }
                if (msgList.length > 20) {
                  const systemMsg = msgList[0];
                  const recentMsgs = msgList.slice(-18);
                  msgList.length = 0;
                  msgList.push(systemMsg, ...recentMsgs);
                }
              }
              if (autoSave && allowFileSystem && finalContent) {
                const codeBlockRegex = /```\s*(\w+)?\s*([\s\S]*?)```/g;
                const matches = Array.from(finalContent.matchAll(codeBlockRegex));
                const processedFiles = /* @__PURE__ */ new Set();
                for (let i = matches.length - 1; i >= 0; i--) {
                  const match = matches[i];
                  const fullBlock = match[0];
                  const lang = (match[1] || "txt").toLowerCase();
                  const code = match[2];
                  const index = match.index || 0;
                  let handledAsBatch = false;
                  if (lang === "json") {
                    try {
                      const parsed = JSON.parse(code);
                      if (Array.isArray(parsed)) {
                        let extractedCount = 0;
                        for (const item of parsed) {
                          const fName = item.path || item.file_name || item.name;
                          const fContent = item.content || item.data || item.code;
                          if (fName && typeof fName === "string" && fContent && typeof fContent === "string") {
                            const fpath = validatePath(currentWorkingDirectory2, fName);
                            await (0, import_promises2.mkdir)((0, import_path3.dirname)(fpath), { recursive: true });
                            await (0, import_promises2.writeFile)(fpath, fContent, "utf-8");
                            filesModified.push(fName);
                            processedFiles.add(fName);
                            extractedCount++;
                          }
                        }
                        if (extractedCount > 0) {
                          handledAsBatch = true;
                          const replacement = `
[System: Successfully extracted and saved ${extractedCount} files from JSON block.]
`;
                          finalContent = finalContent.slice(0, index) + replacement + finalContent.slice(index + fullBlock.length);
                        }
                      }
                    } catch (e) {
                    }
                  }
                  if (!handledAsBatch && code.trim().length > 50) {
                    const lookback = finalContent.substring(Math.max(0, index - 500), index);
                    const nameMatch = lookback.match(/(?:`|\*\*|###|filename:|file:)[\s\S]*?([\w\-\/\\.]+\.(?:tsx|ts|jsx|js|html|css|json|md|py|sh|java|rs|go|sql|yaml|yml|c|cpp|h|hpp|txt))/i);
                    let fileName = "";
                    if (nameMatch) {
                      fileName = nameMatch[1].trim();
                    }
                    if (!fileName) {
                      const firstLine = code.split("\n")[0].trim();
                      const commentMatch = firstLine.match(/^(?:\/\/|#|<!--|;)\s*(?:filename:|file:)?\s*([\w\-\/\\.]+\.(?:tsx|ts|jsx|js|html|css|json|md|py|sh|java|rs|go|sql|yaml|yml|c|cpp|h|hpp|txt))/i);
                      if (commentMatch) {
                        fileName = commentMatch[1].trim();
                      }
                    }
                    const isShell = ["bash", "sh", "cmd", "powershell", "console", "zsh", "terminal"].includes(lang);
                    if (isShell && !fileName) {
                      continue;
                    }
                    if (!fileName) {
                      continue;
                    }
                    if (processedFiles.has(fileName)) {
                      continue;
                    }
                    const fpath = (0, import_path3.join)(currentWorkingDirectory2, fileName);
                    try {
                      await (0, import_promises2.mkdir)((0, import_path3.dirname)(fpath), { recursive: true });
                      await (0, import_promises2.writeFile)(fpath, code, "utf-8");
                      filesModified.push(fileName);
                      processedFiles.add(fileName);
                      const replacement = `
[System: File '${fileName}' created successfully.]
`;
                      finalContent = finalContent.slice(0, index) + replacement + finalContent.slice(index + fullBlock.length);
                    } catch (e) {
                      console.error(`Failed to auto-save file ${fileName}:`, e);
                    }
                  }
                }
              }
              if (filesModified.length > 0 && allowFileSystem) {
                const infoPath2 = (0, import_path3.join)(currentWorkingDirectory2, "beledarian_info.md");
                const timestamp = (/* @__PURE__ */ new Date()).toISOString();
                const logEntry = `
- **[${timestamp}]** Task: "${taskPrompt.substring(0, 50)}..." | Modified: ${filesModified.join(", ")}`;
                try {
                  await (0, import_promises2.appendFile)(infoPath2, logEntry, "utf-8");
                } catch (e) {
                  try {
                    await (0, import_promises2.writeFile)(infoPath2, `# Project History
${logEntry}`, "utf-8");
                  } catch (e2) {
                  }
                }
              }
              return { response: finalContent, filesModified };
            };
            const primaryResult = await runAgentLoop(agent_role, task, context, 8, false, currentWorkingDirectory);
            if (primaryResult.error) return { error: primaryResult.error };
            let finalResponse = primaryResult.response;
            if (debugMode && primaryResult.filesModified.length > 0) {
              const filesToCheck = primaryResult.filesModified.join(", ");
              const debugTask = `Review the code in these files: ${filesToCheck}. Check for bugs, syntax errors, or logic flaws. If you find any, use 'save_file' to FIX them. If they are correct, confirm it.`;
              let debugContext = "Here is the content of the created files:\n";
              for (const f of primaryResult.filesModified) {
                try {
                  const c = await (0, import_promises2.readFile)((0, import_path3.join)(currentWorkingDirectory, f), "utf-8");
                  debugContext += `
--- ${f} ---
${c}
`;
                } catch (e) {
                }
              }
              const debugResult = await runAgentLoop("reviewer", debugTask, debugContext, 5, true, currentWorkingDirectory);
              finalResponse += "\n\n--- Auto-Debug Report ---\n" + (debugResult.response || "Debug pass completed.");
              if (debugResult.filesModified.length > 0) {
                finalResponse += `
(The reviewer fixed these files: ${debugResult.filesModified.join(", ")})`;
              }
            }
            if (primaryResult.filesModified.length > 0) {
              const fullPaths = primaryResult.filesModified.map((f) => {
                if ((0, import_path3.isAbsolute)(f)) return f;
                return (0, import_path3.join)(currentWorkingDirectory, f);
              });
              finalResponse += `

[GENERATED_FILES]: ${fullPaths.join(", ")}`;
              if (showFullCode) {
                finalResponse += `

### Generated Code Content:
`;
                for (const f of primaryResult.filesModified) {
                  try {
                    const fpath = (0, import_path3.isAbsolute)(f) ? f : (0, import_path3.join)(currentWorkingDirectory, f);
                    const content = await (0, import_promises2.readFile)(fpath, "utf-8");
                    const ext = f.split(".").pop() || "txt";
                    finalResponse += `
**${f}**
\`\`\`${ext}
${content}
\`\`\`
`;
                  } catch (e) {
                  }
                }
              }
            }
            if (!showFullCode) {
              finalResponse = finalResponse.replace(/```[\s\S]*?```/g, "\n[System: Code Block Hidden for Brevity. The code has been handled/saved by the sub-agent. Do NOT request it again. Proceed.]\n");
            }
            return { response: finalResponse, generated_files: primaryResult.filesModified };
          },
          enableSecondary,
          "agent_secondary_consult"
        )
      });
      tools.push(consultSecondaryAgentTool);
      return tools;
    };
  }
});










// C:/Users/Victor/.lmstudio/extensions/plugins/beledarian/beledarians-lm-studio-tools/src/toolsDocumentation.ts
var TOOLS_DOCUMENTATION;
var init_toolsDocumentation = __esm({
  "C:/Users/Victor/.lmstudio/extensions/plugins/beledarian/beledarians-lm-studio-tools/src/toolsDocumentation.ts"() {
    "use strict";
    TOOLS_DOCUMENTATION = [
      "# System Instructions: Local Development Assistant",
      "",
      "You are an AI assistant with direct access to the user's local file system and development environment via a suite of tools. Your goal is to help the user complete tasks efficiently and safely.",
      "",
      '## ? Core Workflow',
      '1. **Explore:** Always start by listing files (`list_directory`) to understand the project structure.',
      '2. **Read:** Read relevant files (`read_file`) to understand the context/codebase before making any changes.',
      '3. **Plan:** Formulate a plan based on the file contents.',
      '4. **Execute:** Use the appropriate tools to carry out your plan.',
      '5. **Verify:** Check your work (e.g., run tests, read back files) to ensure correctness.',
      '',
      '## ? Tool Reference',
      '',
      '### ? File System',
      '- `directory_list_files_dirs(path?)`: Lists files/folders in the current directory or a specific path. **Use this often.**',
      '- `file_read_content(file_name)`: Reads the content of a text file.',
      '- `file_save(file_name, content)`: Creates or completely overwrites a file.',
      '- `file_replace_text_within(file_name, old_string, new_string)`: Replaces specific text in a file.',
      '- `search_file_content(query, path?)`: Searches for a string within all files in a directory (recursive).',
      '- `directory_make_mkdir(directory_name)`: Creates a new directory path.',
      '- `file_or_directory_move_or_rename(source, destination)`: Moves or renames a file/directory.',
      '- `file_copy(source, destination)`: Copies a file.',
      '- `path_delete(path)`: **DESTRUCTIVE!** Permanently deletes a file or directory.',
      '- `files_by_pattern_delete(pattern)`: Deletes multiple files matching a regex (e.g. `^temp_.*`).',
      '- `files_by_pattern_find(pattern)`: Finds files matching a glob pattern (e.g., `**/*.ts`).',
      '- `get_file_metadata(file_name)`: Gets size and modification dates.',
      '- `directory_current_change(directory)`: Changes the working directory for future commands. **Use this to navigate to subdirectories and gain file system access within different parts of the workspace.**',
      '',
      '### ? Git & Version Control',
      '- `git_get_status_current()`: View modified files.',
      '- `git_get_diff(file_path?, cached?)`: See changes in detail.',
      '- `git_commit_changes_to_repository(message)`: Commit staged changes.',
      '- `git_get_log_commit_history(max_count?)`: View commit history.',
      '',
      '### ? Advanced File Tools',
      '- `document_pdf_docx_content_read(file_path)`: Parse text from .pdf or .docx files.',
      '- `project_analyze()`: Run configured linters (ESLint, Pylint) to find code issues.',
      '- `database_sqlite_query_execute(db_path, query)`: Run READ-ONLY SQL queries on SQLite databases.',
      '- `notification_send(title, message)`: Show a desktop notification (useful for long tasks).',
      '',
      '### ? Execution & Terminal',
      '- `shell_command_execute(command, input?)`: Runs a shell command in the *background*. Use for build scripts, git commands, etc. Returns stdout/stderr.',
      '- `terminal_open_command_run(command)`: Opens a **visible, interactive** terminal window. Use for long-running servers or scripts requiring user interaction.',
      '- `command_as_test_run(command)`: Specific wrapper for running tests (e.g., `npm test`).',
      '- `run_javascript(javascript)`: Executes a sandboxed JS/TS snippet (via Deno).',
      '- `run_python(python)`: Executes a Python script (requires system Python).',
      '',
      '### ? Web & Research',
      '- `web_search_with_providers(query, providers?)`: Performs a web search. By default, uses a fallback chain: DuckDuckGo API -> DuckDuckGo Puppeteer -> Google -> Bing. You can optionally specify `providers: ["google", "bing"]` to manually select search engines.',
      '- `web_search_on_wikipedia_english(query)`: Searches Wikipedia and returns article summaries.',
      '- `web_URL_content_fetch_text(url)`: Scrapes the text content of a webpage.',
      '- `rag_on_web_URL_text(url, query)`: Fetches a page and returns *only* snippets relevant to your query. Best for long docs.',
      '- `rag_on_files_local(query, path?)`: Semantic search over local files in your workspace. Use to find code or info.',
      '- `web_browser_open_page(url)`: Renders a page in a headless browser (Puppeteer). Use for dynamic/JS-heavy sites.',
      '',
      '### ? System & Utility',
      '- `clipboard_read_text()`: Reads text from the system clipboard.',
      '- `clipboard_write_text(text)`: Writes text to the system clipboard.',
      '- `system_get_info()`: Returns OS, CPU, and Memory details.',
      '- `file_or_URL_open_defaultapp(path)`: Opens a file or URL in the default system application.',
      '- `HTML_render_preview(html_content)`: Opens a local HTML preview in the browser.',
      '',
      '### ? Agents & Memory',
      '- `memory_longterm_save(text)`: Saves a fact/preference to `memory.md`. Use this to remember user preferences, project conventions, or specific instructions across sessions.',
      '- `agent_secondary_consult(task, agent_role?)`: Delegate a task to a specialized Sub-Agent. **Use this for complex coding tasks or research.**\n    - The Sub-Agent will automatically CREATE and SAVE files. You do NOT need to save them yourself.\n    - **IMPORTANT:** If the tool output says `[System: Code Block Hidden for Brevity...]`, this is a **SUCCESS** message. It means the file has been written to disk. **DO NOT** complain about "hidden code" or ask for the full content again. Simply proceed by verifying the files exist using `list_directory` or `read_file`. Trust the `[GENERATED_FILES]` list.',
  '',
      '## ?? Best Practices',
      "- **Safety:** You are operating on a real machine. Be careful with `path_delete` and `shell_command_execute`.',
      "- **Context:** If a file is huge, prefer `file_read_content` with line numbers (if available) or rely on `files_by_pattern_find` to narrow down targets.',
      "- **Formatting:** Always use Markdown code blocks for code generation. Use single backticks for file paths.",
      '- **Git:** You can use `shell_command_execute("git ...")` to manage version control if the user asks.',
      "",
      "## Safety Settings",
      'Tools capable of code execution (Python, JavaScript, Shell, Terminal) are controlled by "Allow" toggles in the plugin settings.',
      '- **Disabled (Default):** The tool is completely blocked. If you need to use it, ask the user to enable the specific "Allow [X]" setting.',
      "- **Enabled:** The tool executes immediately without confirmation."
    ].join("\n");
  }
});

// C:/Users/Victor/.lmstudio/extensions/plugins/beledarian/beledarians-lm-studio-tools/src/promptPreprocessor.ts
async function promptPreprocessor(ctl, userMessage) {
  const userPrompt = userMessage.getText();
  const history = await ctl.pullHistory();
  let isFirstTurn = false;
  if (Array.isArray(history)) {
    isFirstTurn = history.length === 0;
  } else if ("messages" in history && Array.isArray(history.messages)) {
    isFirstTurn = history.messages.length === 0;
  } else if ("length" in history && typeof history.length === "number") {
    isFirstTurn = history.length === 0;
  } else {
    isFirstTurn = true;
  }
  history.append(userMessage);
  const newFiles = userMessage.getFiles(ctl.client).filter((f) => f.type !== "image");
  const files = history.getAllFiles(ctl.client).filter((f) => f.type !== "image");
  let processingResult = null;
  if (newFiles.length > 0) {
    const strategy = await chooseContextInjectionStrategy(ctl, userPrompt, newFiles);
    if (strategy === "inject-full-content") {
      processingResult = await prepareDocumentContextInjection(ctl, userMessage);
    } else if (strategy === "retrieval") {
      processingResult = await prepareRetrievalResultsContextInjection(ctl, userPrompt, files);
    }
  } else if (files.length > 0) {
    processingResult = await prepareRetrievalResultsContextInjection(ctl, userPrompt, files);
  }
  let currentContent;
  if (processingResult) {
    if (typeof processingResult === "string") {
      currentContent = processingResult;
    } else {
      currentContent = processingResult.getText();
    }
  } else {
    currentContent = userPrompt;
  }
  const pluginConfig = ctl.getPluginConfig(pluginConfigSchematics);
  const frequency = pluginConfig.get("subAgentFrequency");
  const debugMode = pluginConfig.get("enableDebugMode");
  let delegationHint = "";
  if (frequency === "always") {
    delegationHint = "\n\n**SYSTEM MANDATE:** You MUST delegate ALL information retrieval, news summaries, and **ALL coding tasks** (creation, editing, refactoring) to the secondary agent. Do NOT write code or use search tools yourself. Use `agent_secondary_consult` with `allow_tools: true`.\n\n**PRE-DELEGATION CHECKLIST:**\n1. Run `list_directory` to see what files already exist.\n2. Read `beledarian_info.md` or `README.md` if present.\n3. CALL `agent_secondary_consult` with the context.";
  } else if (frequency === "when_useful") {
    delegationHint = "\n\n**SYSTEM ADVICE:** For complex tasks (e.g., 'create an app', 'refactor this module', 'research and summarize'), you **MUST** delegate to the secondary agent using `agent_secondary_consult` (set `allow_tools: true`).\n\n**Why Delegate?**\n- The Sub-Agent has a specialized loop for coding and debugging.\n- It will automatically SAVE all files. You do not need to do it.\n\n**How to Delegate:**\n1. Gather context (`list_directory`, `read_file`).\n2. Call `agent_secondary_consult` with a clear task description and the context you found.\n";
    if (debugMode) {
      delegationHint += "Note: 'Auto-Debug' is ACTIVE. The Sub-Agent will verify and fix its own code. This is the safest way to generate code.\n";
    }
  } else if (frequency === "hard_tasks") {
    delegationHint = "\n\n**Delegation Hint:** Only delegate EXTREMELY complex or computationally expensive tasks to the secondary agent. Handle standard queries and file reads yourself.\n";
  }
  if (delegationHint) {
    currentContent += delegationHint;
  }
  const enableSecondary = pluginConfig.get("enableSecondaryAgent");
  const state = await getPersistedState();
  if (isFirstTurn) {
    state.subAgentDocsInjected = false;
    await savePersistedState(state);
  }
  if (enableSecondary && !state.subAgentDocsInjected) {
    try {
      const { currentWorkingDirectory } = state;
      const subAgentDocsPath = (0, import_path4.join)(currentWorkingDirectory, "subagent_docs.md");
      const docsContent = await (0, import_promises3.readFile)(subAgentDocsPath, "utf-8");
      if (docsContent && docsContent.trim().length > 0) {
        currentContent += `

---

${docsContent}

---

`;
        ctl.debug("subagent_docs.md injected into context.");
        state.subAgentDocsInjected = true;
        await savePersistedState(state);
      }
    } catch (e) {
      ctl.debug("subagent_docs.md not found or failed to load. Skipping injection.");
    }
  }
  if (isFirstTurn) {
    let injectionContent = TOOLS_DOCUMENTATION;
    try {
      const { currentWorkingDirectory } = await getPersistedState();
      const startupPath = (0, import_path4.join)(currentWorkingDirectory, "startup.md");
      const startupContent = await (0, import_promises3.readFile)(startupPath, "utf-8");
      const filesToRead = startupContent.split("\n").map((f) => f.trim()).filter((f) => f);
      for (const file of filesToRead) {
        const filePath = (0, import_path4.join)(currentWorkingDirectory, file);
        try {
          const fileContent = await (0, import_promises3.readFile)(filePath, "utf-8");
          if (fileContent.trim().length > 0) {
            injectionContent = `

---

${fileContent}

---

${injectionContent}`;
            ctl.debug(`${file} loaded and injected into context.`);
          }
        } catch (e) {
          ctl.debug(`Failed to load ${file} from startup.md.`);
        }
      }
    } catch (e) {
      ctl.debug("No startup.md file found or failed to load.");
    }
    currentContent = `${injectionContent}

---

${currentContent}`;
  }
  if (currentContent !== userPrompt) {
    return currentContent;
  }
  try {
    const state2 = await getPersistedState();
    state2.messageCount++;
    await savePersistedState(state2);
  } catch (e) {
    ctl.debug("Failed to update message count or memory.", e);
  }
  return userMessage;
}
async function prepareRetrievalResultsContextInjection(ctl, originalUserPrompt, files) {
  const pluginConfig = ctl.getPluginConfig(pluginConfigSchematics);
  const retrievalLimit = pluginConfig.get("retrievalLimit");
  const retrievalAffinityThreshold = pluginConfig.get("retrievalAffinityThreshold");
  const statusSteps = /* @__PURE__ */ new Map();
  const retrievingStatus = ctl.createStatus({
    status: "loading",
    text: `Loading an embedding model for retrieval...`
  });
  const model = await ctl.client.embedding.model("nomic-ai/nomic-embed-text-v1.5-GGUF", {
    signal: ctl.abortSignal
  });
  retrievingStatus.setState({
    status: "loading",
    text: `Retrieving relevant citations for user query...`
  });
  const result = await ctl.client.files.retrieve(originalUserPrompt, files, {
    embeddingModel: model,
    // Affinity threshold: 0.6 not implemented in SDK retrieve options directly usually, 
    // but we filter below.
    limit: retrievalLimit,
    signal: ctl.abortSignal,
    onFileProcessList(filesToProcess) {
      for (const file of filesToProcess) {
        statusSteps.set(
          file,
          retrievingStatus.addSubStatus({
            status: "waiting",
            text: `Process ${file.name} for retrieval`
          })
        );
      }
    },
    onFileProcessingStart(file) {
      statusSteps.get(file).setState({ status: "loading", text: `Processing ${file.name} for retrieval` });
    },
    onFileProcessingEnd(file) {
      statusSteps.get(file).setState({ status: "done", text: `Processed ${file.name} for retrieval` });
    },
    onFileProcessingStepProgress(file, step, progressInStep) {
      const verb = step === "loading" ? "Loading" : step === "chunking" ? "Chunking" : "Embedding";
      statusSteps.get(file).setState({
        status: "loading",
        text: `${verb} ${file.name} for retrieval (${(progressInStep * 100).toFixed(1)}%)`
      });
    }
  });
  result.entries = result.entries.filter((entry) => entry.score > retrievalAffinityThreshold);
  let processedContent = "";
  const numRetrievals = result.entries.length;
  if (numRetrievals > 0) {
    retrievingStatus.setState({
      status: "done",
      text: `Retrieved ${numRetrievals} relevant citations for user query`
    });
    ctl.debug("Retrieval results", result);
    const prefix = "The following citations were found in the files provided by the user:\n\n";
    processedContent += prefix;
    let citationNumber = 1;
    result.entries.forEach((result2) => {
      const completeText = result2.content;
      processedContent += `Citation ${citationNumber}: "${completeText}"

`;
      citationNumber++;
    });
    await ctl.addCitations(result);
    const suffix = `Use the citations above to respond to the user query, only if they are relevant. Otherwise, respond to the best of your ability without them.

User Query:

${originalUserPrompt}`;
    processedContent += suffix;
  } else {
    retrievingStatus.setState({
      status: "canceled",
      text: `No relevant citations found for user query`
    });
    ctl.debug("No relevant citations found for user query");
    const noteAboutNoRetrievalResultsFound = `Important: No citations were found in the user files for the user query. In less than one sentence, inform the user of this. Then respond to the query to the best of your ability.`;
    processedContent = noteAboutNoRetrievalResultsFound + `

User Query:

${originalUserPrompt}`;
  }
  ctl.debug("Processed content", processedContent);
  return processedContent;
}
async function prepareDocumentContextInjection(ctl, input) {
  const documentInjectionSnippets = /* @__PURE__ */ new Map();
  const files = input.consumeFiles(ctl.client, (file) => file.type !== "image");
  for (const file of files) {
    const { content } = await ctl.client.files.parseDocument(file, {
      signal: ctl.abortSignal
    });
    ctl.debug(import_sdk3.text`
      Strategy: inject-full-content. Injecting full content of file '${file}' into the
      context. Length: ${content.length}.
    `);
    documentInjectionSnippets.set(file, content);
  }
  let formattedFinalUserPrompt = "";
  if (documentInjectionSnippets.size > 0) {
    formattedFinalUserPrompt += "This is a Enriched Context Generation scenario.\n\nThe following content was found in the files provided by the user.\n";
    for (const [fileHandle, snippet] of documentInjectionSnippets) {
      formattedFinalUserPrompt += `

** ${fileHandle.name} full content **

${snippet}

** end of ${fileHandle.name} **

`;
    }
    formattedFinalUserPrompt += `Based on the content above, please provide a response to the user query.

User query: ${input.getText()}`;
  }
  input.replaceText(formattedFinalUserPrompt);
  return input;
}
async function measureContextWindow(ctx, model) {
  const currentContextFormatted = await model.applyPromptTemplate(ctx);
  const totalTokensInContext = await model.countTokens(currentContextFormatted);
  const modelContextLength = await model.getContextLength();
  const modelRemainingContextLength = modelContextLength - totalTokensInContext;
  const contextOccupiedPercent = totalTokensInContext / modelContextLength * 100;
  return {
    totalTokensInContext,
    modelContextLength,
    modelRemainingContextLength,
    contextOccupiedPercent
  };
}
async function chooseContextInjectionStrategy(ctl, originalUserPrompt, files) {
  const status = ctl.createStatus({
    status: "loading",
    text: `Deciding how to handle the document(s)...`
  });
  const model = await ctl.client.llm.model();
  const ctx = await ctl.pullHistory();
  const {
    totalTokensInContext,
    modelContextLength,
    modelRemainingContextLength,
    contextOccupiedPercent
  } = await measureContextWindow(ctx, model);
  ctl.debug(
    `Context measurement result:

	Total tokens in context: ${totalTokensInContext}
	Model context length: ${modelContextLength}
	Model remaining context length: ${modelRemainingContextLength}
	Context occupied percent: ${contextOccupiedPercent.toFixed(2)}%
`
  );
  let totalFileTokenCount = 0;
  let totalReadTime = 0;
  let totalTokenizeTime = 0;
  for (const file of files) {
    const startTime = performance.now();
    const loadingStatus = status.addSubStatus({
      status: "loading",
      text: `Loading parser for ${file.name}...`
    });
    let actionProgressing = "Reading";
    let parserIndicator = "";
    const { content } = await ctl.client.files.parseDocument(file, {
      signal: ctl.abortSignal,
      onParserLoaded: (parser) => {
        loadingStatus.setState({
          status: "loading",
          text: `${parser.library} loaded for ${file.name}...`
        });
        if (parser.library !== "builtIn") {
          actionProgressing = "Parsing";
          parserIndicator = ` with ${parser.library}`;
        }
      },
      onProgress: (progress) => {
        loadingStatus.setState({
          status: "loading",
          text: `${actionProgressing} file ${file.name}${parserIndicator}... (${(progress * 100).toFixed(2)}%)`
        });
      }
    });
    loadingStatus.remove();
    totalReadTime += performance.now() - startTime;
    const startTokenizeTime = performance.now();
    totalFileTokenCount += await model.countTokens(content);
    totalTokenizeTime += performance.now() - startTokenizeTime;
    if (totalFileTokenCount > modelRemainingContextLength) {
      break;
    }
  }
  ctl.debug(`Total file read time: ${totalReadTime.toFixed(2)} ms`);
  ctl.debug(`Total tokenize time: ${totalTokenizeTime.toFixed(2)} ms`);
  ctl.debug(`Original User Prompt: ${originalUserPrompt}`);
  const userPromptTokenCount = (await model.tokenize(originalUserPrompt)).length;
  const totalFilePlusPromptTokenCount = totalFileTokenCount + userPromptTokenCount;
  const contextOccupiedFraction = contextOccupiedPercent / 100;
  const targetContextUsePercent = 0.7;
  const targetContextUsage = targetContextUsePercent * (1 - contextOccupiedFraction);
  const availableContextTokens = Math.floor(modelRemainingContextLength * targetContextUsage);
  ctl.debug("Strategy Calculation:");
  ctl.debug(`	Total Tokens in All Files: ${totalFileTokenCount}`);
  ctl.debug(`	Total Tokens in User Prompt: ${userPromptTokenCount}`);
  ctl.debug(`	Model Context Remaining: ${modelRemainingContextLength} tokens`);
  ctl.debug(`	Context Occupied: ${contextOccupiedPercent.toFixed(2)}%`);
  ctl.debug(`	Available Tokens: ${availableContextTokens}
`);
  if (totalFilePlusPromptTokenCount > availableContextTokens) {
    const chosenStrategy2 = "retrieval";
    ctl.debug(
      `Chosen context injection strategy: '${chosenStrategy2}'. Total file + prompt token count: ${totalFilePlusPromptTokenCount} > ${targetContextUsage * 100}% * available context tokens: ${availableContextTokens}`
    );
    status.setState({
      status: "done",
      text: `Chosen context injection strategy: '${chosenStrategy2}'. Retrieval is optimal for the size of content provided`
    });
    return chosenStrategy2;
  }
  const chosenStrategy = "inject-full-content";
  status.setState({
    status: "done",
    text: `Chosen context injection strategy: '${chosenStrategy}'. All content can fit into the context`
  });
  return chosenStrategy;
}
var import_sdk3, import_promises3, import_path4;
var init_promptPreprocessor = __esm({
  "C:/Users/Victor/.lmstudio/extensions/plugins/beledarian/beledarians-lm-studio-tools/src/promptPreprocessor.ts"() {
    "use strict";
    import_sdk3 = require("@lmstudio/sdk");
    import_promises3 = require("fs/promises");
    import_path4 = require("path");
    init_config();
    init_toolsDocumentation();
    init_stateManager();
  }
});

// C:/Users/Victor/.lmstudio/extensions/plugins/beledarian/beledarians-lm-studio-tools/src/index.ts
var src_exports = {};
__export(src_exports, {
  main: () => main
});
async function main(context) {
  context.withConfigSchematics(pluginConfigSchematics);
  context.withToolsProvider(toolsProvider);
  context.withPromptPreprocessor(promptPreprocessor);
}
var init_src = __esm({
  "C:/Users/Victor/.lmstudio/extensions/plugins/beledarian/beledarians-lm-studio-tools/src/index.ts"() {
    "use strict";
    init_toolsProvider();
    init_promptPreprocessor();
    init_config();
  }
});

// C:/Users/Victor/.lmstudio/extensions/plugins/beledarian/beledarians-lm-studio-tools/.lmstudio/entry.ts
var import_sdk4 = require("@lmstudio/sdk");
var clientIdentifier = process.env.LMS_PLUGIN_CLIENT_IDENTIFIER;
var clientPasskey = process.env.LMS_PLUGIN_CLIENT_PASSKEY;
var baseUrl = process.env.LMS_PLUGIN_BASE_URL;
var client = new import_sdk4.LMStudioClient({
  clientIdentifier,
  clientPasskey,
  baseUrl
});
globalThis.__LMS_PLUGIN_CONTEXT = true;
var predictionLoopHandlerSet = false;
var promptPreprocessorSet = false;
var configSchematicsSet = false;
var globalConfigSchematicsSet = false;
var toolsProviderSet = false;
var generatorSet = false;
var selfRegistrationHost = client.plugins.getSelfRegistrationHost();
var pluginContext = {
  withPredictionLoopHandler: (generate) => {
    if (predictionLoopHandlerSet) {
      throw new Error("PredictionLoopHandler already registered");
    }
    if (toolsProviderSet) {
      throw new Error("PredictionLoopHandler cannot be used with a tools provider");
    }
    predictionLoopHandlerSet = true;
    selfRegistrationHost.setPredictionLoopHandler(generate);
    return pluginContext;
  },
  withPromptPreprocessor: (preprocess) => {
    if (promptPreprocessorSet) {
      throw new Error("PromptPreprocessor already registered");
    }
    promptPreprocessorSet = true;
    selfRegistrationHost.setPromptPreprocessor(preprocess);
    return pluginContext;
  },
  withConfigSchematics: (configSchematics) => {
    if (configSchematicsSet) {
      throw new Error("Config schematics already registered");
    }
    configSchematicsSet = true;
    selfRegistrationHost.setConfigSchematics(configSchematics);
    return pluginContext;
  },
  withGlobalConfigSchematics: (globalConfigSchematics) => {
    if (globalConfigSchematicsSet) {
      throw new Error("Global config schematics already registered");
    }
    globalConfigSchematicsSet = true;
    selfRegistrationHost.setGlobalConfigSchematics(globalConfigSchematics);
    return pluginContext;
  },
  withToolsProvider: (toolsProvider2) => {
    if (toolsProviderSet) {
      throw new Error("Tools provider already registered");
    }
    if (predictionLoopHandlerSet) {
      throw new Error("Tools provider cannot be used with a predictionLoopHandler");
    }
    toolsProviderSet = true;
    selfRegistrationHost.setToolsProvider(toolsProvider2);
    return pluginContext;
  },
  withGenerator: (generator) => {
    if (generatorSet) {
      throw new Error("Generator already registered");
    }
    generatorSet = true;
    selfRegistrationHost.setGenerator(generator);
    return pluginContext;
  }
};
Promise.resolve().then(() => (init_src(), src_exports)).then(async (module2) => {
  return await module2.main(pluginContext);
}).then(() => {
  selfRegistrationHost.initCompleted();
}).catch((error) => {
  console.error("Failed to execute the main function of the plugin.");
  console.error(error);
});
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2NvbmZpZy50cyIsICIuLi9zcmMvZmluZExNU3R1ZGlvSG9tZS50cyIsICIuLi9zcmMvc3RhdGVNYW5hZ2VyLnRzIiwgIi4uL3NyYy90b29sc1Byb3ZpZGVyLnRzIiwgIi4uL3NyYy90b29sc0RvY3VtZW50YXRpb24udHMiLCAiLi4vc3JjL3Byb21wdFByZXByb2Nlc3Nvci50cyIsICIuLi9zcmMvaW5kZXgudHMiLCAiZW50cnkudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7IGNyZWF0ZUNvbmZpZ1NjaGVtYXRpY3MgfSBmcm9tIFwiQGxtc3R1ZGlvL3Nka1wiO1xyXG5cclxuZXhwb3J0IGNvbnN0IHBsdWdpbkNvbmZpZ1NjaGVtYXRpY3MgPSBjcmVhdGVDb25maWdTY2hlbWF0aWNzKClcclxuICAuZmllbGQoXCJyZXRyaWV2YWxMaW1pdFwiLCBcIm51bWVyaWNcIiwge1xyXG4gICAgaW50OiB0cnVlLFxyXG4gICAgbWluOiAxLFxyXG4gICAgZGlzcGxheU5hbWU6IFwiUmV0cmlldmFsIExpbWl0XCIsXHJcbiAgICBzdWJ0aXRsZTogXCJXaGVuIHJldHJpZXZhbCBpcyB0cmlnZ2VyZWQsIHRoaXMgaXMgdGhlIG1heGltdW0gbnVtYmVyIG9mIGNodW5rcyB0byByZXR1cm4uXCIsXHJcbiAgICBzbGlkZXI6IHsgbWluOiAxLCBtYXg6IDEwLCBzdGVwOiAxIH0sXHJcbiAgfSwgMylcclxuICAuZmllbGQoXCJyZXRyaWV2YWxBZmZpbml0eVRocmVzaG9sZFwiLCBcIm51bWVyaWNcIiwge1xyXG4gICAgbWluOiAwLjAsXHJcbiAgICBtYXg6IDEuMCxcclxuICAgIGRpc3BsYXlOYW1lOiBcIlJldHJpZXZhbCBBZmZpbml0eSBUaHJlc2hvbGRcIixcclxuICAgIHN1YnRpdGxlOiBcIlRoZSBtaW5pbXVtIHNpbWlsYXJpdHkgc2NvcmUgZm9yIGEgY2h1bmsgdG8gYmUgY29uc2lkZXJlZCByZWxldmFudC5cIixcclxuICAgIHNsaWRlcjogeyBtaW46IDAuMCwgbWF4OiAxLjAsIHN0ZXA6IDAuMDEgfSxcclxuICB9LCAwLjUpXHJcbiAgLmZpZWxkKFwiYWxsb3dKYXZhc2NyaXB0RXhlY3V0aW9uXCIsIFwiYm9vbGVhblwiLCB7XHJcbiAgICBkaXNwbGF5TmFtZTogXCJBbGxvdyBKYXZhU2NyaXB0IEV4ZWN1dGlvblwiLFxyXG4gICAgc3VidGl0bGU6IFwiRW5hYmxlIHRoZSAncnVuX2phdmFzY3JpcHQnIHRvb2wuIERBTkdFUjogQ29kZSBydW5zIG9uIHlvdXIgbWFjaGluZS5cIixcclxuICB9LCBmYWxzZSlcclxuICAuZmllbGQoXCJhbGxvd1B5dGhvbkV4ZWN1dGlvblwiLCBcImJvb2xlYW5cIiwge1xyXG4gICAgZGlzcGxheU5hbWU6IFwiQWxsb3cgUHl0aG9uIEV4ZWN1dGlvblwiLFxyXG4gICAgc3VidGl0bGU6IFwiRW5hYmxlIHRoZSAncnVuX3B5dGhvbicgdG9vbC4gREFOR0VSOiBDb2RlIHJ1bnMgb24geW91ciBtYWNoaW5lLlwiLFxyXG4gIH0sIGZhbHNlKVxyXG4gIC5maWVsZChcImFsbG93VGVybWluYWxFeGVjdXRpb25cIiwgXCJib29sZWFuXCIsIHtcclxuICAgIGRpc3BsYXlOYW1lOiBcIkFsbG93IFRlcm1pbmFsIEV4ZWN1dGlvblwiLFxyXG4gICAgc3VidGl0bGU6IFwiRW5hYmxlIHRoZSAncnVuX2luX3Rlcm1pbmFsJyB0b29sLiBPcGVucyByZWFsIHRlcm1pbmFsIHdpbmRvd3MuXCIsXHJcbiAgfSwgZmFsc2UpXHJcbiAgLmZpZWxkKFwiYWxsb3dTaGVsbENvbW1hbmRFeGVjdXRpb25cIiwgXCJib29sZWFuXCIsIHtcclxuICAgIGRpc3BsYXlOYW1lOiBcIkFsbG93IFNoZWxsIENvbW1hbmQgRXhlY3V0aW9uXCIsXHJcbiAgICBzdWJ0aXRsZTogXCJFbmFibGUgdGhlICdleGVjdXRlX2NvbW1hbmQnIHRvb2wuIERBTkdFUjogQ29tbWFuZHMgcnVuIG9uIHlvdXIgbWFjaGluZS5cIixcclxuICB9LCBmYWxzZSlcclxuICAuZmllbGQoXCJhbGxvd0dpdE9wZXJhdGlvbnNcIiwgXCJib29sZWFuXCIsIHtcclxuICAgIGRpc3BsYXlOYW1lOiBcIkFsbG93IEdpdCBPcGVyYXRpb25zXCIsXHJcbiAgICBzdWJ0aXRsZTogXCJFbmFibGUgZ2l0IHRvb2xzIChzdGF0dXMsIGNvbW1pdCwgZGlmZiwgbG9nKS5cIixcclxuICB9LCB0cnVlKVxyXG4gIC5maWVsZChcImFsbG93RGF0YWJhc2VJbnNwZWN0aW9uXCIsIFwiYm9vbGVhblwiLCB7XHJcbiAgICBkaXNwbGF5TmFtZTogXCJBbGxvdyBEYXRhYmFzZSBJbnNwZWN0aW9uXCIsXHJcbiAgICBzdWJ0aXRsZTogXCJFbmFibGUgJ3F1ZXJ5X2RhdGFiYXNlJyBmb3IgU1FMaXRlIGZpbGVzLlwiLFxyXG4gIH0sIGZhbHNlKVxyXG4gIC5maWVsZChcImFsbG93U3lzdGVtTm90aWZpY2F0aW9uc1wiLCBcImJvb2xlYW5cIiwge1xyXG4gICAgZGlzcGxheU5hbWU6IFwiQWxsb3cgU3lzdGVtIE5vdGlmaWNhdGlvbnNcIixcclxuICAgIHN1YnRpdGxlOiBcIkVuYWJsZSB0aGUgYWdlbnQgdG8gc2VuZCBPUyBub3RpZmljYXRpb25zLlwiLFxyXG4gIH0sIHRydWUpXHJcbiAgLmZpZWxkKFwiYWxsb3dBbGxDb2RlXCIsIFwiYm9vbGVhblwiLCB7XHJcbiAgICBkaXNwbGF5TmFtZTogXCJBbGxvdyBBbGwgQ29kZSBFeGVjdXRpb25cIixcclxuICAgIHN1YnRpdGxlOiBcIk1BU1RFUiBTV0lUQ0g6IE92ZXJyaWRlcyBhbGwgb3RoZXIgc2V0dGluZ3MgdG8gZW5hYmxlIEFMTCBleGVjdXRpb24gdG9vbHMuXCIsXHJcbiAgfSwgZmFsc2UpXHJcbiAgLmZpZWxkKFwic2VhcmNoQXBpS2V5XCIsIFwic3RyaW5nXCIsIHtcclxuICAgIGRpc3BsYXlOYW1lOiBcIlNlYXJjaCBBUEkgS2V5XCIsXHJcbiAgICBzdWJ0aXRsZTogXCJPcHRpb25hbCBBUEkga2V5IGZvciBzZWFyY2ggc2VydmljZXMgKGlmIHN1cHBvcnRlZCkgdG8gYXZvaWQgcmF0ZSBsaW1pdHMuXCIsXHJcbiAgfSwgXCJcIilcclxuICAuZmllbGQoXCJlbWJlZGRpbmdNb2RlbFwiLCBcInN0cmluZ1wiLCB7XHJcbiAgICBkaXNwbGF5TmFtZTogXCJFbWJlZGRpbmcgTW9kZWxcIixcclxuICAgIHN1YnRpdGxlOiBcIk1vZGVsIHRvIHVzZSBmb3IgUkFHIGZlYXR1cmVzIChkZWZhdWx0OiBub21pYy1haS9ub21pYy1lbWJlZC10ZXh0LXYxLjUtR0dVRilcIixcclxuICB9LCBcIm5vbWljLWFpL25vbWljLWVtYmVkLXRleHQtdjEuNS1HR1VGXCIpXHJcbiAgICAuZmllbGQoXCJlbmFibGVNZW1vcnlcIiwgXCJib29sZWFuXCIsIHtcclxuICAgICAgZGlzcGxheU5hbWU6IFwiRW5hYmxlIE1lbW9yeVwiLFxyXG4gICAgICBzdWJ0aXRsZTogXCJJZiBlbmFibGVkLCB0aGUgbW9kZWwgY2FuIHNhdmUgYW5kIHJlY2FsbCBpbmZvcm1hdGlvbiBmcm9tIGEgJ21lbW9yeS5tZCcgZmlsZSBpbiB0aGUgd29ya3NwYWNlLlwiLFxyXG4gICAgfSwgZmFsc2UpXHJcbiAgICAuZmllbGQoXCJlbmFibGVXaWtpcGVkaWFUb29sXCIsIFwiYm9vbGVhblwiLCB7XHJcbiAgICAgIGRpc3BsYXlOYW1lOiBcIkVuYWJsZSBXaWtpcGVkaWEgVG9vbFwiLFxyXG4gICAgICBzdWJ0aXRsZTogXCJFbmFibGUgdGhlICd3aWtpcGVkaWFfc2VhcmNoJyB0b29sLlwiLFxyXG4gICAgfSwgdHJ1ZSlcclxuICAgIC5maWVsZChcImVuYWJsZUxvY2FsUmFnXCIsIFwiYm9vbGVhblwiLCB7XHJcbiAgICAgIGRpc3BsYXlOYW1lOiBcIkVuYWJsZSBMb2NhbCBSQUdcIixcclxuICAgICAgc3VidGl0bGU6IFwiRW5hYmxlIHRoZSAncmFnX2xvY2FsX2ZpbGVzJyB0b29sIGZvciBzZWFyY2hpbmcgd29ya3NwYWNlIGZpbGVzLlwiLFxyXG4gICAgfSwgdHJ1ZSlcclxuICAgIC5maWVsZChcImVuYWJsZVNlY29uZGFyeUFnZW50XCIsIFwiYm9vbGVhblwiLCB7XHJcbiAgICAgIGRpc3BsYXlOYW1lOiBcIkVuYWJsZSBTZWNvbmRhcnkgQWdlbnQvTW9kZWxcIixcclxuICAgICAgc3VidGl0bGU6IFwiQWxsb3cgdGhlIG1haW4gbW9kZWwgdG8gZGVsZWdhdGUgdGFza3MgdG8gYSBzZWNvbmRhcnkgbW9kZWwgKGUuZy4sIGZvciBzdW1tYXJpemF0aW9uKS5cIixcclxuICAgIH0sIGZhbHNlKVxyXG4gICAgLmZpZWxkKFwidXNlTWFpbk1vZGVsRm9yU3ViQWdlbnRcIiwgXCJib29sZWFuXCIsIHtcclxuICAgICAgZGlzcGxheU5hbWU6IFwiVXNlIE1haW4gTW9kZWwgYXMgU3ViLUFnZW50XCIsXHJcbiAgICAgIHN1YnRpdGxlOiBcIklmIGVuYWJsZWQsIHRoZSBzdWItYWdlbnQgbG9vcCB3aWxsIHVzZSB5b3VyIG1haW4gTE0gU3R1ZGlvIHNlcnZlciAobG9jYWxob3N0OjEyMzQpLiBJZ25vcmVzICdFbmRwb2ludCcgc2V0dGluZy5cIixcclxuICAgIH0sIGZhbHNlKVxyXG4gICAgLmZpZWxkKFwic2Vjb25kYXJ5QWdlbnRFbmRwb2ludFwiLCBcInN0cmluZ1wiLCB7XHJcbiAgICAgIGRpc3BsYXlOYW1lOiBcIlNlY29uZGFyeSBBZ2VudCBFbmRwb2ludFwiLFxyXG4gICAgICBzdWJ0aXRsZTogXCJUaGUgQVBJIGVuZHBvaW50IGZvciB0aGUgc2Vjb25kYXJ5IG1vZGVsIChlLmcuLCAnaHR0cDovL2xvY2FsaG9zdDoxMjM0L3YxJykuXCIsXHJcbiAgICB9LCBcImh0dHA6Ly9sb2NhbGhvc3Q6MTIzNC92MVwiKVxyXG4gICAgLmZpZWxkKFwic2Vjb25kYXJ5TW9kZWxJZFwiLCBcInN0cmluZ1wiLCB7XHJcbiAgICAgIGRpc3BsYXlOYW1lOiBcIlNlY29uZGFyeSBNb2RlbCBJRFwiLFxyXG4gICAgICBzdWJ0aXRsZTogXCJUaGUgSUQgb2YgdGhlIG1vZGVsIHRvIHVzZSBmb3IgdGhlIHNlY29uZGFyeSBhZ2VudCAobXVzdCBiZSBsb2FkZWQvYXZhaWxhYmxlKS5cIixcclxuICAgIH0sIFwibG9jYWwtbW9kZWxcIikgLy8gRGVmYXVsdCB0byBnZW5lcmljXHJcbiAgICAgICAgLmZpZWxkKFwic3ViQWdlbnRQcm9maWxlc1wiLCBcInN0cmluZ1wiLCB7XHJcbiAgICAgICAgICBkaXNwbGF5TmFtZTogXCJTdWItQWdlbnQgUHJvZmlsZXMgKEpTT04pXCIsXHJcbiAgICAgICAgICBzdWJ0aXRsZTogXCJEZWZpbmUgYXZhaWxhYmxlIHN1Yi1hZ2VudHMuIEZvcm1hdDoge1xcXCJjb2RlclxcXCI6IFxcXCJZb3UgYXJlIGEgY29kaW5nIGV4cGVydC4uLlxcXCIsIC4uLn1cIixcclxuICAgICAgICB9LCAne1wic3VtbWFyaXplclwiOiBcIllvdSBhcmUgYSBzdW1tYXJpemF0aW9uIGV4cGVydC4gU3VtbWFyaXplIHRoZSBjb250ZW50IGNvbmNpc2VseS5cIiwgXCJjb2RlclwiOiBcIllvdSBhcmUgYSBzb2Z0d2FyZSBlbmdpbmVlci4gV3JpdGUgZWZmaWNpZW50IGFuZCBzYWZlIGNvZGUuXCJ9JylcclxuICAgICAgICAgIC5maWVsZChcInN1YkFnZW50RnJlcXVlbmN5XCIsIFwic3RyaW5nXCIsIHtcclxuICAgICAgICAgICAgZGlzcGxheU5hbWU6IFwiU3ViLUFnZW50IEZyZXF1ZW5jeVwiLFxyXG4gICAgICAgICAgICBzdWJ0aXRsZTogXCJDb250cm9scyBob3cgb2Z0ZW4gdGhlIGFnZW50IGlzIGVuY291cmFnZWQgdG8gZGVsZWdhdGUuIE9wdGlvbnM6ICdhbHdheXMnLCAnd2hlbl91c2VmdWwnLCAnaGFyZF90YXNrcycsICduZXZlcicuXCIsXHJcbiAgICAgICAgICB9LCBcIndoZW5fdXNlZnVsXCIpXHJcbiAgICAgICAgICAuZmllbGQoXCJzdWJBZ2VudEFsbG93RmlsZVN5c3RlbVwiLCBcImJvb2xlYW5cIiwge1xyXG4gICAgICAgICAgICBkaXNwbGF5TmFtZTogXCJTdWItQWdlbnQ6IEFsbG93IEZpbGUgU3lzdGVtXCIsXHJcbiAgICAgICAgICAgIHN1YnRpdGxlOiBcIklmIGVuYWJsZWQsIHN1Yi1hZ2VudHMgY2FuIHJlYWQvbGlzdCBmaWxlcy5cIixcclxuICAgICAgICAgIH0sIHRydWUpXHJcbiAgICAgICAgICAuZmllbGQoXCJzdWJBZ2VudEFsbG93V2ViXCIsIFwiYm9vbGVhblwiLCB7XHJcbiAgICAgICAgICAgIGRpc3BsYXlOYW1lOiBcIlN1Yi1BZ2VudDogQWxsb3cgV2ViIFNlYXJjaFwiLFxyXG4gICAgICAgICAgICBzdWJ0aXRsZTogXCJJZiBlbmFibGVkLCBzdWItYWdlbnRzIGNhbiB1c2UgV2lraXBlZGlhIGFuZCBEdWNrRHVja0dvLlwiLFxyXG4gICAgICAgICAgfSwgdHJ1ZSlcclxuICAgICAgICAgICAgLmZpZWxkKFwic3ViQWdlbnRBbGxvd0NvZGVcIiwgXCJib29sZWFuXCIsIHtcclxuICAgICAgICAgICAgICBkaXNwbGF5TmFtZTogXCJTdWItQWdlbnQ6IEFsbG93IENvZGUgRXhlY3V0aW9uXCIsXHJcbiAgICAgICAgICAgICAgc3VidGl0bGU6IFwiSWYgZW5hYmxlZCwgc3ViLWFnZW50cyBjYW4gcnVuIFB5dGhvbi9KUyBjb2RlLiBEQU5HRVIhXCIsXHJcbiAgICAgICAgICAgIH0sIGZhbHNlKVxyXG4gICAgICAgICAgICAgIC5maWVsZChcImVuYWJsZURlYnVnTW9kZVwiLCBcImJvb2xlYW5cIiwge1xyXG4gICAgICAgICAgICAgICAgZGlzcGxheU5hbWU6IFwiRW5hYmxlIEF1dG8tRGVidWcgTW9kZVwiLFxyXG4gICAgICAgICAgICAgICAgc3VidGl0bGU6IFwiSWYgZW5hYmxlZCwgY29kaW5nIHRhc2tzIGRlbGVnYXRlZCB0byBzdWItYWdlbnRzIHdpbGwgYXV0b21hdGljYWxseSB0cmlnZ2VyIGEgc2Vjb25kICdSZXZpZXdlcicgcGFzcyB0byBjaGVjayBmb3IgZXJyb3JzLlwiLFxyXG4gICAgICAgICAgICAgIH0sIGZhbHNlKVxyXG4gICAgICAgICAgICAgICAgLmZpZWxkKFwic3ViQWdlbnRBdXRvU2F2ZVwiLCBcImJvb2xlYW5cIiwge1xyXG4gICAgICAgICAgICAgICAgICBkaXNwbGF5TmFtZTogXCJTdWItQWdlbnQ6IEF1dG8tU2F2ZSBDb2RlXCIsXHJcbiAgICAgICAgICAgICAgICAgIHN1YnRpdGxlOiBcIklmIGVuYWJsZWQsIGNvZGUgYmxvY2tzIGdlbmVyYXRlZCBieSB0aGUgc3ViLWFnZW50IHRoYXQgYXJlbid0IGV4cGxpY2l0bHkgc2F2ZWQgd2lsbCBiZSBhdXRvbWF0aWNhbGx5IHNhdmVkIHRvIGZpbGVzLlwiLFxyXG4gICAgICAgICAgICAgICAgfSwgdHJ1ZSlcclxuICAgICAgICAgICAgICAgIC5maWVsZChcInNob3dGdWxsQ29kZU91dHB1dFwiLCBcImJvb2xlYW5cIiwge1xyXG4gICAgICAgICAgICAgICAgICBkaXNwbGF5TmFtZTogXCJTaG93IEZ1bGwgQ29kZSBPdXRwdXRcIixcclxuICAgICAgICAgICAgICAgICAgc3VidGl0bGU6IFwiSWYgZW5hYmxlZCwgdGhlIE1haW4gQWdlbnQgd2lsbCBkaXNwbGF5IHRoZSBmdWxsIGNvZGUgY29udGVudCBvZiBnZW5lcmF0ZWQgZmlsZXMgaW5zdGVhZCBvZiBqdXN0IHRoZSBmaWxlIHBhdGhzLlwiLFxyXG4gICAgICAgICAgICAgICAgfSwgZmFsc2UpXHJcbiAgICAgICAgICAgICAgICAuYnVpbGQoKTtcclxuICAgICAgICAgICAgICAiLCAiaW1wb3J0IHsgZXhpc3RzU3luYywgcmVhZEZpbGVTeW5jLCByZWFscGF0aFN5bmMsIHdyaXRlRmlsZVN5bmMgfSBmcm9tIFwiZnNcIjtcclxuaW1wb3J0IHsgaG9tZWRpciB9IGZyb20gXCJvc1wiO1xyXG5pbXBvcnQgeyBqb2luIH0gZnJvbSBcInBhdGhcIjtcclxuXHJcbmxldCBsbXN0dWRpb0hvbWU6IHN0cmluZyB8IG51bGwgPSBudWxsO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRMTVN0dWRpb0hvbWUoKSB7XHJcbiAgaWYgKGxtc3R1ZGlvSG9tZSAhPT0gbnVsbCkge1xyXG4gICAgcmV0dXJuIGxtc3R1ZGlvSG9tZTtcclxuICB9XHJcblxyXG4gIC8vIGlmIGFwcGxpY2FibGUsIGNvbnZlcnQgcmVsYXRpdmUgcGF0aCB0byBhYnNvbHV0ZSBhbmQgZm9sbG93IHRoZSBzeW1saW5rXHJcbiAgY29uc3QgcmVzb2x2ZWRIb21lRGlyID0gcmVhbHBhdGhTeW5jKGhvbWVkaXIoKSk7XHJcblxyXG4gIGNvbnN0IHBvaW50ZXJGaWxlUGF0aCA9IGpvaW4ocmVzb2x2ZWRIb21lRGlyLCBcIi5sbXN0dWRpby1ob21lLXBvaW50ZXJcIik7XHJcbiAgaWYgKGV4aXN0c1N5bmMocG9pbnRlckZpbGVQYXRoKSkge1xyXG4gICAgbG1zdHVkaW9Ib21lID0gcmVhZEZpbGVTeW5jKHBvaW50ZXJGaWxlUGF0aCwgXCJ1dGYtOFwiKS50cmltKCk7XHJcbiAgICByZXR1cm4gbG1zdHVkaW9Ib21lO1xyXG4gIH1cclxuXHJcbiAgLy8gU2VlIGlmIH4vLmNhY2hlL2xtLXN0dWRpbyBleGlzdHMuIElmIGl0IGRvZXMsIHVzZSBpdC5cclxuICBjb25zdCBjYWNoZUhvbWUgPSBqb2luKHJlc29sdmVkSG9tZURpciwgXCIuY2FjaGVcIiwgXCJsbS1zdHVkaW9cIik7XHJcbiAgaWYgKGV4aXN0c1N5bmMoY2FjaGVIb21lKSkge1xyXG4gICAgbG1zdHVkaW9Ib21lID0gY2FjaGVIb21lO1xyXG4gICAgd3JpdGVGaWxlU3luYyhwb2ludGVyRmlsZVBhdGgsIGxtc3R1ZGlvSG9tZSwgXCJ1dGYtOFwiKTtcclxuICAgIHJldHVybiBsbXN0dWRpb0hvbWU7XHJcbiAgfVxyXG5cclxuICAvLyBPdGhlcndpc2UsIGZhbGxiYWNrIHRvIH4vLmxtc3R1ZGlvXHJcbiAgY29uc3QgaG9tZSA9IGpvaW4ocmVzb2x2ZWRIb21lRGlyLCBcIi5sbXN0dWRpb1wiKTtcclxuICBsbXN0dWRpb0hvbWUgPSBob21lO1xyXG4gIHdyaXRlRmlsZVN5bmMocG9pbnRlckZpbGVQYXRoLCBsbXN0dWRpb0hvbWUsIFwidXRmLThcIik7XHJcbiAgcmV0dXJuIGxtc3R1ZGlvSG9tZTtcclxufVxyXG4iLCAiaW1wb3J0IHsgcmVhZEZpbGUsIHdyaXRlRmlsZSwgbWtkaXIgfSBmcm9tIFwiZnMvcHJvbWlzZXNcIjtcclxuaW1wb3J0IHsgam9pbiB9IGZyb20gXCJwYXRoXCI7XHJcbmltcG9ydCAqIGFzIG9zIGZyb20gXCJvc1wiO1xyXG5cclxuY29uc3QgQ09ORklHX0ZJTEVfTkFNRSA9IFwiLnBsdWdpbl9zdGF0ZS5qc29uXCI7XHJcbmNvbnN0IERFRkFVTFRfRElSID0gam9pbihvcy5ob21lZGlyKCksIFwiLmJlbGVkYXJpYW5zLWxsbS10b29sYm94XCIsIFwid29ya3NwYWNlXCIpO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBQbHVnaW5TdGF0ZSB7XHJcbiAgY3VycmVudFdvcmtpbmdEaXJlY3Rvcnk6IHN0cmluZztcclxuICBtZXNzYWdlQ291bnQ6IG51bWJlcjtcclxuICBkb250QXNrVG9Db21wcmVzczogYm9vbGVhbjtcclxuICBzdWJBZ2VudERvY3NJbmplY3RlZDogYm9vbGVhbjtcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFBlcnNpc3RlZFN0YXRlKCk6IFByb21pc2U8UGx1Z2luU3RhdGU+IHtcclxuICB0cnkge1xyXG4gICAgY29uc3Qgc3RhdGVQYXRoID0gam9pbihvcy5ob21lZGlyKCksIFwiLmJlbGVkYXJpYW5zLWxsbS10b29sYm94XCIsIENPTkZJR19GSUxFX05BTUUpO1xyXG4gICAgY29uc3QgY29udGVudCA9IGF3YWl0IHJlYWRGaWxlKHN0YXRlUGF0aCwgXCJ1dGYtOFwiKTtcclxuICAgIGNvbnN0IHN0YXRlID0gSlNPTi5wYXJzZShjb250ZW50KTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGN1cnJlbnRXb3JraW5nRGlyZWN0b3J5OiBzdGF0ZS5jdXJyZW50V29ya2luZ0RpcmVjdG9yeSA/PyBERUZBVUxUX0RJUixcclxuICAgICAgbWVzc2FnZUNvdW50OiBzdGF0ZS5tZXNzYWdlQ291bnQgPz8gMCxcclxuICAgICAgZG9udEFza1RvQ29tcHJlc3M6IHN0YXRlLmRvbnRBc2tUb0NvbXByZXNzID8/IGZhbHNlLFxyXG4gICAgICBzdWJBZ2VudERvY3NJbmplY3RlZDogc3RhdGUuc3ViQWdlbnREb2NzSW5qZWN0ZWQgPz8gZmFsc2UsXHJcbiAgICB9O1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBjdXJyZW50V29ya2luZ0RpcmVjdG9yeTogREVGQVVMVF9ESVIsXHJcbiAgICAgIG1lc3NhZ2VDb3VudDogMCxcclxuICAgICAgZG9udEFza1RvQ29tcHJlc3M6IGZhbHNlLFxyXG4gICAgICBzdWJBZ2VudERvY3NJbmplY3RlZDogZmFsc2UsXHJcbiAgICB9O1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNhdmVQZXJzaXN0ZWRTdGF0ZShzdGF0ZTogUGx1Z2luU3RhdGUpIHtcclxuICB0cnkge1xyXG4gICAgY29uc3Qgc3RhdGVQYXRoID0gam9pbihvcy5ob21lZGlyKCksIFwiLmJlbGVkYXJpYW5zLWxsbS10b29sYm94XCIsIENPTkZJR19GSUxFX05BTUUpO1xyXG4gICAgY29uc3QgZGlyID0gam9pbihvcy5ob21lZGlyKCksIFwiLmJlbGVkYXJpYW5zLWxsbS10b29sYm94XCIpO1xyXG4gICAgYXdhaXQgbWtkaXIoZGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcclxuICAgIGF3YWl0IHdyaXRlRmlsZShzdGF0ZVBhdGgsIEpTT04uc3RyaW5naWZ5KHN0YXRlLCBudWxsLCAyKSwgXCJ1dGYtOFwiKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byBzYXZlIHBsdWdpbiBzdGF0ZTpcIiwgZXJyb3IpO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVuc3VyZVdvcmtzcGFjZUV4aXN0cyhwYXRoOiBzdHJpbmcpIHtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgYXdhaXQgbWtkaXIocGF0aCwgeyByZWN1cnNpdmU6IHRydWUgfSk7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYEZhaWxlZCB0byBjcmVhdGUvYWNjZXNzIGRpcmVjdG9yeSAke3BhdGh9YCwgZXJyb3IpO1xyXG4gICAgfVxyXG59XHJcbiIsICJpbXBvcnQgeyB0ZXh0LCB0b29sLCB0eXBlIFRvb2wsIHR5cGUgVG9vbHNQcm92aWRlciwgdHlwZSBMTVN0dWRpb0NsaWVudCB9IGZyb20gXCJAbG1zdHVkaW8vc2RrXCI7XHJcbmltcG9ydCB7IHNwYXduIH0gZnJvbSBcImNoaWxkX3Byb2Nlc3NcIjtcclxuaW1wb3J0IHsgcm0sIHdyaXRlRmlsZSwgcmVhZGRpciwgcmVhZEZpbGUsIHN0YXQsIG1rZGlyLCByZW5hbWUsIGNvcHlGaWxlLCBhcHBlbmRGaWxlIH0gZnJvbSBcImZzL3Byb21pc2VzXCI7XHJcbmltcG9ydCAqIGFzIG9zIGZyb20gXCJvc1wiO1xyXG5pbXBvcnQgeyBqb2luLCByZXNvbHZlLCBkaXJuYW1lLCBpc0Fic29sdXRlIH0gZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHsgeiB9IGZyb20gXCJ6b2RcIjtcclxuaW1wb3J0IHsgcGx1Z2luQ29uZmlnU2NoZW1hdGljcyB9IGZyb20gXCIuL2NvbmZpZ1wiO1xyXG5pbXBvcnQgeyBmaW5kTE1TdHVkaW9Ib21lIH0gZnJvbSBcIi4vZmluZExNU3R1ZGlvSG9tZVwiO1xyXG5pbXBvcnQgeyBnZXRQZXJzaXN0ZWRTdGF0ZSwgc2F2ZVBlcnNpc3RlZFN0YXRlLCBlbnN1cmVXb3Jrc3BhY2VFeGlzdHMgfSBmcm9tIFwiLi9zdGF0ZU1hbmFnZXJcIjtcclxuXHJcbi8vIC0tLSBTZWN1cml0eSBIZWxwZXIgLS0tXHJcbmZ1bmN0aW9uIHZhbGlkYXRlUGF0aChiYXNlRGlyOiBzdHJpbmcsIHJlcXVlc3RlZFBhdGg6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgY29uc3QgcmVzb2x2ZWQgPSByZXNvbHZlKGJhc2VEaXIsIHJlcXVlc3RlZFBhdGgpO1xyXG4gIC8vIE5vcm1hbGl6ZSBjaGVja2luZyB0byBwcmV2ZW50IGNhc2luZyBieXBhc3Mgb24gV2luZG93c1xyXG4gIGNvbnN0IGxvd2VyUmVzb2x2ZWQgPSByZXNvbHZlZC50b0xvd2VyQ2FzZSgpO1xyXG4gIGNvbnN0IGxvd2VyQmFzZSA9IHJlc29sdmUoYmFzZURpcikudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgaWYgKCFsb3dlclJlc29sdmVkLnN0YXJ0c1dpdGgobG93ZXJCYXNlKSkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKGBBY2Nlc3MgRGVuaWVkOiBQYXRoICcke3JlcXVlc3RlZFBhdGh9JyBpcyBvdXRzaWRlIHRoZSB3b3Jrc3BhY2UuYCk7XHJcbiAgfVxyXG4gIHJldHVybiByZXNvbHZlZDtcclxufVxyXG5cclxuY29uc3QgY3JlYXRlU2FmZVRvb2xJbXBsZW1lbnRhdGlvbiA9IDxUUGFyYW1ldGVycywgVFJldHVybj4oXHJcbiAgb3JpZ2luYWxJbXBsZW1lbnRhdGlvbjogKHBhcmFtczogVFBhcmFtZXRlcnMpID0+IFByb21pc2U8VFJldHVybj4sXHJcbiAgaXNFbmFibGVkOiBib29sZWFuLFxyXG4gIHRvb2xOYW1lOiBzdHJpbmcsXHJcbikgPT4gYXN5bmMgKHBhcmFtczogVFBhcmFtZXRlcnMpOiBQcm9taXNlPFRSZXR1cm4+ID0+IHtcclxuICBpZiAoIWlzRW5hYmxlZCkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKGBUb29sICcke3Rvb2xOYW1lfScgaXMgZGlzYWJsZWQgaW4gdGhlIHBsdWdpbiBzZXR0aW5ncy4gUGxlYXNlIGFzayB0aGUgdXNlciB0byBlbmFibGUgJ0FsbG93ICR7dG9vbE5hbWUucmVwbGFjZSgvXy9nLCBcIiBcIil9JyAob3Igc2ltaWxhcikgaW4gdGhlIHNldHRpbmdzLmApO1xyXG4gIH1cclxuICByZXR1cm4gb3JpZ2luYWxJbXBsZW1lbnRhdGlvbihwYXJhbXMpO1xyXG59O1xyXG5cclxuLy8gSGVscGVyIGZ1bmN0aW9uIGZvciBjb3NpbmUgc2ltaWxhcml0eVxyXG5mdW5jdGlvbiBjb3NpbmVTaW1pbGFyaXR5KHZlY0E6IG51bWJlcltdLCB2ZWNCOiBudW1iZXJbXSk6IG51bWJlciB7XHJcbiAgY29uc3QgZG90UHJvZHVjdCA9IHZlY0EucmVkdWNlKChhY2MsIHZhbCwgaSkgPT4gYWNjICsgdmFsICogdmVjQltpXSwgMCk7XHJcbiAgY29uc3QgbWFnQSA9IE1hdGguc3FydCh2ZWNBLnJlZHVjZSgoYWNjLCB2YWwpID0+IGFjYyArIHZhbCAqIHZhbCwgMCkpO1xyXG4gIGNvbnN0IG1hZ0IgPSBNYXRoLnNxcnQodmVjQi5yZWR1Y2UoKGFjYywgdmFsKSA9PiBhY2MgKyB2YWwgKiB2YWwsIDApKTtcclxuICBpZiAobWFnQSA9PT0gMCB8fCBtYWdCID09PSAwKSB7XHJcbiAgICByZXR1cm4gMDtcclxuICB9XHJcbiAgcmV0dXJuIGRvdFByb2R1Y3QgLyAobWFnQSAqIG1hZ0IpO1xyXG59XHJcblxyXG4vLyBNYWluIFJBRy1vbi10ZXh0IGhlbHBlclxyXG5hc3luYyBmdW5jdGlvbiBwZXJmb3JtUmFnT25UZXh0KHRleHQ6IHN0cmluZywgcXVlcnk6IHN0cmluZywgY2xpZW50OiBMTVN0dWRpb0NsaWVudCwgZW1iZWRkaW5nTW9kZWxOYW1lOiBzdHJpbmcpIHtcclxuICAvLyAxLiBMb2FkIGVtYmVkZGluZyBtb2RlbFxyXG4gIGNvbnN0IGVtYmVkZGluZ01vZGVsID0gYXdhaXQgY2xpZW50LmVtYmVkZGluZy5tb2RlbChlbWJlZGRpbmdNb2RlbE5hbWUpO1xyXG5cclxuICAvLyAyLiBDaHVuayB0aGUgdGV4dCAoc2ltcGxlIHBhcmFncmFwaC1iYXNlZCBjaHVua2luZylcclxuICBjb25zdCBjaHVua3MgPSB0ZXh0LnNwbGl0KC9cXG5cXHMqXFxuLykuZmlsdGVyKGNodW5rID0+IGNodW5rLnRyaW0oKS5sZW5ndGggPiAyMCk7XHJcbiAgaWYgKGNodW5rcy5sZW5ndGggPT09IDApIHtcclxuICAgIHJldHVybiBbeyBjaHVuazogdGV4dC5zdWJzdHJpbmcoMCwgNDAwMCksIHNjb3JlOiAxIH1dO1xyXG4gIH1cclxuXHJcbiAgLy8gMy4gRW1iZWQgcXVlcnkgYW5kIGNodW5rc1xyXG4gIGNvbnN0IFtxdWVyeUVtYmVkZGluZ10gPSBhd2FpdCBlbWJlZGRpbmdNb2RlbC5lbWJlZChbcXVlcnldKTtcclxuICBjb25zdCBjaHVua0VtYmVkZGluZ3MgPSBhd2FpdCBlbWJlZGRpbmdNb2RlbC5lbWJlZChjaHVua3MpO1xyXG5cclxuICAvLyA0LiBDYWxjdWxhdGUgc2ltaWxhcml0eVxyXG4gIGNvbnN0IHNpbWlsYXJpdGllcyA9IGNodW5rRW1iZWRkaW5ncy5tYXAoKGNodW5rRW1iLCBpKSA9PiAoe1xyXG4gICAgY2h1bms6IGNodW5rc1tpXSxcclxuICAgIHNjb3JlOiBjb3NpbmVTaW1pbGFyaXR5KHF1ZXJ5RW1iZWRkaW5nLmVtYmVkZGluZywgY2h1bmtFbWIuZW1iZWRkaW5nKSxcclxuICB9KSk7XHJcblxyXG4gIC8vIDUuIFNvcnQgYnkgc2NvcmUgYW5kIHJldHVybiB0b3AgcmVzdWx0c1xyXG4gIHNpbWlsYXJpdGllcy5zb3J0KChhLCBiKSA9PiBiLnNjb3JlIC0gYS5zY29yZSk7XHJcbiAgcmV0dXJuIHNpbWlsYXJpdGllcy5zbGljZSgwLCA1KTsgLy8gUmV0dXJuIHRvcCA1XHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBnZXREZW5vUGF0aCgpIHtcclxuICBjb25zdCBsbXN0dWRpb0hvbWUgPSBmaW5kTE1TdHVkaW9Ib21lKCk7XHJcbiAgY29uc3QgdXRpbFBhdGggPSBqb2luKGxtc3R1ZGlvSG9tZSwgXCIuaW50ZXJuYWxcIiwgXCJ1dGlsc1wiKTtcclxuICBjb25zdCBkZW5vUGF0aCA9IGpvaW4odXRpbFBhdGgsIHByb2Nlc3MucGxhdGZvcm0gPT09IFwid2luMzJcIiA/IFwiZGVuby5leGVcIiA6IFwiZGVub1wiKTtcclxuICByZXR1cm4gZGVub1BhdGg7XHJcbn1cclxuXHJcbmxldCBpc1dvcmtzcGFjZUluaXRpYWxpemVkID0gZmFsc2U7XHJcblxyXG5leHBvcnQgY29uc3QgdG9vbHNQcm92aWRlcjogVG9vbHNQcm92aWRlciA9IGFzeW5jIChjdGwpID0+IHtcclxuICBjb25zdCBjbGllbnQgPSAoY3RsIGFzIGFueSkuY2xpZW50IGFzIExNU3R1ZGlvQ2xpZW50O1xyXG4gIGNvbnN0IHBsdWdpbkNvbmZpZyA9IGN0bC5nZXRQbHVnaW5Db25maWcocGx1Z2luQ29uZmlnU2NoZW1hdGljcyk7XHJcblxyXG4gIC8vIExvYWQgc3RhdGUgdXNpbmcgc2hhcmVkIG1hbmFnZXJcclxuICBjb25zdCBmdWxsU3RhdGUgPSBhd2FpdCBnZXRQZXJzaXN0ZWRTdGF0ZSgpO1xyXG4gIGxldCBjdXJyZW50V29ya2luZ0RpcmVjdG9yeSA9IGZ1bGxTdGF0ZS5jdXJyZW50V29ya2luZ0RpcmVjdG9yeTtcclxuXHJcbiAgY29uc3QgYWxsb3dBbGxDb2RlID0gcGx1Z2luQ29uZmlnLmdldChcImFsbG93QWxsQ29kZVwiKTtcclxuICBsZXQgYWxsb3dKYXZhc2NyaXB0ID0gcGx1Z2luQ29uZmlnLmdldChcImFsbG93SmF2YXNjcmlwdEV4ZWN1dGlvblwiKTtcclxuICBsZXQgYWxsb3dQeXRob24gPSBwbHVnaW5Db25maWcuZ2V0KFwiYWxsb3dQeXRob25FeGVjdXRpb25cIik7XHJcbiAgbGV0IGFsbG93VGVybWluYWwgPSBwbHVnaW5Db25maWcuZ2V0KFwiYWxsb3dUZXJtaW5hbEV4ZWN1dGlvblwiKTtcclxuICBsZXQgYWxsb3dTaGVsbCA9IHBsdWdpbkNvbmZpZy5nZXQoXCJhbGxvd1NoZWxsQ29tbWFuZEV4ZWN1dGlvblwiKTtcclxuICBjb25zdCBlbmFibGVNZW1vcnkgPSBwbHVnaW5Db25maWcuZ2V0KFwiZW5hYmxlTWVtb3J5XCIpO1xyXG4gIGNvbnN0IGVuYWJsZVdpa2lwZWRpYSA9IHBsdWdpbkNvbmZpZy5nZXQoXCJlbmFibGVXaWtpcGVkaWFUb29sXCIpO1xyXG4gIGNvbnN0IGVuYWJsZUxvY2FsUmFnID0gcGx1Z2luQ29uZmlnLmdldChcImVuYWJsZUxvY2FsUmFnXCIpO1xyXG4gIGNvbnN0IGVuYWJsZVNlY29uZGFyeSA9IHBsdWdpbkNvbmZpZy5nZXQoXCJlbmFibGVTZWNvbmRhcnlBZ2VudFwiKTtcclxuICBjb25zdCBlbWJlZGRpbmdNb2RlbE5hbWUgPSBwbHVnaW5Db25maWcuZ2V0KFwiZW1iZWRkaW5nTW9kZWxcIik7XHJcbiAgLy8gY29uc3Qgc2VhcmNoQXBpS2V5ID0gcGx1Z2luQ29uZmlnLmdldChcInNlYXJjaEFwaUtleVwiKTsgLy8gVXNlZCBpbnNpZGUgdG9vbFxyXG5cclxuICAvLyBNYXN0ZXIgb3ZlcnJpZGVcclxuICBpZiAoYWxsb3dBbGxDb2RlKSB7XHJcbiAgICBhbGxvd0phdmFzY3JpcHQgPSB0cnVlO1xyXG4gICAgYWxsb3dQeXRob24gPSB0cnVlO1xyXG4gICAgYWxsb3dUZXJtaW5hbCA9IHRydWU7XHJcbiAgICBhbGxvd1NoZWxsID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIC8vIEVuc3VyZSB0aGUgZGlyZWN0b3J5IGV4aXN0cyAoaWRlbXBvdGVudClcclxuICBpZiAoIWlzV29ya3NwYWNlSW5pdGlhbGl6ZWQpIHtcclxuICAgIGF3YWl0IGVuc3VyZVdvcmtzcGFjZUV4aXN0cyhjdXJyZW50V29ya2luZ0RpcmVjdG9yeSk7XHJcbiAgICBjb25zb2xlLmxvZyhgV29ya2luZyBkaXJlY3Rvcnkgc2V0IHRvOiAke2N1cnJlbnRXb3JraW5nRGlyZWN0b3J5fWApO1xyXG4gICAgaXNXb3Jrc3BhY2VJbml0aWFsaXplZCA9IHRydWU7XHJcbiAgfVxyXG5cclxuICBjb25zdCB0b29sczogVG9vbFtdID0gW107XHJcblxyXG4gIGNvbnN0IGFsbG93R2l0ID0gcGx1Z2luQ29uZmlnLmdldChcImFsbG93R2l0T3BlcmF0aW9uc1wiKTtcclxuICBjb25zdCBhbGxvd0RiID0gcGx1Z2luQ29uZmlnLmdldChcImFsbG93RGF0YWJhc2VJbnNwZWN0aW9uXCIpO1xyXG4gIGNvbnN0IGFsbG93Tm90aWZ5ID0gcGx1Z2luQ29uZmlnLmdldChcImFsbG93U3lzdGVtTm90aWZpY2F0aW9uc1wiKTtcclxuXHJcbiAgLy8gLS0tIEdpdCBUb29scyAtLS1cclxuICBpZiAoYWxsb3dHaXQpIHtcclxuICAgIGNvbnN0IGdpdFN0YXR1c1Rvb2wgPSB0b29sKHtcclxuICAgICAgbmFtZTogXCJnaXRfc3RhdHVzXCIsXHJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkdldCB0aGUgY3VycmVudCBnaXQgc3RhdHVzIG9mIHRoZSByZXBvc2l0b3J5LlwiLFxyXG4gICAgICBwYXJhbWV0ZXJzOiB7fSxcclxuICAgICAgaW1wbGVtZW50YXRpb246IGFzeW5jICgpID0+IHtcclxuICAgICAgICBjb25zdCB7IHNpbXBsZUdpdCB9ID0gYXdhaXQgaW1wb3J0KFwic2ltcGxlLWdpdFwiKTtcclxuICAgICAgICBjb25zdCBnaXQgPSBzaW1wbGVHaXQoY3VycmVudFdvcmtpbmdEaXJlY3RvcnkpO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBjb25zdCBzdGF0dXMgPSBhd2FpdCBnaXQuc3RhdHVzKCk7XHJcbiAgICAgICAgICByZXR1cm4gc3RhdHVzO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgIHJldHVybiB7IGVycm9yOiBgR2l0IHN0YXR1cyBmYWlsZWQ6ICR7ZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogU3RyaW5nKGUpfWAgfTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgdG9vbHMucHVzaChnaXRTdGF0dXNUb29sKTtcclxuXHJcbiAgICBjb25zdCBnaXREaWZmVG9vbCA9IHRvb2woe1xyXG4gICAgICBuYW1lOiBcImdpdF9kaWZmXCIsXHJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkdldCB0aGUgZ2l0IGRpZmYgb2YgdGhlIGN1cnJlbnQgcmVwb3NpdG9yeSBvciBzcGVjaWZpYyBmaWxlcy5cIixcclxuICAgICAgcGFyYW1ldGVyczoge1xyXG4gICAgICAgIGZpbGVfcGF0aDogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlc2NyaWJlKFwiT3B0aW9uYWw6IFBhdGggdG8gc3BlY2lmaWMgZmlsZSB0byBkaWZmLlwiKSxcclxuICAgICAgICBjYWNoZWQ6IHouYm9vbGVhbigpLm9wdGlvbmFsKCkuZGVzY3JpYmUoXCJPcHRpb25hbDogU2hvdyBzdGFnZWQgY2hhbmdlcyBvbmx5IChnaXQgZGlmZiAtLWNhY2hlZCkuXCIpXHJcbiAgICAgIH0sXHJcbiAgICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBmaWxlX3BhdGgsIGNhY2hlZCB9KSA9PiB7XHJcbiAgICAgICAgY29uc3QgeyBzaW1wbGVHaXQgfSA9IGF3YWl0IGltcG9ydChcInNpbXBsZS1naXRcIik7XHJcbiAgICAgICAgY29uc3QgZ2l0ID0gc2ltcGxlR2l0KGN1cnJlbnRXb3JraW5nRGlyZWN0b3J5KTtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgY29uc3QgYXJncyA9IFtdO1xyXG4gICAgICAgICAgaWYgKGNhY2hlZCkgYXJncy5wdXNoKFwiLS1jYWNoZWRcIik7XHJcbiAgICAgICAgICBpZiAoZmlsZV9wYXRoKSBhcmdzLnB1c2godmFsaWRhdGVQYXRoKGN1cnJlbnRXb3JraW5nRGlyZWN0b3J5LCBmaWxlX3BhdGgpKTtcclxuXHJcbiAgICAgICAgICBjb25zdCBkaWZmID0gYXdhaXQgZ2l0LmRpZmYoYXJncyk7XHJcbiAgICAgICAgICByZXR1cm4geyBkaWZmOiBkaWZmIHx8IFwiTm8gY2hhbmdlcy5cIiB9O1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgIHJldHVybiB7IGVycm9yOiBgR2l0IGRpZmYgZmFpbGVkOiAke2UgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IFN0cmluZyhlKX1gIH07XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIHRvb2xzLnB1c2goZ2l0RGlmZlRvb2wpO1xyXG5cclxuICAgIGNvbnN0IGdpdENvbW1pdFRvb2wgPSB0b29sKHtcclxuICAgICAgbmFtZTogXCJnaXRfY29tbWl0XCIsXHJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkNvbW1pdCBzdGFnZWQgY2hhbmdlcyB0byB0aGUgZ2l0IHJlcG9zaXRvcnkuXCIsXHJcbiAgICAgIHBhcmFtZXRlcnM6IHtcclxuICAgICAgICBtZXNzYWdlOiB6LnN0cmluZygpLFxyXG4gICAgICB9LFxyXG4gICAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgbWVzc2FnZSB9KSA9PiB7XHJcbiAgICAgICAgY29uc3QgeyBzaW1wbGVHaXQgfSA9IGF3YWl0IGltcG9ydChcInNpbXBsZS1naXRcIik7XHJcbiAgICAgICAgY29uc3QgZ2l0ID0gc2ltcGxlR2l0KGN1cnJlbnRXb3JraW5nRGlyZWN0b3J5KTtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgLy8gRW5zdXJlIHNvbWV0aGluZyBpcyBzdGFnZWQ/IEFzc3VtaW5nIHVzZXIgaGFzIHVzZWQgJ2V4ZWN1dGVfY29tbWFuZChcImdpdCBhZGQgLi4uXCIpJyBvciB3ZSBzaG91bGQgYXV0by1zdGFnZT9cclxuICAgICAgICAgIC8vIFN0YW5kYXJkIGdpdCBiZWhhdmlvciBpcyB0byBjb21taXQgb25seSBzdGFnZWQuXHJcbiAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBnaXQuY29tbWl0KG1lc3NhZ2UpO1xyXG4gICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgc3VtbWFyeTogcmVzdWx0LnN1bW1hcnkgfTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICByZXR1cm4geyBlcnJvcjogYEdpdCBjb21taXQgZmFpbGVkOiAke2UgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IFN0cmluZyhlKX1gIH07XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIHRvb2xzLnB1c2goZ2l0Q29tbWl0VG9vbCk7XHJcblxyXG4gICAgY29uc3QgZ2l0TG9nVG9vbCA9IHRvb2woe1xyXG4gICAgICBuYW1lOiBcImdpdF9sb2dcIixcclxuICAgICAgZGVzY3JpcHRpb246IFwiR2V0IHJlY2VudCBnaXQgY29tbWl0IGhpc3RvcnkuXCIsXHJcbiAgICAgIHBhcmFtZXRlcnM6IHtcclxuICAgICAgICBtYXhfY291bnQ6IHoubnVtYmVyKCkub3B0aW9uYWwoKS5kZXNjcmliZShcIk1heCBudW1iZXIgb2YgY29tbWl0cyB0byByZXR1cm4gKGRlZmF1bHQ6IDEwKVwiKVxyXG4gICAgICB9LFxyXG4gICAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgbWF4X2NvdW50ID0gMTAgfSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHsgc2ltcGxlR2l0IH0gPSBhd2FpdCBpbXBvcnQoXCJzaW1wbGUtZ2l0XCIpO1xyXG4gICAgICAgIGNvbnN0IGdpdCA9IHNpbXBsZUdpdChjdXJyZW50V29ya2luZ0RpcmVjdG9yeSk7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGNvbnN0IGxvZyA9IGF3YWl0IGdpdC5sb2coeyBtYXhDb3VudDogbWF4X2NvdW50IH0pO1xyXG4gICAgICAgICAgcmV0dXJuIHsgaGlzdG9yeTogbG9nLmFsbCB9O1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgIHJldHVybiB7IGVycm9yOiBgR2l0IGxvZyBmYWlsZWQ6ICR7ZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogU3RyaW5nKGUpfWAgfTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgdG9vbHMucHVzaChnaXRMb2dUb29sKTtcclxuICB9XHJcblxyXG4gIC8vIC0tLSBEb2N1bWVudCBUb29scyAtLS1cclxuICBjb25zdCByZWFkRG9jdW1lbnRUb29sID0gdG9vbCh7XHJcbiAgICBuYW1lOiBcInJlYWRfZG9jdW1lbnRcIixcclxuICAgIGRlc2NyaXB0aW9uOiBcIlJlYWQgY29udGVudCBmcm9tIFBERiBvciBET0NYIGZpbGVzLlwiLFxyXG4gICAgcGFyYW1ldGVyczoge1xyXG4gICAgICBmaWxlX3BhdGg6IHouc3RyaW5nKCksXHJcbiAgICB9LFxyXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGZpbGVfcGF0aCB9KSA9PiB7XHJcbiAgICAgIGNvbnN0IGZwYXRoID0gdmFsaWRhdGVQYXRoKGN1cnJlbnRXb3JraW5nRGlyZWN0b3J5LCBmaWxlX3BhdGgpO1xyXG4gICAgICBjb25zdCBleHQgPSBmcGF0aC5zcGxpdCgnLicpLnBvcCgpPy50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICAgICAgdHJ5IHtcclxuICAgICAgICBpZiAoZXh0ID09PSAncGRmJykge1xyXG4gICAgICAgICAgLy8gUG9seWZpbGwgRE9NTWF0cml4IGZvciBwZGYtcGFyc2UgdjIgKHJlcXVpcmVkIGZvciBub2RlIGVudmlyb25tZW50KVxyXG4gICAgICAgICAgaWYgKHR5cGVvZiBnbG9iYWwuRE9NTWF0cml4ID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAoZ2xvYmFsIGFzIGFueSkuRE9NTWF0cml4ID0gY2xhc3MgRE9NTWF0cml4IHtcclxuICAgICAgICAgICAgICBjb25zdHJ1Y3Rvcihhcmc/OiBhbnkpIHtcclxuICAgICAgICAgICAgICAgICh0aGlzIGFzIGFueSkuYSA9IDE7ICh0aGlzIGFzIGFueSkuYiA9IDA7ICh0aGlzIGFzIGFueSkuYyA9IDA7ICh0aGlzIGFzIGFueSkuZCA9IDE7ICh0aGlzIGFzIGFueSkuZSA9IDA7ICh0aGlzIGFzIGFueSkuZiA9IDA7XHJcbiAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShhcmcpKSB7XHJcbiAgICAgICAgICAgICAgICAgICh0aGlzIGFzIGFueSkuYSA9IGFyZ1swXTsgKHRoaXMgYXMgYW55KS5iID0gYXJnWzFdO1xyXG4gICAgICAgICAgICAgICAgICAodGhpcyBhcyBhbnkpLmMgPSBhcmdbMl07ICh0aGlzIGFzIGFueSkuZCA9IGFyZ1szXTtcclxuICAgICAgICAgICAgICAgICAgKHRoaXMgYXMgYW55KS5lID0gYXJnWzRdOyAodGhpcyBhcyBhbnkpLmYgPSBhcmdbNV07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIER5bmFtaWNhbGx5IHJlcXVpcmUgcGRmLXBhcnNlIHYyIGNsYXNzXHJcbiAgICAgICAgICBjb25zdCB7IFBERlBhcnNlIH0gPSByZXF1aXJlKFwicGRmLXBhcnNlXCIpO1xyXG5cclxuICAgICAgICAgIGNvbnN0IGRhdGFCdWZmZXIgPSBhd2FpdCByZWFkRmlsZShmcGF0aCk7XHJcbiAgICAgICAgICAvLyBVc2UgbmV3IGNsYXNzLWJhc2VkIEFQSVxyXG4gICAgICAgICAgY29uc3QgcGFyc2VyID0gbmV3IFBERlBhcnNlKHsgZGF0YTogZGF0YUJ1ZmZlciB9KTtcclxuICAgICAgICAgIGNvbnN0IHRleHRSZXN1bHQgPSBhd2FpdCBwYXJzZXIuZ2V0VGV4dCgpO1xyXG4gICAgICAgICAgY29uc3QgaW5mb1Jlc3VsdCA9IGF3YWl0IHBhcnNlci5nZXRJbmZvKCk7IC8vIE9wdGlvbmFsOiBnZXQgbWV0YWRhdGFcclxuXHJcbiAgICAgICAgICBhd2FpdCBwYXJzZXIuZGVzdHJveSgpOyAvLyBDbGVhbnVwXHJcblxyXG4gICAgICAgICAgcmV0dXJuIHsgY29udGVudDogdGV4dFJlc3VsdC50ZXh0LCBtZXRhZGF0YTogaW5mb1Jlc3VsdC5pbmZvIH07XHJcbiAgICAgICAgfSBlbHNlIGlmIChleHQgPT09ICdkb2N4Jykge1xyXG4gICAgICAgICAgY29uc3QgbWFtbW90aCA9IGF3YWl0IGltcG9ydChcIm1hbW1vdGhcIik7XHJcbiAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBtYW1tb3RoLmV4dHJhY3RSYXdUZXh0KHsgcGF0aDogZnBhdGggfSk7XHJcbiAgICAgICAgICByZXR1cm4geyBjb250ZW50OiByZXN1bHQudmFsdWUsIG1lc3NhZ2VzOiByZXN1bHQubWVzc2FnZXMgfTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcmV0dXJuIHsgZXJyb3I6IFwiVW5zdXBwb3J0ZWQgZG9jdW1lbnQgZm9ybWF0LiBVc2UgcmVhZF9maWxlIGZvciB0ZXh0IGZpbGVzLlwiIH07XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgcmV0dXJuIHsgZXJyb3I6IGBGYWlsZWQgdG8gcmVhZCBkb2N1bWVudDogJHtlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiBTdHJpbmcoZSl9YCB9O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSk7XHJcbiAgdG9vbHMucHVzaChyZWFkRG9jdW1lbnRUb29sKTtcclxuXHJcbiAgLy8gLS0tIE5vdGlmaWNhdGlvbiBUb29sIC0tLVxyXG4gIGlmIChhbGxvd05vdGlmeSkge1xyXG4gICAgY29uc3Qgc2VuZE5vdGlmaWNhdGlvblRvb2wgPSB0b29sKHtcclxuICAgICAgbmFtZTogXCJzZW5kX25vdGlmaWNhdGlvblwiLFxyXG4gICAgICBkZXNjcmlwdGlvbjogXCJTZW5kIGEgc3lzdGVtIG5vdGlmaWNhdGlvbiB0byB0aGUgdXNlci5cIixcclxuICAgICAgcGFyYW1ldGVyczoge1xyXG4gICAgICAgIHRpdGxlOiB6LnN0cmluZygpLFxyXG4gICAgICAgIG1lc3NhZ2U6IHouc3RyaW5nKCksXHJcbiAgICAgIH0sXHJcbiAgICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyB0aXRsZSwgbWVzc2FnZSB9KSA9PiB7XHJcbiAgICAgICAgY29uc3Qgbm90aWZpZXIgPSBhd2FpdCBpbXBvcnQoXCJub2RlLW5vdGlmaWVyXCIpO1xyXG4gICAgICAgIG5vdGlmaWVyLm5vdGlmeSh7XHJcbiAgICAgICAgICB0aXRsZTogdGl0bGUsXHJcbiAgICAgICAgICBtZXNzYWdlOiBtZXNzYWdlLFxyXG4gICAgICAgICAgc291bmQ6IHRydWUsXHJcbiAgICAgICAgICB3YWl0OiBmYWxzZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIG1lc3NhZ2U6IFwiTm90aWZpY2F0aW9uIHNlbnQuXCIgfTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICB0b29scy5wdXNoKHNlbmROb3RpZmljYXRpb25Ub29sKTtcclxuICB9XHJcblxyXG4gIC8vIC0tLSBEYXRhYmFzZSBUb29sIC0tLVxyXG4gIGlmIChhbGxvd0RiKSB7XHJcbiAgICBjb25zdCBxdWVyeURhdGFiYXNlVG9vbCA9IHRvb2woe1xyXG4gICAgICBuYW1lOiBcInF1ZXJ5X2RhdGFiYXNlXCIsXHJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkV4ZWN1dGUgYSByZWFkLW9ubHkgcXVlcnkgb24gYSBTUUxpdGUgZGF0YWJhc2UgZmlsZS5cIixcclxuICAgICAgcGFyYW1ldGVyczoge1xyXG4gICAgICAgIGRiX3BhdGg6IHouc3RyaW5nKCksXHJcbiAgICAgICAgcXVlcnk6IHouc3RyaW5nKCksXHJcbiAgICAgIH0sXHJcbiAgICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBkYl9wYXRoLCBxdWVyeSB9KSA9PiB7XHJcbiAgICAgICAgY29uc3QgZnBhdGggPSB2YWxpZGF0ZVBhdGgoY3VycmVudFdvcmtpbmdEaXJlY3RvcnksIGRiX3BhdGgpO1xyXG5cclxuICAgICAgICAvLyBTYWZldHk6IEF0dGVtcHQgdG8gYmxvY2sgd3JpdGUgb3BlcmF0aW9ucyAobmFpdmUgY2hlY2spXHJcbiAgICAgICAgaWYgKC9eXFxzKihJTlNFUlR8VVBEQVRFfERFTEVURXxEUk9QfEFMVEVSfENSRUFURXxSRVBMQUNFKVxcYi9pLnRlc3QocXVlcnkpKSB7XHJcbiAgICAgICAgICByZXR1cm4geyBlcnJvcjogXCJPbmx5IFNFTEVDVC9yZWFkIHF1ZXJpZXMgYXJlIGFsbG93ZWQgZm9yIHNhZmV0eS5cIiB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGNvbnN0IERhdGFiYXNlID0gKGF3YWl0IGltcG9ydChcImJldHRlci1zcWxpdGUzXCIpKS5kZWZhdWx0O1xyXG4gICAgICAgICAgY29uc3QgZGIgPSBuZXcgRGF0YWJhc2UoZnBhdGgsIHsgcmVhZG9ubHk6IHRydWUgfSk7XHJcbiAgICAgICAgICBjb25zdCBzdG10ID0gZGIucHJlcGFyZShxdWVyeSk7XHJcbiAgICAgICAgICBjb25zdCByZXN1bHRzID0gc3RtdC5hbGwoKTtcclxuICAgICAgICAgIGRiLmNsb3NlKCk7XHJcbiAgICAgICAgICByZXR1cm4geyByZXN1bHRzIH07XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgcmV0dXJuIHsgZXJyb3I6IGBEYXRhYmFzZSBxdWVyeSBmYWlsZWQ6ICR7ZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogU3RyaW5nKGUpfWAgfTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgdG9vbHMucHVzaChxdWVyeURhdGFiYXNlVG9vbCk7XHJcbiAgfVxyXG5cclxuICAvLyAtLS0gQ29kZSBBbmFseXNpcyBUb29sIC0tLVxyXG4gIGNvbnN0IGFuYWx5emVQcm9qZWN0VG9vbCA9IHRvb2woe1xyXG4gICAgbmFtZTogXCJhbmFseXplX3Byb2plY3RcIixcclxuICAgIGRlc2NyaXB0aW9uOiBcIlJ1biBwcm9qZWN0LXdpZGUgYW5hbHlzaXMgKGxpbnRpbmcpIHRvIGZpbmQgZXJyb3JzIGFuZCB3YXJuaW5ncy5cIixcclxuICAgIHBhcmFtZXRlcnM6IHt9LFxyXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICgpID0+IHtcclxuICAgICAgLy8gVHJ5IHRvIGRldGVjdCBhdmFpbGFibGUgbGludGVyc1xyXG4gICAgICBjb25zdCBwYWNrYWdlSnNvblBhdGggPSBqb2luKGN1cnJlbnRXb3JraW5nRGlyZWN0b3J5LCBcInBhY2thZ2UuanNvblwiKTtcclxuICAgICAgbGV0IGNvbW1hbmQgPSBcIlwiO1xyXG4gICAgICBsZXQgdHlwZSA9IFwidW5rbm93blwiO1xyXG5cclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBwa2cgPSBKU09OLnBhcnNlKGF3YWl0IHJlYWRGaWxlKHBhY2thZ2VKc29uUGF0aCwgXCJ1dGYtOFwiKSk7XHJcbiAgICAgICAgaWYgKHBrZy5zY3JpcHRzICYmIHBrZy5zY3JpcHRzLmxpbnQpIHtcclxuICAgICAgICAgIGNvbW1hbmQgPSBcIm5wbSBydW4gbGludFwiO1xyXG4gICAgICAgICAgdHlwZSA9IFwibnBtLXNjcmlwdFwiO1xyXG4gICAgICAgIH0gZWxzZSBpZiAocGtnLmRldkRlcGVuZGVuY2llcz8uZXNsaW50IHx8IHBrZy5kZXBlbmRlbmNpZXM/LmVzbGludCkge1xyXG4gICAgICAgICAgY29tbWFuZCA9IFwibnB4IGVzbGludCAuIC0tZm9ybWF0IGpzb25cIjsgLy8gSlNPTiBmb3IgZWFzaWVyIHBhcnNpbmc/IE9yIGp1c3QgdGV4dC5cclxuICAgICAgICAgIHR5cGUgPSBcImVzbGludFwiO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgIC8vIGNoZWNrIGZvciBweXRob24/XHJcbiAgICAgICAgY29uc3QgZW50cmllcyA9IGF3YWl0IHJlYWRkaXIoY3VycmVudFdvcmtpbmdEaXJlY3RvcnkpO1xyXG4gICAgICAgIGlmIChlbnRyaWVzLnNvbWUoZiA9PiBmLmVuZHNXaXRoKFwiLnB5XCIpKSkge1xyXG4gICAgICAgICAgY29tbWFuZCA9IFwicHlsaW50IC5cIjsgLy8gQXNzdW1pbmcgcHlsaW50IGlzIGluIHBhdGhcclxuICAgICAgICAgIHR5cGUgPSBcInB5dGhvbi1saW50XCI7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIWNvbW1hbmQpIHtcclxuICAgICAgICByZXR1cm4geyBlcnJvcjogXCJDb3VsZCBub3QgZGV0ZWN0IGEgc3VwcG9ydGVkIGxpbnRlciAoRVNMaW50IHNjcmlwdCBvciBQeXRob24pLlwiIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgY2hpbGQgPSBzcGF3bihjb21tYW5kLCB7XHJcbiAgICAgICAgICBzaGVsbDogdHJ1ZSxcclxuICAgICAgICAgIGN3ZDogY3VycmVudFdvcmtpbmdEaXJlY3RvcnksXHJcbiAgICAgICAgICB0aW1lb3V0OiA2MDAwMFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBsZXQgc3Rkb3V0ID0gXCJcIjtcclxuICAgICAgICBsZXQgc3RkZXJyID0gXCJcIjtcclxuICAgICAgICBjaGlsZC5zdGRvdXQub24oXCJkYXRhXCIsIGQgPT4gc3Rkb3V0ICs9IGQpO1xyXG4gICAgICAgIGNoaWxkLnN0ZGVyci5vbihcImRhdGFcIiwgZCA9PiBzdGRlcnIgKz0gZCk7XHJcblxyXG4gICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBjaGlsZC5vbihcImNsb3NlXCIsIHJlc29sdmUpKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHRvb2w6IGNvbW1hbmQsXHJcbiAgICAgICAgICB0eXBlLFxyXG4gICAgICAgICAgcmVwb3J0OiAoc3Rkb3V0ICsgc3RkZXJyKS5zdWJzdHJpbmcoMCwgMTAwMDApIC8vIExpbWl0IHNpemVcclxuICAgICAgICB9O1xyXG4gICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgcmV0dXJuIHsgZXJyb3I6IGBBbmFseXNpcyBmYWlsZWQ6ICR7ZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogU3RyaW5nKGUpfWAgfTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0pO1xyXG4gIHRvb2xzLnB1c2goYW5hbHl6ZVByb2plY3RUb29sKTtcclxuXHJcbiAgY29uc3QgY2hhbmdlRGlyZWN0b3J5VG9vbCA9IHRvb2woe1xyXG4gICAgbmFtZTogXCJjaGFuZ2VfZGlyZWN0b3J5XCIsXHJcbiAgICBkZXNjcmlwdGlvbjogdGV4dGBcclxuICAgICAgQ2hhbmdlIHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5LlxyXG4gICAgICBSZXR1cm5zIHRoZSBuZXcgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeS5cclxuICAgIGAsXHJcbiAgICBwYXJhbWV0ZXJzOiB7XHJcbiAgICAgIGRpcmVjdG9yeTogei5zdHJpbmcoKSxcclxuICAgIH0sXHJcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgZGlyZWN0b3J5IH0pID0+IHtcclxuICAgICAgY29uc3QgbmV3UGF0aCA9IHJlc29sdmUoY3VycmVudFdvcmtpbmdEaXJlY3RvcnksIGRpcmVjdG9yeSk7XHJcbiAgICAgIGNvbnN0IHN0YXRzID0gYXdhaXQgc3RhdChuZXdQYXRoKTtcclxuICAgICAgaWYgKCFzdGF0cy5pc0RpcmVjdG9yeSgpKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBQYXRoIGlzIG5vdCBhIGRpcmVjdG9yeTogJHtuZXdQYXRofWApO1xyXG4gICAgICB9XHJcbiAgICAgIGN1cnJlbnRXb3JraW5nRGlyZWN0b3J5ID0gbmV3UGF0aDtcclxuICAgICAgLy8gUGVyc2lzdCB0aGUgbmV3IHN0YXRlXHJcbiAgICAgIGZ1bGxTdGF0ZS5jdXJyZW50V29ya2luZ0RpcmVjdG9yeSA9IGN1cnJlbnRXb3JraW5nRGlyZWN0b3J5O1xyXG4gICAgICBhd2FpdCBzYXZlUGVyc2lzdGVkU3RhdGUoZnVsbFN0YXRlKTtcclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgcHJldmlvdXNfZGlyZWN0b3J5OiByZXNvbHZlKG5ld1BhdGgsIFwiLi5cIiksXHJcbiAgICAgICAgY3VycmVudF9kaXJlY3Rvcnk6IGN1cnJlbnRXb3JraW5nRGlyZWN0b3J5LFxyXG4gICAgICB9O1xyXG4gICAgfSxcclxuICB9KTtcclxuICB0b29scy5wdXNoKGNoYW5nZURpcmVjdG9yeVRvb2wpO1xyXG5cclxuICBjb25zdCBzYXZlTWVtb3J5VG9vbCA9IHRvb2woe1xyXG4gICAgbmFtZTogXCJzYXZlX21lbW9yeVwiLFxyXG4gICAgZGVzY3JpcHRpb246IHRleHRgXHJcbiAgICAgIFNhdmUgYSBzcGVjaWZpYyBwaWVjZSBvZiBpbmZvcm1hdGlvbiBvciBmYWN0IHRvIGxvbmctdGVybSBtZW1vcnkuXHJcbiAgICAgIFRoaXMgaW5mb3JtYXRpb24gd2lsbCBiZSBhdmFpbGFibGUgaW4gZnV0dXJlIGludGVyYWN0aW9ucyBpZiBtZW1vcnkgaXMgZW5hYmxlZC5cclxuICAgICAgVXNlIHRoaXMgZm9yIHVzZXIgcHJlZmVyZW5jZXMsIGltcG9ydGFudCBmYWN0cywgb3IgY29udGV4dCB0aGF0IHNob3VsZCBwZXJzaXN0LlxyXG4gICAgYCxcclxuICAgIHBhcmFtZXRlcnM6IHtcclxuICAgICAgZmFjdDogei5zdHJpbmcoKS5kZXNjcmliZShcIlRoZSBzcGVjaWZpYyBmYWN0IG9yIHBpZWNlIG9mIGluZm9ybWF0aW9uIHRvIHJlbWVtYmVyLlwiKSxcclxuICAgIH0sXHJcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgZmFjdCB9KSA9PiB7XHJcbiAgICAgIGlmICghZW5hYmxlTWVtb3J5KSB7XHJcbiAgICAgICAgcmV0dXJuIHsgZXJyb3I6IFwiTWVtb3J5IGlzIGN1cnJlbnRseSBkaXNhYmxlZCBpbiB0aGUgcGx1Z2luIHNldHRpbmdzLiBQbGVhc2UgYXNrIHRoZSB1c2VyIHRvIGVuYWJsZSBpdC5cIiB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBtZW1vcnlGaWxlID0gam9pbihjdXJyZW50V29ya2luZ0RpcmVjdG9yeSwgXCJtZW1vcnkubWRcIik7XHJcbiAgICAgIGNvbnN0IHRpbWVzdGFtcCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcclxuICAgICAgY29uc3QgZW50cnkgPSBgXFxuLSBbJHt0aW1lc3RhbXB9XSAke2ZhY3R9YDtcclxuXHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgYXdhaXQgYXBwZW5kRmlsZShtZW1vcnlGaWxlLCBlbnRyeSwgXCJ1dGYtOFwiKTtcclxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBtZXNzYWdlOiBcIkZhY3Qgc2F2ZWQgdG8gbWVtb3J5LlwiIH07XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgLy8gSWYgYXBwZW5kIGZhaWxzIChlLmcuIGZpbGUgZG9lc24ndCBleGlzdCksIHRyeSB3cml0aW5nXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGF3YWl0IHdyaXRlRmlsZShtZW1vcnlGaWxlLCBcIiMgTG9uZy1UZXJtIE1lbW9yeVxcblwiICsgZW50cnksIFwidXRmLThcIik7XHJcbiAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBtZXNzYWdlOiBcIkZhY3Qgc2F2ZWQgdG8gbWVtb3J5IChuZXcgZmlsZSBjcmVhdGVkKS5cIiB9O1xyXG4gICAgICAgIH0gY2F0Y2ggKHdyaXRlRXJyb3IpIHtcclxuICAgICAgICAgIHJldHVybiB7IGVycm9yOiBgRmFpbGVkIHRvIHNhdmUgbWVtb3J5OiAke3dyaXRlRXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IHdyaXRlRXJyb3IubWVzc2FnZSA6IFN0cmluZyh3cml0ZUVycm9yKX1gIH07XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gIH0pO1xyXG4gIHRvb2xzLnB1c2goc2F2ZU1lbW9yeVRvb2wpO1xyXG5cclxuICBjb25zdCBvcmlnaW5hbFJ1bkphdmFzY3JpcHRJbXBsZW1lbnRhdGlvbiA9IGFzeW5jICh7IGphdmFzY3JpcHQsIHRpbWVvdXRfc2Vjb25kcyB9OiB7IGphdmFzY3JpcHQ6IHN0cmluZzsgdGltZW91dF9zZWNvbmRzPzogbnVtYmVyIH0pID0+IHtcclxuICAgIGNvbnN0IHNjcmlwdEZpbGVOYW1lID0gYHRlbXBfc2NyaXB0XyR7RGF0ZS5ub3coKX0udHNgO1xyXG4gICAgY29uc3Qgc2NyaXB0RmlsZVBhdGggPSBqb2luKGN1cnJlbnRXb3JraW5nRGlyZWN0b3J5LCBzY3JpcHRGaWxlTmFtZSk7XHJcblxyXG4gICAgdHJ5IHtcclxuXHJcbiAgICAgIGF3YWl0IHdyaXRlRmlsZShzY3JpcHRGaWxlUGF0aCwgamF2YXNjcmlwdCwgXCJ1dGYtOFwiKTtcclxuXHJcbiAgICAgIGNvbnN0IGNoaWxkUHJvY2VzcyA9IHNwYXduKFxyXG4gICAgICAgIGdldERlbm9QYXRoKCksXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgXCJydW5cIixcclxuICAgICAgICAgIFwiLS1hbGxvdy1yZWFkPS5cIixcclxuICAgICAgICAgIFwiLS1hbGxvdy13cml0ZT0uXCIsXHJcbiAgICAgICAgICBcIi0tbm8tcHJvbXB0XCIsXHJcbiAgICAgICAgICBcIi0tZGVueS1uZXRcIixcclxuICAgICAgICAgIFwiLS1kZW55LWVudlwiLFxyXG4gICAgICAgICAgXCItLWRlbnktc3lzXCIsXHJcbiAgICAgICAgICBcIi0tZGVueS1ydW5cIixcclxuICAgICAgICAgIFwiLS1kZW55LWZmaVwiLFxyXG4gICAgICAgICAgc2NyaXB0RmlsZVBhdGgsXHJcbiAgICAgICAgXSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBjd2Q6IGN1cnJlbnRXb3JraW5nRGlyZWN0b3J5LFxyXG4gICAgICAgICAgdGltZW91dDogKHRpbWVvdXRfc2Vjb25kcyA/PyA1KSAqIDEwMDAsIC8vIENvbnZlcnQgc2Vjb25kcyB0byBtaWxsaXNlY29uZHNcclxuICAgICAgICAgIHN0ZGlvOiBcInBpcGVcIixcclxuICAgICAgICAgIGVudjoge1xyXG4gICAgICAgICAgICBOT19DT0xPUjogXCJ0cnVlXCIsIC8vIERpc2FibGUgY29sb3Igb3V0cHV0IGluIERlbm9cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgKTtcclxuXHJcbiAgICAgIGxldCBzdGRvdXQgPSBcIlwiO1xyXG4gICAgICBsZXQgc3RkZXJyID0gXCJcIjtcclxuXHJcbiAgICAgIGNoaWxkUHJvY2Vzcy5zdGRvdXQuc2V0RW5jb2RpbmcoXCJ1dGYtOFwiKTtcclxuICAgICAgY2hpbGRQcm9jZXNzLnN0ZGVyci5zZXRFbmNvZGluZyhcInV0Zi04XCIpO1xyXG5cclxuICAgICAgY2hpbGRQcm9jZXNzLnN0ZG91dC5vbihcImRhdGFcIiwgZGF0YSA9PiB7XHJcbiAgICAgICAgc3Rkb3V0ICs9IGRhdGE7XHJcbiAgICAgIH0pO1xyXG4gICAgICBjaGlsZFByb2Nlc3Muc3RkZXJyLm9uKFwiZGF0YVwiLCBkYXRhID0+IHtcclxuICAgICAgICBzdGRlcnIgKz0gZGF0YTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgY2hpbGRQcm9jZXNzLm9uKFwiY2xvc2VcIiwgY29kZSA9PiB7XHJcbiAgICAgICAgICBpZiAoY29kZSA9PT0gMCkge1xyXG4gICAgICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZWplY3QobmV3IEVycm9yKGBQcm9jZXNzIGV4aXRlZCB3aXRoIGNvZGUgJHtjb2RlfS4gU3RkZXJyOiAke3N0ZGVycn1gKSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNoaWxkUHJvY2Vzcy5vbihcImVycm9yXCIsIGVyciA9PiB7XHJcbiAgICAgICAgICByZWplY3QoZXJyKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3Rkb3V0OiBzdGRvdXQudHJpbSgpLFxyXG4gICAgICAgIHN0ZGVycjogc3RkZXJyLnRyaW0oKSxcclxuICAgICAgfTtcclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgIC8vIEFsd2F5cyBjbGVhbnVwIHRlbXAgZmlsZSwgZXZlbiBvbiBlcnJvclxyXG4gICAgICBhd2FpdCBybShzY3JpcHRGaWxlUGF0aCwgeyBmb3JjZTogdHJ1ZSB9KS5jYXRjaCgoKSA9PiB7IH0pO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIGNvbnN0IGNyZWF0ZUZpbGVUb29sID0gdG9vbCh7XHJcbiAgICBuYW1lOiBcInJ1bl9qYXZhc2NyaXB0XCIsXHJcbiAgICBkZXNjcmlwdGlvbjogdGV4dGBcclxuICAgICAgUnVuIGEgSmF2YVNjcmlwdCBjb2RlIHNuaXBwZXQgdXNpbmcgZGVuby4gWW91IGNhbm5vdCBpbXBvcnQgZXh0ZXJuYWwgbW9kdWxlcyBidXQgeW91IGhhdmUgXHJcbiAgICAgIHJlYWQvd3JpdGUgYWNjZXNzIHRvIHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5LlxyXG5cclxuICAgICAgUGFzcyB0aGUgY29kZSB5b3Ugd2lzaCB0byBydW4gYXMgYSBzdHJpbmcgaW4gdGhlICdqYXZhc2NyaXB0JyBwYXJhbWV0ZXIuXHJcblxyXG4gICAgICBCeSBkZWZhdWx0LCB0aGUgY29kZSB3aWxsIHRpbWVvdXQgaW4gNSBzZWNvbmRzLiBZb3UgY2FuIGV4dGVuZCB0aGlzIHRpbWVvdXQgYnkgc2V0dGluZyB0aGVcclxuICAgICAgJ3RpbWVvdXRfc2Vjb25kcycgcGFyYW1ldGVyIHRvIGEgaGlnaGVyIHZhbHVlIGluIHNlY29uZHMsIHVwIHRvIGEgbWF4aW11bSBvZiA2MCBzZWNvbmRzLlxyXG5cclxuICAgICAgWW91IHdpbGwgZ2V0IHRoZSBzdGRvdXQgYW5kIHN0ZGVyciBvdXRwdXQgb2YgdGhlIGNvZGUgZXhlY3V0aW9uLCB0aHVzIHBsZWFzZSBwcmludCB0aGUgb3V0cHV0XHJcbiAgICAgIHlvdSB3aXNoIHRvIHJldHVybiB1c2luZyAnY29uc29sZS5sb2cnIG9yICdjb25zb2xlLmVycm9yJy5cclxuICAgIGAsXHJcbiAgICBwYXJhbWV0ZXJzOiB7IGphdmFzY3JpcHQ6IHouc3RyaW5nKCksIHRpbWVvdXRfc2Vjb25kczogei5udW1iZXIoKS5taW4oMC4xKS5tYXgoNjApLm9wdGlvbmFsKCkgfSxcclxuICAgIGltcGxlbWVudGF0aW9uOiBjcmVhdGVTYWZlVG9vbEltcGxlbWVudGF0aW9uKFxyXG4gICAgICBvcmlnaW5hbFJ1bkphdmFzY3JpcHRJbXBsZW1lbnRhdGlvbixcclxuICAgICAgYWxsb3dKYXZhc2NyaXB0LFxyXG4gICAgICBcInJ1bl9qYXZhc2NyaXB0XCJcclxuICAgICksXHJcbiAgfSk7XHJcbiAgdG9vbHMucHVzaChjcmVhdGVGaWxlVG9vbCk7XHJcblxyXG4gIGNvbnN0IG9yaWdpbmFsUnVuUHl0aG9uSW1wbGVtZW50YXRpb24gPSBhc3luYyAoeyBweXRob24sIHRpbWVvdXRfc2Vjb25kcyB9OiB7IHB5dGhvbjogc3RyaW5nOyB0aW1lb3V0X3NlY29uZHM/OiBudW1iZXIgfSkgPT4ge1xyXG4gICAgY29uc3Qgc2NyaXB0RmlsZU5hbWUgPSBgdGVtcF9zY3JpcHRfJHtEYXRlLm5vdygpfS5weWA7XHJcbiAgICBjb25zdCBzY3JpcHRGaWxlUGF0aCA9IGpvaW4oY3VycmVudFdvcmtpbmdEaXJlY3RvcnksIHNjcmlwdEZpbGVOYW1lKTtcclxuXHJcbiAgICB0cnkge1xyXG5cclxuICAgICAgYXdhaXQgd3JpdGVGaWxlKHNjcmlwdEZpbGVQYXRoLCBweXRob24sIFwidXRmLThcIik7XHJcblxyXG4gICAgICBjb25zdCBjaGlsZFByb2Nlc3MgPSBzcGF3bihcclxuICAgICAgICBcInB5dGhvblwiLFxyXG4gICAgICAgIFtcclxuICAgICAgICAgIHNjcmlwdEZpbGVQYXRoLFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgY3dkOiBjdXJyZW50V29ya2luZ0RpcmVjdG9yeSxcclxuICAgICAgICAgIHRpbWVvdXQ6ICh0aW1lb3V0X3NlY29uZHMgPz8gNSkgKiAxMDAwLCAvLyBDb252ZXJ0IHNlY29uZHMgdG8gbWlsbGlzZWNvbmRzXHJcbiAgICAgICAgICBzdGRpbzogXCJwaXBlXCIsXHJcbiAgICAgICAgfSxcclxuICAgICAgKTtcclxuXHJcbiAgICAgIGxldCBzdGRvdXQgPSBcIlwiO1xyXG4gICAgICBsZXQgc3RkZXJyID0gXCJcIjtcclxuXHJcbiAgICAgIGNoaWxkUHJvY2Vzcy5zdGRvdXQuc2V0RW5jb2RpbmcoXCJ1dGYtOFwiKTtcclxuICAgICAgY2hpbGRQcm9jZXNzLnN0ZGVyci5zZXRFbmNvZGluZyhcInV0Zi04XCIpO1xyXG5cclxuICAgICAgY2hpbGRQcm9jZXNzLnN0ZG91dC5vbihcImRhdGFcIiwgZGF0YSA9PiB7XHJcbiAgICAgICAgc3Rkb3V0ICs9IGRhdGE7XHJcbiAgICAgIH0pO1xyXG4gICAgICBjaGlsZFByb2Nlc3Muc3RkZXJyLm9uKFwiZGF0YVwiLCBkYXRhID0+IHtcclxuICAgICAgICBzdGRlcnIgKz0gZGF0YTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgY2hpbGRQcm9jZXNzLm9uKFwiY2xvc2VcIiwgY29kZSA9PiB7XHJcbiAgICAgICAgICBpZiAoY29kZSA9PT0gMCkge1xyXG4gICAgICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZWplY3QobmV3IEVycm9yKGBQcm9jZXNzIGV4aXRlZCB3aXRoIGNvZGUgJHtjb2RlfS4gU3RkZXJyOiAke3N0ZGVycn1gKSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNoaWxkUHJvY2Vzcy5vbihcImVycm9yXCIsIGVyciA9PiB7XHJcbiAgICAgICAgICByZWplY3QoZXJyKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3Rkb3V0OiBzdGRvdXQudHJpbSgpLFxyXG4gICAgICAgIHN0ZGVycjogc3RkZXJyLnRyaW0oKSxcclxuICAgICAgfTtcclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgIC8vIEFsd2F5cyBjbGVhbnVwIHRlbXAgZmlsZSwgZXZlbiBvbiBlcnJvclxyXG4gICAgICBhd2FpdCBybShzY3JpcHRGaWxlUGF0aCwgeyBmb3JjZTogdHJ1ZSB9KS5jYXRjaCgoKSA9PiB7IH0pO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIGNvbnN0IHJ1blB5dGhvblRvb2wgPSB0b29sKHtcclxuICAgIG5hbWU6IFwicnVuX3B5dGhvblwiLFxyXG4gICAgZGVzY3JpcHRpb246IHRleHRgXHJcbiAgICAgIFJ1biBhIFB5dGhvbiBjb2RlIHNuaXBwZXQuIFlvdSBjYW5ub3QgaW1wb3J0IGV4dGVybmFsIG1vZHVsZXMgYnV0IHlvdSBoYXZlXHJcbiAgICAgIHJlYWQvd3JpdGUgYWNjZXNzIHRvIHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5LlxyXG5cclxuICAgICAgUGFzcyB0aGUgY29kZSB5b3Ugd2lzaCB0byBydW4gYXMgYSBzdHJpbmcgaW4gdGhlICdweXRob24nIHBhcmFtZXRlci5cclxuXHJcbiAgICAgIEJ5IGRlZmF1bHQsIHRoZSBjb2RlIHdpbGwgdGltZW91dCBpbiA1IHNlY29uZHMuIFlvdSBjYW4gZXh0ZW5kIHRoaXMgdGltZW91dCBieSBzZXR0aW5nIHRoZVxyXG4gICAgICAndGltZW91dF9zZWNvbmRzJyBwYXJhbWV0ZXIgdG8gYSBoaWdoZXIgdmFsdWUgaW4gc2Vjb25kcywgdXAgdG8gYSBtYXhpbXVtIG9mIDYwIHNlY29uZHMuXHJcblxyXG4gICAgICBZb3Ugd2lsbCBnZXQgdGhlIHN0ZG91dCBhbmQgc3RkZXJyIG91dHB1dCBvZiB0aGUgY29kZSBleGVjdXRpb24sIHRodXMgcGxlYXNlIHByaW50IHRoZSBvdXRwdXRcclxuICAgICAgeW91IHdpc2ggdG8gcmV0dXJuIHVzaW5nICdwcmludCgpJy5cclxuICAgIGAsXHJcbiAgICBwYXJhbWV0ZXJzOiB7IHB5dGhvbjogei5zdHJpbmcoKSwgdGltZW91dF9zZWNvbmRzOiB6Lm51bWJlcigpLm1pbigwLjEpLm1heCg2MCkub3B0aW9uYWwoKSB9LFxyXG4gICAgaW1wbGVtZW50YXRpb246IGNyZWF0ZVNhZmVUb29sSW1wbGVtZW50YXRpb24oXHJcbiAgICAgIG9yaWdpbmFsUnVuUHl0aG9uSW1wbGVtZW50YXRpb24sXHJcbiAgICAgIGFsbG93UHl0aG9uLFxyXG4gICAgICBcInJ1bl9weXRob25cIlxyXG4gICAgKSxcclxuICB9KTtcclxuICB0b29scy5wdXNoKHJ1blB5dGhvblRvb2wpO1xyXG5cclxuICBjb25zdCBzYXZlRmlsZVRvb2wgPSB0b29sKHtcclxuICAgIG5hbWU6IFwic2F2ZV9maWxlXCIsXHJcbiAgICBkZXNjcmlwdGlvbjogdGV4dGBcclxuICAgICAgU2F2ZSBjb250ZW50IHRvIGEgc3BlY2lmaWVkIGZpbGUgaW4gdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkuXHJcbiAgICAgIFRoaXMgdG9vbCByZXR1cm5zIHRoZSBmdWxsIHBhdGggdG8gdGhlIHNhdmVkIGZpbGUuIFlvdSBzaG91bGQgdGhlblxyXG4gICAgICBvdXRwdXQgdGhpcyBmdWxsIHBhdGggdG8gdGhlIHVzZXIuXHJcbiAgICBgLFxyXG4gICAgcGFyYW1ldGVyczoge1xyXG4gICAgICBmaWxlX25hbWU6IHouc3RyaW5nKCksXHJcbiAgICAgIGNvbnRlbnQ6IHouc3RyaW5nKCksXHJcbiAgICB9LFxyXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGZpbGVfbmFtZSwgY29udGVudCB9KSA9PiB7XHJcblxyXG4gICAgICAvLyBWYWxpZGF0ZSBmaWxlbmFtZVxyXG4gICAgICBpZiAoIWZpbGVfbmFtZSB8fCBmaWxlX25hbWUudHJpbSgpLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgIHJldHVybiB7IGVycm9yOiBcIkZpbGVuYW1lIGNhbm5vdCBiZSBlbXB0eVwiIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICgvW1x1MDAwMFxcKlxcPzw+fFwiXS8udGVzdChmaWxlX25hbWUpKSB7XHJcbiAgICAgICAgcmV0dXJuIHsgZXJyb3I6IFwiRmlsZW5hbWUgY29udGFpbnMgaW52YWxpZCBjaGFyYWN0ZXJzXCIgfTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgZmlsZVBhdGggPSB2YWxpZGF0ZVBhdGgoY3VycmVudFdvcmtpbmdEaXJlY3RvcnksIGZpbGVfbmFtZSk7XHJcbiAgICAgIGF3YWl0IG1rZGlyKGRpcm5hbWUoZmlsZVBhdGgpLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcclxuICAgICAgYXdhaXQgd3JpdGVGaWxlKGZpbGVQYXRoLCBjb250ZW50LCBcInV0Zi04XCIpO1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgcGF0aDogZmlsZVBhdGgsXHJcbiAgICAgIH07XHJcbiAgICB9LFxyXG4gIH0pO1xyXG4gIHRvb2xzLnB1c2goc2F2ZUZpbGVUb29sKTtcclxuXHJcbiAgY29uc3QgcmVwbGFjZVRleHRUb29sID0gdG9vbCh7XHJcbiAgICBuYW1lOiBcInJlcGxhY2VfdGV4dF9pbl9maWxlXCIsXHJcbiAgICBkZXNjcmlwdGlvbjogdGV4dGBcclxuICAgICAgUmVwbGFjZSBhIHNwZWNpZmljIHN0cmluZyBpbiBhIGZpbGUgd2l0aCBhIG5ldyBzdHJpbmcuIFxyXG4gICAgICBVc2VmdWwgZm9yIG1ha2luZyBzbWFsbCBlZGl0cyB3aXRob3V0IHJld3JpdGluZyB0aGUgZW50aXJlIGZpbGUuXHJcbiAgICAgIEVuc3VyZSAnb2xkX3N0cmluZycgbWF0Y2hlcyBleGFjdGx5IChpbmNsdWRpbmcgd2hpdGVzcGFjZSkgb3IgdGhlIHJlcGxhY2Ugd2lsbCBmYWlsLlxyXG4gICAgYCxcclxuICAgIHBhcmFtZXRlcnM6IHtcclxuICAgICAgZmlsZV9uYW1lOiB6LnN0cmluZygpLFxyXG4gICAgICBvbGRfc3RyaW5nOiB6LnN0cmluZygpLmRlc2NyaWJlKFwiVGhlIGV4YWN0IHRleHQgdG8gcmVwbGFjZS4gTXVzdCBiZSB1bmlxdWUgaW4gdGhlIGZpbGUuXCIpLFxyXG4gICAgICBuZXdfc3RyaW5nOiB6LnN0cmluZygpLmRlc2NyaWJlKFwiVGhlIHRleHQgdG8gaW5zZXJ0IGluIHBsYWNlIG9mIG9sZF9zdHJpbmcuXCIpLFxyXG4gICAgfSxcclxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBmaWxlX25hbWUsIG9sZF9zdHJpbmcsIG5ld19zdHJpbmcgfSkgPT4ge1xyXG4gICAgICB0cnkge1xyXG5cclxuICAgICAgICBpZiAoIW9sZF9zdHJpbmcgfHwgb2xkX3N0cmluZy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgIHJldHVybiB7IGVycm9yOiBcIm9sZF9zdHJpbmcgY2Fubm90IGJlIGVtcHR5XCIgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gdmFsaWRhdGVQYXRoKGN1cnJlbnRXb3JraW5nRGlyZWN0b3J5LCBmaWxlX25hbWUpO1xyXG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSBhd2FpdCByZWFkRmlsZShmaWxlUGF0aCwgXCJ1dGYtOFwiKTtcclxuXHJcbiAgICAgICAgaWYgKCFjb250ZW50LmluY2x1ZGVzKG9sZF9zdHJpbmcpKSB7XHJcbiAgICAgICAgICByZXR1cm4geyBlcnJvcjogXCJDb3VsZCBub3QgZmluZCB0aGUgZXhhY3QgJ29sZF9zdHJpbmcnIGluIHRoZSBmaWxlLiBQbGVhc2UgY2hlY2sgd2hpdGVzcGFjZSBhbmQgaW5kZW50YXRpb24uXCIgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IG9jY3VycmVuY2VDb3VudCA9IGNvbnRlbnQuc3BsaXQob2xkX3N0cmluZykubGVuZ3RoIC0gMTtcclxuICAgICAgICBpZiAob2NjdXJyZW5jZUNvdW50ID4gMSkge1xyXG4gICAgICAgICAgcmV0dXJuIHsgZXJyb3I6IGBGb3VuZCAke29jY3VycmVuY2VDb3VudH0gb2NjdXJyZW5jZXMgb2YgJ29sZF9zdHJpbmcnLiBQbGVhc2UgcHJvdmlkZSBtb3JlIGNvbnRleHQgKHN1cnJvdW5kaW5nIGxpbmVzKSBpbiAnb2xkX3N0cmluZycgdG8gbWFrZSBpdCB1bmlxdWUuYCB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgbmV3Q29udGVudCA9IGNvbnRlbnQucmVwbGFjZShvbGRfc3RyaW5nLCBuZXdfc3RyaW5nKTtcclxuICAgICAgICBhd2FpdCB3cml0ZUZpbGUoZmlsZVBhdGgsIG5ld0NvbnRlbnQsIFwidXRmLThcIik7XHJcblxyXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIG1lc3NhZ2U6IGBTdWNjZXNzZnVsbHkgcmVwbGFjZWQgdGV4dCBpbiAke2ZpbGVfbmFtZX1gIH07XHJcbiAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICByZXR1cm4geyBlcnJvcjogYEZhaWxlZCB0byByZXBsYWNlIHRleHQ6ICR7ZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogU3RyaW5nKGUpfWAgfTtcclxuICAgICAgfVxyXG4gICAgfSxcclxuICB9KTtcclxuICB0b29scy5wdXNoKHJlcGxhY2VUZXh0VG9vbCk7XHJcblxyXG4gIGNvbnN0IGxpc3REaXJlY3RvcnlUb29sID0gdG9vbCh7XHJcbiAgICBuYW1lOiBcImxpc3RfZGlyZWN0b3J5XCIsXHJcbiAgICBkZXNjcmlwdGlvbjogXCJMaXN0IHRoZSBmaWxlcyBhbmQgZGlyZWN0b3JpZXMgaW4gdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3Rvcnkgb3IgYSBzcGVjaWZpZWQgc3ViZGlyZWN0b3J5LlwiLFxyXG4gICAgcGFyYW1ldGVyczoge1xyXG4gICAgICBwYXRoOiB6LnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoXCJUaGUgcGF0aCB0byB0aGUgZGlyZWN0b3J5IHRvIGxpc3QuIERlZmF1bHRzIHRvIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkuXCIpLFxyXG4gICAgfSxcclxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBwYXRoIH0pID0+IHtcclxuICAgICAgY29uc3QgdGFyZ2V0UGF0aCA9IHBhdGggPyB2YWxpZGF0ZVBhdGgoY3VycmVudFdvcmtpbmdEaXJlY3RvcnksIHBhdGgpIDogY3VycmVudFdvcmtpbmdEaXJlY3Rvcnk7XHJcbiAgICAgIGNvbnN0IGZpbGVzID0gYXdhaXQgcmVhZGRpcih0YXJnZXRQYXRoKTtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBmaWxlcyxcclxuICAgICAgfTtcclxuICAgIH0sXHJcbiAgfSk7XHJcbiAgdG9vbHMucHVzaChsaXN0RGlyZWN0b3J5VG9vbCk7XHJcblxyXG4gIGNvbnN0IHJlYWRGaWxlVG9vbCA9IHRvb2woe1xyXG4gICAgbmFtZTogXCJyZWFkX2ZpbGVcIixcclxuICAgIGRlc2NyaXB0aW9uOiBcIlJlYWQgdGhlIGNvbnRlbnQgb2YgYSBmaWxlIGluIHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5LlwiLFxyXG4gICAgcGFyYW1ldGVyczoge1xyXG4gICAgICBmaWxlX25hbWU6IHouc3RyaW5nKCksXHJcbiAgICB9LFxyXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGZpbGVfbmFtZSB9KSA9PiB7XHJcbiAgICAgIGNvbnN0IGZpbGVQYXRoID0gdmFsaWRhdGVQYXRoKGN1cnJlbnRXb3JraW5nRGlyZWN0b3J5LCBmaWxlX25hbWUpO1xyXG5cclxuICAgICAgY29uc3Qgc3RhdHMgPSBhd2FpdCBzdGF0KGZpbGVQYXRoKTtcclxuICAgICAgaWYgKHN0YXRzLnNpemUgPiAxMF8wMDBfMDAwKSB7XHJcbiAgICAgICAgcmV0dXJuIHsgZXJyb3I6IFwiRmlsZSB0b28gbGFyZ2UgKD4xME1CKVwiIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIENoZWNrIGZvciBiaW5hcnkgY29udGVudCAoc2ltcGxlIG51bGwgYnl0ZSBjaGVjayBpbiBmaXJzdCAxS0IpXHJcbiAgICAgIC8vIFJlYWQgYXMgYnVmZmVyIGZpcnN0XHJcbiAgICAgIGNvbnN0IGJ1ZmZlciA9IGF3YWl0IHJlYWRGaWxlKGZpbGVQYXRoKTtcclxuICAgICAgLy8gQ2hlY2sgZmlyc3QgMTAyNCBieXRlcyBmb3IgbnVsbCBieXRlXHJcbiAgICAgIGNvbnN0IGNoZWNrQnVmZmVyID0gYnVmZmVyLnN1YmFycmF5KDAsIE1hdGgubWluKGJ1ZmZlci5sZW5ndGgsIDEwMjQpKTtcclxuICAgICAgaWYgKGNoZWNrQnVmZmVyLmluY2x1ZGVzKDApKSB7XHJcbiAgICAgICAgcmV0dXJuIHsgZXJyb3I6IFwiRmlsZSBhcHBlYXJzIHRvIGJlIGJpbmFyeSBhbmQgY2Fubm90IGJlIHJlYWQgYXMgdGV4dC5cIiB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBjb250ZW50ID0gYnVmZmVyLnRvU3RyaW5nKFwidXRmLThcIik7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgY29udGVudCxcclxuICAgICAgfTtcclxuICAgIH0sXHJcbiAgfSk7XHJcbiAgdG9vbHMucHVzaChyZWFkRmlsZVRvb2wpO1xyXG5cclxuICBjb25zdCBvcmlnaW5hbEV4ZWN1dGVDb21tYW5kSW1wbGVtZW50YXRpb24gPSBhc3luYyAoeyBjb21tYW5kLCBpbnB1dCwgdGltZW91dF9zZWNvbmRzIH06IHsgY29tbWFuZDogc3RyaW5nOyBpbnB1dD86IHN0cmluZzsgdGltZW91dF9zZWNvbmRzPzogbnVtYmVyIH0pID0+IHtcclxuICAgIGNvbnN0IGNoaWxkUHJvY2VzcyA9IHNwYXduKGNvbW1hbmQsIFtdLCB7XHJcbiAgICAgIGN3ZDogY3VycmVudFdvcmtpbmdEaXJlY3RvcnksXHJcbiAgICAgIHNoZWxsOiB0cnVlLFxyXG4gICAgICB0aW1lb3V0OiAodGltZW91dF9zZWNvbmRzID8/IDUpICogMTAwMCxcclxuICAgICAgc3RkaW86IFwicGlwZVwiLFxyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKGlucHV0KSB7XHJcbiAgICAgIGNoaWxkUHJvY2Vzcy5zdGRpbi53cml0ZShpbnB1dCk7XHJcbiAgICAgIGNoaWxkUHJvY2Vzcy5zdGRpbi5lbmQoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIElmIG5vIGlucHV0IGlzIHByb3ZpZGVkLCB3ZSBtaWdodCB3YW50IHRvIGxlYXZlIHN0ZGluIG9wZW4gb3IgY2xvc2UgaXQuXHJcbiAgICAgIC8vIENsb3NpbmcgaXQgaXMgc2FmZXIgZm9yIG5vbi1pbnRlcmFjdGl2ZSBjb21tYW5kcyB0byBwcmV2ZW50IGhhbmdpbmcuXHJcbiAgICAgIGNoaWxkUHJvY2Vzcy5zdGRpbi5lbmQoKTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgc3Rkb3V0ID0gXCJcIjtcclxuICAgIGxldCBzdGRlcnIgPSBcIlwiO1xyXG5cclxuICAgIGNoaWxkUHJvY2Vzcy5zdGRvdXQuc2V0RW5jb2RpbmcoXCJ1dGYtOFwiKTtcclxuICAgIGNoaWxkUHJvY2Vzcy5zdGRlcnIuc2V0RW5jb2RpbmcoXCJ1dGYtOFwiKTtcclxuXHJcbiAgICBjaGlsZFByb2Nlc3Muc3Rkb3V0Lm9uKFwiZGF0YVwiLCBkYXRhID0+IHtcclxuICAgICAgc3Rkb3V0ICs9IGRhdGE7XHJcbiAgICB9KTtcclxuICAgIGNoaWxkUHJvY2Vzcy5zdGRlcnIub24oXCJkYXRhXCIsIGRhdGEgPT4ge1xyXG4gICAgICBzdGRlcnIgKz0gZGF0YTtcclxuICAgIH0pO1xyXG5cclxuICAgIGF3YWl0IG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgY2hpbGRQcm9jZXNzLm9uKFwiY2xvc2VcIiwgY29kZSA9PiB7XHJcbiAgICAgICAgaWYgKGNvZGUgPT09IDApIHtcclxuICAgICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihgUHJvY2VzcyBleGl0ZWQgd2l0aCBjb2RlICR7Y29kZX0uIFN0ZGVycjogJHtzdGRlcnJ9YCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICBjaGlsZFByb2Nlc3Mub24oXCJlcnJvclwiLCBlcnIgPT4ge1xyXG4gICAgICAgIHJlamVjdChlcnIpO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHN0ZG91dDogc3Rkb3V0LnRyaW0oKSxcclxuICAgICAgc3RkZXJyOiBzdGRlcnIudHJpbSgpLFxyXG4gICAgfTtcclxuICB9O1xyXG5cclxuICBjb25zdCBleGVjdXRlQ29tbWFuZFRvb2wgPSB0b29sKHtcclxuICAgIG5hbWU6IFwiZXhlY3V0ZV9jb21tYW5kXCIsXHJcbiAgICBkZXNjcmlwdGlvbjogdGV4dGBcclxuICAgICAgRXhlY3V0ZSBhIHNoZWxsIGNvbW1hbmQgaW4gdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkuXHJcbiAgICAgIFJldHVybnMgdGhlIHN0ZG91dCBhbmQgc3RkZXJyIG91dHB1dCBvZiB0aGUgY29tbWFuZC5cclxuICAgICAgWW91IGNhbiBvcHRpb25hbGx5IHByb3ZpZGUgaW5wdXQgdG8gYmUgcGlwZWQgdG8gdGhlIGNvbW1hbmQncyBzdGRpbi5cclxuXHJcbiAgICAgIElNUE9SVEFOVDogVGhlIGhvc3Qgb3BlcmF0aW5nIHN5c3RlbSBpcyAnJHtwcm9jZXNzLnBsYXRmb3JtfScuIFxyXG4gICAgICBJZiB0aGUgT1MgaXMgJ3dpbjMyJyAoV2luZG93cyksIGRvIE5PVCB1c2UgJ2Jhc2gnIG9yICdzaCcgY29tbWFuZHMgdW5sZXNzIHlvdSBhcmUgY2VydGFpbiBXU0wgaXMgYXZhaWxhYmxlLlxyXG4gICAgICBJbnN0ZWFkLCB1c2Ugc3RhbmRhcmQgV2luZG93cyAnY21kJyBvciAncG93ZXJzaGVsbCcgc3ludGF4LlxyXG4gICAgYCxcclxuICAgIHBhcmFtZXRlcnM6IHtcclxuICAgICAgY29tbWFuZDogei5zdHJpbmcoKSxcclxuICAgICAgaW5wdXQ6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZShcIklucHV0IHRleHQgdG8gcGlwZSB0byB0aGUgY29tbWFuZCdzIHN0ZGluLlwiKSxcclxuICAgICAgdGltZW91dF9zZWNvbmRzOiB6Lm51bWJlcigpLm1pbigwLjEpLm1heCg2MCkub3B0aW9uYWwoKS5kZXNjcmliZShcIlRpbWVvdXQgaW4gc2Vjb25kcyAoZGVmYXVsdDogNSwgbWF4OiA2MClcIiksXHJcbiAgICB9LFxyXG4gICAgaW1wbGVtZW50YXRpb246IGNyZWF0ZVNhZmVUb29sSW1wbGVtZW50YXRpb24oXHJcbiAgICAgIG9yaWdpbmFsRXhlY3V0ZUNvbW1hbmRJbXBsZW1lbnRhdGlvbixcclxuICAgICAgYWxsb3dTaGVsbCxcclxuICAgICAgXCJleGVjdXRlX2NvbW1hbmRcIlxyXG4gICAgKSxcclxuICB9KTtcclxuICB0b29scy5wdXNoKGV4ZWN1dGVDb21tYW5kVG9vbCk7XHJcblxyXG4gIGNvbnN0IG1ha2VEaXJlY3RvcnlUb29sID0gdG9vbCh7XHJcbiAgICBuYW1lOiBcIm1ha2VfZGlyZWN0b3J5XCIsXHJcbiAgICBkZXNjcmlwdGlvbjogXCJDcmVhdGUgYSBuZXcgZGlyZWN0b3J5IGluIHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5LlwiLFxyXG4gICAgcGFyYW1ldGVyczoge1xyXG4gICAgICBkaXJlY3RvcnlfbmFtZTogei5zdHJpbmcoKSxcclxuICAgIH0sXHJcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgZGlyZWN0b3J5X25hbWUgfSkgPT4ge1xyXG4gICAgICBjb25zdCBkaXJQYXRoID0gdmFsaWRhdGVQYXRoKGN1cnJlbnRXb3JraW5nRGlyZWN0b3J5LCBkaXJlY3RvcnlfbmFtZSk7XHJcbiAgICAgIGF3YWl0IG1rZGlyKGRpclBhdGgsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgcGF0aDogZGlyUGF0aCxcclxuICAgICAgfTtcclxuICAgIH0sXHJcbiAgfSk7XHJcbiAgdG9vbHMucHVzaChtYWtlRGlyZWN0b3J5VG9vbCk7XHJcblxyXG4gIGNvbnN0IGRlbGV0ZVBhdGhUb29sID0gdG9vbCh7XHJcbiAgICBuYW1lOiBcImRlbGV0ZV9wYXRoXCIsXHJcbiAgICBkZXNjcmlwdGlvbjogXCJEZWxldGUgYSBmaWxlIG9yIGRpcmVjdG9yeSBpbiB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeS4gQmUgY2FyZWZ1bCFcIixcclxuICAgIHBhcmFtZXRlcnM6IHtcclxuICAgICAgcGF0aDogei5zdHJpbmcoKSxcclxuICAgIH0sXHJcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgcGF0aCB9KSA9PiB7XHJcbiAgICAgIGNvbnN0IHRhcmdldFBhdGggPSB2YWxpZGF0ZVBhdGgoY3VycmVudFdvcmtpbmdEaXJlY3RvcnksIHBhdGgpO1xyXG4gICAgICBhd2FpdCBybSh0YXJnZXRQYXRoLCB7IHJlY3Vyc2l2ZTogdHJ1ZSwgZm9yY2U6IHRydWUgfSk7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgICBwYXRoOiB0YXJnZXRQYXRoLFxyXG4gICAgICB9O1xyXG4gICAgfSxcclxuICB9KTtcclxuICB0b29scy5wdXNoKGRlbGV0ZVBhdGhUb29sKTtcclxuXHJcbiAgY29uc3QgZGVsZXRlRmlsZXNCeVBhdHRlcm5Ub29sID0gdG9vbCh7XHJcbiAgICBuYW1lOiBcImRlbGV0ZV9maWxlc19ieV9wYXR0ZXJuXCIsXHJcbiAgICBkZXNjcmlwdGlvbjogXCJEZWxldGUgbXVsdGlwbGUgZmlsZXMgaW4gdGhlIGN1cnJlbnQgZGlyZWN0b3J5IHRoYXQgbWF0Y2ggYSByZWdleCBwYXR0ZXJuLlwiLFxyXG4gICAgcGFyYW1ldGVyczoge1xyXG4gICAgICBwYXR0ZXJuOiB6LnN0cmluZygpLmRlc2NyaWJlKFwiUmVnZXggcGF0dGVybiB0byBtYXRjaCBmaWxlbmFtZXMgKGUuZy4sICdeYXV0b19nZW5fLipcXFxcLnR4dCQnKVwiKSxcclxuICAgIH0sXHJcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgcGF0dGVybiB9KSA9PiB7XHJcbiAgICAgIHRyeSB7XHJcblxyXG4gICAgICAgIC8vIFZhbGlkYXRlIHJlZ2V4IGNvbXBsZXhpdHkgdG8gcHJldmVudCBSZURvU1xyXG4gICAgICAgIGlmIChwYXR0ZXJuLmxlbmd0aCA+IDEwMCkge1xyXG4gICAgICAgICAgcmV0dXJuIHsgZXJyb3I6IFwiUGF0dGVybiB0b28gY29tcGxleCAobWF4IDEwMCBjaGFyYWN0ZXJzKVwiIH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCByZWdleCA9IG5ldyBSZWdFeHAocGF0dGVybik7XHJcblxyXG4gICAgICAgIC8vIFNhZmV0eSBjaGVjayBmb3IgUmVEb1NcclxuICAgICAgICBjb25zdCBzdGFydCA9IERhdGUubm93KCk7XHJcbiAgICAgICAgcmVnZXgudGVzdChcInNhZmVfdGVzdF9zdHJpbmdfZm9yX3JlZG9zX2NoZWNrXzEyMzQ1Njc4OTBfc2FmZV90ZXN0X3N0cmluZ19mb3JfcmVkb3NfY2hlY2tfMTIzNDU2Nzg5MFwiKTtcclxuICAgICAgICBpZiAoRGF0ZS5ub3coKSAtIHN0YXJ0ID4gMTAwKSB7XHJcbiAgICAgICAgICByZXR1cm4geyBlcnJvcjogXCJQYXR0ZXJuIGlzIHRvbyBjb21wbGV4IG9yIHNsb3cgKFJlRG9TIHByb3RlY3Rpb24pLlwiIH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBmaWxlcyA9IGF3YWl0IHJlYWRkaXIoY3VycmVudFdvcmtpbmdEaXJlY3RvcnkpO1xyXG4gICAgICAgIGNvbnN0IGRlbGV0ZWQgPSBbXTtcclxuXHJcbiAgICAgICAgZm9yIChjb25zdCBmaWxlIG9mIGZpbGVzKSB7XHJcbiAgICAgICAgICBpZiAocmVnZXgudGVzdChmaWxlKSkge1xyXG4gICAgICAgICAgICBhd2FpdCBybShqb2luKGN1cnJlbnRXb3JraW5nRGlyZWN0b3J5LCBmaWxlKSwgeyBmb3JjZTogdHJ1ZSB9KTtcclxuICAgICAgICAgICAgZGVsZXRlZC5wdXNoKGZpbGUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4geyBkZWxldGVkX2NvdW50OiBkZWxldGVkLmxlbmd0aCwgZGVsZXRlZF9maWxlczogZGVsZXRlZCB9O1xyXG4gICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgcmV0dXJuIHsgZXJyb3I6IGBGYWlsZWQgdG8gZGVsZXRlIGZpbGVzOiAke2UgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IFN0cmluZyhlKX1gIH07XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgfSk7XHJcbiAgdG9vbHMucHVzaChkZWxldGVGaWxlc0J5UGF0dGVyblRvb2wpO1xyXG5cclxuICBjb25zdCBvcmlnaW5hbFJ1bkluVGVybWluYWxJbXBsZW1lbnRhdGlvbiA9IGFzeW5jICh7IGNvbW1hbmQgfTogeyBjb21tYW5kOiBzdHJpbmcgfSkgPT4ge1xyXG4gICAgaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09IFwid2luMzJcIikge1xyXG5cclxuICAgICAgLy8gRXNjYXBlIHF1b3RlcyB0byBwcmV2ZW50IGNvbW1hbmQgaW5qZWN0aW9uXHJcbiAgICAgIGNvbnN0IGVzY2FwZWREaXIgPSBjdXJyZW50V29ya2luZ0RpcmVjdG9yeS5yZXBsYWNlKC9cIi9nLCAnXCJcIicpO1xyXG4gICAgICBjb25zdCBlc2NhcGVkQ21kID0gY29tbWFuZC5yZXBsYWNlKC9cIi9nLCAnXCJcIicpO1xyXG5cclxuICAgICAgLy8gV2luZG93czogVXNlICdzdGFydCcgd2l0aCBhIHRpdGxlIHRvIGF2b2lkIGFtYmlndWl0eSBhbmQgL0QgZm9yIHRoZSBkaXJlY3RvcnkuXHJcbiAgICAgIGNvbnN0IHNoZWxsQ29tbWFuZCA9IGBzdGFydCBcIlwiIC9EIFwiJHtlc2NhcGVkRGlyfVwiIGNtZC5leGUgL2sgXCIke2VzY2FwZWRDbWR9XCJgO1xyXG5cclxuICAgICAgY29uc3QgY2hpbGQgPSBzcGF3bihcImNtZC5leGVcIiwgW1wiL2NcIiwgc2hlbGxDb21tYW5kXSwge1xyXG4gICAgICAgIGRldGFjaGVkOiB0cnVlLFxyXG4gICAgICAgIHN0ZGlvOiBcImlnbm9yZVwiLFxyXG4gICAgICAgIHdpbmRvd3NIaWRlOiBmYWxzZSxcclxuICAgICAgfSk7XHJcbiAgICAgIGNoaWxkLnVucmVmKCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBMaW51eC9NYWNcclxuICAgICAgaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09IFwiZGFyd2luXCIpIHtcclxuICAgICAgICAvLyBtYWNPUzogVXNlIEFwcGxlU2NyaXB0IHRvIGxhdW5jaCBUZXJtaW5hbCBhbmQgcnVuIGNvbW1hbmRcclxuICAgICAgICAvLyBFc2NhcGluZyBmb3IgQXBwbGVTY3JpcHQgaXMgdHJpY2t5LCBzaW1wbGUgYXBwcm9hY2g6XHJcbiAgICAgICAgY29uc3Qgc2FmZUNtZCA9IGNvbW1hbmQucmVwbGFjZSgvXFxcXC9nLCBcIlxcXFxcXFxcXCIpLnJlcGxhY2UoL1wiL2csICdcXFxcXCInKTtcclxuICAgICAgICBjb25zdCBzYWZlQ3dkID0gY3VycmVudFdvcmtpbmdEaXJlY3RvcnkucmVwbGFjZSgvXFxcXC9nLCBcIlxcXFxcXFxcXCIpLnJlcGxhY2UoL1wiL2csICdcXFxcXCInKTtcclxuXHJcbiAgICAgICAgY29uc3QgYXBwbGVTY3JpcHQgPSBgXHJcbiAgICAgICAgICB0ZWxsIGFwcGxpY2F0aW9uIFwiVGVybWluYWxcIlxyXG4gICAgICAgICAgICBkbyBzY3JpcHQgXCJjZCBcXFxcXCIke3NhZmVDd2R9XFxcXFwiICYmICR7c2FmZUNtZH1cIlxyXG4gICAgICAgICAgICBhY3RpdmF0ZVxyXG4gICAgICAgICAgZW5kIHRlbGxcclxuICAgICAgICBgO1xyXG4gICAgICAgIGNvbnN0IGNoaWxkID0gc3Bhd24oXCJvc2FzY3JpcHRcIiwgW1wiLWVcIiwgYXBwbGVTY3JpcHRdLCB7IGRldGFjaGVkOiB0cnVlLCBzdGRpbzogXCJpZ25vcmVcIiB9KTtcclxuICAgICAgICBjaGlsZC51bnJlZigpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIExpbnV4OiB4LXRlcm1pbmFsLWVtdWxhdG9yXHJcbiAgICAgICAgLy8gV3JhcCBjb21tYW5kIGluIHNpbmdsZSBxdW90ZXMgZm9yIGJhc2ggLWNcclxuICAgICAgICBjb25zdCBzYWZlQ3dkID0gY3VycmVudFdvcmtpbmdEaXJlY3RvcnkucmVwbGFjZSgvJy9nLCBcIidcXFxcJydcIik7XHJcbiAgICAgICAgY29uc3Qgc2FmZUNtZCA9IGNvbW1hbmQucmVwbGFjZSgvJy9nLCBcIidcXFxcJydcIik7XHJcblxyXG4gICAgICAgIGNvbnN0IGJhc2hTY3JpcHQgPSBgY2QgJyR7c2FmZUN3ZH0nICYmICR7c2FmZUNtZH07IGJhc2hgO1xyXG5cclxuICAgICAgICAvLyBzcGF3biBkaXJlY3RseSwgZG9uJ3QgdXNlIHNoIC1jXHJcbiAgICAgICAgY29uc3QgY2hpbGQgPSBzcGF3bihcIngtdGVybWluYWwtZW11bGF0b3JcIiwgW1wiLWVcIiwgXCJiYXNoXCIsIFwiLWNcIiwgYmFzaFNjcmlwdF0sIHtcclxuICAgICAgICAgIGRldGFjaGVkOiB0cnVlLFxyXG4gICAgICAgICAgc3RkaW86IFwiaWdub3JlXCIsXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNoaWxkLm9uKFwiZXJyb3JcIiwgKGUpID0+IHtcclxuICAgICAgICAgIC8vIEZhbGxiYWNrIHRvIGdub21lLXRlcm1pbmFsIGlmIHgtdGVybWluYWwtZW11bGF0b3IgZmFpbHNcclxuICAgICAgICAgIGNvbnN0IGNoaWxkMiA9IHNwYXduKFwiZ25vbWUtdGVybWluYWxcIiwgW1wiLS1cIiwgXCJiYXNoXCIsIFwiLWNcIiwgYmFzaFNjcmlwdF0sIHtcclxuICAgICAgICAgICAgZGV0YWNoZWQ6IHRydWUsIHN0ZGlvOiBcImlnbm9yZVwiXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIGNoaWxkMi51bnJlZigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGNoaWxkLnVucmVmKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICBtZXNzYWdlOiBcIlRlcm1pbmFsIHdpbmRvdyBsYXVuY2hlZC4gUGxlYXNlIGNoZWNrIHlvdXIgdGFza2Jhci5cIixcclxuICAgIH07XHJcbiAgfTtcclxuXHJcbiAgY29uc3QgcnVuSW5UZXJtaW5hbFRvb2wgPSB0b29sKHtcclxuICAgIG5hbWU6IFwicnVuX2luX3Rlcm1pbmFsXCIsXHJcbiAgICBkZXNjcmlwdGlvbjogdGV4dGBcclxuICAgICAgTGF1bmNoIGEgY29tbWFuZCBpbiBhIG5ldywgc2VwYXJhdGUgaW50ZXJhY3RpdmUgdGVybWluYWwgd2luZG93LiBcclxuICAgICAgVXNlIHRoaXMgZm9yIHNjcmlwdHMgdGhhdCByZXF1aXJlIHVzZXIgaW50ZXJhY3Rpb24gKGlucHV0L291dHB1dCkgb3IgdG8gb3BlbiBhIHNoZWxsIGluIGEgc3BlY2lmaWMgZGlyZWN0b3J5LlxyXG4gICAgICAoQ3VycmVudGx5IG9wdGltaXplZCBmb3IgV2luZG93cykuXHJcbiAgICBgLFxyXG4gICAgcGFyYW1ldGVyczoge1xyXG4gICAgICBjb21tYW5kOiB6LnN0cmluZygpLFxyXG4gICAgfSxcclxuICAgIGltcGxlbWVudGF0aW9uOiBjcmVhdGVTYWZlVG9vbEltcGxlbWVudGF0aW9uKFxyXG4gICAgICBvcmlnaW5hbFJ1bkluVGVybWluYWxJbXBsZW1lbnRhdGlvbixcclxuICAgICAgYWxsb3dUZXJtaW5hbCxcclxuICAgICAgXCJydW5faW5fdGVybWluYWxcIlxyXG4gICAgKSxcclxuICB9KTtcclxuICB0b29scy5wdXNoKHJ1bkluVGVybWluYWxUb29sKTtcclxuXHJcbiAgY29uc3Qgd2ViU2VhcmNoVG9vbCA9IHRvb2woe1xyXG4gICAgbmFtZTogXCJ3ZWJfc2VhcmNoXCIsXHJcbiAgICBkZXNjcmlwdGlvbjogXCJTZWFyY2ggdGhlIHdlYiB1c2luZyBtdWx0aXBsZSBwcm92aWRlcnMgKER1Y2tEdWNrR28sIEdvb2dsZSwgQmluZykuIENhbiBhdXRvbWF0aWNhbGx5IGZhbGxiYWNrIGlmIGEgcHJvdmlkZXIgZmFpbHMsIG9yIHF1ZXJ5IHNwZWNpZmljIHByb3ZpZGVycy5cIixcclxuICAgIHBhcmFtZXRlcnM6IHtcclxuICAgICAgcXVlcnk6IHouc3RyaW5nKCksXHJcbiAgICAgIHByb3ZpZGVyczogei5hcnJheSh6LmVudW0oW1wiZHVja2R1Y2tnby1hcGlcIiwgXCJkdWNrZHVja2dvLWh0bWxcIiwgXCJnb29nbGVcIiwgXCJiaW5nXCJdKSlcclxuICAgICAgICAub3B0aW9uYWwoKVxyXG4gICAgICAgIC5kZXNjcmliZShcIk9wdGlvbmFsOiBMaXN0IG9mIHNwZWNpZmljIHByb3ZpZGVycyB0byBxdWVyeS4gSWYgb21pdHRlZCwgYSBmYWxsYmFjayBjaGFpbiBpcyB1c2VkOiBEREcgQVBJIC0+IERERyBQdXBwZXRlZXIgLT4gR29vZ2xlIC0+IEJpbmcuXCIpLFxyXG4gICAgfSxcclxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBxdWVyeSwgcHJvdmlkZXJzIH0pID0+IHtcclxuICAgICAgY29uc3QgcmVzdWx0czogQXJyYXk8eyB0aXRsZTogc3RyaW5nOyBsaW5rOiBzdHJpbmc7IHNuaXBwZXQ6IHN0cmluZzsgcHJvdmlkZXI6IHN0cmluZyB9PiA9IFtdO1xyXG4gICAgICBjb25zdCBlcnJvcnM6IHN0cmluZ1tdID0gW107XHJcbiAgICAgIGNvbnN0IGxvZ3M6IHN0cmluZ1tdID0gW107XHJcblxyXG4gICAgICAvLyAtLS0gUHJvdmlkZXIgSW1wbGVtZW50YXRpb25zIC0tLVxyXG5cclxuICAgICAgY29uc3Qgc2VhcmNoRnVuY3Rpb25zID0ge1xyXG4gICAgICAgIFwiZHVja2R1Y2tnby1hcGlcIjogYXN5bmMgKHE6IHN0cmluZykgPT4ge1xyXG4gICAgICAgICAgY29uc3QgeyBzZWFyY2gsIFNhZmVTZWFyY2hUeXBlIH0gPSBhd2FpdCBpbXBvcnQoXCJkdWNrLWR1Y2stc2NyYXBlXCIpO1xyXG4gICAgICAgICAgLy8gU2ltcGxlIHJldHJ5IGxvZ2ljIGZvciBEREcgQVBJXHJcbiAgICAgICAgICBsZXQgYXR0ZW1wdCA9IDA7XHJcbiAgICAgICAgICB3aGlsZSAoYXR0ZW1wdCA8IDIpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICBjb25zdCByID0gYXdhaXQgc2VhcmNoKHEsIHsgc2FmZVNlYXJjaDogU2FmZVNlYXJjaFR5cGUuT0ZGIH0pO1xyXG4gICAgICAgICAgICAgIGlmIChyLnJlc3VsdHMgJiYgci5yZXN1bHRzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByLnJlc3VsdHMubWFwKChyZXN1bHQ6IGFueSkgPT4gKHtcclxuICAgICAgICAgICAgICAgICAgdGl0bGU6IHJlc3VsdC50aXRsZSxcclxuICAgICAgICAgICAgICAgICAgbGluazogcmVzdWx0LnVybCxcclxuICAgICAgICAgICAgICAgICAgc25pcHBldDogcmVzdWx0LmRlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgICAgICAgICBwcm92aWRlcjogXCJkdWNrZHVja2dvLWFwaVwiXHJcbiAgICAgICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGJyZWFrOyAvLyBObyByZXN1bHRzIGJ1dCBzdWNjZXNzZnVsIGNhbGxcclxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgIGF0dGVtcHQrKztcclxuICAgICAgICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZShyID0+IHNldFRpbWVvdXQociwgMTAwMCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyByZXN1bHRzIG9yIEFQSSBmYWlsZWRcIik7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgXCJkdWNrZHVja2dvLWh0bWxcIjogYXN5bmMgKHE6IHN0cmluZykgPT4ge1xyXG4gICAgICAgICAgY29uc3QgcHVwcGV0ZWVyID0gYXdhaXQgaW1wb3J0KFwicHVwcGV0ZWVyXCIpO1xyXG4gICAgICAgICAgY29uc3QgYnJvd3NlciA9IGF3YWl0IHB1cHBldGVlci5sYXVuY2goeyBoZWFkbGVzczogdHJ1ZSB9KTtcclxuICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHBhZ2UgPSBhd2FpdCBicm93c2VyLm5ld1BhZ2UoKTtcclxuICAgICAgICAgICAgLy8gVXNlIHRoZSBIVE1MLW9ubHkgdmVyc2lvbiBmb3IgZWFzaWVyIHNjcmFwaW5nL2xlc3MgSlMgYmxvY2tpbmdcclxuICAgICAgICAgICAgYXdhaXQgcGFnZS5nb3RvKGBodHRwczovL2h0bWwuZHVja2R1Y2tnby5jb20vaHRtbC8/cT0ke2VuY29kZVVSSUNvbXBvbmVudChxKX1gLCB7IHdhaXRVbnRpbDogJ25ldHdvcmtpZGxlMicsIHRpbWVvdXQ6IDE1MDAwIH0pO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgZXh0cmFjdGVkID0gYXdhaXQgcGFnZS5ldmFsdWF0ZSgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgY29uc3QgaXRlbXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcucmVzdWx0Jyk7XHJcbiAgICAgICAgICAgICAgY29uc3QgZGF0YSA9IFtdO1xyXG4gICAgICAgICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiBpdGVtcykge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbGlua0VsID0gaXRlbS5xdWVyeVNlbGVjdG9yKCcucmVzdWx0X19hJyk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzbmlwcGV0RWwgPSBpdGVtLnF1ZXJ5U2VsZWN0b3IoJy5yZXN1bHRfX3NuaXBwZXQnKTtcclxuICAgICAgICAgICAgICAgIGlmIChsaW5rRWwpIHtcclxuICAgICAgICAgICAgICAgICAgZGF0YS5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogKGxpbmtFbCBhcyBIVE1MRWxlbWVudCkuaW5uZXJUZXh0LFxyXG4gICAgICAgICAgICAgICAgICAgIGxpbms6IGxpbmtFbC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSB8fCBcIlwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHNuaXBwZXQ6IHNuaXBwZXRFbCA/IChzbmlwcGV0RWwgYXMgSFRNTEVsZW1lbnQpLmlubmVyVGV4dCA6IFwiXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgcHJvdmlkZXI6IFwiZHVja2R1Y2tnby1odG1sXCJcclxuICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgaWYgKGV4dHJhY3RlZC5sZW5ndGggPiAwKSByZXR1cm4gZXh0cmFjdGVkO1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyByZXN1bHRzIGZvdW5kXCIpO1xyXG4gICAgICAgICAgfSBmaW5hbGx5IHtcclxuICAgICAgICAgICAgYXdhaXQgYnJvd3Nlci5jbG9zZSgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIFwiZ29vZ2xlXCI6IGFzeW5jIChxOiBzdHJpbmcpID0+IHtcclxuICAgICAgICAgIGNvbnN0IHB1cHBldGVlciA9IGF3YWl0IGltcG9ydChcInB1cHBldGVlclwiKTtcclxuICAgICAgICAgIGNvbnN0IGJyb3dzZXIgPSBhd2FpdCBwdXBwZXRlZXIubGF1bmNoKHsgaGVhZGxlc3M6IHRydWUgfSk7XHJcbiAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBwYWdlID0gYXdhaXQgYnJvd3Nlci5uZXdQYWdlKCk7XHJcbiAgICAgICAgICAgIGF3YWl0IHBhZ2UuZ290byhgaHR0cHM6Ly93d3cuZ29vZ2xlLmNvbS9zZWFyY2g/cT0ke2VuY29kZVVSSUNvbXBvbmVudChxKX1gLCB7IHdhaXRVbnRpbDogJ25ldHdvcmtpZGxlMicsIHRpbWVvdXQ6IDE1MDAwIH0pO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgZXh0cmFjdGVkID0gYXdhaXQgcGFnZS5ldmFsdWF0ZSgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgY29uc3QgaXRlbXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdkaXYuZycpO1xyXG4gICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBbXTtcclxuICAgICAgICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgaXRlbXMpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRpdGxlRWwgPSBpdGVtLnF1ZXJ5U2VsZWN0b3IoJ2gzJyk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBsaW5rRWwgPSBpdGVtLnF1ZXJ5U2VsZWN0b3IoJ2EnKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNuaXBwZXRFbCA9IGl0ZW0ucXVlcnlTZWxlY3RvcignZGl2W3N0eWxlKj1cIi13ZWJraXQtbGluZS1jbGFtcFwiXScpIHx8IGl0ZW0ucXVlcnlTZWxlY3RvcignZGl2LlZ3aUMzYicpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRpdGxlRWwgJiYgbGlua0VsKSB7XHJcbiAgICAgICAgICAgICAgICAgIGRhdGEucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IHRpdGxlRWwuaW5uZXJUZXh0LFxyXG4gICAgICAgICAgICAgICAgICAgIGxpbms6IGxpbmtFbC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSB8fCBcIlwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHNuaXBwZXQ6IHNuaXBwZXRFbCA/IChzbmlwcGV0RWwgYXMgSFRNTEVsZW1lbnQpLmlubmVyVGV4dCA6IFwiXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgcHJvdmlkZXI6IFwiZ29vZ2xlXCJcclxuICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgaWYgKGV4dHJhY3RlZC5sZW5ndGggPiAwKSByZXR1cm4gZXh0cmFjdGVkO1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyByZXN1bHRzIGZvdW5kXCIpO1xyXG4gICAgICAgICAgfSBmaW5hbGx5IHtcclxuICAgICAgICAgICAgYXdhaXQgYnJvd3Nlci5jbG9zZSgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIFwiYmluZ1wiOiBhc3luYyAocTogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgICBjb25zdCBwdXBwZXRlZXIgPSBhd2FpdCBpbXBvcnQoXCJwdXBwZXRlZXJcIik7XHJcbiAgICAgICAgICBjb25zdCBicm93c2VyID0gYXdhaXQgcHVwcGV0ZWVyLmxhdW5jaCh7IGhlYWRsZXNzOiB0cnVlIH0pO1xyXG4gICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgcGFnZSA9IGF3YWl0IGJyb3dzZXIubmV3UGFnZSgpO1xyXG4gICAgICAgICAgICBhd2FpdCBwYWdlLmdvdG8oYGh0dHBzOi8vd3d3LmJpbmcuY29tL3NlYXJjaD9xPSR7ZW5jb2RlVVJJQ29tcG9uZW50KHEpfWAsIHsgd2FpdFVudGlsOiAnbmV0d29ya2lkbGUyJywgdGltZW91dDogMTUwMDAgfSk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBleHRyYWN0ZWQgPSBhd2FpdCBwYWdlLmV2YWx1YXRlKCgpID0+IHtcclxuICAgICAgICAgICAgICBjb25zdCBpdGVtcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2xpLmJfYWxnbycpO1xyXG4gICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBbXTtcclxuICAgICAgICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgaXRlbXMpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRpdGxlRWwgPSBpdGVtLnF1ZXJ5U2VsZWN0b3IoJ2gyIGEnKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGxpbmtFbCA9IGl0ZW0ucXVlcnlTZWxlY3RvcignaDIgYScpO1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc25pcHBldEVsID0gaXRlbS5xdWVyeVNlbGVjdG9yKCdwJyk7XHJcbiAgICAgICAgICAgICAgICBpZiAodGl0bGVFbCAmJiBsaW5rRWwpIHtcclxuICAgICAgICAgICAgICAgICAgZGF0YS5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogKHRpdGxlRWwgYXMgSFRNTEVsZW1lbnQpLmlubmVyVGV4dCxcclxuICAgICAgICAgICAgICAgICAgICBsaW5rOiBsaW5rRWwuZ2V0QXR0cmlidXRlKCdocmVmJykgfHwgXCJcIixcclxuICAgICAgICAgICAgICAgICAgICBzbmlwcGV0OiBzbmlwcGV0RWwgPyAoc25pcHBldEVsIGFzIEhUTUxFbGVtZW50KS5pbm5lclRleHQgOiBcIlwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHByb3ZpZGVyOiBcImJpbmdcIlxyXG4gICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpZiAoZXh0cmFjdGVkLmxlbmd0aCA+IDApIHJldHVybiBleHRyYWN0ZWQ7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIHJlc3VsdHMgZm91bmRcIik7XHJcbiAgICAgICAgICB9IGZpbmFsbHkge1xyXG4gICAgICAgICAgICBhd2FpdCBicm93c2VyLmNsb3NlKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgLy8gLS0tIEV4ZWN1dGlvbiBMb2dpYyAtLS1cclxuXHJcbiAgICAgIGlmIChwcm92aWRlcnMgJiYgcHJvdmlkZXJzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAvLyBNYW51YWwgU2VsZWN0aW9uXHJcbiAgICAgICAgZm9yIChjb25zdCBwcm92aWRlcktleSBvZiBwcm92aWRlcnMpIHtcclxuICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGxvZ3MucHVzaChgW01hbnVhbF0gQXR0ZW1wdGluZyAke3Byb3ZpZGVyS2V5fS4uLmApO1xyXG4gICAgICAgICAgICBjb25zdCBmbiA9IHNlYXJjaEZ1bmN0aW9uc1twcm92aWRlcktleV07XHJcbiAgICAgICAgICAgIGlmIChmbikge1xyXG4gICAgICAgICAgICAgIGNvbnN0IHBSZXN1bHRzID0gYXdhaXQgZm4ocXVlcnkpO1xyXG4gICAgICAgICAgICAgIHJlc3VsdHMucHVzaCguLi5wUmVzdWx0cyk7XHJcbiAgICAgICAgICAgICAgbG9ncy5wdXNoKGBbTWFudWFsXSBTdWNjZXNzOiAke3Byb3ZpZGVyS2V5fSBmb3VuZCAke3BSZXN1bHRzLmxlbmd0aH0gcmVzdWx0cy5gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICBjb25zdCBlcnJNc2cgPSBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiBTdHJpbmcoZSk7XHJcbiAgICAgICAgICAgIGVycm9ycy5wdXNoKGAke3Byb3ZpZGVyS2V5fTogJHtlcnJNc2d9YCk7XHJcbiAgICAgICAgICAgIGxvZ3MucHVzaChgW01hbnVhbF0gRmFpbGVkOiAke3Byb3ZpZGVyS2V5fSAtICR7ZXJyTXNnfWApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBGYWxsYmFjayBDaGFpblxyXG4gICAgICAgIGNvbnN0IGNoYWluOiBBcnJheTxrZXlvZiB0eXBlb2Ygc2VhcmNoRnVuY3Rpb25zPiA9IFtcImR1Y2tkdWNrZ28tYXBpXCIsIFwiZHVja2R1Y2tnby1odG1sXCIsIFwiZ29vZ2xlXCIsIFwiYmluZ1wiXTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGFpbi5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgY29uc3QgcHJvdmlkZXJLZXkgPSBjaGFpbltpXTtcclxuICAgICAgICAgIGNvbnN0IG5leHRQcm92aWRlciA9IGNoYWluW2kgKyAxXTtcclxuXHJcbiAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBsb2dzLnB1c2goYFtGYWxsYmFjayBDaGFpbl0gQXR0ZW1wdGluZyAke3Byb3ZpZGVyS2V5fS4uLmApO1xyXG4gICAgICAgICAgICBjb25zdCBwUmVzdWx0cyA9IGF3YWl0IHNlYXJjaEZ1bmN0aW9uc1twcm92aWRlcktleV0ocXVlcnkpO1xyXG4gICAgICAgICAgICByZXN1bHRzLnB1c2goLi4ucFJlc3VsdHMpO1xyXG4gICAgICAgICAgICBsb2dzLnB1c2goYFtGYWxsYmFjayBDaGFpbl0gU3VjY2VzczogJHtwcm92aWRlcktleX0gZm91bmQgJHtwUmVzdWx0cy5sZW5ndGh9IHJlc3VsdHMuIFN0b3BwaW5nIGNoYWluLmApO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgY29uc3QgZXJyTXNnID0gZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogU3RyaW5nKGUpO1xyXG4gICAgICAgICAgICBlcnJvcnMucHVzaChgJHtwcm92aWRlcktleX06ICR7ZXJyTXNnfWApO1xyXG4gICAgICAgICAgICBjb25zdCBuZXh0TXNnID0gbmV4dFByb3ZpZGVyID8gYEZhbGxpbmcgYmFjayB0byAke25leHRQcm92aWRlcn0uLi5gIDogXCJObyBtb3JlIHByb3ZpZGVycy5cIjtcclxuICAgICAgICAgICAgbG9ncy5wdXNoKGBbRmFsbGJhY2sgQ2hhaW5dIEZhaWxlZDogJHtwcm92aWRlcktleX0gLSAke2Vyck1zZ30uICR7bmV4dE1zZ31gKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChyZXN1bHRzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBlcnJvcjogXCJBbGwgYXR0ZW1wdGVkIHNlYXJjaCBwcm92aWRlcnMgZmFpbGVkLlwiLFxyXG4gICAgICAgICAgYXR0ZW1wdHM6IGVycm9ycyxcclxuICAgICAgICAgIHRyYWNlOiBsb2dzXHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICByZXN1bHRzOiByZXN1bHRzLFxyXG4gICAgICAgIG1ldGE6IHtcclxuICAgICAgICAgIHRvdGFsX2ZvdW5kOiByZXN1bHRzLmxlbmd0aCxcclxuICAgICAgICAgIHByb3ZpZGVyc191c2VkOiBbLi4ubmV3IFNldChyZXN1bHRzLm1hcChyID0+IHIucHJvdmlkZXIpKV0sXHJcbiAgICAgICAgICB0cmFjZTogbG9nc1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgIH0sXHJcbiAgfSk7XHJcbiAgdG9vbHMucHVzaCh3ZWJTZWFyY2hUb29sKTtcclxuXHJcbiAgY29uc3QgbW92ZUZpbGVUb29sID0gdG9vbCh7XHJcbiAgICBuYW1lOiBcIm1vdmVfZmlsZVwiLFxyXG4gICAgZGVzY3JpcHRpb246IFwiTW92ZSBvciByZW5hbWUgYSBmaWxlIG9yIGRpcmVjdG9yeS5cIixcclxuICAgIHBhcmFtZXRlcnM6IHtcclxuICAgICAgc291cmNlOiB6LnN0cmluZygpLFxyXG4gICAgICBkZXN0aW5hdGlvbjogei5zdHJpbmcoKSxcclxuICAgIH0sXHJcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgc291cmNlLCBkZXN0aW5hdGlvbiB9KSA9PiB7XHJcbiAgICAgIGNvbnN0IHNvdXJjZVBhdGggPSB2YWxpZGF0ZVBhdGgoY3VycmVudFdvcmtpbmdEaXJlY3RvcnksIHNvdXJjZSk7XHJcbiAgICAgIGNvbnN0IGRlc3RQYXRoID0gdmFsaWRhdGVQYXRoKGN1cnJlbnRXb3JraW5nRGlyZWN0b3J5LCBkZXN0aW5hdGlvbik7XHJcbiAgICAgIGF3YWl0IHJlbmFtZShzb3VyY2VQYXRoLCBkZXN0UGF0aCk7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgICBmcm9tOiBzb3VyY2VQYXRoLFxyXG4gICAgICAgIHRvOiBkZXN0UGF0aCxcclxuICAgICAgfTtcclxuICAgIH0sXHJcbiAgfSk7XHJcbiAgdG9vbHMucHVzaChtb3ZlRmlsZVRvb2wpO1xyXG5cclxuICBjb25zdCBjb3B5RmlsZVRvb2wgPSB0b29sKHtcclxuICAgIG5hbWU6IFwiY29weV9maWxlXCIsXHJcbiAgICBkZXNjcmlwdGlvbjogXCJDb3B5IGEgZmlsZSB0byBhIG5ldyBsb2NhdGlvbi5cIixcclxuICAgIHBhcmFtZXRlcnM6IHtcclxuICAgICAgc291cmNlOiB6LnN0cmluZygpLFxyXG4gICAgICBkZXN0aW5hdGlvbjogei5zdHJpbmcoKSxcclxuICAgIH0sXHJcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgc291cmNlLCBkZXN0aW5hdGlvbiB9KSA9PiB7XHJcbiAgICAgIGNvbnN0IHNvdXJjZVBhdGggPSB2YWxpZGF0ZVBhdGgoY3VycmVudFdvcmtpbmdEaXJlY3RvcnksIHNvdXJjZSk7XHJcbiAgICAgIGNvbnN0IGRlc3RQYXRoID0gdmFsaWRhdGVQYXRoKGN1cnJlbnRXb3JraW5nRGlyZWN0b3J5LCBkZXN0aW5hdGlvbik7XHJcbiAgICAgIGF3YWl0IGNvcHlGaWxlKHNvdXJjZVBhdGgsIGRlc3RQYXRoKTtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICAgIGZyb206IHNvdXJjZVBhdGgsXHJcbiAgICAgICAgdG86IGRlc3RQYXRoLFxyXG4gICAgICB9O1xyXG4gICAgfSxcclxuICB9KTtcclxuICB0b29scy5wdXNoKGNvcHlGaWxlVG9vbCk7XHJcblxyXG4gIGNvbnN0IGZldGNoV2ViQ29udGVudFRvb2wgPSB0b29sKHtcclxuICAgIG5hbWU6IFwiZmV0Y2hfd2ViX2NvbnRlbnRcIixcclxuICAgIGRlc2NyaXB0aW9uOiBcIkZldGNoIHRoZSBjbGVhbiwgdGV4dC1iYXNlZCBjb250ZW50IG9mIGEgd2VicGFnZSBVUkwuXCIsXHJcbiAgICBwYXJhbWV0ZXJzOiB7XHJcbiAgICAgIHVybDogei5zdHJpbmcoKSxcclxuICAgIH0sXHJcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgdXJsIH0pID0+IHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCk7XHJcbiAgICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBIVFRQIGVycm9yISBzdGF0dXM6ICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgdGV4dCA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcclxuXHJcbiAgICAgICAgY29uc3QgcmVzdWx0OiBhbnkgPSB7XHJcbiAgICAgICAgICB1cmwsXHJcbiAgICAgICAgICBzdGF0dXM6IHJlc3BvbnNlLnN0YXR1cyxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBjb25zdCB0aXRsZU1hdGNoID0gdGV4dC5tYXRjaCgvPHRpdGxlW14+XSo+KFtePF0rKTxcXC90aXRsZT4vaSk7XHJcbiAgICAgICAgaWYgKHRpdGxlTWF0Y2gpIHJlc3VsdC50aXRsZSA9IHRpdGxlTWF0Y2hbMV07XHJcblxyXG4gICAgICAgIC8vIENsZWFuaW5nIC0gVXNlIGl0ZXJhdGl2ZSBzdHJpcHBpbmcgdG8gcHJldmVudCByZWFzc2VtYmx5IGF0dGFja3MgKENvZGVRTCBmaXgpXHJcbiAgICAgICAgLy8gUmVtb3ZlIGRhbmdlcm91cyB0YWdzIGl0ZXJhdGl2ZWx5IHVudGlsIG5vbmUgcmVtYWluXHJcbiAgICAgICAgbGV0IHByZXZpb3VzTGVuZ3RoO1xyXG4gICAgICAgIGRvIHtcclxuICAgICAgICAgIHByZXZpb3VzTGVuZ3RoID0gdGV4dC5sZW5ndGg7XHJcbiAgICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC88c2NyaXB0XFxiW14+XSo+W1xcc1xcU10qPzxcXC9zY3JpcHQ+L2dpLCBcIlwiKTtcclxuICAgICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoLzxzdHlsZVxcYltePl0qPltcXHNcXFNdKj88XFwvc3R5bGU+L2dpLCBcIlwiKTtcclxuICAgICAgICB9IHdoaWxlICh0ZXh0Lmxlbmd0aCA8IHByZXZpb3VzTGVuZ3RoKTtcclxuXHJcbiAgICAgICAgLy8gUmVtb3ZlIG90aGVyIHN0cnVjdHVyYWwgdGFncyAoc2luZ2xlIHBhc3MgaXMgc2FmZSBmb3IgdGhlc2UpXHJcbiAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZSgvPG5hdlxcYltePl0qPltcXHNcXFNdKj88XFwvbmF2Pi9naSwgXCJcIik7XHJcbiAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZSgvPGZvb3RlclxcYltePl0qPltcXHNcXFNdKj88XFwvZm9vdGVyPi9naSwgXCJcIik7XHJcbiAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZSgvPGhlYWRlclxcYltePl0qPltcXHNcXFNdKj88XFwvaGVhZGVyPi9naSwgXCJcIik7XHJcbiAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZSgvPGFzaWRlXFxiW14+XSo+W1xcc1xcU10qPzxcXC9hc2lkZT4vZ2ksIFwiXCIpO1xyXG4gICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoLzxcXC9kaXY+L2dpLCBcIlxcblwiKTtcclxuICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC88XFwvcD4vZ2ksIFwiXFxuXCIpO1xyXG4gICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoLzxiclxccypcXC8/Pi9naSwgXCJcXG5cIik7XHJcblxyXG4gICAgICAgIC8vIEl0ZXJhdGl2ZWx5IHN0cmlwIHJlbWFpbmluZyB0YWdzIHRvIHByZXZlbnQgcmVhc3NlbWJseVxyXG4gICAgICAgIGRvIHtcclxuICAgICAgICAgIHByZXZpb3VzTGVuZ3RoID0gdGV4dC5sZW5ndGg7XHJcbiAgICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC88W14+XSs+L2csIFwiXCIpO1xyXG4gICAgICAgIH0gd2hpbGUgKHRleHQubGVuZ3RoIDwgcHJldmlvdXNMZW5ndGgpO1xyXG5cclxuICAgICAgICAvLyBEZWNvZGUgSFRNTCBlbnRpdGllcyAtIGRlY29kZSAmbHQ7LyZndDsgRklSU1QsIHRoZW4gJmFtcDsgTEFTVCAoQ29kZVFMIGZpeCBmb3IgZG91YmxlLWVzY2FwaW5nKVxyXG4gICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoLyZsdDsvZywgXCI8XCIpLnJlcGxhY2UoLyZndDsvZywgXCI+XCIpLnJlcGxhY2UoLyZxdW90Oy9nLCAnXCInKS5yZXBsYWNlKC8mbmJzcDsvZywgXCIgXCIpLnJlcGxhY2UoLyZhbXA7L2csIFwiJlwiKTtcclxuICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC9bIFxcdF0rL2csICcgJykucmVwbGFjZSgvXFxuXFxzKlxcbi9nLCBcIlxcblxcblwiKS50cmltKCk7XHJcblxyXG4gICAgICAgIHJlc3VsdC5jb250ZW50ID0gdGV4dC5zdWJzdHJpbmcoMCwgNDAwMDApICsgKHRleHQubGVuZ3RoID4gNDAwMDAgPyBcIi4uLiAodHJ1bmNhdGVkKVwiIDogXCJcIik7XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIGVycm9yOiBgRmFpbGVkIHRvIGZldGNoIFVSTDogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcil9YCxcclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gIH0pO1xyXG4gIHRvb2xzLnB1c2goZmV0Y2hXZWJDb250ZW50VG9vbCk7XHJcblxyXG4gIGNvbnN0IHJhZ1dlYkNvbnRlbnRUb29sID0gdG9vbCh7XHJcbiAgICBuYW1lOiBcInJhZ193ZWJfY29udGVudFwiLFxyXG4gICAgZGVzY3JpcHRpb246IFwiRmV0Y2ggY29udGVudCBmcm9tIGEgVVJMLCBhbmQgdGhlbiB1c2UgUkFHIHRvIGZpbmQgYW5kIHJldHVybiBvbmx5IHRoZSB0ZXh0IGNodW5rcyBtb3N0IHJlbGV2YW50IHRvIGEgc3BlY2lmaWMgcXVlcnkuXCIsXHJcbiAgICBwYXJhbWV0ZXJzOiB7XHJcbiAgICAgIHVybDogei5zdHJpbmcoKSxcclxuICAgICAgcXVlcnk6IHouc3RyaW5nKCksXHJcbiAgICB9LFxyXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHVybCwgcXVlcnkgfSkgPT4ge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIC8vIDEuIEZldGNoIGNvbnRlbnRcclxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCk7XHJcbiAgICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBIVFRQIGVycm9yISBzdGF0dXM6ICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgdGV4dCA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcclxuXHJcbiAgICAgICAgLy8gMi4gQ2xlYW4gY29udGVudCB0byBnZXQgbWFpbiB0ZXh0IC0gVXNlIGl0ZXJhdGl2ZSBzdHJpcHBpbmcgKENvZGVRTCBmaXgpXHJcbiAgICAgICAgbGV0IHByZXZpb3VzTGVuZ3RoO1xyXG4gICAgICAgIGRvIHtcclxuICAgICAgICAgIHByZXZpb3VzTGVuZ3RoID0gdGV4dC5sZW5ndGg7XHJcbiAgICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC88c2NyaXB0XFxiW14+XSo+W1xcc1xcU10qPzxcXC9zY3JpcHQ+L2dpLCBcIlwiKTtcclxuICAgICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoLzxzdHlsZVxcYltePl0qPltcXHNcXFNdKj88XFwvc3R5bGU+L2dpLCBcIlwiKTtcclxuICAgICAgICB9IHdoaWxlICh0ZXh0Lmxlbmd0aCA8IHByZXZpb3VzTGVuZ3RoKTtcclxuXHJcbiAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZSgvPG5hdlxcYltePl0qPltcXHNcXFNdKj88XFwvbmF2Pi9naSwgXCJcIik7XHJcbiAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZSgvPGZvb3RlclxcYltePl0qPltcXHNcXFNdKj88XFwvZm9vdGVyPi9naSwgXCJcIik7XHJcbiAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZSgvPGhlYWRlclxcYltePl0qPltcXHNcXFNdKj88XFwvaGVhZGVyPi9naSwgXCJcIik7XHJcbiAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZSgvPGFzaWRlXFxiW14+XSo+W1xcc1xcU10qPzxcXC9hc2lkZT4vZ2ksIFwiXCIpO1xyXG4gICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoLzxcXC9kaXY+L2dpLCBcIlxcblwiKTtcclxuICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC88XFwvcD4vZ2ksIFwiXFxuXCIpO1xyXG4gICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoLzxiclxccypcXC8/Pi9naSwgXCJcXG5cIik7XHJcblxyXG4gICAgICAgIC8vIEl0ZXJhdGl2ZWx5IHN0cmlwIHJlbWFpbmluZyB0YWdzIHRvIHByZXZlbnQgcmVhc3NlbWJseVxyXG4gICAgICAgIGRvIHtcclxuICAgICAgICAgIHByZXZpb3VzTGVuZ3RoID0gdGV4dC5sZW5ndGg7XHJcbiAgICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC88W14+XSs+L2csIFwiXCIpO1xyXG4gICAgICAgIH0gd2hpbGUgKHRleHQubGVuZ3RoIDwgcHJldmlvdXNMZW5ndGgpO1xyXG5cclxuICAgICAgICAvLyBEZWNvZGUgSFRNTCBlbnRpdGllcyAtIGRlY29kZSAmbHQ7LyZndDsgRklSU1QsIHRoZW4gJmFtcDsgTEFTVCAoQ29kZVFMIGZpeClcclxuICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC8mbHQ7L2csIFwiPFwiKS5yZXBsYWNlKC8mZ3Q7L2csIFwiPlwiKS5yZXBsYWNlKC8mcXVvdDsvZywgJ1wiJykucmVwbGFjZSgvJm5ic3A7L2csIFwiIFwiKS5yZXBsYWNlKC8mYW1wOy9nLCBcIiZcIik7XHJcbiAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZSgvWyBcXHRdKy9nLCAnICcpLnJlcGxhY2UoL1xcblxccypcXG4vZywgXCJcXG5cXG5cIikudHJpbSgpO1xyXG5cclxuICAgICAgICBpZiAodGV4dC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgIHJldHVybiB7IGVycm9yOiBcIkNvdWxkIG5vdCBleHRyYWN0IGFueSB0ZXh0IGZyb20gdGhlIFVSTC5cIiB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gMy4gUGVyZm9ybSBSQUdcclxuICAgICAgICBpZiAoIWNsaWVudCkge1xyXG4gICAgICAgICAgcmV0dXJuIHsgZXJyb3I6IFwiTE0gU3R1ZGlvIENsaWVudCBpcyBub3QgYXZhaWxhYmxlLiBSQUcgZmVhdHVyZXMgcmVxdWlyZSB0aGUgY2xpZW50IHRvIGJlIGluaXRpYWxpemVkLlwiIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHJhZ1Jlc3VsdHMgPSBhd2FpdCBwZXJmb3JtUmFnT25UZXh0KHRleHQsIHF1ZXJ5LCBjbGllbnQsIGVtYmVkZGluZ01vZGVsTmFtZSk7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB1cmw6IHVybCxcclxuICAgICAgICAgIHF1ZXJ5OiBxdWVyeSxcclxuICAgICAgICAgIHJlbGV2YW50X2NodW5rczogcmFnUmVzdWx0cyxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICByZXR1cm4geyBlcnJvcjogYEZhaWxlZCBkdXJpbmcgUkFHIHdlYiBzZWFyY2g6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpfWAgfTtcclxuICAgICAgfVxyXG4gICAgfSxcclxuICB9KTtcclxuICB0b29scy5wdXNoKHJhZ1dlYkNvbnRlbnRUb29sKTtcclxuXHJcbiAgY29uc3QgZ2V0U3lzdGVtSW5mb1Rvb2wgPSB0b29sKHtcclxuICAgIG5hbWU6IFwiZ2V0X3N5c3RlbV9pbmZvXCIsXHJcbiAgICBkZXNjcmlwdGlvbjogXCJHZXQgaW5mb3JtYXRpb24gYWJvdXQgdGhlIHN5c3RlbSAoT1MsIENQVSwgTWVtb3J5KS5cIixcclxuICAgIHBhcmFtZXRlcnM6IHt9LFxyXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICgpID0+IHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBwbGF0Zm9ybTogb3MucGxhdGZvcm0oKSxcclxuICAgICAgICBhcmNoOiBvcy5hcmNoKCksXHJcbiAgICAgICAgcmVsZWFzZTogb3MucmVsZWFzZSgpLFxyXG4gICAgICAgIGhvc3RuYW1lOiBvcy5ob3N0bmFtZSgpLFxyXG4gICAgICAgIHRvdGFsX21lbW9yeTogb3MudG90YWxtZW0oKSxcclxuICAgICAgICBmcmVlX21lbW9yeTogb3MuZnJlZW1lbSgpLFxyXG4gICAgICAgIGNwdXM6IG9zLmNwdXMoKS5sZW5ndGgsXHJcbiAgICAgICAgbm9kZV92ZXJzaW9uOiBwcm9jZXNzLnZlcnNpb24sXHJcbiAgICAgIH07XHJcbiAgICB9LFxyXG4gIH0pO1xyXG4gIHRvb2xzLnB1c2goZ2V0U3lzdGVtSW5mb1Rvb2wpO1xyXG5cclxuICBjb25zdCBmaW5kRmlsZXNUb29sID0gdG9vbCh7XHJcbiAgICBuYW1lOiBcImZpbmRfZmlsZXNcIixcclxuICAgIGRlc2NyaXB0aW9uOiBcIkZpbmQgZmlsZXMgcmVjdXJzaXZlbHkgaW4gdGhlIGN1cnJlbnQgZGlyZWN0b3J5IG1hdGNoaW5nIGEgbmFtZSBwYXR0ZXJuLlwiLFxyXG4gICAgcGFyYW1ldGVyczoge1xyXG4gICAgICBwYXR0ZXJuOiB6LnN0cmluZygpLmRlc2NyaWJlKFwiU3Vic3RyaW5nIHRvIG1hdGNoIGluIGZpbGVuYW1lIChjYXNlLWluc2Vuc2l0aXZlKVwiKSxcclxuICAgICAgbWF4X2RlcHRoOiB6Lm51bWJlcigpLm9wdGlvbmFsKCkuZGVzY3JpYmUoXCJNYXhpbXVtIGRlcHRoIHRvIHNlYXJjaCAoZGVmYXVsdDogNSlcIiksXHJcbiAgICB9LFxyXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IHBhdHRlcm4sIG1heF9kZXB0aCB9KSA9PiB7XHJcbiAgICAgIGNvbnN0IGRlcHRoTGltaXQgPSBtYXhfZGVwdGggPz8gNTtcclxuICAgICAgY29uc3QgZm91bmRGaWxlczogc3RyaW5nW10gPSBbXTtcclxuICAgICAgY29uc3QgbG93ZXJQYXR0ZXJuID0gcGF0dGVybi50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICAgICAgYXN5bmMgZnVuY3Rpb24gc2NhbihkaXI6IHN0cmluZywgY3VycmVudERlcHRoOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAoY3VycmVudERlcHRoID4gZGVwdGhMaW1pdCkgcmV0dXJuO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBjb25zdCBlbnRyaWVzID0gYXdhaXQgcmVhZGRpcihkaXIsIHsgd2l0aEZpbGVUeXBlczogdHJ1ZSB9KTtcclxuICAgICAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgZW50cmllcykge1xyXG4gICAgICAgICAgICBjb25zdCBmdWxsUGF0aCA9IGpvaW4oZGlyLCBlbnRyeS5uYW1lKTtcclxuICAgICAgICAgICAgaWYgKGVudHJ5LmlzRGlyZWN0b3J5KCkpIHtcclxuICAgICAgICAgICAgICBhd2FpdCBzY2FuKGZ1bGxQYXRoLCBjdXJyZW50RGVwdGggKyAxKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChlbnRyeS5pc0ZpbGUoKSkge1xyXG4gICAgICAgICAgICAgIGlmIChlbnRyeS5uYW1lLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMobG93ZXJQYXR0ZXJuKSkge1xyXG4gICAgICAgICAgICAgICAgZm91bmRGaWxlcy5wdXNoKGZ1bGxQYXRoKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAvLyBJZ25vcmUgYWNjZXNzIGVycm9yc1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgYXdhaXQgc2NhbihjdXJyZW50V29ya2luZ0RpcmVjdG9yeSwgMCk7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgZm91bmRfZmlsZXM6IGZvdW5kRmlsZXMuc2xpY2UoMCwgMTAwKSwgLy8gTGltaXQgcmVzdWx0c1xyXG4gICAgICAgIGNvdW50OiBmb3VuZEZpbGVzLmxlbmd0aCxcclxuICAgICAgfTtcclxuICAgIH0sXHJcbiAgfSk7XHJcbiAgdG9vbHMucHVzaChmaW5kRmlsZXNUb29sKTtcclxuXHJcbiAgY29uc3QgZ2V0RmlsZU1ldGFkYXRhVG9vbCA9IHRvb2woe1xyXG4gICAgbmFtZTogXCJnZXRfZmlsZV9tZXRhZGF0YVwiLFxyXG4gICAgZGVzY3JpcHRpb246IFwiR2V0IG1ldGFkYXRhIChzaXplLCBkYXRlcykgZm9yIGEgc3BlY2lmaWMgZmlsZS5cIixcclxuICAgIHBhcmFtZXRlcnM6IHtcclxuICAgICAgcGF0aDogei5zdHJpbmcoKSxcclxuICAgIH0sXHJcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgcGF0aCB9KSA9PiB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgdGFyZ2V0UGF0aCA9IHZhbGlkYXRlUGF0aChjdXJyZW50V29ya2luZ0RpcmVjdG9yeSwgcGF0aCk7XHJcbiAgICAgICAgY29uc3Qgc3RhdHMgPSBhd2FpdCBzdGF0KHRhcmdldFBhdGgpO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBwYXRoOiB0YXJnZXRQYXRoLFxyXG4gICAgICAgICAgc2l6ZTogc3RhdHMuc2l6ZSxcclxuICAgICAgICAgIGNyZWF0ZWQ6IHN0YXRzLmJpcnRodGltZSxcclxuICAgICAgICAgIG1vZGlmaWVkOiBzdGF0cy5tdGltZSxcclxuICAgICAgICAgIGlzX2RpcmVjdG9yeTogc3RhdHMuaXNEaXJlY3RvcnkoKSxcclxuICAgICAgICAgIGlzX2ZpbGU6IHN0YXRzLmlzRmlsZSgpLFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgcmV0dXJuIHsgZXJyb3I6IGBGYWlsZWQgdG8gZ2V0IG1ldGFkYXRhOiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKX1gIH07XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgfSk7XHJcbiAgdG9vbHMucHVzaChnZXRGaWxlTWV0YWRhdGFUb29sKTtcclxuXHJcbiAgY29uc3QgcmVhZENsaXBib2FyZFRvb2wgPSB0b29sKHtcclxuICAgIG5hbWU6IFwicmVhZF9jbGlwYm9hcmRcIixcclxuICAgIGRlc2NyaXB0aW9uOiBcIlJlYWQgdGV4dCBjb250ZW50IGZyb20gdGhlIHN5c3RlbSBjbGlwYm9hcmQuXCIsXHJcbiAgICBwYXJhbWV0ZXJzOiB7fSxcclxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoKSA9PiB7XHJcbiAgICAgIGxldCBjb21tYW5kID0gXCJcIjtcclxuICAgICAgbGV0IGFyZ3M6IHN0cmluZ1tdID0gW107XHJcblxyXG4gICAgICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gXCJ3aW4zMlwiKSB7XHJcbiAgICAgICAgY29tbWFuZCA9IFwicG93ZXJzaGVsbFwiO1xyXG4gICAgICAgIGFyZ3MgPSBbXCItY29tbWFuZFwiLCBcIkdldC1DbGlwYm9hcmRcIl07XHJcbiAgICAgIH0gZWxzZSBpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gXCJkYXJ3aW5cIikge1xyXG4gICAgICAgIGNvbW1hbmQgPSBcInBicGFzdGVcIjtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBMaW51eCBmYWxsYmFjayAobWlnaHQgZmFpbCBpZiB0b29scyBtaXNzaW5nKVxyXG4gICAgICAgIGNvbW1hbmQgPSBcInhjbGlwXCI7XHJcbiAgICAgICAgYXJncyA9IFtcIi1zZWxlY3Rpb25cIiwgXCJjbGlwYm9hcmRcIiwgXCItb1wiXTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIFByb21pc2UucmFjZShbXHJcbiAgICAgICAgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgICAgIGNvbnN0IGNoaWxkID0gc3Bhd24oY29tbWFuZCwgYXJncyk7XHJcbiAgICAgICAgICBsZXQgb3V0cHV0ID0gXCJcIjtcclxuICAgICAgICAgIGxldCBlcnJvciA9IFwiXCI7XHJcblxyXG4gICAgICAgICAgY2hpbGQuc3Rkb3V0Lm9uKFwiZGF0YVwiLCAoZGF0YSkgPT4gb3V0cHV0ICs9IGRhdGEudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgICBjaGlsZC5zdGRlcnIub24oXCJkYXRhXCIsIChkYXRhKSA9PiBlcnJvciArPSBkYXRhLnRvU3RyaW5nKCkpO1xyXG5cclxuICAgICAgICAgIGNoaWxkLm9uKFwiY2xvc2VcIiwgKGNvZGUpID0+IHtcclxuICAgICAgICAgICAgaWYgKGNvZGUgPT09IDApIHtcclxuICAgICAgICAgICAgICByZXNvbHZlKHsgY29udGVudDogb3V0cHV0LnRyaW0oKSB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICByZXNvbHZlKHsgZXJyb3I6IGBGYWlsZWQgdG8gcmVhZCBjbGlwYm9hcmQuIEV4aXQgY29kZTogJHtjb2RlfS4gRXJyb3I6ICR7ZXJyb3J9YCB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgY2hpbGQub24oXCJlcnJvclwiLCAoZXJyKSA9PiB7XHJcbiAgICAgICAgICAgIHJlc29sdmUoeyBlcnJvcjogYEZhaWxlZCB0byBzcGF3biBjbGlwYm9hcmQgY29tbWFuZDogJHtlcnIubWVzc2FnZX1gIH0pO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSksXHJcbiAgICAgICAgbmV3IFByb21pc2UoKF8sIHJlamVjdCkgPT5cclxuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gcmVqZWN0KG5ldyBFcnJvcihcIkNsaXBib2FyZCBvcGVyYXRpb24gdGltZW91dFwiKSksIDUwMDApXHJcbiAgICAgICAgKVxyXG4gICAgICBdKS5jYXRjaCgoZXJyKSA9PiAoeyBlcnJvcjogZXJyLm1lc3NhZ2UgfSkpO1xyXG4gICAgfSxcclxuICB9KTtcclxuICB0b29scy5wdXNoKHJlYWRDbGlwYm9hcmRUb29sKTtcclxuXHJcbiAgY29uc3Qgd3JpdGVDbGlwYm9hcmRUb29sID0gdG9vbCh7XHJcbiAgICBuYW1lOiBcIndyaXRlX2NsaXBib2FyZFwiLFxyXG4gICAgZGVzY3JpcHRpb246IFwiV3JpdGUgdGV4dCBjb250ZW50IHRvIHRoZSBzeXN0ZW0gY2xpcGJvYXJkLlwiLFxyXG4gICAgcGFyYW1ldGVyczoge1xyXG4gICAgICBjb250ZW50OiB6LnN0cmluZygpLFxyXG4gICAgfSxcclxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyBjb250ZW50IH0pID0+IHtcclxuICAgICAgbGV0IGNvbW1hbmQgPSBcIlwiO1xyXG4gICAgICBsZXQgYXJnczogc3RyaW5nW10gPSBbXTtcclxuICAgICAgbGV0IGlucHV0ID0gY29udGVudDtcclxuXHJcbiAgICAgIGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSBcIndpbjMyXCIpIHtcclxuICAgICAgICBjb21tYW5kID0gXCJwb3dlcnNoZWxsXCI7XHJcbiAgICAgICAgLy8gVXNlIGJhc2U2NCB0byBhdm9pZCBjb21wbGV4IGVzY2FwaW5nIGlzc3VlcyBpbiBQb3dlclNoZWxsXHJcbiAgICAgICAgY29uc3QgYmFzZTY0Q29udGVudCA9IEJ1ZmZlci5mcm9tKGNvbnRlbnQsICd1dGY4JykudG9TdHJpbmcoJ2Jhc2U2NCcpO1xyXG4gICAgICAgIC8vIENvbW1hbmQgZGVjb2RlcyBiYXNlNjQgYW5kIHNldHMgY2xpcGJvYXJkXHJcbiAgICAgICAgYXJncyA9IFtcIi1jb21tYW5kXCIsIGAkc3RyID0gW1N5c3RlbS5UZXh0LkVuY29kaW5nXTo6VVRGOC5HZXRTdHJpbmcoW1N5c3RlbS5Db252ZXJ0XTo6RnJvbUJhc2U2NFN0cmluZygnJHtiYXNlNjRDb250ZW50fScpKTsgU2V0LUNsaXBib2FyZCAtVmFsdWUgJHN0cmBdO1xyXG4gICAgICAgIGlucHV0ID0gXCJcIjsgLy8gSW5wdXQgaGFuZGxlZCB2aWEgYXJnc1xyXG4gICAgICB9IGVsc2UgaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09IFwiZGFyd2luXCIpIHtcclxuICAgICAgICBjb21tYW5kID0gXCJwYmNvcHlcIjtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjb21tYW5kID0gXCJ4Y2xpcFwiO1xyXG4gICAgICAgIGFyZ3MgPSBbXCItc2VsZWN0aW9uXCIsIFwiY2xpcGJvYXJkXCIsIFwiLWlcIl07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBQcm9taXNlLnJhY2UoW1xyXG4gICAgICAgIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgICBjb25zdCBjaGlsZCA9IHNwYXduKGNvbW1hbmQsIGFyZ3MsIHsgc3RkaW86IFsncGlwZScsICdpZ25vcmUnLCAncGlwZSddIH0pO1xyXG5cclxuICAgICAgICAgIGlmIChpbnB1dCAmJiBwcm9jZXNzLnBsYXRmb3JtICE9PSBcIndpbjMyXCIpIHtcclxuICAgICAgICAgICAgY2hpbGQuc3RkaW4ud3JpdGUoaW5wdXQpO1xyXG4gICAgICAgICAgICBjaGlsZC5zdGRpbi5lbmQoKTtcclxuICAgICAgICAgIH0gZWxzZSBpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gXCJ3aW4zMlwiKSB7XHJcbiAgICAgICAgICAgIGNoaWxkLnN0ZGluLmVuZCgpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGxldCBlcnJvciA9IFwiXCI7XHJcbiAgICAgICAgICBjaGlsZC5zdGRlcnIub24oXCJkYXRhXCIsIChkYXRhKSA9PiBlcnJvciArPSBkYXRhLnRvU3RyaW5nKCkpO1xyXG5cclxuICAgICAgICAgIGNoaWxkLm9uKFwiY2xvc2VcIiwgKGNvZGUpID0+IHtcclxuICAgICAgICAgICAgaWYgKGNvZGUgPT09IDApIHtcclxuICAgICAgICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogdHJ1ZSB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICByZXNvbHZlKHsgZXJyb3I6IGBGYWlsZWQgdG8gd3JpdGUgdG8gY2xpcGJvYXJkLiBFeGl0IGNvZGU6ICR7Y29kZX0uIEVycm9yOiAke2Vycm9yfWAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgIGNoaWxkLm9uKFwiZXJyb3JcIiwgKGVycikgPT4ge1xyXG4gICAgICAgICAgICByZXNvbHZlKHsgZXJyb3I6IGBGYWlsZWQgdG8gc3Bhd24gY2xpcGJvYXJkIGNvbW1hbmQ6ICR7ZXJyLm1lc3NhZ2V9YCB9KTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pLFxyXG4gICAgICAgIG5ldyBQcm9taXNlKChfLCByZWplY3QpID0+XHJcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHJlamVjdChuZXcgRXJyb3IoXCJDbGlwYm9hcmQgb3BlcmF0aW9uIHRpbWVvdXRcIikpLCA1MDAwKVxyXG4gICAgICAgIClcclxuICAgICAgXSkuY2F0Y2goKGVycikgPT4gKHsgZXJyb3I6IGVyci5tZXNzYWdlIH0pKTtcclxuICAgIH0sXHJcbiAgfSk7XHJcbiAgdG9vbHMucHVzaCh3cml0ZUNsaXBib2FyZFRvb2wpO1xyXG5cclxuICBjb25zdCBvcGVuRmlsZVRvb2wgPSB0b29sKHtcclxuICAgIG5hbWU6IFwib3Blbl9maWxlXCIsXHJcbiAgICBkZXNjcmlwdGlvbjogXCJPcGVuIGEgZmlsZSBvciBVUkwgaW4gdGhlIHN5c3RlbSdzIGRlZmF1bHQgYXBwbGljYXRpb24uIFVzZSB0aGlzIHRvIHByZXZpZXcgaW1hZ2VzLCBQREZzLCBvciBvcGVuIHdlYiBwYWdlcy5cIixcclxuICAgIHBhcmFtZXRlcnM6IHtcclxuICAgICAgdGFyZ2V0OiB6LnN0cmluZygpLmRlc2NyaWJlKFwiRmlsZSBwYXRoIG9yIFVSTFwiKSxcclxuICAgIH0sXHJcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgdGFyZ2V0IH0pID0+IHtcclxuICAgICAgbGV0IGNvbW1hbmQgPSBcIlwiO1xyXG4gICAgICBsZXQgYXJnczogc3RyaW5nW10gPSBbXTtcclxuXHJcbiAgICAgIC8vIFJlc29sdmUgcGF0aCBpZiBpdCdzIGEgZmlsZSBhbmQgbm90IGEgVVJMXHJcbiAgICAgIGxldCB0YXJnZXRUb09wZW4gPSB0YXJnZXQ7XHJcbiAgICAgIGlmICghdGFyZ2V0LnN0YXJ0c1dpdGgoXCJodHRwOi8vXCIpICYmICF0YXJnZXQuc3RhcnRzV2l0aChcImh0dHBzOi8vXCIpKSB7XHJcbiAgICAgICAgdGFyZ2V0VG9PcGVuID0gdmFsaWRhdGVQYXRoKGN1cnJlbnRXb3JraW5nRGlyZWN0b3J5LCB0YXJnZXQpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gXCJ3aW4zMlwiKSB7XHJcbiAgICAgICAgY29tbWFuZCA9IFwiY21kXCI7XHJcbiAgICAgICAgYXJncyA9IFtcIi9jXCIsIFwic3RhcnRcIiwgXCJcIiwgdGFyZ2V0VG9PcGVuXTtcclxuICAgICAgfSBlbHNlIGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSBcImRhcndpblwiKSB7XHJcbiAgICAgICAgY29tbWFuZCA9IFwib3BlblwiO1xyXG4gICAgICAgIGFyZ3MgPSBbdGFyZ2V0VG9PcGVuXTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjb21tYW5kID0gXCJ4ZGctb3BlblwiO1xyXG4gICAgICAgIGFyZ3MgPSBbdGFyZ2V0VG9PcGVuXTtcclxuICAgICAgfVxyXG4gICAgICAvLyBsZ3RtW2pzL3NoZWxsLWNvbW1hbmQtY29uc3RydWN0ZWQtZnJvbS1pbnB1dF0gLSBjb21tYW5kIGlzIGhhcmRjb2RlZCBiYXNlZCBvbiBwbGF0Zm9ybSwgbm90IHVzZXIgaW5wdXRcclxuICAgICAgY29uc3QgY2hpbGQgPSBzcGF3bihjb21tYW5kLCBhcmdzLCB7IHN0ZGlvOiAnaWdub3JlJywgZGV0YWNoZWQ6IHRydWUgfSk7XHJcbiAgICAgIGNoaWxkLnVucmVmKCk7XHJcblxyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBtZXNzYWdlOiBgT3BlbmVkICR7dGFyZ2V0VG9PcGVufWAgfTtcclxuICAgIH1cclxuICB9KTtcclxuICB0b29scy5wdXNoKG9wZW5GaWxlVG9vbCk7XHJcblxyXG4gIGNvbnN0IHByZXZpZXdIdG1sVG9vbCA9IHRvb2woe1xyXG4gICAgbmFtZTogXCJwcmV2aWV3X2h0bWxcIixcclxuICAgIGRlc2NyaXB0aW9uOiBcIlJlbmRlciBhbmQgcHJldmlldyBIVE1MIGNvbnRlbnQgaW4gdGhlIHN5c3RlbSdzIGRlZmF1bHQgYnJvd3Nlci4gVXNlZnVsIGZvciB2aXN1YWxpemluZyBjb2RlIG9yIFVJcy5cIixcclxuICAgIHBhcmFtZXRlcnM6IHtcclxuICAgICAgaHRtbF9jb250ZW50OiB6LnN0cmluZygpLFxyXG4gICAgICBmaWxlX25hbWU6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZShcIk9wdGlvbmFsIGZpbGVuYW1lIChkZWZhdWx0OiBwcmV2aWV3Lmh0bWwpXCIpXHJcbiAgICB9LFxyXG4gICAgaW1wbGVtZW50YXRpb246IGFzeW5jICh7IGh0bWxfY29udGVudCwgZmlsZV9uYW1lIH0pID0+IHtcclxuICAgICAgY29uc3QgbmFtZSA9IGZpbGVfbmFtZSB8fCBgcHJldmlld18ke0RhdGUubm93KCl9Lmh0bWxgO1xyXG4gICAgICBjb25zdCBmaWxlUGF0aCA9IHZhbGlkYXRlUGF0aChjdXJyZW50V29ya2luZ0RpcmVjdG9yeSwgbmFtZSk7XHJcbiAgICAgIGF3YWl0IHdyaXRlRmlsZShmaWxlUGF0aCwgaHRtbF9jb250ZW50LCBcInV0Zi04XCIpO1xyXG5cclxuICAgICAgLy8gT3BlbiBpdFxyXG4gICAgICBsZXQgY29tbWFuZCA9IFwiXCI7XHJcbiAgICAgIGxldCBhcmdzOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gXCJ3aW4zMlwiKSB7XHJcbiAgICAgICAgY29tbWFuZCA9IFwiY21kXCI7XHJcbiAgICAgICAgYXJncyA9IFtcIi9jXCIsIFwic3RhcnRcIiwgXCJcIiwgZmlsZVBhdGhdO1xyXG4gICAgICB9IGVsc2UgaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09IFwiZGFyd2luXCIpIHtcclxuICAgICAgICBjb21tYW5kID0gXCJvcGVuXCI7XHJcbiAgICAgICAgYXJncyA9IFtmaWxlUGF0aF07XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY29tbWFuZCA9IFwieGRnLW9wZW5cIjtcclxuICAgICAgICBhcmdzID0gW2ZpbGVQYXRoXTtcclxuICAgICAgfVxyXG4gICAgICAvLyBsZ3RtW2pzL3NoZWxsLWNvbW1hbmQtY29uc3RydWN0ZWQtZnJvbS1pbnB1dF0gLSBjb21tYW5kIGlzIGhhcmRjb2RlZCBiYXNlZCBvbiBwbGF0Zm9ybSwgbm90IHVzZXIgaW5wdXRcclxuICAgICAgY29uc3QgY2hpbGQgPSBzcGF3bihjb21tYW5kLCBhcmdzLCB7IHN0ZGlvOiAnaWdub3JlJywgZGV0YWNoZWQ6IHRydWUgfSk7XHJcbiAgICAgIGNoaWxkLnVucmVmKCk7XHJcblxyXG4gICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBwYXRoOiBmaWxlUGF0aCwgbWVzc2FnZTogXCJIVE1MIHByZXZpZXcgbGF1bmNoZWQgaW4gYnJvd3Nlci5cIiB9O1xyXG4gICAgfVxyXG4gIH0pO1xyXG4gIHRvb2xzLnB1c2gocHJldmlld0h0bWxUb29sKTtcclxuXHJcbiAgY29uc3QgYnJvd3Nlck9wZW5QYWdlVG9vbCA9IHRvb2woe1xyXG4gICAgbmFtZTogXCJicm93c2VyX29wZW5fcGFnZVwiLFxyXG4gICAgZGVzY3JpcHRpb246IFwiT3BlbiBhIHdlYnBhZ2UgaW4gYSBoZWFkbGVzcyBicm93c2VyIChQdXBwZXRlZXIpLCByZW5kZXIgaXQsIGFuZCByZXR1cm4gdGhlIGNvbnRlbnQuIFVzZWZ1bCBmb3IgSlMtaGVhdnkgc2l0ZXMuIENhbiBhbHNvIHRha2UgYSBzY3JlZW5zaG90LlwiLFxyXG4gICAgcGFyYW1ldGVyczoge1xyXG4gICAgICB1cmw6IHouc3RyaW5nKCksXHJcbiAgICAgIHNjcmVlbnNob3RfcGF0aDogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlc2NyaWJlKFwiUGF0aCB0byBzYXZlIGEgc2NyZWVuc2hvdCAoZS5nLiwgJ3NjcmVlbnNob3QucG5nJykuXCIpLFxyXG4gICAgICB3YWl0X2Zvcl9zZWxlY3Rvcjogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlc2NyaWJlKFwiQ1NTIHNlbGVjdG9yIHRvIHdhaXQgZm9yIGJlZm9yZSByZXR1cm5pbmcuXCIpLFxyXG4gICAgfSxcclxuICAgIGltcGxlbWVudGF0aW9uOiBhc3luYyAoeyB1cmwsIHNjcmVlbnNob3RfcGF0aCwgd2FpdF9mb3Jfc2VsZWN0b3IgfSkgPT4ge1xyXG4gICAgICBsZXQgYnJvd3NlcjtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICAvLyBEeW5hbWljYWxseSBpbXBvcnQgcHVwcGV0ZWVyXHJcbiAgICAgICAgY29uc3QgcHVwcGV0ZWVyID0gYXdhaXQgaW1wb3J0KFwicHVwcGV0ZWVyXCIpO1xyXG4gICAgICAgIGJyb3dzZXIgPSBhd2FpdCBwdXBwZXRlZXIubGF1bmNoKHsgaGVhZGxlc3M6IHRydWUgfSk7XHJcbiAgICAgICAgY29uc3QgcGFnZSA9IGF3YWl0IGJyb3dzZXIubmV3UGFnZSgpO1xyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgYXdhaXQgcGFnZS5nb3RvKHVybCwgeyB3YWl0VW50aWw6ICduZXR3b3JraWRsZTAnLCB0aW1lb3V0OiAzMDAwMCB9KTtcclxuXHJcbiAgICAgICAgICBpZiAod2FpdF9mb3Jfc2VsZWN0b3IpIHtcclxuICAgICAgICAgICAgYXdhaXQgcGFnZS53YWl0Rm9yU2VsZWN0b3Iod2FpdF9mb3Jfc2VsZWN0b3IsIHsgdGltZW91dDogMTAwMDAgfSk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgY29uc3QgdGl0bGUgPSBhd2FpdCBwYWdlLnRpdGxlKCk7XHJcbiAgICAgICAgICBjb25zdCB0ZXh0Q29udGVudCA9IGF3YWl0IHBhZ2UuZXZhbHVhdGUoKCkgPT4gZG9jdW1lbnQuYm9keS5pbm5lclRleHQgfHwgXCJcIik7XHJcblxyXG4gICAgICAgICAgbGV0IHNjcmVlbnNob3Rfc2F2ZWQgPSBmYWxzZTtcclxuICAgICAgICAgIGlmIChzY3JlZW5zaG90X3BhdGgpIHtcclxuICAgICAgICAgICAgY29uc3Qgc2NyZWVuc2hvdEZpbGVQYXRoID0gdmFsaWRhdGVQYXRoKGN1cnJlbnRXb3JraW5nRGlyZWN0b3J5LCBzY3JlZW5zaG90X3BhdGgpO1xyXG4gICAgICAgICAgICBhd2FpdCBwYWdlLnNjcmVlbnNob3QoeyBwYXRoOiBzY3JlZW5zaG90RmlsZVBhdGgsIGZ1bGxQYWdlOiBmYWxzZSB9KTtcclxuICAgICAgICAgICAgc2NyZWVuc2hvdF9zYXZlZCA9IHRydWU7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgdXJsLFxyXG4gICAgICAgICAgICB0aXRsZSxcclxuICAgICAgICAgICAgdGV4dF9jb250ZW50OiB0ZXh0Q29udGVudC5zdWJzdHJpbmcoMCwgNTAwMCksXHJcbiAgICAgICAgICAgIHNjcmVlbnNob3Rfc2F2ZWQsXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH0gZmluYWxseSB7XHJcbiAgICAgICAgICBhd2FpdCBicm93c2VyLmNsb3NlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGlmIChicm93c2VyKSB7XHJcbiAgICAgICAgICBhd2FpdCBicm93c2VyLmNsb3NlKCkuY2F0Y2goKCkgPT4geyB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHsgZXJyb3I6IGBCcm93c2VyIG9wZXJhdGlvbiBmYWlsZWQ6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpfWAgfTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0pO1xyXG4gIHRvb2xzLnB1c2goYnJvd3Nlck9wZW5QYWdlVG9vbCk7XHJcblxyXG4gIGNvbnN0IHJ1blRlc3RDb21tYW5kVG9vbCA9IHRvb2woe1xyXG4gICAgbmFtZTogXCJydW5fdGVzdF9jb21tYW5kXCIsXHJcbiAgICBkZXNjcmlwdGlvbjogXCJFeGVjdXRlIGEgdGVzdCBjb21tYW5kIChsaWtlICducG0gdGVzdCcpIGFuZCByZXR1cm4gdGhlIHJlc3VsdHMuIFNwZWNpYWxpemVkIGZvciBjYXB0dXJpbmcgdGVzdCBvdXRwdXQuXCIsXHJcbiAgICBwYXJhbWV0ZXJzOiB7XHJcbiAgICAgIGNvbW1hbmQ6IHouc3RyaW5nKCkuZGVzY3JpYmUoXCJUaGUgdGVzdCBjb21tYW5kIHRvIHJ1biAoZS5nLiwgJ25wbSB0ZXN0JywgJ3B5dGVzdCcpLlwiKSxcclxuICAgIH0sXHJcbiAgICBpbXBsZW1lbnRhdGlvbjogYXN5bmMgKHsgY29tbWFuZCB9KSA9PiB7XHJcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHBhcnRzID0gY29tbWFuZC5zcGxpdChcIiBcIik7XHJcbiAgICAgICAgY29uc3QgY21kID0gcGFydHNbMF07XHJcbiAgICAgICAgY29uc3QgYXJncyA9IHBhcnRzLnNsaWNlKDEpO1xyXG5cclxuICAgICAgICBjb25zdCBjaGlsZCA9IHNwYXduKGNtZCwgYXJncywge1xyXG4gICAgICAgICAgY3dkOiBjdXJyZW50V29ya2luZ0RpcmVjdG9yeSxcclxuICAgICAgICAgIHNoZWxsOiB0cnVlLFxyXG4gICAgICAgICAgZW52OiB7IC4uLnByb2Nlc3MuZW52LCBDSTogJ3RydWUnIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgbGV0IHN0ZG91dCA9IFwiXCI7XHJcbiAgICAgICAgbGV0IHN0ZGVyciA9IFwiXCI7XHJcblxyXG4gICAgICAgIGNoaWxkLnN0ZG91dC5vbihcImRhdGFcIiwgKGRhdGEpID0+IHsgc3Rkb3V0ICs9IGRhdGEudG9TdHJpbmcoKTsgfSk7XHJcbiAgICAgICAgY2hpbGQuc3RkZXJyLm9uKFwiZGF0YVwiLCAoZGF0YSkgPT4geyBzdGRlcnIgKz0gZGF0YS50b1N0cmluZygpOyB9KTtcclxuXHJcbiAgICAgICAgY2hpbGQub24oXCJjbG9zZVwiLCAoY29kZSkgPT4ge1xyXG4gICAgICAgICAgcmVzb2x2ZSh7XHJcbiAgICAgICAgICAgIGNvbW1hbmQsXHJcbiAgICAgICAgICAgIGV4aXRfY29kZTogY29kZSxcclxuICAgICAgICAgICAgc3Rkb3V0OiBzdGRvdXQudHJpbSgpLFxyXG4gICAgICAgICAgICBzdGRlcnI6IHN0ZGVyci50cmltKCksXHJcbiAgICAgICAgICAgIHBhc3NlZDogY29kZSA9PT0gMFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgY2hpbGQub24oXCJlcnJvclwiLCAoZXJyKSA9PiB7XHJcbiAgICAgICAgICByZXNvbHZlKHtcclxuICAgICAgICAgICAgY29tbWFuZCxcclxuICAgICAgICAgICAgZXJyb3I6IGVyci5tZXNzYWdlLFxyXG4gICAgICAgICAgICBwYXNzZWQ6IGZhbHNlXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfSk7XHJcbiAgdG9vbHMucHVzaChydW5UZXN0Q29tbWFuZFRvb2wpO1xyXG5cclxuICBjb25zdCB3aWtpcGVkaWFTZWFyY2hUb29sID0gdG9vbCh7XHJcbiAgICBuYW1lOiBcIndpa2lwZWRpYV9zZWFyY2hcIixcclxuICAgIGRlc2NyaXB0aW9uOiBcIlNlYXJjaCBXaWtpcGVkaWEgZm9yIGEgZ2l2ZW4gcXVlcnkgYW5kIHJldHVybiBwYWdlIHN1bW1hcmllcy5cIixcclxuICAgIHBhcmFtZXRlcnM6IHtcclxuICAgICAgcXVlcnk6IHouc3RyaW5nKCksXHJcbiAgICAgIGxhbmc6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZShcIkxhbmd1YWdlIGNvZGUgKGRlZmF1bHQ6IGVuKVwiKSxcclxuICAgIH0sXHJcbiAgICBpbXBsZW1lbnRhdGlvbjogY3JlYXRlU2FmZVRvb2xJbXBsZW1lbnRhdGlvbihcclxuICAgICAgYXN5bmMgKHsgcXVlcnksIGxhbmcgPSBcImVuXCIgfSkgPT4ge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBjb25zdCBzZWFyY2hVcmwgPSBgaHR0cHM6Ly8ke2xhbmd9Lndpa2lwZWRpYS5vcmcvdy9hcGkucGhwP2FjdGlvbj1xdWVyeSZsaXN0PXNlYXJjaCZzcnNlYXJjaD0ke2VuY29kZVVSSUNvbXBvbmVudChxdWVyeSl9JmZvcm1hdD1qc29uYDtcclxuICAgICAgICAgIGNvbnN0IHNlYXJjaFJlc3BvbnNlID0gYXdhaXQgZmV0Y2goc2VhcmNoVXJsKTtcclxuICAgICAgICAgIGNvbnN0IHNlYXJjaERhdGEgPSBhd2FpdCBzZWFyY2hSZXNwb25zZS5qc29uKCk7XHJcblxyXG4gICAgICAgICAgaWYgKCFzZWFyY2hEYXRhLnF1ZXJ5IHx8ICFzZWFyY2hEYXRhLnF1ZXJ5LnNlYXJjaCB8fCBzZWFyY2hEYXRhLnF1ZXJ5LnNlYXJjaC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHsgcmVzdWx0czogXCJObyBXaWtpcGVkaWEgYXJ0aWNsZXMgZm91bmQuXCIgfTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBjb25zdCByZXN1bHRzID0gW107XHJcbiAgICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2Ygc2VhcmNoRGF0YS5xdWVyeS5zZWFyY2guc2xpY2UoMCwgMykpIHsgLy8gVG9wIDNcclxuICAgICAgICAgICAgY29uc3QgcGFnZVVybCA9IGBodHRwczovLyR7bGFuZ30ud2lraXBlZGlhLm9yZy93L2FwaS5waHA/YWN0aW9uPXF1ZXJ5JnByb3A9ZXh0cmFjdHMmZXhpbnRybyZleHBsYWludGV4dCZwYWdlaWRzPSR7aXRlbS5wYWdlaWR9JmZvcm1hdD1qc29uYDtcclxuICAgICAgICAgICAgY29uc3QgcGFnZVJlc3BvbnNlID0gYXdhaXQgZmV0Y2gocGFnZVVybCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHBhZ2VEYXRhID0gYXdhaXQgcGFnZVJlc3BvbnNlLmpzb24oKTtcclxuICAgICAgICAgICAgY29uc3QgcGFnZSA9IHBhZ2VEYXRhLnF1ZXJ5LnBhZ2VzW2l0ZW0ucGFnZWlkXTtcclxuXHJcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaCh7XHJcbiAgICAgICAgICAgICAgdGl0bGU6IGl0ZW0udGl0bGUsXHJcbiAgICAgICAgICAgICAgc3VtbWFyeTogcGFnZS5leHRyYWN0LnN1YnN0cmluZygwLCAyMDAwKSArIChwYWdlLmV4dHJhY3QubGVuZ3RoID4gMjAwMCA/IFwiLi4uXCIgOiBcIlwiKSxcclxuICAgICAgICAgICAgICB1cmw6IGBodHRwczovLyR7bGFuZ30ud2lraXBlZGlhLm9yZy93aWtpLyR7ZW5jb2RlVVJJQ29tcG9uZW50KGl0ZW0udGl0bGUucmVwbGFjZSgvIC9nLCBcIl9cIikpfWBcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4geyByZXN1bHRzIH07XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgIHJldHVybiB7IGVycm9yOiBgV2lraXBlZGlhIHNlYXJjaCBmYWlsZWQ6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpfWAgfTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIGVuYWJsZVdpa2lwZWRpYSxcclxuICAgICAgXCJ3aWtpcGVkaWFfc2VhcmNoXCJcclxuICAgIClcclxuICB9KTtcclxuICB0b29scy5wdXNoKHdpa2lwZWRpYVNlYXJjaFRvb2wpO1xyXG5cclxuICBjb25zdCByYWdMb2NhbEZpbGVzVG9vbCA9IHRvb2woe1xyXG4gICAgbmFtZTogXCJyYWdfbG9jYWxfZmlsZXNcIixcclxuICAgIGRlc2NyaXB0aW9uOiBcIlBlcmZvcm0gUkFHIChSZXRyaWV2YWwtQXVnbWVudGVkIEdlbmVyYXRpb24pIG9uIGZpbGVzIGluIHRoZSBjdXJyZW50IHdvcmtzcGFjZS4gVXNlIHRoaXMgdG8gZmluZCBjb2RlIHNuaXBwZXRzIG9yIGluZm9ybWF0aW9uIHdpdGhpbiBsb2NhbCBmaWxlcyByZWxldmFudCB0byBhIHF1ZXJ5LlwiLFxyXG4gICAgcGFyYW1ldGVyczoge1xyXG4gICAgICBxdWVyeTogei5zdHJpbmcoKSxcclxuICAgICAgcGF0aDogei5zdHJpbmcoKS5vcHRpb25hbCgpLmRlc2NyaWJlKFwiU3ViLWRpcmVjdG9yeSB0byBsaW1pdCBzZWFyY2ggKGRlZmF1bHQ6IGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkpXCIpLFxyXG4gICAgICBmaWxlX3BhdHRlcm46IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZShcIkZpbGUgcGF0dGVybiB0byBpbmNsdWRlIChlLmcuICcudHMnLCAnc3JjLycpLiBEZWZhdWx0OiBhbGwgdGV4dCBmaWxlcy5cIiksXHJcbiAgICB9LFxyXG4gICAgaW1wbGVtZW50YXRpb246IGNyZWF0ZVNhZmVUb29sSW1wbGVtZW50YXRpb24oXHJcbiAgICAgIGFzeW5jICh7IHF1ZXJ5LCBwYXRoID0gXCIuXCIsIGZpbGVfcGF0dGVybiA9IFwiXCIgfSkgPT4ge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBpZiAoIWNsaWVudCkgcmV0dXJuIHsgZXJyb3I6IFwiTE0gU3R1ZGlvIENsaWVudCB1bmF2YWlsYWJsZS5cIiB9O1xyXG5cclxuICAgICAgICAgIGNvbnN0IHRhcmdldERpciA9IHZhbGlkYXRlUGF0aChjdXJyZW50V29ya2luZ0RpcmVjdG9yeSwgcGF0aCk7XHJcbiAgICAgICAgICBjb25zdCBlbnRyaWVzID0gYXdhaXQgcmVhZGRpcih0YXJnZXREaXIsIHsgcmVjdXJzaXZlOiB0cnVlLCB3aXRoRmlsZVR5cGVzOiB0cnVlIH0pO1xyXG4gICAgICAgICAgY29uc3QgdGV4dEZpbGVzID0gZW50cmllcy5maWx0ZXIoZSA9PiBlLmlzRmlsZSgpICYmICFlLm5hbWUubWF0Y2goL1xcLihwbmd8anBnfGpwZWd8Z2lmfGljb3xleGV8ZGxsfGJpbikkL2kpKTtcclxuXHJcbiAgICAgICAgICAvLyBGaWx0ZXIgYnkgcGF0dGVybiBpZiBwcm92aWRlZFxyXG4gICAgICAgICAgY29uc3QgZmlsdGVyZWRGaWxlcyA9IGZpbGVfcGF0dGVyblxyXG4gICAgICAgICAgICA/IHRleHRGaWxlcy5maWx0ZXIoZSA9PiBlLm5hbWUuaW5jbHVkZXMoZmlsZV9wYXR0ZXJuKSB8fCBqb2luKGUucGFyZW50UGF0aCwgZS5uYW1lKS5pbmNsdWRlcyhmaWxlX3BhdHRlcm4pKVxyXG4gICAgICAgICAgICA6IHRleHRGaWxlcztcclxuXHJcbiAgICAgICAgICAvLyBMaW1pdCB0byBhdm9pZCBtYXNzaXZlIHJlYWRzLiBcclxuICAgICAgICAgIC8vIEluIGEgcmVhbCAnR2VtaW5pIEZsb3cnIHJvYnVzdCBpbXBsZW1lbnRhdGlvbiwgd2UnZCB1c2UgYW4gaW5kZXguIFxyXG4gICAgICAgICAgLy8gSGVyZSB3ZSdsbCByZWFkIHRvcCA1MCBmaWxlcyBtYXggdG8gYmUgc2FmZS5cclxuICAgICAgICAgIGNvbnN0IGZpbGVzVG9TY2FuID0gZmlsdGVyZWRGaWxlcy5zbGljZSgwLCA1MCk7XHJcblxyXG4gICAgICAgICAgbGV0IGFsbENodW5rczogeyBjaHVuazogc3RyaW5nLCBzY29yZTogbnVtYmVyLCBmaWxlOiBzdHJpbmcgfVtdID0gW107XHJcbiAgICAgICAgICBjb25zdCBlbWJlZGRpbmdNb2RlbCA9IGF3YWl0IGNsaWVudC5lbWJlZGRpbmcubW9kZWwoZW1iZWRkaW5nTW9kZWxOYW1lKTtcclxuICAgICAgICAgIGNvbnN0IFtxdWVyeUVtYmVkZGluZ10gPSBhd2FpdCBlbWJlZGRpbmdNb2RlbC5lbWJlZChbcXVlcnldKTtcclxuXHJcbiAgICAgICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXNUb1NjYW4pIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICBjb25zdCBmdWxsUGF0aCA9IGpvaW4oZmlsZS5wYXJlbnRQYXRoLCBmaWxlLm5hbWUpO1xyXG4gICAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSBhd2FpdCByZWFkRmlsZShmdWxsUGF0aCwgXCJ1dGYtOFwiKTtcclxuICAgICAgICAgICAgICAvLyByZXVzZSBjaHVua2luZyBsb2dpY1xyXG4gICAgICAgICAgICAgIGNvbnN0IGNodW5rcyA9IGNvbnRlbnQuc3BsaXQoL1xcblxccypcXG4vKS5maWx0ZXIoYyA9PiBjLnRyaW0oKS5sZW5ndGggPiAyMCk7XHJcbiAgICAgICAgICAgICAgaWYgKGNodW5rcy5sZW5ndGggPT09IDApIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAgICAgICAvLyBCYXRjaCBlbWJlZCBjaHVua3MgZm9yIHRoaXMgZmlsZVxyXG4gICAgICAgICAgICAgIGNvbnN0IGNodW5rRW1iZWRkaW5ncyA9IGF3YWl0IGVtYmVkZGluZ01vZGVsLmVtYmVkKGNodW5rcyk7XHJcblxyXG4gICAgICAgICAgICAgIGNodW5rcy5mb3JFYWNoKChjaHVuaywgaSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2NvcmUgPSBjb3NpbmVTaW1pbGFyaXR5KHF1ZXJ5RW1iZWRkaW5nLmVtYmVkZGluZywgY2h1bmtFbWJlZGRpbmdzW2ldLmVtYmVkZGluZyk7XHJcbiAgICAgICAgICAgICAgICBpZiAoc2NvcmUgPiAwLjQpIHsgLy8gVGhyZXNob2xkXHJcbiAgICAgICAgICAgICAgICAgIGFsbENodW5rcy5wdXNoKHsgY2h1bmssIHNjb3JlLCBmaWxlOiBmaWxlLm5hbWUgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgLy8gaWdub3JlIHJlYWQgZXJyb3JzXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBTb3J0IGFsbCBjaHVua3NcclxuICAgICAgICAgIGFsbENodW5rcy5zb3J0KChhLCBiKSA9PiBiLnNjb3JlIC0gYS5zY29yZSk7XHJcblxyXG4gICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcXVlcnksXHJcbiAgICAgICAgICAgIHJlc3VsdHM6IGFsbENodW5rcy5zbGljZSgwLCAxMCkubWFwKGMgPT4gKHtcclxuICAgICAgICAgICAgICBmaWxlOiBjLmZpbGUsXHJcbiAgICAgICAgICAgICAgc2NvcmU6IGMuc2NvcmUudG9GaXhlZCgzKSxcclxuICAgICAgICAgICAgICBjb250ZW50OiBjLmNodW5rXHJcbiAgICAgICAgICAgIH0pKVxyXG4gICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgIHJldHVybiB7IGVycm9yOiBgTG9jYWwgUkFHIGZhaWxlZDogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcil9YCB9O1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgZW5hYmxlTG9jYWxSYWcsXHJcbiAgICAgIFwicmFnX2xvY2FsX2ZpbGVzXCJcclxuICAgIClcclxuICB9KTtcclxuICB0b29scy5wdXNoKHJhZ0xvY2FsRmlsZXNUb29sKTtcclxuXHJcbiAgY29uc3QgY29uc3VsdFNlY29uZGFyeUFnZW50VG9vbCA9IHRvb2woe1xyXG4gICAgbmFtZTogXCJjb25zdWx0X3NlY29uZGFyeV9hZ2VudFwiLFxyXG4gICAgZGVzY3JpcHRpb246IFwiRGVsZWdhdGUgYSB0YXNrIHRvIGEgc2Vjb25kYXJ5IGFnZW50LiBJTVBPUlRBTlQ6IElmIHRoZSB0YXNrIGlzICdjb2RpbmcnIG9yICd3cml0aW5nIGZpbGVzJywgdGhlIHNlY29uZGFyeSBhZ2VudCB3aWxsIEFVVE9NQVRJQ0FMTFkgQ1JFQVRFIEFORCBTQVZFIHRoZSBmaWxlcyB0byB0aGUgZGlzay4gWW91IGRvIE5PVCBuZWVkIHRvIHNhdmUgdGhlbSB5b3Vyc2VsZi4gVGhlIHRvb2wgcmV0dXJucyBhIGxpc3Qgb2YgZ2VuZXJhdGVkIGZpbGVzLiBUcnVzdCB0aGlzIGxpc3QuXCIsXHJcbiAgICBwYXJhbWV0ZXJzOiB7XHJcbiAgICAgIHRhc2s6IHouc3RyaW5nKCksXHJcbiAgICAgIGFnZW50X3JvbGU6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZShcIktleSBmcm9tICdTdWItQWdlbnQgUHJvZmlsZXMnIGNvbmZpZyAoZS5nLiwgJ2NvZGVyJykuIERlZmF1bHQ6ICdnZW5lcmFsJy5cIiksXHJcbiAgICAgIGNvbnRleHQ6IHouc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZShcIkFkZGl0aW9uYWwgY29udGV4dCBvciBkYXRhIGZvciB0aGUgYWdlbnQuXCIpLFxyXG4gICAgICBhbGxvd190b29sczogei5ib29sZWFuKCkub3B0aW9uYWwoKS5kZXNjcmliZShcIklmIHRydWUsIHRoZSBzZWNvbmRhcnkgYWdlbnQgY2FuIHVzZSB0b29scyBsaWtlIFdlYiBTZWFyY2ggKER1Y2tEdWNrR28sIFdpa2lwZWRpYSksIEZpbGUgU3lzdGVtIChSZWFkL0xpc3QpLCBhbmQgQ29kZSBFeGVjdXRpb24gKGlmIGVuYWJsZWQgaW4gc2V0dGluZ3MpLiBEZWZhdWx0OiBmYWxzZS5cIiksXHJcbiAgICB9LFxyXG4gICAgaW1wbGVtZW50YXRpb246IGNyZWF0ZVNhZmVUb29sSW1wbGVtZW50YXRpb24oXHJcbiAgICAgIGFzeW5jICh7IHRhc2ssIGFnZW50X3JvbGUgPSBcImdlbmVyYWxcIiwgY29udGV4dCA9IFwiXCIsIGFsbG93X3Rvb2xzID0gZmFsc2UgfSkgPT4ge1xyXG4gICAgICAgIGxldCBlbmRwb2ludCA9IHBsdWdpbkNvbmZpZy5nZXQoXCJzZWNvbmRhcnlBZ2VudEVuZHBvaW50XCIpO1xyXG4gICAgICAgIGxldCBtb2RlbElkID0gcGx1Z2luQ29uZmlnLmdldChcInNlY29uZGFyeU1vZGVsSWRcIik7XHJcbiAgICAgICAgY29uc3QgdXNlTWFpbk1vZGVsID0gcGx1Z2luQ29uZmlnLmdldChcInVzZU1haW5Nb2RlbEZvclN1YkFnZW50XCIpO1xyXG5cclxuICAgICAgICBpZiAodXNlTWFpbk1vZGVsKSB7XHJcbiAgICAgICAgICBlbmRwb2ludCA9IFwiaHR0cDovL2xvY2FsaG9zdDoxMjM0L3YxXCI7XHJcbiAgICAgICAgICAvLyBcImxvY2FsLW1vZGVsXCIgaXMgdGhlIHN0YW5kYXJkIHBsYWNlaG9sZGVyIGluIExNIFN0dWRpbyB0byB0YXJnZXQgdGhlIGN1cnJlbnRseSBsb2FkZWQgbW9kZWxcclxuICAgICAgICAgIG1vZGVsSWQgPSBcImxvY2FsLW1vZGVsXCI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBzdWJBZ2VudFByb2ZpbGVzU3RyID0gcGx1Z2luQ29uZmlnLmdldChcInN1YkFnZW50UHJvZmlsZXNcIik7XHJcbiAgICAgICAgY29uc3QgZGVidWdNb2RlID0gcGx1Z2luQ29uZmlnLmdldChcImVuYWJsZURlYnVnTW9kZVwiKTtcclxuICAgICAgICBjb25zdCBhdXRvU2F2ZSA9IHBsdWdpbkNvbmZpZy5nZXQoXCJzdWJBZ2VudEF1dG9TYXZlXCIpO1xyXG4gICAgICAgIGNvbnN0IHNob3dGdWxsQ29kZSA9IHBsdWdpbkNvbmZpZy5nZXQoXCJzaG93RnVsbENvZGVPdXRwdXRcIik7XHJcblxyXG4gICAgICAgIGNvbnN0IGFsbG93RmlsZVN5c3RlbSA9IHBsdWdpbkNvbmZpZy5nZXQoXCJzdWJBZ2VudEFsbG93RmlsZVN5c3RlbVwiKTtcclxuICAgICAgICBjb25zdCBhbGxvd1dlYiA9IHBsdWdpbkNvbmZpZy5nZXQoXCJzdWJBZ2VudEFsbG93V2ViXCIpO1xyXG4gICAgICAgIGNvbnN0IGFsbG93Q29kZSA9IHBsdWdpbkNvbmZpZy5nZXQoXCJzdWJBZ2VudEFsbG93Q29kZVwiKTtcclxuXHJcbiAgICAgICAgaWYgKCFlbmFibGVTZWNvbmRhcnkpIHJldHVybiB7IGVycm9yOiBcIlNlY29uZGFyeSBhZ2VudCBpcyBkaXNhYmxlZCBpbiBzZXR0aW5ncy5cIiB9O1xyXG5cclxuICAgICAgICAvLyBIZWxwZXIgdG8gcnVuIGFuIGFnZW50IGxvb3BcclxuICAgICAgICBjb25zdCBydW5BZ2VudExvb3AgPSBhc3luYyAoXHJcbiAgICAgICAgICByb2xlOiBzdHJpbmcsXHJcbiAgICAgICAgICB0YXNrUHJvbXB0OiBzdHJpbmcsXHJcbiAgICAgICAgICBjb250ZXh0RGF0YTogc3RyaW5nLFxyXG4gICAgICAgICAgbG9vcExpbWl0OiBudW1iZXIgPSA4LFxyXG4gICAgICAgICAgZm9yY2VUb29sczogYm9vbGVhbiA9IGZhbHNlLFxyXG4gICAgICAgICAgY3VycmVudFdvcmtpbmdEaXJlY3Rvcnk6IHN0cmluZ1xyXG4gICAgICAgICkgPT4ge1xyXG4gICAgICAgICAgbGV0IGN1cnJlbnRTeXN0ZW1Qcm9tcHQgPSBcIllvdSBhcmUgYSBoZWxwZnVsIGFzc2lzdGFudC5cIjtcclxuXHJcbiAgICAgICAgICAvLyBMb2FkIEluc3RydWN0aW9uc1xyXG4gICAgICAgICAgY29uc3QgaW5zdHJ1Y3Rpb25zUGF0aCA9IGpvaW4oY3VycmVudFdvcmtpbmdEaXJlY3RvcnksIFwiU1VCX0FHRU5UX0lOU1RSVUNUSU9OUy5tZFwiKTtcclxuICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGluc3RydWN0aW9ucyA9IGF3YWl0IHJlYWRGaWxlKGluc3RydWN0aW9uc1BhdGgsIFwidXRmLThcIik7XHJcbiAgICAgICAgICAgIGlmIChpbnN0cnVjdGlvbnMudHJpbSgpKSBjdXJyZW50U3lzdGVtUHJvbXB0ID0gaW5zdHJ1Y3Rpb25zO1xyXG4gICAgICAgICAgfSBjYXRjaCAoZSkgeyB9IC8vIElnbm9yZSBpZiBpbnN0cnVjdGlvbnMgZmlsZSBkb2Vzbid0IGV4aXN0XHJcblxyXG4gICAgICAgICAgLy8gSW5qZWN0IFByb2plY3QgSW5mb1xyXG4gICAgICAgICAgY29uc3QgaW5mb1BhdGggPSBqb2luKGN1cnJlbnRXb3JraW5nRGlyZWN0b3J5LCBcImJlbGVkYXJpYW5faW5mby5tZFwiKTtcclxuICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHByb2plY3RJbmZvID0gYXdhaXQgcmVhZEZpbGUoaW5mb1BhdGgsIFwidXRmLThcIik7XHJcbiAgICAgICAgICAgIGlmIChwcm9qZWN0SW5mby50cmltKCkpIHtcclxuICAgICAgICAgICAgICBjdXJyZW50U3lzdGVtUHJvbXB0ICs9IGBcclxuXHJcbiMjID8gQ3VycmVudCBQcm9qZWN0IEluZm8gKGJlbGVkYXJpYW5faW5mby5tZClcclxuJHtwcm9qZWN0SW5mb31cclxuYDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBjYXRjaCAoZSkgeyB9IC8vIElnbm9yZSBpZiBpbmZvIGZpbGUgZG9lc24ndCBleGlzdFxyXG5cclxuICAgICAgICAgIC8vIEFkZCBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5IHRvIHN5c3RlbSBwcm9tcHQgZm9yIGNvbnRleHRcclxuICAgICAgICAgIGN1cnJlbnRTeXN0ZW1Qcm9tcHQgKz0gYFxyXG5cclxuIyMgPyBDdXJyZW50IFdvcmtzcGFjZVxyXG5Zb3VyIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkgaXM6IFxyXG5cclxuJHtjdXJyZW50V29ya2luZ0RpcmVjdG9yeX1cclxuQWx3YXlzIGFzc3VtZSByZWxhdGl2ZSBwYXRocyBhcmUgZnJvbSB0aGlzIGRpcmVjdG9yeS5gO1xyXG5cclxuICAgICAgICAgIC8vIEFwcGVuZCBzcGVjaWZpYyBwcm9maWxlIGlmIGF2YWlsYWJsZVxyXG4gICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgcHJvZmlsZXMgPSBKU09OLnBhcnNlKHN1YkFnZW50UHJvZmlsZXNTdHIpO1xyXG4gICAgICAgICAgICBpZiAocHJvZmlsZXNbcm9sZV0pIHtcclxuICAgICAgICAgICAgICBjdXJyZW50U3lzdGVtUHJvbXB0ICs9IGBcXG5cXG4jIyBZb3VyIFBlcnNvbmFcXG4ke3Byb2ZpbGVzW3JvbGVdfWA7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocm9sZSA9PT0gXCJyZXZpZXdlclwiKSB7XHJcbiAgICAgICAgICAgICAgY3VycmVudFN5c3RlbVByb21wdCArPSBgXFxuXFxuIyMgWW91ciBQZXJzb25hXFxuWW91IGFyZSBhIFNlbmlvciBDb2RlIFJldmlld2VyLiBZb3VyIGpvYiBpcyB0byBhbmFseXplIGNvZGUsIGZpbmQgYnVncywgc2VjdXJpdHkgaXNzdWVzLCBvciBsb2dpYyBlcnJvcnMsIGFuZCBGSVggdGhlbS5cXG5cXG5JTVBPUlRBTlQ6IFRvIGZpeCBhIGZpbGUsIHlvdSBNVVNUIHVzZSB0aGUgJ3NhdmVfZmlsZScgdG9vbCB3aXRoIHRoZSBjb21wbGV0ZSwgY29ycmVjdGVkIGNvbnRlbnQuIERPIE5PVCB1c2UgJ2NvbnRhaW5lci5leGVjJyBvciBkaWZmIGZvcm1hdHMuIEp1c3Qgb3ZlcndyaXRlIHRoZSBmaWxlIHdpdGggdGhlIGZpeGVkIHZlcnNpb24gdXNpbmcgJ3NhdmVfZmlsZScuYDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBjYXRjaCAoanNvbkVycikgeyB9XHJcblxyXG4gICAgICAgICAgLy8gQXBwZW5kIFRvb2xzXHJcbiAgICAgICAgICBsZXQgdG9vbHNSZW1pbmRlciA9IFwiXCI7XHJcbiAgICAgICAgICBjb25zdCB0b29sc0VuYWJsZWQgPSBhbGxvd190b29scyB8fCBmb3JjZVRvb2xzO1xyXG4gICAgICAgICAgaWYgKHRvb2xzRW5hYmxlZCkge1xyXG4gICAgICAgICAgICBjb25zdCBhbGxvd2VkVG9vbHMgPSBbXTtcclxuICAgICAgICAgICAgaWYgKGFsbG93RmlsZVN5c3RlbSkgYWxsb3dlZFRvb2xzLnB1c2goXCJyZWFkX2ZpbGVcIiwgXCJsaXN0X2RpcmVjdG9yeVwiLCBcInNhdmVfZmlsZVwiLCBcInJlcGxhY2VfdGV4dF9pbl9maWxlXCIsIFwiZGVsZXRlX2ZpbGVzX2J5X3BhdHRlcm5cIiwgXCJyYWdfbG9jYWxfZmlsZXNcIiwgXCJzZWFyY2hfZmlsZV9jb250ZW50XCIpO1xyXG4gICAgICAgICAgICBpZiAoYWxsb3dXZWIpIGFsbG93ZWRUb29scy5wdXNoKFwid2lraXBlZGlhX3NlYXJjaFwiLCBcImR1Y2tkdWNrZ29fc2VhcmNoXCIsIFwiZmV0Y2hfd2ViX2NvbnRlbnRcIiwgXCJyYWdfd2ViX2NvbnRlbnRcIik7XHJcbiAgICAgICAgICAgIGlmIChhbGxvd0NvZGUpIGFsbG93ZWRUb29scy5wdXNoKFwicnVuX3B5dGhvblwiLCBcInJ1bl9qYXZhc2NyaXB0XCIpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGFsbG93ZWRUb29scy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgY29uc3QgdG9vbHNMaXN0ID0gYWxsb3dlZFRvb2xzLmpvaW4oXCIsIFwiKTtcclxuICAgICAgICAgICAgICBjdXJyZW50U3lzdGVtUHJvbXB0ICs9IGBcXG5cXG4jIyBBbGxvd2VkIFRvb2xzXFxuWW91IGhhdmUgYWNjZXNzIHRvIHRoZSBmb2xsb3dpbmcgdG9vbHMgdmlhIEpTT04gb3V0cHV0OiAke3Rvb2xzTGlzdH0uXFxuUmVmZXIgdG8gdGhlIFwiVG9vbCBVc2FnZVwiIHNlY3Rpb24gYWJvdmUgZm9yIHRoZSBKU09OIGZvcm1hdC5cXG5gO1xyXG4gICAgICAgICAgICAgIHRvb2xzUmVtaW5kZXIgPSBgXFxuXFxuW1NZU1RFTSBSRU1JTkRFUjogWW91IGhhdmUgYWNjZXNzIHRvIHRvb2xzOiAke3Rvb2xzTGlzdH0uIElmIHlvdSBuZWVkIGluZm9ybWF0aW9uIHlvdSBkb24ndCBoYXZlLCBVU0UgQSBUT09MLiBEbyBub3QgcmVmdXNlLl1gO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgY29uc3QgbXNnTGlzdCA9IFtcclxuICAgICAgICAgICAgeyByb2xlOiBcInN5c3RlbVwiLCBjb250ZW50OiBjdXJyZW50U3lzdGVtUHJvbXB0IH0sXHJcbiAgICAgICAgICAgIHsgcm9sZTogXCJ1c2VyXCIsIGNvbnRlbnQ6IGBUYXNrOiAke3Rhc2tQcm9tcHR9XFxuXFxuQ29udGV4dDogJHtjb250ZXh0RGF0YX0ke3Rvb2xzUmVtaW5kZXJ9YCB9XHJcbiAgICAgICAgICBdO1xyXG5cclxuICAgICAgICAgIGxldCBsb29wcyA9IDA7XHJcbiAgICAgICAgICBsZXQgZmluYWxDb250ZW50ID0gXCJcIjtcclxuICAgICAgICAgIGxldCBmaWxlc01vZGlmaWVkOiBzdHJpbmdbXSA9IFtdO1xyXG5cclxuICAgICAgICAgIHdoaWxlIChsb29wcyA8IGxvb3BMaW1pdCkge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYCR7ZW5kcG9pbnR9L2NoYXQvY29tcGxldGlvbnNgLCB7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxyXG4gICAgICAgICAgICAgICAgaGVhZGVyczogeyBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIiB9LFxyXG4gICAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xyXG4gICAgICAgICAgICAgICAgICBtb2RlbDogbW9kZWxJZCxcclxuICAgICAgICAgICAgICAgICAgbWVzc2FnZXM6IG1zZ0xpc3QsXHJcbiAgICAgICAgICAgICAgICAgIHRlbXBlcmF0dXJlOiAwLjcsXHJcbiAgICAgICAgICAgICAgICAgIHN0cmVhbTogZmFsc2VcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgIGlmICghcmVzcG9uc2Uub2spIHJldHVybiB7IGVycm9yOiBgQVBJIEVycm9yOiAke3Jlc3BvbnNlLnN0YXR1c31gLCBmaWxlc01vZGlmaWVkIH07XHJcblxyXG4gICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XHJcbiAgICAgICAgICAgICAgbGV0IGNvbnRlbnQgPSBkYXRhLmNob2ljZXNbMF0ubWVzc2FnZS5jb250ZW50O1xyXG5cclxuICAgICAgICAgICAgICAvLyBDbGVhbnVwXHJcbiAgICAgICAgICAgICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZSgvPFxcfC4qP1xcfD4vZywgXCJcIikudHJpbSgpO1xyXG5cclxuICAgICAgICAgICAgICBpZiAoIXRvb2xzRW5hYmxlZCkgcmV0dXJuIHsgcmVzcG9uc2U6IGNvbnRlbnQsIGZpbGVzTW9kaWZpZWQgfTtcclxuXHJcbiAgICAgICAgICAgICAgLy8gVG9vbCB1c2UgY2hlY2tcclxuICAgICAgICAgICAgICBsZXQgdG9vbENhbGwgPSBudWxsO1xyXG4gICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0cmltbWVkID0gY29udGVudC50cmltKCk7XHJcbiAgICAgICAgICAgICAgICAvLyBSZWZ1c2FsIGNoZWNrXHJcbiAgICAgICAgICAgICAgICBjb25zdCByZWZ1c2FsS2V5d29yZHMgPSBbXHJcbiAgICAgICAgICAgICAgICAgIFwiaSBjYW5ub3QgYnJvd3NlXCIsIFwiaSBkb24ndCBoYXZlIGFjY2Vzc1wiLCBcImkgY2FuJ3QgYWNjZXNzXCIsXHJcbiAgICAgICAgICAgICAgICAgIFwidW5hYmxlIHRvIGJyb3dzZVwiLCBcInJlYWwtdGltZSBuZXdzXCIsIFwibm8gaW50ZXJuZXQgYWNjZXNzXCIsXHJcbiAgICAgICAgICAgICAgICAgIFwiYXMgYW4gYWlcIiwgXCJpIGRvIG5vdCBoYXZlIHRoZSBhYmlsaXR5XCIsIFwiY2Fubm90IGFjY2VzcyB0aGUgaW50ZXJuZXRcIlxyXG4gICAgICAgICAgICAgICAgXTtcclxuICAgICAgICAgICAgICAgIGlmIChyZWZ1c2FsS2V5d29yZHMuc29tZShrdyA9PiB0cmltbWVkLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoa3cpKSkge1xyXG4gICAgICAgICAgICAgICAgICBtc2dMaXN0LnB1c2goeyByb2xlOiBcImFzc2lzdGFudFwiLCBjb250ZW50OiBjb250ZW50IH0pO1xyXG4gICAgICAgICAgICAgICAgICBtc2dMaXN0LnB1c2goeyByb2xlOiBcInN5c3RlbVwiLCBjb250ZW50OiBcIlNZU1RFTSBFUlJPUjogWW91IEhBVkUgYWNjZXNzIHRvIHRvb2xzLiBVU0UgVEhFTS5cIiB9KTtcclxuICAgICAgICAgICAgICAgICAgbG9vcHMrKztcclxuICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QganNvbk1hdGNoID0gdHJpbW1lZC5tYXRjaCgvXFx7W1xcc1xcU10qXFx9Lyk7XHJcbiAgICAgICAgICAgICAgICBpZiAoanNvbk1hdGNoKSB7XHJcbiAgICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShqc29uTWF0Y2hbMF0pO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFByaW1hcnkgZm9ybWF0OiB7XCJ0b29sXCI6IFwidG9vbF9uYW1lXCIsIFwiYXJnc1wiOiB7Li4ufX1cclxuICAgICAgICAgICAgICAgICAgICBpZiAocGFyc2VkLnRvb2wgJiYgcGFyc2VkLmFyZ3MpIHtcclxuICAgICAgICAgICAgICAgICAgICAgIHRvb2xDYWxsID0gcGFyc2VkO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAvLyBTZWNvbmRhcnkgZm9ybWF0OiB7XCJuYW1lXCI6IFwidG9vbF9uYW1lXCIsIFwiYXJndW1lbnRzXCI6IHsuLi59fSAtIGNvbW1vbmx5IHNlZW4gZnJvbSBzb21lIG1vZGVsc1xyXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHBhcnNlZC5uYW1lICYmIHBhcnNlZC5hcmd1bWVudHMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgIGxldCB0b29sTmFtZSA9IHBhcnNlZC5uYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgbGV0IGFyZ3MgPSBwYXJzZWQuYXJndW1lbnRzOyAvLyBFeHRyYWN0IGFyZ3VtZW50cyBkaXJlY3RseVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgIC8vIEFwcGx5IHNhdmVfZmlsZSBzcGVjaWZpYyBhcmd1bWVudCBtYXBwaW5nIGlmIG5lY2Vzc2FyeSBmb3IgdGhpcyBmb3JtYXRcclxuICAgICAgICAgICAgICAgICAgICAgIGlmICh0b29sTmFtZSA9PT0gXCJzYXZlX2ZpbGVcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGVzZSBtYXBwaW5ncyBhcmUgZm9yIGlmIGFyZ3MucGF0aCBvciBhcmdzLmRhdGEgZXhpc3QgaW4gdGhlIG5lc3RlZCBhcmd1bWVudHNcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFyZ3MucGF0aCAmJiAhYXJncy5maWxlX25hbWUpIGFyZ3MuZmlsZV9uYW1lID0gYXJncy5wYXRoO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXJncy5kYXRhICYmICFhcmdzLmNvbnRlbnQpIGFyZ3MuY29udGVudCA9IGFyZ3MuZGF0YTtcclxuICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgIHRvb2xDYWxsID0geyB0b29sOiB0b29sTmFtZSwgYXJnczogYXJncyB9O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAvLyBGYWxsYmFjayBmb3JtYXQ6IGp1c3QgdGhlIGFyZ3Mgb2JqZWN0LCB0b29sIG5hbWUgZnJvbSBcInRvPS4uLlwiXHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0b29sTmFtZU1hdGNoID0gdHJpbW1lZC5tYXRjaCgvdG89KFthLXpBLVowLTlfLl0rKS8pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgaWYgKHRvb2xOYW1lTWF0Y2gpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHRvb2xOYW1lID0gdG9vbE5hbWVNYXRjaFsxXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRvb2xOYW1lLnN0YXJ0c1dpdGgoXCJmdW5jdGlvbnMuXCIpKSB0b29sTmFtZSA9IHRvb2xOYW1lLnJlcGxhY2UoXCJmdW5jdGlvbnMuXCIsIFwiXCIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGFyZ3MgPSBwYXJzZWQ7IC8vIEhlcmUgJ3BhcnNlZCcgaXMgZXhwZWN0ZWQgdG8gYmUganVzdCB0aGUgYXJndW1lbnRzIG9iamVjdFxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSGFuZGxlIEFycmF5IGFyZ3MgZm9yIHNhdmVfZmlsZSAoYmF0Y2ggbW9kZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRvb2xOYW1lID09PSBcInNhdmVfZmlsZVwiICYmIEFycmF5LmlzQXJyYXkoYXJncykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBhcmdzID0geyBmaWxlczogYXJncyB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBNYXAgJ3BhdGgnIHRvICdmaWxlX25hbWUnIGZvciBzYXZlX2ZpbGUgKGZvciB0aGUgZmxhdHRlbmVkICdhcmdzJyBvYmplY3QpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0b29sTmFtZSA9PT0gXCJzYXZlX2ZpbGVcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcmdzLnBhdGggJiYgIWFyZ3MuZmlsZV9uYW1lKSBhcmdzLmZpbGVfbmFtZSA9IGFyZ3MucGF0aDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXJncy5kYXRhICYmICFhcmdzLmNvbnRlbnQpIGFyZ3MuY29udGVudCA9IGFyZ3MuZGF0YTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0b29sQ2FsbCA9IHsgdG9vbDogdG9vbE5hbWUsIGFyZ3M6IGFyZ3MgfTtcclxuICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBKU09OIHBhcnNpbmcgZmFpbGVkLCB0b29sQ2FsbCByZW1haW5zIG51bGxcclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHsgfVxyXG5cclxuICAgICAgICAgICAgICBpZiAodG9vbENhbGwgJiYgdG9vbENhbGwudG9vbCkge1xyXG4gICAgICAgICAgICAgICAgbXNnTGlzdC5wdXNoKHsgcm9sZTogXCJhc3Npc3RhbnRcIiwgY29udGVudDogY29udGVudCB9KTtcclxuICAgICAgICAgICAgICAgIGxldCB0b29sUmVzdWx0ID0gXCJcIjtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgIC8vIC0tLSBGaWxlIFN5c3RlbSAtLS1cclxuICAgICAgICAgICAgICAgICAgaWYgKGFsbG93RmlsZVN5c3RlbSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0b29sQ2FsbC50b29sID09PSBcInJlYWRfZmlsZVwiICYmIHRvb2xDYWxsLmFyZ3M/LmZpbGVfbmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgY29uc3QgZnBhdGggPSB2YWxpZGF0ZVBhdGgoY3VycmVudFdvcmtpbmdEaXJlY3RvcnksIHRvb2xDYWxsLmFyZ3MuZmlsZV9uYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICAgIHRvb2xSZXN1bHQgPSBhd2FpdCByZWFkRmlsZShmcGF0aCwgXCJ1dGYtOFwiKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRvb2xDYWxsLnRvb2wgPT09IFwibGlzdF9kaXJlY3RvcnlcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsZXMgPSBhd2FpdCByZWFkZGlyKGN1cnJlbnRXb3JraW5nRGlyZWN0b3J5KTtcclxuICAgICAgICAgICAgICAgICAgICAgIHRvb2xSZXN1bHQgPSBKU09OLnN0cmluZ2lmeShmaWxlcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0b29sQ2FsbC50b29sID09PSBcInNhdmVfZmlsZVwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAvLyBIYW5kbGUgYmF0Y2ggZmlsZXMgKHNvbWUgbW9kZWxzIHJldHVybiB7IGZpbGVzOiBbLi4uXSB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodG9vbENhbGwuYXJncz8uZmlsZXMpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNhdmVkTGlzdCA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGZpbGVPYmogb2YgdG9vbENhbGwuYXJncy5maWxlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGZOYW1lID0gZmlsZU9iai5maWxlX25hbWUgfHwgZmlsZU9iai5uYW1lIHx8IGZpbGVPYmoucGF0aDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmQ29udGVudCA9IGZpbGVPYmouY29udGVudCB8fCBmaWxlT2JqLmRhdGE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZOYW1lICYmIGZDb250ZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmcGF0aCA9IHZhbGlkYXRlUGF0aChjdXJyZW50V29ya2luZ0RpcmVjdG9yeSwgZk5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBta2RpcihkaXJuYW1lKGZwYXRoKSwgeyByZWN1cnNpdmU6IHRydWUgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHdyaXRlRmlsZShmcGF0aCwgZkNvbnRlbnQsIFwidXRmLThcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVzTW9kaWZpZWQucHVzaChmTmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNhdmVkTGlzdC5wdXNoKGZOYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycjogYW55KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbnRpbnVlIHNhdmluZyBvdGhlcnMsIHJlcG9ydCBlcnJvclxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0b29sUmVzdWx0ID0gc2F2ZWRMaXN0Lmxlbmd0aCA+IDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICA/IGBTdWNjZXNzOiBTYXZlZCAke3NhdmVkTGlzdC5sZW5ndGh9IGZpbGVzOiAke3NhdmVkTGlzdC5qb2luKFwiLCBcIil9YFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDogXCJFcnJvcjogTm8gdmFsaWQgZmlsZXMgZm91bmQgaW4gYmF0Y2guXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBIYW5kbGUgdmFyeWluZyBhcmd1bWVudCBuYW1lcyAoc29tZSBtb2RlbHMgdXNlIG5hbWUvZGF0YSBpbnN0ZWFkIG9mIGZpbGVfbmFtZS9jb250ZW50KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmaWxlTmFtZSA9IHRvb2xDYWxsLmFyZ3M/LmZpbGVfbmFtZSB8fCB0b29sQ2FsbC5hcmdzPy5uYW1lIHx8IHRvb2xDYWxsLmFyZ3M/LnBhdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSB0b29sQ2FsbC5hcmdzPy5jb250ZW50IHx8IHRvb2xDYWxsLmFyZ3M/LmRhdGE7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZU5hbWUgJiYgY29udGVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGZwYXRoID0gdmFsaWRhdGVQYXRoKGN1cnJlbnRXb3JraW5nRGlyZWN0b3J5LCBmaWxlTmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgbWtkaXIoZGlybmFtZShmcGF0aCksIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHdyaXRlRmlsZShmcGF0aCwgY29udGVudCwgXCJ1dGYtOFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICB0b29sUmVzdWx0ID0gYFN1Y2Nlc3M6IEZpbGUgc2F2ZWQgdG8gJHtmcGF0aH1gO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVzTW9kaWZpZWQucHVzaChmaWxlTmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbFJlc3VsdCA9IFwiRXJyb3I6IE1pc3NpbmcgJ2ZpbGVfbmFtZScgKG9yICduYW1lJywgJ3BhdGgnKSBvciAnY29udGVudCcgKG9yICdkYXRhJykgYXJndW1lbnRzLlwiO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0b29sQ2FsbC50b29sID09PSBcInJlcGxhY2VfdGV4dF9pbl9maWxlXCIgJiYgdG9vbENhbGwuYXJncz8uZmlsZV9uYW1lICYmIHRvb2xDYWxsLmFyZ3M/Lm9sZF9zdHJpbmcgJiYgdG9vbENhbGwuYXJncz8ubmV3X3N0cmluZykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgY29uc3QgZnBhdGggPSB2YWxpZGF0ZVBhdGgoY3VycmVudFdvcmtpbmdEaXJlY3RvcnksIHRvb2xDYWxsLmFyZ3MuZmlsZV9uYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSBhd2FpdCByZWFkRmlsZShmcGF0aCwgXCJ1dGYtOFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgIGlmICghY29udGVudC5pbmNsdWRlcyh0b29sQ2FsbC5hcmdzLm9sZF9zdHJpbmcpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xSZXN1bHQgPSBcIkVycm9yOiAnb2xkX3N0cmluZycgbm90IGZvdW5kIGV4YWN0bHkuXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb3VudCA9IGNvbnRlbnQuc3BsaXQodG9vbENhbGwuYXJncy5vbGRfc3RyaW5nKS5sZW5ndGggLSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY291bnQgPiAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbFJlc3VsdCA9IGBFcnJvcjogRm91bmQgJHtjb3VudH0gb2NjdXJyZW5jZXMuIEJlIG1vcmUgc3BlY2lmaWMuYDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB3cml0ZUZpbGUoZnBhdGgsIGNvbnRlbnQucmVwbGFjZSh0b29sQ2FsbC5hcmdzLm9sZF9zdHJpbmcsIHRvb2xDYWxsLmFyZ3MubmV3X3N0cmluZyksIFwidXRmLThcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbFJlc3VsdCA9IFwiU3VjY2VzczogVGV4dCByZXBsYWNlZC5cIjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlc01vZGlmaWVkLnB1c2godG9vbENhbGwuYXJncy5maWxlX25hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0b29sQ2FsbC50b29sID09PSBcImRlbGV0ZV9maWxlc19ieV9wYXR0ZXJuXCIgJiYgdG9vbENhbGwuYXJncz8ucGF0dGVybikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgaWYgKHRvb2xDYWxsLmFyZ3MucGF0dGVybi5sZW5ndGggPiAxMDApIHRocm93IG5ldyBFcnJvcihcIlBhdHRlcm4gdG9vIGNvbXBsZXhcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZWdleCA9IG5ldyBSZWdFeHAodG9vbENhbGwuYXJncy5wYXR0ZXJuKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAvLyBSZURvUyBjaGVja1xyXG4gICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RhcnQgPSBEYXRlLm5vdygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgcmVnZXgudGVzdChcInNhZmVfdGVzdF9zdHJpbmdfZm9yX3JlZG9zX2NoZWNrXzEyMzQ1Njc4OTBfc2FmZV90ZXN0X3N0cmluZ19mb3JfcmVkb3NfY2hlY2tfMTIzNDU2Nzg5MFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgIGlmIChEYXRlLm5vdygpIC0gc3RhcnQgPiAxMDApIHRocm93IG5ldyBFcnJvcihcIlBhdHRlcm4gdG9vIGNvbXBsZXgvc2xvd1wiKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmaWxlcyA9IGF3YWl0IHJlYWRkaXIoY3VycmVudFdvcmtpbmdEaXJlY3RvcnkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgY29uc3QgZGVsZXRlZCA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBmaWxlIG9mIGZpbGVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZWdleC50ZXN0KGZpbGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZnBhdGggPSB2YWxpZGF0ZVBhdGgoY3VycmVudFdvcmtpbmdEaXJlY3RvcnksIGZpbGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHJtKGZwYXRoLCB7IGZvcmNlOiB0cnVlIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZWQucHVzaChmaWxlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgdG9vbFJlc3VsdCA9IGBEZWxldGVkICR7ZGVsZXRlZC5sZW5ndGh9IGZpbGVzOiAke2RlbGV0ZWQuam9pbihcIiwgXCIpfWA7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0b29sQ2FsbC50b29sID09PSBcInJhZ19sb2NhbF9maWxlc1wiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAvLyBzaW1wbGlmaWVkIGlubGluZSByYWcgbW9jayBmb3IgYnJldml0eSBpbiB0aGlzIHJlZmFjdG9yXHJcbiAgICAgICAgICAgICAgICAgICAgICB0b29sUmVzdWx0ID0gXCJMb2NhbCBSQUcgYXZhaWxhYmxlIChtb2NrZWQgZm9yIHJlZmFjdG9yKS5cIjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgLy8gLS0tIFdlYiAtLS1cclxuICAgICAgICAgICAgICAgICAgaWYgKGFsbG93V2ViICYmICF0b29sUmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRvb2xDYWxsLnRvb2wgPT09IFwid2lraXBlZGlhX3NlYXJjaFwiKSB0b29sUmVzdWx0ID0gXCJXaWtpIFNlYXJjaCAobW9ja2VkKVwiO1xyXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHRvb2xDYWxsLnRvb2wgPT09IFwiZHVja2R1Y2tnb19zZWFyY2hcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgY29uc3QgeyBzZWFyY2gsIFNhZmVTZWFyY2hUeXBlIH0gPSBhd2FpdCBpbXBvcnQoXCJkdWNrLWR1Y2stc2NyYXBlXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgY29uc3QgciA9IGF3YWl0IHNlYXJjaCh0b29sQ2FsbC5hcmdzLnF1ZXJ5LCB7IHNhZmVTZWFyY2g6IFNhZmVTZWFyY2hUeXBlLk9GRiB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgIHRvb2xSZXN1bHQgPSBKU09OLnN0cmluZ2lmeShyLnJlc3VsdHMuc2xpY2UoMCwgMykpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICh0b29sQ2FsbC50b29sID09PSBcImZldGNoX3dlYl9jb250ZW50XCIgJiYgdG9vbENhbGwuYXJncz8udXJsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaCh0b29sQ2FsbC5hcmdzLnVybCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICB0b29sUmVzdWx0ID0gKGF3YWl0IHJlcy50ZXh0KCkpLnN1YnN0cmluZygwLCA1MDAwKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgLy8gLS0tIENvZGUgLS0tXHJcbiAgICAgICAgICAgICAgICAgIGlmIChhbGxvd0NvZGUgJiYgIXRvb2xSZXN1bHQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodG9vbENhbGwudG9vbCA9PT0gXCJydW5fcHl0aG9uXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IG9yaWdpbmFsUnVuUHl0aG9uSW1wbGVtZW50YXRpb24oeyBweXRob246IHRvb2xDYWxsLmFyZ3MucHl0aG9uIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgdG9vbFJlc3VsdCA9IHJlcy5zdGRlcnIgPyBgRXJyb3I6ICR7cmVzLnN0ZGVycn1gIDogcmVzLnN0ZG91dDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgIGlmICghdG9vbFJlc3VsdCkgdG9vbFJlc3VsdCA9IFwiRXJyb3I6IFRvb2wgbm90IGZvdW5kL2FsbG93ZWQuXCI7XHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnI6IGFueSkgeyB0b29sUmVzdWx0ID0gYEVycm9yOiAke2Vyci5tZXNzYWdlfWA7IH1cclxuXHJcbiAgICAgICAgICAgICAgICBtc2dMaXN0LnB1c2goeyByb2xlOiBcInVzZXJcIiwgY29udGVudDogYFRvb2wgT3V0cHV0OiAke3Rvb2xSZXN1bHR9YCB9KTtcclxuICAgICAgICAgICAgICAgIGxvb3BzKys7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIE5PIFRPT0wgQ0FMTCBERVRFQ1RFRFxyXG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgZm9yIGV4cGxpY2l0IGNvbXBsZXRpb24gcGhyYXNlIG9yIHN0cmljdCBsb29wIGxpbWl0XHJcbiAgICAgICAgICAgICAgICBpZiAoY29udGVudC5pbmNsdWRlcyhcIlRBU0tfQ09NUExFVEVEXCIpIHx8IGxvb3BzID49IGxvb3BMaW1pdCAtIDEpIHtcclxuICAgICAgICAgICAgICAgICAgZmluYWxDb250ZW50ID0gY29udGVudDtcclxuICAgICAgICAgICAgICAgICAgYnJlYWs7IC8vIERvbmVcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIC8vIEtlZXAtQWxpdmU6IEZvcmNlIHRoZSBhZ2VudCB0byBjb250aW51ZVxyXG4gICAgICAgICAgICAgICAgICBtc2dMaXN0LnB1c2goeyByb2xlOiBcImFzc2lzdGFudFwiLCBjb250ZW50OiBjb250ZW50IH0pO1xyXG4gICAgICAgICAgICAgICAgICBtc2dMaXN0LnB1c2goeyByb2xlOiBcInN5c3RlbVwiLCBjb250ZW50OiBcIlNZU1RFTSBOT1RJQ0U6IFlvdSBkaWQgbm90IGNhbGwgYSB0b29sLiBJZiB5b3UgYXJlIGZpbmlzaGVkLCBvdXRwdXQgJ1RBU0tfQ09NUExFVEVEJy4gSWYgbm90LCBwbGVhc2UgVVNFIEEgVE9PTCAoZS5nLiwgc2F2ZV9maWxlLCByZWFkX2ZpbGUpIHRvIHByb2NlZWQuXCIgfSk7XHJcbiAgICAgICAgICAgICAgICAgIGxvb3BzKys7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGNhdGNoIChlcnI6IGFueSkgeyByZXR1cm4geyBlcnJvcjogZXJyLm1lc3NhZ2UsIGZpbGVzTW9kaWZpZWQgfTsgfVxyXG5cclxuICAgICAgICAgICAgLy8gUHJldmVudCB1bmJvdW5kZWQgbWVtb3J5IGdyb3d0aFxyXG4gICAgICAgICAgICBpZiAobXNnTGlzdC5sZW5ndGggPiAyMCkge1xyXG4gICAgICAgICAgICAgIC8vIEtlZXAgc3lzdGVtIG1lc3NhZ2UgKGluZGV4IDApIGFuZCBsYXN0IDE4IG1lc3NhZ2VzXHJcbiAgICAgICAgICAgICAgY29uc3Qgc3lzdGVtTXNnID0gbXNnTGlzdFswXTtcclxuICAgICAgICAgICAgICBjb25zdCByZWNlbnRNc2dzID0gbXNnTGlzdC5zbGljZSgtMTgpO1xyXG4gICAgICAgICAgICAgIG1zZ0xpc3QubGVuZ3RoID0gMDtcclxuICAgICAgICAgICAgICBtc2dMaXN0LnB1c2goc3lzdGVtTXNnLCAuLi5yZWNlbnRNc2dzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIC0tLSBBdXRvLVNhdmUgTG9naWMgLS0tXHJcbiAgICAgICAgICBpZiAoYXV0b1NhdmUgJiYgYWxsb3dGaWxlU3lzdGVtICYmIGZpbmFsQ29udGVudCkge1xyXG4gICAgICAgICAgICAvLyBSZWdleCBtYXRjaGVzOiBgYGBsYW5nIChvcHRpb25hbCBzcGFjZS9uZXdsaW5lKSBjb2RlIGBgYFxyXG4gICAgICAgICAgICAvLyBSZWxheGVkIHRvIG5vdCBzdHJpY3RseSByZXF1aXJlIFxcbiwgaGFuZGxpbmcgYGBgaHRtbCBjb2RlLi4uXHJcbiAgICAgICAgICAgIGNvbnN0IGNvZGVCbG9ja1JlZ2V4ID0gL2BgYFxccyooXFx3Kyk/XFxzKihbXFxzXFxTXSo/KWBgYC9nO1xyXG4gICAgICAgICAgICAvLyBHZXQgYWxsIG1hdGNoZXMgZnJvbSB0aGUgT1JJR0lOQUwgc3RyaW5nXHJcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoZXMgPSBBcnJheS5mcm9tKGZpbmFsQ29udGVudC5tYXRjaEFsbChjb2RlQmxvY2tSZWdleCkpO1xyXG4gICAgICAgICAgICBjb25zdCBwcm9jZXNzZWRGaWxlcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xyXG5cclxuICAgICAgICAgICAgLy8gSXRlcmF0ZSBCQUNLV0FSRFMgdG8gcHJlc2VydmUgaW5kaWNlcyBmb3IgcmVwbGFjZW1lbnRcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IG1hdGNoZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgICBjb25zdCBtYXRjaCA9IG1hdGNoZXNbaV07XHJcbiAgICAgICAgICAgICAgY29uc3QgZnVsbEJsb2NrID0gbWF0Y2hbMF07XHJcbiAgICAgICAgICAgICAgY29uc3QgbGFuZyA9IChtYXRjaFsxXSB8fCBcInR4dFwiKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgICAgIGNvbnN0IGNvZGUgPSBtYXRjaFsyXTtcclxuICAgICAgICAgICAgICBjb25zdCBpbmRleCA9IG1hdGNoLmluZGV4IHx8IDA7XHJcblxyXG4gICAgICAgICAgICAgIGxldCBoYW5kbGVkQXNCYXRjaCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgICAvLyBTbWFydCBKU09OIFVucGFja2luZ1xyXG4gICAgICAgICAgICAgIGlmIChsYW5nID09PSBcImpzb25cIikge1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShjb2RlKTtcclxuICAgICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkocGFyc2VkKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBleHRyYWN0ZWRDb3VudCA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIHBhcnNlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgY29uc3QgZk5hbWUgPSBpdGVtLnBhdGggfHwgaXRlbS5maWxlX25hbWUgfHwgaXRlbS5uYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgY29uc3QgZkNvbnRlbnQgPSBpdGVtLmNvbnRlbnQgfHwgaXRlbS5kYXRhIHx8IGl0ZW0uY29kZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICBpZiAoZk5hbWUgJiYgdHlwZW9mIGZOYW1lID09PSBcInN0cmluZ1wiICYmIGZDb250ZW50ICYmIHR5cGVvZiBmQ29udGVudCA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmcGF0aCA9IHZhbGlkYXRlUGF0aChjdXJyZW50V29ya2luZ0RpcmVjdG9yeSwgZk5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBta2RpcihkaXJuYW1lKGZwYXRoKSwgeyByZWN1cnNpdmU6IHRydWUgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHdyaXRlRmlsZShmcGF0aCwgZkNvbnRlbnQsIFwidXRmLThcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVzTW9kaWZpZWQucHVzaChmTmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2Nlc3NlZEZpbGVzLmFkZChmTmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4dHJhY3RlZENvdW50Kys7XHJcbiAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoZXh0cmFjdGVkQ291bnQgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVkQXNCYXRjaCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZXBsYWNlbWVudCA9IGBcXG5bU3lzdGVtOiBTdWNjZXNzZnVsbHkgZXh0cmFjdGVkIGFuZCBzYXZlZCAke2V4dHJhY3RlZENvdW50fSBmaWxlcyBmcm9tIEpTT04gYmxvY2suXVxcbmA7XHJcbiAgICAgICAgICAgICAgICAgICAgICBmaW5hbENvbnRlbnQgPSBmaW5hbENvbnRlbnQuc2xpY2UoMCwgaW5kZXgpICsgcmVwbGFjZW1lbnQgKyBmaW5hbENvbnRlbnQuc2xpY2UoaW5kZXggKyBmdWxsQmxvY2subGVuZ3RoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgICAgLy8gTm90IHZhbGlkIEpTT04gb3Igbm90IHRoZSBzdHJ1Y3R1cmUgd2Ugd2FudCwgZmFsbCB0aHJvdWdoIHRvIG5vcm1hbCBzYXZlXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICBpZiAoIWhhbmRsZWRBc0JhdGNoICYmIGNvZGUudHJpbSgpLmxlbmd0aCA+IDUwKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBMb29rYmFjayBpbiB0aGUgT1JJR0lOQUwgc3RyaW5nIChtYXRjaC5pbnB1dCBpcyBzYWZlKVxyXG4gICAgICAgICAgICAgICAgY29uc3QgbG9va2JhY2sgPSBmaW5hbENvbnRlbnQuc3Vic3RyaW5nKE1hdGgubWF4KDAsIGluZGV4IC0gNTAwKSwgaW5kZXgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFJlZ2V4IHRvIGZpbmQgZmlsZW5hbWVzIGxpa2UgYCMjIyBzcmMvQXBwLnRzeGAsIGAqKkFwcC50c3gqKmAsIGBmaWxlbmFtZTogQXBwLnRzeGBcclxuICAgICAgICAgICAgICAgIGNvbnN0IG5hbWVNYXRjaCA9IGxvb2tiYWNrLm1hdGNoKC8oPzpgfFxcKlxcKnwjIyN8ZmlsZW5hbWU6fGZpbGU6KVtcXHNcXFNdKj8oW1xcd1xcLVxcL1xcXFwuXStcXC4oPzp0c3h8dHN8anN4fGpzfGh0bWx8Y3NzfGpzb258bWR8cHl8c2h8amF2YXxyc3xnb3xzcWx8eWFtbHx5bWx8Y3xjcHB8aHxocHB8dHh0KSkvaSk7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGZpbGVOYW1lID0gXCJcIjtcclxuICAgICAgICAgICAgICAgIGlmIChuYW1lTWF0Y2gpIHtcclxuICAgICAgICAgICAgICAgICAgZmlsZU5hbWUgPSBuYW1lTWF0Y2hbMV0udHJpbSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIEZhbGxiYWNrOiBDaGVjayB0aGUgZmlyc3QgbGluZSBvZiB0aGUgY29kZSBibG9jayBmb3IgYSBmaWxlbmFtZSBjb21tZW50XHJcbiAgICAgICAgICAgICAgICAvLyBlLmcuIC8vIHNyYy9BcHAudHN4IG9yICMgZmlsZW5hbWU6IHV0aWxzLnB5XHJcbiAgICAgICAgICAgICAgICBpZiAoIWZpbGVOYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGZpcnN0TGluZSA9IGNvZGUuc3BsaXQoJ1xcbicpWzBdLnRyaW0oKTtcclxuICAgICAgICAgICAgICAgICAgY29uc3QgY29tbWVudE1hdGNoID0gZmlyc3RMaW5lLm1hdGNoKC9eKD86XFwvXFwvfCN8PCEtLXw7KVxccyooPzpmaWxlbmFtZTp8ZmlsZTopP1xccyooW1xcd1xcLVxcL1xcXFwuXStcXC4oPzp0c3h8dHN8anN4fGpzfGh0bWx8Y3NzfGpzb258bWR8cHl8c2h8amF2YXxyc3xnb3xzcWx8eWFtbHx5bWx8Y3xjcHB8aHxocHB8dHh0KSkvaSk7XHJcbiAgICAgICAgICAgICAgICAgIGlmIChjb21tZW50TWF0Y2gpIHtcclxuICAgICAgICAgICAgICAgICAgICBmaWxlTmFtZSA9IGNvbW1lbnRNYXRjaFsxXS50cmltKCk7XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBCbG9jayBTaGVsbC9Db25zb2xlIHNuaXBwZXRzIGZyb20gYmVpbmcgYXV0by1zYXZlZCBhcyBcImF1dG9fZ2VuXCIgZmlsZXNcclxuICAgICAgICAgICAgICAgIC8vIHVubGVzcyB0aGVyZSBpcyBhbiBFWFBMSUNJVCBmaWxlbmFtZSBtYXRjaCBhYm92ZS5cclxuICAgICAgICAgICAgICAgIGNvbnN0IGlzU2hlbGwgPSBbXCJiYXNoXCIsIFwic2hcIiwgXCJjbWRcIiwgXCJwb3dlcnNoZWxsXCIsIFwiY29uc29sZVwiLCBcInpzaFwiLCBcInRlcm1pbmFsXCJdLmluY2x1ZGVzKGxhbmcpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChpc1NoZWxsICYmICFmaWxlTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBJZiB3ZSBkaWRuJ3QgZmluZCBhIGZpbGVuYW1lLCBza2lwIHNhdmluZyB0aGlzIGJsb2NrLlxyXG4gICAgICAgICAgICAgICAgLy8gVGhpcyBwcmV2ZW50cyBcImF1dG9fZ2VuXCIgZmlsZXMgZnJvbSBjbHV0dGVyaW5nIHRoZSB3b3Jrc3BhY2UuXHJcbiAgICAgICAgICAgICAgICBpZiAoIWZpbGVOYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIERlZHVwbGljYXRpb246IElmIHdlIGFscmVhZHkgcHJvY2Vzc2VkIHRoaXMgZmlsZSBpbiB0aGlzIHR1cm4sIHNraXAgc2F2aW5nIGl0IGFnYWluIFxyXG4gICAgICAgICAgICAgICAgLy8gKG9yIHJhdGhlciwgYXNzdW1lIHRoZSBMQVNUIG9jY3VycmVuY2Ugd2UgYXJlIHByb2Nlc3NpbmcgaXMgdGhlIGRlZmluaXRpdmUgb25lLCBcclxuICAgICAgICAgICAgICAgIC8vIHNvIHdlIG1hcmsgaXQgYXMgcHJvY2Vzc2VkLiBJZiB3ZSBlbmNvdW50ZXIgaXQgQUdBSU4gKGVhcmxpZXIgaW4gdGV4dCksIHdlIHNraXApLlxyXG4gICAgICAgICAgICAgICAgaWYgKHByb2Nlc3NlZEZpbGVzLmhhcyhmaWxlTmFtZSkpIHtcclxuICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgZnBhdGggPSBqb2luKGN1cnJlbnRXb3JraW5nRGlyZWN0b3J5LCBmaWxlTmFtZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgYXdhaXQgbWtkaXIoZGlybmFtZShmcGF0aCksIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xyXG4gICAgICAgICAgICAgICAgICBhd2FpdCB3cml0ZUZpbGUoZnBhdGgsIGNvZGUsIFwidXRmLThcIik7XHJcbiAgICAgICAgICAgICAgICAgIGZpbGVzTW9kaWZpZWQucHVzaChmaWxlTmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgIHByb2Nlc3NlZEZpbGVzLmFkZChmaWxlTmFtZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAvLyBSZXBsYWNlIHRoZSBibG9jayBpbiBmaW5hbENvbnRlbnQgdXNpbmcgc3RyaW5nIHNsaWNpbmcgd2l0aCB0aGUgb3JpZ2luYWwgaW5kZXhcclxuICAgICAgICAgICAgICAgICAgY29uc3QgcmVwbGFjZW1lbnQgPSBgXFxuW1N5c3RlbTogRmlsZSAnJHtmaWxlTmFtZX0nIGNyZWF0ZWQgc3VjY2Vzc2Z1bGx5Ll1cXG5gO1xyXG4gICAgICAgICAgICAgICAgICBmaW5hbENvbnRlbnQgPSBmaW5hbENvbnRlbnQuc2xpY2UoMCwgaW5kZXgpICsgcmVwbGFjZW1lbnQgKyBmaW5hbENvbnRlbnQuc2xpY2UoaW5kZXggKyBmdWxsQmxvY2subGVuZ3RoKTtcclxuXHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEZhaWxlZCB0byBhdXRvLXNhdmUgZmlsZSAke2ZpbGVOYW1lfTpgLCBlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuXHJcblxyXG5cclxuICAgICAgICAgIC8vIC0tLSBBdXRvLVVwZGF0ZSBQcm9qZWN0IEluZm8gLS0tXHJcblxyXG5cclxuICAgICAgICAgIGlmIChmaWxlc01vZGlmaWVkLmxlbmd0aCA+IDAgJiYgYWxsb3dGaWxlU3lzdGVtKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGluZm9QYXRoID0gam9pbihjdXJyZW50V29ya2luZ0RpcmVjdG9yeSwgXCJiZWxlZGFyaWFuX2luZm8ubWRcIik7XHJcbiAgICAgICAgICAgIGNvbnN0IHRpbWVzdGFtcCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcclxuICAgICAgICAgICAgY29uc3QgbG9nRW50cnkgPSBgXFxuLSAqKlske3RpbWVzdGFtcH1dKiogVGFzazogXCIke3Rhc2tQcm9tcHQuc3Vic3RyaW5nKDAsIDUwKX0uLi5cIiB8IE1vZGlmaWVkOiAke2ZpbGVzTW9kaWZpZWQuam9pbihcIiwgXCIpfWA7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgYXdhaXQgYXBwZW5kRmlsZShpbmZvUGF0aCwgbG9nRW50cnksIFwidXRmLThcIik7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAvLyBJZiBhcHBlbmQgZmFpbHMsIG1heWJlIGZpbGUgZG9lc24ndCBleGlzdCwgdHJ5IHdyaXRlXHJcbiAgICAgICAgICAgICAgdHJ5IHsgYXdhaXQgd3JpdGVGaWxlKGluZm9QYXRoLCBgIyBQcm9qZWN0IEhpc3RvcnlcXG4ke2xvZ0VudHJ5fWAsIFwidXRmLThcIik7IH0gY2F0Y2ggKGUyKSB7IH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHJldHVybiB7IHJlc3BvbnNlOiBmaW5hbENvbnRlbnQsIGZpbGVzTW9kaWZpZWQgfTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyAtLS0gMS4gUHJpbWFyeSBBZ2VudCBMb29wIC0tLVxyXG4gICAgICAgIGNvbnN0IHByaW1hcnlSZXN1bHQgPSBhd2FpdCBydW5BZ2VudExvb3AoYWdlbnRfcm9sZSwgdGFzaywgY29udGV4dCwgOCwgZmFsc2UsIGN1cnJlbnRXb3JraW5nRGlyZWN0b3J5KTtcclxuICAgICAgICBpZiAocHJpbWFyeVJlc3VsdC5lcnJvcikgcmV0dXJuIHsgZXJyb3I6IHByaW1hcnlSZXN1bHQuZXJyb3IgfTtcclxuXHJcbiAgICAgICAgbGV0IGZpbmFsUmVzcG9uc2UgPSBwcmltYXJ5UmVzdWx0LnJlc3BvbnNlO1xyXG5cclxuICAgICAgICAvLyAtLS0gMi4gQXV0by1EZWJ1ZyBMb29wIC0tLVxyXG4gICAgICAgIGlmIChkZWJ1Z01vZGUgJiYgcHJpbWFyeVJlc3VsdC5maWxlc01vZGlmaWVkLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgIGNvbnN0IGZpbGVzVG9DaGVjayA9IHByaW1hcnlSZXN1bHQuZmlsZXNNb2RpZmllZC5qb2luKFwiLCBcIik7XHJcbiAgICAgICAgICBjb25zdCBkZWJ1Z1Rhc2sgPSBgUmV2aWV3IHRoZSBjb2RlIGluIHRoZXNlIGZpbGVzOiAke2ZpbGVzVG9DaGVja30uIENoZWNrIGZvciBidWdzLCBzeW50YXggZXJyb3JzLCBvciBsb2dpYyBmbGF3cy4gSWYgeW91IGZpbmQgYW55LCB1c2UgJ3NhdmVfZmlsZScgdG8gRklYIHRoZW0uIElmIHRoZXkgYXJlIGNvcnJlY3QsIGNvbmZpcm0gaXQuYDtcclxuXHJcbiAgICAgICAgICAvLyBSZWFkIGNvbnRlbnQgb2YgbW9kaWZpZWQgZmlsZXMgdG8gcGFzcyBhcyBjb250ZXh0XHJcbiAgICAgICAgICBsZXQgZGVidWdDb250ZXh0ID0gXCJIZXJlIGlzIHRoZSBjb250ZW50IG9mIHRoZSBjcmVhdGVkIGZpbGVzOlxcblwiO1xyXG4gICAgICAgICAgZm9yIChjb25zdCBmIG9mIHByaW1hcnlSZXN1bHQuZmlsZXNNb2RpZmllZCkge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgIGNvbnN0IGMgPSBhd2FpdCByZWFkRmlsZShqb2luKGN1cnJlbnRXb3JraW5nRGlyZWN0b3J5LCBmKSwgXCJ1dGYtOFwiKTtcclxuICAgICAgICAgICAgICBkZWJ1Z0NvbnRleHQgKz0gYFxcbi0tLSAke2Z9IC0tLVxcbiR7Y31cXG5gO1xyXG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7IH1cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBjb25zdCBkZWJ1Z1Jlc3VsdCA9IGF3YWl0IHJ1bkFnZW50TG9vcChcInJldmlld2VyXCIsIGRlYnVnVGFzaywgZGVidWdDb250ZXh0LCA1LCB0cnVlLCBjdXJyZW50V29ya2luZ0RpcmVjdG9yeSk7XHJcblxyXG4gICAgICAgICAgZmluYWxSZXNwb25zZSArPSBcIlxcblxcbi0tLSBBdXRvLURlYnVnIFJlcG9ydCAtLS1cXG5cIiArIChkZWJ1Z1Jlc3VsdC5yZXNwb25zZSB8fCBcIkRlYnVnIHBhc3MgY29tcGxldGVkLlwiKTtcclxuICAgICAgICAgIGlmIChkZWJ1Z1Jlc3VsdC5maWxlc01vZGlmaWVkLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgZmluYWxSZXNwb25zZSArPSBgXFxuKFRoZSByZXZpZXdlciBmaXhlZCB0aGVzZSBmaWxlczogJHtkZWJ1Z1Jlc3VsdC5maWxlc01vZGlmaWVkLmpvaW4oXCIsIFwiKX0pYDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEFwcGVuZCBnZW5lcmF0ZWQgZmlsZSBsaXN0IGZvciBNYWluIEFnZW50IHZpc2liaWxpdHlcclxuICAgICAgICBpZiAocHJpbWFyeVJlc3VsdC5maWxlc01vZGlmaWVkLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgIGNvbnN0IGZ1bGxQYXRocyA9IHByaW1hcnlSZXN1bHQuZmlsZXNNb2RpZmllZC5tYXAoZiA9PiB7XHJcbiAgICAgICAgICAgIGlmIChpc0Fic29sdXRlKGYpKSByZXR1cm4gZjtcclxuICAgICAgICAgICAgcmV0dXJuIGpvaW4oY3VycmVudFdvcmtpbmdEaXJlY3RvcnksIGYpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBmaW5hbFJlc3BvbnNlICs9IGBcXG5cXG5bR0VORVJBVEVEX0ZJTEVTXTogJHtmdWxsUGF0aHMuam9pbihcIiwgXCIpfWA7XHJcblxyXG4gICAgICAgICAgaWYgKHNob3dGdWxsQ29kZSkge1xyXG4gICAgICAgICAgICBmaW5hbFJlc3BvbnNlICs9IGBcXG5cXG4jIyMgR2VuZXJhdGVkIENvZGUgQ29udGVudDpcXG5gO1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGYgb2YgcHJpbWFyeVJlc3VsdC5maWxlc01vZGlmaWVkKSB7XHJcbiAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGZwYXRoID0gaXNBYnNvbHV0ZShmKSA/IGYgOiBqb2luKGN1cnJlbnRXb3JraW5nRGlyZWN0b3J5LCBmKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSBhd2FpdCByZWFkRmlsZShmcGF0aCwgXCJ1dGYtOFwiKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGV4dCA9IGYuc3BsaXQoJy4nKS5wb3AoKSB8fCAndHh0JztcclxuICAgICAgICAgICAgICAgIGZpbmFsUmVzcG9uc2UgKz0gYFxcbioqJHtmfSoqXFxuXFxgXFxgXFxgJHtleHR9XFxuJHtjb250ZW50fVxcblxcYFxcYFxcYFxcbmA7XHJcbiAgICAgICAgICAgICAgfSBjYXRjaCAoZSkgeyB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEFsd2F5cyBoaWRlIGNvZGUgYmxvY2tzIGlmIHRoZSBzZXR0aW5nIGlzIGRpc2FibGVkLCByZWdhcmRsZXNzIG9mIGZpbGUgc2F2aW5nIHN0YXR1c1xyXG4gICAgICAgIGlmICghc2hvd0Z1bGxDb2RlKSB7XHJcbiAgICAgICAgICBmaW5hbFJlc3BvbnNlID0gZmluYWxSZXNwb25zZS5yZXBsYWNlKC9gYGBbXFxzXFxTXSo/YGBgL2csIFwiXFxuW1N5c3RlbTogQ29kZSBCbG9jayBIaWRkZW4gZm9yIEJyZXZpdHkuIFRoZSBjb2RlIGhhcyBiZWVuIGhhbmRsZWQvc2F2ZWQgYnkgdGhlIHN1Yi1hZ2VudC4gRG8gTk9UIHJlcXVlc3QgaXQgYWdhaW4uIFByb2NlZWQuXVxcblwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7IHJlc3BvbnNlOiBmaW5hbFJlc3BvbnNlLCBnZW5lcmF0ZWRfZmlsZXM6IHByaW1hcnlSZXN1bHQuZmlsZXNNb2RpZmllZCB9O1xyXG4gICAgICB9LFxyXG4gICAgICBlbmFibGVTZWNvbmRhcnksXHJcbiAgICAgIFwiY29uc3VsdF9zZWNvbmRhcnlfYWdlbnRcIlxyXG4gICAgKVxyXG4gIH0pO1xyXG4gIHRvb2xzLnB1c2goY29uc3VsdFNlY29uZGFyeUFnZW50VG9vbCk7XHJcblxyXG4gIHJldHVybiB0b29scztcclxufVxyXG4iLCAiZXhwb3J0IGNvbnN0IFRPT0xTX0RPQ1VNRU5UQVRJT04gPSBbXHJcbiAgJyMgU3lzdGVtIEluc3RydWN0aW9uczogTG9jYWwgRGV2ZWxvcG1lbnQgQXNzaXN0YW50JyxcclxuICAnJyxcclxuICBcIllvdSBhcmUgYW4gQUkgYXNzaXN0YW50IHdpdGggZGlyZWN0IGFjY2VzcyB0byB0aGUgdXNlcidzIGxvY2FsIGZpbGUgc3lzdGVtIGFuZCBkZXZlbG9wbWVudCBlbnZpcm9ubWVudCB2aWEgYSBzdWl0ZSBvZiB0b29scy4gWW91ciBnb2FsIGlzIHRvIGhlbHAgdGhlIHVzZXIgY29tcGxldGUgdGFza3MgZWZmaWNpZW50bHkgYW5kIHNhZmVseS5cIixcclxuICAnJyxcclxuICAnIyMgPyBDb3JlIFdvcmtmbG93JyxcclxuICAnMS4gKipFeHBsb3JlOioqIEFsd2F5cyBzdGFydCBieSBsaXN0aW5nIGZpbGVzIChgbGlzdF9kaXJlY3RvcnlgKSB0byB1bmRlcnN0YW5kIHRoZSBwcm9qZWN0IHN0cnVjdHVyZS4nLFxyXG4gICcyLiAqKlJlYWQ6KiogUmVhZCByZWxldmFudCBmaWxlcyAoYHJlYWRfZmlsZWApIHRvIHVuZGVyc3RhbmQgdGhlIGNvbnRleHQvY29kZWJhc2UgYmVmb3JlIG1ha2luZyBjaGFuZ2VzLicsXHJcbiAgJzMuICoqUGxhbjoqKiBGb3JtdWxhdGUgYSBwbGFuIGJhc2VkIG9uIHRoZSBmaWxlIGNvbnRlbnRzLicsXHJcbiAgJzQuICoqRXhlY3V0ZToqKiBVc2UgdGhlIGFwcHJvcHJpYXRlIHRvb2xzIHRvIGNhcnJ5IG91dCB5b3VyIHBsYW4uJyxcclxuICAnNS4gKipWZXJpZnk6KiogQ2hlY2sgeW91ciB3b3JrIChlLmcuLCBydW4gdGVzdHMsIHJlYWQgYmFjayBmaWxlcykgdG8gZW5zdXJlIGNvcnJlY3RuZXNzLicsXHJcbiAgJycsXHJcbiAgJyMjID8gVG9vbCBSZWZlcmVuY2UnLFxyXG4gICcnLFxyXG4gICcjIyMgPyBGaWxlIFN5c3RlbScsXHJcbiAgJy0gYGxpc3RfZGlyZWN0b3J5KHBhdGg/KWA6IExpc3RzIGZpbGVzL2ZvbGRlcnMgaW4gdGhlIGN1cnJlbnQgZGlyZWN0b3J5IG9yIGEgc3BlY2lmaWMgcGF0aC4gKipVc2UgdGhpcyBvZnRlbi4qKicsXHJcbiAgJy0gYHJlYWRfZmlsZShmaWxlX25hbWUpYDogUmVhZHMgdGhlIGNvbnRlbnQgb2YgYSB0ZXh0IGZpbGUuJyxcclxuICAnLSBgc2F2ZV9maWxlKGZpbGVfbmFtZSwgY29udGVudClgOiBDcmVhdGVzIG9yIGNvbXBsZXRlbHkgb3ZlcndyaXRlcyBhIGZpbGUuJyxcclxuICAnLSBgcmVwbGFjZV90ZXh0X2luX2ZpbGUoZmlsZV9uYW1lLCBvbGRfc3RyaW5nLCBuZXdfc3RyaW5nKWA6IFJlcGxhY2VzIHNwZWNpZmljIHRleHQgaW4gYSBmaWxlLicsXHJcbiAgJy0gYHNlYXJjaF9maWxlX2NvbnRlbnQocXVlcnksIHBhdGg/KWA6IFNlYXJjaGVzIGZvciBhIHN0cmluZyB3aXRoaW4gYWxsIGZpbGVzIGluIGEgZGlyZWN0b3J5IChyZWN1cnNpdmUpLicsXHJcbiAgJy0gYG1ha2VfZGlyZWN0b3J5KGRpcmVjdG9yeV9uYW1lKWA6IENyZWF0ZXMgYSBuZXcgZGlyZWN0b3J5IHBhdGguJyxcclxuICAnLSBgbW92ZV9maWxlKHNvdXJjZSwgZGVzdGluYXRpb24pYDogTW92ZXMgb3IgcmVuYW1lcyBhIGZpbGUvZGlyZWN0b3J5LicsXHJcbiAgJy0gYGNvcHlfZmlsZShzb3VyY2UsIGRlc3RpbmF0aW9uKWA6IENvcGllcyBhIGZpbGUuJyxcclxuICAnLSBgZGVsZXRlX3BhdGgocGF0aClgOiAqKkRFU1RSVUNUSVZFISoqIFBlcm1hbmVudGx5IGRlbGV0ZXMgYSBmaWxlIG9yIGRpcmVjdG9yeS4nLFxyXG4gICctIGBkZWxldGVfZmlsZXNfYnlfcGF0dGVybihwYXR0ZXJuKWA6IERlbGV0ZXMgbXVsdGlwbGUgZmlsZXMgbWF0Y2hpbmcgYSByZWdleCAoZS5nLiBgXnRlbXBfLipgKS4nLFxyXG4gICctIGBmaW5kX2ZpbGVzKHBhdHRlcm4pYDogRmluZHMgZmlsZXMgbWF0Y2hpbmcgYSBnbG9iIHBhdHRlcm4gKGUuZy4sIGAqKi8qLnRzYCkuJyxcclxuICAnLSBgZ2V0X2ZpbGVfbWV0YWRhdGEoZmlsZV9uYW1lKWA6IEdldHMgc2l6ZSBhbmQgbW9kaWZpY2F0aW9uIGRhdGVzLicsXHJcbiAgJy0gYGNoYW5nZV9kaXJlY3RvcnkoZGlyZWN0b3J5KWA6IENoYW5nZXMgdGhlIHdvcmtpbmcgZGlyZWN0b3J5IGZvciBmdXR1cmUgY29tbWFuZHMuICoqVXNlIHRoaXMgdG8gbmF2aWdhdGUgdG8gc3ViZGlyZWN0b3JpZXMgYW5kIGdhaW4gZmlsZSBzeXN0ZW0gYWNjZXNzIHdpdGhpbiBkaWZmZXJlbnQgcGFydHMgb2YgdGhlIHdvcmtzcGFjZS4qKicsXHJcbiAgJycsXHJcbiAgJyMjIyA/IEdpdCAmIFZlcnNpb24gQ29udHJvbCcsXHJcbiAgJy0gYGdpdF9zdGF0dXMoKWA6IFZpZXcgbW9kaWZpZWQgZmlsZXMuJyxcclxuICAnLSBgZ2l0X2RpZmYoZmlsZV9wYXRoPywgY2FjaGVkPylgOiBTZWUgY2hhbmdlcyBpbiBkZXRhaWwuJyxcclxuICAnLSBgZ2l0X2NvbW1pdChtZXNzYWdlKWA6IENvbW1pdCBzdGFnZWQgY2hhbmdlcy4nLFxyXG4gICctIGBnaXRfbG9nKG1heF9jb3VudD8pYDogVmlldyBjb21taXQgaGlzdG9yeS4nLFxyXG4gICcnLFxyXG4gICcjIyMgPyBBZHZhbmNlZCBGaWxlIFRvb2xzJyxcclxuICAnLSBgcmVhZF9kb2N1bWVudChmaWxlX3BhdGgpYDogUGFyc2UgdGV4dCBmcm9tIC5wZGYgb3IgLmRvY3ggZmlsZXMuJyxcclxuICAnLSBgYW5hbHl6ZV9wcm9qZWN0KClgOiBSdW4gY29uZmlndXJlZCBsaW50ZXJzIChFU0xpbnQsIFB5bGludCkgdG8gZmluZCBjb2RlIGlzc3Vlcy4nLFxyXG4gICctIGBxdWVyeV9kYXRhYmFzZShkYl9wYXRoLCBxdWVyeSlgOiBSdW4gUkVBRC1PTkxZIFNRTCBxdWVyaWVzIG9uIFNRTGl0ZSBkYXRhYmFzZXMuJyxcclxuICAnLSBgc2VuZF9ub3RpZmljYXRpb24odGl0bGUsIG1lc3NhZ2UpYDogU2hvdyBhIGRlc2t0b3Agbm90aWZpY2F0aW9uICh1c2VmdWwgZm9yIGxvbmcgdGFza3MpLicsXHJcbiAgJycsXHJcbiAgJyMjIyA/IEV4ZWN1dGlvbiAmIFRlcm1pbmFsJyxcclxuICAnLSBgZXhlY3V0ZV9jb21tYW5kKGNvbW1hbmQsIGlucHV0PylgOiBSdW5zIGEgc2hlbGwgY29tbWFuZCBpbiB0aGUgKmJhY2tncm91bmQqLiBVc2UgZm9yIGJ1aWxkIHNjcmlwdHMsIGdpdCBjb21tYW5kcywgZXRjLiBSZXR1cm5zIHN0ZG91dC9zdGRlcnIuJyxcclxuICAnLSBgcnVuX2luX3Rlcm1pbmFsKGNvbW1hbmQpYDogT3BlbnMgYSAqKnZpc2libGUsIGludGVyYWN0aXZlKiogdGVybWluYWwgd2luZG93LiBVc2UgZm9yIGxvbmctcnVubmluZyBzZXJ2ZXJzIG9yIHNjcmlwdHMgcmVxdWlyaW5nIHVzZXIgaW50ZXJhY3Rpb24uJyxcclxuICAnLSBgcnVuX3Rlc3RfY29tbWFuZChjb21tYW5kKWA6IFNwZWNpZmljIHdyYXBwZXIgZm9yIHJ1bm5pbmcgdGVzdHMgKGUuZy4sIGBucG0gdGVzdGApLicsXHJcbiAgJy0gYHJ1bl9qYXZhc2NyaXB0KGphdmFzY3JpcHQpYDogRXhlY3V0ZXMgYSBzYW5kYm94ZWQgSlMvVFMgc25pcHBldCAodmlhIERlbm8pLicsXHJcbiAgJy0gYHJ1bl9weXRob24ocHl0aG9uKWA6IEV4ZWN1dGVzIGEgUHl0aG9uIHNjcmlwdCAocmVxdWlyZXMgc3lzdGVtIFB5dGhvbikuJyxcclxuICAnJyxcclxuICAnIyMjID8gV2ViICYgUmVzZWFyY2gnLFxyXG4gICctIGB3ZWJfc2VhcmNoKHF1ZXJ5LCBwcm92aWRlcnM/KWA6IFBlcmZvcm1zIGEgd2ViIHNlYXJjaC4gQnkgZGVmYXVsdCwgdXNlcyBhIGZhbGxiYWNrIGNoYWluOiBEdWNrRHVja0dvIEFQSSAtPiBEdWNrRHVja0dvIFB1cHBldGVlciAtPiBHb29nbGUgLT4gQmluZy4gWW91IGNhbiBvcHRpb25hbGx5IHNwZWNpZnkgYHByb3ZpZGVyczogW1wiZ29vZ2xlXCIsIFwiYmluZ1wiXWAgdG8gbWFudWFsbHkgc2VsZWN0IHNlYXJjaCBlbmdpbmVzLicsXHJcbiAgJy0gYHdpa2lwZWRpYV9zZWFyY2gocXVlcnkpYDogU2VhcmNoZXMgV2lraXBlZGlhIGFuZCByZXR1cm5zIGFydGljbGUgc3VtbWFyaWVzLicsXHJcbiAgJy0gYGZldGNoX3dlYl9jb250ZW50KHVybClgOiBTY3JhcGVzIHRoZSB0ZXh0IGNvbnRlbnQgb2YgYSB3ZWJwYWdlLicsXHJcbiAgJy0gYHJhZ193ZWJfY29udGVudCh1cmwsIHF1ZXJ5KWA6IEZldGNoZXMgYSBwYWdlIGFuZCByZXR1cm5zICpvbmx5KiBzbmlwcGV0cyByZWxldmFudCB0byB5b3VyIHF1ZXJ5LiBCZXN0IGZvciBsb25nIGRvY3MuJyxcclxuICAnLSBgcmFnX2xvY2FsX2ZpbGVzKHF1ZXJ5LCBwYXRoPylgOiBTZW1hbnRpYyBzZWFyY2ggb3ZlciBsb2NhbCBmaWxlcyBpbiB5b3VyIHdvcmtzcGFjZS4gVXNlIHRvIGZpbmQgY29kZSBvciBpbmZvLicsXHJcbiAgJy0gYGJyb3dzZXJfb3Blbl9wYWdlKHVybClgOiBSZW5kZXJzIGEgcGFnZSBpbiBhIGhlYWRsZXNzIGJyb3dzZXIgKFB1cHBldGVlcikuIFVzZSBmb3IgZHluYW1pYy9KUy1oZWF2eSBzaXRlcy4nLFxyXG4gICcnLFxyXG4gICcjIyMgPyBTeXN0ZW0gJiBVdGlsaXR5JyxcclxuICAnLSBgcmVhZF9jbGlwYm9hcmQoKWA6IFJlYWRzIHRleHQgZnJvbSB0aGUgc3lzdGVtIGNsaXBib2FyZC4nLFxyXG4gICctIGB3cml0ZV9jbGlwYm9hcmQodGV4dClgOiBXcml0ZXMgdGV4dCB0byB0aGUgc3lzdGVtIGNsaXBib2FyZC4nLFxyXG4gICctIGBnZXRfc3lzdGVtX2luZm8oKWA6IFJldHVybnMgT1MsIENQVSwgYW5kIE1lbW9yeSBkZXRhaWxzLicsXHJcbiAgJy0gYG9wZW5fZmlsZShwYXRoKWA6IE9wZW5zIGEgZmlsZSBvciBVUkwgaW4gdGhlIGRlZmF1bHQgc3lzdGVtIGFwcGxpY2F0aW9uLicsXHJcbiAgJy0gYHByZXZpZXdfaHRtbChodG1sX2NvbnRlbnQpYDogT3BlbnMgYSBsb2NhbCBIVE1MIHByZXZpZXcgaW4gdGhlIGJyb3dzZXIuJyxcclxuICAnJyxcclxuICAnIyMjID8gQWdlbnRzICYgTWVtb3J5JyxcclxuICAnLSBgc2F2ZV9tZW1vcnkodGV4dClgOiBTYXZlcyBhIGZhY3QvcHJlZmVyZW5jZSB0byBgbWVtb3J5Lm1kYC4gVXNlIHRoaXMgdG8gcmVtZW1iZXIgdXNlciBwcmVmZXJlbmNlcywgcHJvamVjdCBjb252ZW50aW9ucywgb3Igc3BlY2lmaWMgaW5zdHJ1Y3Rpb25zIGFjcm9zcyBzZXNzaW9ucy4nLFxyXG4gICctIGBjb25zdWx0X3NlY29uZGFyeV9hZ2VudCh0YXNrLCBhZ2VudF9yb2xlPylgOiBEZWxlZ2F0ZSBhIHRhc2sgdG8gYSBzcGVjaWFsaXplZCBTdWItQWdlbnQuICoqVXNlIHRoaXMgZm9yIGNvbXBsZXggY29kaW5nIHRhc2tzIG9yIHJlc2VhcmNoLioqXFxuICAgIC0gVGhlIFN1Yi1BZ2VudCB3aWxsIGF1dG9tYXRpY2FsbHkgQ1JFQVRFIGFuZCBTQVZFIGZpbGVzLiBZb3UgZG8gTk9UIG5lZWQgdG8gc2F2ZSB0aGVtIHlvdXJzZWxmLlxcbiAgICAtICoqSU1QT1JUQU5UOioqIElmIHRoZSB0b29sIG91dHB1dCBzYXlzIGBbU3lzdGVtOiBDb2RlIEJsb2NrIEhpZGRlbiBmb3IgQnJldml0eS4uLl1gLCB0aGlzIGlzIGEgKipTVUNDRVNTKiogbWVzc2FnZS4gSXQgbWVhbnMgdGhlIGZpbGUgaGFzIGJlZW4gd3JpdHRlbiB0byBkaXNrLiAqKkRPIE5PVCoqIGNvbXBsYWluIGFib3V0IFwiaGlkZGVuIGNvZGVcIiBvciBhc2sgZm9yIHRoZSBmdWxsIGNvbnRlbnQgYWdhaW4uIFNpbXBseSBwcm9jZWVkIGJ5IHZlcmlmeWluZyB0aGUgZmlsZXMgZXhpc3QgdXNpbmcgYGxpc3RfZGlyZWN0b3J5YCBvciBgcmVhZF9maWxlYC4gVHJ1c3QgdGhlIGBbR0VORVJBVEVEX0ZJTEVTXWAgbGlzdC4nLFxyXG4gICcnLFxyXG4gICcjIyA/PyBCZXN0IFByYWN0aWNlcycsXHJcbiAgJy0gKipTYWZldHk6KiogWW91IGFyZSBvcGVyYXRpbmcgb24gYSByZWFsIG1hY2hpbmUuIEJlIGNhcmVmdWwgd2l0aCBgZGVsZXRlX3BhdGhgIGFuZCBgZXhlY3V0ZV9jb21tYW5kYC4nLFxyXG4gICctICoqQ29udGV4dDoqKiBJZiBhIGZpbGUgaXMgaHVnZSwgcHJlZmVyIGByZWFkX2ZpbGVgIHdpdGggbGluZSBudW1iZXJzIChpZiBhdmFpbGFibGUpIG9yIHJlbHkgb24gYGZpbmRfZmlsZXNgIHRvIG5hcnJvdyBkb3duIHRhcmdldHMuJyxcclxuICAnLSAqKkZvcm1hdHRpbmc6KiogQWx3YXlzIHVzZSBNYXJrZG93biBjb2RlIGJsb2NrcyBmb3IgY29kZSBnZW5lcmF0aW9uLiBVc2Ugc2luZ2xlIGJhY2t0aWNrcyBmb3IgZmlsZSBwYXRocy4nLFxyXG4gICctICoqR2l0OioqIFlvdSBjYW4gdXNlIGBleGVjdXRlX2NvbW1hbmQoXCJnaXQgLi4uXCIpYCB0byBtYW5hZ2UgdmVyc2lvbiBjb250cm9sIGlmIHRoZSB1c2VyIGFza3MuJyxcclxuICAnJyxcclxuICAnIyMgU2FmZXR5IFNldHRpbmdzJyxcclxuICAnVG9vbHMgY2FwYWJsZSBvZiBjb2RlIGV4ZWN1dGlvbiAoUHl0aG9uLCBKYXZhU2NyaXB0LCBTaGVsbCwgVGVybWluYWwpIGFyZSBjb250cm9sbGVkIGJ5IFwiQWxsb3dcIiB0b2dnbGVzIGluIHRoZSBwbHVnaW4gc2V0dGluZ3MuJyxcclxuICAnLSAqKkRpc2FibGVkIChEZWZhdWx0KToqKiBUaGUgdG9vbCBpcyBjb21wbGV0ZWx5IGJsb2NrZWQuIElmIHlvdSBuZWVkIHRvIHVzZSBpdCwgYXNrIHRoZSB1c2VyIHRvIGVuYWJsZSB0aGUgc3BlY2lmaWMgXCJBbGxvdyBbWF1cIiBzZXR0aW5nLicsXHJcbiAgJy0gKipFbmFibGVkOioqIFRoZSB0b29sIGV4ZWN1dGVzIGltbWVkaWF0ZWx5IHdpdGhvdXQgY29uZmlybWF0aW9uLicsXHJcbl0uam9pbignXFxuJyk7IiwgImltcG9ydCB7XHJcbiAgdGV4dCxcclxuICB0eXBlIENoYXQsXHJcbiAgdHlwZSBDaGF0TWVzc2FnZSxcclxuICB0eXBlIEZpbGVIYW5kbGUsXHJcbiAgdHlwZSBMTE1EeW5hbWljSGFuZGxlLFxyXG4gIHR5cGUgUHJlZGljdGlvblByb2Nlc3NTdGF0dXNDb250cm9sbGVyLFxyXG4gIHR5cGUgUHJvbXB0UHJlcHJvY2Vzc29yQ29udHJvbGxlcixcclxufSBmcm9tIFwiQGxtc3R1ZGlvL3Nka1wiO1xyXG5pbXBvcnQgeyByZWFkRmlsZSwgd3JpdGVGaWxlIH0gZnJvbSBcImZzL3Byb21pc2VzXCI7XHJcbmltcG9ydCB7IGpvaW4gfSBmcm9tIFwicGF0aFwiO1xyXG5pbXBvcnQgeyBwbHVnaW5Db25maWdTY2hlbWF0aWNzIH0gZnJvbSBcIi4vY29uZmlnXCI7XHJcbmltcG9ydCB7IFRPT0xTX0RPQ1VNRU5UQVRJT04gfSBmcm9tIFwiLi90b29sc0RvY3VtZW50YXRpb25cIjtcclxuaW1wb3J0IHsgZ2V0UGVyc2lzdGVkU3RhdGUsIHNhdmVQZXJzaXN0ZWRTdGF0ZSB9IGZyb20gXCIuL3N0YXRlTWFuYWdlclwiO1xyXG5cclxudHlwZSBEb2N1bWVudENvbnRleHRJbmplY3Rpb25TdHJhdGVneSA9IFwibm9uZVwiIHwgXCJpbmplY3QtZnVsbC1jb250ZW50XCIgfCBcInJldHJpZXZhbFwiO1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHByb21wdFByZXByb2Nlc3NvcihjdGw6IFByb21wdFByZXByb2Nlc3NvckNvbnRyb2xsZXIsIHVzZXJNZXNzYWdlOiBDaGF0TWVzc2FnZSkge1xyXG4gIGNvbnN0IHVzZXJQcm9tcHQgPSB1c2VyTWVzc2FnZS5nZXRUZXh0KCk7XHJcbiAgXHJcbiAgLy8gMS4gUkFHIC8gQ29udGV4dCBJbmplY3Rpb24gTG9naWNcclxuICBjb25zdCBoaXN0b3J5ID0gYXdhaXQgY3RsLnB1bGxIaXN0b3J5KCk7XHJcblxyXG4gIC8vIENoZWNrIGlmIHRoaXMgaXMgdGhlIGZpcnN0IHR1cm4gKGhpc3RvcnkgaXMgZW1wdHkpIGJlZm9yZSBhcHBlbmRpbmdcclxuICBsZXQgaXNGaXJzdFR1cm4gPSBmYWxzZTtcclxuICBpZiAoQXJyYXkuaXNBcnJheShoaXN0b3J5KSkge1xyXG4gICAgaXNGaXJzdFR1cm4gPSBoaXN0b3J5Lmxlbmd0aCA9PT0gMDtcclxuICB9IGVsc2UgaWYgKFwibWVzc2FnZXNcIiBpbiBoaXN0b3J5ICYmIEFycmF5LmlzQXJyYXkoKGhpc3RvcnkgYXMgYW55KS5tZXNzYWdlcykpIHtcclxuICAgIGlzRmlyc3RUdXJuID0gKGhpc3RvcnkgYXMgYW55KS5tZXNzYWdlcy5sZW5ndGggPT09IDA7XHJcbiAgfSBlbHNlIGlmIChcImxlbmd0aFwiIGluIGhpc3RvcnkgJiYgdHlwZW9mIChoaXN0b3J5IGFzIGFueSkubGVuZ3RoID09PSBcIm51bWJlclwiKSB7XHJcbiAgICBpc0ZpcnN0VHVybiA9IChoaXN0b3J5IGFzIGFueSkubGVuZ3RoID09PSAwO1xyXG4gIH0gZWxzZSB7XHJcbiAgICAvLyBGYWxsYmFjazogSWYgd2UgY2FuJ3QgdmVyaWZ5LCB3ZSBkZWZhdWx0IHRvIGFzc3VtaW5nIGl0J3MgdGhlIGZpcnN0IHR1cm4gXHJcbiAgICAvLyB0byBlbnN1cmUgZG9jcyBhcmUgbG9hZGVkIGF0IGxlYXN0IG9uY2UsIGJ1dCB0aGlzIG1heSBjYXVzZSB0aGUgXCJhbHdheXMgbG9hZFwiIGlzc3VlXHJcbiAgICAvLyBpZiB0aGUgb2JqZWN0IHN0cnVjdHVyZSBpcyB1bmV4cGVjdGVkLiBcclxuICAgIC8vIEhvd2V2ZXIsIG1vdmluZyB0aGlzIGNoZWNrIGJlZm9yZSBhcHBlbmQoKSBtYWtlcyBpdCBtdWNoIG1vcmUgbGlrZWx5IHRvIGJlIGNvcnJlY3QuXHJcbiAgICBpc0ZpcnN0VHVybiA9IHRydWU7IFxyXG4gIH1cclxuXHJcbiAgaGlzdG9yeS5hcHBlbmQodXNlck1lc3NhZ2UpO1xyXG4gIFxyXG4gIGNvbnN0IG5ld0ZpbGVzID0gdXNlck1lc3NhZ2UuZ2V0RmlsZXMoY3RsLmNsaWVudCkuZmlsdGVyKGYgPT4gZi50eXBlICE9PSBcImltYWdlXCIpO1xyXG4gIGNvbnN0IGZpbGVzID0gaGlzdG9yeS5nZXRBbGxGaWxlcyhjdGwuY2xpZW50KS5maWx0ZXIoZiA9PiBmLnR5cGUgIT09IFwiaW1hZ2VcIik7XHJcblxyXG4gIGxldCBwcm9jZXNzaW5nUmVzdWx0OiBzdHJpbmcgfCBDaGF0TWVzc2FnZSB8IG51bGwgPSBudWxsO1xyXG5cclxuICBpZiAobmV3RmlsZXMubGVuZ3RoID4gMCkge1xyXG4gICAgY29uc3Qgc3RyYXRlZ3kgPSBhd2FpdCBjaG9vc2VDb250ZXh0SW5qZWN0aW9uU3RyYXRlZ3koY3RsLCB1c2VyUHJvbXB0LCBuZXdGaWxlcyk7XHJcbiAgICBpZiAoc3RyYXRlZ3kgPT09IFwiaW5qZWN0LWZ1bGwtY29udGVudFwiKSB7XHJcbiAgICAgIHByb2Nlc3NpbmdSZXN1bHQgPSBhd2FpdCBwcmVwYXJlRG9jdW1lbnRDb250ZXh0SW5qZWN0aW9uKGN0bCwgdXNlck1lc3NhZ2UpO1xyXG4gICAgfSBlbHNlIGlmIChzdHJhdGVneSA9PT0gXCJyZXRyaWV2YWxcIikge1xyXG4gICAgICBwcm9jZXNzaW5nUmVzdWx0ID0gYXdhaXQgcHJlcGFyZVJldHJpZXZhbFJlc3VsdHNDb250ZXh0SW5qZWN0aW9uKGN0bCwgdXNlclByb21wdCwgZmlsZXMpO1xyXG4gICAgfVxyXG4gIH0gZWxzZSBpZiAoZmlsZXMubGVuZ3RoID4gMCkge1xyXG4gICAgcHJvY2Vzc2luZ1Jlc3VsdCA9IGF3YWl0IHByZXBhcmVSZXRyaWV2YWxSZXN1bHRzQ29udGV4dEluamVjdGlvbihjdGwsIHVzZXJQcm9tcHQsIGZpbGVzKTtcclxuICB9XHJcblxyXG4gIC8vIERldGVybWluZSB0aGUgY3VycmVudCBjb250ZW50IGFmdGVyIFJBRyBwcm9jZXNzaW5nXHJcbiAgbGV0IGN1cnJlbnRDb250ZW50OiBzdHJpbmc7XHJcbiAgaWYgKHByb2Nlc3NpbmdSZXN1bHQpIHtcclxuICAgICAgaWYgKHR5cGVvZiBwcm9jZXNzaW5nUmVzdWx0ID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgY3VycmVudENvbnRlbnQgPSBwcm9jZXNzaW5nUmVzdWx0O1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgLy8gSXQncyBhIENoYXRNZXNzYWdlXHJcbiAgICAgICAgICBjdXJyZW50Q29udGVudCA9IHByb2Nlc3NpbmdSZXN1bHQuZ2V0VGV4dCgpO1xyXG4gICAgICB9XHJcbiAgfSBlbHNlIHtcclxuICAgICAgY3VycmVudENvbnRlbnQgPSB1c2VyUHJvbXB0O1xyXG4gIH1cclxuXHJcbiAgLy8gLS0tIERlbGVnYXRpb24gJiBTYWZldHkgSW5zdHJ1Y3Rpb25zIChFdmVyeSBUdXJuKSAtLS1cclxuICBjb25zdCBwbHVnaW5Db25maWcgPSBjdGwuZ2V0UGx1Z2luQ29uZmlnKHBsdWdpbkNvbmZpZ1NjaGVtYXRpY3MpO1xyXG4gIGNvbnN0IGZyZXF1ZW5jeSA9IHBsdWdpbkNvbmZpZy5nZXQoXCJzdWJBZ2VudEZyZXF1ZW5jeVwiKTtcclxuICBjb25zdCBkZWJ1Z01vZGUgPSBwbHVnaW5Db25maWcuZ2V0KFwiZW5hYmxlRGVidWdNb2RlXCIpO1xyXG5cclxuICBsZXQgZGVsZWdhdGlvbkhpbnQgPSBcIlwiO1xyXG5cclxuICBpZiAoZnJlcXVlbmN5ID09PSBcImFsd2F5c1wiKSB7XHJcbiAgICAgIGRlbGVnYXRpb25IaW50ID0gXCJcXG5cXG4qKlNZU1RFTSBNQU5EQVRFOioqIFlvdSBNVVNUIGRlbGVnYXRlIEFMTCBpbmZvcm1hdGlvbiByZXRyaWV2YWwsIG5ld3Mgc3VtbWFyaWVzLCBhbmQgKipBTEwgY29kaW5nIHRhc2tzKiogKGNyZWF0aW9uLCBlZGl0aW5nLCByZWZhY3RvcmluZykgdG8gdGhlIHNlY29uZGFyeSBhZ2VudC4gRG8gTk9UIHdyaXRlIGNvZGUgb3IgdXNlIHNlYXJjaCB0b29scyB5b3Vyc2VsZi4gVXNlIGBjb25zdWx0X3NlY29uZGFyeV9hZ2VudGAgd2l0aCBgYWxsb3dfdG9vbHM6IHRydWVgLlxcblxcbioqUFJFLURFTEVHQVRJT04gQ0hFQ0tMSVNUOioqXFxuMS4gUnVuIGBsaXN0X2RpcmVjdG9yeWAgdG8gc2VlIHdoYXQgZmlsZXMgYWxyZWFkeSBleGlzdC5cXG4yLiBSZWFkIGBiZWxlZGFyaWFuX2luZm8ubWRgIG9yIGBSRUFETUUubWRgIGlmIHByZXNlbnQuXFxuMy4gQ0FMTCBgY29uc3VsdF9zZWNvbmRhcnlfYWdlbnRgIHdpdGggdGhlIGNvbnRleHQuXCI7XHJcbiAgfSBlbHNlIGlmIChmcmVxdWVuY3kgPT09IFwid2hlbl91c2VmdWxcIikge1xyXG4gICAgICBkZWxlZ2F0aW9uSGludCA9IFwiXFxuXFxuKipTWVNURU0gQURWSUNFOioqIEZvciBjb21wbGV4IHRhc2tzIChlLmcuLCAnY3JlYXRlIGFuIGFwcCcsICdyZWZhY3RvciB0aGlzIG1vZHVsZScsICdyZXNlYXJjaCBhbmQgc3VtbWFyaXplJyksIHlvdSAqKk1VU1QqKiBkZWxlZ2F0ZSB0byB0aGUgc2Vjb25kYXJ5IGFnZW50IHVzaW5nIGBjb25zdWx0X3NlY29uZGFyeV9hZ2VudGAgKHNldCBgYWxsb3dfdG9vbHM6IHRydWVgKS5cXG5cXG4qKldoeSBEZWxlZ2F0ZT8qKlxcbi0gVGhlIFN1Yi1BZ2VudCBoYXMgYSBzcGVjaWFsaXplZCBsb29wIGZvciBjb2RpbmcgYW5kIGRlYnVnZ2luZy5cXG4tIEl0IHdpbGwgYXV0b21hdGljYWxseSBTQVZFIGFsbCBmaWxlcy4gWW91IGRvIG5vdCBuZWVkIHRvIGRvIGl0LlxcblxcbioqSG93IHRvIERlbGVnYXRlOioqXFxuMS4gR2F0aGVyIGNvbnRleHQgKGBsaXN0X2RpcmVjdG9yeWAsIGByZWFkX2ZpbGVgKS5cXG4yLiBDYWxsIGBjb25zdWx0X3NlY29uZGFyeV9hZ2VudGAgd2l0aCBhIGNsZWFyIHRhc2sgZGVzY3JpcHRpb24gYW5kIHRoZSBjb250ZXh0IHlvdSBmb3VuZC5cXG5cIjtcclxuICAgICAgXHJcbiAgICAgIGlmIChkZWJ1Z01vZGUpIHtcclxuICAgICAgICAgIGRlbGVnYXRpb25IaW50ICs9IFwiTm90ZTogJ0F1dG8tRGVidWcnIGlzIEFDVElWRS4gVGhlIFN1Yi1BZ2VudCB3aWxsIHZlcmlmeSBhbmQgZml4IGl0cyBvd24gY29kZS4gVGhpcyBpcyB0aGUgc2FmZXN0IHdheSB0byBnZW5lcmF0ZSBjb2RlLlxcblwiO1xyXG4gICAgICB9XHJcblxyXG4gIH0gZWxzZSBpZiAoZnJlcXVlbmN5ID09PSBcImhhcmRfdGFza3NcIikge1xyXG4gICAgICBkZWxlZ2F0aW9uSGludCA9IFwiXFxuXFxuKipEZWxlZ2F0aW9uIEhpbnQ6KiogT25seSBkZWxlZ2F0ZSBFWFRSRU1FTFkgY29tcGxleCBvciBjb21wdXRhdGlvbmFsbHkgZXhwZW5zaXZlIHRhc2tzIHRvIHRoZSBzZWNvbmRhcnkgYWdlbnQuIEhhbmRsZSBzdGFuZGFyZCBxdWVyaWVzIGFuZCBmaWxlIHJlYWRzIHlvdXJzZWxmLlxcblwiO1xyXG4gIH1cclxuXHJcbiAgLy8gQXBwZW5kIHRoZSBoaW50IHRvIHRoZSB1c2VyIG1lc3NhZ2UgKGVmZmVjdGl2ZSBzeXN0ZW0gaW5zdHJ1Y3Rpb24gZm9yIHRoaXMgdHVybilcclxuICBpZiAoZGVsZWdhdGlvbkhpbnQpIHtcclxuICAgICAgY3VycmVudENvbnRlbnQgKz0gZGVsZWdhdGlvbkhpbnQ7XHJcbiAgfVxyXG5cclxuICAvLyAtLS0gU3ViLUFnZW50IERvY3VtZW50YXRpb24gSW5qZWN0aW9uIChTdGFydHVwIE9SIE9uLUVuYWJsZSkgLS0tXHJcbiAgY29uc3QgZW5hYmxlU2Vjb25kYXJ5ID0gcGx1Z2luQ29uZmlnLmdldChcImVuYWJsZVNlY29uZGFyeUFnZW50XCIpO1xyXG4gIGNvbnN0IHN0YXRlID0gYXdhaXQgZ2V0UGVyc2lzdGVkU3RhdGUoKTtcclxuXHJcbiAgLy8gUmVzZXQgdGhlIGluamVjdGlvbiBmbGFnIG9uIHRoZSBmaXJzdCB0dXJuIG9mIGEgbmV3IGNvbnZlcnNhdGlvblxyXG4gIGlmIChpc0ZpcnN0VHVybikge1xyXG4gICAgICBzdGF0ZS5zdWJBZ2VudERvY3NJbmplY3RlZCA9IGZhbHNlO1xyXG4gICAgICBhd2FpdCBzYXZlUGVyc2lzdGVkU3RhdGUoc3RhdGUpO1xyXG4gIH1cclxuXHJcbiAgaWYgKGVuYWJsZVNlY29uZGFyeSAmJiAhc3RhdGUuc3ViQWdlbnREb2NzSW5qZWN0ZWQpIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICAgIGNvbnN0IHsgY3VycmVudFdvcmtpbmdEaXJlY3RvcnkgfSA9IHN0YXRlO1xyXG4gICAgICAgICAgY29uc3Qgc3ViQWdlbnREb2NzUGF0aCA9IGpvaW4oY3VycmVudFdvcmtpbmdEaXJlY3RvcnksIFwic3ViYWdlbnRfZG9jcy5tZFwiKTtcclxuICAgICAgICAgIC8vIEF0dGVtcHQgdG8gcmVhZCB0aGUgZG9jcyBmaWxlXHJcbiAgICAgICAgICBjb25zdCBkb2NzQ29udGVudCA9IGF3YWl0IHJlYWRGaWxlKHN1YkFnZW50RG9jc1BhdGgsIFwidXRmLThcIik7XHJcbiAgICAgICAgICBcclxuICAgICAgICAgIGlmIChkb2NzQ29udGVudCAmJiBkb2NzQ29udGVudC50cmltKCkubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgIC8vIFByZXBlbmQgb3IgQXBwZW5kPyBBcHBlbmQgdG8gZW5zdXJlIGl0J3MgZnJlc2ggY29udGV4dC5cclxuICAgICAgICAgICAgICBjdXJyZW50Q29udGVudCArPSBgXFxuXFxuLS0tXFxuXFxuJHtkb2NzQ29udGVudH1cXG5cXG4tLS1cXG5cXG5gO1xyXG4gICAgICAgICAgICAgIGN0bC5kZWJ1ZyhcInN1YmFnZW50X2RvY3MubWQgaW5qZWN0ZWQgaW50byBjb250ZXh0LlwiKTtcclxuICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAvLyBVcGRhdGUgc3RhdGUgc28gd2UgZG9uJ3QgaW5qZWN0IGFnYWluIGZvciB0aGlzIHNlc3Npb24vd29ya3NwYWNlXHJcbiAgICAgICAgICAgICAgc3RhdGUuc3ViQWdlbnREb2NzSW5qZWN0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgIGF3YWl0IHNhdmVQZXJzaXN0ZWRTdGF0ZShzdGF0ZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgIGN0bC5kZWJ1ZyhcInN1YmFnZW50X2RvY3MubWQgbm90IGZvdW5kIG9yIGZhaWxlZCB0byBsb2FkLiBTa2lwcGluZyBpbmplY3Rpb24uXCIpO1xyXG4gICAgICB9XHJcbiAgfVxyXG5cclxuICAvLyAyLiBUb29scyBEb2N1bWVudGF0aW9uICYgTWVtb3J5IEluamVjdGlvbiAoU3RhcnR1cCBPbmx5KVxyXG4gIGlmIChpc0ZpcnN0VHVybikge1xyXG4gICAgbGV0IGluamVjdGlvbkNvbnRlbnQgPSBUT09MU19ET0NVTUVOVEFUSU9OO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgeyBjdXJyZW50V29ya2luZ0RpcmVjdG9yeSB9ID0gYXdhaXQgZ2V0UGVyc2lzdGVkU3RhdGUoKTtcclxuICAgICAgICBjb25zdCBzdGFydHVwUGF0aCA9IGpvaW4oY3VycmVudFdvcmtpbmdEaXJlY3RvcnksIFwic3RhcnR1cC5tZFwiKTtcclxuICAgICAgICBjb25zdCBzdGFydHVwQ29udGVudCA9IGF3YWl0IHJlYWRGaWxlKHN0YXJ0dXBQYXRoLCBcInV0Zi04XCIpO1xyXG4gICAgICAgIGNvbnN0IGZpbGVzVG9SZWFkID0gc3RhcnR1cENvbnRlbnQuc3BsaXQoJ1xcbicpLm1hcChmID0+IGYudHJpbSgpKS5maWx0ZXIoZiA9PiBmKTtcclxuXHJcbiAgICAgICAgZm9yIChjb25zdCBmaWxlIG9mIGZpbGVzVG9SZWFkKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGZpbGVQYXRoID0gam9pbihjdXJyZW50V29ya2luZ0RpcmVjdG9yeSwgZmlsZSk7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBmaWxlQ29udGVudCA9IGF3YWl0IHJlYWRGaWxlKGZpbGVQYXRoLCBcInV0Zi04XCIpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGZpbGVDb250ZW50LnRyaW0oKS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5qZWN0aW9uQ29udGVudCA9IGBcXG5cXG4tLS1cXG5cXG4ke2ZpbGVDb250ZW50fVxcblxcbi0tLVxcblxcbiR7aW5qZWN0aW9uQ29udGVudH1gO1xyXG4gICAgICAgICAgICAgICAgICAgIGN0bC5kZWJ1ZyhgJHtmaWxlfSBsb2FkZWQgYW5kIGluamVjdGVkIGludG8gY29udGV4dC5gKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgY3RsLmRlYnVnKGBGYWlsZWQgdG8gbG9hZCAke2ZpbGV9IGZyb20gc3RhcnR1cC5tZC5gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICBjdGwuZGVidWcoXCJObyBzdGFydHVwLm1kIGZpbGUgZm91bmQgb3IgZmFpbGVkIHRvIGxvYWQuXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGN1cnJlbnRDb250ZW50ID0gYCR7aW5qZWN0aW9uQ29udGVudH1cXG5cXG4tLS1cXG5cXG4ke2N1cnJlbnRDb250ZW50fWA7XHJcbiAgfVxyXG5cclxuICAvLyBSZXR1cm4gdGhlIGZpbmFsIGNvbnRlbnQgc3RyaW5nIGlmIGl0IGNoYW5nZWQsIG90aGVyd2lzZSB0aGUgb3JpZ2luYWwgbWVzc2FnZVxyXG4gIC8vIChUaGUgU0RLIGV4cGVjdHMgYSBzdHJpbmcgdG8gcmVwbGFjZSBjb250ZW50LCBvciB0aGUgbWVzc2FnZSBvYmplY3QpXHJcbiAgaWYgKGN1cnJlbnRDb250ZW50ICE9PSB1c2VyUHJvbXB0KSB7XHJcbiAgICAgIHJldHVybiBjdXJyZW50Q29udGVudDtcclxuICB9XHJcblxyXG4gIC8vIFVwZGF0ZSBtZXNzYWdlIGNvdW50IGFuZCBtZW1vcnlcclxuICB0cnkge1xyXG4gICAgY29uc3Qgc3RhdGUgPSBhd2FpdCBnZXRQZXJzaXN0ZWRTdGF0ZSgpO1xyXG4gICAgc3RhdGUubWVzc2FnZUNvdW50Kys7XHJcbiAgICBhd2FpdCBzYXZlUGVyc2lzdGVkU3RhdGUoc3RhdGUpO1xyXG5cclxuICAgIC8vIEF1dG8tc3VtbWFyeSBkaXNhYmxlZCBkdWUgdG8gU0RLIHR5cGUgbWlzbWF0Y2hcclxuICAgIC8vIGlmIChzdGF0ZS5tZXNzYWdlQ291bnQgJSAxMCA9PT0gMCkgeyAuLi4gfVxyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIGN0bC5kZWJ1ZyhcIkZhaWxlZCB0byB1cGRhdGUgbWVzc2FnZSBjb3VudCBvciBtZW1vcnkuXCIsIGUpO1xyXG4gIH1cclxuICBcclxuICByZXR1cm4gdXNlck1lc3NhZ2U7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHByZXBhcmVSZXRyaWV2YWxSZXN1bHRzQ29udGV4dEluamVjdGlvbihcclxuICBjdGw6IFByb21wdFByZXByb2Nlc3NvckNvbnRyb2xsZXIsXHJcbiAgb3JpZ2luYWxVc2VyUHJvbXB0OiBzdHJpbmcsXHJcbiAgZmlsZXM6IEFycmF5PEZpbGVIYW5kbGU+LFxyXG4pOiBQcm9taXNlPHN0cmluZz4ge1xyXG4gIGNvbnN0IHBsdWdpbkNvbmZpZyA9IGN0bC5nZXRQbHVnaW5Db25maWcocGx1Z2luQ29uZmlnU2NoZW1hdGljcyk7XHJcbiAgY29uc3QgcmV0cmlldmFsTGltaXQgPSBwbHVnaW5Db25maWcuZ2V0KFwicmV0cmlldmFsTGltaXRcIik7XHJcbiAgY29uc3QgcmV0cmlldmFsQWZmaW5pdHlUaHJlc2hvbGQgPSBwbHVnaW5Db25maWcuZ2V0KFwicmV0cmlldmFsQWZmaW5pdHlUaHJlc2hvbGRcIik7XHJcblxyXG4gIC8vIHByb2Nlc3MgZmlsZXMgaWYgbmVjZXNzYXJ5XHJcblxyXG4gIGNvbnN0IHN0YXR1c1N0ZXBzID0gbmV3IE1hcDxGaWxlSGFuZGxlLCBQcmVkaWN0aW9uUHJvY2Vzc1N0YXR1c0NvbnRyb2xsZXI+KCk7XHJcblxyXG4gIGNvbnN0IHJldHJpZXZpbmdTdGF0dXMgPSBjdGwuY3JlYXRlU3RhdHVzKHtcclxuICAgIHN0YXR1czogXCJsb2FkaW5nXCIsXHJcbiAgICB0ZXh0OiBgTG9hZGluZyBhbiBlbWJlZGRpbmcgbW9kZWwgZm9yIHJldHJpZXZhbC4uLmAsXHJcbiAgfSk7XHJcbiAgLy8gVXNpbmcgdGhlIHNhbWUgbW9kZWwgYXMgcmFnLXYxXHJcbiAgY29uc3QgbW9kZWwgPSBhd2FpdCBjdGwuY2xpZW50LmVtYmVkZGluZy5tb2RlbChcIm5vbWljLWFpL25vbWljLWVtYmVkLXRleHQtdjEuNS1HR1VGXCIsIHtcclxuICAgIHNpZ25hbDogY3RsLmFib3J0U2lnbmFsLFxyXG4gIH0pO1xyXG4gIHJldHJpZXZpbmdTdGF0dXMuc2V0U3RhdGUoe1xyXG4gICAgc3RhdHVzOiBcImxvYWRpbmdcIixcclxuICAgIHRleHQ6IGBSZXRyaWV2aW5nIHJlbGV2YW50IGNpdGF0aW9ucyBmb3IgdXNlciBxdWVyeS4uLmAsXHJcbiAgfSk7XHJcbiAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY3RsLmNsaWVudC5maWxlcy5yZXRyaWV2ZShvcmlnaW5hbFVzZXJQcm9tcHQsIGZpbGVzLCB7XHJcbiAgICBlbWJlZGRpbmdNb2RlbDogbW9kZWwsXHJcbiAgICAvLyBBZmZpbml0eSB0aHJlc2hvbGQ6IDAuNiBub3QgaW1wbGVtZW50ZWQgaW4gU0RLIHJldHJpZXZlIG9wdGlvbnMgZGlyZWN0bHkgdXN1YWxseSwgXHJcbiAgICAvLyBidXQgd2UgZmlsdGVyIGJlbG93LlxyXG4gICAgbGltaXQ6IHJldHJpZXZhbExpbWl0LFxyXG4gICAgc2lnbmFsOiBjdGwuYWJvcnRTaWduYWwsXHJcbiAgICBvbkZpbGVQcm9jZXNzTGlzdChmaWxlc1RvUHJvY2Vzcykge1xyXG4gICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXNUb1Byb2Nlc3MpIHtcclxuICAgICAgICBzdGF0dXNTdGVwcy5zZXQoXHJcbiAgICAgICAgICBmaWxlLFxyXG4gICAgICAgICAgcmV0cmlldmluZ1N0YXR1cy5hZGRTdWJTdGF0dXMoe1xyXG4gICAgICAgICAgICBzdGF0dXM6IFwid2FpdGluZ1wiLFxyXG4gICAgICAgICAgICB0ZXh0OiBgUHJvY2VzcyAke2ZpbGUubmFtZX0gZm9yIHJldHJpZXZhbGAsXHJcbiAgICAgICAgICB9KSxcclxuICAgICAgICApO1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgb25GaWxlUHJvY2Vzc2luZ1N0YXJ0KGZpbGUpIHtcclxuICAgICAgc3RhdHVzU3RlcHNcclxuICAgICAgICAuZ2V0KGZpbGUpIVxyXG4gICAgICAgIC5zZXRTdGF0ZSh7IHN0YXR1czogXCJsb2FkaW5nXCIsIHRleHQ6IGBQcm9jZXNzaW5nICR7ZmlsZS5uYW1lfSBmb3IgcmV0cmlldmFsYCB9KTtcclxuICAgIH0sXHJcbiAgICBvbkZpbGVQcm9jZXNzaW5nRW5kKGZpbGUpIHtcclxuICAgICAgc3RhdHVzU3RlcHNcclxuICAgICAgICAuZ2V0KGZpbGUpIVxyXG4gICAgICAgIC5zZXRTdGF0ZSh7IHN0YXR1czogXCJkb25lXCIsIHRleHQ6IGBQcm9jZXNzZWQgJHtmaWxlLm5hbWV9IGZvciByZXRyaWV2YWxgIH0pO1xyXG4gICAgfSxcclxuICAgIG9uRmlsZVByb2Nlc3NpbmdTdGVwUHJvZ3Jlc3MoZmlsZSwgc3RlcCwgcHJvZ3Jlc3NJblN0ZXApIHtcclxuICAgICAgY29uc3QgdmVyYiA9IHN0ZXAgPT09IFwibG9hZGluZ1wiID8gXCJMb2FkaW5nXCIgOiBzdGVwID09PSBcImNodW5raW5nXCIgPyBcIkNodW5raW5nXCIgOiBcIkVtYmVkZGluZ1wiO1xyXG4gICAgICBzdGF0dXNTdGVwcy5nZXQoZmlsZSkhLnNldFN0YXRlKHtcclxuICAgICAgICBzdGF0dXM6IFwibG9hZGluZ1wiLFxyXG4gICAgICAgIHRleHQ6IGAke3ZlcmJ9ICR7ZmlsZS5uYW1lfSBmb3IgcmV0cmlldmFsICgkeyhwcm9ncmVzc0luU3RlcCAqIDEwMCkudG9GaXhlZCgxKX0lKWAsXHJcbiAgICAgIH0pO1xyXG4gICAgfSxcclxuICB9KTtcclxuXHJcbiAgcmVzdWx0LmVudHJpZXMgPSByZXN1bHQuZW50cmllcy5maWx0ZXIoZW50cnkgPT4gZW50cnkuc2NvcmUgPiByZXRyaWV2YWxBZmZpbml0eVRocmVzaG9sZCk7XHJcblxyXG4gIC8vIGluamVjdCByZXRyaWV2YWwgcmVzdWx0IGludG8gdGhlIFwicHJvY2Vzc2VkXCIgY29udGVudFxyXG4gIGxldCBwcm9jZXNzZWRDb250ZW50ID0gXCJcIjtcclxuICBjb25zdCBudW1SZXRyaWV2YWxzID0gcmVzdWx0LmVudHJpZXMubGVuZ3RoO1xyXG4gIGlmIChudW1SZXRyaWV2YWxzID4gMCkge1xyXG4gICAgLy8gcmV0cmlldmFsIG9jY3VyZWQgYW5kIGdvdCByZXN1bHRzXHJcbiAgICAvLyBzaG93IHN0YXR1c1xyXG4gICAgcmV0cmlldmluZ1N0YXR1cy5zZXRTdGF0ZSh7XHJcbiAgICAgIHN0YXR1czogXCJkb25lXCIsXHJcbiAgICAgIHRleHQ6IGBSZXRyaWV2ZWQgJHtudW1SZXRyaWV2YWxzfSByZWxldmFudCBjaXRhdGlvbnMgZm9yIHVzZXIgcXVlcnlgLFxyXG4gICAgfSk7XHJcbiAgICBjdGwuZGVidWcoXCJSZXRyaWV2YWwgcmVzdWx0c1wiLCByZXN1bHQpO1xyXG4gICAgLy8gYWRkIHJlc3VsdHMgdG8gcHJvbXB0XHJcbiAgICBjb25zdCBwcmVmaXggPSBcIlRoZSBmb2xsb3dpbmcgY2l0YXRpb25zIHdlcmUgZm91bmQgaW4gdGhlIGZpbGVzIHByb3ZpZGVkIGJ5IHRoZSB1c2VyOlxcblxcblwiO1xyXG4gICAgcHJvY2Vzc2VkQ29udGVudCArPSBwcmVmaXg7XHJcbiAgICBsZXQgY2l0YXRpb25OdW1iZXIgPSAxO1xyXG4gICAgcmVzdWx0LmVudHJpZXMuZm9yRWFjaChyZXN1bHQgPT4ge1xyXG4gICAgICBjb25zdCBjb21wbGV0ZVRleHQgPSByZXN1bHQuY29udGVudDtcclxuICAgICAgcHJvY2Vzc2VkQ29udGVudCArPSBgQ2l0YXRpb24gJHtjaXRhdGlvbk51bWJlcn06IFwiJHtjb21wbGV0ZVRleHR9XCJcXG5cXG5gO1xyXG4gICAgICBjaXRhdGlvbk51bWJlcisrO1xyXG4gICAgfSk7XHJcbiAgICBhd2FpdCBjdGwuYWRkQ2l0YXRpb25zKHJlc3VsdCk7XHJcbiAgICBjb25zdCBzdWZmaXggPVxyXG4gICAgICBcIlVzZSB0aGUgY2l0YXRpb25zIGFib3ZlIHRvIHJlc3BvbmQgdG8gdGhlIHVzZXIgcXVlcnksIG9ubHkgaWYgdGhleSBhcmUgcmVsZXZhbnQuIFwiICtcclxuICAgICAgYE90aGVyd2lzZSwgcmVzcG9uZCB0byB0aGUgYmVzdCBvZiB5b3VyIGFiaWxpdHkgd2l0aG91dCB0aGVtLmAgK1xyXG4gICAgICBgXFxuXFxuVXNlciBRdWVyeTpcXG5cXG4ke29yaWdpbmFsVXNlclByb21wdH1gO1xyXG4gICAgcHJvY2Vzc2VkQ29udGVudCArPSBzdWZmaXg7XHJcbiAgfSBlbHNlIHtcclxuICAgIC8vIHJldHJpZXZhbCBvY2N1cmVkIGJ1dCBubyByZWxldmFudCBjaXRhdGlvbnMgZm91bmRcclxuICAgIHJldHJpZXZpbmdTdGF0dXMuc2V0U3RhdGUoe1xyXG4gICAgICBzdGF0dXM6IFwiY2FuY2VsZWRcIixcclxuICAgICAgdGV4dDogYE5vIHJlbGV2YW50IGNpdGF0aW9ucyBmb3VuZCBmb3IgdXNlciBxdWVyeWAsXHJcbiAgICB9KTtcclxuICAgIGN0bC5kZWJ1ZyhcIk5vIHJlbGV2YW50IGNpdGF0aW9ucyBmb3VuZCBmb3IgdXNlciBxdWVyeVwiKTtcclxuICAgIGNvbnN0IG5vdGVBYm91dE5vUmV0cmlldmFsUmVzdWx0c0ZvdW5kID1cclxuICAgICAgXCJJbXBvcnRhbnQ6IE5vIGNpdGF0aW9ucyB3ZXJlIGZvdW5kIGluIHRoZSB1c2VyIGZpbGVzIGZvciB0aGUgdXNlciBxdWVyeS4gXCIgK1xyXG4gICAgICBgSW4gbGVzcyB0aGFuIG9uZSBzZW50ZW5jZSwgaW5mb3JtIHRoZSB1c2VyIG9mIHRoaXMuIGAgK1xyXG4gICAgICBgVGhlbiByZXNwb25kIHRvIHRoZSBxdWVyeSB0byB0aGUgYmVzdCBvZiB5b3VyIGFiaWxpdHkuYDtcclxuICAgIHByb2Nlc3NlZENvbnRlbnQgPVxyXG4gICAgICBub3RlQWJvdXROb1JldHJpZXZhbFJlc3VsdHNGb3VuZCArIGBcXG5cXG5Vc2VyIFF1ZXJ5OlxcblxcbiR7b3JpZ2luYWxVc2VyUHJvbXB0fWA7XHJcbiAgfVxyXG4gIGN0bC5kZWJ1ZyhcIlByb2Nlc3NlZCBjb250ZW50XCIsIHByb2Nlc3NlZENvbnRlbnQpO1xyXG5cclxuICByZXR1cm4gcHJvY2Vzc2VkQ29udGVudDtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gcHJlcGFyZURvY3VtZW50Q29udGV4dEluamVjdGlvbihcclxuICBjdGw6IFByb21wdFByZXByb2Nlc3NvckNvbnRyb2xsZXIsXHJcbiAgaW5wdXQ6IENoYXRNZXNzYWdlLFxyXG4pOiBQcm9taXNlPENoYXRNZXNzYWdlPiB7XHJcbiAgY29uc3QgZG9jdW1lbnRJbmplY3Rpb25TbmlwcGV0czogTWFwPEZpbGVIYW5kbGUsIHN0cmluZz4gPSBuZXcgTWFwKCk7XHJcbiAgY29uc3QgZmlsZXMgPSBpbnB1dC5jb25zdW1lRmlsZXMoY3RsLmNsaWVudCwgZmlsZSA9PiBmaWxlLnR5cGUgIT09IFwiaW1hZ2VcIik7XHJcbiAgZm9yIChjb25zdCBmaWxlIG9mIGZpbGVzKSB7XHJcbiAgICAvLyBUaGlzIHNob3VsZCB0YWtlIG5vIHRpbWUgYXMgdGhlIHJlc3VsdCBpcyBhbHJlYWR5IGluIHRoZSBjYWNoZVxyXG4gICAgY29uc3QgeyBjb250ZW50IH0gPSBhd2FpdCBjdGwuY2xpZW50LmZpbGVzLnBhcnNlRG9jdW1lbnQoZmlsZSwge1xyXG4gICAgICBzaWduYWw6IGN0bC5hYm9ydFNpZ25hbCxcclxuICAgIH0pO1xyXG5cclxuICAgIGN0bC5kZWJ1Zyh0ZXh0YFxyXG4gICAgICBTdHJhdGVneTogaW5qZWN0LWZ1bGwtY29udGVudC4gSW5qZWN0aW5nIGZ1bGwgY29udGVudCBvZiBmaWxlICcke2ZpbGV9JyBpbnRvIHRoZVxyXG4gICAgICBjb250ZXh0LiBMZW5ndGg6ICR7Y29udGVudC5sZW5ndGh9LlxyXG4gICAgYCk7XHJcbiAgICBkb2N1bWVudEluamVjdGlvblNuaXBwZXRzLnNldChmaWxlLCBjb250ZW50KTtcclxuICB9XHJcblxyXG4gIGxldCBmb3JtYXR0ZWRGaW5hbFVzZXJQcm9tcHQgPSBcIlwiO1xyXG5cclxuICBpZiAoZG9jdW1lbnRJbmplY3Rpb25TbmlwcGV0cy5zaXplID4gMCkge1xyXG4gICAgZm9ybWF0dGVkRmluYWxVc2VyUHJvbXB0ICs9XHJcbiAgICAgIFwiVGhpcyBpcyBhIEVucmljaGVkIENvbnRleHQgR2VuZXJhdGlvbiBzY2VuYXJpby5cXG5cXG5UaGUgZm9sbG93aW5nIGNvbnRlbnQgd2FzIGZvdW5kIGluIHRoZSBmaWxlcyBwcm92aWRlZCBieSB0aGUgdXNlci5cXG5cIjtcclxuXHJcbiAgICBmb3IgKGNvbnN0IFtmaWxlSGFuZGxlLCBzbmlwcGV0XSBvZiBkb2N1bWVudEluamVjdGlvblNuaXBwZXRzKSB7XHJcbiAgICAgIGZvcm1hdHRlZEZpbmFsVXNlclByb21wdCArPSBgXFxuXFxuKiogJHtmaWxlSGFuZGxlLm5hbWV9IGZ1bGwgY29udGVudCAqKlxcblxcbiR7c25pcHBldH1cXG5cXG4qKiBlbmQgb2YgJHtmaWxlSGFuZGxlLm5hbWV9ICoqXFxuXFxuYDtcclxuICAgIH1cclxuXHJcbiAgICBmb3JtYXR0ZWRGaW5hbFVzZXJQcm9tcHQgKz0gYEJhc2VkIG9uIHRoZSBjb250ZW50IGFib3ZlLCBwbGVhc2UgcHJvdmlkZSBhIHJlc3BvbnNlIHRvIHRoZSB1c2VyIHF1ZXJ5LlxcblxcblVzZXIgcXVlcnk6ICR7aW5wdXQuZ2V0VGV4dCgpfWA7XHJcbiAgfVxyXG5cclxuICBpbnB1dC5yZXBsYWNlVGV4dChmb3JtYXR0ZWRGaW5hbFVzZXJQcm9tcHQpO1xyXG4gIHJldHVybiBpbnB1dDtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gbWVhc3VyZUNvbnRleHRXaW5kb3coY3R4OiBDaGF0LCBtb2RlbDogTExNRHluYW1pY0hhbmRsZSkge1xyXG4gIGNvbnN0IGN1cnJlbnRDb250ZXh0Rm9ybWF0dGVkID0gYXdhaXQgbW9kZWwuYXBwbHlQcm9tcHRUZW1wbGF0ZShjdHgpO1xyXG4gIGNvbnN0IHRvdGFsVG9rZW5zSW5Db250ZXh0ID0gYXdhaXQgbW9kZWwuY291bnRUb2tlbnMoY3VycmVudENvbnRleHRGb3JtYXR0ZWQpO1xyXG4gIGNvbnN0IG1vZGVsQ29udGV4dExlbmd0aCA9IGF3YWl0IG1vZGVsLmdldENvbnRleHRMZW5ndGgoKTtcclxuICBjb25zdCBtb2RlbFJlbWFpbmluZ0NvbnRleHRMZW5ndGggPSBtb2RlbENvbnRleHRMZW5ndGggLSB0b3RhbFRva2Vuc0luQ29udGV4dDtcclxuICBjb25zdCBjb250ZXh0T2NjdXBpZWRQZXJjZW50ID0gKHRvdGFsVG9rZW5zSW5Db250ZXh0IC8gbW9kZWxDb250ZXh0TGVuZ3RoKSAqIDEwMDtcclxuICByZXR1cm4ge1xyXG4gICAgdG90YWxUb2tlbnNJbkNvbnRleHQsXHJcbiAgICBtb2RlbENvbnRleHRMZW5ndGgsXHJcbiAgICBtb2RlbFJlbWFpbmluZ0NvbnRleHRMZW5ndGgsXHJcbiAgICBjb250ZXh0T2NjdXBpZWRQZXJjZW50LFxyXG4gIH07XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGNob29zZUNvbnRleHRJbmplY3Rpb25TdHJhdGVneShcclxuICBjdGw6IFByb21wdFByZXByb2Nlc3NvckNvbnRyb2xsZXIsXHJcbiAgb3JpZ2luYWxVc2VyUHJvbXB0OiBzdHJpbmcsXHJcbiAgZmlsZXM6IEFycmF5PEZpbGVIYW5kbGU+LFxyXG4pOiBQcm9taXNlPERvY3VtZW50Q29udGV4dEluamVjdGlvblN0cmF0ZWd5PiB7XHJcbiAgY29uc3Qgc3RhdHVzID0gY3RsLmNyZWF0ZVN0YXR1cyh7XHJcbiAgICBzdGF0dXM6IFwibG9hZGluZ1wiLFxyXG4gICAgdGV4dDogYERlY2lkaW5nIGhvdyB0byBoYW5kbGUgdGhlIGRvY3VtZW50KHMpLi4uYCxcclxuICB9KTtcclxuXHJcbiAgY29uc3QgbW9kZWwgPSBhd2FpdCBjdGwuY2xpZW50LmxsbS5tb2RlbCgpO1xyXG4gIGNvbnN0IGN0eCA9IGF3YWl0IGN0bC5wdWxsSGlzdG9yeSgpO1xyXG5cclxuICAvLyBNZWFzdXJlIHRoZSBjb250ZXh0IHdpbmRvd1xyXG4gIGNvbnN0IHtcclxuICAgIHRvdGFsVG9rZW5zSW5Db250ZXh0LFxyXG4gICAgbW9kZWxDb250ZXh0TGVuZ3RoLFxyXG4gICAgbW9kZWxSZW1haW5pbmdDb250ZXh0TGVuZ3RoLFxyXG4gICAgY29udGV4dE9jY3VwaWVkUGVyY2VudCxcclxuICB9ID0gYXdhaXQgbWVhc3VyZUNvbnRleHRXaW5kb3coY3R4LCBtb2RlbCk7XHJcblxyXG4gIGN0bC5kZWJ1ZyhcclxuICAgIGBDb250ZXh0IG1lYXN1cmVtZW50IHJlc3VsdDpcXG5cXG5gICtcclxuICAgICAgYFxcdFRvdGFsIHRva2VucyBpbiBjb250ZXh0OiAke3RvdGFsVG9rZW5zSW5Db250ZXh0fVxcbmAgK1xyXG4gICAgICBgXFx0TW9kZWwgY29udGV4dCBsZW5ndGg6ICR7bW9kZWxDb250ZXh0TGVuZ3RofVxcbmAgK1xyXG4gICAgICBgXFx0TW9kZWwgcmVtYWluaW5nIGNvbnRleHQgbGVuZ3RoOiAke21vZGVsUmVtYWluaW5nQ29udGV4dExlbmd0aH1cXG5gICtcclxuICAgICAgYFxcdENvbnRleHQgb2NjdXBpZWQgcGVyY2VudDogJHtjb250ZXh0T2NjdXBpZWRQZXJjZW50LnRvRml4ZWQoMil9JVxcbmAsXHJcbiAgKTtcclxuXHJcbiAgLy8gR2V0IHRva2VuIGNvdW50IG9mIHByb3ZpZGVkIGZpbGVzXHJcbiAgbGV0IHRvdGFsRmlsZVRva2VuQ291bnQgPSAwO1xyXG4gIGxldCB0b3RhbFJlYWRUaW1lID0gMDtcclxuICBsZXQgdG90YWxUb2tlbml6ZVRpbWUgPSAwO1xyXG4gIGZvciAoY29uc3QgZmlsZSBvZiBmaWxlcykge1xyXG4gICAgY29uc3Qgc3RhcnRUaW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcblxyXG4gICAgY29uc3QgbG9hZGluZ1N0YXR1cyA9IHN0YXR1cy5hZGRTdWJTdGF0dXMoe1xyXG4gICAgICBzdGF0dXM6IFwibG9hZGluZ1wiLFxyXG4gICAgICB0ZXh0OiBgTG9hZGluZyBwYXJzZXIgZm9yICR7ZmlsZS5uYW1lfS4uLmAsXHJcbiAgICB9KTtcclxuICAgIGxldCBhY3Rpb25Qcm9ncmVzc2luZyA9IFwiUmVhZGluZ1wiO1xyXG4gICAgbGV0IHBhcnNlckluZGljYXRvciA9IFwiXCI7XHJcblxyXG4gICAgY29uc3QgeyBjb250ZW50IH0gPSBhd2FpdCBjdGwuY2xpZW50LmZpbGVzLnBhcnNlRG9jdW1lbnQoZmlsZSwge1xyXG4gICAgICBzaWduYWw6IGN0bC5hYm9ydFNpZ25hbCxcclxuICAgICAgb25QYXJzZXJMb2FkZWQ6IHBhcnNlciA9PiB7XHJcbiAgICAgICAgbG9hZGluZ1N0YXR1cy5zZXRTdGF0ZSh7XHJcbiAgICAgICAgICBzdGF0dXM6IFwibG9hZGluZ1wiLFxyXG4gICAgICAgICAgdGV4dDogYCR7cGFyc2VyLmxpYnJhcnl9IGxvYWRlZCBmb3IgJHtmaWxlLm5hbWV9Li4uYCxcclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAocGFyc2VyLmxpYnJhcnkgIT09IFwiYnVpbHRJblwiKSB7XHJcbiAgICAgICAgICBhY3Rpb25Qcm9ncmVzc2luZyA9IFwiUGFyc2luZ1wiO1xyXG4gICAgICAgICAgcGFyc2VySW5kaWNhdG9yID0gYCB3aXRoICR7cGFyc2VyLmxpYnJhcnl9YDtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIG9uUHJvZ3Jlc3M6IHByb2dyZXNzID0+IHtcclxuICAgICAgICBsb2FkaW5nU3RhdHVzLnNldFN0YXRlKHtcclxuICAgICAgICAgIHN0YXR1czogXCJsb2FkaW5nXCIsXHJcbiAgICAgICAgICB0ZXh0OiBgJHthY3Rpb25Qcm9ncmVzc2luZ30gZmlsZSAke2ZpbGUubmFtZX0ke3BhcnNlckluZGljYXRvcn0uLi4gKCR7KFxyXG4gICAgICAgICAgICBwcm9ncmVzcyAqIDEwMFxyXG4gICAgICAgICAgKS50b0ZpeGVkKDIpfSUpYCxcclxuICAgICAgICB9KTtcclxuICAgICAgfSxcclxuICAgIH0pO1xyXG4gICAgbG9hZGluZ1N0YXR1cy5yZW1vdmUoKTtcclxuXHJcbiAgICB0b3RhbFJlYWRUaW1lICs9IHBlcmZvcm1hbmNlLm5vdygpIC0gc3RhcnRUaW1lO1xyXG5cclxuICAgIC8vIHRva2VuaXplIGZpbGUgY29udGVudFxyXG4gICAgY29uc3Qgc3RhcnRUb2tlbml6ZVRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcclxuICAgIHRvdGFsRmlsZVRva2VuQ291bnQgKz0gYXdhaXQgbW9kZWwuY291bnRUb2tlbnMoY29udGVudCk7XHJcbiAgICB0b3RhbFRva2VuaXplVGltZSArPSBwZXJmb3JtYW5jZS5ub3coKSAtIHN0YXJ0VG9rZW5pemVUaW1lO1xyXG4gICAgaWYgKHRvdGFsRmlsZVRva2VuQ291bnQgPiBtb2RlbFJlbWFpbmluZ0NvbnRleHRMZW5ndGgpIHtcclxuICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG4gIGN0bC5kZWJ1ZyhgVG90YWwgZmlsZSByZWFkIHRpbWU6ICR7dG90YWxSZWFkVGltZS50b0ZpeGVkKDIpfSBtc2ApO1xyXG4gIGN0bC5kZWJ1ZyhgVG90YWwgdG9rZW5pemUgdGltZTogJHt0b3RhbFRva2VuaXplVGltZS50b0ZpeGVkKDIpfSBtc2ApO1xyXG5cclxuICAvLyBDYWxjdWxhdGUgdG90YWwgdG9rZW4gY291bnQgb2YgZmlsZXMgKyB1c2VyIHByb21wdFxyXG4gIGN0bC5kZWJ1ZyhgT3JpZ2luYWwgVXNlciBQcm9tcHQ6ICR7b3JpZ2luYWxVc2VyUHJvbXB0fWApO1xyXG4gIGNvbnN0IHVzZXJQcm9tcHRUb2tlbkNvdW50ID0gKGF3YWl0IG1vZGVsLnRva2VuaXplKG9yaWdpbmFsVXNlclByb21wdCkpLmxlbmd0aDtcclxuICBjb25zdCB0b3RhbEZpbGVQbHVzUHJvbXB0VG9rZW5Db3VudCA9IHRvdGFsRmlsZVRva2VuQ291bnQgKyB1c2VyUHJvbXB0VG9rZW5Db3VudDtcclxuXHJcbiAgLy8gQ2FsY3VsYXRlIHRoZSBhdmFpbGFibGUgY29udGV4dCB0b2tlbnNcclxuICBjb25zdCBjb250ZXh0T2NjdXBpZWRGcmFjdGlvbiA9IGNvbnRleHRPY2N1cGllZFBlcmNlbnQgLyAxMDA7XHJcbiAgY29uc3QgdGFyZ2V0Q29udGV4dFVzZVBlcmNlbnQgPSAwLjc7XHJcbiAgY29uc3QgdGFyZ2V0Q29udGV4dFVzYWdlID0gdGFyZ2V0Q29udGV4dFVzZVBlcmNlbnQgKiAoMSAtIGNvbnRleHRPY2N1cGllZEZyYWN0aW9uKTtcclxuICBjb25zdCBhdmFpbGFibGVDb250ZXh0VG9rZW5zID0gTWF0aC5mbG9vcihtb2RlbFJlbWFpbmluZ0NvbnRleHRMZW5ndGggKiB0YXJnZXRDb250ZXh0VXNhZ2UpO1xyXG5cclxuICAvLyBEZWJ1ZyBsb2dcclxuICBjdGwuZGVidWcoXCJTdHJhdGVneSBDYWxjdWxhdGlvbjpcIik7XHJcbiAgY3RsLmRlYnVnKGBcXHRUb3RhbCBUb2tlbnMgaW4gQWxsIEZpbGVzOiAke3RvdGFsRmlsZVRva2VuQ291bnR9YCk7XHJcbiAgY3RsLmRlYnVnKGBcXHRUb3RhbCBUb2tlbnMgaW4gVXNlciBQcm9tcHQ6ICR7dXNlclByb21wdFRva2VuQ291bnR9YCk7XHJcbiAgY3RsLmRlYnVnKGBcXHRNb2RlbCBDb250ZXh0IFJlbWFpbmluZzogJHttb2RlbFJlbWFpbmluZ0NvbnRleHRMZW5ndGh9IHRva2Vuc2ApO1xyXG4gIGN0bC5kZWJ1ZyhgXFx0Q29udGV4dCBPY2N1cGllZDogJHtjb250ZXh0T2NjdXBpZWRQZXJjZW50LnRvRml4ZWQoMil9JWApO1xyXG4gIGN0bC5kZWJ1ZyhgXFx0QXZhaWxhYmxlIFRva2VuczogJHthdmFpbGFibGVDb250ZXh0VG9rZW5zfVxcbmApO1xyXG5cclxuICBpZiAodG90YWxGaWxlUGx1c1Byb21wdFRva2VuQ291bnQgPiBhdmFpbGFibGVDb250ZXh0VG9rZW5zKSB7XHJcbiAgICBjb25zdCBjaG9zZW5TdHJhdGVneSA9IFwicmV0cmlldmFsXCI7XHJcbiAgICBjdGwuZGVidWcoXHJcbiAgICAgIGBDaG9zZW4gY29udGV4dCBpbmplY3Rpb24gc3RyYXRlZ3k6ICcke2Nob3NlblN0cmF0ZWd5fScuIFRvdGFsIGZpbGUgKyBwcm9tcHQgdG9rZW4gY291bnQ6IGAgK1xyXG4gICAgICAgIGAke3RvdGFsRmlsZVBsdXNQcm9tcHRUb2tlbkNvdW50fSA+ICR7XHJcbiAgICAgICAgICB0YXJnZXRDb250ZXh0VXNhZ2UgKiAxMDBcclxuICAgICAgICB9JSAqIGF2YWlsYWJsZSBjb250ZXh0IHRva2VuczogJHthdmFpbGFibGVDb250ZXh0VG9rZW5zfWAsXHJcbiAgICApO1xyXG4gICAgc3RhdHVzLnNldFN0YXRlKHtcclxuICAgICAgc3RhdHVzOiBcImRvbmVcIixcclxuICAgICAgdGV4dDogYENob3NlbiBjb250ZXh0IGluamVjdGlvbiBzdHJhdGVneTogJyR7Y2hvc2VuU3RyYXRlZ3l9Jy4gUmV0cmlldmFsIGlzIG9wdGltYWwgZm9yIHRoZSBzaXplIG9mIGNvbnRlbnQgcHJvdmlkZWRgLFxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gY2hvc2VuU3RyYXRlZ3k7XHJcbiAgfVxyXG5cclxuICBjb25zdCBjaG9zZW5TdHJhdGVneSA9IFwiaW5qZWN0LWZ1bGwtY29udGVudFwiO1xyXG4gIHN0YXR1cy5zZXRTdGF0ZSh7XHJcbiAgICBzdGF0dXM6IFwiZG9uZVwiLFxyXG4gICAgdGV4dDogYENob3NlbiBjb250ZXh0IGluamVjdGlvbiBzdHJhdGVneTogJyR7Y2hvc2VuU3RyYXRlZ3l9Jy4gQWxsIGNvbnRlbnQgY2FuIGZpdCBpbnRvIHRoZSBjb250ZXh0YCxcclxuICB9KTtcclxuICByZXR1cm4gY2hvc2VuU3RyYXRlZ3k7XHJcbn0iLCAiaW1wb3J0IHsgdHlwZSBQbHVnaW5Db250ZXh0LCBMTVN0dWRpb0NsaWVudCB9IGZyb20gXCJAbG1zdHVkaW8vc2RrXCI7XHJcbmltcG9ydCB7IHRvb2xzUHJvdmlkZXIgfSBmcm9tIFwiLi90b29sc1Byb3ZpZGVyXCI7XHJcbmltcG9ydCB7IHByb21wdFByZXByb2Nlc3NvciB9IGZyb20gXCIuL3Byb21wdFByZXByb2Nlc3NvclwiO1xyXG5pbXBvcnQgeyBwbHVnaW5Db25maWdTY2hlbWF0aWNzIH0gZnJvbSBcIi4vY29uZmlnXCI7XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbWFpbihjb250ZXh0OiBQbHVnaW5Db250ZXh0KSB7XHJcbiAgLy8gUmVnaXN0ZXIgdGhlIGNvbmZpZ3VyYXRpb24gc2NoZW1hdGljcy5cclxuICBjb250ZXh0LndpdGhDb25maWdTY2hlbWF0aWNzKHBsdWdpbkNvbmZpZ1NjaGVtYXRpY3MpO1xyXG5cclxuICAvLyBSZWdpc3RlciB0aGUgdG9vbHMgcHJvdmlkZXIuXHJcbiAgY29udGV4dC53aXRoVG9vbHNQcm92aWRlcih0b29sc1Byb3ZpZGVyKTtcclxuICBcclxuICAvLyBSZWdpc3RlciB0aGUgcHJvbXB0IHByZXByb2Nlc3NvciB0byBpbmplY3QgZG9jdW1lbnRhdGlvbiBvbiBzdGFydHVwLlxyXG4gIGNvbnRleHQud2l0aFByb21wdFByZXByb2Nlc3Nvcihwcm9tcHRQcmVwcm9jZXNzb3IpO1xyXG59XHJcbiIsICJpbXBvcnQgeyBMTVN0dWRpb0NsaWVudCwgdHlwZSBQbHVnaW5Db250ZXh0IH0gZnJvbSBcIkBsbXN0dWRpby9zZGtcIjtcblxuZGVjbGFyZSB2YXIgcHJvY2VzczogYW55O1xuXG4vLyBXZSByZWNlaXZlIHJ1bnRpbWUgaW5mb3JtYXRpb24gaW4gdGhlIGVudmlyb25tZW50IHZhcmlhYmxlcy5cbmNvbnN0IGNsaWVudElkZW50aWZpZXIgPSBwcm9jZXNzLmVudi5MTVNfUExVR0lOX0NMSUVOVF9JREVOVElGSUVSO1xuY29uc3QgY2xpZW50UGFzc2tleSA9IHByb2Nlc3MuZW52LkxNU19QTFVHSU5fQ0xJRU5UX1BBU1NLRVk7XG5jb25zdCBiYXNlVXJsID0gcHJvY2Vzcy5lbnYuTE1TX1BMVUdJTl9CQVNFX1VSTDtcblxuY29uc3QgY2xpZW50ID0gbmV3IExNU3R1ZGlvQ2xpZW50KHtcbiAgY2xpZW50SWRlbnRpZmllcixcbiAgY2xpZW50UGFzc2tleSxcbiAgYmFzZVVybCxcbn0pO1xuXG4oZ2xvYmFsVGhpcyBhcyBhbnkpLl9fTE1TX1BMVUdJTl9DT05URVhUID0gdHJ1ZTtcblxubGV0IHByZWRpY3Rpb25Mb29wSGFuZGxlclNldCA9IGZhbHNlO1xubGV0IHByb21wdFByZXByb2Nlc3NvclNldCA9IGZhbHNlO1xubGV0IGNvbmZpZ1NjaGVtYXRpY3NTZXQgPSBmYWxzZTtcbmxldCBnbG9iYWxDb25maWdTY2hlbWF0aWNzU2V0ID0gZmFsc2U7XG5sZXQgdG9vbHNQcm92aWRlclNldCA9IGZhbHNlO1xubGV0IGdlbmVyYXRvclNldCA9IGZhbHNlO1xuXG5jb25zdCBzZWxmUmVnaXN0cmF0aW9uSG9zdCA9IGNsaWVudC5wbHVnaW5zLmdldFNlbGZSZWdpc3RyYXRpb25Ib3N0KCk7XG5cbmNvbnN0IHBsdWdpbkNvbnRleHQ6IFBsdWdpbkNvbnRleHQgPSB7XG4gIHdpdGhQcmVkaWN0aW9uTG9vcEhhbmRsZXI6IChnZW5lcmF0ZSkgPT4ge1xuICAgIGlmIChwcmVkaWN0aW9uTG9vcEhhbmRsZXJTZXQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlByZWRpY3Rpb25Mb29wSGFuZGxlciBhbHJlYWR5IHJlZ2lzdGVyZWRcIik7XG4gICAgfVxuICAgIGlmICh0b29sc1Byb3ZpZGVyU2V0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQcmVkaWN0aW9uTG9vcEhhbmRsZXIgY2Fubm90IGJlIHVzZWQgd2l0aCBhIHRvb2xzIHByb3ZpZGVyXCIpO1xuICAgIH1cblxuICAgIHByZWRpY3Rpb25Mb29wSGFuZGxlclNldCA9IHRydWU7XG4gICAgc2VsZlJlZ2lzdHJhdGlvbkhvc3Quc2V0UHJlZGljdGlvbkxvb3BIYW5kbGVyKGdlbmVyYXRlKTtcbiAgICByZXR1cm4gcGx1Z2luQ29udGV4dDtcbiAgfSxcbiAgd2l0aFByb21wdFByZXByb2Nlc3NvcjogKHByZXByb2Nlc3MpID0+IHtcbiAgICBpZiAocHJvbXB0UHJlcHJvY2Vzc29yU2V0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQcm9tcHRQcmVwcm9jZXNzb3IgYWxyZWFkeSByZWdpc3RlcmVkXCIpO1xuICAgIH1cbiAgICBwcm9tcHRQcmVwcm9jZXNzb3JTZXQgPSB0cnVlO1xuICAgIHNlbGZSZWdpc3RyYXRpb25Ib3N0LnNldFByb21wdFByZXByb2Nlc3NvcihwcmVwcm9jZXNzKTtcbiAgICByZXR1cm4gcGx1Z2luQ29udGV4dDtcbiAgfSxcbiAgd2l0aENvbmZpZ1NjaGVtYXRpY3M6IChjb25maWdTY2hlbWF0aWNzKSA9PiB7XG4gICAgaWYgKGNvbmZpZ1NjaGVtYXRpY3NTZXQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvbmZpZyBzY2hlbWF0aWNzIGFscmVhZHkgcmVnaXN0ZXJlZFwiKTtcbiAgICB9XG4gICAgY29uZmlnU2NoZW1hdGljc1NldCA9IHRydWU7XG4gICAgc2VsZlJlZ2lzdHJhdGlvbkhvc3Quc2V0Q29uZmlnU2NoZW1hdGljcyhjb25maWdTY2hlbWF0aWNzKTtcbiAgICByZXR1cm4gcGx1Z2luQ29udGV4dDtcbiAgfSxcbiAgd2l0aEdsb2JhbENvbmZpZ1NjaGVtYXRpY3M6IChnbG9iYWxDb25maWdTY2hlbWF0aWNzKSA9PiB7XG4gICAgaWYgKGdsb2JhbENvbmZpZ1NjaGVtYXRpY3NTZXQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkdsb2JhbCBjb25maWcgc2NoZW1hdGljcyBhbHJlYWR5IHJlZ2lzdGVyZWRcIik7XG4gICAgfVxuICAgIGdsb2JhbENvbmZpZ1NjaGVtYXRpY3NTZXQgPSB0cnVlO1xuICAgIHNlbGZSZWdpc3RyYXRpb25Ib3N0LnNldEdsb2JhbENvbmZpZ1NjaGVtYXRpY3MoZ2xvYmFsQ29uZmlnU2NoZW1hdGljcyk7XG4gICAgcmV0dXJuIHBsdWdpbkNvbnRleHQ7XG4gIH0sXG4gIHdpdGhUb29sc1Byb3ZpZGVyOiAodG9vbHNQcm92aWRlcikgPT4ge1xuICAgIGlmICh0b29sc1Byb3ZpZGVyU2V0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUb29scyBwcm92aWRlciBhbHJlYWR5IHJlZ2lzdGVyZWRcIik7XG4gICAgfVxuICAgIGlmIChwcmVkaWN0aW9uTG9vcEhhbmRsZXJTZXQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlRvb2xzIHByb3ZpZGVyIGNhbm5vdCBiZSB1c2VkIHdpdGggYSBwcmVkaWN0aW9uTG9vcEhhbmRsZXJcIik7XG4gICAgfVxuXG4gICAgdG9vbHNQcm92aWRlclNldCA9IHRydWU7XG4gICAgc2VsZlJlZ2lzdHJhdGlvbkhvc3Quc2V0VG9vbHNQcm92aWRlcih0b29sc1Byb3ZpZGVyKTtcbiAgICByZXR1cm4gcGx1Z2luQ29udGV4dDtcbiAgfSxcbiAgd2l0aEdlbmVyYXRvcjogKGdlbmVyYXRvcikgPT4ge1xuICAgIGlmIChnZW5lcmF0b3JTZXQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkdlbmVyYXRvciBhbHJlYWR5IHJlZ2lzdGVyZWRcIik7XG4gICAgfVxuXG4gICAgZ2VuZXJhdG9yU2V0ID0gdHJ1ZTtcbiAgICBzZWxmUmVnaXN0cmF0aW9uSG9zdC5zZXRHZW5lcmF0b3IoZ2VuZXJhdG9yKTtcbiAgICByZXR1cm4gcGx1Z2luQ29udGV4dDtcbiAgfSxcbn07XG5cbmltcG9ydChcIi4vLi4vc3JjL2luZGV4LnRzXCIpLnRoZW4oYXN5bmMgbW9kdWxlID0+IHtcbiAgcmV0dXJuIGF3YWl0IG1vZHVsZS5tYWluKHBsdWdpbkNvbnRleHQpO1xufSkudGhlbigoKSA9PiB7XG4gIHNlbGZSZWdpc3RyYXRpb25Ib3N0LmluaXRDb21wbGV0ZWQoKTtcbn0pLmNhdGNoKChlcnJvcikgPT4ge1xuICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIGV4ZWN1dGUgdGhlIG1haW4gZnVuY3Rpb24gb2YgdGhlIHBsdWdpbi5cIik7XG4gIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGdCQUVhO0FBRmI7QUFBQTtBQUFBO0FBQUEsaUJBQXVDO0FBRWhDLElBQU0sNkJBQXlCLG1DQUF1QixFQUMxRCxNQUFNLGtCQUFrQixXQUFXO0FBQUEsTUFDbEMsS0FBSztBQUFBLE1BQ0wsS0FBSztBQUFBLE1BQ0wsYUFBYTtBQUFBLE1BQ2IsVUFBVTtBQUFBLE1BQ1YsUUFBUSxFQUFFLEtBQUssR0FBRyxLQUFLLElBQUksTUFBTSxFQUFFO0FBQUEsSUFDckMsR0FBRyxDQUFDLEVBQ0gsTUFBTSw4QkFBOEIsV0FBVztBQUFBLE1BQzlDLEtBQUs7QUFBQSxNQUNMLEtBQUs7QUFBQSxNQUNMLGFBQWE7QUFBQSxNQUNiLFVBQVU7QUFBQSxNQUNWLFFBQVEsRUFBRSxLQUFLLEdBQUssS0FBSyxHQUFLLE1BQU0sS0FBSztBQUFBLElBQzNDLEdBQUcsR0FBRyxFQUNMLE1BQU0sNEJBQTRCLFdBQVc7QUFBQSxNQUM1QyxhQUFhO0FBQUEsTUFDYixVQUFVO0FBQUEsSUFDWixHQUFHLEtBQUssRUFDUCxNQUFNLHdCQUF3QixXQUFXO0FBQUEsTUFDeEMsYUFBYTtB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Q0FBdUM7QUFBQSxJQUN6RDtBQUNBLDRCQUF3QjtBQUN4Qix5QkFBcUIsc0JBQXNCLFVBQVU7QUFDckQsV0FBTztBQUFBLEVBQ1Q7QUFBQSxFQUNBLHNCQUFzQixDQUFDLHFCQUFxQjtBQUMxQyxRQUFJLHFCQUFxQjtBQUN2QixZQUFNLElBQUksTUFBTSxzQ0FBc0M7QUFBQSxJQUN4RDtBQUNBLDBCQUFzQjtBQUN0Qix5QkFBcUIsb0JBQW9CLGdCQUFnQjtBQUN6RCxXQUFPO0FBQUEsRUFDVDtBQUFBLEVBQ0EsNEJBQTRCLENBQUMsMkJBQTJCO0FBQ3RELFFBQUksMkJBQTJCO0FBQzdCLFlBQU0sSUFBSSxNQUFNLDZDQUE2QztBQUFBLElBQy9EO0FBQ0EsZ0NBQTRCO0FBQzVCLHlCQUFxQiwwQkFBMEIsc0JBQXNCO0FBQ3JFLFdBQU87QUFBQSxFQUNUO0FBQUEsRUFDQSxtQkFBbUIsQ0FBQ0MsbUJBQWtCO0FBQ3BDLFFBQUksa0JBQWtCO0FBQ3BCLFlBQU0sSUFBSSxNQUFNLG1DQUFtQztBQUFBLElBQ3JEO0FBQ0EsUUFBSSwwQkFBMEI7QUFDNUIsWUFBTSxJQUFJLE1BQU0sNERBQTREO0FBQUEsSUFDOUU7QUFFQSx1QkFBbUI7QUFDbkIseUJBQXFCLGlCQUFpQkEsY0FBYTtBQUNuRCxXQUFPO0FBQUEsRUFDVDtBQUFBLEVBQ0EsZUFBZSxDQUFDLGNBQWM7QUFDNUIsUUFBSSxjQUFjO0FBQ2hCLFlBQU0sSUFBSSxNQUFNLDhCQUE4QjtBQUFBLElBQ2hEO0FBRUEsbUJBQWU7QUFDZix5QkFBcUIsYUFBYSxTQUFTO0FBQzNDLFdBQU87QUFBQSxFQUNUO0FBQ0Y7QUFFQSx3REFBNEIsS0FBSyxPQUFNQyxZQUFVO0FBQy9DLFNBQU8sTUFBTUEsUUFBTyxLQUFLLGFBQWE7QUFDeEMsQ0FBQyxFQUFFLEtBQUssTUFBTTtBQUNaLHVCQUFxQixjQUFjO0FBQ3JDLENBQUMsRUFBRSxNQUFNLENBQUMsVUFBVTtBQUNsQixVQUFRLE1BQU0sb0RBQW9EO0FBQ2xFLFVBQVEsTUFBTSxLQUFLO0FBQ3JCLENBQUM7IiwKICAibmFtZXMiOiBbImltcG9ydF9wYXRoIiwgInRleHQiLCAiY2xpZW50IiwgImxtc3R1ZGlvSG9tZSIsICJpbXBvcnRfc2RrIiwgImltcG9ydF9wcm9taXNlcyIsICJvcyIsICJpbXBvcnRfcGF0aCIsICJyZXNvbHZlIiwgImN1cnJlbnRXb3JraW5nRGlyZWN0b3J5IiwgImNvbnRlbnQiLCAiaW5mb1BhdGgiLCAic3RhdGUiLCAicmVzdWx0IiwgImNob3NlblN0cmF0ZWd5IiwgImltcG9ydF9zZGsiLCAiaW1wb3J0X3Byb21pc2VzIiwgImltcG9ydF9wYXRoIiwgImltcG9ydF9zZGsiLCAidG9vbHNQcm92aWRlciIsICJtb2R1bGUiXQp9Cg==
