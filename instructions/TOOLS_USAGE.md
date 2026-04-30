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
- **fuzzy_find_local_files**: Levenshtein fuzzy search for local file paths/names.
- **get_file_metadata**: Get size, date, etc.
- **open_file**: Open a file in the OS default app.

### Code Execution (Requires Configuration)
- **run_javascript**: Run JS code (Deno).
- **run_python**: Run Python code.
- **execute_command**: Run shell commands.
- **run_in_terminal**: Open a new terminal window.
- **run_test_command**: Run tests (npm test, etc.).


### Git Operations (Requires Configuration)
- **git_status**: Get current git status.
- **git_diff**: Get git diff for repo or specific files.
- **git_commit**: Commit staged changes.
- **git_log**: Get recent commit history.
- **git_add**: Stage specific files or all changes.
- **git_checkout**: Switch to an existing branch or create/switch to a new one.

### GitHub CLI Tools (Requires Configuration & `gh` installed)
- **gh_auth**: Check auth status; opens terminal login window if needed.
- **gh_create_issue** / **gh_create_pr**: Create issues/PRs securely using temp files for long bodies.
- **gh_list_issues** / **gh_list_prs**: List open/closed items with filtering (labels, state).
- **gh_view_comments**: Fetch comment threads for specific issues or PRs.
- **gh_view_pr_diff**: Fetch the diff/patch of a specific pull request.
- **gh_push**: Push local commits to the remote repository.

### Web & RAG
- **web_search**: Search the web with no-key fallback providers (DuckDuckGo API/fetch/browser, Google, Bing).
- **fetch_web_content**: Get clean text from a URL.
- **rag_web_content**: Fetch URL and perform RAG search on it.
- **wikipedia_search**: Search Wikipedia.
- **rag_local_files**: Perform RAG search on local files in the workspace.
- **browser_session_open**: Open a persistent browser session (single active page).
- **browser_session_control**: Run actions, read page, screenshot, and fuzzy-find inside current page (full text on URL change or when `full_read=true`).
- **browser_session_close**: Close the persistent browser session.
- **browser_open_page**: One-shot stateless browser render (do not use for multi-step navigation).
- **Click workaround**: If selector click fails, use an `evaluate` action to locate by text and trigger `.click()`, then request `full_read=true`.
- **preview_html**: Render HTML in default browser.

### Agent & Memory
- **save_memory**: Save facts to `memory.md`.
- **consult_secondary_agent**: Delegate tasks (summarization, coding) to a secondary model/server.
    - **Auto-Save**: Automatically detects and saves code blocks to files.
    - **Auto-Debug**: Can automatically review and fix code if enabled.
    - **Structured Handoff**: Supports optional `handoff_message` payloads for main-agent relay.

### System
- **get_system_info**: OS details.
- **read_clipboard**: Read clipboard text.
- **write_clipboard**: Write to clipboard.
