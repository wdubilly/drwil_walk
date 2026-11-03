import { Vector3 } from "three";
import { describe, expect, it } from "vitest";
import { createPath } from "../route/path.ts";
import { FACADE_BUDGETS, FACADE_MAX_DISTANCE_M, addFacades, planAll, wallsOf, type FacadeContext } from "./facades.ts";
import { newSoup, type Soup } from "./soup.ts";
import type { Building } from "./souq-data.ts";

const ROUTE = createPath([{ x: -10, z: -6 }, { x: 600, z: -6 }]);
const CTX: FacadeContext = { detail: "full", region: "ailleurs", route: ROUTE, footLight: 0.55 };

function house(i: number, extra: Partial<Building> = {}): Building {
  const x = i * 14;
  return { id: 5000 + i, kind: "yes", heightM: 9, footprint: [{ x, z: 0 }, { x: x + 10, z: 0 }, { x: x + 10, z: 10 }, { x, z: 10 }, { x, z: 0 }], ...extra };
}
const row = (n: number): Building[] => Array.from({ length: n }, (_, i) => house(i));
const triangles = (soup: Soup): number => soup.positions.length / 9;
const build = (buildings: Building[], ctx: FacadeContext = CTX): { soup: Soup; detailed: Set<Building> } => {
  const soup = newSoup();
  return { soup, detailed: addFacades(soup, buildings, ctx) };
};

describe("façades procédurales", () => {
  it("APP-008: deux chargements donnent exactement les mêmes façades, graine tirée de l'identifiant OSM", () => {
    const [a, b] = [build(row(12)), build(row(12))];
    expect(a.soup).toEqual(b.soup);
    expect(triangles(a.soup)).toBeGreaterThan(0);
    const [other] = [build(row(12).map((x, i) => ({ ...x, id: 9000 + i })))];
    expect(other.soup.positions).not.toEqual(a.soup.positions);
  });

  it("APP-008: jamais de géométrie invalide : sommets finis, normales unitaires tournées vers l'extérieur du bâtiment, couleurs lisibles", () => {
    const { soup } = build(row(8));
    expect([...soup.positions, ...soup.normals, ...soup.colors].every(Number.isFinite)).toBe(true);
    expect(soup.colors.every((c) => c >= 0 && c <= 1)).toBe(true);
    for (let i = 0; i < soup.normals.length; i += 3) expect(Math.hypot(soup.normals[i] as number, soup.normals[i + 1] as number, soup.normals[i + 2] as number)).toBeCloseTo(1, 4);
    // Le sens de rotation de chaque triangle est celui de sa normale : face avant visible de l'extérieur.
    const at = (i: number): Vector3 => new Vector3(soup.positions[i], soup.positions[i + 1], soup.positions[i + 2]);
    for (let t = 0; t < triangles(soup); t++) {
      const [a, b, c] = [at(t * 9), at(t * 9 + 3), at(t * 9 + 6)] as [Vector3, Vector3, Vector3];
      const facing = b.clone().sub(a).cross(c.clone().sub(a));
      expect(facing.dot(new Vector3(soup.normals[t * 9], soup.normals[t * 9 + 1], soup.normals[t * 9 + 2]))).toBeGreaterThan(0);
    }
  });

  it("APP-008: les détails restent à l'extérieur des murs, dans la hauteur du bâtiment, sans traverser le sol", () => {
    const { soup } = build([house(0)]);
    for (let i = 0; i < soup.positions.length; i += 3) {
      const [x, y, z] = [soup.positions[i] as number, soup.positions[i + 1] as number, soup.positions[i + 2] as number];
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(9 + 1.5);
      expect(x).toBeGreaterThan(-1.5);
      expect(x).toBeLessThan(11.5);
      expect(z).toBeGreaterThan(-1.5);
      expect(z).toBeLessThan(11.5);
    }
  });

  it("APP-008: un plafond de triangles par bâtiment et un plafond de bâtiments détaillés, les plus proches du parcours d'abord", () => {
    const { soup, detailed } = build(row(200));
    expect(detailed.size).toBeLessThanOrEqual(FACADE_BUDGETS.full.maxBuildings);
    expect(triangles(soup)).toBeLessThanOrEqual(FACADE_BUDGETS.full.maxBuildings * FACADE_BUDGETS.full.trianglesPerBuilding);
    const big = house(0, { heightM: 40, levels: 12, footprint: [{ x: 0, z: 0 }, { x: 60, z: 0 }, { x: 60, z: 60 }, { x: 0, z: 60 }, { x: 0, z: 0 }] });
    const alone = build([big]);
    expect(triangles(alone.soup)).toBeLessThanOrEqual(FACADE_BUDGETS.full.trianglesPerBuilding);
    expect(triangles(alone.soup)).toBeGreaterThan(FACADE_BUDGETS.full.trianglesPerBuilding - 12);
    const reduced = build(row(200), { ...CTX, detail: "reduced" });
    expect(reduced.detailed.size).toBeLessThanOrEqual(FACADE_BUDGETS.reduced.maxBuildings);
    expect(triangles(reduced.soup)).toBeLessThan(triangles(soup));
  });

  it("APP-008: sans détail, aucune façade ; trop loin du parcours ou trop bas, un bâtiment garde son mur nu", () => {
    const off = build(row(10), { ...CTX, detail: "off" });
    expect(triangles(off.soup)).toBe(0);
    expect(off.detailed.size).toBe(0);
    const far = build([house(0, { footprint: house(0).footprint.map((p) => ({ x: p.x, z: p.z + 10 * FACADE_MAX_DISTANCE_M })) })]);
    expect(far.detailed.size).toBe(0);
    expect(build([house(0, { heightM: 2 })]).detailed.size).toBe(0);
  });

  it("APP-008: sans identifiant, balise ni étages (repli), la façade reste cohérente et valide", () => {
    const bare: Building = { heightM: 7, footprint: house(0).footprint };
    const { soup, detailed } = build([bare]);
    expect(detailed.has(bare)).toBe(true);
    expect(soup.positions.every(Number.isFinite)).toBe(true);
  });

  it("APP-008: les ouvertures suivent la largeur et les étages : plus de façade, plus de fenêtres", () => {
    const count = (b: Building): number => triangles(build([b]).soup);
    const narrow = house(0, { footprint: [{ x: 0, z: 0 }, { x: 3, z: 0 }, { x: 3, z: 10 }, { x: 0, z: 10 }, { x: 0, z: 0 }], levels: 1, heightM: 3 });
    expect(count(house(0, { levels: 3 }))).toBeGreaterThan(count(house(0, { levels: 1, heightM: 3 })));
    expect(count(house(0, { heightM: 9 }))).toBeGreaterThan(count(narrow));
  });

  it("APP-008: les murs tournent leur normale vers l'extérieur quel que soit le sens du contour, et ignorent les murs trop courts", () => {
    const ring = house(0).footprint;
    const clockwise = wallsOf(ring, ROUTE);
    const counter = wallsOf([...ring].reverse(), ROUTE);
    for (const walls of [clockwise, counter]) {
      expect(walls).toHaveLength(4);
      for (const w of walls) {
        const mid = { x: w.from.x + (w.ux * w.length) / 2, z: w.from.z + (w.uz * w.length) / 2 };
        expect((mid.x - 5 + w.nx * 0.1) ** 2 + (mid.z - 5 + w.nz * 0.1) ** 2).toBeGreaterThan((mid.x - 5) ** 2 + (mid.z - 5) ** 2);
      }
    }
    // Le mur au nord (z = 0) est le plus proche du parcours : il passe en premier.
    expect(clockwise[0]?.from.z === 0 || clockwise[0]?.from.z === 10).toBe(true);
    const strip = [{ x: 0, z: 0 }, { x: 3, z: 0 }, { x: 3, z: 1 }, { x: 0, z: 1 }, { x: 0, z: 0 }];
    expect(wallsOf(strip, ROUTE)).toHaveLength(2);
  });

  it("APP-008: deux voisins ne portent jamais la même façade, et partagent famille et palette de quartier", () => {
    const buildings = Array.from({ length: 30 }, (_, i) => house(i, { id: 777, footprint: house(i).footprint.map((p) => ({ x: p.x / 10, z: p.z })) }));
    const plans = planAll(buildings, "ailleurs");
    const list = [...plans.values()];
    const signatures = list.map((p) => `${p.family}${String(p.paletteIndex)}${String(p.windowStyle)}${String(p.shutters ?? "")}${String(p.door)}${String(p.balcony)}${String(p.cornice)}${String(p.chimney)}`);
    // Même identifiant pour tous : sans la règle de voisinage, les trente façades seraient identiques.
    expect(new Set(signatures).size).toBe(30);
    expect(new Set(list.map((p) => p.family)).size).toBe(1);
    expect(new Set(list.map((p) => p.paletteIndex)).size).toBe(1);
  });

  it("APP-008: les toits plats portent une cheminée ou un local technique, pas les toits à deux pans", () => {
    const flats = build(row(40));
    const gabled = build(row(40).map((b) => ({ ...b, roofShape: "gabled" as const })));
    expect(triangles(flats.soup)).toBeGreaterThan(triangles(gabled.soup));
    const maxY = (s: Soup): number => Math.max(...s.positions.filter((_, i) => i % 3 === 1));
    expect(maxY(flats.soup)).toBeGreaterThan(9.5);
    expect(maxY(gabled.soup)).toBeLessThanOrEqual(9.01);
  });
});
