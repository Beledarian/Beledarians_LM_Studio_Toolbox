# Beledarian's LM Studio Tools

[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/Beledarian/Beledarians_LM_Studio_Toolbox)

This project is a plugin for [LM Studio](https://lmstudio.ai/) that provides a rich set of tools to a large language model. It acts as a bridge between the LLM and your local environment, enabling autonomous coding, research, and file management.

> [!IMPORTANT]
> **LM Studio does NOT support automatic updates.** If you encounter issues, please try manually updating first by removing the current version and re-downloading from the [plugin website](https://lmstudio.ai/beledarian/beledarians-lm-studio-tools). LM Studio may show an "already installed" tooltip, even if your version is outdated.

## Key Features

### File System Mastery

- **Full Control:** Create, read, update, delete, move, and copy files.
- **Safe & Secure:** All operations are sandboxed to your workspace directory to prevent path traversal attacks.
- **Smart Updates:** Use `replace_text_in_file` to make surgical edits instead of rewriting large files.
- **Batch Processing:** `save_file` supports creating multiple files in one go.
- **Cleanup:** Use `delete_files_by_pattern` to wipe temporary files instantly.


### Recent Updates (v1.3.0)

- **🐙 Native GitHub CLI Tools:** Added `gh_auth`, `gh_create_issue`, `gh_list_issues`, `gh_view_comments`, `gh_create_pr`, `gh_list_prs`, `gh_view_pr_diff`, and `gh_push` for secure, structured GitHub interactions without generic shell commands
- **🌿 Enhanced Git Workflow:** Added `git_add` and `git_checkout` tools to complete the native git toolchain (status, diff, log, commit, add, checkout)
- **⚙️ New Sidebar Toggle:** Added "Allow GitHub CLI Tools" setting to enable/disable `gh_*` tools independently
- **🛡️ Dependency Guards:** All CLI tools now verify installation before execution and provide clear prompts if missing

### Recent Updates (v1.2.0)

- **🛡️ Sub-Agent Tool Validation:** Added early parameter validation with clear error messages to prevent silent failures when sub-agents use wrong parameter names or absolute paths outside workspace
- **🧪 Regression Tests:** Added 14 new tests for tool call validation logic (total: 51 tests)
- **💬 Better Error Feedback:** Sub-agents now receive `TOOL_VALIDATION_ERROR` messages with helpful hints about correct parameter names vs common mistakes

<details>
<summary><strong>v1.1.x & Earlier Changes</strong></summary>

### v1.1.1 (2026-04-08)
**Browser Reliability and Navigation Context**

- **Fixed:** Browser action clicks now include a DOM-level fallback when Puppeteer reports "Node is either not clickable or not an Element"
- **Improved:** Browser click actions now retry native click after ~300ms before falling back
- **Added:** `browser_session_open` returns full page text by default (`include_page_text` defaults to true)
- **Refined:** Multi-step routing guidance now prioritizes `browser_session_open -> browser_session_control -> browser_session_close`

### v1.1.0 (2026-04-08)
**Sub-Agent Compatibility Improvements**

- **Fixed:** Gemma 4 and other models using `{"tool": "...", "parameters": {...}}` format now work correctly with `consult_secondary_agent`
- **Added:** Advanced browser navigation (`browser_session_open`, `browser_session_control`, `browser_session_close`) including in-page fuzzy find and URL-change notices
- **Added:** Structured sub-agent handoff message support (`handoff_message`) for relay/summary workflows
- **Added:** Enable Sub-Agent Debug Logging toggle in plugin settings
- **Added:** Support for direct `{file_name, content}` JSON format from some models

### v1.0.x Previous Updates
- **Smart Context Injection:** `subagent_docs.md` is automatically loaded into the context
- **Enhanced Reporting:** Fixed file path reporting in `consult_secondary_agent`
- **Project Tracking:** Sub-agents enforce creation of `beledarian_info.md`
- **Strict Naming:** Improved instructions for correct file extensions

</details>

[📋 View Full Changelog](#changelog)



> **Encountering issues?** Feel free to [submit them on GitHub](https://github.com/Beledarian/Beledarians_LM_Studio_Toolbox/issues).
>
> **Find this project helpful?** Consider [giving it a ⭐ on GitHub](https://github.com/Beledarian/Beledarians_LM_Studio_Toolbox) or [contributing!](https://github.com/Beledarian/Beledarians_LM_Studio_Toolbox/tree/main?tab=contributing-ov-file) Thank you for using the toolbox.

### Autonomous Agents

- **Secondary Agent:** Delegate complex tasks (coding, summarization) to a second local model/server with support for the main model already used and loaded by LM Studio!
- **Auto-Save:** When the sub-agent generates code, the system **automatically detects and saves it** to your disk. No more copy-pasting!
- **Auto-Debug:** (Optional) Triggers a "Reviewer" agent to analyze generated code and fix bugs automatically before returning the result.
- **Structured Handoff:** Sub-agents can return a dedicated `handoff_message` for the main agent to relay findings/research.
- **Project Context:** Agents can read `beledarian_info.md` to understand your project's history.

### Code Execution

- **Sandboxed:** Run JavaScript (Deno) and Python code.
- **Terminal:** Execute shell commands or open real terminal windows for interactive tasks.

> [!WARNING]
> Enabling shell or terminal execution allows the model to run arbitrary commands on your system. If enabled, the model may be able to modify files and escape the sandbox environment.

### Web & RAG

- **Research:** Search DuckDuckGo, Wikipedia, or fetch raw web content.
- **Advanced Browser Navigation:** Persistent `browser_session_open/control/close` flow for multi-step browsing and automation.
- **Web RAG:** Chat with website content.
- **Local RAG:** Semantic search over your workspace files (`rag_local_files`).

## Requirements

- [Node.js](https://nodejs.org/) (v18+)
- [LM Studio](https://lmstudio.ai/) (v0.3.0+)

> **💡 Tip:** Need persistent long-term memory for your agent?
> Check out my other project: **[Local Memory MCP](https://github.com/Beledarian/mcp-local-memory)** – A privacy-first memory server with knowledge graph support.

## Installation

The plugin can be installed using the following link:

[https://lmstudio.ai/beledarian/beledarians-lm-studio-tools](https://lmstudio.ai/beledarian/beledarians-lm-studio-tools)

Alternatively, you can install it manually for development purposes.

### Development

If you want to contribute to the development of this plugin, you can follow these steps:

1. **Clone the repository:**

    ```bash
    git clone https://github.com/Beledarian/Beledarians_LM_Studio_Toolbox.git
    cd Beledarians_LM_Studio_Toolbox
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

3. **Run in development mode:**
    From within the project directory, run the following command:

    ```bash
    lms dev
    ```

    This will start the plugin in development mode. LM Studio should automatically pick it up. Any changes you make to the source code will cause the plugin to automatically reload.

## Configuration

Access these settings in the LM Studio "Plugins" tab:

- **Enable Secondary Agent:** Unlock the power of sub-agents.
- **Sub-Agent Profiles:** Custom prompts for "Coder", "Reviewer", etc.
- **Auto-Debug Mode:** Automatically review sub-agent code.
- **Sub-Agent Debug Logging:** Toggle detailed sub-agent parsing logs for troubleshooting.
- **Sub-Agent Auto-Save:** Toggle automatic file saving (Default: On).
- **Show Full Code Output:** Toggle whether to display the full code in chat or hide it for brevity (files are still saved).
- **Default Workspace Path:** Set the startup workspace directory used by the plugin.
- **Safety:** Enable/Disable "Allow Code Execution" for Python/JS/Shell.
- **Browser Safety:** Browser automation for sub-agents requires all three toggles: `Allow Browser Control` + `Sub-Agent: Allow Web Search` + `Sub-Agent: Allow Browser Control`.

## Available Tools

### File System

- `list_directory`, `change_directory`, `make_directory`
- `read_file`, `save_file` (supports batch), `delete_path`
- `replace_text_in_file`: Precision editing.
- `delete_files_by_pattern`: Regex-based cleanup.
- `move_file`, `copy_file`, `find_files`, `get_file_metadata`
- `fuzzy_find_local_files`: Levenshtein-based fuzzy file path/name search.

### Agent

- `consult_secondary_agent`: The powerhouse tool. Delegates tasks, handles file creation, and manages sub-agent loops.

### Web

- `web_search` (DuckDuckGo API + HTML fetch/browser fallback), `wikipedia_search`
- `fetch_web_content`, `rag_web_content`
- `browser_session_open`, `browser_session_control`, `browser_session_close` (persistent page automation; preferred for multi-step navigation, with deduped page-text output unless `full_read=true`)
- `browser_open_page` (stateless one-shot Puppeteer read)
- Workaround tip: if selector-based click fails, use an `evaluate` action to click by text, then call with `full_read=true`.

```json
{
  "actions": [
    {
      "type": "evaluate",
      "script": "const link=[...document.querySelectorAll('a')].find(a=>a.textContent?.includes('LICENSE')); if(link) link.click();"
    }
  ],
  "full_read": true
}
```

### Execution

- `run_javascript`, `run_python`
- `execute_command` (Background), `run_in_terminal` (Interactive)

### Utils

- `rag_local_files`: Search your code.
- `save_memory`: Long-term memory.
- `get_system_info`, `read_clipboard`, `write_clipboard`

## Developer Guide

See [CODE_OVERVIEW.md](https://github.com/Beledarian/Beledarians_LM_Studio_Toolbox/blob/main/CODE_OVERVIEW.md) for architectural details.

---

## Changelog

### v1.2.0 (2026-04-30)
**Sub-Agent Tool Validation & Reliability**

- **Added:** Early parameter validation for sub-agent tool calls to prevent silent failures
- **Added:** Clear `TOOL_VALIDATION_ERROR` messages with helpful hints about correct parameter names vs common mistakes (e.g., `file_name` vs `path`)
- **Added:** Workspace path security checks that reject absolute paths outside the workspace directory with explicit error feedback
- **Added:** 14 new regression tests for tool call validation logic (total test count: 51)
- **Improved:** Sub-agents now receive actionable error messages allowing them to self-correct and retry with valid parameters

<details>
<summary><strong>v1.1.x Changes</strong></summary>

### v1.1.1 (2026-04-08)
**Browser Reliability and Navigation Context**

- **Fixed:** Browser action clicks now include a DOM-level fallback when Puppeteer reports "Node is either not clickable or not an Element"
- **Improved:** Browser click actions now retry native click after ~300ms before falling back
- **Added:** `browser_session_open` returns full page text by default (`include_page_text` defaults to true)
- **Refined:** Multi-step routing guidance now prioritizes `browser_session_open -> browser_session_control -> browser_session_close`

### v1.1.0 (2026-04-08)
**Sub-Agent Compatibility Improvements**

- **Fixed:** Gemma 4 and other models using `{"tool": "...", "parameters": {...}}` format now work correctly with `consult_secondary_agent`
- **Added:** Advanced browser navigation (`browser_session_open`, `browser_session_control`, `browser_session_close`) including in-page fuzzy find and URL-change notices
- **Added:** Structured sub-agent handoff message support (`handoff_message`) for relay/summary workflows
- **Added:** Enable Sub-Agent Debug Logging toggle in plugin settings
- **Added:** Support for direct `{file_name, content}` JSON format from some models

</details>

<details>
<summary><strong>v1.0.x & Earlier Changes</strong></summary>

### v1.0.x Previous Updates
- **Smart Context Injection:** `subagent_docs.md` is automatically loaded into the context
- **Enhanced Reporting:** Fixed file path reporting in `consult_secondary_agent`
- **Project Tracking:** Sub-agents enforce creation of `beledarian_info.md`
- **Strict Naming:** Improved instructions for correct file extensions

</details>

