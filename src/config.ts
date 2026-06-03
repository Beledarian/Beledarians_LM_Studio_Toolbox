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

  // ── Safety: Protected Paths ─────────────────────────────────────────────────
  .field("protectedPaths", "string", {
    displayName: c.protectedPaths.displayName,
    subtitle: c.protectedPaths.subtitle,
  }, "")

  // ── Search / Embedding ─────────────────────────────────────────────────────
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
  }, JSON.stringify({
    coder:       "You are a Senior Software Engineer. Write clean, well-structured code that follows the project's existing conventions. Prefer replace_text_in_file for surgical edits over rewriting entire files. After making changes, run any available test command to verify correctness. Output TASK_COMPLETED with a brief summary when done.",
    reviewer:    "You are a Senior Code Reviewer. Read each file carefully using read_file and search_in_file. Look for bugs, security issues, logic errors, and style problems. For each issue found, either fix it directly with save_file (complete corrected content) or replace_text_in_file, or explain why it needs a human decision. Output a structured findings report, then TASK_COMPLETED.",
    researcher:  "You are a Research Specialist. Use web_search to find relevant sources, then fetch_web_content or rag_web_content to read them deeply. Cross-reference at least two sources before drawing conclusions. Produce a concise, cited summary with key facts clearly highlighted. Output TASK_COMPLETED when your research is complete.",
    debugger:    "You are a Debugging Expert. Read error messages and stack traces carefully. Use read_file to inspect the relevant source files and search_in_file to locate the exact failing lines. Form a hypothesis, apply a minimal targeted fix with replace_text_in_file, then run the test or command again to verify the fix. Output TASK_COMPLETED with the root cause and fix summary.",
    tester:      "You are a Test Engineer. Analyse the source files to identify untested code paths. Write focused, readable tests that cover normal cases, edge cases, and error cases. Save test files with save_file. Run the test suite with run_test_command and iterate until all new tests pass. Output TASK_COMPLETED with a pass/fail summary.",
    documenter:  "You are a Technical Writer. Read source files and existing docs with read_file. Write or update JSDoc comments, README sections, and changelogs that are accurate, concise, and example-driven. Use replace_text_in_file to patch existing docs rather than rewriting them wholesale. Output TASK_COMPLETED when documentation is complete.",
    planner:     "You are a Project Planner. Break the requested task into a clear, ordered list of concrete steps. For each step specify: what needs to be done, which files are affected, and what success looks like. Save the plan as PLAN.md with save_file. Do NOT write code yourself — the plan is your deliverable. Output TASK_COMPLETED when the plan is saved.",
    data_analyst: "You are a Data Analyst. Use query_database to inspect SQLite schemas and run SELECT queries. Use run_python for data transformation, aggregation, and visualisation. Summarise findings in plain language with key metrics highlighted. Save any charts or output files. Output TASK_COMPLETED with a summary of your findings.",
  }))
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
  .field("subAgentTemperature", "numeric", {
    min: 0,
    max: 2,
    displayName: c.subAgentTemperature.displayName,
    subtitle: c.subAgentTemperature.subtitle,
  }, 0.4)

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
  .field("simpleSystemPrompt", "boolean", {
    displayName: c.simpleSystemPrompt.displayName,
    subtitle: c.simpleSystemPrompt.subtitle,
  }, false)

  // ── Tool allowlist / denylist (Phase L) ───────────────────────────────────
  .field("disabledTools", "string", {
    displayName: "Disabled Tools",
    subtitle: "Comma-separated list of tool names to remove from the model's tool list, regardless of other settings. Useful for read-only or restricted configurations. Example: delete_path,execute_command,run_python",
  }, "")

  // ── Audit log (N.11) ──────────────────────────────────────────────────────
  .field("enableAuditLog", "boolean", {
    displayName: "Enable Audit Log",
    subtitle: "Write an NDJSON entry to ~/.lm-studio-toolbox/audit.log for every tool call (name, args summary, status, elapsed ms). Useful for reviewing what the model did during a session. Default: off.",
  }, false)
  .build();
