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
  .field("codeExecutionSafetyLevel", "select", {
    displayName: "Code Execution Safety Level",
    subtitle: "Determines the safety level for executing code.",
    options: ["secure", "ask", "unsafe"],
  }, "secure")
  .field("allowUnsafeExecution", "boolean", {
    displayName: "Allow Unsafe Execution",
    subtitle: "DANGER: This allows tools to execute any code, which can be very dangerous.",
    hidden: (config: { codeExecutionSafetyLevel: string; }) => config.codeExecutionSafetyLevel !== "unsafe",
  }, false)
  .field("javascriptExecutionSafetyLevel", "select", {
    displayName: "JavaScript Execution Safety Level",
    subtitle: "Determines the safety level for executing JavaScript code. 'secure' means disabled.",
    options: ["secure", "ask", "unsafe"],
  }, "secure")
  .field("pythonExecutionSafetyLevel", "select", {
    displayName: "Python Execution Safety Level",
    subtitle: "Determines the safety level for executing Python code. 'secure' means disabled.",
    options: ["secure", "ask", "unsafe"],
  }, "secure")
  .field("terminalExecutionSafetyLevel", "select", {
    displayName: "Terminal Execution Safety Level",
    subtitle: "Determines the safety level for executing terminal commands. 'secure' means disabled.",
    options: ["secure", "ask", "unsafe"],
  }, "secure")
  .field("executeCommandSafetyLevel", "select", {
    displayName: "Execute Command Safety Level",
    subtitle: "Determines the safety level for executing shell commands. 'secure' means disabled.",
    options: ["secure", "ask", "unsafe"],
  }, "secure")
  .field("allowAllCode", "boolean", {
    displayName: "Allow All Code",
    subtitle: "DANGER: This overrides all other safety settings to allow all code execution.",
    hidden: (config: { codeExecutionSafetyLevel: string; }) => config.codeExecutionSafetyLevel !== "unsafe",
  }, false)
  .build();
