import { createConfigSchematics } from "@lmstudio/sdk";

export const pluginConfigSchematics = createConfigSchematics()
  .field("allowCommandExecution", "boolean", {
    displayName: "Allow Shell Commands",
    subtitle: "Enable the 'run_command' tool. WARNING: Commands run directly on your machine.",
  }, false)
  .field("allowJavascriptExecution", "boolean", {
    displayName: "Allow JavaScript Execution",
    subtitle: "Enable the 'run_javascript' tool (sandboxed via Deno).",
  }, false)
  .field("allowPythonExecution", "boolean", {
    displayName: "Allow Python Execution",
    subtitle: "Enable the 'run_python' tool.",
  }, false)
  .build();
