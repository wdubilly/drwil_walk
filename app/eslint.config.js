// Lint de la couche app : chaque règle ci-dessous outille un contrat de docs/contracts.md.
import js from "@eslint/js";
import comments from "@eslint-community/eslint-plugin-eslint-comments/configs";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  { ignores: ["dist/", "coverage/"] },
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  comments.recommended,
  {
    languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname } },
    // QUA-007 : une directive de désactivation devenue inutile est une erreur, pas un bruit toléré.
    linterOptions: { reportUnusedDisableDirectives: "error" },
    rules: {
      // QUA-002 : aucune erreur avalée en silence.
      "no-empty": ["error", { allowEmptyCatch: false }],
      "@typescript-eslint/no-floating-promises": "error",
      // QUA-008 : toute suppression de type porte sa raison.
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-ignore": "allow-with-description",
          "ts-expect-error": "allow-with-description",
          "ts-nocheck": true,
          minimumDescriptionLength: 10,
        },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "@eslint-community/eslint-comments/require-description": ["error", { ignore: [] }],
    },
  },
);
