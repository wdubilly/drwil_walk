import { describe, expect, it } from "vitest";
import data from "../../assets/recette-regions.json" with { type: "json" };
import { readRecipe, recipeFor } from "./region-palette.ts";

type Raw = { regions: Record<string, { sols?: unknown }>; districts: Record<string, { sols?: unknown }> };
const clone = (): Raw => JSON.parse(JSON.stringify(data)) as Raw;

describe("revêtements de repli de la recette", () => {
  it("APP-009: le quartier surcharge sa région, qui surcharge « ailleurs » ; sans valeur, rien n'est inventé", () => {
    const raw = clone();
    (raw.districts["souq-waqif"] as { sols?: unknown }).sols = { value: { chaussee: "pave" }, origin: "regle" };
    (raw.regions["caucase"] as { sols?: unknown }).sols = { value: { chaussee: "terre" }, origin: "regle" };
    const file = readRecipe(raw);
    expect(recipeFor(file, "golfe", "souq-waqif").sols?.value.chaussee).toBe("pave");
    expect(recipeFor(file, "caucase").sols?.value.chaussee).toBe("terre");
    expect(recipeFor(file, "inconnue").sols?.value.chaussee).toBe("asphalt");
    delete raw.regions["ailleurs"]?.sols;
    expect(recipeFor(readRecipe(raw), "france-nord").sols).toBeUndefined();
  });

  it("APP-009: refuse un revêtement inconnu ou vide", () => {
    for (const bad of [{ chaussee: "moquette" }, {}, "asphalt"]) {
      const raw = clone();
      (raw.regions["ailleurs"] as { sols?: unknown }).sols = { value: bad, origin: "regle" };
      expect(() => readRecipe(raw)).toThrow(/sols/);
    }
  });
});
