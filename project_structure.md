# Project Structure

```
C:\K_KI\T_Tools\
├── .gitignore
├── manifest.json               # LM Studio Plugin Manifest
├── package-lock.json
├── package.json                # Dependencies & Scripts
├── tsconfig.json               # TypeScript Config
├── README.md                   # General Plugin Info
├── TOOLS_USAGE.md              # Documentation for Users/Agents
├── SUB_AGENT_INSTRUCTIONS.md   # System Prompt for the Sub-Agent
├── TEST_PROMPTS.md             # Testing Scenarios
├── memory.md                   # Long-term memory storage (if enabled)
├── startup.md                  # Files to load on startup (if enabled)
└── src/
    ├── index.ts                # Entry Point: Registers modules
    ├── config.ts               # Configuration Schema (Zod)
    ├── toolsProvider.ts        # CORE LOGIC: Tool implementations & Sub-Agent Loop
    ├── promptPreprocessor.ts   # Context Injection & Delegation Hints
    ├── stateManager.ts         # Persistence (Working Directory)
    ├── toolsDocumentation.ts   # Static Documentation String
    └── findLMStudioHome.ts     # Utility to find LMS install
```

