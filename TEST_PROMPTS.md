# Testing New T-Tools Features

Use these prompts to verify the newly added functionality. Ensure you have enabled the respective features in the plugin settings.

## 1. Wikipedia Search
**Prompt:**
> "Search Wikipedia for 'Generative adversarial network' and give me a summary of the concept."

**Expected Behavior:**
The agent should call `wikipedia_search`, retrieve the summary, and explain it to you.

## 2. Local RAG (File Search)
**Prompt:**
> "Use the local rag tool to find where the 'consult_secondary_agent' tool is defined in the source code. What parameters does it take?"

**Expected Behavior:**
The agent should call `rag_local_files` with a query like "consult_secondary_agent definition", retrieve snippets from `src/toolsProvider.ts`, and list the parameters (`task`, `agent_role`, etc.).

## 3. Secondary Agent (Delegation)
*Prerequisite: Have a second LLM server running at the configured endpoint (default: http://localhost:1234/v1).*

**Prompt:**
> "I need a high-level summary of the file `src/promptPreprocessor.ts`. Please ask the 'summarizer' agent to read it and provide a brief overview."

**Expected Behavior:**
1. The main agent calls `consult_secondary_agent` with `agent_role: "summarizer"`.
2. The secondary agent (in the loop) calls `read_file` to get the content of `src/promptPreprocessor.ts`.
3. The secondary agent processes the content and returns a summary.
4. The main agent presents the final summary to you.

## 4. Sub-Agent (Coder Profile)
**Prompt:**
> "Ask the 'coder' agent to write a small Python script to calculate the Fibonacci sequence and save it to `fib.py`."

**Expected Behavior:**
The secondary agent (acting as 'coder') generates the code and uses `save_file` (if `allow_tools` was enabled/passed correctly in the loop) or returns the code for the main agent to save. *Note: The current implementation allows the secondary agent to use tools if `allow_tools` is true.*
