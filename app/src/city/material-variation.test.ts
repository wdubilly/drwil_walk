import { describe, expect, it } from "vitest";
import type { FamilyId } from "./facade-family.ts";
import { MAIN_MATERIAL_SHARE, SCALE_RANGE, WEAR_RANGE, pickAll, pickMaterial } from "./material-variation.ts";
import { materialEntry, testLibrary } from "./material-double.ts";
import type { Building } from "./souq-data.ts";

function house(i: number, extra: Partial<Building> = {}): Building {
  const x = i * 14;
  return { id: 7000 + i, heightM: 9, footprint: [{ x, z: 0 }, { x: x + 10, z: 0 }, { x: x + 10, z: 10 }, { x, z: 10 }, { x, z: 0 }], ...extra };
}
const plans = (n: number, family: FamilyId = "ancien") => new Map(Array.from({ length: n }, (_, i) => [house(i), { family }] as const));

describe("variation des matériaux locaux d'un bâtiment à l'autre", () => {
  it("APP-012: deux chargements donnent exactement les mêmes matériaux, tirés de l'identifiant OSM", () => {
    const library = testLibrary();
    const a = [...pickAll(plans(30), library).values()];
    expect([...pickAll(plans(30), library).values()]).toEqual(a);
    const other = [...pickAll(new Map([...plans(30)].map(([b, p]) => [{ ...b, id: (b.id as number) + 500 }, p])), library).values()];
    expect(other).not.toEqual(a);
  });

  it("APP-012: le matériau suit la famille de la façade, le premier le plus fréquent", () => {
    const library = testLibrary();
    expect(new Set([...pickAll(plans(40, "village"), library).values()].map((p) => p.material.id))).toEqual(new Set(["bois"]));
    const ids = Array.from({ length: 400 }, (_, i) => pickMaterial(house(i), { family: "ancien" }, library).material.id);
    const share = ids.filter((id) => id === "enduit").length / ids.length;
    expect(share).toBeGreaterThan(MAIN_MATERIAL_SHARE - 0.1);
    expect(share).toBeLessThan(MAIN_MATERIAL_SHARE + 0.1);
  });

  it("APP-012: teinte, échelle, décalage et usure varient dans leurs bornes", () => {
    const library = testLibrary();
    const picks = Array.from({ length: 200 }, (_, i) => pickMaterial(house(i), { family: "ancien" }, library));
    for (const p of picks) {
      expect(p.material.tints).toContain(p.tint);
      expect(p.sizeM).toBeGreaterThanOrEqual(p.material.sizeM * SCALE_RANGE[0]);
      expect(p.sizeM).toBeLessThanOrEqual(p.material.sizeM * SCALE_RANGE[1]);
      expect(p.wear).toBeGreaterThanOrEqual(WEAR_RANGE[0]);
      expect(p.wear).toBeLessThanOrEqual(WEAR_RANGE[1]);
      for (const o of p.offset) expect(o).toBeGreaterThanOrEqual(0);
    }
    expect(new Set(picks.map((p) => p.tint)).size).toBe(2);
    expect(new Set(picks.map((p) => p.sizeM.toFixed(2))).size).toBeGreaterThan(20);
  });

  it("APP-012: deux voisins ne portent jamais le même matériau dans la même teinte quand la bibliothèque le permet", () => {
    const library = testLibrary();
    // Quatre bâtiments serrés (une même case de 40 m) : deux matériaux × deux teintes, quatre combinaisons, toutes prises.
    const close = new Map(Array.from({ length: 4 }, (_, i) => [house(0, { id: 100 + i, footprint: [{ x: i, z: 0 }, { x: i + 10, z: 0 }, { x: i + 10, z: 10 }, { x: i, z: 0 }] }), { family: "ancien" }] as const));
    const signatures = [...pickAll(close, library).values()].map((p) => `${p.material.id}:${String(p.tint)}`);
    expect(new Set(signatures).size).toBe(4);
    // Un cinquième n'a plus de combinaison libre : il en garde une, sans boucle sans fin.
    const five = new Map([...close, [house(0, { id: 999 }), { family: "ancien" as const }]]);
    expect(pickAll(five, library).size).toBe(5);
    // Une famille d'un seul matériau, une seule teinte : la répétition est inévitable, et acceptée.
    const single = testLibrary({ materials: [{ ...materialEntry("enduit"), tints: ["#c99a6b"] }], families: { ancien: ["enduit"], village: ["enduit"], recent: ["enduit"], provencale: ["enduit"] } });
    expect(new Set([...pickAll(close, single).values()].map((p) => p.tint)).size).toBe(1);
  });
});
