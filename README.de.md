# Beledarian's LM Studio Tools (Deutsch)

[English](README.md) | [Deutsch](README.de.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md)

[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/Beledarian/Beledarians_LM_Studio_Toolbox)

Dieses Projekt ist ein Plugin für [LM Studio](https://lmstudio.ai/), das einem Large Language Model (LLM) eine umfangreiche Palette an Werkzeugen zur Verfügung stellt. Es fungiert als Brücke zwischen dem LLM und Ihrer lokalen Umgebung und ermöglicht autonomes Programmieren, Recherche und Dateiverwaltung.

> [!IMPORTANT]
> **LM Studio unterstützt KEINE automatischen Updates.** Wenn Sie Probleme haben, versuchen Sie bitte zuerst eine manuelle Aktualisierung, indem Sie die aktuelle Version entfernen und von der [Plugin-Website](https://lmstudio.ai/beledarian/beledarians-lm-studio-tools) neu herunterladen. LM Studio zeigt möglicherweise einen Tooltip "bereits installiert" an, selbst wenn Ihre Version veraltet ist.

## Hauptfunktionen

-   **Autonomes Programmieren**: Der Agent kann Dateien lesen, schreiben, bearbeiten und Code (Python, JavaScript, Shell) direkt ausführen.
-   **Lokales RAG (Retrieval-Augmented Generation)**: Indizieren und durchsuchen Sie Ihre lokalen Dokumente für präzisere Antworten.
-   **Browser-Automatisierung**: Der Agent kann Webseiten öffnen, navigieren und Informationen aus dem Internet extrahieren.
-   **System-Integration**: Zugriff auf das Terminal, Git-Operationen und GitHub-CLI-Tools.
-   **Multi-Locale Support**: Volle Unterstützung für Deutsch, Englisch und Chinesisch.

## Aktuelle Updates (v1.3.1)

- **🌍 Volle Internationalisierung (i18n):** Komplette Unterstützung für **Deutsch**, **Englisch** und **Chinesisch** in der Benutzeroberfläche und zur Laufzeit.
- **🌐 Dual-Layer Übersetzung:** Unterstützt sowohl die "Config UI" (statisch) als auch "Agenten-Nachrichten" (dynamisch).
- **🔄 UI Language Override:** Manuelles Erzwingen der UI-Sprache für den nächsten Plugin-Neustart.

<details>
<summary><strong>Ältere Updates (v1.3.0 & früher)</strong></summary>

### v1.3.0

- **🐙 Native GitHub CLI Tools:** Unterstützung für `gh_auth`, `gh_create_issue`, `gh_create_pr` usw.
- **🌿 Erweiterter Git-Workflow:** Native Git-Tools für Add und Checkout.
- **⚙️ Neuer Sidebar-Schalter:** Separate Aktivierung der GitHub-Tools.

### v1.2.0

- **🛡️ Validierung von Sub-Agenten-Tools:** Frühzeitige Validierung von Parametern zur Vermeidung von Fehlern.

</details>

## Installation

1. Öffnen Sie **LM Studio**.
2. Gehen Sie zum Bereich **Plugins** (oder My Tools).
3. Suchen Sie nach "Beledarian's LM Studio Tools".
4. Klicken Sie auf **Install**.

## Konfiguration

Sie können die Sprache der Benutzeroberfläche und der Agenten-Nachrichten in den Plugin-Einstellungen anpassen:

-   **Message Language**: Die Sprache, die der Agent für Statusmeldungen und Hinweise verwendet.
-   **UI Language Override**: Erzwingt eine bestimmte Sprache für das Einstellungsmenü beim nächsten Neustart.

---

[Zurück zum Haupt-README (Englisch)](README.md)
