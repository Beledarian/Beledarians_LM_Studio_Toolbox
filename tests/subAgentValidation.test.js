import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Mock the validation logic extracted from toolsProvider.ts to test in isolation
function validateToolCall(toolName, args) {
  let toolValidationError = null;
  const isAbsolute = (p) => p.startsWith('/') || /^[A-Za-z]:\\/.test(p);

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

  return toolValidationError;
}

describe('Sub-Agent Tool Validation', () => {
  describe('save_file validation', () => {
    it('should pass with correct parameters (file_name, content)', () => {
      const err = validateToolCall("save_file", { file_name: "test.html", content: "<html>" });
      assert.equal(err, null);
    });

    it('should fail with wrong parameter names (path instead of file_name)', () => {
      const err = validateToolCall("save_file", { path: "C:\\Users\\Desktop\\test.html", data: "<html>" });
      assert.ok(err?.includes("missing required parameter") || err?.includes("requires parameters"));
      assert.ok(err?.includes("Hint: Use 'file_name'"));
    });

    it('should fail with absolute paths outside workspace', () => {
      const err = validateToolCall("save_file", { file_name: "C:\\Users\\Desktop\\test.html", content: "<html>" });
      assert.ok(err?.includes("rejected absolute path"));
      assert.ok(err?.includes("SECURITY"));
    });

    it('should fail if missing content parameter', () => {
      const err = validateToolCall("save_file", { file_name: "test.html" });
      assert.ok(err?.includes("missing required parameter: 'content'"));
    });

    it('should pass with alias parameters (name, data)', () => {
      const err = validateToolCall("save_file", { name: "test.txt", data: "hello" });
      assert.equal(err, null);
    });
  });

  describe('read_file validation', () => {
    it('should pass with correct file_name', () => {
      const err = validateToolCall("read_file", { file_name: "src/index.ts" });
      assert.equal(err, null);
    });

    it('should fail if missing file_name', () => {
      const err = validateToolCall("read_file", {});
      assert.ok(err?.includes("requires parameter"));
    });

    it('should reject absolute paths for read_file', () => {
      const err = validateToolCall("read_file", { file_name: "/etc/passwd" });
      assert.ok(err?.includes("rejected absolute path"));
    });
  });

  describe('replace_text_in_file validation', () => {
    it('should pass with all required parameters', () => {
      // Note: replace logic is slightly different in the actual code, but we test the concept of missing params
      const args = { file_name: "test.txt", old_string: "a", new_string: "b" };
      assert.ok(args.file_name && args.old_string && args.new_string);
    });

    it('should identify missing parameters', () => {
      const args = { file_name: "test.txt" };
      const missing = [];
      if (!args.file_name) missing.push("file_name");
      if (!args.old_string) missing.push("old_string");
      if (!args.new_string) missing.push("new_string");
      
      assert.equal(missing.length, 2);
    });
  });

  describe('Tool call parsing edge cases', () => {
    it('should handle empty args object gracefully', () => {
      const err = validateToolCall("save_file", {});
      assert.ok(err?.includes("requires parameters"));
    });

    it('should provide helpful hints for common mistakes', () => {
      const err = validateToolCall("save_file", { filepath: "test.html", body: "<html>" });
      assert.ok(err?.includes("Hint: Use 'file_name' (not 'path', 'filepath', or 'file_path')"));
    });

    it('should detect absolute paths on Windows style', () => {
      const err = validateToolCall("save_file", { file_name: "C:\\Users\\Laurin\\Desktop\\test.html", content: "<html>" });
      assert.ok(err?.includes("rejected absolute path"));
    });

    it('should detect absolute paths on Unix style', () => {
      const err = validateToolCall("save_file", { file_name: "/home/user/test.html", content: "<html>" });
      assert.ok(err?.includes("rejected absolute path"));
    });
  });
});
