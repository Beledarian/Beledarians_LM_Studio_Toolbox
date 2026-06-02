import { tool, type Tool } from "@lmstudio/sdk";
import { z } from "zod";
import { spawn } from "child_process";
import { writeFile, rm } from "fs/promises";
import { join } from "path";
import type { ToolContext } from "./context";

async function checkGhInstalled(): Promise<true | string> {
  try {
    const cmd = process.platform === "win32" ? "where gh" : "which gh";
    const child = spawn(cmd, [], { shell: true });
    const code = await new Promise<number | null>(resolve => child.on("close", resolve));
    if (code === 0) return true;
    return "GitHub CLI ('gh') is not installed. Please ask the user to install it from https://cli.github.com/";
  } catch {
    return "GitHub CLI ('gh') is not installed. Please ask the user to install it from https://cli.github.com/";
  }
}

function spawnCollect(cmd: string, args: string[], cwd: string): Promise<{ stdout: string; stderr: string; exitCode: number | null }> {
  return new Promise(resolve => {
    const child = spawn(cmd, args, { cwd });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", d => stdout += d);
    child.stderr.on("data", d => stderr += d);
    child.on("close", code => resolve({ stdout, stderr, exitCode: code }));
    child.on("error", err => resolve({ stdout, stderr: stderr + err.message, exitCode: -1 }));
  });
}

export function createGithubTools(ctx: ToolContext): Tool[] {
  if (!ctx.allowGitHubTools) return [];

  const tools: Tool[] = [];

  tools.push(tool({
    name: "gh_auth",
    description: "Check GitHub authentication status. If not authenticated, opens a terminal window for the user to sign in.",
    parameters: {},
    implementation: async () => {
      const check = await checkGhInstalled();
      if (typeof check === "string") return { error: check };

      const { exitCode } = await spawnCollect("gh", ["auth", "status"], ctx.cwd);
      if (exitCode === 0) return { success: true, message: "Already authenticated with GitHub." };

      // Open an interactive terminal for `gh auth login` on every platform.
      const authCmd = "gh auth login --git-protocol=https";
      if (process.platform === "win32") {
        const escapedDir = ctx.cwd.replace(/"/g, '""');
        const shellCommand = `start "" /D "${escapedDir}" cmd.exe /k "${authCmd.replace(/"/g, '""')}"`;
        spawn("cmd.exe", ["/c", shellCommand], { detached: true, stdio: "ignore", windowsVerbatimArguments: true }).unref();
      } else if (process.platform === "darwin") {
        const safeCwd = ctx.cwd.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
        const safeCmd = authCmd.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
        const appleScript = `tell application "Terminal"\n  do script "cd \\"${safeCwd}\\" && ${safeCmd}"\n  activate\nend tell`;
        spawn("osascript", ["-e", appleScript], { detached: true, stdio: "ignore" }).unref();
      } else {
        // Linux: try x-terminal-emulator, fall back to gnome-terminal
        const safeCwd = ctx.cwd.replace(/'/g, "'\\''");
        const safeCmd = authCmd.replace(/'/g, "'\\''");
        const bashScript = `cd '${safeCwd}' && ${safeCmd}`;
        const child = spawn("x-terminal-emulator", ["-e", "bash", "-c", bashScript], { detached: true, stdio: "ignore" });
        child.on("error", () => {
          spawn("gnome-terminal", ["--", "bash", "-c", bashScript], { detached: true, stdio: "ignore" }).unref();
        });
        child.unref();
      }
      return { success: true, message: "Opened a terminal window for GitHub authentication. Please sign in there." };
    },
  }));

  tools.push(tool({
    name: "gh_create_issue",
    description: "Create a new GitHub issue in the current repository.",
    parameters: {
      title: z.string(),
      body: z.string().optional(),
      labels: z.array(z.string()).optional(),
    },
    implementation: async ({ title, body, labels }) => {
      const check = await checkGhInstalled();
      if (typeof check === "string") return { error: check };

      let tempFilePath = "";
      try {
        const ghArgs = ["issue", "create", "--title", title];
        if (body) {
          tempFilePath = join(ctx.cwd, `gh_issue_body_${Date.now()}.md`);
          await writeFile(tempFilePath, body, "utf-8");
          ghArgs.push("--body-file", tempFilePath);
        }
        if (labels) labels.forEach(l => ghArgs.push("-l", l));

        const { stdout, stderr, exitCode } = await spawnCollect("gh", ghArgs, ctx.cwd);
        if (exitCode === 0) return { success: true, url: stdout.trim() };
        return { error: `Failed to create issue: ${stderr}` };
      } finally {
        if (tempFilePath) await rm(tempFilePath, { force: true });
      }
    },
  }));

  tools.push(tool({
    name: "gh_list_issues",
    description: "List issues in the current repository.",
    parameters: {
      state: z.enum(["open", "closed"]).optional().default("open"),
      labels: z.array(z.string()).optional(),
      limit: z.number().min(1).max(50).optional().default(10),
    },
    implementation: async ({ state, labels, limit }) => {
      const check = await checkGhInstalled();
      if (typeof check === "string") return { error: check };

      const ghArgs = ["issue", "list", "--state", state, "--limit", String(limit), "--json", "number,title,state,url,labels"];
      if (labels) labels.forEach(l => ghArgs.push("-l", l));

      const { stdout, stderr, exitCode } = await spawnCollect("gh", ghArgs, ctx.cwd);
      if (exitCode === 0) {
        try { return { issues: JSON.parse(stdout) }; }
        catch { return { error: "Failed to parse issue list output" }; }
      }
      return { error: `List issues failed: ${stderr}` };
    },
  }));

  tools.push(tool({
    name: "gh_view_comments",
    description: "View comments on a specific issue or pull request.",
    parameters: {
      number: z.number().describe("The issue or PR number"),
      type: z.enum(["issue", "pr"]).default("issue").describe("Whether it's an issue or a pull request"),
    },
    implementation: async ({ number, type }) => {
      const check = await checkGhInstalled();
      if (typeof check === "string") return { error: check };

      const ghArgs = type === "issue"
        ? ["issue", "view", String(number), "--json", "comments"]
        : ["pr", "view", String(number), "--json", "comments"];

      const { stdout, stderr, exitCode } = await spawnCollect("gh", ghArgs, ctx.cwd);
      if (exitCode === 0) {
        try {
          const data = JSON.parse(stdout);
          return { comments: data.comments || [] };
        } catch { return { raw_output: stdout }; }
      }
      return { error: `View comments failed: ${stderr}` };
    },
  }));

  tools.push(tool({
    name: "gh_create_pr",
    description: "Create a new pull request in the current repository.",
    parameters: {
      title: z.string(),
      body: z.string().optional(),
      head_branch: z.string().describe("The branch containing your changes"),
      base_branch: z.string().default("main").describe("The branch you want to merge into (e.g., main, master)"),
    },
    implementation: async ({ title, body, head_branch, base_branch }) => {
      const check = await checkGhInstalled();
      if (typeof check === "string") return { error: check };

      let tempFilePath = "";
      try {
        const ghArgs = ["pr", "create", "--title", title, "--head", head_branch, "--base", base_branch];
        if (body) {
          tempFilePath = join(ctx.cwd, `gh_pr_body_${Date.now()}.md`);
          await writeFile(tempFilePath, body, "utf-8");
          ghArgs.push("--body-file", tempFilePath);
        }

        const { stdout, stderr, exitCode } = await spawnCollect("gh", ghArgs, ctx.cwd);
        if (exitCode === 0) return { success: true, url: stdout.trim() };
        return { error: `Failed to create PR: ${stderr}` };
      } finally {
        if (tempFilePath) await rm(tempFilePath, { force: true });
      }
    },
  }));

  tools.push(tool({
    name: "gh_list_prs",
    description: "List pull requests in the current repository.",
    parameters: {
      state: z.enum(["open", "closed"]).optional().default("open"),
      limit: z.number().min(1).max(50).optional().default(10),
    },
    implementation: async ({ state, limit }) => {
      const check = await checkGhInstalled();
      if (typeof check === "string") return { error: check };

      const ghArgs = ["pr", "list", "--state", state, "--limit", String(limit), "--json", "number,title,state,url,headRefName,baseRefName"];
      const { stdout, stderr, exitCode } = await spawnCollect("gh", ghArgs, ctx.cwd);
      if (exitCode === 0) {
        try { return { pull_requests: JSON.parse(stdout) }; }
        catch { return { error: "Failed to parse PR list output" }; }
      }
      return { error: `List PRs failed: ${stderr}` };
    },
  }));

  tools.push(tool({
    name: "gh_view_pr_diff",
    description: "Fetch the diff/patch of a specific pull request.",
    parameters: {
      number: z.number().describe("The PR number"),
    },
    implementation: async ({ number }) => {
      const check = await checkGhInstalled();
      if (typeof check === "string") return { error: check };

      const { stdout, stderr, exitCode } = await spawnCollect("gh", ["pr", "diff", String(number)], ctx.cwd);
      if (exitCode === 0) {
        return { diff: stdout.substring(0, 50000) + (stdout.length > 50000 ? "\n... (truncated)" : "") };
      }
      return { error: `Fetch PR diff failed: ${stderr}` };
    },
  }));

  tools.push(tool({
    name: "gh_push",
    description: "Push local commits to the remote GitHub repository.",
    parameters: {
      branch: z.string().optional().describe("Optional: The branch to push. Defaults to current branch."),
    },
    implementation: async ({ branch }) => {
      const check = await checkGhInstalled();
      if (typeof check === "string") return { error: check };

      const gitArgs = ["push", "origin"];
      if (branch) gitArgs.push(branch);

      const { stderr, exitCode } = await spawnCollect("git", gitArgs, ctx.cwd);
      if (exitCode === 0) return { success: true, message: "Pushed successfully." };
      return { error: `Git push failed: ${stderr}` };
    },
  }));

  return tools;
}
