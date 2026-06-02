import { tool, type Tool } from "@lmstudio/sdk";
import { z } from "zod";
import type { ToolContext } from "./context";
import { validatePath } from "./helpers";

export function createGitTools(ctx: ToolContext): Tool[] {
  if (!ctx.allowGit) return [];

  const tools: Tool[] = [];

  tools.push(tool({
    name: "git_status",
    description: "Get the current git status of the repository.",
    parameters: {},
    implementation: async () => {
      const { simpleGit } = await import("simple-git");
      const git = simpleGit(ctx.cwd);
      try {
        return await git.status();
      } catch (e) {
        return { error: `Git status failed: ${e instanceof Error ? e.message : String(e)}` };
      }
    },
  }));

  tools.push(tool({
    name: "git_diff",
    description: "Get the git diff of the current repository or specific files.",
    parameters: {
      file_path: z.string().optional().describe("Optional: Path to specific file to diff."),
      cached: z.boolean().optional().describe("Optional: Show staged changes only (git diff --cached)."),
    },
    implementation: async ({ file_path, cached }) => {
      const { simpleGit } = await import("simple-git");
      const git = simpleGit(ctx.cwd);
      try {
        const args: string[] = [];
        if (cached) args.push("--cached");
        if (file_path) args.push(validatePath(ctx.cwd, file_path));
        const diff = await git.diff(args);
        return { diff: diff || "No changes." };
      } catch (e) {
        return { error: `Git diff failed: ${e instanceof Error ? e.message : String(e)}` };
      }
    },
  }));

  tools.push(tool({
    name: "git_commit",
    description: "Commit staged changes to the git repository.",
    parameters: {
      message: z.string(),
    },
    implementation: async ({ message }) => {
      const { simpleGit } = await import("simple-git");
      const git = simpleGit(ctx.cwd);
      try {
        const result = await git.commit(message);
        return { success: true, summary: result.summary };
      } catch (e) {
        return { error: `Git commit failed: ${e instanceof Error ? e.message : String(e)}` };
      }
    },
  }));

  tools.push(tool({
    name: "git_log",
    description: "Get recent git commit history.",
    parameters: {
      max_count: z.number().optional().describe("Max number of commits to return (default: 10)"),
    },
    implementation: async ({ max_count = 10 }) => {
      const { simpleGit } = await import("simple-git");
      const git = simpleGit(ctx.cwd);
      try {
        const log = await git.log({ maxCount: max_count });
        return { history: log.all };
      } catch (e) {
        return { error: `Git log failed: ${e instanceof Error ? e.message : String(e)}` };
      }
    },
  }));

  tools.push(tool({
    name: "git_add",
    description: "Stage specific files or all changes for the next commit.",
    parameters: {
      paths: z.array(z.string()).optional().describe("Optional: Specific file paths to stage. If omitted, stages all changes."),
    },
    implementation: async ({ paths }) => {
      const { simpleGit } = await import("simple-git");
      const git = simpleGit(ctx.cwd);
      try {
        if (paths && paths.length > 0) {
          const validatedPaths = paths.map(p => validatePath(ctx.cwd, p));
          await git.add(validatedPaths);
        } else {
          await git.add(".");
        }
        return { success: true, message: "Files staged successfully." };
      } catch (e) {
        return { error: `Git add failed: ${e instanceof Error ? e.message : String(e)}` };
      }
    },
  }));

  tools.push(tool({
    name: "git_checkout",
    description: "Switch to an existing branch or create and switch to a new one.",
    parameters: {
      branch_name: z.string().describe("Name of the branch to checkout."),
      create_new: z.boolean().optional().default(false).describe("If true, creates the branch if it doesn't exist (like git checkout -b)."),
    },
    implementation: async ({ branch_name, create_new = false }) => {
      const { simpleGit } = await import("simple-git");
      const git = simpleGit(ctx.cwd);
      try {
        if (create_new) {
          await git.checkout(["-b", branch_name]);
        } else {
          await git.checkout(branch_name);
        }
        return { success: true, message: `Switched to branch '${branch_name}'.` };
      } catch (e) {
        return { error: `Git checkout failed: ${e instanceof Error ? e.message : String(e)}` };
      }
    },
  }));

  tools.push(tool({
    name: "git_pull",
    description: "Pull the latest changes from a remote repository into the current branch. Equivalent to `git pull [remote] [branch]`.",
    parameters: {
      remote: z.string().optional().default("origin").describe("Remote name to pull from (default: 'origin')."),
      branch: z.string().optional().describe("Branch to pull (default: current branch)."),
      rebase: z.boolean().optional().default(false).describe("If true, rebase instead of merge (git pull --rebase)."),
    },
    implementation: async ({ remote = "origin", branch, rebase = false }) => {
      const { simpleGit } = await import("simple-git");
      const git = simpleGit(ctx.cwd);
      try {
        const options: string[] = [];
        if (rebase) options.push("--rebase");
        const result = await git.pull(remote, branch ?? undefined, options.length ? options : undefined);
        return {
          success: true,
          summary: result.summary,
          files: result.files,
          insertions: result.insertions,
          deletions: result.deletions,
        };
      } catch (e) {
        return { error: `Git pull failed: ${e instanceof Error ? e.message : String(e)}` };
      }
    },
  }));

  tools.push(tool({
    name: "git_push",
    description: "Push committed changes to a remote repository. Equivalent to `git push [remote] [branch]`.",
    parameters: {
      remote: z.string().optional().default("origin").describe("Remote name to push to (default: 'origin')."),
      branch: z.string().optional().describe("Branch to push (default: current branch)."),
      set_upstream: z.boolean().optional().default(false).describe("If true, sets the upstream tracking reference (git push -u). Use when pushing a new branch for the first time."),
      force: z.boolean().optional().default(false).describe("If true, force-pushes. Use with caution — this rewrites remote history."),
    },
    implementation: async ({ remote = "origin", branch, set_upstream = false, force = false }) => {
      const { simpleGit } = await import("simple-git");
      const git = simpleGit(ctx.cwd);
      try {
        // Resolve current branch name if none supplied
        const targetBranch = branch ?? (await git.revparse(["--abbrev-ref", "HEAD"])).trim();
        const options: Record<string, null | string> = {};
        if (set_upstream) options["--set-upstream"] = null;
        if (force) options["--force"] = null;
        const result = await git.push(remote, targetBranch, options);
        return {
          success: true,
          remote: result.remoteMessages,
          pushed: result.pushed,
        };
      } catch (e) {
        return { error: `Git push failed: ${e instanceof Error ? e.message : String(e)}` };
      }
    },
  }));

  return tools;
}
