import type { LocaleDict } from "./types";

export const en: LocaleDict = {
  config: {
    messageLanguage: {
      displayName: "Message Language",
      subtitle:
        "Language used for runtime messages, hints, and prompt injections. Changes take effect immediately without restart.",
    },
    uiLanguageOverride: {
      displayName: "UI Language Override (Next Restart)",
      subtitle:
        "Force the Config UI to a specific locale on the next plugin restart, overriding OS detection. Set to 'auto' to use OS detection. Options: auto, en, zh-CN, zh-TW, de.",
    },

    planMode: {
      displayName: "Plan Mode",
      subtitle:
        "Controls when the model should explore and propose a plan before making changes. Options: 'always', 'when_useful', 'never'.",
    },
    retrievalLimit: {
      displayName: "Retrieval Limit",
      subtitle: "When retrieval is triggered, this is the maximum number of chunks to return.",
    },
    retrievalAffinityThreshold: {
      displayName: "Retrieval Affinity Threshold",
      subtitle: "The minimum similarity score for a chunk to be considered relevant.",
    },

    allowJavascriptExecution: {
      displayName: "Allow JavaScript Execution",
      subtitle: "Enable the 'run_javascript' tool. DANGER: Code runs on your machine.",
    },
    allowPythonExecution: {
      displayName: "Allow Python Execution",
      subtitle: "Enable the 'run_python' tool. DANGER: Code runs on your machine.",
    },
    allowTerminalExecution: {
      displayName: "Allow Terminal Execution",
      subtitle: "Enable the 'run_in_terminal' tool. Opens real terminal windows.",
    },
    allowShellCommandExecution: {
      displayName: "Allow Shell Command Execution",
      subtitle: "Enable the 'execute_command' tool. DANGER: Commands run on your machine.",
    },
    allowBrowserControl: {
      displayName: "Allow Browser Control",
      subtitle:
        "Enable browser automation tools ('browser_open_page' and browser session tools). DANGER: Automated browsing/actions run on your machine.",
    },
    allowGitOperations: {
      displayName: "Allow Git Operations",
      subtitle: "Enable native git tools (status, diff, show, commit, log, add, checkout, push).",
    },
    allowGitHubTools: {
      displayName: "Allow GitHub CLI Tools",
      subtitle:
        "Enable native GitHub CLI tools. Requires 'gh' installed.",
    },
    allowDatabaseInspection: {
      displayName: "Allow Database Inspection",
      subtitle: "Enable 'query_database' for SQLite files.",
    },
    allowSystemNotifications: {
      displayName: "Allow System Notifications",
      subtitle: "Enable the agent to send OS notifications.",
    },
    allowAllCode: {
      displayName: "Allow All Code Execution",
      subtitle: "MASTER SWITCH: Overrides all other settings to enable ALL execution tools.",
    },

    searchApiKey: {
      displayName: "Search API Key",
      subtitle: "Optional API key for search services (if supported) to avoid rate limits.",
    },
    embeddingModel: {
      displayName: "Embedding Model",
      subtitle: "Model to use for RAG features (default: nomic-ai/nomic-embed-text-v1.5-GGUF)",
    },
    defaultWorkspacePath: {
      displayName: "Default Workspace Path",
      subtitle:
        "Optional startup workspace path. Leave empty to use the built-in default workspace directory.",
    },

    enableMemory: {
      displayName: "Enable Memory",
      subtitle:
        "If enabled, the model can save and recall information from a 'memory.md' file in the workspace.",
    },
    enableWikipediaTool: {
      displayName: "Enable Wikipedia Tool",
      subtitle: "Enable the 'wikipedia_search' tool.",
    },
    enableLocalRag: {
      displayName: "Enable Local RAG",
      subtitle: "Enable the 'rag_local_files' tool for searching workspace files.",
    },

    enableSecondaryAgent: {
      displayName: "Enable Secondary Agent/Model",
      subtitle:
        "Allow the main model to delegate tasks to a secondary model (e.g., for summarization).",
    },
    useMainModelForSubAgent: {
      displayName: "Use Main Model as Sub-Agent",
      subtitle:
        "If enabled, the sub-agent loop will use your main LM Studio server (localhost:1234). Ignores 'Endpoint' setting.",
    },
    secondaryAgentEndpoint: {
      displayName: "Secondary Agent Endpoint",
      subtitle: "The API endpoint for the secondary model (e.g., 'http://localhost:1234/v1').",
    },
    secondaryModelId: {
      displayName: "Secondary Model ID",
      subtitle: "The ID of the model to use for the secondary agent (must be loaded/available).",
    },

    subAgentProfiles: {
      displayName: "Sub-Agent Profiles (JSON)",
      subtitle:
        'Define available sub-agents. Format: {"coder": "You are a coding expert...", ...}',
    },
    subAgentFrequency: {
      displayName: "Sub-Agent Frequency",
      subtitle:
        "Controls how often the agent is encouraged to delegate. Options: 'always', 'when_useful', 'hard_tasks', 'never'.",
    },
    subAgentAllowFileSystem: {
      displayName: "Sub-Agent: Allow File System",
      subtitle: "If enabled, sub-agents can read/list files.",
    },
    subAgentAllowWeb: {
      displayName: "Sub-Agent: Allow Web Search",
      subtitle: "If enabled, sub-agents can use Wikipedia and DuckDuckGo.",
    },
    subAgentAllowCode: {
      displayName: "Sub-Agent: Allow Code Execution",
      subtitle: "If enabled, sub-agents can run Python/JS code. DANGER!",
    },
    subAgentAllowBrowserControl: {
      displayName: "Sub-Agent: Allow Browser Control",
      subtitle:
        "If enabled, sub-agents can use browser automation tools (requires global 'Allow Browser Control' and 'Sub-Agent: Allow Web Search').",
    },
    subAgentTimeLimit: {
      displayName: "Sub-Agent Time Limit (seconds)",
      subtitle:
        "Maximum time allowed for sub-agent tasks before forced termination. Default: 600s (10 mins).",
    },

    enableDebugMode: {
      displayName: "Enable Auto-Debug Mode",
      subtitle:
        "If enabled, coding tasks delegated to sub-agents will automatically trigger a second 'Reviewer' pass to check for errors.",
    },
    enableSubAgentDebugLogging: {
      displayName: "Enable Sub-Agent Debug Logging",
      subtitle:
        "If enabled, logs sub-agent tool-call parsing details to the console for troubleshooting.",
    },
    subAgentAutoSave: {
      displayName: "Sub-Agent: Auto-Save Code",
      subtitle:
        "If enabled, code blocks generated by the sub-agent that aren't explicitly saved will be automatically saved to files.",
    },
    showFullCodeOutput: {
      displayName: "Show Full Code Output",
      subtitle:
        "If enabled, the Main Agent will display the full code content of generated files instead of just the file paths.",
    },
  },

  runtime: {
    statusLoadingEmbeddingModel: "Loading an embedding model for retrieval...",
    statusRetrievingCitations: "Retrieving relevant citations for user query...",
    statusRetrievedCitations: (count) => `Retrieved ${count} relevant citations for user query`,
    statusNoRelevantCitations: "No relevant citations found for user query",
    statusDecidingStrategy: "Deciding how to handle the document(s)...",
    statusLoadingParser: (fileName) => `Loading parser for ${fileName}...`,
    statusStrategyChosen: (strategy, detail) => `Chosen context injection strategy: '${strategy}'. ${detail}`,

    citationPrefix: "The following citations were found in the files provided by the user:\n\n",
    citationEntry: (num, text) => `Citation ${num}: "${text}"\n\n`,
    citationSuffix: (userQuery) =>
      "Use the citations above to respond to the user query, only if they are relevant. " +
      "Otherwise, respond to the best of your ability without them." +
      `\n\nUser Query:\n\n${userQuery}`,
    noRelevantCitationsNote:
      "Important: No citations were found in the user files for the user query. " +
      "In less than one sentence, inform the user of this. " +
      "Then respond to the query to the best of your ability.",

    documentInjectionHeader:
      "This is a Enriched Context Generation scenario.\n\nThe following content was found in the files provided by the user.\n",
    documentInjectionFileBlock: (fileName, content) =>
      `\n\n** ${fileName} full content **\n\n${content}\n\n** end of ${fileName} **\n\n`,
    documentInjectionSuffix: (userQuery) =>
      `Based on the content above, please provide a response to the user query.\n\nUser query: ${userQuery}`,

    delegationHintAlways:
      "\n\n**SYSTEM MANDATE:** You MUST delegate ALL information retrieval, news summaries, and **ALL coding tasks** (creation, editing, refactoring) to the secondary agent. Do NOT write code or use search tools yourself. Use `consult_secondary_agent` with `allow_tools: true`.\n\n**PRE-DELEGATION CHECKLIST:**\n1. Run `list_directory` to see what files already exist.\n2. Read `beledarian_info.md` or `README.md` if present.\n3. CALL `consult_secondary_agent` with the context.",
    delegationHintWhenUseful:
      "\n\n**SYSTEM ADVICE:** For complex tasks (e.g., 'create an app', 'refactor this module', 'research and summarize'), you **MUST** delegate to the secondary agent using `consult_secondary_agent` (set `allow_tools: true`).\n\n**Why Delegate?**\n- The Sub-Agent has a specialized loop for coding and debugging.\n- It will automatically SAVE all files. You do not need to do it.\n\n**How to Delegate:**\n1. Gather context (`list_directory`, `read_file`).\n2. Call `consult_secondary_agent` with a clear task description and the context you found.\n",
    delegationHintWhenUsefulDebug:
      "Note: 'Auto-Debug' is ACTIVE. The Sub-Agent will verify and fix its own code. This is the safest way to generate code.\n",
    delegationHintHardTasks:
      "\n\n**Delegation Hint:** Only delegate EXTREMELY complex or computationally expensive tasks to the secondary agent. Handle standard queries and file reads yourself.\n",

    planHintAlways:
      "\n\n**PLAN MODE [ACTIVE]:** Before making ANY file changes or implementing features, you MUST:\n1. **EXPLORE:** Use `list_directory`, `read_file`, and other exploration tools to understand the codebase structure.\n2. **PROPOSE:** Present a clear, step-by-step plan outlining what you will do and why.\n3. **WAIT:** Do NOT start implementing until the user approves your plan or gives explicit permission to proceed.\n\n**Exception:** Simple conversations, clarifications, or trivial single-line edits do not require planning.",
    planHintWhenUseful:
      "\n\n**PLAN MODE [When Useful]:** For larger, complex, or ambiguous requests:\n1. **EXPLORE FIRST:** Use `list_directory`, `read_file` to understand the codebase before making changes.\n2. **PROPOSE A PLAN:** Outline your approach and key steps before implementing.\n3. **SKIP FOR SIMPLE TASKS:** Normal conversations or small edits (e.g., typo fixes, single function changes) do not require planning.",
  },
};
