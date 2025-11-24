import { createConfigSchematics } from "@lmstudio/sdk";

export const pluginConfigSchematics = createConfigSchematics()
  .field("retrievalLimit", "numeric", {
    int: true,
    min: 1,
    displayName: "Retrieval Limit",
    subtitle: "When retrieval is triggered, this is the maximum number of chunks to return.",
    slider: { min: 1, max: 10, step: 1 },
  }, 3)
  .field("retrievalAffinityThreshold", "numeric", {
    min: 0.0,
    max: 1.0,
    displayName: "Retrieval Affinity Threshold",
    subtitle: "The minimum similarity score for a chunk to be considered relevant.",
    slider: { min: 0.0, max: 1.0, step: 0.01 },
  }, 0.5)
  .field("allowJavascriptExecution", "boolean", {
    displayName: "Allow JavaScript Execution",
    subtitle: "Enable the 'run_javascript' tool. DANGER: Code runs on your machine.",
  }, false)
  .field("allowPythonExecution", "boolean", {
    displayName: "Allow Python Execution",
    subtitle: "Enable the 'run_python' tool. DANGER: Code runs on your machine.",
  }, false)
  .field("allowTerminalExecution", "boolean", {
    displayName: "Allow Terminal Execution",
    subtitle: "Enable the 'run_in_terminal' tool. Opens real terminal windows.",
  }, false)
  .field("allowShellCommandExecution", "boolean", {
    displayName: "Allow Shell Command Execution",
    subtitle: "Enable the 'execute_command' tool. DANGER: Commands run on your machine.",
  }, false)
  .field("allowGitOperations", "boolean", {
    displayName: "Allow Git Operations",
    subtitle: "Enable git tools (status, commit, diff, log).",
  }, true)
  .field("allowDatabaseInspection", "boolean", {
    displayName: "Allow Database Inspection",
    subtitle: "Enable 'query_database' for SQLite files.",
  }, false)
  .field("allowSystemNotifications", "boolean", {
    displayName: "Allow System Notifications",
    subtitle: "Enable the agent to send OS notifications.",
  }, true)
  .field("allowAllCode", "boolean", {
    displayName: "Allow All Code Execution",
    subtitle: "MASTER SWITCH: Overrides all other settings to enable ALL execution tools.",
  }, false)
  .field("searchApiKey", "string", {
    displayName: "Search API Key",
    subtitle: "Optional API key for search services (if supported) to avoid rate limits.",
  }, "")
  .field("embeddingModel", "string", {
    displayName: "Embedding Model",
    subtitle: "Model to use for RAG features (default: nomic-ai/nomic-embed-text-v1.5-GGUF)",
  }, "nomic-ai/nomic-embed-text-v1.5-GGUF")
    .field("enableMemory", "boolean", {
      displayName: "Enable Memory",
      subtitle: "If enabled, the model can save and recall information from a 'memory.md' file in the workspace.",
    }, false)
    .field("enableWikipediaTool", "boolean", {
      displayName: "Enable Wikipedia Tool",
      subtitle: "Enable the 'wikipedia_search' tool.",
    }, true)
    .field("enableLocalRag", "boolean", {
      displayName: "Enable Local RAG",
      subtitle: "Enable the 'rag_local_files' tool for searching workspace files.",
    }, true)
    .field("enableSecondaryAgent", "boolean", {
      displayName: "Enable Secondary Agent/Model",
      subtitle: "Allow the main model to delegate tasks to a secondary model (e.g., for summarization).",
    }, false)
    .field("useMainModelForSubAgent", "boolean", {
      displayName: "Use Main Model as Sub-Agent",
      subtitle: "If enabled, the sub-agent loop will use your main LM Studio server (localhost:1234). Ignores 'Endpoint' setting.",
    }, false)
    .field("secondaryAgentEndpoint", "string", {
      displayName: "Secondary Agent Endpoint",
      subtitle: "The API endpoint for the secondary model (e.g., 'http://localhost:1234/v1').",
    }, "http://localhost:1234/v1")
    .field("secondaryModelId", "string", {
      displayName: "Secondary Model ID",
      subtitle: "The ID of the model to use for the secondary agent (must be loaded/available).",
    }, "local-model") // Default to generic
        .field("subAgentProfiles", "string", {
          displayName: "Sub-Agent Profiles (JSON)",
          subtitle: "Define available sub-agents. Format: {\"coder\": \"You are a coding expert...\", ...}",
        }, '{"summarizer": "You are a summarization expert. Summarize the content concisely.", "coder": "You are a software engineer. Write efficient and safe code."}')
          .field("subAgentFrequency", "string", {
            displayName: "Sub-Agent Frequency",
            subtitle: "Controls how often the agent is encouraged to delegate. Options: 'always', 'when_useful', 'hard_tasks', 'never'.",
          }, "when_useful")
          .field("subAgentAllowFileSystem", "boolean", {
            displayName: "Sub-Agent: Allow File System",
            subtitle: "If enabled, sub-agents can read/list files.",
          }, true)
          .field("subAgentAllowWeb", "boolean", {
            displayName: "Sub-Agent: Allow Web Search",
            subtitle: "If enabled, sub-agents can use Wikipedia and DuckDuckGo.",
          }, true)
            .field("subAgentAllowCode", "boolean", {
              displayName: "Sub-Agent: Allow Code Execution",
              subtitle: "If enabled, sub-agents can run Python/JS code. DANGER!",
            }, false)
              .field("enableDebugMode", "boolean", {
                displayName: "Enable Auto-Debug Mode",
                subtitle: "If enabled, coding tasks delegated to sub-agents will automatically trigger a second 'Reviewer' pass to check for errors.",
              }, false)
                .field("subAgentAutoSave", "boolean", {
                  displayName: "Sub-Agent: Auto-Save Code",
                  subtitle: "If enabled, code blocks generated by the sub-agent that aren't explicitly saved will be automatically saved to files.",
                }, true)
                .field("showFullCodeOutput", "boolean", {
                  displayName: "Show Full Code Output",
                  subtitle: "If enabled, the Main Agent will display the full code content of generated files instead of just the file paths.",
                }, false)
                .build();
              