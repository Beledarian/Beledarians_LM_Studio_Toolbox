import { readFile, writeFile, mkdir } from "fs/promises";
import { join, isAbsolute, resolve } from "path";
import * as os from "os";

const CONFIG_FILE_NAME = ".plugin_state.json";
const DEFAULT_DIR = join(os.homedir(), ".beledarians-llm-toolbox", "workspace");

export interface PluginState {
  currentWorkingDirectory: string;
  messageCount: number;
  dontAskToCompress: boolean;
  subAgentDocsInjected: boolean;
  /** Locale ID to use for Layer 1 (Config UI) on next plugin restart. "auto" = OS detection. */
  uiLanguageOverride: string;
  /** Last configured defaultWorkspacePath from plugin settings, to detect changes. */
  lastConfiguredWorkspacePath?: string;
}

// ponytail: dead-simple ~ and env expansion, no extra dependencies
export function expandPath(inputPath: string): string {
  const raw = (inputPath ?? "").trim();
  if (!raw) return "";

  const withEnv = raw
    .replace(/%([^%]+)%/g, (_match, varName: string) => process.env[varName] ?? `%${varName}%`)
    .replace(/\$\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g, (_match, varName: string) => process.env[varName] ?? `\${${varName}}`)
    .replace(/\$([a-zA-Z_][a-zA-Z0-9_]*)/g, (_match, varName: string) => process.env[varName] ?? `$${varName}`);

  if (withEnv === "~") return os.homedir();
  if (withEnv.startsWith("~/") || withEnv.startsWith("~\\")) {
    return join(os.homedir(), withEnv.slice(2));
  }
  return withEnv;
}

// ponytail: pure helper for CWD resolution, config change detection, and ~ self-healing
export function resolveActiveCwd(
  persistedCwd: string | undefined,
  lastConfigured: string | undefined,
  rawConfigured: string,
  configuredDirectory: string
): string {
  // Config changed if lastConfigured was tracked and differs from current rawConfigured (even if cleared)
  const configChanged = Boolean(lastConfigured !== undefined && lastConfigured !== rawConfigured);
  // Match ~ as a standalone segment either at start of path or after a path separator
  const isBogusPath = Boolean(persistedCwd && /(?:^|[\\/])\~(?=[\\/]|$)/.test(persistedCwd));
  return (configChanged || isBogusPath) ? configuredDirectory : (persistedCwd ?? configuredDirectory);
}

export function resolveWorkspaceDirectory(configuredWorkspacePath?: string): string {
  const expanded = expandPath(configuredWorkspacePath ?? "");
  if (!expanded) return DEFAULT_DIR;
  return isAbsolute(expanded) ? resolve(expanded) : resolve(DEFAULT_DIR, expanded);
}

export async function getPersistedState(configuredWorkspacePath?: string): Promise<PluginState> {
  const rawConfigured = (configuredWorkspacePath ?? "").trim();
  const configuredDirectory = resolveWorkspaceDirectory(rawConfigured);

  try {
    const statePath = join(os.homedir(), ".beledarians-llm-toolbox", CONFIG_FILE_NAME);
    const content = await readFile(statePath, "utf-8");
    const state = JSON.parse(content);

    const currentWorkingDirectory = resolveActiveCwd(
      state.currentWorkingDirectory,
      state.lastConfiguredWorkspacePath,
      rawConfigured,
      configuredDirectory
    );

    return {
      currentWorkingDirectory,
      messageCount: state.messageCount ?? 0,
      dontAskToCompress: state.dontAskToCompress ?? false,
      subAgentDocsInjected: state.subAgentDocsInjected ?? false,
      uiLanguageOverride: state.uiLanguageOverride ?? "auto",
      lastConfiguredWorkspacePath: rawConfigured,
    };
  } catch (error) {
    return {
      currentWorkingDirectory: configuredDirectory,
      messageCount: 0,
      dontAskToCompress: false,
      subAgentDocsInjected: false,
      uiLanguageOverride: "auto",
      lastConfiguredWorkspacePath: rawConfigured,
    };
  }
}

export async function savePersistedState(state: PluginState) {
  try {
    const statePath = join(os.homedir(), ".beledarians-llm-toolbox", CONFIG_FILE_NAME);
    const dir = join(os.homedir(), ".beledarians-llm-toolbox");
    await mkdir(dir, { recursive: true });
    await writeFile(statePath, JSON.stringify(state, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to save plugin state:", error);
  }
}

export async function ensureWorkspaceExists(path: string) {
  try {
    await mkdir(path, { recursive: true });
  } catch (error) {
    console.error(`Failed to create/access directory ${path}`, error);
  }
}
