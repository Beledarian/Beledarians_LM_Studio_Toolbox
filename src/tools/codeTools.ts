import { tool, text, type Tool } from "@lmstudio/sdk";
import { z } from "zod";
import { spawn } from "child_process";
import { writeFile, rm } from "fs/promises";
import { join } from "path";
import * as os from "os";
import type { ToolContext } from "./context";
import { createSafeToolImplementation, getDenoPath, getPythonPath } from "./helpers";
import { backgroundCommands, generateId, pruneBackgroundCommands, type BackgroundCommand } from "../backgroundCommands";

// ─── JavaScript (Deno sandbox) ────────────────────────────────────────────────

export async function runJavascriptImpl({ javascript, timeout_seconds, cwd }: { javascript: string; timeout_seconds?: number; cwd: string }): Promise<{ stdout: string; stderr: string }> {
  // Write to os.tmpdir() rather than the workspace so temp files never
  // appear in the user's project and can't be matched by delete_files_by_pattern.
  const scriptFilePath = join(os.tmpdir(), `lmstoolbox_js_${Date.now()}.ts`);

  try {
    await writeFile(scriptFilePath, javascript, "utf-8");

    const childProcess = spawn(
      getDenoPath(),
      ["run", "--allow-read=.", "--allow-write=.", "--no-prompt", "--deny-net", "--deny-env", "--deny-sys", "--deny-run", "--deny-ffi", scriptFilePath],
      { cwd, timeout: (timeout_seconds ?? 5) * 1000, stdio: "pipe", env: { NO_COLOR: "true" } },
    );

    let stdout = "";
    let stderr = "";
    childProcess.stdout.setEncoding("utf-8");
    childProcess.stderr.setEncoding("utf-8");
    childProcess.stdout.on("data", data => { stdout += data; });
    childProcess.stderr.on("data", data => { stderr += data; });

    await new Promise<void>((resolve, reject) => {
      childProcess.on("close", code => { if (code === 0) resolve(); else reject(new Error(`Process exited with code ${code}. Stderr: ${stderr}`)); });
      childProcess.on("error", err => reject(err));
    });

    return { stdout: stdout.trim(), stderr: stderr.trim() };
  } finally {
    await rm(scriptFilePath, { force: true }).catch(() => {});
  }
}

// ─── Python ───────────────────────────────────────────────────────────────────

/**
 * Preamble injected before every user Python script.
 *
 * Uses sys.addaudithook (Python 3.8+) — once registered, audit hooks cannot be
 * removed by user code, so the restrictions cannot be bypassed at runtime.
 *
 * Restrictions (mirrors the Deno sandbox used for run_javascript):
 *   - Network blocked: socket creation, DNS, urllib requests
 *   - Subprocess blocked: subprocess.Popen, os.system, os.popen, os.exec*
 *   - File writes restricted to the workspace directory (CWD at script start)
 *   - File reads are unrestricted (Python stdlib imports need to read .py files)
 *
 * All sandbox variables are captured as function default-argument values so
 * they remain valid after the module-global names are deleted, preventing user
 * code from tampering with them by name.
 */
const PYTHON_SANDBOX_PREAMBLE = `\
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
# ── end sandbox ──────────────────────────────────────────────────────────────
`;

export async function runPythonImpl({ python, timeout_seconds, cwd }: { python: string; timeout_seconds?: number; cwd: string }): Promise<{ stdout: string; stderr: string }> {
  const scriptFilePath = join(os.tmpdir(), `lmstoolbox_py_${Date.now()}.py`);

  // Prepend the sandbox preamble so restrictions are in place before user code runs.
  const fullScript = PYTHON_SANDBOX_PREAMBLE + "\n" + python;

  let pythonBin: string;
  try {
    pythonBin = await getPythonPath();
  } catch (e) {
    return { stdout: "", stderr: e instanceof Error ? e.message : String(e) };
  }

  try {
    await writeFile(scriptFilePath, fullScript, "utf-8");

    const childProcess = spawn(pythonBin, [scriptFilePath], {
      cwd, timeout: (timeout_seconds ?? 5) * 1000, stdio: "pipe",
    });

    let stdout = "";
    let stderr = "";
    childProcess.stdout.setEncoding("utf-8");
    childProcess.stderr.setEncoding("utf-8");
    childProcess.stdout.on("data", data => { stdout += data; });
    childProcess.stderr.on("data", data => { stderr += data; });

    await new Promise<void>((resolve, reject) => {
      childProcess.on("close", code => { if (code === 0) resolve(); else reject(new Error(`Process exited with code ${code}. Stderr: ${stderr}`)); });
      childProcess.on("error", err => reject(err));
    });

    return { stdout: stdout.trim(), stderr: stderr.trim() };
  } finally {
    await rm(scriptFilePath, { force: true }).catch(() => {});
  }
}

// ─── Tool Factories ───────────────────────────────────────────────────────────

export function createCodeTools(ctx: ToolContext): Tool[] {
  const tools: Tool[] = [];

  tools.push(tool({
    name: "run_javascript",
    description: text`
      Run a JavaScript code snippet using deno. You cannot import external modules but you have
      read/write access to the current working directory.

      Pass the code you wish to run as a string in the 'javascript' parameter.

      By default, the code will timeout in 5 seconds. You can extend this timeout by setting the
      'timeout_seconds' parameter to a higher value in seconds, up to a maximum of 60 seconds.

      You will get the stdout and stderr output of the code execution, thus please print the output
      you wish to return using 'console.log' or 'console.error'.
    `,
    parameters: { javascript: z.string(), timeout_seconds: z.number().min(0.1).max(60).optional() },
    implementation: createSafeToolImplementation(
      ({ javascript, timeout_seconds }) => runJavascriptImpl({ javascript, timeout_seconds, cwd: ctx.cwd }),
      ctx.allowJavascript,
      "run_javascript"
    ),
  }));

  tools.push(tool({
    name: "run_python",
    description: text`
      Run a Python 3 code snippet in a sandboxed environment.

      Sandbox restrictions (Python 3.8+):
        - Network access is blocked (socket creation, DNS, urllib requests).
        - Subprocess spawning is blocked (subprocess, os.system, os.exec*).
        - File writes are restricted to the current working directory.
        - File reads are unrestricted (needed for stdlib imports).
        - Standard library modules (math, json, re, datetime, etc.) work normally.

      Pass the code you wish to run as a string in the 'python' parameter.
      Print output with print() — stdout and stderr are both returned.

      By default, the code will timeout in 5 seconds. You can extend this timeout by setting the
      'timeout_seconds' parameter to a higher value in seconds, up to a maximum of 60 seconds.
    `,
    parameters: { python: z.string(), timeout_seconds: z.number().min(0.1).max(60).optional() },
    implementation: createSafeToolImplementation(
      ({ python, timeout_seconds }) => runPythonImpl({ python, timeout_seconds, cwd: ctx.cwd }),
      ctx.allowPython,
      "run_python"
    ),
  }));

  tools.push(tool({
    name: "execute_command",
    description: text`
      Execute a shell command in the current working directory.
      Returns the stdout and stderr output of the command.
      You can optionally provide input to be piped to the command's stdin.

      IMPORTANT: The host operating system is '${process.platform}'.
      If the OS is 'win32' (Windows), do NOT use 'bash' or 'sh' commands unless you are certain WSL is available.
      Instead, use standard Windows 'cmd' or 'powershell' syntax.
    `,
    parameters: {
      command: z.string(),
      input: z.string().optional().describe("Input text to pipe to the command's stdin."),
      timeout_seconds: z.number().min(0.1).max(60).optional().describe("Timeout in seconds (default: 5, max: 60)"),
    },
    implementation: createSafeToolImplementation(
      async ({ command, input, timeout_seconds }) => {
        const childProcess = spawn(command, [], {
          cwd: ctx.cwd, shell: true, timeout: (timeout_seconds ?? 5) * 1000, stdio: "pipe",
        });

        if (input) {
          childProcess.stdin.write(input);
          childProcess.stdin.end();
        } else {
          childProcess.stdin.end();
        }

        let stdout = "";
        let stderr = "";
        childProcess.stdout.setEncoding("utf-8");
        childProcess.stderr.setEncoding("utf-8");
        childProcess.stdout.on("data", data => { stdout += data; });
        childProcess.stderr.on("data", data => { stderr += data; });

        await new Promise<void>((resolve, reject) => {
          childProcess.on("close", code => { if (code === 0) resolve(); else reject(new Error(`Process exited with code ${code}. Stderr: ${stderr}`)); });
          childProcess.on("error", err => reject(err));
        });

        return { stdout: stdout.trim(), stderr: stderr.trim() };
      },
      ctx.allowShell,
      "execute_command"
    ),
  }));

  tools.push(tool({
    name: "run_in_terminal",
    description: text`
      Launch a command in a new, separate interactive terminal window.
      Use this for scripts that require user interaction (input/output) or to open a shell in a specific directory.
      (Currently optimized for Windows).
    `,
    parameters: { command: z.string() },
    implementation: createSafeToolImplementation(
      async ({ command }) => {
        if (process.platform === "win32") {
          const escapedDir = ctx.cwd.replace(/"/g, '""');
          const escapedCmd = command.replace(/"/g, '""');
          const shellCommand = `start "" /D "${escapedDir}" cmd.exe /k "${escapedCmd}"`;
          const child = spawn("cmd.exe", ["/c", shellCommand], { detached: true, stdio: "ignore", windowsHide: false, windowsVerbatimArguments: true });
          child.unref();
        } else if (process.platform === "darwin") {
          const safeCmd = command.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
          const safeCwd = ctx.cwd.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
          const appleScript = `tell application "Terminal"\n  do script "cd \\"${safeCwd}\\" && ${safeCmd}"\n  activate\nend tell`;
          const child = spawn("osascript", ["-e", appleScript], { detached: true, stdio: "ignore" });
          child.unref();
        } else {
          const safeCwd = ctx.cwd.replace(/'/g, "'\\''");
          const safeCmd = command.replace(/'/g, "'\\''");
          const bashScript = `cd '${safeCwd}' && ${safeCmd}; bash`;
          const child = spawn("x-terminal-emulator", ["-e", "bash", "-c", bashScript], { detached: true, stdio: "ignore" });
          child.on("error", () => {
            const child2 = spawn("gnome-terminal", ["--", "bash", "-c", bashScript], { detached: true, stdio: "ignore" });
            child2.unref();
          });
          child.unref();
        }
        return { success: true, message: "Terminal window launched. Please check your taskbar." };
      },
      ctx.allowTerminal,
      "run_in_terminal"
    ),
  }));

  // --- Background Commands ---

  tools.push(tool({
    name: "run_background_command",
    description: text`
      Starts a long-running process in the background. The process is not blocked, allowing you to do other things.
      You MUST provide a timeout (max 10 hours) and a descriptive name.
    `,
    parameters: {
      command: z.string(),
      timeout_hours: z.number().min(0.01).max(10).describe("MANDATORY: How long the process is allowed to run before being killed (minimum 0.01 hours = ~36 seconds)."),
      name: z.string().describe("MANDATORY: A short, descriptive name for the background task (e.g. 'Vite Dev Server')"),
    },
    implementation: async ({ command, timeout_hours, name }) => {
      try {
        pruneBackgroundCommands();

        const timeoutMs = timeout_hours * 60 * 60 * 1000;
        const id = generateId();

        const isWindows = os.platform() === "win32";
        const shellCmd = isWindows ? "cmd.exe" : "sh";
        const shellArgs = isWindows ? ["/c", command] : ["-c", command];

        const proc = spawn(shellCmd, shellArgs, { cwd: ctx.cwd });

        const bgCmd: BackgroundCommand = {
          id, name, startTime: Date.now(), process: proc, timeoutMs,
          stdout: "", stderr: "", status: "running",
        };

        proc.stdout.on("data", (data) => {
          bgCmd.stdout += data.toString();
          if (bgCmd.stdout.length > 50000) bgCmd.stdout = bgCmd.stdout.slice(-50000);
        });
        proc.stderr.on("data", (data) => {
          bgCmd.stderr += data.toString();
          if (bgCmd.stderr.length > 50000) bgCmd.stderr = bgCmd.stderr.slice(-50000);
        });
        proc.on("close", (code) => {
          bgCmd.status = (bgCmd.status === "cancelled" || bgCmd.status === "timeout") ? bgCmd.status : "completed";
          bgCmd.exitCode = code;
          if (bgCmd.timeoutHandle) clearTimeout(bgCmd.timeoutHandle);
        });
        proc.on("error", (err) => {
          bgCmd.status = "error";
          bgCmd.stderr += `\nError: ${err.message}`;
        });

        bgCmd.timeoutHandle = setTimeout(() => {
          if (bgCmd.status === "running") { bgCmd.status = "timeout"; proc.kill("SIGKILL"); }
        }, timeoutMs);

        backgroundCommands.set(id, bgCmd);

        await new Promise(resolve => setTimeout(resolve, 500));

        return {
          id, status: bgCmd.status,
          message: `Command launched. Use check_background_command with ID ${id} to poll output.`,
          initial_stdout: bgCmd.stdout.slice(-1000),
          initial_stderr: bgCmd.stderr.slice(-1000),
        };
      } catch (e) {
        return { error: `Failed to launch: ${e instanceof Error ? e.message : String(e)}` };
      }
    },
  }));

  tools.push(tool({
    name: "check_background_command",
    description: "Check the status, stdout, and stderr of a running or completed background command.",
    parameters: { id: z.string() },
    implementation: async ({ id }) => {
      pruneBackgroundCommands();
      const bgCmd = backgroundCommands.get(id);
      if (!bgCmd) return { error: `No background command found with ID ${id}` };
      return {
        id: bgCmd.id, name: bgCmd.name, status: bgCmd.status,
        duration_seconds: Math.floor((Date.now() - bgCmd.startTime) / 1000),
        stdout_tail: bgCmd.stdout.slice(-2000),
        stderr_tail: bgCmd.stderr.slice(-2000),
        exitCode: bgCmd.exitCode,
      };
    },
  }));

  tools.push(tool({
    name: "cancel_background_command",
    description: "Kills a running background command.",
    parameters: { id: z.string() },
    implementation: async ({ id }) => {
      pruneBackgroundCommands();
      const bgCmd = backgroundCommands.get(id);
      if (!bgCmd) return { error: `No background command found with ID ${id}` };
      if (bgCmd.status !== "running") return { message: `Command is already ${bgCmd.status}` };
      bgCmd.status = "cancelled";
      bgCmd.process.kill("SIGKILL");
      if (bgCmd.timeoutHandle) clearTimeout(bgCmd.timeoutHandle);
      return { success: true, message: `Command ${id} killed.` };
    },
  }));

  tools.push(tool({
    name: "run_test_command",
    description: "Execute a test command (like 'npm test') and return the results. Specialized for capturing test output.",
    parameters: {
      command: z.string().describe("The test command to run (e.g., 'npm test', 'pytest')."),
    },
    implementation: async ({ command }, toolCtx) => {
      return new Promise(resolve => {
        const parts = command.split(" ");
        const child = spawn(parts[0], parts.slice(1), {
          cwd: ctx.cwd, shell: true, env: { ...process.env, CI: "true" },
        });
        let stdout = "";
        let stderr = "";
        let lineBuffer = "";
        child.stdout.on("data", d => {
          const chunk = d.toString();
          stdout += chunk;
          lineBuffer += chunk;
          const lines = lineBuffer.split("\n");
          lineBuffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed) toolCtx?.status?.(trimmed);
          }
        });
        child.stderr.on("data", d => { stderr += d.toString(); });
        child.on("close", code => resolve({ command, exit_code: code, stdout: stdout.trim(), stderr: stderr.trim(), passed: code === 0 }));
        child.on("error", err => resolve({ command, error: err.message, passed: false }));
      });
    },
  }));

  tools.push(tool({
    name: "analyze_project",
    description: "Run project-wide analysis (linting) to find errors and warnings.",
    parameters: {},
    implementation: async () => {
      const { readFile, readdir } = await import("fs/promises");
      const { join } = await import("path");
      const packageJsonPath = join(ctx.cwd, "package.json");
      let command = "";
      let type = "unknown";

      try {
        const pkg = JSON.parse(await readFile(packageJsonPath, "utf-8"));
        if (pkg.scripts?.lint) { command = "npm run lint"; type = "npm-script"; }
        else if (pkg.devDependencies?.eslint || pkg.dependencies?.eslint) { command = "npx eslint . --format json"; type = "eslint"; }
      } catch {
        const entries = await readdir(ctx.cwd);
        if (entries.some(f => f.endsWith(".py"))) { command = "pylint ."; type = "python-lint"; }
      }

      if (!command) return { error: "Could not detect a supported linter (ESLint script or Python)." };

      try {
        const child = spawn(command, { shell: true, cwd: ctx.cwd, timeout: 60000 });
        let stdout = "";
        let stderr = "";
        child.stdout.on("data", d => stdout += d);
        child.stderr.on("data", d => stderr += d);
        await new Promise(resolve => child.on("close", resolve));
        return { tool: command, type, report: (stdout + stderr).substring(0, 10000) };
      } catch (e) {
        return { error: `Analysis failed: ${e instanceof Error ? e.message : String(e)}` };
      }
    },
  }));

  return tools;
}
