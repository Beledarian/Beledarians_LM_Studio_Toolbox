"use strict";
/**
 * Python sandbox smoke tests (SEC-9, Phase D / TEST-6).
 *
 * These tests verify that the PYTHON_SANDBOX_PREAMBLE injected by runPythonImpl
 * correctly restricts what the sandboxed script can do.  All tests require a
 * Python 3 interpreter to be available — they self-skip if one is not found.
 *
 * Each test spawns a real Python process with the preamble prepended, so the
 * assertions reflect the actual runtime behaviour of the sandbox.
 */
const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

// ── Environment check ─────────────────────────────────────────────────────────

let pythonBin = null;
for (const candidate of process.platform === "win32" ? ["python", "python3"] : ["python3", "python"]) {
  try {
    const r = spawnSync(candidate, ["--version"], { encoding: "utf-8", timeout: 5000 });
    if ((r.stdout + r.stderr).includes("Python 3")) {
      pythonBin = candidate;
      break;
    }
  } catch { /* not found */ }
}

const skipIfNoPython = (t) => {
  if (!pythonBin) {
    t.skip("Python 3 not found on PATH — install Python 3 to run sandbox tests");
    return true;
  }
  return false;
};

// ── Sandbox preamble (must stay in sync with codeTools.ts) ───────────────────
// We duplicate the preamble here to verify its actual runtime behaviour
// independently of the TypeScript compilation step.

const PREAMBLE = `\
import sys as _sys, os as _os

if _sys.version_info >= (3, 8):
    def _sandbox_audit(event, args,
                       _blocked=frozenset({
                           "subprocess.Popen",
                           "os.system", "os.popen",
                           "os.execv", "os.execve", "os.execvp", "os.execvpe",
                           "socket.__new__",
                           "socket.getaddrinfo", "socket.gethostbyname",
                           "socket.connect",
                           "urllib.Request",
                       }),
                       _workspace=_os.path.abspath("."),
                       _sep=_os.sep,
                       _realpath=_os.path.realpath,
                       _abspath=_os.path.abspath):
        if event in _blocked:
            raise PermissionError(f"[sandbox] '{event}' is not allowed in sandboxed Python")
        if event == "open" and args:
            path = str(args[0])
            mode = str(args[1]) if len(args) > 1 else "r"
            if any(c in mode for c in "wax"):
                abs_path = _realpath(_abspath(path))
                if not (abs_path == _workspace or abs_path.startswith(_workspace + _sep)):
                    raise PermissionError(
                        f"[sandbox] Writing outside workspace not allowed: {path}"
                    )
    _sys.addaudithook(_sandbox_audit)
    del _sandbox_audit

del _sys, _os
`;

// ── Helper ────────────────────────────────────────────────────────────────────

function runInSandbox(code, cwd) {
  const workDir = cwd || fs.mkdtempSync(path.join(os.tmpdir(), "pysandbox-"));
  const scriptPath = path.join(workDir, `_test_${Date.now()}.py`);
  fs.writeFileSync(scriptPath, PREAMBLE + "\n" + code, "utf-8");
  const result = spawnSync(pythonBin, [scriptPath], {
    cwd: workDir, encoding: "utf-8", timeout: 10000,
  });
  try { fs.unlinkSync(scriptPath); } catch { /* ignore */ }
  return { stdout: result.stdout, stderr: result.stderr, code: result.status, workDir };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Python sandbox (preamble audit hook)", () => {

  // ── ALLOWED operations ──────────────────────────────────────────────────────

  it("allows math stdlib", (t) => {
    if (skipIfNoPython(t)) return;
    const { stdout, code } = runInSandbox("import math; print(math.sqrt(4))");
    assert.equal(code, 0, `Expected exit 0, stderr: ${runInSandbox("import math; print(math.sqrt(4))").stderr}`);
    assert.ok(stdout.trim().startsWith("2"), `Expected '2.0', got: ${stdout}`);
  });

  it("allows json stdlib", (t) => {
    if (skipIfNoPython(t)) return;
    const { stdout, code } = runInSandbox(`import json; print(json.dumps({"a": 1}))`);
    assert.equal(code, 0);
    assert.ok(stdout.includes('"a"'));
  });

  it("allows re stdlib", (t) => {
    if (skipIfNoPython(t)) return;
    const { code } = runInSandbox(`import re; m=re.findall(r'\\d+','abc123'); print(m)`);
    assert.equal(code, 0);
  });

  it("allows writing a file inside the workspace", (t) => {
    if (skipIfNoPython(t)) return;
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "pysandbox-write-"));
    const { code, stderr } = runInSandbox(`open('out.txt', 'w').write('hello')`, tmpDir);
    assert.equal(code, 0, `stderr: ${stderr}`);
    assert.ok(fs.existsSync(path.join(tmpDir, "out.txt")));
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("allows reading a file inside the workspace", (t) => {
    if (skipIfNoPython(t)) return;
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "pysandbox-read-"));
    fs.writeFileSync(path.join(tmpDir, "data.txt"), "hello");
    const { stdout, code } = runInSandbox(`print(open('data.txt').read())`, tmpDir);
    assert.equal(code, 0);
    assert.ok(stdout.includes("hello"));
    fs.rmSync(tmpDir, { recursive: true });
  });

  // ── BLOCKED operations ──────────────────────────────────────────────────────

  it("blocks socket creation", (t) => {
    if (skipIfNoPython(t)) return;
    const { stderr, code } = runInSandbox("import socket; socket.socket()");
    assert.notEqual(code, 0);
    assert.ok(stderr.includes("[sandbox]"), `Expected sandbox error, got: ${stderr}`);
  });

  it("blocks socket.connect", (t) => {
    if (skipIfNoPython(t)) return;
    const { stderr, code } = runInSandbox(`
import socket
s = socket.socket()
s.connect(('example.com', 80))
`);
    assert.notEqual(code, 0);
    assert.ok(stderr.includes("[sandbox]"));
  });

  it("blocks subprocess.run", (t) => {
    if (skipIfNoPython(t)) return;
    const { stderr, code } = runInSandbox("import subprocess; subprocess.run(['echo','hi'])");
    assert.notEqual(code, 0);
    assert.ok(stderr.includes("[sandbox]"));
  });

  it("blocks os.system", (t) => {
    if (skipIfNoPython(t)) return;
    const { stderr, code } = runInSandbox("import os; os.system('echo hi')");
    assert.notEqual(code, 0);
    assert.ok(stderr.includes("[sandbox]"));
  });

  it("blocks os.popen", (t) => {
    if (skipIfNoPython(t)) return;
    const { stderr, code } = runInSandbox("import os; os.popen('ls')");
    assert.notEqual(code, 0);
    assert.ok(stderr.includes("[sandbox]"));
  });

  it("blocks urllib.request.urlopen", (t) => {
    if (skipIfNoPython(t)) return;
    const { stderr, code } = runInSandbox(`
import urllib.request
urllib.request.urlopen('http://example.com')
`);
    assert.notEqual(code, 0);
    assert.ok(stderr.includes("[sandbox]"));
  });

  it("blocks writing outside the workspace", (t) => {
    if (skipIfNoPython(t)) return;
    const homeEvil = path.join(os.homedir(), `__sandbox_test_${Date.now()}.txt`);
    const { stderr, code } = runInSandbox(`open(${JSON.stringify(homeEvil)}, 'w').write('pwned')`);
    assert.notEqual(code, 0, `Expected blocked write, stderr: ${stderr}`);
    assert.ok(stderr.includes("[sandbox]"));
    // Make sure the file wasn't actually created
    assert.ok(!fs.existsSync(homeEvil), "File should NOT have been created outside workspace");
  });
});
