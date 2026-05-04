export type ParsedToolCall = {
  tool: string;
  args: Record<string, any>;
};

export type ParsedSubAgentMessage = {
  content: string;
  toolCall: ParsedToolCall | null;
  toolCallSource: "tool_calls" | "content" | "reasoning" | "none";
};

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sanitizeContent(text: string): string {
  return text
    .replace(/<\|tool_call\>/gi, "")
    .replace(/<tool_call\|>/gi, "")
    .replace(/<\|.*?\|>/g, "")
    // Strip XML-style thinking tags (e.g., <antThinking>, <thinking>) emitted by Claude and other models.
    // These models embed their chain-of-thought in the content field wrapped in these tags.
    .replace(/<antThinking[^>]*>[\s\S]*?(?:<\/antThinking>|$)/gi, "")
    .replace(/<thinking[^>]*>[\s\S]*?(?:<\/thinking>|$)/gi, "")

    // Strip leading "Thought: ..." reasoning block emitted by DeepSeek-R1, QwQ, etc.
    // These models embed their chain-of-thought in the content field prefixed with "Thought:",
    // separated from the actual response by a blank line (or sometimes just a single newline).
    // The regex matches "Thought:" followed by any content up to:
    // - A blank line (\n\n or \r\n\r\n), OR
    // - A single newline if no blank line exists, OR
    // - End of string if there's no separator at all
    .replace(/^Thought:[\s\S]*?(?:\n\n|\r\n\r\n|\n|$)/, "")
    // Strip "Thought for N seconds" preamble emitted by thinking models (e.g. DeepSeek-R1, QwQ).
    // Handles integers, decimals, and optional trailing whitespace/newlines.
    .replace(/^Thought for [\d.]+ seconds?\s*/i, "")
    .trim();
}

function normalizeContent(content: unknown): string {
  if (typeof content === "string") return content;
  if (isRecord(content)) {
    const text = content.text;
    if (typeof text === "string") return text;
    const nested = content.content;
    if (typeof nested === "string") return nested;
  }
  if (!Array.isArray(content)) return "";

  const chunks: string[] = [];
  for (const part of content) {
    if (typeof part === "string") {
      chunks.push(part);
      continue;
    }
    if (!isRecord(part)) continue;

    const text = part.text;
    if (typeof text === "string") {
      chunks.push(text);
      continue;
    }

    const nested = part.content;
    if (typeof nested === "string") {
      chunks.push(nested);
    }
  }

  return chunks.join("\n");
}

function normalizeToolName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  let normalized = value.trim().toLowerCase();
  if (!normalized) return null;

  if (normalized.startsWith("functions.")) {
    normalized = normalized.slice("functions.".length);
  }

  // Handle common hallucinations and aliases
  const mapping: Record<string, string> = {
    "write_file": "save_file",
    "savefile": "save_file",
    "create_file": "save_file",
    "overwrite_file": "save_file",
    "readfile": "read_file",
    "list_dir": "list_directory",
    "ls": "list_directory",
    "find_file": "find_files",
    "search_file": "search_file_content",
    "grep": "search_file_content",
    "replace_text": "replace_text_in_file",
    "replace_in_file": "replace_text_in_file"
  };

  return mapping[normalized] || normalized;
}

function tryParseJson(text: string): JsonValue | undefined {
  try {
    return JSON.parse(text) as JsonValue;
  } catch {
    return undefined;
  }
}

function normalizeArgs(toolName: string, args: unknown): Record<string, any> {
  let normalized: unknown = args;

  if (toolName === "save_file" && Array.isArray(normalized)) {
    normalized = { files: normalized };
  }

  if (!isRecord(normalized)) {
    return {};
  }

  const result = { ...normalized } as Record<string, any>;

  // Generic path/data normalization for file tools
  const fileTools = [
    "read_file", "save_file", "replace_text_in_file", "read_file_range", 
    "search_file_content", "search_in_file", "insert_at_line", 
    "append_file", "delete_lines_in_file"
  ];
  
  if (fileTools.includes(toolName)) {
    if (typeof result.path === "string" && result.file_name === undefined) {
      result.file_name = result.path;
    }
    if (typeof result.file_path === "string" && result.file_name === undefined) {
      result.file_name = result.file_path;
    }
    if (typeof result.name === "string" && result.file_name === undefined) {
      result.file_name = result.name;
    }
  }

  // Generic data/content normalization
  if (["save_file", "append_file", "insert_at_line"].includes(toolName)) {
    if (typeof result.data === "string" && result.content === undefined) {
      result.content = result.data;
    }
    if (toolName === "insert_at_line" && typeof result.content === "string" && result.content_to_insert === undefined) {
      result.content_to_insert = result.content;
    }
  }

  // Specific tool tweaks
  if (toolName === "fuzzy_find_local_files" && !result.query && result.pattern) {
    result.query = result.pattern;
  }
  
  if ((toolName === "search_file_content" || toolName === "search_in_file") && !result.pattern && result.query) {
    result.pattern = result.query;
  }

  return result;
}

function buildToolCall(toolName: unknown, args: unknown): ParsedToolCall | null {
  const normalizedName = normalizeToolName(toolName);
  if (!normalizedName) return null;
  return {
    tool: normalizedName,
    args: normalizeArgs(normalizedName, args),
  };
}

function isMatchingBracket(open: string, close: string): boolean {
  return (open === "{" && close === "}") || (open === "[" && close === "]");
}

function extractBalancedJsonSnippets(text: string, maxSnippets = 12): string[] {
  const snippets: string[] = [];
  let iterations = 0;
  const MAX_ITERATIONS = 500000;

  for (let start = 0; start < text.length; start++) {
    if (iterations > MAX_ITERATIONS) break;
    const opener = text[start];
    if (opener !== "{" && opener !== "[") continue;

    const stack: string[] = [opener];
    let inString = false;
    let escaped = false;
    let invalid = false;

    // Limit the lookahead to prevent O(N^2) event loop blocking
    const endLimit = Math.min(text.length, start + 30000);

    for (let end = start + 1; end < endLimit; end++) {
      iterations++;
      if (iterations > MAX_ITERATIONS) break;
      const char = text[end];

      if (inString) {
        if (escaped) {
          escaped = false;
        } else if (char === "\\") {
          escaped = true;
        } else if (char === "\"") {
          inString = false;
        }
        continue;
      }

      if (char === "\"") {
        inString = true;
        continue;
      }

      if (char === "{" || char === "[") {
        stack.push(char);
        continue;
      }

      if (char === "}" || char === "]") {
        const currentOpen = stack.pop();
        if (!currentOpen || !isMatchingBracket(currentOpen, char)) {
          invalid = true;
          break;
        }
        if (stack.length === 0) {
          snippets.push(text.slice(start, end + 1));
          start = end;
          break;
        }
      }
    }

    if (invalid) continue;
    if (snippets.length >= maxSnippets) break;
  }

  return snippets;
}

function extractJsonCandidates(text: string): string[] {
  const candidates: string[] = [];
  const seen = new Set<string>();

  const pushCandidate = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || seen.has(trimmed)) return;
    seen.add(trimmed);
    candidates.push(trimmed);
  };

  const fencedRegex = /```(?:json|javascript|js|ts|python|py)?\s*([\s\S]*?)```/gi;
  let fenceMatch: RegExpExecArray | null;
  while ((fenceMatch = fencedRegex.exec(text)) !== null) {
    pushCandidate(fenceMatch[1]);
  }

  const trimmed = text.trim();
  if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
    pushCandidate(trimmed);
  }

  for (const snippet of extractBalancedJsonSnippets(text)) {
    pushCandidate(snippet);
  }

  return candidates;
}

function parseToolCallFromToolCalls(toolCalls: unknown): ParsedToolCall | null {
  if (!Array.isArray(toolCalls)) return null;

  for (const entry of toolCalls) {
    if (!isRecord(entry)) continue;

    const fn = entry.function;
    if (isRecord(fn)) {
      let args: unknown = fn.arguments;
      if (typeof args === "string") {
        args = tryParseJson(args) ?? {};
      }
      const parsed = buildToolCall(fn.name, args);
      if (parsed) return parsed;
    }

    let fallbackArgs: unknown = entry.arguments;
    if (typeof fallbackArgs === "string") {
      fallbackArgs = tryParseJson(fallbackArgs) ?? {};
    }
    const fallback = buildToolCall(entry.name, fallbackArgs);
    if (fallback) return fallback;
  }

  return null;
}

function findMatchingBrace(text: string, openBraceIndex: number): number {
  let depth = 0;
  let inString = false;
  let quote = "\"";
  let escaped = false;

  for (let i = openBraceIndex; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === quote) {
        inString = false;
      }
      continue;
    }

    if (ch === "\"" || ch === "'") {
      inString = true;
      quote = ch;
      continue;
    }
    if (ch === "{") {
      depth++;
      continue;
    }
    if (ch === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function parseLooseObject(insideBraces: string): Record<string, unknown> | null {
  let normalized = insideBraces.trim();
  if (!normalized) return {};

  normalized = normalized.replace(/(^|[{,]\s*)([a-zA-Z_][\w-]*)\s*:/g, "$1\"$2\":");
  normalized = normalized.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, (_match, inner: string) => {
    const escapedInner = inner
      .replace(/\\'/g, "'")
      .replace(/"/g, "\\\"");
    return `"${escapedInner}"`;
  });

  const parsed = tryParseJson(`{${normalized}}`);
  return isRecord(parsed) ? parsed : null;
}

function parseToolCallFromLegacySyntax(text: string): ParsedToolCall | null {
  const callRegex = /call\s*:\s*([a-zA-Z0-9_.-]+)\s*\{/gi;
  let match: RegExpExecArray | null;
  while ((match = callRegex.exec(text)) !== null) {
    const toolName = match[1];
    const openBraceIndex = text.indexOf("{", match.index + match[0].length - 1);
    if (openBraceIndex < 0) continue;
    const closeBraceIndex = findMatchingBrace(text, openBraceIndex);
    if (closeBraceIndex < 0) continue;

    const body = text.slice(openBraceIndex + 1, closeBraceIndex);
    const strictParsed = tryParseJson(`{${body}}`);
    const parsedArgs = isRecord(strictParsed) ? strictParsed : parseLooseObject(body);
    if (!parsedArgs) continue;

    const parsed = buildToolCall(toolName, parsedArgs);
    if (parsed) return parsed;
  }
  return null;
}

function parseToolCallObject(candidate: unknown, originalText: string): ParsedToolCall | null {
  if (Array.isArray(candidate)) {
    if (candidate.length > 0 && candidate.every(item => isRecord(item))) {
      const asBatchSave = buildToolCall("save_file", candidate);
      if (asBatchSave) return asBatchSave;
    }
    for (const item of candidate) {
      const parsed = parseToolCallObject(item, originalText);
      if (parsed) return parsed;
    }
    return null;
  }

  if (!isRecord(candidate)) return null;

  const nestedToolCalls = parseToolCallFromToolCalls(candidate.tool_calls);
  if (nestedToolCalls) return nestedToolCalls;

  if ("tool" in candidate && "args" in candidate) {
    const parsed = buildToolCall(candidate.tool, candidate.args);
    if (parsed) return parsed;
  }

  if ("tool" in candidate && "parameters" in candidate) {
    const parsed = buildToolCall(candidate.tool, candidate.parameters);
    if (parsed) return parsed;
  }

  if ("name" in candidate && "arguments" in candidate) {
    let args: unknown = candidate.arguments;
    if (typeof args === "string") {
      args = tryParseJson(args) ?? {};
    }
    const parsed = buildToolCall(candidate.name, args);
    if (parsed) return parsed;
  }

  if (
    (typeof candidate.file_name === "string" && typeof candidate.content === "string") ||
    (typeof candidate.path === "string" && typeof candidate.data === "string")
  ) {
    const parsed = buildToolCall("save_file", candidate);
    if (parsed) return parsed;
  }

  const toToolNameMatch = originalText.match(/to=([a-zA-Z0-9_.-]+)/);
  if (toToolNameMatch) {
    const parsed = buildToolCall(toToolNameMatch[1], candidate);
    if (parsed) return parsed;
  }

  return null;
}

function parseToolCallFromContent(text: string): ParsedToolCall | null {
  if (!text.trim()) return null;
  const legacyCall = parseToolCallFromLegacySyntax(text);
  if (legacyCall) return legacyCall;
  for (const candidateText of extractJsonCandidates(text)) {
    const parsedJson = tryParseJson(candidateText);
    if (parsedJson === undefined) continue;
    const parsedTool = parseToolCallObject(parsedJson, text);
    if (parsedTool) return parsedTool;
  }

  // --- Fix: Fallback for mixed prose+JSON tool calls ---
  // When the model outputs something like:
  //   "Now I have data... {"tool": "save_file", "args": {...}}"
  // The balanced JSON extractor above may fail because the whole text isn't valid JSON.
  // This fallback specifically looks for tool call patterns embedded within prose text.
  const toolMatch = text.match(/\{"[\s]*tool[\s]*"[\s]*:[\s]*"([a-zA-Z0-9_.-]+)"/);
  if (toolMatch) {
    // Find the matching closing brace by looking for args object
    const argsStartIdx = text.indexOf('{', toolMatch.index || 0);
    if (argsStartIdx >= 0) {
      const closeBraceIdx = findMatchingBrace(text, argsStartIdx);
      if (closeBraceIdx > 0) {
        const jsonSnippet = text.slice(argsStartIdx, closeBraceIdx + 1);
        const parsedJson = tryParseJson(jsonSnippet);
        if (parsedJson && isRecord(parsedJson)) {
          const parsedTool = parseToolCallObject(parsedJson, text);
          if (parsedTool) return parsedTool;
        }
      }
    }
  }
  return null;
}

export function parseSubAgentResponseMessage(message: unknown): ParsedSubAgentMessage {
  if (!isRecord(message)) {
    const content = sanitizeContent(typeof message === "string" ? message : "");
    const contentToolCall = parseToolCallFromContent(content);
    return {
      content,
      toolCall: contentToolCall,
      toolCallSource: contentToolCall ? "content" : "none",
    };
  }

  const content = sanitizeContent(normalizeContent(message.content));
  const reasoningContent = sanitizeContent(
    normalizeContent(message.reasoning_content ?? message.reasoning ?? message.thinking ?? ""),
  );
  const structuredToolCall =
    parseToolCallFromToolCalls(message.tool_calls) ||
    parseToolCallFromToolCalls(message.calls) ||
    parseToolCallFromToolCalls(message.function_call ? [message.function_call] : undefined);

  if (structuredToolCall) {
    return {
      content,
      toolCall: structuredToolCall,
      toolCallSource: "tool_calls",
    };
  }

  const contentToolCall = parseToolCallFromContent(content);
  if (contentToolCall) {
    return {
      content,
      toolCall: contentToolCall,
      toolCallSource: "content",
    };
  }

  const reasoningToolCall = parseToolCallFromContent(reasoningContent);
  if (reasoningToolCall) {
    return {
      content,
      toolCall: reasoningToolCall,
      toolCallSource: "reasoning",
    };
  }

  return {
    content,
    toolCall: null,
    toolCallSource: "none",
  };
}
