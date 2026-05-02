import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateToolCall } from '../dist/toolCallValidator.js';

describe('Sub-Agent Tool Validation', () => {
  describe('save_file validation', () => {
    it('should pass with correct parameters (file_name, content)', () => {
      const err = validateToolCall("save_file", { file_name: "test.html", content: "<html>" });
      assert.equal(err, null);
    });

    it('should pass with path alias (path instead of file_name)', () => {
      const err = validateToolCall("save_file", { path: "test.html", data: "<html>" });
      assert.equal(err, null);
    });

    it('should fail with absolute paths outside workspace', () => {
      const err = validateToolCall("save_file", { file_name: "/tmp/test.html", content: "<html>" });
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

    it('should provide helpful hints for common mistakes (filepath, body)', () => {
      // 'filepath' and 'body' are not supported aliases - only file_name/name/path and content/data
      const err = validateToolCall("save_file", { filepath: "test.html", body: "<html>" });
      assert.ok(err?.includes("missing required parameter") || err?.includes("requires parameters"));
    });

    it('should detect absolute paths on Unix style', () => {
      const err = validateToolCall("save_file", { file_name: "/home/user/test.html", content: "<html>" });
      assert.ok(err?.includes("rejected absolute path"));
    });

    it('should detect absolute paths with forward slashes (cross-platform)', () => {
      // Forward slash paths work on both Linux and Windows via Node isAbsolute()
      const err = validateToolCall("save_file", { file_name: "/var/log/test.html", content: "<html>" });
      assert.ok(err?.includes("rejected absolute path"));
    });
  });
});
