import { describe, expect, it } from "vitest";
import { familyFor, neighbourhoodOf, paletteIndexOf, regionOf, type FamilyId } from "./facade-family.ts";
import { PALETTES_PER_FAMILY } from "./facade-palettes.ts";
import type { Building } from "./souq-data.ts";

const house = (x: number, z: number, kind?: string): Building => ({ ...(kind ? { kind } : {}), heightM: 6, footprint: [{ x, z }, { x: x + 4, z }, { x: x + 4, z: z + 4 }, { x, z }] });

describe("familles de façades", () => {
  it("APP-008: la région se lit de la position de l'itinéraire, au-delà de la seule Provence", () => {
    expect(regionOf([5.4, 43.5])).toBe("provence");
    expect(regionOf([7.26, 43.7])).toBe("provence");
    expect(regionOf([12.49, 41.9])).toBe("italie");
    expect(regionOf([44.51, 40.18])).toBe("caucase");
    expect(regionOf([2.35, 48.85])).toBe("france-nord");
    expect(regionOf([73.856, 18.516])).toBe("inde");
    expect(regionOf([51.533, 25.287])).toBe("golfe");
  });

  it("APP-008: une origine hors de toute région connue retombe sur « ailleurs »", () => {
    for (const origin of [[139.69, 35.69], [-74, 40.7], [4.83, 45.76], [0, 0]] as const) expect(regionOf(origin)).toBe("ailleurs");
  });

  it("APP-008: la famille provençale n'est choisie qu'en Provence, jamais à Pune ni à Doha", () => {
    const grid = Array.from({ length: 400 }, (_, i) => house((i % 20) * 70, Math.floor(i / 20) * 70, ["house", "yes", "residential", undefined][i % 4]));
    const outside = new Set(grid.map((b) => familyFor(b, 2, "ailleurs")));
    const inside = new Set(grid.map((b) => familyFor(b, 2, "provence")));
    expect(outside.has("provencale")).toBe(false);
    expect(inside.has("provencale")).toBe(true);
  });

  it("APP-008: la balise, la hauteur et le quartier décident la famille", () => {
    const kinds: [string | undefined, number, FamilyId[]][] = [
      ["apartments", 3, ["recent"]],
      ["house", 20, ["recent"]],
      ["mosque", 2, ["ancien"]],
      ["house", 2, ["village", "provencale"]],
      ["yes", 2, ["ancien", "village", "recent", "provencale"]],
    ];
    for (const [kind, floors, allowed] of kinds) expect(allowed).toContain(familyFor(house(5, 5, kind), floors, "provence"));
    const found = new Set(Array.from({ length: 200 }, (_, i) => familyFor(house(i * 61, 0), 2, "ailleurs")));
    expect(found).toEqual(new Set(["ancien", "village", "recent"]));
  });

  it("APP-008: deux bâtiments d'un même quartier partagent famille et palette, un autre quartier peut changer", () => {
    const [a, b] = [house(10, 10), house(40, 30)];
    expect(neighbourhoodOf(a)).toBe(neighbourhoodOf(b));
    expect(familyFor(a, 2, "ailleurs")).toBe(familyFor(b, 2, "ailleurs"));
    expect(paletteIndexOf(a)).toBe(paletteIndexOf(b));
    const palettes = new Set(Array.from({ length: 60 }, (_, i) => paletteIndexOf(house(i * 61, 0))));
    expect(palettes.size).toBe(PALETTES_PER_FAMILY);
  });
});
