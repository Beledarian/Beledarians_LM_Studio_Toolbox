# Beledarian's LM Studio Tools v2

[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/Beledarian/Beledarians_LM_Studio_Toolbox)

A streamlined tool suite for [LM Studio](https://lmstudio.ai/) AI agents. Provides file management, code execution, web search, and system utilities through a clean, minimal API that local LLMs can reliably invoke.

## Why v2?

The original tool suite had **35+ tools** with verbose descriptions, complex optional parameters, a prompt-injection system, and a fragile sub-agent framework. Local models frequently failed to call tools because of:

- **Tool overload** -- too many tools overwhelm smaller models' ability to select and format calls correctly
- **Verbose descriptions** -- multi-line descriptions waste context window and create ambiguity
- **Complex schemas** -- deeply nested optional parameters cause format errors
- **Prompt injection** -- injecting a separate "tools documentation" block conflicted with the SDK's native tool descriptions
- **Documentation mismatches** -- injected docs referenced tools that didn't exist (e.g., `search_file_content`, `duckduckgo_search`)
- **Heavy dependencies** -- puppeteer, pdf-parse, mammoth, better-sqlite3, simple-git, node-notifier added install failures and bloat
- **Fragile sub-agent** -- regex-based tool-call parsing with 3+ JSON format fallbacks

v2 fixes all of this: **16 focused tools**, one-sentence descriptions, simple required parameters, zero prompt injection, and only 2 runtime dependencies (`duck-duck-scrape` and `zod`).

## Tools

### File System (always available)

| Tool | Description |
|------|-------------|
| `list_directory` | List files and folders |
| `read_file` | Read text file content |
| `write_file` | Create or overwrite a file |
| `edit_file` | Replace exact text in a file |
| `delete_file` | Delete a file or directory |
| `find_files` | Search for files by name |
| `search_in_files` | Grep-like content search |
| `move_file` | Move or rename |
| `copy_file` | Copy a file |
| `file_info` | Get file metadata |

### Execution (gated by config)

| Tool | Description |
|------|-------------|
| `run_command` | Execute a shell command |
| `run_javascript` | Run JS/TS in sandboxed Deno |
| `run_python` | Run a Python script |

### Web (always available)

| Tool | Description |
|------|-------------|
| `web_search` | DuckDuckGo search |
| `fetch_url` | Fetch and extract webpage text |

### System

| Tool | Description |
|------|-------------|
| `system_info` | OS, CPU, memory info |

## Requirements

- [Node.js](https://nodejs.org/) (v18+)
- [LM Studio](https://lmstudio.ai/) (v0.3.0+)

## Installation

Install from the LM Studio Hub:

[https://lmstudio.ai/beledarian/beledarians-lm-studio-tools](https://lmstudio.ai/beledarian/beledarians-lm-studio-tools)

### Development

```bash
git clone https://github.com/Beledarian/Beledarians_LM_Studio_Toolbox.git
cd Beledarians_LM_Studio_Toolbox
npm install
lms dev
```

## Configuration

Access settings in the LM Studio "Plugins" tab:

| Setting | Default | Description |
|---------|---------|-------------|
| Allow Shell Commands | Off | Enable `run_command` |
| Allow JavaScript Execution | Off | Enable `run_javascript` (Deno sandbox) |
| Allow Python Execution | Off | Enable `run_python` |

> **Warning:** Enabling execution tools allows the model to run commands on your machine.

## Architecture

```
src/
  index.ts          -- Plugin entry point (8 lines)
  config.ts         -- Configuration schematics (17 lines)
  toolsProvider.ts  -- All tool definitions (~430 lines)
  utils.ts          -- Path validation & process runner (~60 lines)
```

No prompt preprocessor. No state manager. No sub-agent framework.
The SDK's native tool descriptions are all the model needs.

## License

ISC
