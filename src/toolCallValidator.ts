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

  if (toolName === "save_file") {
    const fileName = args.file_name || args.name;
    const fileContent = args.content || args.data;

    if (!fileName && !fileContent) {
      toolValidationError = `Tool 'save_file' requires parameters: [file_name, content]. Provided keys: ${Object.keys(args).join(", ") || "none"}. Hint: Use 'file_name' (not 'path', 'filepath', or 'file_path') and 'content' (not 'data').`;
    } else if (!fileName) {
      toolValidationError = `Tool 'save_file' missing required parameter: 'file_name'. Provided keys: ${Object.keys(args).join(", ")}. Hint: Use 'file_name' not 'path' or 'filepath'.`;
    } else if (!fileContent) {
      toolValidationError = `Tool 'save_file' missing required parameter: 'content'. Provided keys: ${Object.keys(args).join(", ")}. Hint: Use 'content' not 'data'.`;
    } else if (isAbsolute(fileName)) {
      toolValidationError = `Tool 'save_file' rejected absolute path: '${fileName}'. SECURITY: Files can only be saved within workspace. Use relative path like 'test.html'.`;
    }
  }

  if (toolName === "read_file") {
    const fileName = args.file_name;
    if (!fileName) {
      toolValidationError = `Tool 'read_file' requires parameter: [file_name]. Provided keys: ${Object.keys(args).join(", ") || "none"}.`;
    } else if (isAbsolute(fileName)) {
      toolValidationError = `Tool 'read_file' rejected absolute path. SECURITY: Only workspace paths allowed.`;
    }
  }

  if (toolName === "replace_text_in_file") {
    const missing: string[] = [];
    if (!args.file_name) missing.push("file_name");
    if (!args.old_string) missing.push("old_string");
    if (!args.new_string) missing.push("new_string");
    if (missing.length > 0) {
      toolValidationError = `Tool 'replace_text_in_file' missing parameters: [${missing.join(", ")}]. Provided keys: ${Object.keys(args).join(", ") || "none"}.`;
    } else if (isAbsolute(args.file_name)) {
      toolValidationError = `Tool 'replace_text_in_file' rejected absolute path. SECURITY: Only workspace paths allowed.`;
    }
  }

  return toolValidationError;
}
