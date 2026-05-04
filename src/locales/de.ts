import type { LocaleDict } from "./types";

export const de: LocaleDict = {
  config: {
    messageLanguage: {
      displayName: "Nachrichtensprache",
      subtitle: "Sprache für Laufzeitmeldungen, Hinweise und Prompt-Injektionen. Änderungen gelten sofort ohne Neustart.",
    },
    planMode: {
      displayName: "Planungsmodus",
      subtitle: "Legt fest, wann das Modell vor Änderungen einen Plan erkunden und vorschlagen soll. Optionen: 'always', 'when_useful', 'never'.",
    },
    retrievalLimit: {
      displayName: "Abruf-Limit",
      subtitle: "Maximale Anzahl zurückgegebener Textabschnitte bei einem Abruf.",
    },
    retrievalAffinityThreshold: {
      displayName: "Abruf-Ähnlichkeitsschwellwert",
      subtitle: "Mindestrelevanzwert, ab dem ein Textabschnitt als relevant gilt.",
    },
    allowJavascriptExecution: {
      displayName: "JavaScript-Ausführung erlauben",
      subtitle: "Aktiviert das 'run_javascript'-Tool. GEFAHR: Code läuft auf Ihrem Rechner.",
    },
    allowPythonExecution: {
      displayName: "Python-Ausführung erlauben",
      subtitle: "Aktiviert das 'run_python'-Tool. GEFAHR: Code läuft auf Ihrem Rechner.",
    },
    allowTerminalExecution: {
      displayName: "Terminal-Ausführung erlauben",
      subtitle: "Aktiviert das 'run_in_terminal'-Tool. Öffnet echte Terminal-Fenster.",
    },
    allowShellCommandExecution: {
      displayName: "Shell-Befehlsausführung erlauben",
      subtitle: "Aktiviert das 'execute_command'-Tool. GEFAHR: Befehle laufen auf Ihrem Rechner.",
    },
    allowBrowserControl: {
      displayName: "Browser-Steuerung erlauben",
      subtitle: "Aktiviert Browser-Automatisierungstools. GEFAHR: Automatisierte Aktionen laufen auf Ihrem Rechner.",
    },
    allowGitOperations: {
      displayName: "Git-Operationen erlauben",
      subtitle: "Aktiviert native Git-Tools (status, diff, show, commit, log, add, checkout, push).",
    },
    allowGitHubTools: {
      displayName: "GitHub-CLI-Tools erlauben",
      subtitle: "Aktiviert native GitHub-CLI-Tools. Erfordert installiertes 'gh'.",
    },
    allowDatabaseInspection: {
      displayName: "Datenbankinspektion erlauben",
      subtitle: "Aktiviert 'query_database' für SQLite-Dateien.",
    },
    allowSystemNotifications: {
      displayName: "Systembenachrichtigungen erlauben",
      subtitle: "Erlaubt dem Agenten, OS-Benachrichtigungen zu senden.",
    },
    allowAllCode: {
      displayName: "Alle Codeausführung erlauben",
      subtitle: "HAUPTSCHALTER: Überschreibt alle anderen Einstellungen und aktiviert ALLE Ausführungstools.",
    },
    searchApiKey: {
      displayName: "Such-API-Schlüssel",
      subtitle: "Optionaler API-Schlüssel für Suchdienste zur Vermeidung von Rate-Limits.",
    },
    embeddingModel: {
      displayName: "Einbettungsmodell",
      subtitle: "Modell für RAG-Funktionen (Standard: nomic-ai/nomic-embed-text-v1.5-GGUF).",
    },
    defaultWorkspacePath: {
      displayName: "Standard-Arbeitsbereichspfad",
      subtitle: "Optionaler Startarbeitsbereichspfad. Leer lassen für das eingebaute Standardverzeichnis.",
    },
    enableMemory: {
      displayName: "Gedächtnis aktivieren",
      subtitle: "Wenn aktiviert, kann das Modell Informationen aus einer 'memory.md'-Datei im Arbeitsbereich speichern und abrufen.",
    },
    enableWikipediaTool: {
      displayName: "Wikipedia-Tool aktivieren",
      subtitle: "Aktiviert das 'wikipedia_search'-Tool.",
    },
    enableLocalRag: {
      displayName: "Lokales RAG aktivieren",
      subtitle: "Aktiviert das 'rag_local_files'-Tool zur Suche in Arbeitsbereichsdateien.",
    },
    enableSecondaryAgent: {
      displayName: "Sekundären Agenten/Modell aktivieren",
      subtitle: "Erlaubt dem Hauptmodell, Aufgaben an ein sekundäres Modell zu delegieren.",
    },
    useMainModelForSubAgent: {
      displayName: "Hauptmodell als Sub-Agenten verwenden",
      subtitle: "Wenn aktiviert, verwendet die Sub-Agenten-Schleife den Haupt-LM-Studio-Server (localhost:1234). Ignoriert die 'Endpunkt'-Einstellung.",
    },
    secondaryAgentEndpoint: {
      displayName: "Sekundärer Agenten-Endpunkt",
      subtitle: "API-Endpunkt des sekundären Modells (z. B. 'http://localhost:1234/v1').",
    },
    secondaryModelId: {
      displayName: "Sekundäre Modell-ID",
      subtitle: "ID des für den Sub-Agenten zu verwendenden Modells (muss geladen/verfügbar sein).",
    },
    subAgentProfiles: {
      displayName: "Sub-Agenten-Profile (JSON)",
      subtitle: 'Verfügbare Sub-Agenten definieren. Format: {"coder": "Du bist ein Coding-Experte...", ...}',
    },
    subAgentFrequency: {
      displayName: "Sub-Agenten-Häufigkeit",
      subtitle: "Steuert, wie oft der Agent zur Delegation angehalten wird. Optionen: 'always', 'when_useful', 'hard_tasks', 'never'.",
    },
    subAgentAllowFileSystem: {
      displayName: "Sub-Agent: Dateisystem erlauben",
      subtitle: "Wenn aktiviert, können Sub-Agenten Dateien lesen und auflisten.",
    },
    subAgentAllowWeb: {
      displayName: "Sub-Agent: Websuche erlauben",
      subtitle: "Wenn aktiviert, können Sub-Agenten Wikipedia und DuckDuckGo verwenden.",
    },
    subAgentAllowCode: {
      displayName: "Sub-Agent: Codeausführung erlauben",
      subtitle: "Wenn aktiviert, können Sub-Agenten Python/JS-Code ausführen. GEFAHR!",
    },
    subAgentAllowBrowserControl: {
      displayName: "Sub-Agent: Browser-Steuerung erlauben",
      subtitle: "Wenn aktiviert, können Sub-Agenten Browser-Automatisierungstools verwenden (erfordert globale 'Browser-Steuerung').",
    },
    subAgentTimeLimit: {
      displayName: "Sub-Agenten-Zeitlimit (Sekunden)",
      subtitle: "Maximale Zeit für Sub-Agenten-Aufgaben vor erzwungener Beendigung. Standard: 600 s (10 Min.).",
    },
    enableDebugMode: {
      displayName: "Auto-Debug-Modus aktivieren",
      subtitle: "Wenn aktiviert, lösen an Sub-Agenten delegierte Coding-Aufgaben automatisch einen zweiten 'Reviewer'-Durchlauf aus.",
    },
    enableSubAgentDebugLogging: {
      displayName: "Sub-Agenten-Debug-Protokollierung aktivieren",
      subtitle: "Wenn aktiviert, werden Tool-Call-Parsing-Details des Sub-Agenten zur Fehlersuche in der Konsole protokolliert.",
    },
    subAgentAutoSave: {
      displayName: "Sub-Agent: Code automatisch speichern",
      subtitle: "Wenn aktiviert, werden vom Sub-Agenten generierte, nicht explizit gespeicherte Code-Blöcke automatisch in Dateien gespeichert.",
    },
    showFullCodeOutput: {
      displayName: "Vollständige Code-Ausgabe anzeigen",
      subtitle: "Wenn aktiviert, zeigt der Hauptagent den vollständigen Code-Inhalt generierter Dateien statt nur der Dateipfade.",
    },
  },

  runtime: {
    statusLoadingEmbeddingModel: "Einbettungsmodell für den Abruf wird geladen...",
    statusRetrievingCitations: "Relevante Zitate für die Nutzeranfrage werden abgerufen...",
    statusRetrievedCitations: (count) => `${count} relevante Zitate für die Nutzeranfrage abgerufen`,
    statusNoRelevantCitations: "Keine relevanten Zitate für die Nutzeranfrage gefunden",
    statusDecidingStrategy: "Dokumentenverarbeitungsstrategie wird ermittelt...",
    statusLoadingParser: (fileName) => `Parser für ${fileName} wird geladen...`,
    statusStrategyChosen: (strategy, detail) => `Kontext-Injektionsstrategie gewählt: '${strategy}'. ${detail}`,
    citationPrefix: "Folgende Zitate wurden in den vom Nutzer bereitgestellten Dateien gefunden:\n\n",
    citationEntry: (num, text) => `Zitat ${num}: „${text}"\n\n`,
    citationSuffix: (userQuery) =>
      "Verwenden Sie die obigen Zitate zur Beantwortung der Nutzeranfrage, sofern relevant. " +
      "Andernfalls antworten Sie nach bestem Wissen ohne diese." +
      `\n\nNutzeranfrage:\n\n${userQuery}`,
    noRelevantCitationsNote:
      "Wichtig: In den Nutzerdateien wurden keine relevanten Zitate zur Anfrage gefunden. " +
      "Informieren Sie den Nutzer in einem Satz darüber. " +
      "Beantworten Sie die Anfrage dann nach bestem Wissen.",
    documentInjectionHeader:
      "Dies ist ein Szenario zur erweiterten Kontextgenerierung.\n\nFolgender Inhalt wurde in den vom Nutzer bereitgestellten Dateien gefunden.\n",
    documentInjectionFileBlock: (fileName, content) =>
      `\n\n** Vollständiger Inhalt von ${fileName} **\n\n${content}\n\n** Ende von ${fileName} **\n\n`,
    documentInjectionSuffix: (userQuery) =>
      `Bitte antworten Sie auf Basis der obigen Inhalte auf die Nutzeranfrage.\n\nNutzeranfrage: ${userQuery}`,
    delegationHintAlways:
      "\n\n**SYSTEMAUFTRAG:** Sie MÜSSEN alle Informationsabrufe, Nachrichtenzusammenfassungen und **alle Coding-Aufgaben** (Erstellen, Bearbeiten, Refaktorieren) an den Sekundär-Agenten delegieren. Schreiben Sie KEINEN Code selbst. Verwenden Sie `consult_secondary_agent` mit `allow_tools: true`.\n\n**Vor-Delegations-Checkliste:**\n1. `list_directory` ausführen, um vorhandene Dateien zu sehen.\n2. `beledarian_info.md` oder `README.md` lesen, falls vorhanden.\n3. `consult_secondary_agent` mit dem Kontext aufrufen.",
    delegationHintWhenUseful:
      "\n\n**SYSTEMEMPFEHLUNG:** Für komplexe Aufgaben (z. B. 'App erstellen', 'Modul refaktorieren', 'recherchieren und zusammenfassen') **MÜSSEN** Sie mit `consult_secondary_agent` (mit `allow_tools: true`) an den Sekundär-Agenten delegieren.\n\n**So delegieren Sie:**\n1. Kontext sammeln (`list_directory`, `read_file`).\n2. `consult_secondary_agent` mit einer klaren Aufgabenbeschreibung aufrufen.\n",
    delegationHintWhenUsefulDebug:
      "Hinweis: 'Auto-Debug' ist AKTIV. Der Sub-Agent überprüft und korrigiert seinen eigenen Code.\n",
    delegationHintHardTasks:
      "\n\n**Delegations-Hinweis:** Delegieren Sie nur EXTREM komplexe oder rechenintensive Aufgaben an den Sekundär-Agenten. Standardanfragen und Datei-Lesevorgänge selbst bearbeiten.\n",
    planHintAlways:
      "\n\n**PLANUNGSMODUS [AKTIV]:** Vor JEGLICHEN Dateiänderungen oder Implementierungen MÜSSEN Sie:\n1. **ERKUNDEN:** `list_directory`, `read_file` und andere Erkundungstools nutzen.\n2. **VORSCHLAGEN:** Einen klaren Schritt-für-Schritt-Plan darlegen.\n3. **WARTEN:** NICHT implementieren, bis der Nutzer den Plan genehmigt.\n\n**Ausnahme:** Einfache Gespräche oder triviale Einzeilen-Änderungen erfordern keine Planung.",
    planHintWhenUseful:
      "\n\n**PLANUNGSMODUS [Bei Bedarf]:** Für größere, komplexe oder mehrdeutige Anfragen:\n1. **ZUERST ERKUNDEN:** Codebase vor Änderungen mit `list_directory`, `read_file` verstehen.\n2. **PLAN VORSCHLAGEN:** Vorgehen und wichtigste Schritte vor der Implementierung skizzieren.\n3. **EINFACHE AUFGABEN ÜBERSPRINGEN:** Normale Gespräche oder kleine Änderungen erfordern keine Planung.",
  },
};
