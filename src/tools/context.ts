import type { LMStudioClient } from "@lmstudio/sdk";
import type { PluginState } from "../stateManager";
import type { Browser, Page } from "puppeteer";

export interface BrowserSession {
  browser: Browser;
  page: Page;
  currentUrl: string;
}

/**
 * Mutable shared context passed to every tool-module factory.
 *
 * IMPORTANT: Always access `ctx.cwd` and `ctx.browserSession` as
 * object properties — never destructure them — so that mutations
 * made by one module (e.g. change_directory, browser_session_open)
 * are immediately visible to every other module.
 */
export interface ToolContext {
  /** Current working directory. Mutated by change_directory. */
  cwd: string;
  /** Active Puppeteer session. Mutated by browser tools. */
  browserSession: BrowserSession | null;
  fullState: PluginState;
  client: LMStudioClient;
  /** Raw config object returned by ctl.getPluginConfig(). */
  pluginConfig: any;

  // --- Resolved permissions (derived from pluginConfig at startup) ---
  allowJavascript: boolean;
  allowPython: boolean;
  allowTerminal: boolean;
  allowShell: boolean;
  allowBrowserControl: boolean;
  enableMemory: boolean;
  enableWikipedia: boolean;
  enableLocalRag: boolean;
  enableSecondary: boolean;
  allowGit: boolean;
  allowDb: boolean;
  allowNotify: boolean;
  allowGitHubTools: boolean;
  embeddingModelName: string;
}
