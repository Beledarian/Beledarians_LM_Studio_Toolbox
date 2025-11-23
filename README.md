# Beledarian's LM Studio Tools

[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/Beledarian/Beledarians_LM_Studio_Toolbox)

This project is a plugin for [LM Studio](https://lmstudio.ai/) that provides a rich set of tools to a large language model. It acts as a bridge between the LLM and your local environment, enabling autonomous coding, research, and file management.

## ? Key Features

### ? File System Mastery
- **Full Control:** Create, read, update, delete, move, and copy files.
- **Safe & Secure:** All operations are sandboxed to your workspace directory to prevent path traversal attacks.
- **Smart Updates:** Use `replace_text_in_file` to make surgical edits instead of rewriting large files.
- **Batch Processing:** `save_file` supports creating multiple files in one go.
- **Cleanup:** Use `delete_files_by_pattern` to wipe temporary files instantly.

### ? Autonomous Agents
- **Secondary Agent:** Delegate complex tasks (coding, summarization) to a second local model/server.
- **Auto-Save:** When the sub-agent generates code, the system **automatically detects and saves it** to your disk. No more copy-pasting!
- **Auto-Debug:** (Optional) Triggers a "Reviewer" agent to analyze generated code and fix bugs automatically before returning the result.
- **Project Context:** Agents can read `beledarian_info.md` to understand your project's history.

### ? Code Execution
- **Sandboxed:** Run JavaScript (Deno) and Python code.
- **Terminal:** Execute shell commands or open real terminal windows for interactive tasks.

### ? Web & RAG
- **Research:** Search DuckDuckGo, Wikipedia, or fetch raw web content.
- **Web RAG:** Chat with website content.
- **Local RAG:** Semantic search over your workspace files (`rag_local_files`).

## ? Requirements

- [Node.js](https://nodejs.org/) (v18+)
- [LM Studio](https://lmstudio.ai/) (v0.3.0+)

## ? Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Beledarian/Beledarians_LM_Studio_Toolbox.git
    cd Beledarians_LM_Studio_Toolbox
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run in development mode:**
    ```bash
    lms dev
    ```
    LM Studio will detect the plugin.

## ⚙️ Configuration

Access these settings in the LM Studio "Plugins" tab:

- **Enable Secondary Agent:** Unlock the power of sub-agents.
- **Sub-Agent Profiles:** Custom prompts for "Coder", "Reviewer", etc.
- **Auto-Debug Mode:** Automatically review sub-agent code.
- **Sub-Agent Auto-Save:** Toggle automatic file saving (Default: On).
- **Show Full Code Output:** Toggle whether to display the full code in chat or hide it for brevity (files are still saved).
- **Safety:** Enable/Disable "Allow Code Execution" for Python/JS/Shell.

## ? Available Tools

### File System
- `list_directory`, `change_directory`, `make_directory`
- `read_file`, `save_file` (supports batch), `delete_path`
- `replace_text_in_file`: Precision editing.
- `delete_files_by_pattern`: Regex-based cleanup.
- `move_file`, `copy_file`, `find_files`, `get_file_metadata`

### Agent
- `consult_secondary_agent`: The powerhouse tool. Delegates tasks, handles file creation, and manages sub-agent loops.

### Web
- `duckduckgo_search`, `wikipedia_search`
- `fetch_web_content`, `rag_web_content`
- `browser_open_page` (Puppeteer)

### Execution
- `run_javascript`, `run_python`
- `execute_command` (Background), `run_in_terminal` (Interactive)

### Utils
- `rag_local_files`: Search your code.
- `save_memory`: Long-term memory.
- `get_system_info`, `read_clipboard`, `write_clipboard`

## ? Developer Guide

See [CODE_OVERVIEW.md](./CODE_OVERVIEW.md) for architectural details.