// @ts-check
"use strict";

const tseslint = require("typescript-eslint");

module.exports = tseslint.config(
  // Apply to TypeScript source only — ignore compiled output and tests
  { ignores: ["dist/**", "node_modules/**", "tests/**"] },

  // typescript-eslint recommended rules (no type-checking — keeps lint fast)
  ...tseslint.configs.recommended,

  {
    rules: {
      // ── Intentional overrides ────────────────────────────────────────────
      // Native addons (better-sqlite3, pdf-parse) must use require() in CJS.
      // The `// eslint-disable-next-line` comments throughout the codebase
      // are now effective — this rule is on so they're meaningful, but we
      // suppress it at the call sites that genuinely need require().
      "@typescript-eslint/no-require-imports": "error",

      // `any` is used in several places for SDK interop and Puppeteer types
      // where the upstream types are incomplete. Warn rather than error.
      "@typescript-eslint/no-explicit-any": "warn",

      // Unused variables are real bugs — error on them, but allow _ prefix
      // for intentionally unused parameters (common in callbacks).
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],

      // Empty catch blocks with a comment are intentional in this codebase
      // (e.g. "Keep trying fallback paths"). The default rule would flag them.
      "no-empty": ["error", { allowEmptyCatch: false }],

      // The browser evaluate action in browserActions.ts intentionally uses
      // Function() to run arbitrary scripts inside a sandboxed Puppeteer page.
      // That single call site carries an eslint-disable comment; all other
      // uses of the Function constructor should be flagged.
      "no-new-func": "error",
    },
  },
);
