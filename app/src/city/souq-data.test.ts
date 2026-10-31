import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { OSM_ATTRIBUTION } from "./licence.ts";
import { loadSouq, souqData } from "./souq-data.ts";

const read = (name: string): unknown => JSON.parse(readFileSync(new URL(`../../data/${name}`, import.meta.url), "utf8"));
const extractFile = read("souq-waqif.json") as {
  attribution: string;
  features: { properties: { kind: string }; geometry: { coordinates: number[][][] | number[][] } }[];
};
const loopFile = read("souq-waqif-boucle.json") as { geometry: { coordinates: number[][] } };

describe("données du souk", () => {
  it("APP-003: les bâtiments sont ceux de l'extrait OpenStreetMap versionné", () => {
    const inFile = extractFile.features.filter((f) => f.properties.kind === "building");
    const { buildings } = souqData();
    expect(inFile.length).toBeGreaterThan(100);
    expect(buildings).toHaveLength(inFile.length);
    expect(buildings.every((b) => b.footprint.length >= 4 && b.heightM > 0)).toBe(true);
  });

  it("APP-003: l'extrait porte la mention d'attribution de la licence ODbL", () => {
    expect(extractFile.attribution).toContain(OSM_ATTRIBUTION);
    expect(OSM_ATTRIBUTION).toBe("© contributeurs OpenStreetMap");
  });

  it("APP-002: la boucle du souk fait environ 1,5 km et revient à son départ", () => {
    const { route } = souqData();
    expect(route.lengthM).toBeGreaterThan(1200);
    expect(route.lengthM).toBeLessThan(1800);
    expect(route.points[0]).toEqual({ x: 0, z: -0 });
    const last = route.points[route.points.length - 1];
    expect(last?.x).toBeCloseTo(0);
    expect(last?.z).toBeCloseTo(0);
    const coordinates = loopFile.geometry.coordinates;
    expect(coordinates[0]).toEqual(coordinates[coordinates.length - 1]);
  });

  it("APP-002: le tracé suit les voies de l'extrait : chaque point est un sommet d'une voie OpenStreetMap", () => {
    const vertices = new Set(
      extractFile.features
        .filter((f) => f.properties.kind === "highway")
        .flatMap((f) => (f.geometry.coordinates as number[][]).map((p) => p.join(","))),
    );
    const missing = loopFile.geometry.coordinates.filter((p) => !vertices.has(p.join(",")));
    expect(missing).toEqual([]);
  });

  it("lit n'importe quel couple extrait / boucle", () => {
    const souq = loadSouq(
      {
        features: [
          { properties: { kind: "highway" }, geometry: { coordinates: [] } },
          {
            properties: { kind: "building", heightM: 9 },
            geometry: {
              coordinates: [
                [
                  [51.5, 25.3],
                  [51.501, 25.3],
                  [51.501, 25.301],
                  [51.5, 25.3],
                ],
              ],
            },
          },
        ],
      },
      {
        geometry: {
          coordinates: [
            [51.5, 25.3],
            [51.5, 25.301],
          ],
        },
      },
    );
    expect(souq.buildings).toHaveLength(1);
    expect(souq.buildings[0]?.heightM).toBe(9);
    expect(souq.route.lengthM).toBeCloseTo(111.2, 0);
  });
});
