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
    description: "Get the git diff of the current repository or specific files. Use word_diff: true for prose/documentation changes — LLMs parse word-level diffs more accurately than line-level.",
    parameters: {
      file_path: z.string().optional().describe("Optional: Path to specific file to diff."),
      cached: z.boolean().optional().describe("Optional: Show staged changes only (git diff --cached)."),
      word_diff: z.boolean().optional().default(false).describe("If true, show word-level diff (--word-diff=plain). Better for prose and documentation changes."),
    },
    implementation: async ({ file_path, cached, word_diff = false }) => {
      const { simpleGit } = await import("simple-git");
      const git = simpleGit(ctx.cwd);
      try {
        const args: string[] = [];
        if (cached) args.push("--cached");
        if (word_diff) args.push("--word-diff=plain");
        if (file_path) args.push(validatePath(ctx.cwd, file_path, ctx.protectedPaths));
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
          const validatedPaths = paths.map(p => validatePath(ctx.cwd, p, ctx.protectedPaths));
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
          ...(force && { warning: "Force-push was used. Remote history has been rewritten." }),
        };
      } catch (e) {
        return { error: `Git push failed: ${e instanceof Error ? e.message : String(e)}` };
      }
    },
  }));

  // ── Phase K additions ──────────────────────────────────────────────────────

  tools.push(tool({
    name: "git_stash",
    description: "Stash or restore uncommitted changes. Actions: 'push' saves working-tree changes (with optional message), 'pop' restores the latest stash, 'list' shows all stashes, 'drop' discards the latest stash.",
    parameters: {
      action: z.enum(["push", "pop", "list", "drop"]).default("push").describe("Stash operation to perform."),
      message: z.string().optional().describe("Optional description for 'push' (e.g. 'WIP: half-done feature')."),
    },
    implementation: async ({ action, message }) => {
      const { simpleGit } = await import("simple-git");
      const git = simpleGit(ctx.cwd);
      try {
        switch (action) {
          case "push": {
            const args = message ? ["stash", "push", "-m", message] : ["stash", "push"];
            await git.raw(args);
            return { success: true, message: "Changes stashed successfully." };
          }
          case "pop": {
            await git.raw(["stash", "pop"]);
            return { success: true, message: "Latest stash applied and removed." };
          }
          case "list": {
            const result = await git.raw(["stash", "list"]);
            return { stashes: result.trim() || "No stashes found." };
          }
          case "drop": {
            await git.raw(["stash", "drop"]);
            return { success: true, message: "Latest stash dropped." };
          }
        }
      } catch (e) {
        return { error: `git stash ${action} failed: ${e instanceof Error ? e.message : String(e)}` };
      }
    },
  }));

  tools.push(tool({
    name: "git_reset",
    description: "Unstage files or roll back commits. Mode 'soft' keeps changes staged; 'mixed' (default) unstages them. Hard reset is intentionally unsupported — use git_checkout to discard file changes. Optionally specify paths to unstage specific files only.",
    parameters: {
      target: z.string().optional().default("HEAD").describe("Commit ref to reset to (default: HEAD). Examples: HEAD~1, abc1234."),
      mode: z.enum(["soft", "mixed"]).optional().default("mixed").describe("'soft' keeps staged, 'mixed' unstages."),
      paths: z.array(z.string()).optional().describe("If provided, only unstages these specific files (ignores mode)."),
    },
    implementation: async ({ target = "HEAD", mode = "mixed", paths }) => {
      const { simpleGit } = await import("simple-git");
      const git = simpleGit(ctx.cwd);
      try {
        if (paths && paths.length > 0) {
          const valid = paths.map(p => validatePath(ctx.cwd, p, ctx.protectedPaths));
          await git.raw(["reset", "HEAD", "--", ...valid]);
          return { success: true, message: `Unstaged: ${paths.join(", ")}` };
        }
        await git.raw(["reset", `--${mode}`, target]);
        return { success: true, message: `Reset to ${target} (--${mode}).` };
      } catch (e) {
        return { error: `Git reset failed: ${e instanceof Error ? e.message : String(e)}` };
      }
    },
  }));

  tools.push(tool({
    name: "git_branch",
    description: "List, create, or delete git branches.",
    parameters: {
      action: z.enum(["list", "create", "delete"]).default("list").describe("Branch action to perform."),
      name: z.string().optional().describe("Branch name — required for create and delete."),
      all: z.boolean().optional().default(false).describe("For 'list': include remote-tracking branches (-a)."),
    },
    implementation: async ({ action, name, all = false }) => {
      const { simpleGit } = await import("simple-git");
      const git = simpleGit(ctx.cwd);
      try {
        switch (action) {
          case "list": {
            const branches = await git.branch(all ? ["-a"] : []);
            return { current: branches.current, branches: Object.keys(branches.branches) };
          }
          case "create": {
            if (!name) return { error: "Branch name is required for 'create'." };
            await git.raw(["branch", name]);
            return { success: true, message: `Branch '${name}' created. Use git_checkout to switch to it.` };
          }
          case "delete": {
            if (!name) return { error: "Branch name is required for 'delete'." };
            await git.raw(["branch", "-d", name]);
            return { success: true, message: `Branch '${name}' deleted.` };
          }
        }
      } catch (e) {
        return { error: `Git branch ${action} failed: ${e instanceof Error ? e.message : String(e)}` };
      }
    },
  }));

  tools.push(tool({
    name: "git_merge",
    description: "Merge a branch into the current branch. Fast-forward by default; use no_ff to always create a merge commit.",
    parameters: {
      branch: z.string().describe("Name of the branch to merge into the current branch."),
      no_ff: z.boolean().optional().default(false).describe("If true, always create a merge commit even when a fast-forward is possible."),
      message: z.string().optional().describe("Optional commit message for the merge commit."),
    },
    implementation: async ({ branch, no_ff = false, message }) => {
      const { simpleGit } = await import("simple-git");
      const git = simpleGit(ctx.cwd);
      try {
        const args: string[] = [branch];
        if (no_ff) args.push("--no-ff");
        if (message) args.push("-m", message);
        await git.merge(args);
        return { success: true, message: `Merged '${branch}' into current branch.` };
      } catch (e) {
        return { error: `Git merge failed: ${e instanceof Error ? e.message : String(e)}` };
      }
    },
  }));

  tools.push(tool({
    name: "git_fetch",
    description: "Fetch updates from a remote repository without merging into the current branch.",
    parameters: {
      remote: z.string().optional().default("origin").describe("Remote name to fetch from (default: 'origin')."),
      prune: z.boolean().optional().default(false).describe("If true, removes stale remote-tracking refs that no longer exist on the remote (--prune)."),
    },
    implementation: async ({ remote = "origin", prune = false }) => {
      const { simpleGit } = await import("simple-git");
      const git = simpleGit(ctx.cwd);
      try {
        const args = ["fetch", remote];
        if (prune) args.push("--prune");
        await git.raw(args);
        return { success: true, message: `Fetched from '${remote}'${prune ? " (pruned stale refs)" : ""}.` };
      } catch (e) {
        return { error: `Git fetch failed: ${e instanceof Error ? e.message : String(e)}` };
      }
    },
  }));

  return tools;
}
