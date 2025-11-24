import {
  text,
  type Chat,
  type ChatMessage,
  type FileHandle,
  type LLMDynamicHandle,
  type PredictionProcessStatusController,
  type PromptPreprocessorController,
} from "@lmstudio/sdk";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { pluginConfigSchematics } from "./config";
import { TOOLS_DOCUMENTATION } from "./toolsDocumentation";
import { getPersistedState, savePersistedState } from "./stateManager";

type DocumentContextInjectionStrategy = "none" | "inject-full-content" | "retrieval";

export async function promptPreprocessor(ctl: PromptPreprocessorController, userMessage: ChatMessage) {
  const userPrompt = userMessage.getText();
  
  // 1. RAG / Context Injection Logic
  const history = await ctl.pullHistory();

  // Check if this is the first turn (history is empty) before appending
  let isFirstTurn = false;
  if (Array.isArray(history)) {
    isFirstTurn = history.length === 0;
  } else if ("messages" in history && Array.isArray((history as any).messages)) {
    isFirstTurn = (history as any).messages.length === 0;
  } else if ("length" in history && typeof (history as any).length === "number") {
    isFirstTurn = (history as any).length === 0;
  } else {
    // Fallback: If we can't verify, we default to assuming it's the first turn 
    // to ensure docs are loaded at least once, but this may cause the "always load" issue
    // if the object structure is unexpected. 
    // However, moving this check before append() makes it much more likely to be correct.
    isFirstTurn = true; 
  }

  history.append(userMessage);
  
  const newFiles = userMessage.getFiles(ctl.client).filter(f => f.type !== "image");
  const files = history.getAllFiles(ctl.client).filter(f => f.type !== "image");

  let processingResult: string | ChatMessage | null = null;

  if (newFiles.length > 0) {
    const strategy = await chooseContextInjectionStrategy(ctl, userPrompt, newFiles);
    if (strategy === "inject-full-content") {
      processingResult = await prepareDocumentContextInjection(ctl, userMessage);
    } else if (strategy === "retrieval") {
      processingResult = await prepareRetrievalResultsContextInjection(ctl, userPrompt, files);
    }
  } else if (files.length > 0) {
    processingResult = await prepareRetrievalResultsContextInjection(ctl, userPrompt, files);
  }

  // Determine the current content after RAG processing
  let currentContent: string;
  if (processingResult) {
      if (typeof processingResult === 'string') {
          currentContent = processingResult;
      } else {
          // It's a ChatMessage
          currentContent = processingResult.getText();
      }
  } else {
      currentContent = userPrompt;
  }

  // --- Delegation & Safety Instructions (Every Turn) ---
  const pluginConfig = ctl.getPluginConfig(pluginConfigSchematics);
  const frequency = pluginConfig.get("subAgentFrequency");
  const debugMode = pluginConfig.get("enableDebugMode");

  let delegationHint = "";

  if (frequency === "always") {
      delegationHint = "\n\n**SYSTEM MANDATE:** You MUST delegate ALL information retrieval, news summaries, and **ALL coding tasks** (creation, editing, refactoring) to the secondary agent. Do NOT write code or use search tools yourself. Use `consult_secondary_agent` with `allow_tools: true`.\n\n**PRE-DELEGATION CHECKLIST:**\n1. Run `list_directory` to see what files already exist.\n2. Read `beledarian_info.md` or `README.md` if present.\n3. CALL `consult_secondary_agent` with the context.";
  } else if (frequency === "when_useful") {
      delegationHint = "\n\n**SYSTEM ADVICE:** For complex tasks (e.g., 'create an app', 'refactor this module', 'research and summarize'), you **MUST** delegate to the secondary agent using `consult_secondary_agent` (set `allow_tools: true`).\n\n**Why Delegate?**\n- The Sub-Agent has a specialized loop for coding and debugging.\n- It will automatically SAVE all files. You do not need to do it.\n\n**How to Delegate:**\n1. Gather context (`list_directory`, `read_file`).\n2. Call `consult_secondary_agent` with a clear task description and the context you found.\n";
      
      if (debugMode) {
          delegationHint += "Note: 'Auto-Debug' is ACTIVE. The Sub-Agent will verify and fix its own code. This is the safest way to generate code.\n";
      }

  } else if (frequency === "hard_tasks") {
      delegationHint = "\n\n**Delegation Hint:** Only delegate EXTREMELY complex or computationally expensive tasks to the secondary agent. Handle standard queries and file reads yourself.\n";
  }

  // Append the hint to the user message (effective system instruction for this turn)
  if (delegationHint) {
      currentContent += delegationHint;
  }

  // --- Sub-Agent Documentation Injection (Startup OR On-Enable) ---
  const enableSecondary = pluginConfig.get("enableSecondaryAgent");
  const state = await getPersistedState();

  // Reset the injection flag on the first turn of a new conversation
  if (isFirstTurn) {
      state.subAgentDocsInjected = false;
      await savePersistedState(state);
  }

  if (enableSecondary && !state.subAgentDocsInjected) {
      try {
          const { currentWorkingDirectory } = state;
          const subAgentDocsPath = join(currentWorkingDirectory, "subagent_docs.md");
          // Attempt to read the docs file
          const docsContent = await readFile(subAgentDocsPath, "utf-8");
          
          if (docsContent && docsContent.trim().length > 0) {
              // Prepend or Append? Append to ensure it's fresh context.
              currentContent += `\n\n---\n\n${docsContent}\n\n---\n\n`;
              ctl.debug("subagent_docs.md injected into context.");
              
              // Update state so we don't inject again for this session/workspace
              state.subAgentDocsInjected = true;
              await savePersistedState(state);
          }
      } catch (e) {
          ctl.debug("subagent_docs.md not found or failed to load. Skipping injection.");
      }
  }

  // 2. Tools Documentation & Memory Injection (Startup Only)
  if (isFirstTurn) {
    let injectionContent = TOOLS_DOCUMENTATION;

    try {
        const { currentWorkingDirectory } = await getPersistedState();
        const startupPath = join(currentWorkingDirectory, "startup.md");
        const startupContent = await readFile(startupPath, "utf-8");
        const filesToRead = startupContent.split('\n').map(f => f.trim()).filter(f => f);

        for (const file of filesToRead) {
            const filePath = join(currentWorkingDirectory, file);
            try {
                const fileContent = await readFile(filePath, "utf-8");
                if (fileContent.trim().length > 0) {
                    injectionContent = `\n\n---\n\n${fileContent}\n\n---\n\n${injectionContent}`;
                    ctl.debug(`${file} loaded and injected into context.`);
                }
            } catch (e) {
                ctl.debug(`Failed to load ${file} from startup.md.`);
            }
        }
    } catch (e) {
        ctl.debug("No startup.md file found or failed to load.");
    }

    currentContent = `${injectionContent}\n\n---\n\n${currentContent}`;
  }

  // Return the final content string if it changed, otherwise the original message
  // (The SDK expects a string to replace content, or the message object)
  if (currentContent !== userPrompt) {
      return currentContent;
  }

  // Update message count and memory
  try {
    const state = await getPersistedState();
    state.messageCount++;
    await savePersistedState(state);

    // Auto-summary disabled due to SDK type mismatch
    // if (state.messageCount % 10 === 0) { ... }
  } catch (e) {
    ctl.debug("Failed to update message count or memory.", e);
  }
  
  return userMessage;
}

async function prepareRetrievalResultsContextInjection(
  ctl: PromptPreprocessorController,
  originalUserPrompt: string,
  files: Array<FileHandle>,
): Promise<string> {
  const pluginConfig = ctl.getPluginConfig(pluginConfigSchematics);
  const retrievalLimit = pluginConfig.get("retrievalLimit");
  const retrievalAffinityThreshold = pluginConfig.get("retrievalAffinityThreshold");

  // process files if necessary

  const statusSteps = new Map<FileHandle, PredictionProcessStatusController>();

  const retrievingStatus = ctl.createStatus({
    status: "loading",
    text: `Loading an embedding model for retrieval...`,
  });
  // Using the same model as rag-v1
  const model = await ctl.client.embedding.model("nomic-ai/nomic-embed-text-v1.5-GGUF", {
    signal: ctl.abortSignal,
  });
  retrievingStatus.setState({
    status: "loading",
    text: `Retrieving relevant citations for user query...`,
  });
  const result = await ctl.client.files.retrieve(originalUserPrompt, files, {
    embeddingModel: model,
    // Affinity threshold: 0.6 not implemented in SDK retrieve options directly usually, 
    // but we filter below.
    limit: retrievalLimit,
    signal: ctl.abortSignal,
    onFileProcessList(filesToProcess) {
      for (const file of filesToProcess) {
        statusSteps.set(
          file,
          retrievingStatus.addSubStatus({
            status: "waiting",
            text: `Process ${file.name} for retrieval`,
          }),
        );
      }
    },
    onFileProcessingStart(file) {
      statusSteps
        .get(file)!
        .setState({ status: "loading", text: `Processing ${file.name} for retrieval` });
    },
    onFileProcessingEnd(file) {
      statusSteps
        .get(file)!
        .setState({ status: "done", text: `Processed ${file.name} for retrieval` });
    },
    onFileProcessingStepProgress(file, step, progressInStep) {
      const verb = step === "loading" ? "Loading" : step === "chunking" ? "Chunking" : "Embedding";
      statusSteps.get(file)!.setState({
        status: "loading",
        text: `${verb} ${file.name} for retrieval (${(progressInStep * 100).toFixed(1)}%)`,
      });
    },
  });

  result.entries = result.entries.filter(entry => entry.score > retrievalAffinityThreshold);

  // inject retrieval result into the "processed" content
  let processedContent = "";
  const numRetrievals = result.entries.length;
  if (numRetrievals > 0) {
    // retrieval occured and got results
    // show status
    retrievingStatus.setState({
      status: "done",
      text: `Retrieved ${numRetrievals} relevant citations for user query`,
    });
    ctl.debug("Retrieval results", result);
    // add results to prompt
    const prefix = "The following citations were found in the files provided by the user:\n\n";
    processedContent += prefix;
    let citationNumber = 1;
    result.entries.forEach(result => {
      const completeText = result.content;
      processedContent += `Citation ${citationNumber}: "${completeText}"\n\n`;
      citationNumber++;
    });
    await ctl.addCitations(result);
    const suffix =
      "Use the citations above to respond to the user query, only if they are relevant. " +
      `Otherwise, respond to the best of your ability without them.` +
      `\n\nUser Query:\n\n${originalUserPrompt}`;
    processedContent += suffix;
  } else {
    // retrieval occured but no relevant citations found
    retrievingStatus.setState({
      status: "canceled",
      text: `No relevant citations found for user query`,
    });
    ctl.debug("No relevant citations found for user query");
    const noteAboutNoRetrievalResultsFound =
      "Important: No citations were found in the user files for the user query. " +
      `In less than one sentence, inform the user of this. ` +
      `Then respond to the query to the best of your ability.`;
    processedContent =
      noteAboutNoRetrievalResultsFound + `\n\nUser Query:\n\n${originalUserPrompt}`;
  }
  ctl.debug("Processed content", processedContent);

  return processedContent;
}

async function prepareDocumentContextInjection(
  ctl: PromptPreprocessorController,
  input: ChatMessage,
): Promise<ChatMessage> {
  const documentInjectionSnippets: Map<FileHandle, string> = new Map();
  const files = input.consumeFiles(ctl.client, file => file.type !== "image");
  for (const file of files) {
    // This should take no time as the result is already in the cache
    const { content } = await ctl.client.files.parseDocument(file, {
      signal: ctl.abortSignal,
    });

    ctl.debug(text`
      Strategy: inject-full-content. Injecting full content of file '${file}' into the
      context. Length: ${content.length}.
    `);
    documentInjectionSnippets.set(file, content);
  }

  let formattedFinalUserPrompt = "";

  if (documentInjectionSnippets.size > 0) {
    formattedFinalUserPrompt +=
      "This is a Enriched Context Generation scenario.\n\nThe following content was found in the files provided by the user.\n";

    for (const [fileHandle, snippet] of documentInjectionSnippets) {
      formattedFinalUserPrompt += `\n\n** ${fileHandle.name} full content **\n\n${snippet}\n\n** end of ${fileHandle.name} **\n\n`;
    }

    formattedFinalUserPrompt += `Based on the content above, please provide a response to the user query.\n\nUser query: ${input.getText()}`;
  }

  input.replaceText(formattedFinalUserPrompt);
  return input;
}

async function measureContextWindow(ctx: Chat, model: LLMDynamicHandle) {
  const currentContextFormatted = await model.applyPromptTemplate(ctx);
  const totalTokensInContext = await model.countTokens(currentContextFormatted);
  const modelContextLength = await model.getContextLength();
  const modelRemainingContextLength = modelContextLength - totalTokensInContext;
  const contextOccupiedPercent = (totalTokensInContext / modelContextLength) * 100;
  return {
    totalTokensInContext,
    modelContextLength,
    modelRemainingContextLength,
    contextOccupiedPercent,
  };
}

async function chooseContextInjectionStrategy(
  ctl: PromptPreprocessorController,
  originalUserPrompt: string,
  files: Array<FileHandle>,
): Promise<DocumentContextInjectionStrategy> {
  const status = ctl.createStatus({
    status: "loading",
    text: `Deciding how to handle the document(s)...`,
  });

  const model = await ctl.client.llm.model();
  const ctx = await ctl.pullHistory();

  // Measure the context window
  const {
    totalTokensInContext,
    modelContextLength,
    modelRemainingContextLength,
    contextOccupiedPercent,
  } = await measureContextWindow(ctx, model);

  ctl.debug(
    `Context measurement result:\n\n` +
      `\tTotal tokens in context: ${totalTokensInContext}\n` +
      `\tModel context length: ${modelContextLength}\n` +
      `\tModel remaining context length: ${modelRemainingContextLength}\n` +
      `\tContext occupied percent: ${contextOccupiedPercent.toFixed(2)}%\n`,
  );

  // Get token count of provided files
  let totalFileTokenCount = 0;
  let totalReadTime = 0;
  let totalTokenizeTime = 0;
  for (const file of files) {
    const startTime = performance.now();

    const loadingStatus = status.addSubStatus({
      status: "loading",
      text: `Loading parser for ${file.name}...`,
    });
    let actionProgressing = "Reading";
    let parserIndicator = "";

    const { content } = await ctl.client.files.parseDocument(file, {
      signal: ctl.abortSignal,
      onParserLoaded: parser => {
        loadingStatus.setState({
          status: "loading",
          text: `${parser.library} loaded for ${file.name}...`,
        });
        if (parser.library !== "builtIn") {
          actionProgressing = "Parsing";
          parserIndicator = ` with ${parser.library}`;
        }
      },
      onProgress: progress => {
        loadingStatus.setState({
          status: "loading",
          text: `${actionProgressing} file ${file.name}${parserIndicator}... (${(
            progress * 100
          ).toFixed(2)}%)`,
        });
      },
    });
    loadingStatus.remove();

    totalReadTime += performance.now() - startTime;

    // tokenize file content
    const startTokenizeTime = performance.now();
    totalFileTokenCount += await model.countTokens(content);
    totalTokenizeTime += performance.now() - startTokenizeTime;
    if (totalFileTokenCount > modelRemainingContextLength) {
      break;
    }
  }
  ctl.debug(`Total file read time: ${totalReadTime.toFixed(2)} ms`);
  ctl.debug(`Total tokenize time: ${totalTokenizeTime.toFixed(2)} ms`);

  // Calculate total token count of files + user prompt
  ctl.debug(`Original User Prompt: ${originalUserPrompt}`);
  const userPromptTokenCount = (await model.tokenize(originalUserPrompt)).length;
  const totalFilePlusPromptTokenCount = totalFileTokenCount + userPromptTokenCount;

  // Calculate the available context tokens
  const contextOccupiedFraction = contextOccupiedPercent / 100;
  const targetContextUsePercent = 0.7;
  const targetContextUsage = targetContextUsePercent * (1 - contextOccupiedFraction);
  const availableContextTokens = Math.floor(modelRemainingContextLength * targetContextUsage);

  // Debug log
  ctl.debug("Strategy Calculation:");
  ctl.debug(`\tTotal Tokens in All Files: ${totalFileTokenCount}`);
  ctl.debug(`\tTotal Tokens in User Prompt: ${userPromptTokenCount}`);
  ctl.debug(`\tModel Context Remaining: ${modelRemainingContextLength} tokens`);
  ctl.debug(`\tContext Occupied: ${contextOccupiedPercent.toFixed(2)}%`);
  ctl.debug(`\tAvailable Tokens: ${availableContextTokens}\n`);

  if (totalFilePlusPromptTokenCount > availableContextTokens) {
    const chosenStrategy = "retrieval";
    ctl.debug(
      `Chosen context injection strategy: '${chosenStrategy}'. Total file + prompt token count: ` +
        `${totalFilePlusPromptTokenCount} > ${
          targetContextUsage * 100
        }% * available context tokens: ${availableContextTokens}`,
    );
    status.setState({
      status: "done",
      text: `Chosen context injection strategy: '${chosenStrategy}'. Retrieval is optimal for the size of content provided`,
    });
    return chosenStrategy;
  }

  const chosenStrategy = "inject-full-content";
  status.setState({
    status: "done",
    text: `Chosen context injection strategy: '${chosenStrategy}'. All content can fit into the context`,
  });
  return chosenStrategy;
}