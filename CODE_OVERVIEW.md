# Codebase Overview & Developer Guide

## Core Architecture

This plugin is designed for **LM Studio** (`@lmstudio/sdk`). It acts as a bridge between the LLM and the user's local file system, enabling autonomous coding, research, and file management.

### 1. Entry Point: `src/index.ts`
- **Function:** `main`
- **Responsibilities:**
    - Registers the Configuration Schema (`pluginConfigSchematics`).
    - Registers the Tools Provider (`toolsProvider`).
    - Registers the Prompt Preprocessor (`promptPreprocessor`).

### 2. The Heavy Lifter: `src/toolsProvider.ts`
This file contains 90% of the plugin's functionality.

#### Key Components:
*   **`validatePath(base, requested)`**: **CRITICAL SECURITY**. Ensures all file operations stay within the `currentWorkingDirectory`. Prevents path traversal attacks.
*   **`tools` Array**: Defines the JSON schema and implementation for every tool exposed to the LLM (`read_file`, `save_file`, etc.).
*   **`consult_secondary_agent`**: The "Brain" of the autonomous features.
    - **`runAgentLoop`**: An internal helper that runs a secondary LLM loop.
    - **Auto-Save**: Logic to detect markdown code blocks in the Sub-Agent's response, infer filenames (regex matching `### filename`), and save them to disk automatically.
    - **Auto-Debug**: If enabled, triggers a *third* loop ("Reviewer") to check generated code.
    - **Tool Parsing**: Robust regexes to parse `to=tool json{...}` formats from varying models (Glaive, standard JSON).

### 3. Context Manager: `src/promptPreprocessor.ts`
- **Responsibilities:**
    - **Delegation Hints**: dynamically injects instructions (e.g., "SYSTEM MANDATE: Delegate coding tasks") into the prompt *every turn*. This ensures the model doesn't forget to use the Sub-Agent.
    - **RAG (Retrieval)**: Handles injecting file content if the user attaches files (logic partially present, some disabled).
    - **Startup Injection**: Reads `startup.md` (if present) to load project context on launch.

### 4. Configuration: `src/config.ts`
- Defines the user-facing settings in LM Studio (checkboxes for "Allow Code Execution", "Debug Mode", etc.).
- Uses `zod` for validation.

### 5. State Persistence: `src/stateManager.ts`
- Saves the `currentWorkingDirectory` to `~/.beledarians-llm-toolbox/.plugin_state.json`.
- Ensures the agent remembers where it's working across restarts.

---

## Development & Debugging

### Common Workflows
1.  **Adding a Tool:**
    - Define it in `src/toolsProvider.ts`.
    - Add validation schema (`z.object(...)`).
    - Implement logic (ensure `validatePath` is used!).
    - Add description to `src/toolsDocumentation.ts` and `TOOLS_USAGE.md`.

2.  **Modifying Sub-Agent Behavior:**
    - Edit `SUB_AGENT_INSTRUCTIONS.md` for prompt engineering.
    - Edit `runAgentLoop` in `src/toolsProvider.ts` for logic changes (e.g., retry limits, output parsing).

3.  **Security Audits:**
    - Always check `validatePath` usage in any new file operation.
    - Verify `allow...` config flags are checked before executing dangerous code (`run_python`).

### Key Regexes (in `toolsProvider.ts`)
*   **Glaive Parsing**: `to=([a-zA-Z0-9_.]+)`
*   **Filename Inference**: `/(?:`|**|###|filename:|file:)[
	\]*?([
	\]*?[\w\-\/\]+\.(?:tsx|ts|...))/i`
*   **Auto-Save Blocks**: `/```\s*(\w+)?\s*([\s\S]*?)```/g` (Relaxed to handle missing newlines).
