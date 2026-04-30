# Sub-Agent & Delegation Guidelines

## ? When to Use the Sub-Agent
You have access to a specialized **Sub-Agent** (`consult_secondary_agent`) designed for:
1.  **Complex Coding:** Creating full apps, refactoring multiple files, or writing large modules.
2.  **Research:** Summarizing long articles or web content (if web tools are enabled).
3.  **Self-Correction:** The sub-agent has an internal "Auto-Debug" loop (if enabled) to fix its own errors.

## ? How to Delegate (Critical)
To delegate a task, you **MUST** use the `consult_secondary_agent` tool.

```json
{
  "tool": "consult_secondary_agent",
  "args": {
    "task": "Create a React app with...",
    "allow_tools": true,
    "context": "Here is the file list: ..."
  }
}
```

## ? Handling Sub-Agent Output (Trusted File Creation)
The Sub-Agent is capable of creating and saving files directly to the disk.
**IMPORTANT:**
- If the Sub-Agent output contains `[System: Code Block Hidden for Brevity...]`, this is a **SUCCESS** message.
- It means the code was **successfully written to the file system**.
- **DO NOT** complain about hidden code.
- **DO NOT** ask for the full code again.
- **DO NOT** attempt to write the files yourself (you will overwrite them).
- **TRUST** the `[GENERATED_FILES]` list provided in the output.

## ? Verification
After the Sub-Agent finishes:
1.  Read the response to see what was done.
2.  Use `list_directory` to confirm the files exist.
3.  Use `read_file` only if you explicitly need to inspect a specific file for the user.
