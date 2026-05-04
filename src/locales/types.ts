/**
 * Shared type contract for all locale dictionaries.
 * Adding a key here forces ALL locale files to provide a translation.
 */
export interface LocaleDict {
  // ──────────────────────────────────────────────────────────────
  // LAYER 1 – Config UI strings (used in config.ts / withConfigSchematics)
  // ──────────────────────────────────────────────────────────────
  config: {
    messageLanguage: { displayName: string; subtitle: string };

    planMode: { displayName: string; subtitle: string };
    retrievalLimit: { displayName: string; subtitle: string };
    retrievalAffinityThreshold: { displayName: string; subtitle: string };

    allowJavascriptExecution: { displayName: string; subtitle: string };
    allowPythonExecution: { displayName: string; subtitle: string };
    allowTerminalExecution: { displayName: string; subtitle: string };
    allowShellCommandExecution: { displayName: string; subtitle: string };
    allowBrowserControl: { displayName: string; subtitle: string };
    allowGitOperations: { displayName: string; subtitle: string };
    allowGitHubTools: { displayName: string; subtitle: string };
    allowDatabaseInspection: { displayName: string; subtitle: string };
    allowSystemNotifications: { displayName: string; subtitle: string };
    allowAllCode: { displayName: string; subtitle: string };

    searchApiKey: { displayName: string; subtitle: string };
    embeddingModel: { displayName: string; subtitle: string };
    defaultWorkspacePath: { displayName: string; subtitle: string };

    enableMemory: { displayName: string; subtitle: string };
    enableWikipediaTool: { displayName: string; subtitle: string };
    enableLocalRag: { displayName: string; subtitle: string };

    enableSecondaryAgent: { displayName: string; subtitle: string };
    useMainModelForSubAgent: { displayName: string; subtitle: string };
    secondaryAgentEndpoint: { displayName: string; subtitle: string };
    secondaryModelId: { displayName: string; subtitle: string };

    subAgentProfiles: { displayName: string; subtitle: string };
    subAgentFrequency: { displayName: string; subtitle: string };
    subAgentAllowFileSystem: { displayName: string; subtitle: string };
    subAgentAllowWeb: { displayName: string; subtitle: string };
    subAgentAllowCode: { displayName: string; subtitle: string };
    subAgentAllowBrowserControl: { displayName: string; subtitle: string };
    subAgentTimeLimit: { displayName: string; subtitle: string };

    enableDebugMode: { displayName: string; subtitle: string };
    enableSubAgentDebugLogging: { displayName: string; subtitle: string };
    subAgentAutoSave: { displayName: string; subtitle: string };
    showFullCodeOutput: { displayName: string; subtitle: string };
  };

  // ──────────────────────────────────────────────────────────────
  // LAYER 2 – Runtime strings (used in promptPreprocessor.ts)
  // ──────────────────────────────────────────────────────────────
  runtime: {
    // Status bar
    statusLoadingEmbeddingModel: string;
    statusRetrievingCitations: string;
    statusRetrievedCitations: (count: number) => string;
    statusNoRelevantCitations: string;
    statusDecidingStrategy: string;
    statusLoadingParser: (fileName: string) => string;
    statusStrategyChosen: (strategy: string, detail: string) => string;

    // Retrieval results
    citationPrefix: string;
    citationEntry: (num: number, text: string) => string;
    citationSuffix: (userQuery: string) => string;
    noRelevantCitationsNote: string;

    // Document injection
    documentInjectionHeader: string;
    documentInjectionFileBlock: (fileName: string, content: string) => string;
    documentInjectionSuffix: (userQuery: string) => string;

    // Delegation hints
    delegationHintAlways: string;
    delegationHintWhenUseful: string;
    delegationHintWhenUsefulDebug: string;
    delegationHintHardTasks: string;

    // Plan mode hints
    planHintAlways: string;
    planHintWhenUseful: string;
  };
}
