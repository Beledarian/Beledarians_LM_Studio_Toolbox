import { spawn } from "child_process";
import { resolve } from "path";

/**
 * Validates that a resolved path stays within the allowed base directory.
 * Prevents path traversal attacks.
 */
export function validatePath(baseDir: string, requestedPath: string): string {
  const resolved = resolve(baseDir, requestedPath);
  if (!resolved.startsWith(resolve(baseDir))) {
    throw new Error(`Access denied: '${requestedPath}' is outside the workspace.`);
  }
  return resolved;
}

/**
 * Runs a child process and returns stdout/stderr.
 */
export function runProcess(
  command: string,
  args: string[],
  options: {
    cwd: string;
    shell?: boolean;
    timeout?: number;
    input?: string;
    env?: Record<string, string>;
  },
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      shell: options.shell ?? false,
      timeout: options.timeout ?? 30_000,
      stdio: "pipe",
      env: options.env ? { ...process.env, ...options.env } : undefined,
    });

    if (options.input) {
      child.stdin.write(options.input);
    }
    child.stdin.end();

    let stdout = "";
    let stderr = "";

    child.stdout.setEncoding("utf-8");
    child.stderr.setEncoding("utf-8");
    child.stdout.on("data", (d) => (stdout += d));
    child.stderr.on("data", (d) => (stderr += d));

    child.on("close", (code) => {
      resolve({ stdout: stdout.trim(), stderr: stderr.trim(), exitCode: code ?? 1 });
    });

    child.on("error", (err) => {
      reject(new Error(`Failed to spawn process: ${err.message}`));
    });
  });
}
