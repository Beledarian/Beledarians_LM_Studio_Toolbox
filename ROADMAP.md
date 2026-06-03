# LM Studio Toolbox — Roadmap

This document tracks completed work, active work-in-progress, and planned improvements.
Each phase is independently shippable and PR-sized.  All PRs target **`haggyroth/LM_Studio_Toolbox`**.

---

## Status Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Merged to `main` |
| 🔄 | PR open / in progress |
| 📋 | Planned — not yet started |

---

## Completed Phases

### ✅ Phase A — Security Hotfix
- `npm audit fix` resolving `simple-git` RCE (GHSA-jcxm-m3jx-f287) and 7 other CVEs
- Documented residual `uuid`/`node-notifier` advisory in `SECURITY.md`

### ✅ Phase B — Core Boundaries
- `safeFetch()` central helper: scheme allowlist, RFC-1918/loopback/link-local denylist, configurable timeout
- Scheme allowlist for `browser_session_open` / `browser_open_page` (blocked `file://`, `javascript:`)
- `protectedPaths` enforcement wired into `validatePath()` and `change_directory`
- `query_database` hardened: rejects `ATTACH`, `PRAGMA`, constrains `db_path` to workspace

### ✅ Phase C — Sub-Agent Correctness
- `subAgentTimeLimit` wall-clock deadline enforced with `AbortSignal` on in-flight fetches
- Parser alias `search_file_content` → `search_in_file` (was mapping to a nonexistent tool)
- `finish_task` now handled as a clean termination signal in the executor
- GitHub CLI spawn timeouts added

### ✅ Phase D — Test Suite Hardening
- `fileTools` integration tests: 30 cases against a real temp workspace
- `memoryTools` integration tests: 13 cases with SQLite
- Python sandbox smoke tests: 12 cases (network, subprocess, filesystem)
- `security.test.js`: `validatePath`, `parseProtectedPaths`, SSRF rejection
- `c8` coverage reporting added (`npm run coverage`)

### ✅ Phase E — Consistency, Performance & Polish
- Memory DB connection cached per-path; migration runs once per session
- RAG embedding cache keyed by `path + mtime` with batched `embed()` calls
- ESLint flat config wired into `npm run ci` (`no-new-func: error`, `no-unused-vars: error`)
- Dead code removed (`mtimes` array, stale auto-summary references)
- Tool-gating unified to the "factory returns `[]` when disabled" pattern
- Temp script files for `run_python`/`run_javascript` moved to `os.tmpdir()`
- `gh_push` consolidated into `git_push`

### ✅ Phase F — SSRF Hardening (redirect bypass)
- `safeFetch` rewritten with `redirect: "manual"` — every `Location` header re-validated before following
- Max redirect hops enforced (5)
- Best-effort DNS pre-check (`dns.promises.lookup`) rejects hostnames resolving to private IPs
- IPv6 ULA full range fixed: `startsWith("fc") || startsWith("fd")` (was `startsWith("fc00")`, missed `fc01–fcff`)
- IPv4-mapped IPv6 (`::ffff:a.b.c.d`) detected and recursively validated
- `198.0.0.0/8` over-block fixed: now targets only `198.18–19/15` (benchmarking) and `198.51.100/24` (TEST-NET-2)
- `isBlockedIp()` and `validateSsrfUrl()` exported as pure functions; 42 new unit tests
- `SECURITY.md` updated with residual DNS-rebinding TOCTOU note

---

## Upcoming Phases

### 📋 Phase G — RAG Cache Correctness
**~2 hours · Target: 1 PR**

Three silent bugs in the embedding cache introduced in Phase E:

| ID | Issue | Fix |
|----|-------|-----|
| BUG-R1 | Cache keyed by `path+mtime` only — switching embedding models reuses stale vectors → NaN cosine similarity → empty results with no error | Key by `model::path::mtime` |
| BUG-R2 | `cosineSimilarity` has no vector-length guard — mismatched dimensions produce `NaN` silently | Assert `vecA.length === vecB.length`; return `0` on mismatch with a console warning |
| PERF-R1 | Cache is unbounded — grows forever in a long session embedding many files | Add a simple LRU eviction cap (~200 entries) |

---

### 📋 Phase H — Test Coverage Gaps
**~3 hours · Target: 1 PR**

The highest-risk modules still have no direct tests:

- **`webTools`**: `fetch_web_content` and `rag_web_content` through the real `safeFetch` path (using mocked `fetch`); `wikipedia_search` timeout behavior
- **`promptPreprocessor`**: memory injection, message-count increment, startup-file loading, legacy `memory.md` migration trigger
- **`miscTools`**: `query_database` ATTACH rejection, `rag_local_files` end-to-end scoring with a stub embedding model
- **Sub-agent orchestration**: `finish_task` clean termination, time-limit enforcement, `TASK_FAILED` propagation

---

### 📋 Phase I — Polish
**~2 hours · Target: 1 PR**

Remaining minor items from the code review:

| Item | Detail |
|------|---------|
| DuckDuckGo raw `fetch` timeout | `webTools.ts` — one remaining raw `fetch()` call with no timeout (PERF-R3) |
| `query_database` connection leak | `miscTools.ts` opens a `better-sqlite3` connection per call and never calls `.close()` |
| `save_file` rejects spaces in filenames | Regex `/[ \*\?<>|"]/` wrongly blocks `my file.txt`; spaces are valid on all platforms |
| Linux clipboard fallbacks | No `xsel` or Wayland (`wl-copy`/`wl-paste`) fallback; `xclip`-only fails silently on many setups |
| `multi_replace_text` overlap handling | Overlapping old_string ranges corrupt output silently; document or detect and reject |

---

### 📋 Phase J — Sub-Agent Robustness & Collaboration
**~1 day · Target: 1–2 PRs**

The sub-agent system works well under ideal conditions but is brittle when either side stalls, errors, or produces unexpected output. This phase hardens the handshake and expands the role system.

#### J.1 — Resilience & Error Recovery

**Main → sub-agent failures:**
- **Stall detection**: If the sub-agent produces a non-empty response with no tool call _and_ no termination signal three turns in a row, the current logic increments `noToolCallCount` and eventually exits. The main agent never learns _why_. Add a structured `{ status: "stalled", summary: "..." }` return so the main agent can retry or escalate.
- **Partial-progress recovery**: When a sub-agent run hits the deadline mid-task, return whatever files were saved plus a `{ status: "timeout", progress: "..." }` field. The main agent can then re-invoke with a narrower scope rather than starting over.
- **Automatic retry with backoff**: If `consult_secondary_agent` fails due to a connection error (LM Studio not running, model not loaded), retry up to 2 times with a 5 s backoff before surfacing the error. Include a clear message telling the user which model/server to check.
- **Sub-agent health check**: Before dispatching a task, send a lightweight "ping" prompt (`echo OK`) and bail early with a clear error if the secondary endpoint is unreachable.

**Sub-agent → main failures:**
- **Loop-exit on main-agent context clear**: If the user clears context mid-run, the sub-agent loop has no way to know. Expose a `cancelSubAgent()` mechanism (perhaps via `AbortController` passed through `ToolContext`) that the preprocessor can signal on a fresh turn.
- **Progress heartbeats**: Surface `[Sub-agent: turn N/8, ~Xk tokens]` as a streaming status note visible in the chat so users can see the agent is alive.

#### J.2 — Additional Sub-Agent Roles

The current config ships with `summarizer` and `coder` examples. Extend the default `subAgentProfiles` with well-tuned built-in presets (user-overridable via the config JSON):

| Role key | Purpose | Specializations |
|----------|---------|-----------------|
| `coder` | Write, edit, and refactor code | Follows project conventions; runs tests after changes; uses `replace_text_in_file` for surgical edits |
| `reviewer` | Audit code for bugs and security issues | Uses `search_in_file` + `read_file`; outputs structured findings; calls `finish_task` with a findings summary |
| `researcher` | Gather, verify, and summarize information from the web | Chains `web_search` → `fetch_web_content` → `rag_web_content`; produces a cited summary |
| `debugger` | Diagnose failing tests or runtime errors | Reads error output, traces stack frames, proposes and applies targeted fixes; re-runs tests to verify |
| `tester` | Write and run tests for existing code | Infers coverage gaps from source; writes test files; executes with `run_test_command`; reports pass/fail |
| `documenter` | Write or update inline docs, READMEs, and changelogs | Reads source; produces JSDoc/docstrings and markdown; uses `replace_text_in_file` |
| `planner` | Decompose a complex task into an ordered checklist | Produces a structured plan as a markdown file; does not write code itself |
| `data_analyst` | Query, transform, and summarize structured data | Uses `query_database`, `run_python`, and `rag_local_files`; produces tables and charts |

#### J.3 — Role Chaining

Allow the main agent to compose roles in sequence without manual re-invocation:

```
consult_secondary_agent({
  task: "Implement and test the new auth module",
  chain: ["coder", "tester", "reviewer"]
})
```

Each link in the chain receives the previous link's output + any files it saved as its starting context. The final result aggregates all handoff messages. This enables a full write → test → review pipeline in a single tool call.

#### J.4 — Shared Workspace Awareness

Currently the main agent and sub-agent each maintain their own view of the workspace. Improvements:
- Pass the main agent's current `ctx.cwd` to the sub-agent as its default starting directory
- Sub-agent file saves are reflected back to the main agent's context immediately (already works via `filesModified`; surface these more prominently in the response)
- Add a `readonly` mode option to `consult_secondary_agent` that disables `save_file`/`delete_path` for research-only roles

---

### 📋 Phase K — Git Toolset Completion
**~2 hours · Target: 1 PR**

The git toolchain covers the common workflow but is missing operations that frequently force the model to fall back to `execute_command`:

| Tool | Purpose |
|------|---------|
| `git_stash` / `git_stash_pop` | Save and restore uncommitted changes when switching context |
| `git_reset` | Unstage files or roll back commits (`--soft`, `--mixed` only — `--hard` requires confirmation prompt) |
| `git_branch` | List, create, and delete branches |
| `git_merge` | Merge a branch (fast-forward only by default; `--no-ff` optional) |
| `git_fetch` | Fetch remote refs without merging |

Each tool follows the existing pattern: `simple-git` wrapper, model-controlled inputs sanitized by the library, timeout on the spawn.

---

### 📋 Phase L — Developer Experience & Tooling
**~3 hours · Target: 1–2 PRs**

Improvements that make working on and with the plugin easier:

**Diff/patch tool**  
A `apply_patch` tool that accepts a unified diff string and applies it to the workspace. Models frequently express changes as diffs; this avoids full file rewrites and reduces the risk of silent overwrites.

**Parallel `search_directory`**  
The tool currently reads files fully and sequentially. A bounded concurrency pool (8 concurrent reads via `Promise.allSettled`) would make large-workspace searches 5–10× faster with no API surface change.

**Configurable tool allowlist**  
A `disabledTools` config field (comma-separated tool names) that lets users expose `read_file` but not `delete_path`, for read-only assistant configurations. The factory pattern already supports returning `[]` — this just wires a config-level filter.

**`read_document` as general opener**  
Extend `read_document` (currently PDF + DOCX only) to handle `.txt`, `.csv`, `.json`, `.md`, and `.xml` with encoding detection and size-aware chunking. Reduces the model's need to decide which "open" tool to call.

---

### 📋 Phase M — Long-Term / Exploratory
**Longer horizon — design required before scheduling**

These are higher-effort ideas worth tracking but not yet fully specified:

**Session persistence**  
Export the current session state (CWD, memory count, active browser URL, background command log) to a JSON snapshot and restore it on next startup. Lets users resume exactly where they left off after a context reset.

**MCP server mode**  
Expose the toolbox as a [Model Context Protocol](https://modelcontextprotocol.io/) server so non-LM-Studio clients (Claude Desktop, Cursor, VS Code Copilot Chat) can use the same tool surface. The `ToolContext` + factory architecture maps cleanly to MCP's tool/resource model.

**Workspace profiles**  
Named presets that bundle CWD, `protectedPaths`, enabled tools, and a default sub-agent role. The model can switch profiles (`use_workspace_profile("frontend")`) to instantly reconfigure for a different project context.

**Streaming tool output**  
Long-running tools (`fetch_web_content` on a slow host, `rag_local_files` on a large tree) currently block until complete. The LM Studio SDK supports streaming; a progress-callback pattern could surface partial results as intermediate chat messages.

**Token/cost tracking**  
Track approximate token usage and elapsed time across sub-agent turns and surface a `[Session: N turns, ~Xk tokens, Ys elapsed]` footer. Helps users manage context budget and understand where time is spent.

---

---

## Proposed Features (Phase N — Next Cycle)

Grouped by effort and impact. All items are independent and can be taken in any order.

### 🔴 High Value / Low Effort (~30m–1h each)

**N.1 — Atomic file writes**
`save_file` currently uses a direct `writeFile()` which can leave a half-written file if interrupted. Fix: write to `<path>.tmp` then `rename()` to the final target — a POSIX atomic operation. Prevents file corruption during long code-generation sessions. One-line change per write site.

**N.2 — `read_file` line-count and token estimate**
Append a footer `[File: 847 lines, ~12k tokens]` when a file is read. Helps the model decide whether to use `read_file_range` instead of loading the whole file, and prevents accidental context blowout on large generated files.

**N.3 — `run_test_command` streaming output**
The tool currently blocks silently. Stream stdout line-by-line through `ctx.status()` as test results arrive — the user sees `"PASS src/auth.test.ts"` ticking by instead of a frozen spinner for 30 seconds. Pairs well with M.1's existing status infrastructure.

**N.4 — `git_diff` word-level mode**
Add a `word_diff: boolean` parameter that passes `--word-diff` to git. LLMs parse word-level diffs significantly better than line-level for prose/documentation changes. Five-line addition to `gitTools.ts`.

**N.5 — `search_directory` exclusion patterns**
Add an `exclude: string[]` parameter accepting glob patterns (e.g. `["dist", "*.min.js", "coverage"]`). Currently hardcodes only `node_modules`, `.git`, and dotfiles. A heavily requested change for large monorepos.

---

### 🟡 Medium Value / Moderate Effort (~2–4h each)

**N.6 — `analyze_project` tool**
A single tool that orients the model at the start of a session: 2-level directory tree, `package.json`/`pyproject.toml`/`Cargo.toml` summary, recent git commits, active branch, test command, and file count. Currently the model needs 6–8 separate tool calls to gather this context. One call should do it.

**N.7 — `query_csv` and `transform_json` tools**
Lightweight structured-data tools that work without enabling Python:
- `query_csv(file, filter?, columns?, limit?)` — filter rows, select columns, return as JSON array
- `transform_json(file, path_expression)` — traverse/filter a JSON document with a simple path expression

Covers the 90% case for data inspection workflows.

**N.8 — `watch_file` / `watch_directory` (background watcher)**
Starts an `fs.watch()` listener registered in `backgroundCommands`. When the watched path changes, calls `send_notification` and logs the event. Enables reactive workflows: start a dev server in the background, watch `dist/` for the build output, automatically re-read when it changes.

**N.9 — `find_symbol` and `find_usages` (AST-aware code search)**
Uses `ts-morph` (already a devDependency) to add workspace-aware symbol navigation:
- `find_symbol(name)` — locate where a TypeScript function/class/variable is defined
- `find_usages(name, file?)` — find all call sites across the workspace

Eliminates the false positives of `search_directory`'s text grep (e.g., finding the string `"render"` in a comment when you want the `render()` function). Works on TypeScript and JavaScript files.

**N.10 — `capture_screenshot` tool**
When `allowBrowserControl` is enabled, open a URL, take a screenshot, save it to the workspace, and return the file path — without requiring a persistent browser session. Enables visual regression checks and "what does this page look like?" queries in a single tool call.

**N.11 — Audit log**
Write every tool call (name, args summary, result status, elapsed ms, timestamp) to `~/.lm-studio-toolbox/audit.log` in NDJSON format. Off by default, enabled via a `enableAuditLog` config field. Lets users review what the model did during a session — especially useful for debugging unexpected file changes.

---

### 🟢 Bigger Bets / Longer Horizon (~1 day each)

**N.12 — Custom tool plugins**
Users drop a JavaScript file into `~/.lm-studio-toolbox/plugins/` that exports a tool definition using the same Zod schema pattern as built-in tools. The plugin loader scans the directory at startup and registers each export. Gives power users the ability to add domain-specific tools (deploy scripts, company-internal APIs) without forking the source.

```javascript
// ~/.lm-studio-toolbox/plugins/deploy.js
module.exports = {
  name: "deploy_to_staging",
  description: "Deploy the app to the staging environment",
  parameters: { env: z.enum(["staging", "canary"]) },
  implementation: async ({ env }) => { /* ... */ }
};
```

**N.13 — Auto-capture memory**
The current memory system is entirely manual — the model must call `save_memory` explicitly. Add an `autoCapture` mode that distills key facts from each conversation using the secondary LM Studio endpoint and saves them automatically. No user action required. Controlled by a `memoryAutoCapture` config field.

**N.14 — `rename_symbol` — workspace-wide atomic rename**
Uses `ts-morph` to rename a TypeScript identifier across the entire workspace: updates the definition, all import statements, and all call sites in a single transaction. Currently the model needs `search_directory` + multiple `replace_text_in_file` calls and risks missing occurrences. One tool replaces 20+ calls for common refactors.

**N.15 — Diff-based editing workflow**
Add `edit_file_with_diff(file, unified_diff)` that validates a diff against the current file content before applying it (via `apply_patch`). Dramatically reduces token usage for large files — sending a 10-line diff instead of a 500-line rewrite. Pairs with a "generate diff → apply diff → verify" workflow that the model can adopt for large codebases.

**N.16 — Sub-agent mid-task steering**
Add an `interrupt_sub_agent(message)` tool that injects a correction into the sub-agent's message list on the next turn. Currently once `consult_secondary_agent` is invoked, the main agent is locked out until it finishes. This enables the user to course-correct a running sub-agent ("stop and focus on the auth module instead") without cancelling the entire run.

---

## Summary Table

| Phase | Description | Effort | Status |
|-------|-------------|--------|--------|
| A | Security hotfix (CVEs) | 0.5 day | ✅ Done |
| B | Core security boundaries | 1 day | ✅ Done |
| C | Sub-agent correctness | 0.5 day | ✅ Done |
| D | Test suite hardening | 1–1.5 days | ✅ Done |
| E | Consistency, performance, polish | 1 day | ✅ Done |
| F | SSRF redirect hardening | 0.5 day | ✅ Done |
| G | RAG cache correctness | 2 hours | ✅ Done |
| H | Test coverage gaps | 3 hours | ✅ Done |
| I | Polish (timeouts, leaks, minor bugs) | 2 hours | ✅ Done |
| J | Sub-agent robustness & new roles | 1 day | ✅ Done |
| K | Git toolset completion | 2 hours | ✅ Done |
| L | Developer experience & tooling | 3 hours | ✅ Done |
| M.1 | Streaming tool status | 3 hours | ✅ Done |
| M.2 | Token tracking in sub-agent | 1 hour | ✅ Done |
| M.3 | Session persistence enrichment | 3 hours | ✅ Done |
| M.4 | Workspace profiles | 3 hours | ✅ Done |
| M.5 | MCP server mode | 2 days | ✅ Done |
| N.1 | Atomic file writes | ~30m | ✅ Done |
| N.2 | `read_file` token estimate | ~30m | ✅ Done |
| N.3 | `run_test_command` streaming output | ~30m | ✅ Done |
| N.4 | `git_diff` word-level mode | ~30m | ✅ Done |
| N.5 | `search_directory` exclusion patterns | ~30m | ✅ Done |
| N.6 | `analyze_project` tool | ~2h | ✅ Done |
| N.7 | `query_csv` and `transform_json` tools | ~3h | 📋 Planned |
| N.8 | `watch_file` / `watch_directory` | ~3h | 📋 Planned |
| N.9 | `find_symbol` and `find_usages` (AST) | ~3h | 📋 Planned |
| N.10 | `capture_screenshot` tool | ~2h | 📋 Planned |
| N.11 | Audit log | ~1h | ✅ Done |
| N.12–16 | Big bets (custom plugins, auto-memory, rename_symbol, diff editing, sub-agent steering) | ~1 week | 📋 Planned |
