import { readFileSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { cityFor } from "./cities.ts";
import { buildBuildingsGeometry } from "./buildings.ts";
import { regionOf } from "./facade-family.ts";
import { FACADE_BUDGETS } from "./facades.ts";
import { planAll } from "./facades.ts";
import { closest } from "./near-route.ts";
import type { Vec2 } from "../route/geo.ts";

const ITINERARIES = [
  { id: "doha-souq-waqif", file: "souq-waqif.json" },
  { id: "pune-vieille-ville", file: "pune-vieille-ville.json" },
  { id: "doha-corniche", file: "doha-corniche.json" },
  { id: "pune-fc-road", file: "pune-fc-road.json" },
];
const MAX_EXTRACT_BYTES = 1_500_000;
const read = (file: string): { features: { id: number; properties: { kind: string; building?: string; levels?: number } }[] } =>
  JSON.parse(readFileSync(new URL(`../../data/${file}`, import.meta.url), "utf8")) as ReturnType<typeof read>;

describe("façades des quatre itinéraires", () => {
  for (const { id, file } of ITINERARIES) {
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
      expect(region).toBe("ailleurs");
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
  }
});
