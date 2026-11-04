import { describe, expect, it } from "vitest";
import { createPath } from "../route/path.ts";
import { MAX_GENERATED_LAMPS } from "./props.ts";
import { MAX_LAMP_ROADS, MIN_OBJECT_GAP_M, SPACING_JITTER, generateLamps, roadSeed, spacingOf } from "./lamp-rule.ts";
import type { Building, Prop, Road } from "./souq-data.ts";

const route = createPath([{ x: 0, z: 0 }, { x: 400, z: 0 }]);
const street = (highway: string, id?: number, extra: Partial<Road> = {}): Road => ({ ...(id === undefined ? {} : { id }), highway, points: [{ x: 0, z: 0 }, { x: 400, z: 0 }], ...extra });
const sortedX = (lamps: Prop[]): number[] => lamps.map((l) => l.at.x).sort((a, b) => a - b);
const gaps = (lamps: Prop[]): number[] => sortedX(lamps).slice(1).map((x, i) => x - (sortedX(lamps)[i] as number));
const box = (x0: number, z0: number, x1: number, z1: number): Building => ({ footprint: [{ x: x0, z: z0 }, { x: x1, z: z0 }, { x: x1, z: z1 }, { x: x0, z: z1 }], heightM: 9 });

describe("lampadaires produits par règle", () => {
  it("APP-013: l'intervalle dépend de la classe de voie : plus serré en ruelle, plus large en rue de quartier", () => {
    const count = (highway: string): number => generateLamps([street(highway, 7)], [], [], route).length;
    expect(count("service")).toBeGreaterThan(count("tertiary"));
    expect(count("tertiary")).toBeGreaterThan(count("residential"));
    expect(spacingOf("primary_link")).toBe(spacingOf("primary"));
    expect(spacingOf("footway")).toBeUndefined();
    expect(generateLamps([street("steps", 7), street("path", 8), street("residential", 9, { footway: "sidewalk" })], [], [], route)).toEqual([]);
  });

  it("APP-013: l'espacement n'est jamais mécaniquement régulier, mais reste dans l'écart de la graine", () => {
    const lamps = generateLamps([street("tertiary", 12, { sidewalk: "right" })], [], [], route);
    const spaces = gaps(lamps);
    expect(new Set(spaces.map((g) => g.toFixed(3))).size).toBeGreaterThan(spaces.length / 2);
    for (const g of spaces) {
      expect(g).toBeGreaterThanOrEqual(27.5 * (1 - SPACING_JITTER) - 1e-9);
      expect(g).toBeLessThanOrEqual(27.5 * (1 + SPACING_JITTER) + 1e-9);
    }
  });

  it("APP-013: le même quartier donne toujours les mêmes lampadaires, et une autre voie d'autres emplacements", () => {
    const roads = [street("tertiary", 12), street("service", 13, { points: [{ x: 0, z: 30 }, { x: 300, z: 30 }] })];
    expect(generateLamps(roads, [], [], route)).toEqual(generateLamps(roads, [], [], route));
    const other = generateLamps([street("tertiary", 99)], [], [], route);
    expect(other).not.toEqual(generateLamps([street("tertiary", 12)], [], [], route));
    const oldData = street("tertiary");
    expect(roadSeed(oldData)).toBe(roadSeed(street("tertiary")));
    expect(roadSeed(oldData)).not.toBe(roadSeed(street("tertiary", 12)));
    expect(roadSeed(street("tertiary", 2 ** 33))).not.toBe(roadSeed(street("tertiary", 0)));
  });

  it("APP-013: les mâts sont posés au bord de la voie, côté choisi par tronçon, bras tendu vers la chaussée", () => {
    const bent = street("tertiary", 5, { points: [{ x: 0, z: 0 }, { x: 150, z: 0 }, { x: 150, z: 150 }, { x: 150, z: 0 }] });
    const lamps = generateLamps([bent], [], [], route);
    expect(lamps.length).toBeGreaterThan(8);
    expect(lamps.every((l) => l.kind === "lamp" && l.source === "generated" && typeof l.yaw === "number")).toBe(true);
    // Le bras (axe Z du modèle, tourné de yaw) pointe vers l'axe de la voie.
    const first = lamps.find((l) => l.at.x < 150 && Math.abs(l.at.z) < 10) as Prop;
    expect(Math.abs(first.at.z)).toBeCloseTo(3.5 + 0.6, 5);
    expect(Math.cos(first.yaw as number) * Math.sign(first.at.z)).toBeLessThan(-0.99);
    const sides = new Set(lamps.filter((l) => l.at.x < 149).map((l) => Math.sign(l.at.z)));
    expect(sides.size).toBeGreaterThanOrEqual(1);
    const onePerSegment = (sidewalk: "left" | "right"): number[] => generateLamps([street("tertiary", 5, { sidewalk })], [], [], route).map((l) => Math.sign(l.at.z));
    expect(new Set(onePerSegment("left"))).toEqual(new Set([-1]));
    expect(new Set(onePerSegment("right"))).toEqual(new Set([1]));
  });

  it("APP-013: aucun lampadaire dans un bâtiment ni devant un trottoir trop étroit", () => {
    const base = generateLamps([street("tertiary", 12, { sidewalk: "right" })], [], [], route);
    expect(base.length).toBeGreaterThan(10);
    const wall = box(100, 3.6, 220, 40);
    const narrow = box(240, 4.1, 300, 40);
    const kept = generateLamps([street("tertiary", 12, { sidewalk: "right" })], [wall, narrow], [], route);
    const inside = (l: Prop, x0: number, x1: number): boolean => l.at.x > x0 - 1.3 && l.at.x < x1 + 1.3;
    expect(base.some((l) => inside(l, 100, 220) || inside(l, 240, 300))).toBe(true);
    expect(kept.some((l) => inside(l, 100, 220) || inside(l, 240, 300))).toBe(false);
    const wide = box(100, 8, 220, 40);
    expect(generateLamps([street("tertiary", 12, { sidewalk: "right" })], [wide], [], route)).toEqual(base);
  });

  it("APP-013: le relevé est posé le premier et jamais écarté ; aucun objet à moins de 2 m d'un autre", () => {
    const base = generateLamps([street("tertiary", 12, { sidewalk: "right" })], [], [], route);
    const real: Prop[] = [{ kind: "tree", source: "osm", at: (base[3] as Prop).at }, { kind: "bench", source: "osm", at: { x: (base[5] as Prop).at.x + 1.5, z: (base[5] as Prop).at.z } }];
    const lamps = generateLamps([street("tertiary", 12, { sidewalk: "right" })], [], real, route);
    expect(lamps.length).toBe(base.length - 2);
    const all = [...real, ...lamps].map((p) => p.at);
    for (const [i, a] of all.entries()) for (const b of all.slice(i + 1)) expect(Math.hypot(a.x - b.x, a.z - b.z)).toBeGreaterThanOrEqual(MIN_OBJECT_GAP_M);
    expect(real.every((p) => p.source === "osm")).toBe(true);
  });

  it("APP-013: deux voies qui se croisent ne portent pas deux mâts à moins de 2 m, et seules les voies proches du parcours comptent", () => {
    const crossing = [street("service", 1), street("service", 2, { points: [{ x: 0, z: 0.5 }, { x: 400, z: 0.5 }] })];
    const lamps = generateLamps(crossing, [], [], route);
    for (const [i, a] of lamps.entries()) for (const b of lamps.slice(i + 1)) expect(Math.hypot(a.at.x - b.at.x, a.at.z - b.at.z)).toBeGreaterThanOrEqual(MIN_OBJECT_GAP_M);
    const farRoads = Array.from({ length: MAX_LAMP_ROADS + 5 }, (_, i) => street("service", i, { points: [{ x: 0, z: 100 + i }, { x: 4, z: 100 + i }] }));
    const near = street("service", 999, { points: [{ x: 0, z: 1 }, { x: 40, z: 1 }] });
    expect(generateLamps([...farRoads, near], [], [], route).some((l) => l.at.z < 20)).toBe(true);
    expect(generateLamps([street("service", 1, { points: [{ x: 5, z: 0 }, { x: 5, z: 0 }, { x: 40, z: 0 }] })], [], [], route).length).toBeGreaterThan(0);
  });

  it("APP-013: au plus le plafond de lampadaires, les plus proches du parcours d'abord", () => {
    const grid = Array.from({ length: 40 }, (_, i) => street("service", i, { points: [{ x: 0, z: 10 * i }, { x: 400, z: 10 * i }] }));
    const lamps = generateLamps(grid, [], [], route);
    expect(lamps).toHaveLength(MAX_GENERATED_LAMPS);
    expect(Math.max(...lamps.map((l) => l.at.z))).toBeLessThan(200);
  });
});
