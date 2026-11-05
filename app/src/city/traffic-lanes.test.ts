import { describe, expect, it } from "vitest";
import bundled from "../../assets/figurants-catalogue.json" with { type: "json" };
import { footprintOf } from "./lamp-rule.ts";
import type { Building, Road } from "./souq-data.ts";
import { readCatalogue, regionSetting } from "./traffic-catalog.ts";
import { MIN_RUN_M, SAMPLE_M, clearRuns, type Lane, laneLengthOf, offsetLine, resample, roadLanes, trafficLanes } from "./traffic-lanes.ts";

const catalogue = readCatalogue(bundled);
const golfe = regionSetting(catalogue, "golfe");
const inde = regionSetting(catalogue, "inde");
const east = (highway: string, extra: Partial<Road> = {}): Road => ({ id: 42, highway, points: [{ x: 0, z: 0 }, { x: 100, z: 0 }], ...extra });
const box = (x0: number, z0: number, x1: number, z1: number): Building => ({ footprint: [{ x: x0, z: z0 }, { x: x1, z: z0 }, { x: x1, z: z1 }, { x: x0, z: z1 }], heightM: 9 });
const lieux = (road: Road): string[] => roadLanes(road, catalogue, golfe).map((l) => l.lieu);

describe("trajets des figurants", () => {
  it("APP-014: chaque lieu vient de sa classe de voie : chaussée, voie piétonne, trottoir ; jamais un passage piéton seul", () => {
    expect(lieux(east("residential"))).toEqual(["chaussee", "chaussee"]);
    expect(lieux(east("pedestrian"))).toEqual(["voie-pietonne"]);
    expect(lieux(east("footway"))).toEqual(["voie-pietonne"]);
    expect(lieux(east("footway", { footway: "sidewalk" }))).toEqual(["trottoir"]);
    expect(lieux(east("footway", { footway: "crossing" }))).toEqual([]);
    expect(lieux(east("steps"))).toEqual([]);
    expect(lieux(east("tertiary", { sidewalk: "both" }))).toEqual(["chaussee", "chaussee", "trottoir", "trottoir"]);
    const sides = (sidewalk: "left" | "right"): number => (roadLanes(east("tertiary", { sidewalk }), catalogue, golfe)[2]?.points[0]?.z as number);
    expect(sides("right")).toBeGreaterThan(0);
    expect(sides("left")).toBeLessThan(0);
    expect(roadLanes(east("tertiary", { sidewalk: "both" }), catalogue, golfe).filter((l) => l.lieu === "trottoir").every((l) => l.bothWays)).toBe(true);
  });

  it("APP-014: un sens unique roule dans le sens du tracé, à rebours pour -1, et compte ses voies", () => {
    const [forward] = roadLanes(east("residential", { oneway: "forward", lanes: 3 }), catalogue, golfe);
    expect(forward?.points[0]).toEqual({ x: 0, z: 0 });
    expect(forward?.factor).toBe(3);
    expect(forward?.bothWays).toBe(false);
    const [backward] = roadLanes(east("residential", { oneway: "backward" }), catalogue, golfe);
    expect(backward?.points[0]).toEqual({ x: 100, z: 0 });
    expect(backward?.factor).toBe(1);
  });

  it("APP-014: à double sens, chaque sens roule du côté de conduite de la région, plus nombreux avec plus de voies", () => {
    // Vers l'est, la droite est au sud (+z) : à droite au golfe, à gauche en Inde.
    const [golfeOut, golfeBack] = roadLanes(east("primary"), catalogue, golfe);
    expect(golfeOut?.points[0]?.z).toBeGreaterThan(0);
    expect(golfeBack?.points[0]).toMatchObject({ x: 100 });
    expect(golfeBack?.points[0]?.z).toBeLessThan(0);
    const [indeOut] = roadLanes(east("primary"), catalogue, inde);
    expect(indeOut?.points[0]?.z).toBeLessThan(0);
    expect(roadLanes(east("primary", { lanes: 4 }), catalogue, golfe).map((l) => l.factor)).toEqual([2, 2]);
    expect(roadLanes(east("primary", { lanes: 1 }), catalogue, golfe).map((l) => l.factor)).toEqual([1, 1]);
  });

  it("APP-014: aucun trajet dans un bâtiment : le tronçon couvert est retiré, les bouts trop courts aussi", () => {
    const lanes = trafficLanes([east("pedestrian")], [box(40, -5, 60, 5), box(92, -5, 99, 5)], catalogue, golfe);
    // Deux tronçons gardés (0 à 40 m, 60 à 92 m) ; le bout de 99 à 100 m est trop court.
    expect(lanes.map((l) => [Math.min(...l.points.map((p) => p.x)), Math.max(...l.points.map((p) => p.x))])).toEqual([[0, 38], [62, 90]]);
    const footprints = [box(40, -5, 60, 5)].map(footprintOf);
    for (const lane of trafficLanes([east("pedestrian")], [], catalogue, golfe).flatMap((l) => clearRuns(l, footprints))) {
      expect(lane.points.every((p) => p.x < 40 || p.x > 60)).toBe(true);
      expect(laneLengthOf(lane.points)).toBeGreaterThanOrEqual(MIN_RUN_M);
    }
    expect(clearRuns(roadLanes(east("pedestrian"), catalogue, golfe)[0] as Lane, footprints).map((l) => l.seed)).toHaveLength(2);
  });

  it("APP-014: le rééchantillonnage garde les extrémités et un pas régulier, le décalage se fait sur la droite", () => {
    const points = resample([{ x: 0, z: 0 }, { x: 3, z: 0 }, { x: 3, z: 4.5 }]);
    expect(points[0]).toEqual({ x: 0, z: 0 });
    expect(points.at(-1)).toEqual({ x: 3, z: 4.5 });
    expect(points[1]).toEqual({ x: 2, z: 0 });
    expect(points[2]?.z).toBeCloseTo(1);
    expect(resample([{ x: 0, z: 0 }, { x: SAMPLE_M * 2, z: 0 }])).toHaveLength(3);
    expect(offsetLine([{ x: 0, z: 0 }, { x: 0, z: -10 }], 2)[0]).toEqual({ x: 2, z: 0 });
    expect(offsetLine([{ x: 1, z: 1 }, { x: 1, z: 1 }], 2)[0]).toEqual({ x: 1, z: 1 });
  });
});
