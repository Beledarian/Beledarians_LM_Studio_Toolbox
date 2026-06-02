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
| Path traversal guard | Most file tools validate paths with `validatePath()`, which prevents traversal outside the current working directory via `..` or absolute paths. |

### What is NOT a hard security boundary

| Feature | Reality |
|---|---|
| `change_directory` | Intentionally unrestricted — the model must be able to `cd ..` and navigate to absolute paths. After changing directory, all subsequent file operations are validated against the **new** CWD. Do not rely on workspace isolation if the model can change directory. |
| `protectedPaths` config | **Not yet enforced** — the config field is visible in settings but the enforcement code is not yet implemented (planned for a future release). Do not rely on it for security. |
| Web / browser tools | `fetch_web_content`, `rag_web_content`, `browser_session_open`, and the search providers have no SSRF protection and will follow any URL, including `http://localhost`, RFC-1918 addresses, and cloud-metadata endpoints. Only enable browser control if you trust the model's URL choices. |
| `query_database` | Restricted to SELECT-like statements by prefix check, but does not block `ATTACH DATABASE` or cross-file reads. Limit this to databases the model should actually read. |

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
