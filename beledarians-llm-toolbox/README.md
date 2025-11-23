# Beledarian's LM Studio Tools

This project is a plugin for [LM Studio](https://lmstudio.ai/) that provides a rich set of tools to a large language model. It allows the LLM to interact with your local file system, execute code, access the internet, and more. This empowers the LLM to perform complex tasks like code generation, project scaffolding, and web research.

## Features

- **File System Access:** Create, read, update, delete, and manage files and directories.
- **Code Execution:** Run JavaScript, Python, and shell commands in a sandboxed environment.
- **Web Access:** Search the web with DuckDuckGo, fetch webpage content, and even render pages with a headless browser.
- **Safety First:** Configurable safety levels for code execution to prevent accidental damage.
- **Clipboard Integration:** Read from and write to the system clipboard.
- **System Information:** Access information about your operating system, CPU, and memory.
- **And much more!** See the full list of tools below.

## Requirements

- [Node.js](https://nodejs.org/)
- [LM Studio](https://lmstudio.ai/)

## Installation & Usage

This plugin is designed to be run from your local machine in development mode within LM Studio.

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd beledarians-lm-studio-tools
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run in development mode:**
    From within the project directory, run the following command:
    ```bash
    lms dev
    ```
    This will start the plugin in development mode. LM Studio should automatically pick it up. Any changes you make to the source code will cause the plugin to automatically reload.

## Configuration

This plugin comes with a set of configuration options to customize its behavior. You can access these settings in the plugin's configuration panel in LM Studio.

- **Retrieval Limit:** The maximum number of chunks to return when retrieval is triggered.
- **Retrieval Affinity Threshold:** The minimum similarity score for a chunk to be considered relevant.
- **Code Execution Safety Level:** Determines the safety level for executing code. Can be `secure` (no execution), `ask` (prompt for confirmation), or `unsafe` (execute without confirmation).
- **And more:** There are granular safety levels for JavaScript, Python, and terminal commands.

## Available Tools

This plugin provides the following tools to the LLM:

- `change_directory`: Change the current working directory.
- `copy_file`: Copy a file to a new location.
- `delete_path`: Delete a file or directory in the current working directory.
- `duckduckgo_search`: Search the web using DuckDuckGo.
- `execute_command`: Execute a shell command in the current working directory.
- `fetch_web_content`: Fetch the clean, text-based content of a webpage URL.
- `find_files`: Find files recursively in the current directory matching a name pattern.
- `get_file_metadata`: Get metadata (size, dates) for a specific file.
- `get_system_info`: Get information about the system (OS, CPU, Memory).
- `list_directory`: List the files and directories in the current working directory.
- `make_directory`: Create a new directory in the current working directory.
- `move_file`: Move or rename a file or directory.
- `open_file`: Open a file or URL in the system's default application.
- `preview_html`: Render and preview HTML content in the system's default browser.
- `browser_open_page`: Open a webpage in a headless browser (Puppeteer), render it, and return the content.
- `rag_web_content`: Fetch content from a URL, and then use RAG to find and return only the text chunks most relevant to a specific query.
- `read_clipboard`: Read text content from the system clipboard.
- `read_file`: Read the content of a file in the current working directory.
- `run_javascript`: Run a JavaScript code snippet using deno.
- `run_python`: Run a Python code snippet.
- `run_test_command`: Execute a test command (like 'npm test') and return the results.
- `run_in_terminal`: Launch a command in a new, separate interactive terminal window.
- `save_file`: Save content to a specified file in the current working directory.
- `write_clipboard`: Write text content to the system clipboard.

## Development

The source code resides in the `src/` directory. For development purposes, you can run the plugin in development mode using:

```bash
lms dev
```