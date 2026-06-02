import { tool, text, type Tool } from "@lmstudio/sdk";
import { z } from "zod";
import { rm, writeFile, readdir, readFile, stat, mkdir, rename, copyFile, appendFile as fsAppendFile } from "fs/promises";
import { join, resolve, dirname, relative } from "path";
import type { ToolContext } from "./context";
import { validatePath } from "./helpers";
import { rankFuzzyMatches } from "../fuzzySearch";
import { savePersistedState } from "../stateManager";

export function createFileTools(ctx: ToolContext): Tool[] {
  const tools: Tool[] = [];

  // ─── Navigation ─────────────────────────────────────────────────────────────

  tools.push(tool({
    name: "change_directory",
    description: text`
      Change the current working directory.
      Returns the new current working directory.
    `,
    parameters: { directory: z.string() },
    implementation: async ({ directory }) => {
      // Use resolve() not validatePath() — the model must be able to navigate
      // to parent dirs ("..") and absolute paths, not just workspace subdirs.
      const newPath = resolve(ctx.cwd, directory);
      const stats = await stat(newPath);
      if (!stats.isDirectory()) throw new Error(`Path is not a directory: ${newPath}`);
      const previous = ctx.cwd;
      ctx.cwd = newPath;
      ctx.fullState.currentWorkingDirectory = newPath;
      await savePersistedState(ctx.fullState);
      return { previous_directory: previous, current_directory: ctx.cwd };
    },
  }));

  tools.push(tool({
    name: "list_directory",
    description: "List the files and directories in the current working directory or a specified subdirectory.",
    parameters: {
      path: z.string().optional().describe("The path to the directory to list. Defaults to current working directory."),
    },
    implementation: async ({ path }) => {
      const targetPath = path ? validatePath(ctx.cwd, path) : ctx.cwd;
      return { files: await readdir(targetPath) };
    },
  }));

  // ─── Read ────────────────────────────────────────────────────────────────────

  tools.push(tool({
    name: "read_file",
    description: "Read the content of a file in the current working directory.",
    parameters: { file_name: z.string() },
    implementation: async ({ file_name }) => {
      const filePath = validatePath(ctx.cwd, file_name);
      const stats = await stat(filePath);
      if (stats.size > 10_000_000) return { error: "File too large (>10MB)" };

      const buffer = await readFile(filePath);
      const checkBuffer = buffer.subarray(0, Math.min(buffer.length, 1024));
      if (checkBuffer.includes(0)) return { error: "File appears to be binary and cannot be read as text." };

      return { content: buffer.toString("utf-8") };
    },
  }));

  tools.push(tool({
    name: "read_file_range",
    description: text`
      Read a specific range of lines from a file.
      Returns the content with line numbers for easy reference.
      Line numbers are 1-indexed (line 1 is the first line).
    `,
    parameters: {
      file_name: z.string(),
      start_line: z.number().int().min(1).describe("Starting line number (1-indexed)"),
      end_line: z.number().int().min(1).describe("Ending line number (1-indexed, inclusive)"),
    },
    implementation: async ({ file_name, start_line, end_line }) => {
      try {
        const filePath = validatePath(ctx.cwd, file_name);
        const content = await readFile(filePath, "utf-8");
        const lines = content.split("\n");

        if (start_line > lines.length) return { error: `Start line ${start_line} is beyond the end of the file (${lines.length} lines)` };

        const actualEndLine = Math.min(end_line, lines.length);
        const selectedLines = lines.slice(start_line - 1, actualEndLine);
        const numberedContent = selectedLines.map((line, idx) => `${start_line + idx}: ${line}`).join("\n");

        return { file_name, start_line, end_line: actualEndLine, line_count: selectedLines.length, content_with_line_numbers: numberedContent };
      } catch (e) {
        return { error: `Failed to read file range: ${e instanceof Error ? e.message : String(e)}` };
      }
    },
  }));

  // ─── Write / Create ──────────────────────────────────────────────────────────

  tools.push(tool({
    name: "save_file",
    description: text`
      Save content to a specified file in the current working directory.
      This tool returns the full path to the saved file. You should then
      output this full path to the user.
    `,
    parameters: {
      file_name: z.string().optional(),
      content: z.string().optional(),
      files: z.array(z.object({ file_name: z.string(), content: z.string() })).optional().describe("For saving multiple files at once."),
    },
    implementation: async ({ file_name, content, files }) => {
      const filesToSave = Array.isArray(files) ? [...files] : [];
      if (file_name && content) filesToSave.push({ file_name, content });
      if (filesToSave.length === 0) return { error: "Must provide either file_name and content, or a files array." };

      const savedPaths: string[] = [];
      const errors: string[] = [];

      for (const file of filesToSave) {
        if (!file.file_name?.trim()) { errors.push("Filename cannot be empty"); continue; }
        if (/[ \*\?<>|"]/.test(file.file_name)) { errors.push(`Filename ${file.file_name} contains invalid characters`); continue; }
        try {
          const filePath = validatePath(ctx.cwd, file.file_name);
          await mkdir(dirname(filePath), { recursive: true });
          await writeFile(filePath, file.content, "utf-8");
          savedPaths.push(filePath);
        } catch (e) {
          errors.push(`Failed to save ${file.file_name}: ${e instanceof Error ? e.message : String(e)}`);
        }
      }

      if (errors.length > 0 && savedPaths.length === 0) return { error: errors.join("\n") };
      return { success: true, paths: savedPaths, errors: errors.length > 0 ? errors : undefined };
    },
  }));

  tools.push(tool({
    name: "append_file",
    description: text`
      Append content to the end of a file.
      If the file doesn't exist, it will be created.
      Useful for adding logs, entries, or building files incrementally.
    `,
    parameters: {
      file_name: z.string(),
      content: z.string().describe("The text content to append to the file"),
    },
    implementation: async ({ file_name, content }) => {
      try {
        const filePath = validatePath(ctx.cwd, file_name);
        await mkdir(dirname(filePath), { recursive: true });
        await fsAppendFile(filePath, content, "utf-8");
        return { success: true, message: `Content appended to ${file_name}` };
      } catch (e) {
        return { error: `Failed to append to file: ${e instanceof Error ? e.message : String(e)}` };
      }
    },
  }));

  tools.push(tool({
    name: "insert_at_line",
    description: text`
      Insert content at a specific line number in a file.
      The line_number is 1-indexed (line 1 is the first line).
      Existing content at that line and below will be pushed down.
    `,
    parameters: {
      file_name: z.string(),
      line_number: z.number().int().min(1).describe("The line number to insert at (1-indexed)"),
      content_to_insert: z.string().describe("The text content to insert at the specified line"),
    },
    implementation: async ({ file_name, line_number, content_to_insert }) => {
      try {
        const filePath = validatePath(ctx.cwd, file_name);
        let content = "";
        try { content = await readFile(filePath, "utf-8"); }
        catch { if (line_number !== 1) return { error: `File '${file_name}' does not exist. Can only insert at line 1 in a new file.` }; }

        const lines = content.split("\n");
        const insertIndex = Math.min(line_number - 1, lines.length);
        lines.splice(insertIndex, 0, content_to_insert);
        await writeFile(filePath, lines.join("\n"), "utf-8");

        return { success: true, message: `Inserted ${content_to_insert.split("\n").length} line(s) at line ${line_number} in ${file_name}`, new_line_count: lines.length };
      } catch (e) {
        return { error: `Failed to insert text: ${e instanceof Error ? e.message : String(e)}` };
      }
    },
  }));

  // ─── Edit ────────────────────────────────────────────────────────────────────

  tools.push(tool({
    name: "replace_text_in_file",
    description: text`
      Replace a specific string in a file with a new string.
      Useful for making small edits without rewriting the entire file.
      Ensure 'old_string' matches exactly (including whitespace) or the replace will fail.
    `,
    parameters: {
      file_name: z.string(),
      old_string: z.string().describe("The exact text to replace. Must be unique in the file."),
      new_string: z.string().describe("The text to insert in place of old_string."),
    },
    implementation: async ({ file_name, old_string, new_string }) => {
      try {
        if (!old_string) return { error: "old_string cannot be empty" };
        const filePath = validatePath(ctx.cwd, file_name);
        const content = await readFile(filePath, "utf-8");
        if (!content.includes(old_string)) return { error: "Could not find the exact 'old_string' in the file. Please check whitespace and indentation." };
        const occurrenceCount = content.split(old_string).length - 1;
        if (occurrenceCount > 1) return { error: `Found ${occurrenceCount} occurrences of 'old_string'. Please provide more context (surrounding lines) in 'old_string' to make it unique.` };
        await writeFile(filePath, content.replace(old_string, new_string), "utf-8");
        return { success: true, message: `Successfully replaced text in ${file_name}` };
      } catch (e) {
        return { error: `Failed to replace text: ${e instanceof Error ? e.message : String(e)}` };
      }
    },
  }));

  tools.push(tool({
    name: "multi_replace_text",
    description: text`
      Replace multiple scattered text blocks in a single file safely.
      Each replacement must specify start_line, end_line, old_string, and new_string.
      The old_string must perfectly match what is currently in the file.
    `,
    parameters: {
      file_name: z.string(),
      replacements: z.array(z.object({
        start_line: z.number().int().min(1),
        end_line: z.number().int().min(1),
        old_string: z.string(),
        new_string: z.string(),
      })).describe("Array of replacements to make in the file"),
    },
    implementation: async ({ file_name, replacements }) => {
      try {
        const filePath = validatePath(ctx.cwd, file_name);
        const content = await readFile(filePath, "utf-8");
        let lines = content.split("\n");
        const errors: string[] = [];

        const sortedReplacements = [...replacements].sort((a, b) => b.start_line - a.start_line);

        for (const rep of sortedReplacements) {
          if (rep.start_line > rep.end_line) { errors.push(`Invalid range: start_line ${rep.start_line} > end_line ${rep.end_line}`); continue; }
          const chunk = lines.slice(rep.start_line - 1, rep.end_line).join("\n");
          if (!chunk.includes(rep.old_string)) { errors.push(`Could not find old_string between lines ${rep.start_line}-${rep.end_line}`); continue; }
          const newChunkLines = chunk.replace(rep.old_string, rep.new_string).split("\n");
          lines.splice(rep.start_line - 1, rep.end_line - rep.start_line + 1, ...newChunkLines);
        }

        if (errors.length > 0) return { error: "Replacements failed:\n" + errors.join("\n") };
        await writeFile(filePath, lines.join("\n"), "utf-8");
        return { success: true, message: `Applied ${replacements.length} replacements to ${file_name}` };
      } catch (e) {
        return { error: `Failed to multi-replace: ${e instanceof Error ? e.message : String(e)}` };
      }
    },
  }));

  tools.push(tool({
    name: "delete_lines_in_file",
    description: text`
      Delete a specific line or range of lines from a file.
      Line numbers are 1-indexed (line 1 is the first line).
      If end_line is omitted, only start_line will be deleted.
    `,
    parameters: {
      file_name: z.string(),
      start_line: z.number().int().min(1),
      end_line: z.number().int().min(1).optional(),
    },
    implementation: async ({ file_name, start_line, end_line }) => {
      try {
        const filePath = validatePath(ctx.cwd, file_name);
        let content: string;
        try { content = await readFile(filePath, "utf-8"); }
        catch { return { error: `File '${file_name}' does not exist.` }; }

        const lines = content.split("\n");
        const actualEndLine = end_line ?? start_line;
        if (start_line > lines.length) return { error: `Start line ${start_line} is beyond the end of the file (${lines.length} lines)` };

        const deleteCount = Math.min(actualEndLine - start_line + 1, lines.length - start_line + 1);
        if (deleteCount <= 0) return { error: "Invalid line range. End line must be >= Start line." };

        lines.splice(start_line - 1, deleteCount);
        await writeFile(filePath, lines.join("\n"), "utf-8");
        return { success: true, message: `Deleted ${deleteCount} line(s) (lines ${start_line}-${actualEndLine}) from ${file_name}`, new_line_count: lines.length };
      } catch (e) {
        return { error: `Failed to delete lines: ${e instanceof Error ? e.message : String(e)}` };
      }
    },
  }));

  // ─── Delete / Move / Copy ────────────────────────────────────────────────────

  tools.push(tool({
    name: "delete_path",
    description: "Delete a file or directory in the current working directory. Be careful!",
    parameters: { path: z.string() },
    implementation: async ({ path }) => {
      const targetPath = validatePath(ctx.cwd, path);
      await rm(targetPath, { recursive: true, force: true });
      return { success: true, path: targetPath };
    },
  }));

  tools.push(tool({
    name: "delete_files_by_pattern",
    description: "Delete multiple files in the current directory that match a regex pattern.",
    parameters: {
      pattern: z.string().describe("Regex pattern to match filenames (e.g., '^auto_gen_.*\\.txt$')"),
    },
    implementation: async ({ pattern }) => {
      try {
        if (pattern.length > 100) return { error: "Pattern too complex (max 100 characters)" };
        const regex = new RegExp(pattern);
        const start = Date.now();
        regex.test("safe_test_string_for_redos_check_1234567890_safe_test_string_for_redos_check_1234567890");
        if (Date.now() - start > 100) return { error: "Pattern is too complex or slow (ReDoS protection)." };

        const files = await readdir(ctx.cwd);
        const deleted: string[] = [];
        for (const file of files) {
          if (regex.test(file)) {
            await rm(join(ctx.cwd, file), { force: true });
            deleted.push(file);
          }
        }
        return { deleted_count: deleted.length, deleted_files: deleted };
      } catch (e) {
        return { error: `Failed to delete files: ${e instanceof Error ? e.message : String(e)}` };
      }
    },
  }));

  tools.push(tool({
    name: "move_file",
    description: "Move or rename a file or directory.",
    parameters: { source: z.string(), destination: z.string() },
    implementation: async ({ source, destination }) => {
      const sourcePath = validatePath(ctx.cwd, source);
      const destPath = validatePath(ctx.cwd, destination);
      await rename(sourcePath, destPath);
      return { success: true, from: sourcePath, to: destPath };
    },
  }));

  tools.push(tool({
    name: "copy_file",
    description: "Copy a file to a new location.",
    parameters: { source: z.string(), destination: z.string() },
    implementation: async ({ source, destination }) => {
      const sourcePath = validatePath(ctx.cwd, source);
      const destPath = validatePath(ctx.cwd, destination);
      await copyFile(sourcePath, destPath);
      return { success: true, from: sourcePath, to: destPath };
    },
  }));

  tools.push(tool({
    name: "make_directory",
    description: "Create a new directory in the current working directory.",
    parameters: { directory_name: z.string() },
    implementation: async ({ directory_name }) => {
      const dirPath = validatePath(ctx.cwd, directory_name);
      await mkdir(dirPath, { recursive: true });
      return { success: true, path: dirPath };
    },
  }));

  // ─── Search / Find ───────────────────────────────────────────────────────────

  tools.push(tool({
    name: "search_directory",
    description: text`
      Search an entire directory for a regex pattern (like grep).
      Returns matching file paths and line numbers.
    `,
    parameters: {
      directory_path: z.string().optional().describe("Directory to search. Defaults to workspace root."),
      pattern: z.string().describe("Regex pattern or string to search for"),
      use_regex: z.boolean().optional().default(false),
    },
    implementation: async ({ directory_path, pattern, use_regex }) => {
      try {
        const targetDir = directory_path ? validatePath(ctx.cwd, directory_path) : ctx.cwd;
        const regex = new RegExp(use_regex ? pattern : pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        const results: string[] = [];
        let searchedCount = 0;

        async function search(dir: string) {
          const files = await readdir(dir);
          for (const file of files) {
            if (file === "node_modules" || file === ".git" || file.startsWith(".")) continue;
            const fullPath = join(dir, file);
            const st = await stat(fullPath);
            if (st.isDirectory()) {
              await search(fullPath);
            } else if (st.isFile()) {
              if (st.size > 2000000) continue;
              try {
                const content = await readFile(fullPath, "utf-8");
                if (content.includes("\0")) continue;
                const lines = content.split("\n");
                for (let i = 0; i < lines.length; i++) {
                  if (lines[i].match(regex)) {
                    results.push(`${relative(ctx.cwd, fullPath)}:${i + 1} => ${lines[i].trim()}`);
                    if (results.length >= 100) return;
                  }
                }
                searchedCount++;
              } catch { /* ignore unreadable files */ }
            }
          }
        }

        await search(targetDir);
        if (results.length === 0) return { message: `No matches found. Searched ${searchedCount} files.` };
        return { matches: results, message: `Found ${results.length} matches across ${searchedCount} files searched.` };
      } catch (e) {
        return { error: `Search failed: ${e instanceof Error ? e.message : String(e)}` };
      }
    },
  }));

  tools.push(tool({
    name: "search_in_file",
    description: text`
      Search for a pattern within a single file (grep-like functionality).
      Returns matching lines with their line numbers.
      The pattern can be a simple substring or a regex pattern.
    `,
    parameters: {
      file_name: z.string(),
      pattern: z.string().describe("Search pattern (substring or regex)"),
      case_sensitive: z.boolean().optional().default(false),
      use_regex: z.boolean().optional().default(false),
    },
    implementation: async ({ file_name, pattern, case_sensitive = false, use_regex = false }) => {
      try {
        const filePath = validatePath(ctx.cwd, file_name);
        const content = await readFile(filePath, "utf-8");
        const lines = content.split("\n");
        const matches: Array<{ line_number: number; content: string }> = [];

        for (let i = 0; i < lines.length; i++) {
          let line = lines[i];
          let searchPattern = pattern;
          if (!case_sensitive) { line = line.toLowerCase(); searchPattern = pattern.toLowerCase(); }

          let isMatch = false;
          if (use_regex) {
            try { isMatch = new RegExp(searchPattern).test(line); }
            catch (e) { return { error: `Invalid regex pattern: ${e instanceof Error ? e.message : String(e)}` }; }
          } else {
            isMatch = line.includes(searchPattern);
          }
          if (isMatch) matches.push({ line_number: i + 1, content: lines[i] });
        }

        return {
          file_name, pattern, match_count: matches.length, matches: matches.slice(0, 100),
          note: matches.length > 100 ? `Showing first 100 of ${matches.length} matches` : undefined,
        };
      } catch (e) {
        return { error: `Failed to search file: ${e instanceof Error ? e.message : String(e)}` };
      }
    },
  }));

  tools.push(tool({
    name: "find_files",
    description: "Find files recursively in the current directory matching a name pattern.",
    parameters: {
      pattern: z.string().describe("Substring to match in filename (case-insensitive)"),
      max_depth: z.number().optional().describe("Maximum depth to search (default: 5)"),
    },
    implementation: async ({ pattern, max_depth }) => {
      const depthLimit = max_depth ?? 5;
      const foundFiles: string[] = [];
      const lowerPattern = pattern.toLowerCase();

      async function scan(dir: string, currentDepth: number) {
        if (currentDepth > depthLimit) return;
        try {
          const entries = await readdir(dir, { withFileTypes: true });
          for (const entry of entries) {
            if (["node_modules", ".git", "dist", ".lmstudio"].includes(entry.name)) continue;
            const fullPath = join(dir, entry.name);
            if (entry.isDirectory()) await scan(fullPath, currentDepth + 1);
            else if (entry.isFile() && entry.name.toLowerCase().includes(lowerPattern)) foundFiles.push(fullPath);
          }
        } catch { /* ignore access errors */ }
      }

      await scan(ctx.cwd, 0);
      return { found_files: foundFiles.slice(0, 100), count: foundFiles.length };
    },
  }));

  tools.push(tool({
    name: "fuzzy_find_local_files",
    description: "Fuzzy find local files by path/name similarity using Levenshtein scoring.",
    parameters: {
      query: z.string().describe("Search query to match against file names/paths."),
      path: z.string().optional().describe("Sub-directory to search in (default: current directory)."),
      max_results: z.number().int().min(1).max(20).optional().describe("Max results to return (default: 5)."),
    },
    implementation: async ({ query, path = ".", max_results = 5 }) => {
      try {
        const targetDir = validatePath(ctx.cwd, path);
        const entries = await readdir(targetDir, { recursive: true, withFileTypes: true });
        const files = entries
          .filter(entry => entry.isFile())
          .map(entry => {
            const fullPath = join((entry as any).parentPath ?? (entry as any).path, entry.name);
            return relative(targetDir, fullPath).replace(/\\/g, "/");
          });

        const ranked = rankFuzzyMatches(query, files, max_results);
        return { query, path: targetDir, results: ranked.map(item => ({ path: item.value, score: item.score })) };
      } catch (error) {
        return { error: `Fuzzy file search failed: ${error instanceof Error ? error.message : String(error)}` };
      }
    },
  }));

  tools.push(tool({
    name: "get_file_metadata",
    description: "Get metadata (size, dates) for a specific file.",
    parameters: { path: z.string() },
    implementation: async ({ path }) => {
      try {
        const targetPath = validatePath(ctx.cwd, path);
        const stats = await stat(targetPath);
        return {
          path: targetPath, size: stats.size, created: stats.birthtime, modified: stats.mtime,
          is_directory: stats.isDirectory(), is_file: stats.isFile(),
        };
      } catch (error) {
        return { error: `Failed to get metadata: ${error instanceof Error ? error.message : String(error)}` };
      }
    },
  }));

  // ─── Memory ──────────────────────────────────────────────────────────────────

  tools.push(tool({
    name: "save_memory",
    description: text`
      Save a specific piece of information or fact to long-term memory.
      This information will be available in future interactions if memory is enabled.
      Use this for user preferences, important facts, or context that should persist.
    `,
    parameters: {
      fact: z.string().describe("The specific fact or piece of information to remember."),
    },
    implementation: async ({ fact }) => {
      if (!ctx.enableMemory) return { error: "Memory is currently disabled in the plugin settings. Please ask the user to enable it." };
      const memoryFile = join(ctx.cwd, "memory.md");
      const timestamp = new Date().toISOString();
      const entry = `\n- [${timestamp}] ${fact}`;
      try {
        await fsAppendFile(memoryFile, entry, "utf-8");
        return { success: true, message: "Fact saved to memory." };
      } catch {
        try {
          await writeFile(memoryFile, "# Long-Term Memory\n" + entry, "utf-8");
          return { success: true, message: "Fact saved to memory (new file created)." };
        } catch (writeError) {
          return { error: `Failed to save memory: ${writeError instanceof Error ? writeError.message : String(writeError)}` };
        }
      }
    },
  }));

  return tools;
}
