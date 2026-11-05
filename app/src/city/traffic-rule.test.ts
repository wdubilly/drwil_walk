import { describe, expect, it } from "vitest";
import bundled from "../../assets/figurants-catalogue.json" with { type: "json" };
import { createPath, pointAt } from "../route/path.ts";
import type { Road } from "./souq-data.ts";
import { readCatalogue, type Catalogue } from "./traffic-catalog.ts";
import { DEFAULT_CAPS, MAX_SPEED_KMH, laneAgents, planTraffic } from "./traffic-rule.ts";

const catalogue = readCatalogue(bundled);
const models = new Set(Object.values(catalogue.types).flatMap((t) => t.modeles));
const route = createPath([{ x: 0, z: 0 }, { x: 1000, z: 0 }]);
const street = (highway: string, id: number, z = 0, extra: Partial<Road> = {}): Road => ({ id, highway, points: [{ x: 0, z }, { x: 400, z }], ...extra });
const lots = { vehicles: 1000, pedestrians: 1000 };
const plan = (roads: Road[], cat: Catalogue = catalogue, region = "golfe", caps = lots) => planTraffic(roads, [], route, cat, region, models, caps);

describe("moteur de la ville vivante", () => {
  it("APP-014: véhicules sur la chaussée, piétons sur les voies piétonnes, chacun d'un type de son lieu", () => {
    const agents = plan([street("tertiary", 1), street("pedestrian", 2, 50), street("footway", 3, 80, { footway: "sidewalk" })]);
    const lieuOf = (type: string): string | undefined => catalogue.types[type]?.lieu;
    expect(new Set(agents.map((a) => a.lieu))).toEqual(new Set(["chaussee", "voie-pietonne", "trottoir"]));
    for (const a of agents) {
      expect(lieuOf(a.type)).toBe(a.lieu);
      expect(catalogue.types[a.type]?.modeles).toContain(a.model);
    }
  });

  it("APP-014: la graine de la voie rend placement et trajets reproductibles ; une autre voie donne d'autres figurants", () => {
    const roads = [street("tertiary", 12), street("pedestrian", 13, 40)];
    const strip = (agents: ReturnType<typeof plan>) => agents.map((a) => [a.type, a.model, a.startM, a.speedMs, a.reverse]);
    expect(strip(plan(roads))).toEqual(strip(plan(roads)));
    expect(strip(plan([street("tertiary", 99)]))).not.toEqual(strip(plan([street("tertiary", 12)])));
  });

  it("APP-014: la vitesse est plafonnée quelle que soit la donnée, et une même voie à sens unique garde une seule vitesse", () => {
    const fast = structuredClone<typeof bundled>(bundled);
    fast.types.berline.vitesseKmh = 200;
    fast.types.flaneur.vitesseKmh = 50;
    const agents = plan([street("primary", 5, 0, { oneway: "forward", lanes: 2 }), street("pedestrian", 6, 30)], readCatalogue(fast));
    for (const a of agents) expect(a.speedMs * 3.6).toBeLessThanOrEqual(MAX_SPEED_KMH[a.lieu] + 1e-9);
    const cars = agents.filter((a) => a.lieu === "chaussee");
    expect(cars.length).toBeGreaterThan(3);
    expect(new Set(cars.map((a) => a.speedMs)).size).toBe(1);
    expect(cars.every((a) => !a.reverse)).toBe(true);
  });

  it("APP-014: plus de voies, plus de véhicules ; rien sans densité, sans poids ou sans modèle chargé", () => {
    const count = (extra: Partial<Road>): number => plan([street("primary", 5, 0, { oneway: "forward", ...extra })]).length;
    expect(count({ lanes: 3 })).toBeGreaterThan(count({}));
    const empty = structuredClone<typeof bundled>(bundled);
    empty.regions.golfe.densites.chaussee = 0;
    expect(plan([street("primary", 5)], readCatalogue(empty))).toEqual([]);
    expect(planTraffic([street("primary", 5)], [], route, catalogue, "golfe", new Set(["character-male-a"]), lots)).toEqual([]);
    const lone = structuredClone<typeof bundled>(bundled);
    lone.regions.golfe.densites = { chaussee: 1 } as typeof lone.regions.golfe.densites;
    expect(plan([street("pedestrian", 5)], readCatalogue(lone))).toEqual([]);
    // Un type dont un seul modèle est chargé n'utilise que celui-là.
    const vans = planTraffic([street("primary", 5)], [], route, catalogue, "golfe", new Set(["van"]), lots);
    expect(vans.length).toBeGreaterThan(0);
    expect(new Set(vans.map((a) => a.model))).toEqual(new Set(["van"]));
  });

  it("APP-014: le nombre est plafonné, véhicules et piétons à part, les plus proches du parcours gardés", () => {
    const roads = [street("primary", 1, 5), street("primary", 2, 300), street("pedestrian", 3, 10), street("pedestrian", 4, 400)];
    const agents = plan(roads, catalogue, "golfe", { vehicles: 3, pedestrians: 2 });
    expect(agents.filter((a) => a.lieu === "chaussee")).toHaveLength(3);
    expect(agents.filter((a) => a.lieu !== "chaussee")).toHaveLength(2);
    for (const a of agents) expect(Math.abs(pointAt(a.path, a.startM).z)).toBeLessThan(20);
    expect(DEFAULT_CAPS.vehicles).toBeLessThan(DEFAULT_CAPS.pedestrians);
  });

  it("APP-014: une région que la table ne règle pas roule comme ailleurs ; le dernier type est tiré au bout de la roue", () => {
    const strip = (agents: ReturnType<typeof plan>) => agents.map((a) => a.type);
    expect(strip(plan([street("primary", 8)], catalogue, "provence"))).toEqual(strip(plan([street("primary", 8)], catalogue, "ailleurs")));
    const lane = { lieu: "chaussee" as const, points: [{ x: 0, z: 0 }, { x: 400, z: 0 }], seed: 1, bothWays: false, factor: 1 };
    const one = structuredClone<typeof bundled>(bundled);
    one.regions.golfe.poids = { "deux-roues": 1 } as typeof one.regions.golfe.poids;
    expect(new Set(laneAgents(lane, readCatalogue(one), "golfe", models).map((a) => a.type))).toEqual(new Set(["deux-roues"]));
  });
});
