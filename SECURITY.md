# Security Policy

## Trust Model

LM Studio Toolbox grants the LLM direct access to your local file system and
development environment. **This is intentional and necessary for the plugin to
be useful**, but it means you should understand what the plugin can and cannot
constrain.

### What IS enforced

| Restriction | How |
|---|---|
| Code execution disabled by default | `run_python`, `run_javascript`, `execute_command`, browser control all default to **off** in plugin settings. Enable only what you need. |
| Python sandbox | `run_python` uses `sys.addaudithook` (Python 3.8+) to block network access, subprocess spawning, and writes outside the workspace. Reads are unrestricted (needed for stdlib imports). |
| JavaScript sandbox | `run_javascript` runs inside Deno with explicit deny flags: no network, no env, no sys, no subprocess, fs restricted to CWD. |
| Sub-agent time limit | The secondary agent loop is bounded by the **Sub-Agent Time Limit** config (default 600 s). The deadline is enforced on every iteration and on all outbound web fetches within the loop. |
| Path traversal guard | All file tools validate paths with `validatePath()`, which prevents traversal outside the current working directory via `..` or absolute paths. |
| Protected paths | The `protectedPaths` config (newline- or comma-separated absolute paths) is parsed at startup and checked by `validatePath()` and `change_directory`. Any path within a protected directory is denied regardless of CWD. |
| SSRF prevention | `fetch_web_content`, `rag_web_content`, and `wikipedia_search` route through `safeFetch()`, which blocks loopback (`127.x.x.x`, `::1`, `localhost`), RFC-1918 private ranges, link-local / cloud-metadata addresses (`169.254.x.x`, `fe80::/10`), non-http(s) schemes, and IPv4-mapped IPv6 (`::ffff:x.x.x.x`). Every redirect hop is re-validated before following, closing the open-redirect bypass vector (SEC-R1). A best-effort DNS pre-check rejects hostnames that resolve to private addresses; see residual risk note below. |
| Browser URL schemes | `browser_session_open` and `browser_open_page` reject non-http(s) URLs, blocking `file://` and other schemes from being loaded in the headless browser. |
| `query_database` write prevention | `INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, `CREATE`, `REPLACE`, `ATTACH`, `DETACH`, and `PRAGMA` are all blocked. Prevents both data modification and cross-file reads via `ATTACH DATABASE`. |

### What is NOT a hard security boundary

| Feature | Reality |
|---|---|
| `change_directory` | Intentionally unrestricted — the model must be able to `cd ..` and navigate to absolute paths. After changing directory, all subsequent file operations are validated against the **new** CWD. Configure `protectedPaths` to block specific directories absolutely. |
| Browser tools (SSRF) | `browser_session_open` and `browser_open_page` accept any http(s) URL including `http://localhost` and RFC-1918 addresses — the SSRF guard applies only to Node-side `fetch()` calls, not to Puppeteer navigations. Only enable browser control if you trust the model's URL choices. |
| `execute_command` / `run_in_terminal` | Shell commands are entirely unrestricted — no path filtering, no network blocking. Only enable if you trust the model completely. |
| DNS rebinding (SSRF residual) | `safeFetch()` pre-checks DNS to reject hostnames that resolve to private IPs, but there is an unavoidable TOCTOU window between that check and the actual HTTP connection. A sophisticated DNS rebinding attack that changes the resolution between the two lookups can still bypass the guard. This is a fundamental limitation of application-layer SSRF protection; network-layer controls (egress firewall rules) are the correct mitigation if this threat model applies to your deployment. |

### Dependency vulnerabilities

Run `npm audit` after installation to see the current vulnerability status.

As of the last review:

| Vulnerability | Package | Status |
|---|---|---|
| RCE via option-parsing bypass | `simple-git` | **Fixed** — patched in the installed version |
| XML injection / DoS | `@xmldom/xmldom` | **Fixed** |
| ReDoS | `minimatch`, `picomatch`, `brace-expansion` | **Fixed** |
| Path traversal | `basic-ftp` | **Fixed** |
| Moderate | `uuid` via `node-notifier` | **Residual** — fixing requires downgrading `node-notifier` to a breaking version; documented advisory only |

### Reporting a vulnerability

Open a private issue on [haggyroth/LM_Studio_Toolbox](https://github.com/haggyroth/LM_Studio_Toolbox/issues)
with the label **security** and describe the issue. Do not disclose exploitable
details publicly until a fix is merged.
