import { describe, expect, it } from "vitest";
import { RECIPE, paletteOf, readRecipe, recipeFor } from "./region-palette.ts";
import { readFacadeSets, usedSetsOf } from "./recipe-data.ts";
import type { FamilyId, Region } from "./facade-family.ts";
import { PALETTES, PALETTES_PER_FAMILY, palettesOf, type DetailPalette } from "./facade-palettes.ts";

const OWN: Region[] = ["italie", "caucase", "france-nord", "inde", "golfe"];
const COMMON: FamilyId[] = ["village", "ancien", "recent"];
const colours = (p: DetailPalette): number[] => [p.trim, p.glass, p.accent, ...p.shutters, ...p.doors];
const key = (p: DetailPalette): string => colours(p).join(",");

describe("palettes de façades par région", () => {
  it("APP-008: chaque région porte son jeu, trois palettes par famille, des couleurs valides", () => {
    for (const region of [...OWN, "provence", "ailleurs"] as Region[]) {
      for (const family of [...COMMON, "provencale"] as FamilyId[]) {
        const set = palettesOf(region)[family];
        expect(set).toHaveLength(PALETTES_PER_FAMILY);
        for (const p of set) {
          expect(p.shutters).toHaveLength(3);
          expect(p.doors).toHaveLength(3);
          expect(colours(p).every((c) => Number.isInteger(c) && c >= 0 && c <= 0xffffff)).toBe(true);
        }
      }
    }
  });

  it("APP-008: deux régions différentes ne partagent aucune palette de maison, d'ancien ou de récent", () => {
    const sets = [PALETTES, ...OWN.map(palettesOf)];
    for (const family of COMMON) {
      const all = sets.flatMap((s) => s[family].map(key));
      expect(new Set(all).size).toBe(all.length);
    }
  });

  it("APP-008: la Provence et une région inconnue gardent les palettes d'avant les régions", () => {
    expect(palettesOf("provence")).toBe(PALETTES);
    expect(palettesOf("ailleurs")).toBe(PALETTES);
  });
});

const palette = (ground: number) => ({ value: { ground, road: 2, buildings: [3, 4] }, origin: "regle" });
const raw = () => ({
  regions: {
    ailleurs: { palette: palette(1), facadeSet: { value: "base", origin: "regle" } },
    golfe: { palette: { ...palette(10), origin: "releve" } },
  },
  districts: { souq: { facadeSet: { value: "souq", origin: "releve" } }, ancien: { region: "golfe", facadeSet: { value: "x", origin: "regle" } } },
});

describe("recette en données", () => {
  it("APP-008: une région sans entrée prend « ailleurs » sans erreur", () => {
    const recipe = recipeFor(readRecipe(raw()), "caucase");
    expect(recipe.palette.value.ground).toBe(1);
    expect(recipe.facadeSet.value).toBe("base");
  });

  it("APP-008: un champ absent d'une région vient d'« ailleurs », un champ présent la distingue", () => {
    const recipe = recipeFor(readRecipe(raw()), "golfe");
    expect(recipe.palette).toEqual({ value: { ground: 10, road: 2, buildings: [3, 4] }, origin: "releve" });
    expect(recipe.facadeSet.value).toBe("base");
  });

  it("APP-008: la surcharge d'un quartier l'emporte sur la région, champ par champ, sans code propre au quartier", () => {
    const file = readRecipe(raw());
    expect(recipeFor(file, "golfe", "souq").facadeSet).toEqual({ value: "souq", origin: "releve" });
    expect(recipeFor(file, "golfe", "souq").palette.value.ground).toBe(10);
    expect(recipeFor(file, "inde", "inconnu").palette.value.ground).toBe(1);
    expect(recipeFor(file, "inde", "ancien").palette.value.ground).toBe(10);
  });

  it("APP-013: chaque élément porte son origine, une origine absente ou inconnue est refusée", () => {
    const noOrigin = raw();
    delete (noOrigin.regions.golfe.palette as { origin?: string }).origin;
    expect(() => readRecipe(noOrigin)).toThrow("origine");
    const wrong = raw();
    (wrong.districts.souq.facadeSet as { origin: string }).origin = "photo";
    expect(() => readRecipe(wrong)).toThrow("origine");
  });

  it("APP-008: une recette mal formée est refusée avec sa raison", () => {
    expect(() => readRecipe(null)).toThrow("regions");
    expect(() => readRecipe({ regions: { ailleurs: {} } })).toThrow("ailleurs");
    expect(() => readRecipe({ regions: { ailleurs: 3 } })).toThrow("entrée");
    const bad = raw();
    (bad.regions.golfe.palette as { value: unknown }).value = { ground: -1, road: 2, buildings: [] };
    expect(() => readRecipe(bad)).toThrow("valeur invalide");
    const notElement = raw();
    (notElement.regions as Record<string, unknown>).golfe = { palette: 5 };
    expect(() => readRecipe(notElement)).toThrow("élément");
    const badRegion = raw();
    (badRegion.districts.ancien as { region: unknown }).region = 4;
    expect(() => readRecipe(badRegion)).toThrow("région invalide");
    const noName = raw();
    (noName.regions.ailleurs.facadeSet as { value: unknown }).value = "";
    expect(() => readRecipe(noName)).toThrow("valeur invalide");
    expect(() => readRecipe({ regions: raw().regions, districts: { x: 1 } })).toThrow("entrée");
    expect(readRecipe({ regions: raw().regions }).districts).toEqual({});
  });
});

describe("recette des régions existantes migrée", () => {
  it("APP-008/APP-013: le fichier livré décrit golfe et inde, repli « ailleurs », aucun élément présenté comme relevé", () => {
    expect(paletteOf([51.53, 25.29]).ground).toBe(0xa8916b);
    expect(paletteOf([73.85, 18.52]).road).toBe(0x4f4a45);
    expect(paletteOf([-70, -33]).ground).toBe(0x8a8a84);
    expect(paletteOf([5.4, 43.5])).toEqual(paletteOf([-70, -33]));
    const all = [...Object.values(RECIPE.regions), ...Object.values(RECIPE.districts)].flatMap((e) => [e.palette, e.facadeSet]);
    expect(all.filter((e) => e !== undefined).every((e) => e.origin === "regle")).toBe(true);
  });

  it("APP-008: une région sans jeu propre garde le jeu de base, les cinq autres le leur", () => {
    expect(palettesOf("provence")).toBe(PALETTES);
    expect(OWN.every((r) => palettesOf(r) !== PALETTES)).toBe(true);
  });

  it("APP-008: les jeux utilisés se lisent des régions et des quartiers, une entrée sans jeu n'en nomme aucun", () => {
    expect(usedSetsOf(readRecipe(raw())).sort()).toEqual(["base", "souq", "x"]);
  });

  it("APP-008: un jeu de façade mal formé ou nommé sans exister est refusé avec sa raison", () => {
    const detail = { trim: 1, glass: 2, accent: 3, shutters: [4], doors: [5] };
    const set = Object.fromEntries(["provencale", "village", "ancien", "recent"].map((f) => [f, [detail, detail, detail]]));
    expect(Object.keys(readFacadeSets({ base: set }, ["base"]))).toEqual(["base"]);
    expect(() => readFacadeSets({}, [])).toThrow("base");
    expect(() => readFacadeSets({ base: set }, ["golfe"])).toThrow("inconnu");
    expect(() => readFacadeSets({ base: { ...set, recent: [detail] } }, [])).toThrow("3 palettes");
    expect(() => readFacadeSets({ base: { ...set, recent: [detail, detail, { ...detail, trim: -1 }] } }, [])).toThrow("illisible");
    expect(() => readFacadeSets({ base: { ...set, recent: [detail, detail, { ...detail, doors: [] }] } }, [])).toThrow("illisible");
    expect(() => readFacadeSets({ base: set, golfe: 3 }, [])).toThrow("golfe.provencale");
  });
});
