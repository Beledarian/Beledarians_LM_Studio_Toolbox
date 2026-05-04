# Beledarian's LM Studio Tools

[English](README.md) | [Deutsch](README.de.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md)

[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/Beledarian/Beledarians_LM_Studio_Toolbox)

Dieses Projekt ist ein Plugin für [LM Studio](https://lmstudio.ai/), das einem Large Language Model (LLM) eine umfangreiche Palette an Werkzeugen zur Verfügung stellt. Es fungiert als Brücke zwischen dem LLM und Ihrer lokalen Umgebung und ermöglicht autonomes Programmieren, Recherche und Dateiverwaltung.

> [!IMPORTANT]
> **LM Studio unterstützt KEINE automatischen Updates.** Wenn Sie Probleme haben, versuchen Sie bitte zuerst eine manuelle Aktualisierung, indem Sie die aktuelle Version entfernen und von der [Plugin-Website](https://lmstudio.ai/beledarian/beledarians-lm-studio-tools) neu herunterladen. LM Studio zeigt möglicherweise einen Tooltip "bereits installiert" an, selbst wenn Ihre Version veraltet ist.

## Hauptfunktionen

### Dateisystem-Beherrschung

- **Volle Kontrolle:** Erstellen, Lesen, Aktualisieren, Löschen, Verschieben und Kopieren von Dateien.
- **Sicher & Geschützt:** Alle Operationen sind auf Ihr Workspace-Verzeichnis beschränkt, um Path-Traversal-Angriffe zu verhindern.
- **Intelligente Updates:** Verwenden Sie `replace_text_in_file` für chirurgische Bearbeitungen, anstatt große Dateien komplett neu zu schreiben.
- **Stapelverarbeitung:** `save_file` unterstützt das Erstellen mehrerer Dateien in einem Durchgang.
- **Bereinigung:** Verwenden Sie `delete_files_by_pattern`, um temporäre Dateien sofort zu löschen.

> **Probleme festgestellt?** Zögern Sie nicht, diese auf [GitHub zu melden](https://github.com/Beledarian/Beledarians_LM_Studio_Toolbox/issues).
>
> **Finden Sie dieses Projekt hilfreich?** Erwägen Sie, ihm einen [⭐ auf GitHub zu geben](https://github.com/Beledarian/Beledarians_LM_Studio_Toolbox) oder [beizutragen!](https://github.com/Beledarian/Beledarians_LM_Studio_Toolbox/tree/main?tab=contributing-ov-file) Vielen Dank, dass Sie die Toolbox verwenden.


### Aktuelle Updates (v1.3.1)

- **🌍 Volle Internationalisierung (i18n):** Komplette Unterstützung für **Deutsch**, **Englisch**, **vereinfachtes Chinesisch** und **traditionelles Chinesisch** in der Benutzeroberfläche und zur Laufzeit.
- **🌐 Dual-Layer Übersetzung:** Unterstützt sowohl die "Config UI" (statisch) als auch "Agenten-Nachrichten" (dynamisch zur Laufzeit).
- **🔄 UI Language Override:** Manuelles Erzwingen der UI-Sprache für den nächsten Plugin-Neustart zur einfacheren Lokalisierungskontrolle.

<details>
<summary><strong>Ältere Updates (v1.3.0 & früher)</strong></summary>

### v1.3.0

- **🐙 Native GitHub CLI Tools:** Unterstützung für `gh_auth`, `gh_create_issue`, `gh_list_issues`, `gh_view_comments`, `gh_create_pr`, `gh_list_prs`, `gh_view_pr_diff` und `gh_push` für sichere GitHub-Interaktionen ohne generische Shell-Befehle.
- **🌿 Erweiterter Git-Workflow:** Native Git-Tools für `git_add` und `git_checkout` zur Vervollständigung der Toolchain (Status, Diff, Log, Commit, Add, Checkout).
- **⚙️ Neuer Sidebar-Schalter:** Separate Aktivierung der GitHub-Tools in den Plugin-Einstellungen.
- **🛡️ Abhängigkeits-Prüfung:** Alle CLI-Tools prüfen vor der Ausführung, ob die notwendigen Programme installiert sind.

### v1.2.0

- **🛡️ Validierung von Sub-Agenten-Tools:** Frühzeitige Parameterprüfung mit klaren Fehlermeldungen, um lautlose Fehler bei falschen Pfaden oder Parametern zu verhindern.
- **🧪 Regressions-Tests:** 14 neue Tests für die Tool-Validierungslogik hinzugefügt (insgesamt 51 Tests).
- **💬 Besseres Fehler-Feedback:** Sub-Agenten erhalten nun hilfreiche Hinweise bei häufigen Fehlern.

### v1.1.1 (08.04.2026)
**Browser-Zuverlässigkeit und Navigationskontext**

- **Behoben:** Klick-Aktionen im Browser nutzen nun einen DOM-Fallback, falls Puppeteer Fehler meldet.
- **Verbessert:** Browser-Klicks werden nach ~300ms wiederholt, bevor der Fallback greift.
- **Hinzugefügt:** `browser_session_open` gibt standardmäßig den vollständigen Seitentext zurück.

### v1.1.0 (08.04.2026)
**Verbesserungen der Sub-Agenten-Kompatibilität**

- **Behoben:** Unterstützung für Modelle wie Gemma 4, die spezielle JSON-Formate für Tool-Calls nutzen.
- **Hinzugefügt:** Erweiterte Browser-Navigation (`open`, `control`, `close`) mit in-page Suche.
- **Hinzugefügt:** Unterstützung für strukturierte `handoff_message` für Übergabeprozesse.

</details>


### Autonome Agenten

- **Sekundär-Agent:** Delegieren Sie komplexe Aufgaben (Coding, Zusammenfassungen) an ein zweites lokales Modell/Server – mit Unterstützung für das bereits in LM Studio geladene Hauptmodell!
- **Auto-Save:** Wenn der Sub-Agent Code generiert, erkennt und speichert das System diesen **automatisch** auf Ihrer Festplatte. Kein Kopieren und Einfügen mehr!
- **Auto-Debug:** (Optional) Aktiviert einen "Reviewer"-Agenten, der generierten Code analysiert und Fehler automatisch behebt.
- **Strukturierte Übergabe:** Sub-Agenten können eine dedizierte `handoff_message` zurückgeben, um Ergebnisse an den Hauptagenten zu melden.
- **Projektkontext:** Agenten können die Datei `beledarian_info.md` lesen, um die Historie Ihres Projekts zu verstehen.

### Code-Ausführung

- **Sandboxed:** Führen Sie JavaScript (Deno) und Python-Code sicher aus.
- **Terminal:** Führen Sie Shell-Befehle aus oder öffnen Sie echte Terminalfenster für interaktive Aufgaben.

> [!WARNING]
> Das Aktivieren der Shell- oder Terminalausführung erlaubt es dem Modell, beliebige Befehle auf Ihrem System auszuführen. Bei Aktivierung könnte das Modell die Sandbox verlassen und Dateien außerhalb des Arbeitsverzeichnisses manipulieren.

### Web & RAG

- **Recherche:** Suchen Sie über DuckDuckGo, Wikipedia oder laden Sie rohe Webinhalte.
- **Erweiterte Browser-Navigation:** Persistente `browser_session`-Steuerung für mehrstufige Automatisierung.
- **Web RAG:** Chatten Sie direkt mit Website-Inhalten.
- **Lokales RAG:** Semantische Suche über Ihre Workspace-Dateien (`rag_local_files`).

## Anforderungen

- [Node.js](https://nodejs.org/) (v18+)
- [LM Studio](https://lmstudio.ai/) (v0.3.0+)

> **💡 Tipp:** Benötigen Sie ein persistentes Langzeitgedächtnis für Ihren Agenten?
> Schauen Sie sich mein anderes Projekt an: **[Local Memory MCP](https://github.com/Beledarian/mcp-local-memory)** – Ein privatsphäre-orientierter Memory-Server mit Knowledge Graph-Unterstützung.

## Installation

Das Plugin kann über den folgenden Link installiert werden:

[https://lmstudio.ai/beledarian/beledarians-lm-studio-tools](https://lmstudio.ai/beledarian/beledarians-lm-studio-tools)

Alternativ können Sie es für Entwicklungszwecke manuell installieren.

### Entwicklung

Wenn Sie zur Entwicklung dieses Plugins beitragen möchten, folgen Sie diesen Schritten:

1. **Repository klonen:**

    ```bash
    git clone https://github.com/Beledarian/Beledarians_LM_Studio_Toolbox.git
    cd Beledarians_LM_Studio_Toolbox
    ```

2. **Abhängigkeiten installieren:**

    ```bash
    npm install
    ```

3. **Im Entwicklungsmodus ausführen:**
    Führen Sie folgenden Befehl im Projektverzeichnis aus:

    ```bash
    lms dev
    ```

    Dies startet das Plugin im Entwicklungsmodus. LM Studio sollte es automatisch erkennen. Änderungen am Quellcode führen zu einem automatischen Neustart des Plugins.

## Konfiguration

Sie finden diese Einstellungen im Reiter "Plugins" in LM Studio:

- **Enable Secondary Agent:** Schaltet die Unterstützung für Sub-Agenten frei.
- **Sub-Agent Profiles:** Benutzerdefinierte Prompts für "Coder", "Reviewer" etc.
- **Auto-Debug Mode:** Automatische Überprüfung von Sub-Agenten-Code.
- **Sub-Agent Debug Logging:** Detaillierte Parsing-Logs zur Fehlersuche.
- **Sub-Agent Auto-Save:** Automatisches Speichern von Dateien (Standard: An).
- **Show Full Code Output:** Bestimmt, ob vollständiger Code im Chat angezeigt oder zur Kürze ausgeblendet wird (Dateien werden dennoch gespeichert).
- **Default Workspace Path:** Legt das Standardverzeichnis für den Arbeitsbereich fest.
- **Sicherheit:** Aktivieren/Deaktivieren der Code-Ausführung für Python/JS/Shell.
- **Browser-Sicherheit:** Die Browser-Automatisierung erfordert die Aktivierung aller drei entsprechenden Schalter.

## Verfügbare Werkzeuge

### Dateisystem

- `list_directory`, `change_directory`, `make_directory`
- `read_file`, `save_file` (Batch-Unterstützung), `delete_path`
- `replace_text_in_file`: Präzises Bearbeiten.
- `delete_files_by_pattern`: Regex-basierte Bereinigung.
- `move_file`, `copy_file`, `find_files`, `get_file_metadata`
- `fuzzy_find_local_files`: Fuzzy-Suche nach Dateipfaden/Namen.

### Agent

- `consult_secondary_agent`: Das zentrale Werkzeug für Delegation, Dateierstellung und Sub-Agenten-Loops.

### Web

- `web_search` (DuckDuckGo + HTML Fetch), `wikipedia_search`
- `fetch_web_content`, `rag_web_content`
- `browser_session_open`, `browser_session_control`, `browser_session_close`: Persistente Browser-Automatisierung.
- `browser_open_page`: Einmaliges Laden einer Seite über Puppeteer.

### Ausführung

- `run_javascript`, `run_python`
- `execute_command` (Hintergrund), `run_in_terminal` (Interaktiv)

### Hilfswerkzeuge

- `rag_local_files`: Durchsuchen Sie Ihren Code.
- `save_memory`: Langzeitgedächtnis.
- `get_system_info`, `read_clipboard`, `write_clipboard`

## Entwickler-Leitfaden

Siehe [CODE_OVERVIEW.md](https://github.com/Beledarian/Beledarians_LM_Studio_Toolbox/blob/main/CODE_OVERVIEW.md) für architektonische Details.
