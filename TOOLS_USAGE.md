# Beledarians LM Studio Tools - Usage Guide

This plugin provides a suite of powerful filesystem and execution tools for local development.

## ? Working Directory
The tools operate within a specific **working directory**. 
- **Default:** `C:\K_KI\AI_Output`
- **Fallback:** The directory where the plugin server was started.
- **Change:** Use `change_directory` to navigate.

---

## ? File System Tools

### `list_directory`
Lists all files and folders in the current working directory.
- **Usage:** Call without arguments.

### `read_file(file_name)`
Reads the content of a text file.
- **file_name**: Name of the file to read (relative to working dir).

### `save_file(file_name, content)`
Creates or overwrites a file with the provided text content.
- **file_name**: Name of the file.
- **content**: Text to write.

### `make_directory(directory_name)`
Creates a new folder (including parent folders if needed).
- **directory_name**: Name/path of the folder.

### `delete_path(path)`
?? **Destructive:** Deletes a file or directory recursively.
- **path**: File or folder to remove.

### `change_directory(directory)`
Changes the active working directory for all subsequent tool calls.
- **directory**: New path to switch to.

---

## ? Execution Tools

### `execute_command(command, input?)`
Executes a shell command in the background (non-interactive).
- **command**: The shell command (e.g., `dir`, `npm install`).
- **input** (Optional): Text to pipe into the command's Standard Input (stdin). Use this for scripts that require simple answers.
- **Note:** This captures stdout/stderr but cannot handle complex TUI applications.

### `run_in_terminal(command)`
?? **Interactive:** Launches a **real, separate Command Prompt window** visible on your screen.
- **command**: The command to run in the new window.
- **Use Case:** Interactive scripts (like `edit_list.py`), long-running processes, or when you need to type inputs manually.

### `run_python(python)`
Executes a snippet of Python code in a temporary file.
- **python**: The Python code.
- **Note:** Runs in the current environment (requires python installed).

### `run_javascript(javascript)`
Executes a snippet of JavaScript/TypeScript using Deno.
- **javascript**: The code to run.
- **Note:** Runs using the bundled Deno runtime.

---

## ? Tips for AI
- Always `list_directory` first to see where you are.
- Use `run_in_terminal` if the user needs to interact with a script.
- Use `execute_command` with the `input` parameter if you need to automate a simple script prompt.
