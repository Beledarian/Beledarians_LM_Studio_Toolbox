import type { LocaleDict } from "./types";

export const zhCN: LocaleDict = {
  config: {
    messageLanguage: {
      displayName: "消息语言",
      subtitle:
        "运行时消息、提示和提示词注入所使用的语言。更改立即生效，无需重启插件。",
    },
    uiLanguageOverride: {
      displayName: "界面语言（重启后生效）",
      subtitle:
        "在下次插件重启时强制使用指定语言，覆盖系统语言检测。设为 'auto' 则跟随操作系统语言。选项：auto、en、zh-CN、zh-TW、de。",
    },
    planMode: {
      displayName: "计划模式",
      subtitle:
        "控制模型在修改代码前是否先探索项目结构并提出计划。选项：'always'、'when_useful'、'never'。",
    },
    retrievalLimit: {
      displayName: "检索数量上限",
      subtitle: "触发检索时，最多返回的文本块数量。",
    },
    retrievalAffinityThreshold: {
      displayName: "检索相似度阈值",
      subtitle:
        "文本块被视为相关的最低相似度分数。中文内容建议调低至 0.35–0.45。",
    },
    allowJavascriptExecution: {
      displayName: "允许执行 JavaScript",
      subtitle:
        "启用 'run_javascript' 工具。⚠️ 危险：代码将在您的计算机上运行。",
    },
    allowPythonExecution: {
      displayName: "允许执行 Python",
      subtitle:
        "启用 'run_python' 工具。⚠️ 危险：代码将在您的计算机上运行。",
    },
    allowTerminalExecution: {
      displayName: "允许终端执行",
      subtitle:
        "启用 'run_in_terminal' 工具。将打开真实的终端窗口。",
    },
    allowShellCommandExecution: {
      displayName: "允许执行 Shell 命令",
      subtitle:
        "启用 'execute_command' 工具。⚠️ 危险：命令将在您的计算机上运行。",
    },
    allowBrowserControl: {
      displayName: "允许浏览器控制",
      subtitle:
        "启用浏览器自动化工具（'browser_open_page' 及浏览器会话工具）。⚠️ 危险：自动化操作将在您的计算机上运行。",
    },
    allowGitOperations: {
      displayName: "允许 Git 操作",
      subtitle:
        "启用原生 Git 工具（status、diff、show、commit、log、add、checkout、push）。",
    },
    allowGitHubTools: {
      displayName: "允许 GitHub CLI 工具",
      subtitle:
        "启用原生 GitHub CLI 工具（gh_auth、gh_create_issue、gh_create_pr 等）。需安装 'gh' 命令行工具。",
    },
    allowDatabaseInspection: {
      displayName: "允许数据库检查",
      subtitle: "启用 'query_database' 以查询 SQLite 文件。",
    },
    allowSystemNotifications: {
      displayName: "允许系统通知",
      subtitle: "允许智能体发送操作系统桌面通知。",
    },
    allowAllCode: {
      displayName: "允许所有代码执行",
      subtitle:
        "🔴 主开关：覆盖上述各项设置，一键启用所有代码/命令执行工具。",
    },
    protectedPaths: {
      displayName: "受保护路径",
      subtitle:
        "要禁止所有操作的盘符或路径列表（例如 D:\\、C:\\Windows）。每行一个。⚠️ Shell 命令无法通过路径匹配完全拦截——此功能作为防护屏障使用，而非安全边界。",
    },
    searchApiKey: {
      displayName: "搜索 API 密钥",
      subtitle:
        "搜索服务的可选 API 密钥（如支持），可避免速率限制。",
    },
    embeddingModel: {
      displayName: "嵌入模型",
      subtitle:
        "用于 RAG 功能的模型（默认：nomic-ai/nomic-embed-text-v1.5-GGUF）。中文内容推荐使用 BAAI/bge-m3-gguf。",
    },
    defaultWorkspacePath: {
      displayName: "默认工作区路径",
      subtitle:
        "可选的启动工作区路径。留空则使用系统内置默认目录。",
    },
    enableMemory: {
      displayName: "启用记忆功能",
      subtitle:
        "启用后，模型可从工作区的 'memory.md' 文件中保存和读取信息，实现长期记忆。",
    },
    enableWikipediaTool: {
      displayName: "启用维基百科搜索",
      subtitle: "启用 'wikipedia_search' 工具。",
    },
    enableLocalRag: {
      displayName: "启用本地 RAG",
      subtitle:
        "启用 'rag_local_files' 工具，可在工作区文件中进行语义搜索。",
    },
    enableSecondaryAgent: {
      displayName: "启用辅助智能体",
      subtitle:
        "允许主模型将复杂任务委托给辅助模型处理（例如代码编写、摘要总结等）。",
    },
    useMainModelForSubAgent: {
      displayName: "用主模型作为子智能体",
      subtitle:
        "启用后，子智能体将直接使用 LM Studio 当前加载的主模型（localhost:1234），忽略下方的\u201C端点\u201D和\u201C模型 ID\u201D设置。",
    },
    secondaryAgentEndpoint: {
      displayName: "辅助智能体 API 端点",
      subtitle:
        "辅助模型的 API 地址（例如 'http://localhost:1234/v1'）。",
    },
    secondaryModelId: {
      displayName: "辅助模型 ID",
      subtitle:
        "用于辅助智能体的模型标识符（须已加载/可用）。",
    },
    subAgentProfiles: {
      displayName: "子智能体配置文件（JSON）",
      subtitle:
        '定义可用的子智能体角色。格式：{"coder": "你是一位编程专家...", ...}',
    },
    subAgentFrequency: {
      displayName: "子智能体调用频率",
      subtitle:
        "控制模型在什么情况下建议委托任务给子智能体。选项：'always'（始终）、'when_useful'（需要时）、'hard_tasks'（仅复杂任务）、'never'（从不）。",
    },
    subAgentAllowFileSystem: {
      displayName: "子智能体：允许文件系统",
      subtitle: "启用后，子智能体可以读取和列出工作区文件。",
    },
    subAgentAllowWeb: {
      displayName: "子智能体：允许网络搜索",
      subtitle: "启用后，子智能体可以使用维基百科和 DuckDuckGo。",
    },
    subAgentAllowCode: {
      displayName: "子智能体：允许代码执行",
      subtitle:
        "启用后，子智能体可以运行 Python/JS 代码。⚠️ 危险！",
    },
    subAgentAllowBrowserControl: {
      displayName: "子智能体：允许浏览器控制",
      subtitle:
        "启用后，子智能体可使用浏览器自动化工具（需同时启用全局\u201C允许浏览器控制\u201D和\u201C子智能体：允许网络搜索\u201D）。",
    },
    subAgentTimeLimit: {
      displayName: "子智能体超时时间（秒）",
      subtitle:
        "子智能体任务强制终止前的最长运行时间。默认：600 秒（10 分钟）。",
    },
    enableDebugMode: {
      displayName: "启用自动调试模式",
      subtitle:
        "启用后，委托给子智能体的编程任务完成后会自动触发第二轮\u201C审查员\u201D检查，发现并修复潜在错误。",
    },
    enableSubAgentDebugLogging: {
      displayName: "启用子智能体调试日志",
      subtitle:
        "启用后，子智能体的工具调用解析详情将输出到控制台，用于排查问题。",
    },
    subAgentAutoSave: {
      displayName: "子智能体：自动保存代码",
      subtitle:
        "启用后，子智能体生成但未显式保存的代码块将自动写入文件。",
    },
    showFullCodeOutput: {
      displayName: "显示完整代码输出",
      subtitle:
        "启用后，主智能体在聊天中将展示生成文件的完整代码内容，而非仅显示文件路径。",
    },
  },

  runtime: {
    statusLoadingEmbeddingModel: "正在加载检索所需的嵌入模型...",
    statusRetrievingCitations: "正在检索与用户查询相关的引用...",
    statusRetrievedCitations: (count) =>
      `已为用户查询检索到 ${count} 条相关引用`,
    statusNoRelevantCitations: "未找到与用户查询相关的引用",
    statusDecidingStrategy: "正在决定文档处理策略...",
    statusLoadingParser: (fileName) => `正在为 ${fileName} 加载解析器...`,
    statusStrategyChosen: (strategy, detail) =>
      `已选择上下文注入策略：'${strategy}'。${detail}`,
    citationPrefix: "在用户提供的文件中找到以下引用内容：\n\n",
    citationEntry: (num, text) => `引用 ${num}："${text}"\n\n`,
    citationSuffix: (userQuery) =>
      "请根据上述引用内容回答用户问题（仅在相关时使用），否则请尽力独立作答。" +
      `\n\n用户问题：\n\n${userQuery}`,
    noRelevantCitationsNote:
      "重要提示：在用户提供的文件中未找到与查询相关的引用。请用一句话告知用户此情况，然后尽力回答该问题。",
    documentInjectionHeader:
      "这是一个增强上下文生成场景。\n\n以下内容来自用户提供的文件。\n",
    documentInjectionFileBlock: (fileName, content) =>
      `\n\n** ${fileName} 完整内容 **\n\n${content}\n\n** ${fileName} 结束 **\n\n`,
    documentInjectionSuffix: (userQuery) =>
      `请基于以上内容回答用户问题。\n\n用户问题：${userQuery}`,
    delegationHintAlways:
      "\n\n**系统要求：** 您必须将所有信息检索、新闻摘要及**所有编程任务**（创建、编辑、重构）委托给辅助智能体。请勿自行编写代码或使用搜索工具。使用 `consult_secondary_agent`（设置 `allow_tools: true`）。\n\n**委托前检查清单：**\n1. 运行 `list_directory` 查看现有文件。\n2. 阅读 `beledarian_info.md` 或 `README.md`（如存在）。\n3. 携带上下文调用 `consult_secondary_agent`。",
    delegationHintWhenUseful:
      "\n\n**系统建议：** 对于复杂任务（例如\u201C创建一个应用\u201D、\u201C重构这个模块\u201D、\u201C研究并总结\u201D），您**必须**使用 `consult_secondary_agent`（设置 `allow_tools: true`）委托给辅助智能体。\n\n**为什么要委托？**\n- 子智能体有专门的编程和调试循环。\n- 它会自动保存所有文件，您无需手动保存。\n\n**如何委托：**\n1. 收集上下文（`list_directory`、`read_file`）。\n2. 携带明确的任务描述和收集到的上下文，调用 `consult_secondary_agent`。\n",
    delegationHintWhenUsefulDebug:
      "注意：「自动调试」已开启。子智能体将验证并修复自身代码，这是生成代码最安全的方式。\n",
    delegationHintHardTasks:
      "\n\n**委托提示：** 仅将极其复杂或计算量大的任务委托给辅助智能体。常规查询和文件读取请自行处理。\n",
    planHintAlways:
      "\n\n**计划模式 [已开启]：** 在进行任何文件更改或实现功能之前，您必须：\n1. **探索：** 使用 `list_directory`、`read_file` 及其他探索工具了解代码库结构和上下文。\n2. **提案：** 提出清晰的分步计划，说明您要做什么以及为什么这样做。\n3. **等待：** 在用户批准计划或明确允许继续之前，不得开始实施。\n\n**例外：** 简单对话、澄清问题或微不足道的单行编辑无需计划。",
    planHintWhenUseful:
      "\n\n**计划模式 [按需]：** 对于较大、复杂或含糊的请求：\n1. **先探索：** 使用 `list_directory`、`read_file` 在更改之前理解代码库。\n2. **提出计划：** 在实施前先概述您的方法和关键步骤。\n3. **简单任务跳过：** 普通对话或小型编辑（如修正拼写、修改单个函数）无需计划。",
  },
};
