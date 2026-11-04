import { describe, expect, it } from "vitest";
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
