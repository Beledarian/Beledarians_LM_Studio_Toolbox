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
}

function resolveWorkspaceDirectory(configuredWorkspacePath?: string): string {
  const raw = (configuredWorkspacePath ?? "").trim();
  if (!raw) return DEFAULT_DIR;

  // Support Windows-style env vars in config values (e.g. %USERPROFILE%\projects\workspace)
  const expanded = raw.replace(/%([^%]+)%/g, (_match, varName: string) => process.env[varName] ?? `%${varName}%`);
  return isAbsolute(expanded) ? expanded : resolve(DEFAULT_DIR, expanded);
}

export async function getPersistedState(configuredWorkspacePath?: string): Promise<PluginState> {
  const configuredDirectory = resolveWorkspaceDirectory(configuredWorkspacePath);

  try {
    const statePath = join(os.homedir(), ".beledarians-llm-toolbox", CONFIG_FILE_NAME);
    const content = await readFile(statePath, "utf-8");
    const state = JSON.parse(content);
    return {
      // configuredDirectory is a startup default/fallback, not a forced override
      currentWorkingDirectory: state.currentWorkingDirectory ?? configuredDirectory,
      messageCount: state.messageCount ?? 0,
      dontAskToCompress: state.dontAskToCompress ?? false,
      subAgentDocsInjected: state.subAgentDocsInjected ?? false,
    };
  } catch (error) {
    return {
      currentWorkingDirectory: configuredDirectory,
      messageCount: 0,
      dontAskToCompress: false,
      subAgentDocsInjected: false,
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
