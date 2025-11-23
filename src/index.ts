import { type PluginContext } from "@lmstudio/sdk";
import { toolsProvider } from "./toolsProvider";
import { promptPreprocessor } from "./promptPreprocessor";
import { pluginConfigSchematics } from "./config";

export async function main(context: PluginContext) {
  // Register the configuration schematics.
  context.withConfigSchematics(pluginConfigSchematics);

  // Register the tools provider, passing the client to it.
  context.withToolsProvider(toolsProvider(context.client));
  
  // Register the prompt preprocessor to inject documentation on startup.
  context.withPromptPreprocessor(promptPreprocessor);
}
