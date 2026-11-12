import { describe, expect, it } from "vitest";
import { addRoofBox, addWall, type Draw, type Wall } from "./facade-parts.ts";
import { planFacade, type FacadePlan } from "./facade-plan.ts";
import { newSoup } from "./soup.ts";
import type { Building } from "./souq-data.ts";

const WALL: Wall = { from: { x: 0, z: 0 }, length: 12, ux: 1, uz: 0, nx: 0, nz: -1 };
const building = (kind: string): Building => ({ id: 31, kind, heightM: 9, footprint: [{ x: 0, z: 0 }, { x: 12, z: 0 }, { x: 12, z: 9 }, { x: 0, z: 0 }] });
const draw = (plan: FacadePlan, left: number): Draw => ({ soup: newSoup(), plan, heightM: 9, left, light: () => 1 });
const triangles = (d: Draw): number => d.soup.positions.length / 9;

/** Un plan complet : volets, balcons, corniche large, commerce. */
const full = (): FacadePlan => ({ ...planFacade(building("house"), "ailleurs", 0), floors: 3, floorM: 3, windowStyle: 1, balcony: 2, cornice: 2, shop: false, shutters: 0x336699 });

describe("éléments d'une façade", () => {
  it("APP-008: un mur reçoit corniche, porte, fenêtres, volets et balcons, et chaque élément est complet", () => {
    const d = draw(full(), 10_000);
    addWall(d, WALL, true);
    // Corniche large (6 + bandeau 2) + porte (4) + fenêtres, volets et balcons.
    expect(triangles(d)).toBeGreaterThan(100);
    expect(10_000 - d.left).toBe(triangles(d));
  });

  it("APP-008: le plafond de triangles n'est jamais dépassé : un élément qui ne tient plus n'est pas dessiné à moitié", () => {
    for (let left = 0; left <= 140; left += 1) {
      const d = draw(full(), left);
      addWall(d, WALL, true);
      expect(triangles(d)).toBeLessThanOrEqual(left);
      expect(d.left).toBeGreaterThanOrEqual(0);
      expect(triangles(d) % 2).toBe(0);
    }
  });

  it("APP-008: les vitrines remplacent les fenêtres du rez-de-chaussée d'un commerce, sans volets", () => {
    const shop = { ...full(), shop: true };
    const [withShop, without] = [draw(shop, 10_000), draw(full(), 10_000)];
    addWall(withShop, WALL, false);
    addWall(without, WALL, false);
    expect(triangles(withShop)).toBeLessThan(triangles(without));
    expect(triangles(withShop)).toBeGreaterThan(0);
  });

  it("APP-008: chaque auvent de boutique ajoute des triangles entiers, à la largeur d'entrée de la région, et rien sans plafond", () => {
    const counts = (["none", "flat", "striped", "arcade"] as const).map((awning) => {
      const d = draw({ ...full(), shop: true, awning, entryM: 1.6, floors: 1, floorM: 3.2, cornice: 0 }, 10_000);
      addWall(d, WALL, false);
      return triangles(d);
    });
    expect(counts[1]).toBeGreaterThan(counts[0] as number);
    expect(counts[2]).toBeGreaterThan(counts[0] as number);
    expect(counts[3]).toBeGreaterThan(counts[1] as number);
    const tight = draw({ ...full(), shop: true, awning: "arcade", floors: 1, floorM: 3.2, cornice: 0 }, 7);
    addWall(tight, WALL, false);
    expect(triangles(tight)).toBeLessThanOrEqual(7);
    const low = draw({ ...full(), shop: true, awning: "flat", floors: 1, floorM: 2.6, cornice: 0 }, 10_000);
    const lowNone = draw({ ...full(), shop: true, awning: "none", floors: 1, floorM: 2.6, cornice: 0 }, 10_000);
    addWall(low, WALL, false);
    addWall(lowNone, WALL, false);
    expect(triangles(low)).toBe(triangles(lowNone));
    const wide = draw({ ...full(), shop: true, awning: "none", entryM: 2, floors: 1, cornice: 0 }, 10_000);
    const narrow = draw({ ...full(), shop: true, awning: "none", entryM: 0.8, floors: 1, cornice: 0 }, 10_000);
    addWall(wide, WALL, true);
    addWall(narrow, WALL, true);
    expect(Math.max(...wide.soup.positions)).toBeGreaterThanOrEqual(0);
    expect(wide.soup.positions).not.toEqual(narrow.soup.positions);
  });

  it("APP-008: pas de balcon sur un seul étage ni de volets sur une façade récente ; un mur étroit garde sa travée", () => {
    const flat = draw({ ...full(), floors: 1, floorM: 3, balcony: 2, shutters: undefined, cornice: 0 }, 10_000);
    addWall(flat, WALL, false);
    const balcony = draw({ ...full(), floors: 2, shutters: undefined, cornice: 0, balcony: 1 }, 10_000);
    addWall(balcony, WALL, false);
    expect(triangles(balcony)).toBeGreaterThan(triangles(flat) * 2 - 1);
    const narrow = draw({ ...full(), cornice: 0 }, 10_000);
    addWall(narrow, { ...WALL, length: 2.6 }, true);
    expect(triangles(narrow)).toBeGreaterThan(0);
  });

  it("APP-008: un volume de toit se dessine entier ou pas du tout", () => {
    const [ok, none] = [draw(full(), 10), draw(full(), 9)];
    addRoofBox(ok, { x: 3, z: 3 }, 1, 1.2, 0x888888);
    addRoofBox(none, { x: 3, z: 3 }, 1, 1.2, 0x888888);
    expect(triangles(ok)).toBe(10);
    expect(triangles(none)).toBe(0);
  });
});
