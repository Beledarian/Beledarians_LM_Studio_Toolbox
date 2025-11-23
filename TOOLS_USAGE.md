# Tools Documentation

## Standard Tools

### File System
- **change_directory**: Change the current working directory.
- **list_directory**: List files in the current directory.
- **read_file**: Read content of a file.
- **save_file**: Write content to a file. **Supports batch creation** (pass a `files` array).
- **replace_text_in_file**: Replace a specific string in a text file. Use for small edits.
- **make_directory**: Create a folder (recursive).
- **delete_path**: Delete a file or folder (recursive).
- **delete_files_by_pattern**: Delete multiple files matching a regex (e.g. `^auto_gen_.*`).
- **move_file**: Move or rename.
- **copy_file**: Copy a file.
- **find_files**: Recursive search for files by name pattern.
- **get_file_metadata**: Get size, date, etc.
- **open_file**: Open a file in the OS default app.

### Code Execution (Requires Configuration)
- **run_javascript**: Run JS code (Deno).
- **run_python**: Run Python code.
- **execute_command**: Run shell commands.
- **run_in_terminal**: Open a new terminal window.
- **run_test_command**: Run tests (npm test, etc.).

### Web & RAG
- **duckduckgo_search**: Search the web.
- **fetch_web_content**: Get clean text from a URL.
- **rag_web_content**: Fetch URL and perform RAG search on it.
- **wikipedia_search**: Search Wikipedia.
- **rag_local_files**: Perform RAG search on local files in the workspace.
- **browser_open_page**: Open URL in headless browser (Puppeteer) with screenshot support.
- **preview_html**: Render HTML in default browser.

### Agent & Memory
- **save_memory**: Save facts to `memory.md`.
- **consult_secondary_agent**: Delegate tasks (summarization, coding) to a secondary model/server.
    - **Auto-Save**: Automatically detects and saves code blocks to files.
    - **Auto-Debug**: Can automatically review and fix code if enabled.

### System
- **get_system_info**: OS details.
- **read_clipboard**: Read clipboard text.
- **write_clipboard**: Write to clipboard.