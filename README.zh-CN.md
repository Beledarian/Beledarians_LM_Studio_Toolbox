# Beledarian's LM Studio Tools

[English](README.md) | [Deutsch](README.de.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md)

[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/Beledarian/Beledarians_LM_Studio_Toolbox)

本项目是 [LM Studio](https://lmstudio.ai/) 的一个插件，为大语言模型（LLM）提供了一系列丰富的工具。它作为 LLM 与您本地环境之间的桥梁，支持自主编程、研究和文件管理。

> [!IMPORTANT]
> **LM Studio 不支持自动更新。** 如果您遇到问题，请尝试先手动更新：删除当前版本并从 [插件网站](https://lmstudio.ai/beledarian/beledarians-lm-studio-tools) 重新下载。即使您的版本已过时，LM Studio 也可能会显示“已安装”提示。

## 核心功能

### 卓越的文件系统管理

-   **全面控制**：创建、读取、更新、删除、移动和复制文件。
-   **安全保障**：所有操作都严格限制在您的工作区目录内，防止路径穿越攻击。
-   **智能更新**：使用 `replace_text_in_file` 进行精确编辑，无需重写整个大文件。
-   **批量处理**：`save_file` 支持一次性创建多个文件。
-   **清理工具**：使用 `delete_files_by_pattern` 立即清除临时文件。

> **遇到问题了？** 欢迎在 [GitHub 上提交 Issue](https://github.com/Beledarian/Beledarians_LM_Studio_Toolbox/issues)。
>
> **觉得这个项目有帮助？** 请考虑在 [GitHub 上点个 ⭐](https://github.com/Beledarian/Beledarians_LM_Studio_Toolbox) 或 [参与贡献！](https://github.com/Beledarian/Beledarians_LM_Studio_Toolbox/tree/main?tab=contributing-ov-file) 感谢您使用本工具箱。


### 最近更新 (v1.3.1)

- **🌍 全面国际化 (i18n)**：为界面和运行时提供完整的 **中文（简体/繁体）**、**英语** 和 **德语** 支持。
- **🌐 双层翻译机制**：同时支持“配置界面”（静态）和“智能体消息”（动态运行时）语言。
- **🔄 界面语言覆盖**：新增手动强制界面语言的选项，方便在下次插件重启时测试特定语言。

<details>
<summary><strong>历史更新 (v1.3.0 及更早版本)</strong></summary>

### v1.3.0

- **🐙 原生 GitHub CLI 工具**：新增 `gh_auth`, `gh_create_issue`, `gh_list_issues`, `gh_view_comments`, `gh_create_pr`, `gh_list_prs`, `gh_view_pr_diff` 和 `gh_push` 工具，支持安全且结构化的 GitHub 交互。
- **🌿 增强型 Git 工作流**：新增 `git_add` 和 `git_checkout` 工具，完善原生 Git 工具链（status, diff, log, commit, add, checkout）。
- **⚙️ 侧边栏新开关**：可在设置中独立启用/禁用 GitHub CLI 工具。
- **🛡️ 依赖项保护**：所有 CLI 工具在执行前都会验证是否已安装相应软件。

### v1.2.0

- **🛡️ 子智能体工具验证**：新增参数预验证和清晰的错误提示，防止路径越界或参数名错误导致的静默失败。
- **🧪 回归测试**：为工具验证逻辑新增 14 项测试（总计 51 项）。
- **💬 更好的错误反馈**：子智能体会收到更具指导性的错误信息。

### v1.1.1 (2026-04-08)
**浏览器可靠性与导航上下文**

- **修复**：当 Puppeteer 无法直接点击元素时，浏览器操作将尝试 DOM 级别回退。
- **改进**：点击操作在回退前会进行约 300ms 的重试。
- **新增**：`browser_session_open` 默认返回完整页面文本。

### v1.1.0 (2026-04-08)
**子智能体兼容性提升**

- **修复**：支持 Gemma 4 等模型使用的特定工具调用格式。
- **新增**：高级浏览器导航（打开、控制、关闭）及页内模糊查找。
- **新增**：支持结构化的 `handoff_message` 用于任务移交。

</details>


### 自主智能体

-   **次级智能体**：将复杂任务（编码、总结）委派给第二个本地模型/服务器。支持直接使用 LM Studio 当前已加载的主模型！
-   **自动保存**：当子智能体生成代码时，系统会 **自动识别并保存** 到磁盘。告别复制粘贴！
-   **自动调试**：(可选) 触发“评审”智能体分析生成的代码并自动修复错误。
-   **结构化移交**：子智能体可以返回专用的 `handoff_message`，以便主智能体转达研究发现。
-   **项目上下文**：智能体可以读取 `beledarian_info.md` 以了解项目的历史背景。

### 代码执行

-   **沙盒环境**：安全运行 JavaScript (Deno) 和 Python 代码。
-   **终端交互**：执行 Shell 命令或打开真实的终端窗口进行交互式任务。

> [!WARNING]
> 启用 Shell 或终端执行将允许模型在您的系统上运行任意命令。这可能导致模型脱离沙盒环境并操作工作区以外的文件。

### 网络与 RAG

-   **信息研究**：搜索 DuckDuckGo、维基百科或获取网页原始内容。
-   **高级浏览器导航**：持久化的 `browser_session` 流程，支持多步自动化浏览。
-   **网页 RAG**：直接与网页内容对话。
-   **本地 RAG**：对您的工作区文件进行语义搜索 (`rag_local_files`)。

## 要求

- [Node.js](https://nodejs.org/) (v18+)
- [LM Studio](https://lmstudio.ai/) (v0.3.0+)

> **💡 提示**：需要为您的智能体提供持久的长期记忆？
> 欢迎关注我的另一个项目：**[Local Memory MCP](https://github.com/Beledarian/mcp-local-memory)** —— 一个支持知识图谱的隐私优先记忆服务器。

## 安装方式

您可以通过以下链接安装插件：

[https://lmstudio.ai/beledarian/beledarians-lm-studio-tools](https://lmstudio.ai/beledarian/beledarians-lm-studio-tools)

或者，您也可以手动安装用于开发：

### 开发指南

如果您想参与本插件的开发，请参考以下步骤：

1. **克隆仓库**：

    ```bash
    git clone https://github.com/Beledarian/Beledarians_LM_Studio_Toolbox.git
    cd Beledarians_LM_Studio_Toolbox
    ```

2. **安装依赖**：

    ```bash
    npm install
    ```

3. **运行开发模式**：
    在项目目录下执行：

    ```bash
    lms dev
    ```

    这将以开发模式启动插件。LM Studio 会自动识别并加载。您对源码的任何修改都会触发插件自动重载。

## 配置选项

在 LM Studio 的 “Plugins” 选项卡中可以找到这些设置：

- **Enable Secondary Agent**：开启子智能体功能。
- **Sub-Agent Profiles**：为“程序员”、“评审员”等定义自定义 Prompt。
- **Auto-Debug Mode**：自动评审子智能体代码。
- **Sub-Agent Debug Logging**：开启详细的解析日志用于排障。
- **Sub-Agent Auto-Save**：切换自动文件保存（默认：开启）。
- **Show Full Code Output**：控制是否在聊天中显示完整代码或为简洁起见隐藏。
- **Default Workspace Path**：设置插件启动时的默认工作目录。
- **安全设置**：启用/禁用 Python/JS/Shell 的代码执行。
- **浏览器安全**：子智能体浏览器自动化需要同时开启三个相关开关。

## 可用工具

### 文件系统

- `list_directory`, `change_directory`, `make_directory`
- `read_file`, `save_file` (支持批量), `delete_path`
- `replace_text_in_file`：精确编辑。
- `delete_files_by_pattern`：基于正则的清理。
- `move_file`, `copy_file`, `find_files`, `get_file_metadata`
- `fuzzy_find_local_files`：基于编辑距离的模糊文件搜索。

### 智能体

- `consult_secondary_agent`：核心工具。负责任务委派、文件创建和子智能体循环管理。

### 网络

- `web_search` (DuckDuckGo + HTML 获取), `wikipedia_search`
- `fetch_web_content`, `rag_web_content`
- `browser_session_open`, `browser_session_control`, `browser_session_close`：持久化浏览器自动化。
- `browser_open_page`：单次 Puppeteer 页面读取。

### 执行

- `run_javascript`, `run_python`
- `execute_command` (后台), `run_in_terminal` (交互式)

### 工具类

- `rag_local_files`：搜索您的代码。
- `save_memory`：长期记忆。
- `get_system_info`, `read_clipboard`, `write_clipboard`

## 开发者指南

架构详情请参阅 [CODE_OVERVIEW.md](https://github.com/Beledarian/Beledarians_LM_Studio_Toolbox/blob/main/CODE_OVERVIEW.md)。
