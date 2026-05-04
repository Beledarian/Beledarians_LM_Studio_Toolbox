import { createConfigSchematics } from "@lmstudio/sdk";
import { getSystemDict } from "./locales/i18n";

// ─────────────────────────────────────────────────────────────
// Layer 1: Detect system locale once at plugin boot.
// The dictionary is loaded synchronously here so that
// withConfigSchematics() — which can only be called once — uses
// the correct translated strings immediately.
// ─────────────────────────────────────────────────────────────
const { dict: t, resolvedLocale } = getSystemDict();
const c = t.config;

export const pluginConfigSchematics = createConfigSchematics()
  // ── Layer 2: Message Language (dynamic runtime language selector) ──────────
  .field("messageLanguage", "string", {
    displayName: c.messageLanguage.displayName,
    subtitle: c.messageLanguage.subtitle,
  }, resolvedLocale)

  // ── UI Language Override (persisted; takes effect on next restart) ──────────
  .field("uiLanguageOverride", "string", {
    displayName: c.uiLanguageOverride.displayName,
    subtitle: c.uiLanguageOverride.subtitle,
  }, "auto")

  // ── Planning ───────────────────────────────────────────────────────────────
  .field("planMode", "string", {
    displayName: c.planMode.displayName,
    subtitle: c.planMode.subtitle,
  }, "when_useful")

  // ── Retrieval ──────────────────────────────────────────────────────────────
  .field("retrievalLimit", "numeric", {
    int: true,
    min: 1,
    displayName: c.retrievalLimit.displayName,
    subtitle: c.retrievalLimit.subtitle,
    slider: { min: 1, max: 10, step: 1 },
  }, 3)
  .field("retrievalAffinityThreshold", "numeric", {
    min: 0.0,
    max: 1.0,
    displayName: c.retrievalAffinityThreshold.displayName,
    subtitle: c.retrievalAffinityThreshold.subtitle,
    slider: { min: 0.0, max: 1.0, step: 0.01 },
  }, 0.5)

  // ── Execution Permissions ──────────────────────────────────────────────────
  .field("allowJavascriptExecution", "boolean", {
    displayName: c.allowJavascriptExecution.displayName,
    subtitle: c.allowJavascriptExecution.subtitle,
  }, false)
  .field("allowPythonExecution", "boolean", {
    displayName: c.allowPythonExecution.displayName,
    subtitle: c.allowPythonExecution.subtitle,
  }, false)
  .field("allowTerminalExecution", "boolean", {
    displayName: c.allowTerminalExecution.displayName,
    subtitle: c.allowTerminalExecution.subtitle,
  }, false)
  .field("allowShellCommandExecution", "boolean", {
    displayName: c.allowShellCommandExecution.displayName,
    subtitle: c.allowShellCommandExecution.subtitle,
  }, false)
  .field("allowBrowserControl", "boolean", {
    displayName: c.allowBrowserControl.displayName,
    subtitle: c.allowBrowserControl.subtitle,
  }, false)
  .field("allowGitOperations", "boolean", {
    displayName: c.allowGitOperations.displayName,
    subtitle: c.allowGitOperations.subtitle,
  }, true)
  .field("allowGitHubTools", "boolean", {
    displayName: c.allowGitHubTools.displayName,
    subtitle: c.allowGitHubTools.subtitle,
  }, true)
  .field("allowDatabaseInspection", "boolean", {
    displayName: c.allowDatabaseInspection.displayName,
    subtitle: c.allowDatabaseInspection.subtitle,
  }, false)
  .field("allowSystemNotifications", "boolean", {
    displayName: c.allowSystemNotifications.displayName,
    subtitle: c.allowSystemNotifications.subtitle,
  }, true)
  .field("allowAllCode", "boolean", {
    displayName: c.allowAllCode.displayName,
    subtitle: c.allowAllCode.subtitle,
  }, false)

  // ── Search / Embedding ─────────────────────────────────────────────────────
  .field("searchApiKey", "string", {
    displayName: c.searchApiKey.displayName,
    subtitle: c.searchApiKey.subtitle,
  }, "")
  .field("embeddingModel", "string", {
    displayName: c.embeddingModel.displayName,
    subtitle: c.embeddingModel.subtitle,
  }, "nomic-ai/nomic-embed-text-v1.5-GGUF")

  // ── Workspace ──────────────────────────────────────────────────────────────
  .field("defaultWorkspacePath", "string", {
    displayName: c.defaultWorkspacePath.displayName,
    subtitle: c.defaultWorkspacePath.subtitle,
  }, "")

  // ── Features ───────────────────────────────────────────────────────────────
  .field("enableMemory", "boolean", {
    displayName: c.enableMemory.displayName,
    subtitle: c.enableMemory.subtitle,
  }, false)
  .field("enableWikipediaTool", "boolean", {
    displayName: c.enableWikipediaTool.displayName,
    subtitle: c.enableWikipediaTool.subtitle,
  }, true)
  .field("enableLocalRag", "boolean", {
    displayName: c.enableLocalRag.displayName,
    subtitle: c.enableLocalRag.subtitle,
  }, true)

  // ── Secondary Agent ────────────────────────────────────────────────────────
  .field("enableSecondaryAgent", "boolean", {
    displayName: c.enableSecondaryAgent.displayName,
    subtitle: c.enableSecondaryAgent.subtitle,
  }, false)
  .field("useMainModelForSubAgent", "boolean", {
    displayName: c.useMainModelForSubAgent.displayName,
    subtitle: c.useMainModelForSubAgent.subtitle,
  }, false)
  .field("secondaryAgentEndpoint", "string", {
    displayName: c.secondaryAgentEndpoint.displayName,
    subtitle: c.secondaryAgentEndpoint.subtitle,
  }, "http://localhost:1234/v1")
  .field("secondaryModelId", "string", {
    displayName: c.secondaryModelId.displayName,
    subtitle: c.secondaryModelId.subtitle,
  }, "local-model")

  // ── Sub-Agent Configuration ────────────────────────────────────────────────
  .field("subAgentProfiles", "string", {
    displayName: c.subAgentProfiles.displayName,
    subtitle: c.subAgentProfiles.subtitle,
  }, '{"summarizer": "You are a summarization expert. Summarize the content concisely.", "coder": "You are a software engineer. Write efficient and safe code."}')
  .field("subAgentFrequency", "string", {
    displayName: c.subAgentFrequency.displayName,
    subtitle: c.subAgentFrequency.subtitle,
  }, "when_useful")
  .field("subAgentAllowFileSystem", "boolean", {
    displayName: c.subAgentAllowFileSystem.displayName,
    subtitle: c.subAgentAllowFileSystem.subtitle,
  }, true)
  .field("subAgentAllowWeb", "boolean", {
    displayName: c.subAgentAllowWeb.displayName,
    subtitle: c.subAgentAllowWeb.subtitle,
  }, true)
  .field("subAgentAllowCode", "boolean", {
    displayName: c.subAgentAllowCode.displayName,
    subtitle: c.subAgentAllowCode.subtitle,
  }, false)
  .field("subAgentAllowBrowserControl", "boolean", {
    displayName: c.subAgentAllowBrowserControl.displayName,
    subtitle: c.subAgentAllowBrowserControl.subtitle,
  }, false)
  .field("subAgentTimeLimit", "numeric", {
    int: true,
    min: 30,
    max: 3600,
    displayName: c.subAgentTimeLimit.displayName,
    subtitle: c.subAgentTimeLimit.subtitle,
  }, 600)

  // ── Debug / Output ─────────────────────────────────────────────────────────
  .field("enableDebugMode", "boolean", {
    displayName: c.enableDebugMode.displayName,
    subtitle: c.enableDebugMode.subtitle,
  }, false)
  .field("enableSubAgentDebugLogging", "boolean", {
    displayName: c.enableSubAgentDebugLogging.displayName,
    subtitle: c.enableSubAgentDebugLogging.subtitle,
  }, false)
  .field("subAgentAutoSave", "boolean", {
    displayName: c.subAgentAutoSave.displayName,
    subtitle: c.subAgentAutoSave.subtitle,
  }, true)
  .field("showFullCodeOutput", "boolean", {
    displayName: c.showFullCodeOutput.displayName,
    subtitle: c.showFullCodeOutput.subtitle,
  }, false)
  .build();
