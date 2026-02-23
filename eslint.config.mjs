import eslint from "@eslint/js";
import eslintPluginAstro from "eslint-plugin-astro";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import tseslint from "typescript-eslint";
import globals from "globals";

const importSortGroups = [
  // Side-effect imports
  ["^\\u0000"],
  // External packages (not relative, not path aliases)
  ["^(?!@(stores|scripts|components|layouts|styles)/)[^.]"],
  // Path aliases
  ["^@(stores|scripts|components|layouts|styles)/"],
  // Relative imports, deepest first
  ["^\\.\\.\\/\\.\\.\\/"],
  ["^\\.\\.\\/"],
  ["^\\.\\/?"],
];

export default [
  {
    files: ["**/*.js", "**/*.ts", "**/*.tsx"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "no-unused-vars": "off", // Disabled in favor of @typescript-eslint/no-unused-vars
      "simple-import-sort/imports": ["warn", { groups: importSortGroups }],
      "simple-import-sort/exports": "warn",
    },
  },
  {
    files: ["**/*.js", "**/*.ts"],
    ...eslint.configs.recommended,
  },

  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ["**/*.ts", "**/*.tsx"],
  })),
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },

  ...eslintPluginAstro.configs["flat/recommended"],

  {
    ignores: [
      "dist/**",
      ".astro/**",
      "node_modules/**",
      "*.config.js",
      "*.config.ts",
    ],
  },
];
