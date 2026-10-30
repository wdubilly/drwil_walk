import type { Linter } from "eslint";
import { describe, expect, it } from "vitest";
import config from "./eslint.config.js";

// Les contrats QUA-002, QUA-007 et QUA-008 reposent sur ces règles : un réglage retiré par erreur
// ferait passer le lint sans rien prouver.
const rules: Partial<Linter.RulesRecord> = {};
for (const c of config) Object.assign(rules, c.rules);
const unusedDirectives = config.map((c) => c.linterOptions?.reportUnusedDisableDirectives).filter(Boolean);

const level = (rule: string): unknown => {
  const value: unknown = rules[rule];
  return Array.isArray(value) ? value[0] : value;
};

describe("configuration du lint", () => {
  it("refuse les erreurs avalées (QUA-002)", () => {
    expect(level("no-empty")).toBe("error");
    expect(level("@typescript-eslint/no-floating-promises")).toBe("error");
  });

  it("exige la raison de toute suppression de type (QUA-008)", () => {
    expect(rules["@typescript-eslint/ban-ts-comment"]).toEqual([
      "error",
      expect.objectContaining({ "ts-ignore": "allow-with-description", "ts-expect-error": "allow-with-description" }),
    ]);
    expect(level("@typescript-eslint/no-explicit-any")).toBe("error");
    expect(level("@eslint-community/eslint-comments/require-description")).toBe("error");
  });

  it("traite une directive de désactivation inutile comme une erreur (QUA-007)", () => {
    expect(unusedDirectives).toContain("error");
  });
});
