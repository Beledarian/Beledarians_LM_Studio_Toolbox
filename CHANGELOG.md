# Changelog

All notable changes to **LM Studio Toolbox** are documented here.

This project follows [Semantic Versioning](https://semver.org/):
- **MAJOR** — breaking changes (storage paths, removed tools, renamed config keys)
- **MINOR** — new tools, new parameters, new config fields (backward-compatible)
- **PATCH** — bug fixes, security patches, documentation corrections

---

## [Unreleased]

---

## [3.0.0] — 2026-06-03

### ⚠️ Breaking Changes
- **Storage directory renamed:** `~/.beledarians-llm-toolbox/` → `~/.lm-studio-toolbox/`
  Move your existing directory to preserve saved state, workspace profiles, and MCP config.
  Workspace `.memories.db` files are stored per-project and are unaffected.
- **Sub-agent project journal renamed:** `beledarian_info.md` → `toolbox_info.md`
- **Startup file directory renamed:** `.beledarian/startup.md` → `.toolbox/startup.md`
- **Package name:** `beledarians-lm-studio-tools` → `lm-studio-toolbox`
- **Manifest owner:** `beledarian` → `haggyroth`

### Added
- MCP server mode (`npm run mcp`) — expose all tools to Claude Desktop, Cursor, VS Code Copilot Chat, and any MCP-compatible client via stdio transport (Phase M.5)
- Live tool status updates via `ToolCallContext.status()` — visible in LM Studio's UI sidebar during long-running operations (Phase M.1)
- Token tracking footer on every sub-agent response: `[Sub-agent: 3 turns, ~8k tokens, 12.4s]` (Phase M.2)
- Session persistence: `save_session_note` tool, `lastBrowserUrl` tracking, `recentFiles` list, `[Resumed session]` block injected on first turn (Phase M.3)
- Workspace profiles: `save_workspace_profile`, `switch_workspace_profile`, `list_workspace_profiles` (Phase M.4)
- RAG embedding cache keyed by `model::path::mtime` — switching models no longer produces silent NaN results (Phase G)
- `cosineSimilarity` length guard — mismatched dimensions return `0` with a warning instead of `NaN` (Phase G)
- LRU eviction cap (200 entries) on the embedding cache (Phase G)
- Test coverage for `webTools`, `query_database`, and sub-agent orchestration (Phase H)
- Sub-agent role chaining (`chain: ["tester", "reviewer"]`) (Phase J)
- Sub-agent readonly mode (`readonly: true`) (Phase J)
- 8 built-in sub-agent role presets: `coder`, `reviewer`, `researcher`, `debugger`, `tester`, `documenter`, `planner`, `data_analyst` (Phase J)
- Sub-agent retry with backoff on connection errors (Phase J)
- `git_stash`, `git_reset`, `git_branch`, `git_merge`, `git_fetch` tools (Phase K)
- `apply_patch` tool — apply unified diffs via `git apply` (Phase L)
- Parallel `search_directory` — 8× concurrent file reads (Phase L)
- Extended `read_document` — now handles `.txt`, `.md`, `.json` (with validation), `.csv` (row count + header), `.xml`, and any text format (Phase L)
- `disabledTools` config field — exclude specific tools from the model's tool list (Phase L)
- `save_session_note`, `save_workspace_profile`, `switch_workspace_profile`, `list_workspace_profiles` tools
- Phase N roadmap with 16 proposed improvements

### Fixed
- `query_database` connection not closed on error path (Phase I)
- DuckDuckGo `fetch` provider had no timeout (Phase I)
- SSRF guard bypassed via HTTP redirects — `safeFetch` now uses `redirect: "manual"` and re-validates every `Location` header (Phase F)
- IPv6 ULA range check missed `fc01`–`fcff` (was `startsWith("fc00")`, fixed to `startsWith("fc")`) (Phase F)
- IPv4-mapped IPv6 addresses (`::ffff:a.b.c.d`) not blocked (Phase F)
- `198.0.0.0/8` over-blocked — only `198.18–19/15` and `198.51.100/24` are reserved (Phase F)

---

## [2.0.0] — 2026-06-02

### ⚠️ Breaking Changes
- Forked from `Beledarian/Beledarians_LM_Studio_Toolbox` — repository moved to `haggyroth/LM_Studio_Toolbox`

### Added
- Full SQLite-backed memory CRUD: `save_memory`, `list_memories`, `search_memories`, `update_memory`, `delete_memory`
- Memory injection into first-turn context (top 50 entries)
- `protectedPaths` config enforced in `validatePath()` and `change_directory` (was defined but never read)
- `subAgentTimeLimit` wall-clock deadline enforced with `AbortSignal`
- `safeFetch()` central SSRF helper — all web tools route through it
- `query_database` hardened: rejects `ATTACH`, `PRAGMA`, path-traversal on `db_path`
- Browser scheme allowlist (`file://`, `javascript:` blocked)
- Sub-agent `finish_task` handled as clean termination
- Parser alias `search_file_content` → `search_in_file` fixed
- ESLint flat config + `npm run ci` pipeline
- `c8` coverage reporting (`npm run coverage`)
- `git_add`, `git_checkout`, `git_pull`, `git_push` tools
- GitHub CLI tools (`gh_auth`, `gh_create_issue`, `gh_create_pr`, `gh_list_issues`, etc.)
- RAG embedding cache keyed by `path + mtime`
- Memory DB connection cached per-path (single open per session)
- Temp scripts for `run_python`/`run_javascript` moved to `os.tmpdir()`
- Python sandbox smoke tests, fileTools integration tests, security SSRF tests

### Fixed
- `simple-git` RCE (GHSA-jcxm-m3jx-f287) and 7 other CVEs via `npm audit fix`
- `subAgentTimeLimit` config defined but never consumed
- `protectedPaths` config defined but never consumed

---

## [1.3.x] and earlier

See the [original upstream repository](https://github.com/Beledarian/Beledarians_LM_Studio_Toolbox) for pre-fork history.
