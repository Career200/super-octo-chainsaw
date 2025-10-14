import eslint from "@eslint/js";
import eslintPluginAstro from "eslint-plugin-astro";
import tseslint from "typescript-eslint";
import globals from "globals";

export default [
  {
    files: ["**/*.js", "**/*.ts"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      "no-console": "warn",
      "no-debugger": "warn",
      "no-unused-vars": "off", // Disabled in favor of @typescript-eslint/no-unused-vars
    },
  },
  {
    files: ["**/*.js", "**/*.ts"],
    ...eslint.configs.recommended,
  },

  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ["**/*.ts"],
  })),
  {
    files: ["**/*.ts"],
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
