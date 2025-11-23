import { text, tool, type Tool, type ToolsProvider, type LmsClient } from "@lmstudio/sdk";
import { spawn } from "child_process";
import { rm, writeFile, readdir, readFile, stat, mkdir, rename, copyFile } from "fs/promises";
import * as os from "os";
import { join, resolve } from "path";
import { z } from "zod";
import { pluginConfigSchematics } from "./config";
import { findLMStudioHome } from "./findLMStudioHome";

const createSafeToolImplementation = <TParameters, TReturn>(
  originalImplementation: (params: TParameters) => Promise<TReturn>,
  safetyLevel: "secure" | "ask" | "unsafe",
  toolName: string,
  client: LmsClient, // Pass client to use client.confirm
  ctl: ToolsProviderController // Pass ctl for debug messages
) => async (params: TParameters): Promise<TReturn> => {
  if (safetyLevel === "secure") {
    throw new Error(`Tool '${toolName}' is disabled due to safety settings. Please ask the user to change the safety level to 'ask' or 'unsafe' in the plugin settings.`);
  }
  if (safetyLevel === "ask") {
    const confirmed = await client.confirm(`Are you sure you want to run the tool '${toolName}'?`);
    if (!confirmed) {
      ctl.debug(`Execution of tool '${toolName}' was cancelled by the user.`);
      throw new Error(`Execution cancelled by user.`);
    }
    ctl.debug(`User confirmed execution of tool '${toolName}'.`);
  }
  // If safetyLevel is "unsafe" or "ask" and confirmed, proceed
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
async function performRagOnText(text: string, query: string, client: LmsClient) {
  // 1. Load embedding model
  const embeddingModel = await client.embedding.model("nomic-ai/nomic-embed-text-v1.5-GGUF");

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
    score: cosineSimilarity(queryEmbedding, chunkEmb),
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

export const toolsProvider = (client: LmsClient): ToolsProvider => async (ctl) => {
  const pluginConfig = ctl.getPluginConfig(pluginConfigSchematics);
  let pythonExecutionSafetyLevel = pluginConfig.get("pythonExecutionSafetyLevel");
  let terminalExecutionSafetyLevel = pluginConfig.get("terminalExecutionSafetyLevel");
  let javascriptExecutionSafetyLevel = pluginConfig.get("javascriptExecutionSafetyLevel");
  let executeCommandSafetyLevel = pluginConfig.get("executeCommandSafetyLevel");
  const allowAllCode = pluginConfig.get("allowAllCode");

  if (allowAllCode) {
    pythonExecutionSafetyLevel = "unsafe";
    terminalExecutionSafetyLevel = "unsafe";
    javascriptExecutionSafetyLevel = "unsafe";
    executeCommandSafetyLevel = "unsafe";
  }

  let currentWorkingDirectory: string = join(os.homedir(), ".beledarians-llm-toolbox", "workspace");
  try {
    await mkdir(currentWorkingDirectory, { recursive: true });
  } catch (error) {
    console.error(`Failed to create/access default directory ${currentWorkingDirectory}, falling back to process.cwd()`, error);
    currentWorkingDirectory = process.cwd();
  }
  console.log(`Initial working directory set to: ${currentWorkingDirectory}`);

  const tools: Tool[] = [];

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
      return {
        previous_directory: resolve(newPath, ".."),
        current_directory: currentWorkingDirectory,
      };
    },
  });
  tools.push(changeDirectoryTool);

  const originalRunJavascriptImplementation = async ({ javascript, timeout_seconds }) => {
      const scriptFileName = `temp_script_${Date.now()}.ts`;
      const scriptFilePath = join(currentWorkingDirectory, scriptFileName);
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

      await rm(scriptFilePath);

      return {
        stdout: stdout.trim(),
        stderr: stderr.trim(),
      };
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
    parameters: { javascript: z.string(), timeout_seconds: z.number().optional() },
    implementation: createSafeToolImplementation(
      originalRunJavascriptImplementation,
      javascriptExecutionSafetyLevel,
      "run_javascript",
      client,
      ctl
    ),
  });
  tools.push(createFileTool);

  const originalRunPythonImplementation = async ({ python, timeout_seconds }) => {
      const scriptFileName = `temp_script_${Date.now()}.py`;
      const scriptFilePath = join(currentWorkingDirectory, scriptFileName);
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

      await rm(scriptFilePath);

      return {
        stdout: stdout.trim(),
        stderr: stderr.trim(),
      };
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
    parameters: { python: z.string(), timeout_seconds: z.number().optional() },
    implementation: createSafeToolImplementation(
      originalRunPythonImplementation,
      pythonExecutionSafetyLevel,
      "run_python",
      client,
      ctl
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
      const filePath = join(currentWorkingDirectory, file_name);
      await writeFile(filePath, content, "utf-8");
      return {
        success: true,
        path: filePath,
      };
    },
  });
  tools.push(saveFileTool);

  const listDirectoryTool = tool({
    name: "list_directory",
    description: "List the files and directories in the current working directory.",
    parameters: {},
    implementation: async () => {
      const files = await readdir(currentWorkingDirectory);
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
      const filePath = join(currentWorkingDirectory, file_name);
      const content = await readFile(filePath, "utf-8");
      return {
        content,
      };
    },
  });
  tools.push(readFileTool);

  const originalExecuteCommandImplementation = async ({ command, input, timeout_seconds }) => {
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
      executeCommandSafetyLevel,
      "execute_command",
      client,
      ctl
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
      const dirPath = join(currentWorkingDirectory, directory_name);
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
      const targetPath = join(currentWorkingDirectory, path);
      await rm(targetPath, { recursive: true, force: true });
      return {
        success: true,
        path: targetPath,
      };
    },
  });
  tools.push(deletePathTool);

  const originalRunInTerminalImplementation = async ({ command }) => {
      if (process.platform === "win32") {
        // Windows: Use 'start' with a title to avoid ambiguity and /D for the directory.
        // The title "Terminal" ensures 'start' doesn't misinterpret the command as a title.
        // /D sets the working directory for the new window.
        const shellCommand = `start "" /D "${currentWorkingDirectory}" cmd.exe /k "${command}"`;
        
        const child = spawn("cmd.exe", ["/c", shellCommand], {
          detached: true,
          stdio: "ignore",
          windowsHide: false, 
        });
        child.unref(); // Allow the parent process to exit independently
      } else {
        // Fallback for Linux/Mac (simple attempt, might need refinement for specific terminals)
        // Trying x-terminal-emulator or open -a Terminal
        const cmd = process.platform === "darwin" 
          ? `open -a Terminal "${currentWorkingDirectory}"` // Mac specific usually just opens the dir
          : `x-terminal-emulator -e "cd '${currentWorkingDirectory}' && ${command}; bash"`;
        
        const child = spawn(process.platform === "darwin" ? "open" : "sh", ["-c", cmd], {
          detached: true,
          stdio: "ignore",
        });
        child.unref();
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
      terminalExecutionSafetyLevel, 
      "run_in_terminal",
      client,
      ctl
    ),
  });
  tools.push(runInTerminalTool);

  const duckDuckGoSearchTool = tool({
    name: "duckduckgo_search",
    description: "Search the web using DuckDuckGo. Returns a list of search results.",
    parameters: {
      query: z.string(),
    },
    implementation: async ({ query }) => {
      try {
        const { search } = await import("duck-duck-scrape");
        const searchResults = await search(query, {
          safeSearch: false,
        });

        if (!searchResults.results || searchResults.results.length === 0) {
          return { results: "No results found." };
        }

        const formattedResults = searchResults.results.map((result: any) => ({
          title: result.title,
          link: result.url,
          snippet: result.description, 
        }));

        return {
          results: formattedResults,
        };
      } catch (error) {
        return {
          error: `Search failed: ${error instanceof Error ? error.message : String(error)}`,
        };
      }
    },
  });
  tools.push(duckDuckGoSearchTool);

  const moveFileTool = tool({
    name: "move_file",
    description: "Move or rename a file or directory.",
    parameters: {
      source: z.string(),
      destination: z.string(),
    },
    implementation: async ({ source, destination }) => {
      const sourcePath = join(currentWorkingDirectory, source);
      const destPath = join(currentWorkingDirectory, destination);
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
      const sourcePath = join(currentWorkingDirectory, source);
      const destPath = join(currentWorkingDirectory, destination);
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
        
        // Cleaning
        text = text.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
        text = text.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
        text = text.replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi, "");
        text = text.replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/gi, "");
        text = text.replace(/<header\b[^>]*>[\s\S]*?<\/header>/gi, "");
        text = text.replace(/<aside\b[^>]*>[\s\S]*?<\/aside>/gi, "");
        text = text.replace(/<\/div>/gi, "\n");
        text = text.replace(/<\/p>/gi, "\n");
        text = text.replace(/<br\s*\/?>/gi, "\n");
        text = text.replace(/<[^>]+>/g, "");
        text = text.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
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

        // 2. Clean content to get main text
        text = text.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
        text = text.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
        text = text.replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi, "");
        text = text.replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/gi, "");
        text = text.replace(/<header\b[^>]*>[\s\S]*?<\/header>/gi, "");
        text = text.replace(/<aside\b[^>]*>[\s\S]*?<\/aside>/gi, "");
        text = text.replace(/<\/div>/gi, "\n");
        text = text.replace(/<\/p>/gi, "\n");
        text = text.replace(/<br\s*\/?>/gi, "\n");
        text = text.replace(/<[^>]+>/g, "");
        text = text.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
        text = text.replace(/[ \t]+/g, ' ').replace(/\n\s*\n/g, "\n\n").trim();

        if (text.length === 0) {
          return { error: "Could not extract any text from the URL." };
        }

        // 3. Perform RAG
        const ragResults = await performRagOnText(text, query, client);

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
        const targetPath = join(currentWorkingDirectory, path);
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

      return new Promise((resolve) => {
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
      });
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

      return new Promise((resolve) => {
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
      });
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
          targetToOpen = resolve(currentWorkingDirectory, target);
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
        const filePath = join(currentWorkingDirectory, name);
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
        try {
            const puppeteer = await import("puppeteer");
            const browser = await puppeteer.launch({ headless: true });
            const page = await browser.newPage();
            try {
                await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
                
                if (wait_for_selector) {
                    try {
                      await page.waitForSelector(wait_for_selector, { timeout: 5000 });
                    } catch (e) {
                       // Ignore timeout
                    }
                }

                const content = await page.content();
                let screenshotSaved = false;
                if (screenshot_path) {
                    const fullPath = join(currentWorkingDirectory, screenshot_path);
                    await page.screenshot({ path: fullPath });
                    screenshotSaved = true;
                }
                
                // Basic cleaning
                let text = content.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
                text = text.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
                text = text.replace(/<[^>]+>/g, " ");
                text = text.replace(/\s+/g, " ").trim();
                const title = await page.title();

                await browser.close();

                return {
                    url,
                    title,
                    text_content: text.substring(0, 10000),
                    screenshot_saved: screenshotSaved ? screenshot_path : undefined
                };
            } catch(err) {
                await browser.close();
                throw err;
            }
        } catch (error) {
             return { error: `Browser Error: ${error instanceof Error ? error.message : String(error)}` };
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

  return tools;
}