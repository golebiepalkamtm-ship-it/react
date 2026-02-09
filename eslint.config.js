import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { dirname } from 'path';
import { fileURLToPath } from 'url';

// Provide __dirname for ESM modules (package.json uses "type": "module")
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default tseslint.config(
  { 
    ignores: [
      "dist", 
      "absolute/**",
      "server/prisma.config.ts",
      "server/test_client/**",
      "server/dist/**",
      "server/lib/logger.d.ts",
      "supabase/functions/mcp/index.ts",
      "chrono-tunnel/**",
      "prisma.config.ts",
      "tailwind.config.ts",
      "vite.config.ts",
      "vitest.config.ts",
      "supabase-mcp/**",
      "playwright.config.ts",
      "e2e/**"
    ] 
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        tsconfigRootDir: __dirname,
        // Point directly to the app tsconfig so files under `src/` are included
        project: ['./tsconfig.app.json'],
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
      "@typescript-eslint/no-wrapper-object-types": "off",
    },
  },
);
