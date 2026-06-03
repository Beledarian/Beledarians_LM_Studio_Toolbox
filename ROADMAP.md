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

## Summary Table

| Phase | Description | Effort | Status |
|-------|-------------|--------|--------|
| A | Security hotfix (CVEs) | 0.5 day | ✅ Done |
| B | Core security boundaries | 1 day | ✅ Done |
| C | Sub-agent correctness | 0.5 day | ✅ Done |
| D | Test suite hardening | 1–1.5 days | ✅ Done |
| E | Consistency, performance, polish | 1 day | ✅ Done |
| F | SSRF redirect hardening | 0.5 day | 🔄 PR #19 open |
| G | RAG cache correctness | 2 hours | 📋 Planned |
| H | Test coverage gaps | 3 hours | 📋 Planned |
| I | Polish (timeouts, leaks, minor bugs) | 2 hours | 📋 Planned |
| J | Sub-agent robustness & new roles | 1 day | 📋 Planned |
| K | Git toolset completion | 2 hours | 📋 Planned |
| L | Developer experience & tooling | 3 hours | 📋 Planned |
| M | Long-term / exploratory | TBD | 📋 Exploratory |
