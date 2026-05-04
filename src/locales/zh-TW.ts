import type { LocaleDict } from "./types";

export const zhTW: LocaleDict = {
  config: {
    messageLanguage: {
      displayName: "訊息語言",
      subtitle: "執行時訊息、提示及提示詞注入所使用的語言。變更立即生效，無需重新啟動插件。",
    },
    planMode: {
      displayName: "計劃模式",
      subtitle: "控制模型在進行變更之前是否探索並提出計劃。選項：'always'、'when_useful'、'never'。",
    },
    retrievalLimit: {
      displayName: "擷取上限",
      subtitle: "觸發擷取時，最多返回的文字區塊數量。",
    },
    retrievalAffinityThreshold: {
      displayName: "擷取相關性閾值",
      subtitle: "文字區塊被視為相關所需的最低相似度分數。中文內容建議調低至 0.35–0.45。",
    },
    allowJavascriptExecution: {
      displayName: "允許執行 JavaScript",
      subtitle: "啟用 'run_javascript' 工具。危險：程式碼將在您的電腦上執行。",
    },
    allowPythonExecution: {
      displayName: "允許執行 Python",
      subtitle: "啟用 'run_python' 工具。危險：程式碼將在您的電腦上執行。",
    },
    allowTerminalExecution: {
      displayName: "允許終端機執行",
      subtitle: "啟用 'run_in_terminal' 工具。將開啟真實的終端機視窗。",
    },
    allowShellCommandExecution: {
      displayName: "允許執行 Shell 指令",
      subtitle: "啟用 'execute_command' 工具。危險：指令將在您的電腦上執行。",
    },
    allowBrowserControl: {
      displayName: "允許瀏覽器控制",
      subtitle: "啟用瀏覽器自動化工具。危險：自動化操作將在您的電腦上執行。",
    },
    allowGitOperations: {
      displayName: "允許 Git 操作",
      subtitle: "啟用原生 Git 工具（status、diff、show、commit、log、add、checkout、push）。",
    },
    allowGitHubTools: {
      displayName: "允許 GitHub CLI 工具",
      subtitle: "啟用原生 GitHub CLI 工具。需安裝 'gh'。",
    },
    allowDatabaseInspection: {
      displayName: "允許資料庫檢查",
      subtitle: "啟用 'query_database' 以查詢 SQLite 檔案。",
    },
    allowSystemNotifications: {
      displayName: "允許系統通知",
      subtitle: "允許智能體傳送作業系統通知。",
    },
    allowAllCode: {
      displayName: "允許所有程式碼執行",
      subtitle: "主開關：覆蓋所有其他設定，啟用全部執行工具。",
    },
    searchApiKey: {
      displayName: "搜尋 API 金鑰",
      subtitle: "搜尋服務的選用 API 金鑰，可避免速率限制。",
    },
    embeddingModel: {
      displayName: "嵌入模型",
      subtitle: "用於 RAG 功能的模型（預設：nomic-ai/nomic-embed-text-v1.5-GGUF）。中文內容推薦使用 BAAI/bge-m3-gguf。",
    },
    defaultWorkspacePath: {
      displayName: "預設工作區路徑",
      subtitle: "選用的啟動工作區路徑。留空則使用內建預設目錄。",
    },
    enableMemory: {
      displayName: "啟用記憶",
      subtitle: "啟用後，模型可從工作區的 'memory.md' 檔案中儲存和讀取資訊。",
    },
    enableWikipediaTool: {
      displayName: "啟用維基百科工具",
      subtitle: "啟用 'wikipedia_search' 工具。",
    },
    enableLocalRag: {
      displayName: "啟用本地 RAG",
      subtitle: "啟用 'rag_local_files' 工具以搜尋工作區檔案。",
    },
    enableSecondaryAgent: {
      displayName: "啟用輔助智能體/模型",
      subtitle: "允許主模型將任務委派給輔助模型（例如用於摘要）。",
    },
    useMainModelForSubAgent: {
      displayName: "使用主模型作為子智能體",
      subtitle: "啟用後，子智能體迴圈將使用主 LM Studio 伺服器（localhost:1234），忽略「端點」設定。",
    },
    secondaryAgentEndpoint: {
      displayName: "輔助智能體端點",
      subtitle: "輔助模型的 API 端點（例如 'http://localhost:1234/v1'）。",
    },
    secondaryModelId: {
      displayName: "輔助模型 ID",
      subtitle: "用於輔助智能體的模型 ID（必須已載入/可用）。",
    },
    subAgentProfiles: {
      displayName: "子智能體設定檔（JSON）",
      subtitle: '定義可用的子智能體。格式：{"coder": "你是一位程式設計專家...", ...}',
    },
    subAgentFrequency: {
      displayName: "子智能體呼叫頻率",
      subtitle: "控制委派頻率。選項：'always'、'when_useful'、'hard_tasks'、'never'。",
    },
    subAgentAllowFileSystem: {
      displayName: "子智能體：允許檔案系統",
      subtitle: "啟用後，子智能體可以讀取和列出檔案。",
    },
    subAgentAllowWeb: {
      displayName: "子智能體：允許網路搜尋",
      subtitle: "啟用後，子智能體可以使用維基百科和 DuckDuckGo。",
    },
    subAgentAllowCode: {
      displayName: "子智能體：允許程式碼執行",
      subtitle: "啟用後，子智能體可以執行 Python/JS 程式碼。危險！",
    },
    subAgentAllowBrowserControl: {
      displayName: "子智能體：允許瀏覽器控制",
      subtitle: "啟用後，子智能體可以使用瀏覽器自動化工具（需啟用全域「允許瀏覽器控制」）。",
    },
    subAgentTimeLimit: {
      displayName: "子智能體時間限制（秒）",
      subtitle: "子智能體任務強制終止前的最長時間。預設：600 秒（10 分鐘）。",
    },
    enableDebugMode: {
      displayName: "啟用自動偵錯模式",
      subtitle: "啟用後，委派給子智能體的程式設計任務將自動觸發「審查員」二次檢查。",
    },
    enableSubAgentDebugLogging: {
      displayName: "啟用子智能體偵錯記錄",
      subtitle: "啟用後，將子智能體工具呼叫解析詳情記錄至主控台。",
    },
    subAgentAutoSave: {
      displayName: "子智能體：自動儲存程式碼",
      subtitle: "啟用後，子智能體生成但未明確儲存的程式碼區塊將自動儲存至檔案。",
    },
    showFullCodeOutput: {
      displayName: "顯示完整程式碼輸出",
      subtitle: "啟用後，主智能體將顯示生成檔案的完整程式碼，而非僅顯示檔案路徑。",
    },
  },

  runtime: {
    statusLoadingEmbeddingModel: "正在載入擷取用嵌入模型...",
    statusRetrievingCitations: "正在擷取使用者查詢的相關引用...",
    statusRetrievedCitations: (count) => `已為使用者查詢擷取到 ${count} 條相關引用`,
    statusNoRelevantCitations: "未找到與使用者查詢相關的引用",
    statusDecidingStrategy: "正在決定文件處理方式...",
    statusLoadingParser: (fileName) => `正在載入 ${fileName} 的解析器...`,
    statusStrategyChosen: (strategy, detail) => `已選擇上下文注入策略：'${strategy}'。${detail}`,
    citationPrefix: "以下引用內容來自使用者提供的檔案：\n\n",
    citationEntry: (num, text) => `引用 ${num}：「${text}」\n\n`,
    citationSuffix: (userQuery) =>
      "請根據上述引用內容回答使用者的問題（僅在相關時使用），否則請盡力獨立作答。" +
      `\n\n使用者問題：\n\n${userQuery}`,
    noRelevantCitationsNote:
      "重要提示：在使用者檔案中未找到與查詢相關的引用。請用一句話告知使用者，然後盡力作答。",
    documentInjectionHeader:
      "這是一個增強上下文生成場景。\n\n以下內容來自使用者提供的檔案。\n",
    documentInjectionFileBlock: (fileName, content) =>
      `\n\n** ${fileName} 完整內容 **\n\n${content}\n\n** ${fileName} 結束 **\n\n`,
    documentInjectionSuffix: (userQuery) =>
      `請根據以上內容回答使用者的問題。\n\n使用者問題：${userQuery}`,
    delegationHintAlways:
      "\n\n**系統指令：** 您必須將所有資訊擷取、新聞摘要及**所有程式設計任務**委派給輔助智能體。請勿自行撰寫程式碼。使用 `consult_secondary_agent`（設定 `allow_tools: true`）。\n\n**委派前檢查：**\n1. 執行 `list_directory` 查看現有檔案。\n2. 閱讀 `beledarian_info.md` 或 `README.md`（如存在）。\n3. 攜帶上下文呼叫 `consult_secondary_agent`。",
    delegationHintWhenUseful:
      "\n\n**系統建議：** 對於複雜任務，請使用 `consult_secondary_agent`（`allow_tools: true`）委派給輔助智能體。\n\n**如何委派：**\n1. 收集上下文（`list_directory`、`read_file`）。\n2. 攜帶明確任務描述呼叫 `consult_secondary_agent`。\n",
    delegationHintWhenUsefulDebug:
      "注意：「自動偵錯」已啟動。子智能體將驗證並修復自身程式碼。\n",
    delegationHintHardTasks:
      "\n\n**委派提示：** 僅將極其複雜的任務委派給輔助智能體。標準查詢請自行處理。\n",
    planHintAlways:
      "\n\n**計劃模式 [已啟動]：** 在進行任何變更之前，您必須：\n1. **探索：** 使用 `list_directory`、`read_file` 了解程式碼庫。\n2. **提案：** 清晰列出分步計劃。\n3. **等待：** 使用者批准後再實施。\n\n**例外：** 簡單對話或微小編輯無需計劃。",
    planHintWhenUseful:
      "\n\n**計劃模式 [有需要時]：** 對於複雜請求：\n1. **先行探索** 程式碼庫。\n2. **提出計劃** 再實施。\n3. **簡單任務跳過。**",
  },
};
