import type { LocaleDict } from "./types";

export const zhCN: LocaleDict = {
  config: {
    messageLanguage: {
      displayName: "消息语言",
      subtitle: "运行时消息、提示和提示词注入所使用的语言。更改立即生效，无需重启插件。",
    },
    uiLanguageOverride: {
      displayName: "界面语言覆盖（下次重启生效）",
      subtitle: "在下次插件重启时强制使用指定区域设置，覆盖操作系统检测。设置为 'auto' 则使用操作系统语言。选项：auto、en、zh-CN、zh-TW、de。",
    },
    planMode: {
      displayName: "计划模式",
      subtitle: "控制模型在进行更改之前是否探索并提出计划。选项：'always'、'when_useful'、'never'。",
    },
    retrievalLimit: {
      displayName: "检索上限",
      subtitle: "触发检索时，最多返回的文本块数量。",
    },
    retrievalAffinityThreshold: {
      displayName: "检索相关性阈值",
      subtitle: "文本块被视为相关所需的最低相似度分数。中文内容建议调低至 0.35–0.45。",
    },
    allowJavascriptExecution: {
      displayName: "允许执行 JavaScript",
      subtitle: "启用 'run_javascript' 工具。危险：代码将在您的计算机上运行。",
    },
    allowPythonExecution: {
      displayName: "允许执行 Python",
      subtitle: "启用 'run_python' 工具。危险：代码将在您的计算机上运行。",
    },
    allowTerminalExecution: {
      displayName: "允许终端执行",
      subtitle: "启用 'run_in_terminal' 工具。将打开真实的终端窗口。",
    },
    allowShellCommandExecution: {
      displayName: "允许执行 Shell 命令",
      subtitle: "启用 'execute_command' 工具。危险：命令将在您的计算机上运行。",
    },
    allowBrowserControl: {
      displayName: "允许浏览器控制",
      subtitle: "启用浏览器自动化工具。危险：自动化操作将在您的计算机上运行。",
    },
    allowGitOperations: {
      displayName: "允许 Git 操作",
      subtitle: "启用原生 Git 工具（status、diff、show、commit、log、add、checkout、push）。",
    },
    allowGitHubTools: {
      displayName: "允许 GitHub CLI 工具",
      subtitle: "启用原生 GitHub CLI 工具。需安装 'gh'。",
    },
    allowDatabaseInspection: {
      displayName: "允许数据库检查",
      subtitle: "启用 'query_database' 以查询 SQLite 文件。",
    },
    allowSystemNotifications: {
      displayName: "允许系统通知",
      subtitle: "允许智能体发送操作系统通知。",
    },
    allowAllCode: {
      displayName: "允许所有代码执行",
      subtitle: "主开关：覆盖所有其他设置，启用全部执行工具。",
    },
    searchApiKey: {
      displayName: "搜索 API 密钥",
      subtitle: "搜索服务的可选 API 密钥，可避免速率限制。",
    },
    embeddingModel: {
      displayName: "嵌入模型",
      subtitle: "用于 RAG 功能的模型（默认：nomic-ai/nomic-embed-text-v1.5-GGUF）。中文内容推荐使用 BAAI/bge-m3-gguf。",
    },
    defaultWorkspacePath: {
      displayName: "默认工作区路径",
      subtitle: "可选的启动工作区路径。留空则使用内置默认目录。",
    },
    enableMemory: {
      displayName: "启用记忆",
      subtitle: "启用后，模型可从工作区的 'memory.md' 文件中保存和调取信息。",
    },
    enableWikipediaTool: {
      displayName: "启用维基百科工具",
      subtitle: "启用 'wikipedia_search' 工具。",
    },
    enableLocalRag: {
      displayName: "启用本地 RAG",
      subtitle: "启用 'rag_local_files' 工具以搜索工作区文件。",
    },
    enableSecondaryAgent: {
      displayName: "启用辅助智能体/模型",
      subtitle: "允许主模型将任务委托给辅助模型（例如用于摘要）。",
    },
    useMainModelForSubAgent: {
      displayName: "使用主模型作为子智能体",
      subtitle: "启用后，子智能体循环将使用主 LM Studio 服务器（localhost:1234），忽略\"端点\"设置。",
    },
    secondaryAgentEndpoint: {
      displayName: "辅助智能体端点",
      subtitle: "辅助模型的 API 端点（例如 'http://localhost:1234/v1'）。",
    },
    secondaryModelId: {
      displayName: "辅助模型 ID",
      subtitle: "用于辅助智能体的模型 ID（必须已加载/可用）。",
    },
    subAgentProfiles: {
      displayName: "子智能体配置文件（JSON）",
      subtitle: '定义可用的子智能体。格式：{"coder": "你是一位编程专家...", ...}',
    },
    subAgentFrequency: {
      displayName: "子智能体调用频率",
      subtitle: "控制委托频率。选项：'always'、'when_useful'、'hard_tasks'、'never'。",
    },
    subAgentAllowFileSystem: {
      displayName: "子智能体：允许文件系统",
      subtitle: "启用后，子智能体可以读取和列出文件。",
    },
    subAgentAllowWeb: {
      displayName: "子智能体：允许网络搜索",
      subtitle: "启用后，子智能体可以使用维基百科和 DuckDuckGo。",
    },
    subAgentAllowCode: {
      displayName: "子智能体：允许代码执行",
      subtitle: "启用后，子智能体可以运行 Python/JS 代码。危险！",
    },
    subAgentAllowBrowserControl: {
      displayName: "子智能体：允许浏览器控制",
      subtitle: "启用后，子智能体可以使用浏览器自动化工具（需启用全局\"允许浏览器控制\"）。",
    },
    subAgentTimeLimit: {
      displayName: "子智能体时间限制（秒）",
      subtitle: "子智能体任务强制终止前的最长时间。默认：600 秒（10 分钟）。",
    },
    enableDebugMode: {
      displayName: "启用自动调试模式",
      subtitle: "启用后，委托给子智能体的编程任务将自动触发\"审查员\"二次检查。",
    },
    enableSubAgentDebugLogging: {
      displayName: "启用子智能体调试日志",
      subtitle: "启用后，将子智能体工具调用解析详情记录到控制台。",
    },
    subAgentAutoSave: {
      displayName: "子智能体：自动保存代码",
      subtitle: "启用后，子智能体生成但未明确保存的代码块将自动保存到文件。",
    },
    showFullCodeOutput: {
      displayName: "显示完整代码输出",
      subtitle: "启用后，主智能体将显示生成文件的完整代码，而非仅显示文件路径。",
    },
  },

  runtime: {
    statusLoadingEmbeddingModel: "正在加载检索用嵌入模型...",
    statusRetrievingCitations: "正在检索用户查询的相关引用...",
    statusRetrievedCitations: (count) => `已为用户查询检索到 ${count} 条相关引用`,
    statusNoRelevantCitations: "未找到与用户查询相关的引用",
    statusDecidingStrategy: "正在决定文档处理方式...",
    statusLoadingParser: (fileName) => `正在加载 ${fileName} 的解析器...`,
    statusStrategyChosen: (strategy, detail) => `已选择上下文注入策略：'${strategy}'。${detail}`,
    citationPrefix: "以下引用内容来自用户提供的文件：\n\n",
    citationEntry: (num, text) => `引用 ${num}："${text}"\n\n`,
    citationSuffix: (userQuery) =>
      "请根据上述引用内容回答用户的问题（仅在相关时使用），否则请尽力独立作答。" +
      `\n\n用户问题：\n\n${userQuery}`,
    noRelevantCitationsNote:
      "重要提示：在用户文件中未找到与查询相关的引用。请用一句话告知用户，然后尽力作答。",
    documentInjectionHeader:
      "这是一个增强上下文生成场景。\n\n以下内容来自用户提供的文件。\n",
    documentInjectionFileBlock: (fileName, content) =>
      `\n\n** ${fileName} 完整内容 **\n\n${content}\n\n** ${fileName} 结束 **\n\n`,
    documentInjectionSuffix: (userQuery) =>
      `请根据以上内容回答用户的问题。\n\n用户问题：${userQuery}`,
    delegationHintAlways:
      "\n\n**系统指令：** 您必须将所有信息检索、新闻摘要及**所有编程任务**委托给辅助智能体。请勿自行编写代码。使用 `consult_secondary_agent`（设置 `allow_tools: true`）。\n\n**委托前检查：**\n1. 运行 `list_directory` 查看现有文件。\n2. 阅读 `beledarian_info.md` 或 `README.md`（如存在）。\n3. 携带上下文调用 `consult_secondary_agent`。",
    delegationHintWhenUseful:
      "\n\n**系统建议：** 对于复杂任务，请使用 `consult_secondary_agent`（`allow_tools: true`）委托给辅助智能体。\n\n**如何委托：**\n1. 收集上下文（`list_directory`、`read_file`）。\n2. 携带明确任务描述调用 `consult_secondary_agent`。\n",
    delegationHintWhenUsefulDebug:
      "注意：'自动调试' 已激活。子智能体将验证并修复自身代码。\n",
    delegationHintHardTasks:
      "\n\n**委托提示：** 仅将极其复杂的任务委托给辅助智能体。标准查询请自行处理。\n",
    planHintAlways:
      "\n\n**计划模式 [已激活]：** 在进行任何更改之前，您必须：\n1. **探索：** 使用 `list_directory`、`read_file` 了解代码库。\n2. **提案：** 清晰列出分步计划。\n3. **等待：** 用户批准后再实施。\n\n**例外：** 简单对话或微小编辑无需计划。",
    planHintWhenUseful:
      "\n\n**计划模式 [有需要时]：** 对于复杂请求：\n1. **先行探索** 代码库。\n2. **提出计划** 再实施。\n3. **简单任务跳过。**",
  },
};
