import { type Tool, type ToolsProvider } from "@lmstudio/sdk";
import type { LMStudioClient } from "@lmstudio/sdk";
import { pluginConfigSchematics } from "./config";
import { getPersistedState, savePersistedState, ensureWorkspaceExists } from "./stateManager";
import type { ToolContext } from "./tools/context";

import { createFileTools } from "./tools/fileTools";
import { createCodeTools } from "./tools/codeTools";
import { createWebTools } from "./tools/webTools";
import { createBrowserTools } from "./tools/browserTools";
import { createGitTools } from "./tools/gitTools";
import { createGithubTools } from "./tools/githubTools";
import { createMiscTools } from "./tools/miscTools";
import { createMemoryTools } from "./tools/memoryTools";
import { createSubAgentTools } from "./tools/subAgentTools";

let isWorkspaceInitialized = false;

export const toolsProvider: ToolsProvider = async (ctl) => {
  const client = (ctl as any).client as LMStudioClient;
  const pluginConfig = ctl.getPluginConfig(pluginConfigSchematics);
  const defaultWorkspacePath = pluginConfig.get("defaultWorkspacePath");

  const fullState = await getPersistedState(defaultWorkspacePath);

  // ── Master permission override ───────────────────────────────────────────────
  const allowAllCode = pluginConfig.get("allowAllCode");
  const ctx: ToolContext = {
    cwd: fullState.currentWorkingDirectory,
    browserSession: null,
    fullState,
    client,
    pluginConfig,
    allowJavascript: allowAllCode || pluginConfig.get("allowJavascriptExecution"),
    allowPython:     allowAllCode || pluginConfig.get("allowPythonExecution"),
    allowTerminal:   allowAllCode || pluginConfig.get("allowTerminalExecution"),
    allowShell:      allowAllCode || pluginConfig.get("allowShellCommandExecution"),
    allowBrowserControl: allowAllCode || pluginConfig.get("allowBrowserControl"),
    enableMemory:    pluginConfig.get("enableMemory"),
    enableWikipedia: pluginConfig.get("enableWikipediaTool"),
    enableLocalRag:  pluginConfig.get("enableLocalRag"),
    enableSecondary: pluginConfig.get("enableSecondaryAgent"),
    allowGit:        pluginConfig.get("allowGitOperations"),
    allowDb:         pluginConfig.get("allowDatabaseInspection"),
    allowNotify:     pluginConfig.get("allowSystemNotifications"),
    allowGitHubTools: pluginConfig.get("allowGitHubTools"),
    embeddingModelName: pluginConfig.get("embeddingModel"),
  };

  // ── Workspace initialisation (idempotent) ────────────────────────────────────
  if (!isWorkspaceInitialized) {
    await ensureWorkspaceExists(ctx.cwd);
    fullState.currentWorkingDirectory = ctx.cwd;
    await savePersistedState(fullState);
    console.log(`Working directory set to: ${ctx.cwd}`);
    isWorkspaceInitialized = true;
  }

  // ── Persist UI language override ─────────────────────────────────────────────
  const uiLanguageOverride = pluginConfig.get("uiLanguageOverride");
  if (fullState.uiLanguageOverride !== uiLanguageOverride) {
    fullState.uiLanguageOverride = uiLanguageOverride;
    await savePersistedState(fullState);
    console.log(`[i18n] uiLanguageOverride persisted: "${uiLanguageOverride}". Restart plugin to apply.`);
  }

  // ── Assemble tools from all modules ─────────────────────────────────────────
  const allTools: Tool[] = [
    ...createFileTools(ctx),
    ...createCodeTools(ctx),
    ...createWebTools(ctx),
    ...createBrowserTools(ctx),
    ...createGitTools(ctx),
    ...createGithubTools(ctx),
    ...createMiscTools(ctx),
    ...createMemoryTools(ctx),
    ...createSubAgentTools(ctx),
  ];

  // ── Sort: casual/general-purpose tools first, advanced/developer tools second ─
  const casualTools = new Set([
    "change_directory", "list_directory", "read_file", "read_file_range",
    "save_file", "move_file", "copy_file",
    "delete_path", "delete_files_by_pattern", "make_directory",
    "find_files", "fuzzy_find_local_files", "get_file_metadata",
    "search_in_file", "search_directory",
    "replace_text_in_file", "multi_replace_text",
    "insert_at_line", "append_file", "delete_lines_in_file",
    "web_search", "fetch_web_content", "wikipedia_search",
    "rag_web_content", "rag_local_files",
    "get_system_info", "read_clipboard", "write_clipboard",
    "open_file", "preview_html", "read_document",
    "save_memory", "list_memories", "search_memories", "update_memory", "delete_memory",
    "send_notification",
    "git_pull", "git_push",
  ]);

  allTools.sort((a, b) => {
    const aCasual = casualTools.has(a.name);
    const bCasual = casualTools.has(b.name);
    if (aCasual && !bCasual) return -1;
    if (!aCasual && bCasual) return 1;
    return a.name.localeCompare(b.name);
  });

  return allTools;
};
