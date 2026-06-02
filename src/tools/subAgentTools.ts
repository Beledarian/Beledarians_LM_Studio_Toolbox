import { tool, type Tool } from "@lmstudio/sdk";
import { z } from "zod";
import { rm, writeFile, readdir, readFile, stat, mkdir, appendFile } from "fs/promises";
import { join, isAbsolute, dirname, relative } from "path";
import type { ToolContext } from "./context";
import { validatePath, extractLikelyFilePath, createSafeToolImplementation } from "./helpers";
import { rankFuzzyMatches } from "../fuzzySearch";
import { extractHandoffMessage } from "../handoffMessage";
import { parseSubAgentResponseMessage, type ParsedToolCall } from "../subAgentToolCallParser";
import { validateToolCall } from "../toolCallValidator";
import { executeBrowserActions } from "../browserActions";
import { runPythonImpl } from "./codeTools";

const MAX_SUB_AGENT_OUTPUT_CHARS = 30_000;

export function createSubAgentTools(ctx: ToolContext): Tool[] {
  if (!ctx.enableSecondary) return [];

  return [tool({
    name: "consult_secondary_agent",
    description: "Delegate a task to a secondary agent. IMPORTANT: If the task is 'coding' or 'writing files', the secondary agent will AUTOMATICALLY CREATE AND SAVE the files to the disk. You do NOT need to save them yourself. The tool returns a list of generated files. Trust this list.",
    parameters: {
      task: z.string(),
      agent_role: z.string().optional().describe("Key from 'Sub-Agent Profiles' config (e.g., 'coder'). Default: 'general'."),
      context: z.string().optional().describe("Additional context or data for the agent."),
      allow_tools: z.boolean().optional().describe("If true, the secondary agent can use tools like Web Search, File System, and Code Execution. Default: false."),
    },
    implementation: createSafeToolImplementation(
      async ({ task, agent_role = "general", context = "", allow_tools = false }) => {
        // Resolve config
        let endpoint: string = ctx.pluginConfig.get("secondaryAgentEndpoint");
        let modelId: string = ctx.pluginConfig.get("secondaryModelId");
        if (ctx.pluginConfig.get("useMainModelForSubAgent")) {
          endpoint = "http://localhost:1234/v1";
          modelId = "local-model";
        }

        const subAgentProfilesStr: string = ctx.pluginConfig.get("subAgentProfiles");
        const debugMode: boolean = ctx.pluginConfig.get("enableDebugMode");
        const subAgentDebugLogging: boolean = ctx.pluginConfig.get("enableSubAgentDebugLogging");
        const autoSave: boolean = ctx.pluginConfig.get("subAgentAutoSave");
        const showFullCode: boolean = ctx.pluginConfig.get("showFullCodeOutput");
        const allowFileSystem: boolean = ctx.pluginConfig.get("subAgentAllowFileSystem");
        const allowWeb: boolean = ctx.pluginConfig.get("subAgentAllowWeb");
        const allowCode: boolean = ctx.pluginConfig.get("subAgentAllowCode");
        const allowSubAgentBrowserControl: boolean = ctx.pluginConfig.get("subAgentAllowBrowserControl");

        // ── Agent loop ─────────────────────────────────────────────────────────

        const runAgentLoop = async (
          role: string,
          taskPrompt: string,
          contextData: string,
          loopLimit = 8,
          forceTools = false,
          cwd: string,
        ) => {
          let currentSystemPrompt = "You are a helpful assistant.";

          try {
            const instructions = await readFile(join(cwd, "SUB_AGENT_INSTRUCTIONS.md"), "utf-8");
            if (instructions.trim()) currentSystemPrompt = instructions;
          } catch { /* not required */ }

          try {
            const projectInfo = await readFile(join(cwd, "beledarian_info.md"), "utf-8");
            if (projectInfo.trim()) currentSystemPrompt += `\n\n## Current Project Info (beledarian_info.md)\n${projectInfo}`;
          } catch { /* not required */ }

          currentSystemPrompt += `\n\n## Current Workspace\nYour current working directory is:\n\n${cwd}\nAlways assume relative paths are from this directory.`;

          try {
            const profiles = JSON.parse(subAgentProfilesStr);
            if (profiles[role]) {
              currentSystemPrompt += `\n\n## Your Persona\n${profiles[role]}`;
            } else if (role === "reviewer") {
              currentSystemPrompt += `\n\n## Your Persona\nYou are a Senior Code Reviewer. Your job is to analyze code, find bugs, security issues, or logic errors, and FIX them.\n\nIMPORTANT: To fix a file, you MUST use the 'save_file' tool with the complete, corrected content.`;
            }
          } catch { /* invalid JSON in profiles */ }

          let toolsReminder = "";
          const toolsEnabled = allow_tools || forceTools;
          if (toolsEnabled) {
            const allowedTools: string[] = [];
            if (allowFileSystem) allowedTools.push("read_file", "list_directory", "save_file", "replace_text_in_file", "delete_files_by_pattern", "rag_local_files", "fuzzy_find_local_files");
            if (allowWeb) allowedTools.push("wikipedia_search", "web_search", "fetch_web_content", "rag_web_content");
            if (allowWeb && allowSubAgentBrowserControl && ctx.allowBrowserControl) allowedTools.push("browser_session_open", "browser_session_control", "browser_session_close");
            if (allowCode) allowedTools.push("run_python", "run_javascript");

            if (allowedTools.length > 0) {
              const toolsList = allowedTools.join(", ");
              currentSystemPrompt += `\n\n## Allowed Tools\nYou have access to the following tools via JSON output: ${toolsList}.\nFormat tool calls exactly as: {"tool": "tool_name", "args": {"arg_name": "value"}}`;
              toolsReminder = `\n\n[SYSTEM REMINDER: You have access to tools: ${toolsList}. If you need information you don't have, USE A TOOL. Format: {"tool": "tool_name", "args": {...}}]`;
            }
          }

          currentSystemPrompt += `\n\n## Optional Handoff Message\nIf you want the main agent to relay your findings, include either:\n1) [HANDOFF_MESSAGE]...[/HANDOFF_MESSAGE]\nOR\n2) JSON with a \`handoff_message\` field.\n\n## Task Completion & Early Exit\nIf you have successfully completed your task, output 'TASK_COMPLETED'.\nIf you cannot complete the task, output 'TASK_FAILED' to abort early.`;

          const msgList: { role: string; content: string }[] = [
            { role: "system", content: currentSystemPrompt },
            { role: "user", content: `Task: ${taskPrompt}\n\nContext: ${contextData}${toolsReminder}` },
          ];

          let loops = 0;
          let noToolCallCount = 0;
          let executedToolCallCount = 0;
          let finalContent = "";
          const filesModified: string[] = [];
          let handoffMessage = "";

          const suggestedReadPath = allowFileSystem ? extractLikelyFilePath(`${taskPrompt}\n${contextData}`) : null;

          while (loops < loopLimit) {
            try {
              const response = await fetch(`${endpoint}/chat/completions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model: modelId, messages: msgList, temperature: 0.7, stream: false }),
              });

              if (!response.ok) {
                const errorBody = (await response.text().catch(() => "")).replace(/\s+/g, " ").trim().substring(0, 600);
                if (subAgentDebugLogging) console.log(`[Sub-Agent] API error status=${response.status} body=${errorBody}`);
                return { error: `API Error: ${response.status}${errorBody ? ` - ${errorBody}` : ""}`, filesModified };
              }

              const data = await response.json();
              const message = data?.choices?.[0]?.message;
              const parsedMessage = parseSubAgentResponseMessage(message);
              const content = parsedMessage.content;
              let toolCall: ParsedToolCall | null = parsedMessage.toolCall;

              if (subAgentDebugLogging) {
                const rawContent = (typeof message === "string" ? message : JSON.stringify(message)) ?? "";
                console.log(`[Sub-Agent] RAW: ${rawContent.substring(0, 1000)}`);
                console.log(`[Sub-Agent] source=${parsedMessage.toolCallSource} hasToolCall=${Boolean(toolCall)} preview=${content.substring(0, 200)}`);
              }

              finalContent = content;

              // ── No-tools mode: return immediately ─────────────────────────
              if (!toolsEnabled) {
                const extracted = extractHandoffMessage(content);
                const looksLikePureToolCall = extracted.response.trimStart().startsWith("{") && parsedMessage.toolCall !== null && extracted.response.trim().length < 500;
                const safeResponse = looksLikePureToolCall
                  ? "[Sub-agent did not produce a prose response. It attempted a tool call but tools are disabled for this invocation.]"
                  : extracted.response;
                return { response: safeResponse, filesModified, handoff_message: extracted.handoffMessage };
              }

              // ── Refusal detection ──────────────────────────────────────────
              const trimmed = content.trim();
              if (!toolCall && trimmed) {
                const refusalKeywords = ["i cannot browse", "i don't have access", "i can't access", "unable to browse", "real-time news", "no internet access", "as an ai", "i do not have the ability", "cannot access the internet"];
                if (refusalKeywords.some(kw => trimmed.toLowerCase().includes(kw))) {
                  msgList.push({ role: "assistant", content });
                  msgList.push({ role: "system", content: "SYSTEM ERROR: You HAVE access to tools. USE THEM." });
                  loops++;
                  continue;
                }
              }

              // ── Tool call handling ─────────────────────────────────────────
              if (toolCall?.tool) {
                noToolCallCount = 0;
                executedToolCallCount++;
                msgList.push({ role: "assistant", content });

                let toolResult = "";
                const args = toolCall.args || {};
                const validationError = validateToolCall(toolCall.tool, args);

                if (validationError) {
                  toolResult = `TOOL_VALIDATION_ERROR: ${validationError}`;
                } else {
                  try {
                    // File system tools
                    if (allowFileSystem) {
                      if (toolCall.tool === "read_file" && args.file_name) {
                        const fpath = validatePath(cwd, args.file_name);
                        const readContent = await readFile(fpath, "utf-8");
                        toolResult = readContent.length > MAX_SUB_AGENT_OUTPUT_CHARS
                          ? `${readContent.substring(0, MAX_SUB_AGENT_OUTPUT_CHARS)}\n... (truncated)`
                          : readContent;
                      } else if (toolCall.tool === "list_directory") {
                        toolResult = JSON.stringify(await readdir(cwd));
                      } else if (toolCall.tool === "save_file") {
                        if (Array.isArray(args.files)) {
                          const savedList: string[] = [];
                          for (const fileObj of args.files) {
                            const fName = fileObj.file_name || fileObj.name || fileObj.path;
                            const fContent = fileObj.content || fileObj.data;
                            if (fName && fContent) {
                              const fpath = validatePath(cwd, fName);
                              await mkdir(dirname(fpath), { recursive: true });
                              await writeFile(fpath, fContent, "utf-8");
                              filesModified.push(fName);
                              savedList.push(fName);
                            }
                          }
                          toolResult = savedList.length > 0 ? `Success: Saved ${savedList.length} files: ${savedList.join(", ")}` : "Error: No valid files found in batch.";
                        } else {
                          const fileName = args.file_name || args.name || args.path;
                          const fileContent = args.content || args.data;
                          if (fileName && fileContent) {
                            const fpath = validatePath(cwd, fileName);
                            await mkdir(dirname(fpath), { recursive: true });
                            await writeFile(fpath, fileContent, "utf-8");
                            filesModified.push(fileName);
                            toolResult = `Success: File saved to ${fpath}`;
                          } else {
                            toolResult = "Error: Missing 'file_name' (or 'name', 'path') or 'content' (or 'data') arguments.";
                          }
                        }
                      } else if (toolCall.tool === "replace_text_in_file" && args.file_name && args.old_string && args.new_string) {
                        const fpath = validatePath(cwd, args.file_name);
                        const fc = await readFile(fpath, "utf-8");
                        if (!fc.includes(args.old_string)) {
                          toolResult = "Error: 'old_string' not found exactly.";
                        } else {
                          const count = fc.split(args.old_string).length - 1;
                          if (count > 1) {
                            toolResult = `Error: Found ${count} occurrences. Be more specific.`;
                          } else {
                            await writeFile(fpath, fc.replace(args.old_string, args.new_string), "utf-8");
                            filesModified.push(args.file_name);
                            toolResult = "Success: Text replaced.";
                          }
                        }
                      } else if (toolCall.tool === "delete_files_by_pattern" && args.pattern) {
                        if (args.pattern.length > 100) throw new Error("Pattern too complex");
                        const regex = new RegExp(args.pattern);
                        const start = Date.now();
                        regex.test("safe_test_string_for_redos_check_1234567890");
                        if (Date.now() - start > 100) throw new Error("Pattern too complex/slow");
                        const files = await readdir(cwd);
                        const deleted: string[] = [];
                        for (const file of files) {
                          if (regex.test(file)) { await rm(validatePath(cwd, file), { force: true }); deleted.push(file); }
                        }
                        toolResult = `Deleted ${deleted.length} files: ${deleted.join(", ")}`;
                      } else if (toolCall.tool === "fuzzy_find_local_files" && args.query) {
                        const targetDir = validatePath(cwd, args?.path || ".");
                        const maxResults = Math.min(Math.max(Number(args?.max_results ?? 5), 1), 20);
                        const entries = await readdir(targetDir, { recursive: true, withFileTypes: true });
                        const files = entries
                          .filter(e => e.isFile())
                          .map(e => relative(targetDir, join((e as any).parentPath ?? (e as any).path, e.name)).replace(/\\/g, "/"));
                        toolResult = JSON.stringify(rankFuzzyMatches(args.query, files, maxResults).map(item => ({ path: item.value, score: item.score })));
                      } else if (toolCall.tool === "rag_local_files" && args.query) {
                        if (!ctx.client) {
                          toolResult = "Error: LM Studio client unavailable for RAG.";
                        } else {
                          const targetDir = validatePath(cwd, args.path || ".");
                          const filePattern: string = args.file_pattern || "";
                          const entries = await readdir(targetDir, { recursive: true, withFileTypes: true });
                          const textFiles = entries.filter(e =>
                            e.isFile() && !e.name.match(/\.(png|jpg|jpeg|gif|ico|exe|dll|bin)$/i) &&
                            (!filePattern || e.name.includes(filePattern) || join((e as any).parentPath ?? (e as any).path, e.name).includes(filePattern))
                          ).slice(0, 50);

                          const { cosineSimilarity } = await import("./helpers");
                          const embeddingModel = await ctx.client.embedding.model(ctx.embeddingModelName);
                          const [queryEmbedding] = await embeddingModel.embed([args.query]);
                          const allChunks: { chunk: string; score: number; file: string }[] = [];

                          for (const file of textFiles) {
                            try {
                              const fullPath = join((file as any).parentPath ?? (file as any).path, file.name);
                              const content = await readFile(fullPath, "utf-8");
                              const chunks = content.split(/\n\s*\n/).filter(c => c.trim().length > 20);
                              if (!chunks.length) continue;
                              const chunkEmbeddings = await embeddingModel.embed(chunks);
                              chunks.forEach((chunk, i) => {
                                const score = cosineSimilarity(queryEmbedding.embedding, chunkEmbeddings[i].embedding);
                                if (score > 0.4) allChunks.push({ chunk, score, file: file.name });
                              });
                            } catch { /* skip unreadable files */ }
                          }

                          allChunks.sort((a, b) => b.score - a.score);
                          toolResult = JSON.stringify(allChunks.slice(0, 10).map(c => ({
                            file: c.file, score: c.score.toFixed(3), content: c.chunk,
                          })));
                        }
                      }
                    }

                    // Web tools
                    if (allowWeb && !toolResult) {
                      if (toolCall.tool === "wikipedia_search") {
                        const lang = args.lang || "en";
                        const q = args.query || "";
                        const searchData = await (await fetch(`https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&format=json`)).json();
                        if (searchData.query?.search?.length) {
                          const item = searchData.query.search[0];
                          const pageData = await (await fetch(`https://${lang}.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&pageids=${item.pageid}&format=json`)).json();
                          const page = pageData.query.pages[item.pageid];
                          toolResult = page.extract.substring(0, 3000);
                        } else {
                          toolResult = "No Wikipedia articles found.";
                        }
                      } else if (toolCall.tool === "web_search" || toolCall.tool === "duckduckgo_search") {
                        const { search, SafeSearchType } = await import("duck-duck-scrape");
                        const r = await search(args.query, { safeSearch: SafeSearchType.OFF });
                        toolResult = JSON.stringify(r.results.slice(0, 3));
                      } else if (toolCall.tool === "fetch_web_content" && args.url) {
                        if (!args.url.startsWith("http://") && !args.url.startsWith("https://")) {
                          toolResult = "Error: URL must start with http:// or https://";
                        } else {
                          const res = await fetch(args.url);
                          toolResult = (await res.text()).substring(0, 5000);
                        }
                      } else if (allowSubAgentBrowserControl && ctx.allowBrowserControl && toolCall.tool === "browser_session_open" && args.url) {
                        if (ctx.browserSession) { await ctx.browserSession.browser.close().catch(() => {}); ctx.browserSession = null; }
                        const puppeteer = await import("puppeteer");
                        const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
                        const page = await browser.newPage();
                        await page.goto(args.url, { waitUntil: "networkidle0", timeout: 30000 });
                        if (args.wait_for_selector) await page.waitForSelector(args.wait_for_selector, { timeout: 15000 });
                        ctx.browserSession = { browser, page, currentUrl: page.url() };
                        const pageText = args.include_page_text !== false ? await page.evaluate(() => (document.body as HTMLElement).innerText || "") : undefined;
                        toolResult = JSON.stringify({ session_active: true, url: page.url(), title: await page.title(), text_content: pageText, text_length: pageText ? pageText.length : 0 });
                      } else if (allowSubAgentBrowserControl && ctx.allowBrowserControl && toolCall.tool === "browser_session_control") {
                        if (!ctx.browserSession) {
                          toolResult = "Error: No active browser session.";
                        } else {
                          const beforeUrl = ctx.browserSession.page.url();
                          const actionLog = await executeBrowserActions(ctx.browserSession.page, args.actions || []);
                          const afterUrl = ctx.browserSession.page.url();
                          const urlChanged = beforeUrl !== afterUrl;
                          ctx.browserSession.currentUrl = afterUrl;

                          const output: Record<string, unknown> = { session_active: true, actions_executed: actionLog, url: afterUrl, url_changed: urlChanged };
                          if (args.read_page !== false) {
                            output.title = await ctx.browserSession.page.title();
                            if (urlChanged || args.full_read) {
                              const textContent = await ctx.browserSession.page.evaluate(() => (document.body as HTMLElement).innerText || "");
                              output.text_content = textContent;
                            } else {
                              output.note = "Full page text omitted (URL unchanged). Set full_read=true to force full output.";
                            }
                          }
                          if (args.screenshot_path) {
                            await ctx.browserSession.page.screenshot({ path: validatePath(cwd, args.screenshot_path), fullPage: !!args.full_page_screenshot });
                            output.screenshot_saved = true;
                          }
                          toolResult = JSON.stringify(output);
                        }
                      } else if (allowSubAgentBrowserControl && ctx.allowBrowserControl && toolCall.tool === "browser_session_close") {
                        if (ctx.browserSession) { await ctx.browserSession.browser.close().catch(() => {}); ctx.browserSession = null; }
                        toolResult = JSON.stringify({ session_active: false, message: "Browser session closed." });
                      }
                    }

                    // Code tools
                    if (allowCode && !toolResult) {
                      if (toolCall.tool === "run_python" && args.python) {
                        const res = await runPythonImpl({ python: args.python, cwd });
                        toolResult = res.stderr ? `Error: ${res.stderr}` : res.stdout;
                      }
                    }

                    if (!toolResult) toolResult = "Error: Tool not found or not allowed.";
                  } catch (err: any) {
                    toolResult = `Error: ${err.message}`;
                  }
                }

                msgList.push({ role: "user", content: `Tool Output: ${toolResult}` });
                loops++;

              } else {
                // ── No tool call ───────────────────────────────────────────────
                const shouldAutoFallbackRead =
                  toolsEnabled && allowFileSystem &&
                  executedToolCallCount === 0 && noToolCallCount === 0 &&
                  typeof suggestedReadPath === "string" && suggestedReadPath.length > 0;

                if (shouldAutoFallbackRead) {
                  try {
                    const autoReadPath = validatePath(cwd, suggestedReadPath!);
                    const autoReadStats = await stat(autoReadPath);
                    if (!autoReadStats.isFile()) throw new Error(`Not a file: ${autoReadPath}`);
                    const autoReadContent = await readFile(autoReadPath, "utf-8");
                    const bounded = autoReadContent.length > 30000 ? `${autoReadContent.substring(0, 30000)}\n... (truncated)` : autoReadContent;
                    if (trimmed.length > 0) msgList.push({ role: "assistant", content });
                    msgList.push({ role: "user", content: `Tool Output: AUTO_FALLBACK read_file(${suggestedReadPath})\n${bounded}` });
                    executedToolCallCount++;
                    loops++;
                    continue;
                  } catch {
                    try {
                      const autoFiles = (await readdir(cwd)).slice(0, 200);
                      if (trimmed.length > 0) msgList.push({ role: "assistant", content });
                      msgList.push({ role: "user", content: `Tool Output: AUTO_FALLBACK list_directory(.)\n${JSON.stringify(autoFiles)}` });
                      executedToolCallCount++;
                      loops++;
                      continue;
                    } catch { /* ignore */ }
                  }
                }

                const planningLikeText = /(?:\bI(?:'ll| will)\b|\blet me\b|\bnext\b|\bfirst\b)/i.test(trimmed);
                const shouldTreatAsFinalResponse = trimmed.length >= 120 && !planningLikeText;
                noToolCallCount++;

                if (content.includes("TASK_COMPLETED") || content.includes("TASK_FAILED") || shouldTreatAsFinalResponse || noToolCallCount >= 3 || loops >= loopLimit - 1) break;

                if (content.trim().length > 0) msgList.push({ role: "assistant", content });

                let reminder = "SYSTEM NOTICE: You did not call a tool. If you are finished, output 'TASK_COMPLETED'. If you cannot complete the task, output 'TASK_FAILED'. If not, USE A TOOL now.";
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
            } catch (err: any) {
              return { error: err.message, filesModified };
            }

            // Prevent unbounded context growth
            if (msgList.length > 20) {
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

          // ── Auto-Save code blocks ──────────────────────────────────────────
          if (autoSave && allowFileSystem && finalContent) {
            const codeBlockRegex = /```\s*(\w+)?\s*([\s\S]*?)```/g;
            const matches = Array.from(finalContent.matchAll(codeBlockRegex));
            const processedFiles = new Set<string>();

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
                        const fpath = validatePath(cwd, fName);
                        await mkdir(dirname(fpath), { recursive: true });
                        await writeFile(fpath, fContent, "utf-8");
                        filesModified.push(fName);
                        processedFiles.add(fName);
                        extractedCount++;
                      }
                    }
                    if (extractedCount > 0) {
                      handledAsBatch = true;
                      finalContent = finalContent.slice(0, index) + `\n[System: Successfully extracted and saved ${extractedCount} files from JSON block.]\n` + finalContent.slice(index + fullBlock.length);
                    }
                  }
                } catch { /* not a batch JSON block */ }
              }

              if (!handledAsBatch && code.trim().length > 50) {
                const lookback = finalContent.substring(Math.max(0, index - 500), index);
                const nameMatch = lookback.match(/(?:`|\*\*|###|filename:|file:)[\s\S]*?([\w\-\/\\.]+\.(?:tsx|ts|jsx|js|html|css|json|md|py|sh|java|rs|go|sql|yaml|yml|c|cpp|h|hpp|txt))/i);
                let fileName = nameMatch ? nameMatch[1].trim() : "";

                if (!fileName) {
                  const firstLine = code.split("\n")[0].trim();
                  const commentMatch = firstLine.match(/^(?:\/\/|#|<!--|;)\s*(?:filename:|file:)?\s*([\w\-\/\\.]+\.(?:tsx|ts|jsx|js|html|css|json|md|py|sh|java|rs|go|sql|yaml|yml|c|cpp|h|hpp|txt))/i);
                  if (commentMatch) fileName = commentMatch[1].trim();
                }

                const isShell = ["bash", "sh", "cmd", "powershell", "console", "zsh", "terminal"].includes(lang);
                if ((isShell && !fileName) || !fileName || processedFiles.has(fileName)) continue;

                try {
                  const fpath = join(cwd, fileName);
                  await mkdir(dirname(fpath), { recursive: true });
                  await writeFile(fpath, code, "utf-8");
                  filesModified.push(fileName);
                  processedFiles.add(fileName);
                  finalContent = finalContent.slice(0, index) + `\n[System: File '${fileName}' created successfully.]\n` + finalContent.slice(index + fullBlock.length);
                } catch (e) {
                  console.error(`Failed to auto-save file ${fileName}:`, e);
                }
              }
            }
          }

          // ── Auto-Update Project Info ───────────────────────────────────────
          if (filesModified.length > 0 && allowFileSystem) {
            const infoPath = join(cwd, "beledarian_info.md");
            const logEntry = `\n- **[${new Date().toISOString()}]** Task: "${taskPrompt.substring(0, 50)}..." | Modified: ${filesModified.join(", ")}`;
            try {
              await appendFile(infoPath, logEntry, "utf-8");
            } catch {
              try { await writeFile(infoPath, `# Project History\n${logEntry}`, "utf-8"); } catch { /* ignore */ }
            }
          }

          return { response: finalContent, filesModified, handoff_message: handoffMessage || undefined };
        };

        // ── Primary agent loop ───────────────────────────────────────────────
        const primaryResult = await runAgentLoop(agent_role, task, context, 8, false, ctx.cwd);
        if (primaryResult.error) return { error: primaryResult.error };

        let finalResponse = primaryResult.response || "";
        let handoffMessage = primaryResult.handoff_message;
        const generatedFiles = [...(primaryResult.filesModified ?? [])];

        // ── Auto-Debug loop ──────────────────────────────────────────────────
        if (debugMode && (primaryResult.filesModified ?? []).length > 0) {
          const filesToCheck = primaryResult.filesModified!.join(", ");
          let debugContext = "Here is the content of the created files:\n";
          for (const f of primaryResult.filesModified!) {
            try { debugContext += `\n--- ${f} ---\n${await readFile(join(ctx.cwd, f), "utf-8")}\n`; } catch { /* ignore */ }
          }
          const debugResult = await runAgentLoop(
            "reviewer",
            `Review the code in these files: ${filesToCheck}. Check for bugs, syntax errors, or logic flaws. If you find any, use 'save_file' to FIX them. If they are correct, confirm it.`,
            debugContext, 5, true, ctx.cwd,
          );

          finalResponse += "\n\n--- Auto-Debug Report ---\n" + (debugResult.response || "Debug pass completed.");
          if ((debugResult.filesModified ?? []).length > 0) {
            finalResponse += `\n(The reviewer fixed these files: ${debugResult.filesModified!.join(", ")})`;
          }
          if (!handoffMessage && debugResult.handoff_message) handoffMessage = debugResult.handoff_message;
        }

        // ── Append file list for main agent ──────────────────────────────────
        if ((primaryResult.filesModified ?? []).length > 0) {
          const fullPaths = primaryResult.filesModified!.map(f => isAbsolute(f) ? f : join(ctx.cwd, f));
          finalResponse += `\n\n[GENERATED_FILES]: ${fullPaths.join(", ")}`;

          if (showFullCode) {
            finalResponse += `\n\n### Generated Code Content:\n`;
            for (const f of primaryResult.filesModified!) {
              try {
                const fpath = isAbsolute(f) ? f : join(ctx.cwd, f);
                const fc = await readFile(fpath, "utf-8");
                finalResponse += `\n**${f}**\n\`\`\`${f.split(".").pop() || "txt"}\n${fc}\n\`\`\`\n`;
              } catch { /* ignore */ }
            }
          }
        }

        if (!showFullCode && (primaryResult.filesModified ?? []).length > 0) {
          finalResponse = finalResponse.replace(/```[\s\S]*?```/g, "\n[System: Code Block Hidden for Brevity. The code has been handled/saved by the sub-agent. Do NOT request it again. Proceed.]\n");
        }

        return { response: finalResponse, generated_files: generatedFiles, handoff_message: handoffMessage };
      },
      ctx.enableSecondary,
      "consult_secondary_agent"
    ),
  })];
}
