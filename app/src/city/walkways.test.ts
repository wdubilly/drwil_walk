import { describe, expect, it } from "vitest";
import { createPath } from "../route/path.ts";
import { buildRoadsGeometry, widthOf } from "./roads.ts";
import type { Road } from "./souq-data.ts";
import { MAX_CROSSINGS, MAX_SIDEWALK_ROADS, buildWalkways } from "./walkways.ts";

const route = createPath([{ x: 0, z: 0 }, { x: 0, z: -100 }]);
const BASE = buildWalkways([], route).positions.length / 3;
const line = (extra: Partial<Road>, length = 10, x = 20): Road => ({ highway: "footway", points: [{ x, z: 0 }, { x, z: -length }], ...extra });
const added = (roads: Road[]): number => buildWalkways(roads, route).positions.length / 3 - BASE;

describe("sol et route", () => {
  it("APP-003: le chemin suivi est un ruban jaune bordé de sombre, plus contrasté que la route", () => {
    const { positions, colors } = buildWalkways([], route);
    expect(BASE).toBe(12);
    // Le liseré sombre (2 m) sous le cœur clair (1,2 m), plus haut.
    expect(Math.max(...positions.filter((_, i) => i % 3 === 0).map(Math.abs))).toBeCloseTo(1);
    expect(positions[1]).toBeLessThan(positions[19] as number);
    expect(colors[0]).toBeLessThan(0.2);
    expect(colors[18]).toBeGreaterThan(0.9);
  });

  it("APP-003: un trottoir tracé à part est un ruban de 1,8 m, un passage piéton une suite de bandes en travers", () => {
    expect(added([line({ footway: "sidewalk" })])).toBe(6);
    // 5 m de passage : une bande tous les mètres.
    expect(added([line({ footway: "crossing" }, 5)])).toBe(30);
    expect(added([line({ footway: "crossing" }, 0)])).toBe(0);
    expect(added([line({})])).toBe(0);
  });

  it("APP-003: les trottoirs portés par la voie se posent du côté demandé, de part et d'autre de la chaussée", () => {
    const side = (sidewalk: "both" | "left" | "right"): number[] => {
      const { positions } = buildWalkways([{ highway: "residential", sidewalk, points: [{ x: 20, z: 0 }, { x: 20, z: -10 }] }], route);
      return positions.filter((_, i) => i % 3 === 0).slice(0, -BASE).map((x) => x - 20);
    };
    const half = widthOf("residential") / 2;
    expect(side("both")).toHaveLength(12);
    // Marcher vers -z : la gauche est à l'ouest (x négatif).
    expect(Math.max(...side("left"))).toBeCloseTo(-half);
    expect(Math.min(...side("right"))).toBeCloseTo(half);
    expect(added([line({ highway: "residential", sidewalk: "left" })])).toBe(6);
  });

  it("APP-003: les trottoirs et passages sont plafonnés, les plus proches du parcours d'abord", () => {
    const many = (extra: Partial<Road>, count: number): Road[] => Array.from({ length: count }, (_, i) => line(extra, 5, 10 + i));
    expect(added(many({ footway: "sidewalk" }, MAX_SIDEWALK_ROADS + 20))).toBe(MAX_SIDEWALK_ROADS * 6);
    expect(added(many({ footway: "crossing" }, MAX_CROSSINGS + 20))).toBe(MAX_CROSSINGS * 30);
  });

  it("APP-003: les rubans se fondent dans le maillage des voies, sans maillage en plus", () => {
    const base = buildRoadsGeometry([line({ highway: "primary" })]).getAttribute("position").count;
    const withMarks = buildRoadsGeometry([line({ highway: "primary" })], 0x808080, buildWalkways([], route)).getAttribute("position").count;
    expect(withMarks - base).toBe(BASE);
  });
});
