# Beledarian's LM Studio Tools

[English](README.md) | [Deutsch](README.de.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md)

[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/Beledarian/Beledarians_LM_Studio_Toolbox)

本項目是 [LM Studio](https://lmstudio.ai/) 的一個插件，為大語言模型（LLM）提供了一系列豐富的工具。它作為 LLM 與您本地環境之間的橋梁，支持自主編程、研究和文件管理。

> [!IMPORTANT]
> **LM Studio 不支持自動更新。** 如果您遇到問題，請嘗試先手動更新：刪除當前版本並從 [插件網站](https://lmstudio.ai/beledarian/beledarians-lm-studio-tools) 重新下載。即使您的版本已過時，LM Studio 也可能會顯示「已安裝」提示。

## 核心功能

### 強大的文件系統管理

-   **全面控制**：創建、讀取、更新、刪除、移動和複製文件。
-   **安全保障**：所有操作都嚴格限制在您的工作區目錄內，防止路徑穿越攻擊。
-   **智能更新**：使用 `replace_text_in_file` 進行精確編輯，無需重寫整個大文件。
-   **批量處理**：`save_file` 支持一次性創建多個文件。
-   **清理工具**：使用 `delete_files_by_pattern` 立即清除臨時文件。

> **遇到問題了？** 歡迎在 [GitHub 上提交 Issue](https://github.com/Beledarian/Beledarians_LM_Studio_Toolbox/issues)。
>
> **覺得這個項目有幫助？** 請考慮在 [GitHub 上點個 ⭐](https://github.com/Beledarian/Beledarians_LM_Studio_Toolbox) 或 [參與貢獻！](https://github.com/Beledarian/Beledarians_LM_Studio_Toolbox/tree/main?tab=contributing-ov-file) 感謝您使用本工具箱。


### 最近更新 (v1.3.1)

- **🌍 全面國際化 (i18n)**：為介面和運行時提供完整的 **中文（繁體/簡體）**、**英語** 和 **德語** 支持。
- **🌐 雙層翻譯機制**：同時支持「配置介面」（靜態）和運行時的動態語言。
- **🔄 介面語言覆蓋**：新增手動強制介面語言的選項，方便在下次插件重啟時測試特定語言。

<details>
<summary><strong>歷史更新 (v1.3.0 及更早版本)</strong></summary>

### v1.3.0

- **🐙 原生 GitHub CLI 工具**：新增 `gh_auth`, `gh_create_issue`, `gh_list_issues`, `gh_view_comments`, `gh_create_pr`, `gh_list_prs`, `gh_view_pr_diff` 和 `gh_push` 工具，支持安全且結構化的 GitHub 交互。
- **🌿 增強型 Git 工作流**：新增 `git_add` 和 `git_checkout` 工具，完善原生 Git 工具鏈（status, diff, log, commit, add, checkout）。
- **⚙️ 側邊欄新開關**：可在設置中獨立啟用/禁用 GitHub CLI 工具。
- **🛡️ 依賴項保護**：所有 CLI 工具在執行前都會驗證是否已安裝相應軟體。

### v1.2.0

- **🛡️ 子智能體工具驗證**：新增參數預驗證和清晰的錯誤提示，防止路徑越界或參數名錯誤導致的靜默失敗。
- **🧪 回歸測試**：為工具驗證邏輯新增 14 項測試（總計 51 項）。
- **💬 更好的錯誤反饋**：子智能體會收到更具指導性的錯誤信息。

### v1.1.1 (2026-04-08)
**瀏覽器可靠性與導航上下文**

- **修復**：當 Puppeteer 無法直接點擊元素時，瀏覽器操作將嘗試基於 DOM 的回退方案。
- **改進**：點擊操作在回退前會進行約 300ms 的重試。
- **新增**：`browser_session_open` 默認返回完整頁面文本。

### v1.1.0 (2026-04-08)
**子智能體兼容性提升**

- **修復**：支持 Gemma 4 等模型使用的特定工具調用格式。
- **新增**：高級瀏覽器導航（打開、控制、關閉）及頁內模糊查找。
- **新增**：支持結構化的 `handoff_message` 用於任務移交。

</details>


### 自主智能體

-   **子智能體**：將複雜任務（編碼、總結）委派給第二個本地模型/服務器。支持直接使用 LM Studio 當前已加載的主模型！
-   **自動保存**：當子智能體生成代碼時，系統會 **自動識別並保存** 到磁盤。告別複製貼上！
-   **自動偵錯**：(可選) 觸發「評審」智能體分析生成的代碼並自動修復錯誤。
-   **結構化移交**：子智能體可以返回專用的 `handoff_message`，以便主智能體轉達研究發現。
-   **項目上下文**：智能體可以讀取 `beledarian_info.md` 以了解項目的歷史背景。

### 代碼執行

-   **沙盒環境**：安全運行 JavaScript (Deno) 和 Python 代碼。
-   **終端交互**：執行 Shell 命令或打開真實的終端窗口進行交互式任務。

> [!WARNING]
> 啟用 Shell 或終端執行將允許模型在您的系統上運行任意命令。這可能導致模型脫離沙盒環境並操作工作區以外的文件。

### 網絡與 RAG

-   **信息研究**：搜索 DuckDuckGo、維基百科或獲取網頁原始內容。
-   **高級瀏覽器導航**：持久化的 `browser_session` 流程，支持多步自動化瀏覽。
-   **網頁 RAG**：直接與網頁內容對話。
-   **本地 RAG**：對您的工作區文件進行語義搜索 (`rag_local_files`)。

## 要求

- [Node.js](https://nodejs.org/) (v18+)
- [LM Studio](https://lmstudio.ai/) (v0.3.0+)

> **💡 提示**：需要為您的智能體提供持久的長期記憶？
> 歡迎關注我的另一個項目：**[Local Memory MCP](https://github.com/Beledarian/mcp-local-memory)** —— 一個支持知識圖譜的隱私優先記憶服務器。

## 安裝方式

您可以通過以下鏈接安裝插件：

[https://lmstudio.ai/beledarian/beledarians-lm-studio-tools](https://lmstudio.ai/beledarian/beledarians-lm-studio-tools)

或者，您也可以手動安裝用於開發：

### 開發指南

如果您想參與本插件的開發，請參考以下步驟：

1. **克隆倉庫**：

    ```bash
    git clone https://github.com/Beledarian/Beledarians_LM_Studio_Toolbox.git
    cd Beledarians_LM_Studio_Toolbox
    ```

2. **安裝依賴**：

    ```bash
    npm install
    ```

3. **運行開發模式**：
    在項目目錄下執行：

    ```bash
    lms dev
    ```

    這將以開發模式啟動插件。LM Studio 會自動識別並加載。您對源碼的任何修改都會觸發插件自動重載。

## 配置選項

在 LM Studio 的 「Plugins」 選項卡中可以找到這些設置：

- **Enable Secondary Agent**：開啟子智能體功能。
- **Sub-Agent Profiles**：為「程序員」、「評審員」等定義自定義 Prompt。
- **Auto-Debug Mode**：自動評審子智能體代碼。
- **Sub-Agent Debug Logging**：開啟詳細的解析日誌用於排障。
- **Sub-Agent Auto-Save**：切換自動文件保存（默認：開啟）。
- **Show Full Code Output**：控制是否在聊天中顯示完整代碼或為簡潔起見隱藏。
- **Default Workspace Path**：設置插件啟動時的默認工作目錄。
- **安全設置**：啟用/禁用 Python/JS/Shell 的代碼執行。
- **瀏覽器安全**：子智能體瀏覽器自動化需要同時開啟三個相關開關。

## 可用工具

### 文件系統

- `list_directory`, `change_directory`, `make_directory`
- `read_file`, `save_file` (支持批量), `delete_path`
- `replace_text_in_file`：精確編輯。
- `delete_files_by_pattern`：基於正則的清理。
- `move_file`, `copy_file`, `find_files`, `get_file_metadata`
- `fuzzy_find_local_files`：基於編輯距离的模糊文件搜索。

### 智能體

- `consult_secondary_agent`：核心工具。負責任務委派、文件創建和子智能體循環管理。

### 網絡

- `web_search` (DuckDuckGo + HTML 獲取), `wikipedia_search`
- `fetch_web_content`, `rag_web_content`
- `browser_session_open`, `browser_session_control`, `browser_session_close`：持久化瀏覽器自動化。
- `browser_open_page`：單次 Puppeteer 頁面讀取。

### 執行

- `run_javascript`, `run_python`
- `execute_command` (後台), `run_in_terminal` (交互式)

### 工具類

- `rag_local_files`：搜索您的代碼。
- `save_memory`：長期記憶。
- `get_system_info`, `read_clipboard`, `write_clipboard`

## 開發者指南

架構詳情請參閱 [CODE_OVERVIEW.md](https://github.com/Beledarian/Beledarians_LM_Studio_Toolbox/blob/main/CODE_OVERVIEW.md)。
