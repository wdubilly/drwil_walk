import { readFileSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { cityFor } from "./cities.ts";
import { buildBuildingsGeometry } from "./buildings.ts";
import { SHOP_KINDS, regionOf } from "./facade-family.ts";
import { palettesOf } from "./facade-palettes.ts";
import { FACADE_BUDGETS } from "./facades.ts";
import { planAll } from "./facades.ts";
import { closest } from "./near-route.ts";
import type { Vec2 } from "../route/geo.ts";

const ITINERARIES = [
  { id: "doha-souq-waqif", file: "souq-waqif.json", region: "golfe" },
  { id: "pune-vieille-ville", file: "pune-vieille-ville.json", region: "inde" },
  { id: "doha-corniche", file: "doha-corniche.json", region: "golfe" },
  { id: "pune-fc-road", file: "pune-fc-road.json", region: "inde" },
] as const;
const MAX_EXTRACT_BYTES = 1_500_000;
const read = (file: string): { features: { id: number; properties: { kind: string; building?: string; levels?: number } }[] } =>
  JSON.parse(readFileSync(new URL(`../../data/${file}`, import.meta.url), "utf8")) as ReturnType<typeof read>;

describe("façades des quatre itinéraires", () => {
  for (const { id, file, region: expected } of ITINERARIES) {
    it(`APP-008: ${id}, l'extrait garde identifiant, balise building et étages, sous le plafond de poids`, () => {
      const buildings = read(file).features.filter((f) => f.properties.kind === "building");
      expect(buildings.length).toBeGreaterThan(100);
      expect(buildings.every((f) => Number.isInteger(f.id) && f.id > 0 && typeof f.properties.building === "string")).toBe(true);
      expect(new Set(buildings.map((f) => f.id)).size).toBe(buildings.length);
      expect(buildings.some((f) => f.properties.levels !== undefined)).toBe(true);
      expect(statSync(new URL(`../../data/${file}`, import.meta.url)).size).toBeLessThan(MAX_EXTRACT_BYTES);
    });

    it(`APP-008: ${id}, des façades valides, identiques à chaque chargement, sous le plafond de triangles, sans famille provençale`, () => {
      const [first, second] = [cityFor(id), cityFor(id)];
      expect(first.buildings.every((b) => b.id !== undefined)).toBe(true);
      const region = regionOf(first.origin);
      expect(region).toBe(expected);
      const options = { detail: "full", region } as const;
      const a = buildBuildingsGeometry(first.buildings, first.palette.buildings, first.route, options);
      const b = buildBuildingsGeometry(second.buildings, second.palette.buildings, second.route, options);
      expect(Array.from(a.getAttribute("position").array)).toEqual(Array.from(b.getAttribute("position").array));
      const bare = buildBuildingsGeometry(first.buildings, first.palette.buildings, first.route);
      const added = (a.getAttribute("position").count - bare.getAttribute("position").count) / 3;
      expect(added).toBeGreaterThan(100);
      expect(Array.from(a.getAttribute("position").array).every(Number.isFinite)).toBe(true);
      const { maxBuildings, trianglesPerBuilding } = FACADE_BUDGETS.full;
      // Les façades, les toits à deux pans et les auvents : le plafond des façades est la part qui domine.
      expect(added).toBeLessThan(maxBuildings * trianglesPerBuilding + 300 * 12 + 80 * 8);
      const near = closest(first.buildings, first.route, maxBuildings, (x) => x.footprint[0] as Vec2);
      const families = new Set([...planAll(near, region).values()].map((p) => p.family));
      expect(families.has("provencale")).toBe(false);
      expect(families.size).toBeGreaterThan(1);
    });

    it(`APP-013: ${id}, chaque boutique des façades dit son origine : relevée dans les données ou ajoutée par la règle`, () => {
      const city = cityFor(id);
      const near = closest(city.buildings, city.route, FACADE_BUDGETS.full.maxBuildings, (x) => x.footprint[0] as Vec2);
      const plans = [...planAll(near, expected).entries()].filter(([, p]) => p.shop);
      expect(plans.length).toBeGreaterThan(5);
      for (const [b, plan] of plans) expect(plan.shopOrigin).toBe(b.usage !== undefined || SHOP_KINDS.has(b.kind ?? "") ? "releve" : "regle");
      expect([...planAll(near, expected).values()].filter((p) => !p.shop).every((p) => p.shopOrigin === undefined && p.awning === "none")).toBe(true);
    });

    it(`APP-008: ${id}, les boutiques et leurs auvents tiennent dans le plafond de triangles par bâtiment`, () => {
      const city = cityFor(id);
      const { trianglesPerBuilding } = FACADE_BUDGETS.full;
      for (const b of city.buildings.slice(0, 300)) {
        const one = buildBuildingsGeometry([b], city.palette.buildings, city.route, { detail: "full", region: expected });
        const bare = buildBuildingsGeometry([b], city.palette.buildings, city.route);
        expect((one.getAttribute("position").count - bare.getAttribute("position").count) / 3).toBeLessThanOrEqual(trianglesPerBuilding + 12 + 8);
      }
    });

    it(`APP-008: ${id}, les teintes et les boutiques de sa région restent dans le plafond de triangles des palettes de base`, () => {
      const city = cityFor(id);
      const own = buildBuildingsGeometry(city.buildings, city.palette.buildings, city.route, { detail: "full", region: expected });
      const base = buildBuildingsGeometry(city.buildings, city.palette.buildings, city.route, { detail: "full", region: "ailleurs" });
      const { maxBuildings, trianglesPerBuilding } = FACADE_BUDGETS.full;
      expect(Math.abs(own.getAttribute("position").count - base.getAttribute("position").count) / 3).toBeLessThanOrEqual(maxBuildings * trianglesPerBuilding);
      expect(Array.from(own.getAttribute("color").array)).not.toEqual(Array.from(base.getAttribute("color").array));
      const near = closest(city.buildings, city.route, FACADE_BUDGETS.full.maxBuildings, (x) => x.footprint[0] as Vec2);
      for (const plan of planAll(near, expected).values()) expect(palettesOf(expected)[plan.family]).toContain(plan.palette);
    });
  }
});

describe("façades de deux régions", () => {
  it("APP-008: Pune et Doha, de régions différentes, ne portent aucune palette de détails en commun", () => {
    const used = (id: string): Set<string> => {
      const city = cityFor(id);
      const near = closest(city.buildings, city.route, FACADE_BUDGETS.full.maxBuildings, (x) => x.footprint[0] as Vec2);
      return new Set([...planAll(near, regionOf(city.origin)).values()].map((p) => JSON.stringify(p.palette)));
    };
    const [pune, doha] = [used("pune-vieille-ville"), used("doha-souq-waqif")];
    expect(pune.size).toBeGreaterThan(1);
    expect([...pune].filter((p) => doha.has(p))).toEqual([]);
  });
});
