import { describe, expect, it } from "vitest";
import { bundledCatalogue } from "./traffic-assets.ts";
import { readCatalogue, regionSetting } from "./traffic-catalog.ts";

describe("catalogue embarqué des figurants", () => {
  it("APP-014: la table de région vient de la recette : golfe à droite, inde à gauche, quartiers comme leur région", () => {
    const catalogue = readCatalogue(bundledCatalogue);
    expect(regionSetting(catalogue, "golfe").conduite).toBe("droite");
    expect(regionSetting(catalogue, "inde").conduite).toBe("gauche");
    expect(regionSetting(catalogue, "souq-waqif")).toEqual(regionSetting(catalogue, "golfe"));
    expect(regionSetting(catalogue, "pune-vieille-ville")).toEqual(regionSetting(catalogue, "inde"));
    expect(regionSetting(catalogue, "provence")).toEqual(catalogue.regions["ailleurs"]);
  });
});
