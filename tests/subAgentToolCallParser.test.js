const test = require("node:test");
const assert = require("node:assert/strict");
const { parseSubAgentResponseMessage } = require("../dist/subAgentToolCallParser.js");

test("parses OpenAI tool_calls function format", () => {
  const parsed = parseSubAgentResponseMessage({
    content: null,
    tool_calls: [
      {
        type: "function",
        function: {
          name: "save_file",
          arguments: JSON.stringify({ file_name: "a.txt", content: "hello" }),
        },
      },
    ],
  });

  assert.equal(parsed.toolCallSource, "tool_calls");
  assert.equal(parsed.toolCall.tool, "save_file");
  assert.equal(parsed.toolCall.args.file_name, "a.txt");
  assert.equal(parsed.toolCall.args.content, "hello");
});

test("parses Gemma tool+parameters content format", () => {
  const parsed = parseSubAgentResponseMessage({
    content: JSON.stringify({
      tool: "save_file",
      parameters: { path: "src/out.py", data: "print('ok')" },
    }),
  });

  assert.equal(parsed.toolCallSource, "content");
  assert.equal(parsed.toolCall.tool, "save_file");
  assert.equal(parsed.toolCall.args.file_name, "src/out.py");
  assert.equal(parsed.toolCall.args.content, "print('ok')");
});

test("parses to=functions.* with args object in content", () => {
  const parsed = parseSubAgentResponseMessage({
    content: "```json\n{\"path\":\"notes.md\",\"data\":\"done\"}\n```\nto=functions.save_file",
  });

  assert.equal(parsed.toolCall.tool, "save_file");
  assert.equal(parsed.toolCall.args.file_name, "notes.md");
  assert.equal(parsed.toolCall.args.content, "done");
});

test("normalizes array content text and extracts direct save_file JSON", () => {
  const parsed = parseSubAgentResponseMessage({
    content: [
      { type: "text", text: "Here you go" },
      { type: "text", text: "{\"file_name\":\"result.txt\",\"content\":\"value\"}" },
    ],
  });

  assert.equal(parsed.toolCall.tool, "save_file");
  assert.equal(parsed.toolCall.args.file_name, "result.txt");
  assert.equal(parsed.toolCall.args.content, "value");
});

test("parses legacy <|tool_call>call:...{...}<tool_call|> syntax", () => {
  const parsed = parseSubAgentResponseMessage({
    content: "<|tool_call>call:read_file{path: 'C:\\\\Users\\\\98743\\\\Desktop\\\\vulcan_energy_analysis.html'}<tool_call|>",
  });

  assert.equal(parsed.toolCallSource, "content");
  assert.equal(parsed.toolCall.tool, "read_file");
  assert.equal(parsed.toolCall.args.file_name, "C:\\Users\\98743\\Desktop\\vulcan_energy_analysis.html");
});

test("parses tool call from reasoning_content when content is empty", () => {
  const parsed = parseSubAgentResponseMessage({
    content: "",
    reasoning_content: "<|tool_call>call:read_file{path: 'C:\\\\temp\\\\note.txt'}<tool_call|>",
  });

  assert.equal(parsed.toolCallSource, "reasoning");
  assert.equal(parsed.toolCall.tool, "read_file");
  assert.equal(parsed.toolCall.args.file_name, "C:\\temp\\note.txt");
});

test("strips Thought: block with single newline separator", () => {
  const parsed = parseSubAgentResponseMessage({
    content: "Thought: This is reasoning\nActual response here",
  });

  assert.ok(!parsed.content.startsWith("Thought:"), "Should strip Thought: even without blank line");
});

test("strips Thought: block with no separator at end of string", () => {
  const parsed = parseSubAgentResponseMessage({
    content: "Thought: incomplete reasoning at end",
  });

  assert.ok(!parsed.content.startsWith("Thought:"), "Should strip incomplete Thought: block");
});

test("strips Thought for N seconds with single newline", () => {
  const parsed = parseSubAgentResponseMessage({
    content: "Thought for 2.5 seconds\nThe answer is 42",
  });

  assert.ok(!parsed.content.startsWith("Thought"), "Should strip thought preamble");
  assert.ok(parsed.content.includes("42"), "Should preserve actual response");
});

test("handles mixed Thought: and tool call parsing", () => {
  const parsed = parseSubAgentResponseMessage({
    content: "Thought: Let me save this file\n\n{\"file_name\": \"test.txt\", \"content\": \"hello\"}",
  });

  assert.equal(parsed.toolCall.tool, "save_file");
  assert.ok(!parsed.content.startsWith("Thought:"), "Should strip thought block");
});
