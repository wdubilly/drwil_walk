import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CITIES, loopFileOf } from "../../scripts/cities.ts";
import { graphOf, loopOf, loopText, mainNetwork, shortestPath, snap } from "../../scripts/route-loop.ts";
import { distanceM, type LonLat } from "../route/geo.ts";

type Extract = Parameters<typeof loopOf>[0];
const at = (x: number, y: number): number[] => [10 + x * 0.001, 50 + y * 0.001];
const way = (highway: string | undefined, ...coordinates: number[][]) => ({
  properties: { kind: "highway", ...(highway ? { highway } : {}) },
  geometry: { type: "LineString", coordinates },
});
const isolated = way("residential", at(100, 100), at(101, 100));
// Un carré de 220 m de côté ; la voie rapide en diagonale est ignorée ; un détour par un cheminement piéton coûte moins que la voie directe.
const square = [
  way("residential", at(0, 0), at(2, 0)),
  way("residential", at(2, 0), at(2, 2)),
  way("residential", at(2, 2), at(0, 2)),
  way("residential", at(0, 2), at(0, 0)),
  way("motorway", at(0, 0), at(2, 2)),
  { properties: { kind: "building" }, geometry: { type: "Polygon", coordinates: [] } },
  { properties: { kind: "highway", highway: "pedestrian" }, geometry: { type: "Polygon", coordinates: [] } },
  way(undefined, at(0, 2), at(1, 3)),
];
const extract = (...features: unknown[]): Extract => ({ features }) as Extract;
const length = (loop: readonly LonLat[]): number => loop.slice(1).reduce((s, p, i) => s + distanceM(loop[i] as LonLat, p), 0);

describe("tracé de boucle d'une ville (hors casque)", () => {
  it("APP-002: ne garde du graphe que les voies marchables, les cheminements piétons coûtant moins", () => {
    const graph = graphOf(extract(...square, way("footway", at(5, 5), at(6, 5)), way("residential", at(7, 5), at(8, 5))));
    expect(graph.has(at(0, 0).join(","))).toBe(true);
    expect(graph.get(at(0, 0).join(","))?.map((e) => e.to)).toEqual([at(2, 0).join(","), at(0, 2).join(",")]);
    const foot = graph.get(at(5, 5).join(","))?.[0]?.cost as number;
    const road = graph.get(at(7, 5).join(","))?.[0]?.cost as number;
    expect(foot / road).toBeCloseTo(0.8, 2);
  });

  it("APP-002: ramène un point posé hors du réseau au sommet le plus proche du plus grand réseau relié", () => {
    for (const features of [[isolated, ...square], [...square, isolated]]) {
      const network = mainNetwork(graphOf(extract(...features)));
      expect(network.has(at(100, 100).join(","))).toBe(false);
      expect(snap(network, [10.0001, 50.0001])).toBe(at(0, 0).join(","));
    }
    expect(() => snap(new Set(), [10, 50])).toThrow("aucune voie marchable");
  });

  it("APP-002: trouve le plus court chemin, préfère un détour piéton à la voie directe, refuse un point sans chemin", () => {
    const graph = graphOf(extract(
      way("residential", at(0, 0), at(2, 0)), way("footway", at(0, 0), at(1, 0.01), at(2, 0)), way("residential", at(2, 0), at(3, 0)), way("residential", at(8, 8), at(9, 8)),
    ));
    const path = shortestPath(graph, at(0, 0).join(","), at(3, 0).join(","));
    expect(path).toHaveLength(4);
    expect(path).toContain(at(1, 0.01).join(","));
    expect(() => shortestPath(graph, at(0, 0).join(","), at(8, 8).join(","))).toThrow("aucun chemin");
  });

  it("APP-002: un aller-retour revient par le même chemin, une boucle par un autre quand il existe", () => {
    const base = extract(...square);
    const out = loopOf(base, [[50.0, 10.0], [50.0, 10.002]], "aller-retour");
    expect(out).toEqual([...out.slice(0, (out.length + 1) / 2), ...out.slice(0, (out.length - 1) / 2).reverse()]);
    const loop = loopOf(base, [[50.0, 10.0], [50.002, 10.002]], "boucle");
    expect(loop[0]).toEqual(loop[loop.length - 1]);
    expect(new Set(loop.map((p) => p.join(","))).size).toBe(loop.length - 1);
    expect(length(loop)).toBeCloseTo(2 * (distanceM(at(0, 0) as unknown as LonLat, at(2, 0) as unknown as LonLat) + distanceM(at(0, 0) as unknown as LonLat, at(0, 2) as unknown as LonLat)), -1);
  });

  it("APP-002: un tracé demande un départ et une arrivée", () => {
    expect(() => loopOf(extract(...square), [[50, 10]], "boucle")).toThrow("au moins un départ et une arrivée");
  });

  it("APP-003: écrit le fichier de boucle avec son attribution OpenStreetMap et ses points", () => {
    const loop = loopOf(extract(...square), [[50, 10], [50, 10.002]], "aller-retour");
    const file = JSON.parse(loopText("Essai", [[50, 10], [50, 10.002]], "aller-retour", "data/essai.json", loop)) as { properties: { description: string; attribution: string }; geometry: { coordinates: LonLat[] } };
    expect(file.properties.attribution).toBe("© contributeurs OpenStreetMap, licence ODbL");
    expect(file.properties.description).toContain("retour par le même chemin");
    expect(loopText("E", [[50, 10], [50, 10.002]], "boucle", "x.json", loop)).toContain("évite l'aller");
    expect(file.geometry.coordinates).toEqual(loop);
  });

  describe("les quatre itinéraires existants, rejoués depuis leurs entrées de data/villes.json", () => {
    const read = (path: string): { features: Extract["features"]; geometry: { coordinates: number[][] } } => JSON.parse(readFileSync(new URL(`../../${path}`, import.meta.url), "utf8")) as never;
    // Les bornes de longueur sont celles des tests de chaque boucle versionnée (cities.test.ts).
    const bounds: Record<string, [number, number]> = { souq: [1200, 1800], pune: [1200, 1800], corniche: [3500, 4500], "fc-road": [3000, 4000] };
    it.each(Object.entries(CITIES))("APP-002: %s — une boucle qui part et revient au départ, sur des sommets de voies de l'extrait", (key, city) => {
      const file = read(city.file);
      const loop = loopOf(file, city.route.points, city.route.return);
      const vertices = new Set(file.features.flatMap((f) => (f.properties.kind === "highway" ? (f.geometry.coordinates).map((p) => p.join(",")) : [])));
      expect(loop.filter((p) => !vertices.has(p.join(",")))).toEqual([]);
      expect(loop[0]).toEqual(loop[loop.length - 1]);
      expect(length(loop)).toBeGreaterThan((bounds[key] as [number, number])[0]);
      expect(length(loop)).toBeLessThan((bounds[key] as [number, number])[1]);
      const kept = read(loopFileOf(city)).geometry.coordinates;
      expect(distanceM(loop[0] as LonLat, kept[0] as unknown as LonLat)).toBeLessThan(5);
    });
  });
});
