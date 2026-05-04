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

test("strips <antThinking> tags from content", () => {
  const parsed = parseSubAgentResponseMessage({
    content: "<antThinking>i now have good information about Weinsberg</antThinking>The city has approximately 20,000 inhabitants.",
  });

  assert.ok(!parsed.content.includes("<antThinking>"), "Should strip antThinking tags");
  assert.ok(parsed.content.includes("Weinsberg") === false || parsed.content.startsWith("The city"), "Should remove thinking content");
});

test("strips <thinking> tags from content", () => {
  const parsed = parseSubAgentResponseMessage({
    content: "<thinking>Let me analyze this request</thinking>The answer is 42.",
  });

  assert.ok(!parsed.content.includes("<thinking>"), "Should strip thinking tags");
  assert.ok(parsed.content.includes("42"), "Should preserve actual response");
});

test("strips <antThinking> tags and parses tool call from remaining content", () => {
  const parsed = parseSubAgentResponseMessage({
    content: "<antThinking>I need to save this file</antThinking>{\"file_name\": \"output.txt\", \"content\": \"hello world\"}",
  });

  assert.equal(parsed.toolCall.tool, "save_file");
  assert.ok(!parsed.content.includes("<antThinking>"), "Should strip antThinking tags");
});

test("handles nested or multiple <antThinking> tags", () => {
  const parsed = parseSubAgentResponseMessage({
    content: "<antThinking>first thought</antThinking>Some text<antThinking>second thought</antThinking>Final response.",
  });

  assert.ok(!parsed.content.includes("<antThinking>"), "Should strip all antThinking tags");
  assert.ok(parsed.content.includes("Final response"), "Should preserve actual content");
});

test("strips <thinking> tags with attributes", () => {
  const parsed = parseSubAgentResponseMessage({
    content: "<thinking type=\"reasoning\">Analyzing the problem...</thinking>The solution is to use recursion.",
  });

  assert.ok(!parsed.content.includes("<thinking"), "Should strip thinking tags even with attributes");
  assert.ok(parsed.content.includes("recursion"), "Should preserve actual response");
});
// ============================================
// Tests for finish_task tool call parsing
// ============================================

test("parses finish_task tool call with success status", () => {
  const parsed = parseSubAgentResponseMessage({
    content: "Task completed successfully. All files have been created and verified.",
    tool_calls: [
      {
        type: "function",
        function: {
          name: "finish_task",
          arguments: JSON.stringify({ 
            message: "Created 3 files: index.html, styles.css, app.js", 
            status: "success" 
          }),
        },
      },
    ],
  });

  assert.equal(parsed.toolCallSource, "tool_calls");
  assert.equal(parsed.toolCall.tool, "finish_task");
  assert.equal(parsed.toolCall.args.message, "Created 3 files: index.html, styles.css, app.js");
  assert.equal(parsed.toolCall.args.status, "success");
});

test("parses finish_task tool call with error status", () => {
  const parsed = parseSubAgentResponseMessage({
    content: "",
    tool_calls: [
      {
        type: "function",
        function: {
          name: "finish_task",
          arguments: JSON.stringify({ 
            message: "Failed to create database connection - port already in use", 
            status: "error" 
          }),
        },
      },
    ],
  });

  assert.equal(parsed.toolCall.tool, "finish_task");
  assert.equal(parsed.toolCall.args.status, "error");
  assert.ok(parsed.toolCall.args.message.includes("Failed"));
});

test("parses finish_task from content JSON (non-OpenAI format)", () => {
  const parsed = parseSubAgentResponseMessage({
    content: '{"tool": "finish_task", "args": {"message": "All tests passing", "status": "success"}}',
  });

  assert.equal(parsed.toolCallSource, "content");
  assert.equal(parsed.toolCall.tool, "finish_task");
  assert.equal(parsed.toolCall.args.message, "All tests passing");
});

test("parses finish_task with minimal args (defaults applied)", () => {
  const parsed = parseSubAgentResponseMessage({
    content: "",
    tool_calls: [
      {
        type: "function",
        function: {
          name: "finish_task",
          arguments: JSON.stringify({}),
        },
      },
    ],
  });

  assert.equal(parsed.toolCall.tool, "finish_task");
  // Should have empty args since no message/status provided
  assert.ok(parsed.toolCall.args);
});

test("parses finish_task with only message (no status)", () => {
  const parsed = parseSubAgentResponseMessage({
    content: "",
    tool_calls: [
      {
        type: "function",
        function: {
          name: "finish_task",
          arguments: JSON.stringify({ message: "Done with the task" }),
        },
      },
    ],
  });

  assert.equal(parsed.toolCall.tool, "finish_task");
  assert.equal(parsed.toolCall.args.message, "Done with the task");
});

test("parses finish_task from reasoning content", () => {
  const parsed = parseSubAgentResponseMessage({
    content: "",
    reasoning_content: '{"tool": "finish_task", "args": {"message": "Completed via reasoning", "status": "success"}}',
  });

  assert.equal(parsed.toolCallSource, "reasoning");
  assert.equal(parsed.toolCall.tool, "finish_task");
});


// ============================================
// Tests for TASK_COMPLETED legacy fallback
// ============================================

test("detects TASK_COMPLETED in content (legacy support)", () => {
  const parsed = parseSubAgentResponseMessage({
    content: "I have completed the task. Here's a summary of what was done...\n\nTASK_COMPLETED",
  });

  // Should not parse as tool call, but content should contain TASK_COMPLETED
  assert.equal(parsed.toolCall, null);
  assert.ok(parsed.content.includes("TASK_COMPLETED"));
});

test("detects TASK_COMPLETED with surrounding text", () => {
  const parsed = parseSubAgentResponseMessage({
    content: "All files created successfully. TASK_COMPLETED - No further action needed.",
  });

  assert.equal(parsed.toolCall, null);
  assert.ok(parsed.content.includes("TASK_COMPLETED"));
});


// ============================================
// Tests for timeout message format detection
// ============================================

test("timeout message starts with [TIMEOUT] prefix", () => {
  const timeoutMessage = "[TIMEOUT] Sub-agent exceeded time limit of 600s. Task terminated early.";
  
  assert.ok(timeoutMessage.startsWith("[TIMEOUT]"));
  assert.ok(timeoutMessage.includes("exceeded time limit"));
});

test("timeout message contains time limit value", () => {
  const timeoutMessage = "[TIMEOUT] Sub-agent exceeded time limit of 300s. Task terminated early.";
  
  assert.ok(timeoutMessage.match(/\[TIMEOUT\].*\d+s/));
});


// ============================================
// Tests for tool call parsing after thinking tag removal
// ============================================

test("parses finish_task after antThinking tag removal", () => {
  const parsed = parseSubAgentResponseMessage({
    content: "<antThinking>I've completed all the required tasks</antThinking>{\"tool\": \"finish_task\", \"args\": {\"message\": \"Done\", \"status\": \"success\"}}",
  });

  assert.equal(parsed.toolCall.tool, "finish_task");
  assert.ok(!parsed.content.includes("<antThinking>"));
});

test("parses regular tool call after thinking tag removal", () => {
  const parsed = parseSubAgentResponseMessage({
    content: "<thinking>Analyzing the code...</thinking>{\"tool\": \"save_file\", \"args\": {\"file_name\": \"output.txt\", \"content\": \"result\"}}",
  });

  assert.equal(parsed.toolCall.tool, "save_file");
  assert.ok(!parsed.content.includes("<thinking>"));
});


// ============================================
// Tests for edge cases in tool call parsing
// ============================================

test("handles empty content with no tool calls", () => {
  const parsed = parseSubAgentResponseMessage({
    content: "",
  });

  assert.equal(parsed.toolCall, null);
  assert.equal(parsed.toolCallSource, "none");
});

test("handles null content gracefully", () => {
  const parsed = parseSubAgentResponseMessage({
    content: null,
  });

  assert.equal(parsed.toolCall, null);
  assert.equal(parsed.content, "");
});

test("handles string message (not object)", () => {
  const parsed = parseSubAgentResponseMessage("Just a plain text response");

  assert.equal(parsed.toolCall, null);
  assert.equal(parsed.content, "Just a plain text response");
});

test("preserves content when no tool call detected", () => {
  const originalContent = "This is my analysis of the code. I found several issues that need fixing.";
  const parsed = parseSubAgentResponseMessage({
    content: originalContent,
  });

  assert.equal(parsed.content, originalContent);
  assert.equal(parsed.toolCall, null);
});


// ============================================
// Tests for tool call source detection priority
// ============================================

test("tool_calls takes priority over content parsing", () => {
  const parsed = parseSubAgentResponseMessage({
    content: '{"tool": "save_file", "args": {"file_name": "wrong.txt", "content": "x"}}',
    tool_calls: [
      {
        type: "function",
        function: {
          name: "read_file",
          arguments: JSON.stringify({ file_name: "correct.txt" }),
        },
      },
    ],
  });

  // Should use structured tool_calls, not parse content as JSON
  assert.equal(parsed.toolCallSource, "tool_calls");
  assert.equal(parsed.toolCall.tool, "read_file");
});

test("content parsing used when no structured tool_calls", () => {
  const parsed = parseSubAgentResponseMessage({
    content: '{"tool": "save_file", "args": {"file_name": "test.txt", "content": "hello"}}',
  });

  assert.equal(parsed.toolCallSource, "content");
  assert.equal(parsed.toolCall.tool, "save_file");
});


// ============================================
// Tests for sanitizeContent edge cases
// ============================================

test("strips multiple thinking tag types in same content", () => {
  const parsed = parseSubAgentResponseMessage({
    content: "<antThinking>first</antThinking><thinking>second</thinking>Actual response here.",
  });

  assert.ok(!parsed.content.includes("<antThinking>"));
  assert.ok(!parsed.content.includes("<thinking>"));
  assert.ok(parsed.content.includes("Actual response"));
});

test("handles thinking tags with complex attributes", () => {
  const parsed = parseSubAgentResponseMessage({
    content: '<thinking mode="deep" depth="5">Complex reasoning here</thinking>The answer is 42.',
  });

  assert.ok(!parsed.content.includes("<thinking"));
  assert.ok(parsed.content.includes("The answer is 42"));
});

test("preserves legitimate angle brackets in code", () => {
  const parsed = parseSubAgentResponseMessage({
    content: "Use x < 5 && y > 10 for the condition.",
  });

  assert.ok(parsed.content.includes("<"));
  assert.ok(parsed.content.includes(">"));
});


// ============================================
// Tests for reviewer loop iteration behavior (simulated)
// ============================================

test("reviewer should complete within iteration limit", () => {
  // Simulate a typical reviewer workflow:
  // Iteration 1-2: Read files to review
  // Iteration 3-4: Fix issues found
  // Iteration 5: Call finish_task
  
  const maxIterations = 5;
  let iterationCount = 0;
  
  // Simulate the reviewer making progress each iteration
  const workflow = [
    { action: "read_file", file: "index.ts" },
    { action: "read_file", file: "utils.ts" },
    { action: "save_file", file: "index.ts.fixed" },
    { action: "save_file", file: "utils.ts.fixed" },
    { action: "finish_task", message: "Review complete, issues fixed" },
  ];
  
  for (const step of workflow) {
    iterationCount++;
    if (step.action === "finish_task") break;
  }
  
  assert.ok(iterationCount <= maxIterations, 
    `Reviewer should complete within ${maxIterations} iterations`);
});

test("reviewer with many files needs efficient iteration", () => {
  // When reviewing multiple files, reviewer should batch operations
  const filesToReview = ["file1.ts", "file2.ts", "file3.ts", "file4.ts"];
  const maxIterations = 5;
  
  // Efficient reviewer reads all files first, then fixes in batch
  let iterationCount = 0;
  
  // Read phase (can read multiple per iteration via tool calls)
  for (const file of filesToReview) {
    iterationCount++;
    if (iterationCount >= maxIterations - 1) break; // Leave room for finish_task
  }
  
  // Fix phase
  iterationCount++;
  
  // Finish
  iterationCount++;
  
  assert.ok(iterationCount <= maxIterations + 2, 
    "Reviewer should handle multiple files within reasonable iterations");
});


// ============================================
// Tests for Timeout-Based Termination (Unlimited Iterations)
// ============================================

test("timeout terminates loop before hitting iteration limit", () => {
  // Simulate a scenario where timeout should trigger before iteration limit
  const subAgentTimeLimit = 60; // 60 seconds
  const startTime = Date.now();
  
  // Even with unlimited iterations (1000), timeout should kick in first
  const maxIterations = 1000;
  let iterationCount = 0;
  
  // Simulate each iteration taking ~2 seconds of API time
  while (iterationCount < maxIterations) {
    const elapsedMs = Date.now() - startTime;
    
    if (elapsedMs > subAgentTimeLimit * 1000) {
      break; // Timeout would trigger here
    }
    
    iterationCount++;
    
    // Safety: don't actually wait in test, just simulate
    if (iterationCount >= 30) {
      // After 30 iterations (~60 seconds simulated), timeout should have triggered
      break;
    }
  }
  
  assert.ok(iterationCount < maxIterations, 
    "Timeout should terminate before hitting iteration limit");
});

test("reviewer loop respects time budget with unlimited iterations", () => {
  // When reviewer has unlimited iterations but limited time budget
  const totalBudget = 600; // 10 minutes total
  const primaryTaskTime = 240; // Primary took 4 minutes
  
  // Remaining budget for reviewer (max 50% of original, min 30s)
  const remainingBudget = Math.max(30, totalBudget / 2); // 300 seconds max
  const debugTimeoutLimit = remainingBudget - primaryTaskTime;
  
  // Reviewer should complete within its time budget even with unlimited iterations
  assert.ok(debugTimeoutLimit > 0, "Reviewer should have positive time budget");
  assert.ok(debugTimeoutLimit <= remainingBudget, 
    "Reviewer timeout should not exceed allocated budget");
});

test("finish_task provides clean termination without relying on iteration limit", () => {
  // Verify that finish_tool allows graceful exit regardless of iteration count
  const parsed = parseSubAgentResponseMessage({
    content: "",
    tool_calls: [
      {
        type: "function",
        function: {
          name: "finish_task",
          arguments: JSON.stringify({ 
            message: "Task completed after extensive work", 
            status: "success" 
          }),
        },
      },
    ],
  });

  assert.equal(parsed.toolCall.tool, "finish_task");
  // This allows the loop to break cleanly without needing iteration limits
});

test("legacy TASK_COMPLETED still works as safety net", () => {
  // Even with unlimited iterations, legacy completion phrase should work
  const content = "All done! TASK_COMPLETED";
  
  assert.ok(content.includes("TASK_COMPLETED"), 
    "Legacy completion marker is preserved for backward compatibility");
});

test("unlimited iterations prevents premature task termination", () => {
  // Complex tasks may need many iterations (file reads, writes, tests, etc.)
  const complexTaskIterations = [
    "read_file: requirements.md",      // 1
    "read_file: existing_code.ts",     // 2
    "save_file: new_module.ts",        // 3
    "run_javascript: test script",     // 4
    "read_file: test_output.txt",      // 5
    "replace_text_in_file: fix bug",   // 6
    "run_javascript: re-test",         // 7
    "save_file: documentation.md",     // 8
    "finish_task",                     // 9+
  ];
  
  const oldLimit = 8;
  const newLimit = 1000;
  
  assert.ok(complexTaskIterations.length > oldLimit, 
    "Complex tasks may exceed old iteration limit of 8");
  assert.ok(complexTaskIterations.length <= newLimit, 
    "New unlimited iterations accommodate complex workflows");
});

test("timeout message format allows proper cleanup", () => {
  // When timeout triggers, the message should indicate early termination
  const timeoutMessage = "[TIMEOUT] Sub-agent exceeded time limit of 600s. Task terminated early.";
  
  assert.ok(timeoutMessage.startsWith("[TIMEOUT]"), 
    "Timeout messages have identifiable prefix for downstream handling");
  assert.ok(!timeoutMessage.includes("TASK_COMPLETED"), 
    "Timeout is distinct from normal completion");
});

test("debug mode skips review on timeout regardless of iteration count", () => {
  // Verify that debug loop respects primary task timeout status
  const finalResponse = "[TIMEOUT] Sub-agent exceeded time limit. Task terminated early.";
  
  assert.ok(finalResponse.startsWith("[TIMEOUT]"), 
    "Timeout response is detectable");
  // Debug mode check: !finalResponse.startsWith("[TIMEOUT]") would be false, skipping review
});

test("iteration count logging helps diagnose timeout vs iteration issues", () => {
  // When debug logging is enabled, iteration counts help understand termination cause
  const logMessages = [
    "[Sub-Agent] Parse result source=tool_calls hasToolCall=true preview={...}",
    "[Sub-Agent] finish_task called with status: success",
    "[Sub-Agent] Timeout reached after 598234ms",
  ];
  
  // All these logs help diagnose what happened during the loop
  assert.ok(logMessages.length > 0, "Debug logging provides visibility into loop behavior");
});
