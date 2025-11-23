import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import * as os from "os";

const CONFIG_FILE_NAME = ".plugin_state.json";
const DEFAULT_DIR = join(os.homedir(), ".beledarians-llm-toolbox", "workspace");

export interface PluginState {
  currentWorkingDirectory: string;
}

export async function getPersistedState(): Promise<PluginState> {
  try {
    const statePath = join(os.homedir(), ".beledarians-llm-toolbox", CONFIG_FILE_NAME);
    const content = await readFile(statePath, "utf-8");
    const state = JSON.parse(content);
    return state.currentWorkingDirectory ? state : { currentWorkingDirectory: DEFAULT_DIR };
  } catch (error) {
    return { currentWorkingDirectory: DEFAULT_DIR };
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
