// backend/eslint.config.js
const js = require("@eslint/js");
const tseslint = require("typescript-eslint");
const eslintConfigPrettier = require("eslint-config-prettier");

module.exports = tseslint.config(
  // 1. Global Ignores (replaces .eslintignore)
  {
    ignores: ["dist/", "node_modules/", "coverage/"],
  },

  // 2. Base Configurations
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // 3. Prettier (Disables conflicting rules)
  eslintConfigPrettier,

  // 4. Custom Overrides for TypeScript files
  {
    files: ["src/**/*.{ts,js}"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
    },
    rules: {
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      // Add other custom rules here
    },
  }
);
