# Beledarian's LM Studio Tools (简体中文)

[English](README.md) | [Deutsch](README.de.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md)

[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/Beledarian/Beledarians_LM_Studio_Toolbox)

本项目是 [LM Studio](https://lmstudio.ai/) 的一个插件，为大语言模型（LLM）提供了一系列丰富的工具。它作为 LLM 与您本地环境之间的桥梁，支持自主编程、研究和文件管理。

> [!IMPORTANT]
> **LM Studio 不支持自动更新。** 如果您遇到问题，请尝试先手动更新：删除当前版本并从 [插件网站](https://lmstudio.ai/beledarian/beledarians-lm-studio-tools) 重新下载。即使您的版本已过时，LM Studio 也可能会显示“已安装”提示。

## 核心功能

-   **自主编程**：智能体可以读取、编写、编辑文件，并直接执行代码（Python、JavaScript、Shell）。
-   **本地 RAG (检索增强生成)**：索引并搜索您的本地文档，以获得更准确的答案。
-   **浏览器自动化**：智能体可以打开网页、导航并从互联网中提取信息。
-   **系统集成**：访问终端、Git 操作和 GitHub CLI 工具。
-   **多语言支持**：全面支持中文（简体/繁体）、英语和德语。

## 最近更新 (v1.3.1)

- **🌍 全面国际化 (i18n)**：为界面和运行时提供完整的 **中文**、**英语** 和 **德语** 支持。
- **🌐 双层翻译机制**：同时支持“配置界面”（静态）和“智能体消息”（动态运行时）语言。
- **🔄 界面语言覆盖**：新增手动强制界面语言的选项，在下次插件重启时生效。

<details>
<summary><strong>历史更新 (v1.3.0 及更早版本)</strong></summary>

### v1.3.0

- **🐙 原生 GitHub CLI 工具**：新增 `gh_auth`, `gh_create_issue`, `gh_create_pr` 等工具。
- **🌿 增强型 Git 工作流**：新增 Add 和 Checkout 原生 Git 工具。
- **⚙️ 侧边栏新开关**：可独立启用/禁用 GitHub CLI 工具。

### v1.2.0

- **🛡️ 子智能体工具验证**：新增参数预验证，提供清晰的错误提示。

</details>

## 安装步骤

1. 打开 **LM Studio**。
2. 转到 **Plugins**（或 My Tools）板块。
3. 搜索 "Beledarian's LM Studio Tools"。
4. 点击 **Install**。

## 配置说明

您可以在插件设置中自定义界面语言和智能体消息语言：

-   **Message Language (消息语言)**：智能体用于状态提示、说明和 Prompt 注入的语言。
-   **UI Language Override (界面语言覆盖)**：强制 Config UI 在下次插件重启时使用特定语言。

---

[返回主 README (英文)](README.md)
