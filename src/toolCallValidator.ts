import { isAbsolute } from "path";

/**
 * Validates sub-agent tool call parameters before execution.
 * Returns null if valid, or an error message string if invalid.
 */
export function validateToolCall(
  toolName: string,
  args: Record<string, any> = {}
): string | null {
  let toolValidationError: string | null = null;

  // finish_task is always allowed - it's the termination signal, not an executable tool
  if (toolName === "finish_task") {
    return null; // Always valid, no parameters required beyond optional message/status
  }

  if (toolName === "save_file") {
    if (Array.isArray(args.files)) {
      for (const file of args.files) {
        const fileName = file.file_name || file.name || file.path;
        const fileContent = file.content || file.data;
        if (!fileName && !fileContent) {
          return `Tool 'save_file' batch mode requires [file_name, content] in all objects.`;
        } else if (!fileName) {
          return `Tool 'save_file' batch missing 'file_name'. Hint: Use 'file_name'.`;
        } else if (!fileContent) {
          return `Tool 'save_file' batch missing 'content'. Hint: Use 'content'.`;
        } else if (isAbsolute(fileName)) {
          return `Tool 'save_file' batch rejected absolute path: '${fileName}'. SECURITY: Files can only be saved within workspace.`;
        }
      }
      return null;
    }

    const fileName = args.file_name || args.name || args.path;
    const fileContent = args.content || args.data;

    if (!fileName && content === undefined) {
      toolValidationError = `Tool 'save_file' requires parameters: [file_name, content]. Provided keys: ${Object.keys(args).join(", ") || "none"}.`;
    } else if (!fileName) {
      toolValidationError = `Tool 'save_file' missing required parameter: 'file_name'.`;
    } else if (content === undefined || content === null) {
      toolValidationError = `Tool 'save_file' missing required parameter: 'content'.`;
    } else if (isAbsolute(fileName)) {
      toolValidationError = `Tool 'save_file' rejected absolute path: '${fileName}'. SECURITY: Files can only be saved within workspace. Use relative path like 'test.html'.`;
    }
  }

  if (toolName === "read_file") {
    // Accept file_name, path, or name for consistency with parser normalization
    const fileName = args.file_name || args.path || args.name;
    if (!fileName) {
      toolValidationError = `Tool 'read_file' requires parameter: [file_name]. Provided keys: ${Object.keys(args).join(", ") || "none"}. Hint: Use 'file_name' (not 'path', 'filepath', or 'file_path').`;
    } else if (isAbsolute(fileName)) {
      toolValidationError = `Tool 'read_file' rejected absolute path. SECURITY: Only workspace paths allowed.`;
    }
  }

  if (toolName === "replace_text_in_file") {
    const fileName = args.file_name || args.path || args.name;
    const missing: string[] = [];
    if (!fileName) missing.push("file_name");
    if (!args.old_string) missing.push("old_string");
    if (!args.new_string) missing.push("new_string");
    if (missing.length > 0) {
      toolValidationError = `Tool 'replace_text_in_file' missing parameters: [${missing.join(", ")}]. Provided keys: ${Object.keys(args).join(", ") || "none"}.`;
    } else if (isAbsolute(fileName)) {
      toolValidationError = `Tool 'replace_text_in_file' rejected absolute path. SECURITY: Only workspace paths allowed.`;
    }
  }

  return toolValidationError;
}
