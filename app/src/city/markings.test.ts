import { describe, expect, it } from "vitest";
import { createPath } from "../route/path.ts";
import { MAX_KERB_ROADS, MAX_STOP_LINES, pushMarkings } from "./markings.ts";
import { newRibbons, widthOf } from "./roads.ts";
import type { Road } from "./souq-data.ts";

const route = createPath([{ x: 0, z: 0 }, { x: 0, z: -100 }]);
const line = (extra: Partial<Road>, length = 10, x = 20): Road => ({ highway: "footway", points: [{ x, z: 0 }, { x, z: -length }], ...extra });

/** Les sommets ajoutés aux rubans des voies par les marquages de ces voies. */
function marks(roads: Road[]): { vertices: number; offsets: number[] } {
  const out = newRibbons();
  pushMarkings(out, roads, route);
  return { vertices: out.positions.length / 3, offsets: out.positions.filter((_, i) => i % 3 === 0) };
}

describe("marquages au sol des voies", () => {
  it("APP-009: une voie sans balise de trottoir ni de passage ne produit aucun marquage", () => {
    expect(marks([line({})]).vertices).toBe(0);
    expect(marks([]).vertices).toBe(0);
  });

  it("APP-009: un trottoir tracé à part reçoit une bordure sur chacune de ses deux rives", () => {
    const { vertices, offsets } = marks([line({ footway: "sidewalk" })]);
    expect(vertices).toBe(12);
    // Les rives du ruban de 1,8 m, de part et d'autre du tracé.
    expect(Math.max(...offsets) - 20).toBeCloseTo(0.9);
    expect(Math.min(...offsets) - 20).toBeCloseTo(-0.9);
  });

  it("APP-009: une voie qui porte ses trottoirs reçoit sa bordure du côté demandé, au bord de la chaussée", () => {
    const sides = (sidewalk: NonNullable<Road["sidewalk"]>): number[] => marks([line({ highway: "residential", sidewalk })]).offsets.map((x) => x - 20);
    const half = widthOf("residential") / 2;
    expect(sides("both")).toHaveLength(12);
    // Marcher vers -z : la gauche est à l'ouest (x négatif).
    expect(Math.max(...sides("left"))).toBeCloseTo(-half);
    expect(Math.min(...sides("right"))).toBeCloseTo(half);
  });

  it("APP-009: un passage piéton reçoit une ligne d'arrêt de chaque côté, parallèle à lui", () => {
    const crossing: Road = { highway: "footway", footway: "crossing", points: [{ x: 10, z: -5 }, { x: 16, z: -5 }] };
    const { vertices, offsets } = marks([crossing]);
    expect(vertices).toBe(12);
    // Les barres couvrent toute la longueur du passage (6 m), décalées de 1,5 m de part et d'autre en z.
    expect(Math.min(...offsets)).toBeCloseTo(10);
    expect(Math.max(...offsets)).toBeCloseTo(16);
  });

  it("APP-009: les marquages sont plafonnés, les voies les plus proches du parcours d'abord", () => {
    const many = (extra: Partial<Road>, count: number): Road[] => Array.from({ length: count }, (_, i) => line(extra, 5, 10 + i));
    expect(marks(many({ footway: "sidewalk" }, MAX_KERB_ROADS + 20)).vertices).toBe(MAX_KERB_ROADS * 12);
    expect(marks(many({ footway: "crossing" }, MAX_STOP_LINES + 20)).vertices).toBe(MAX_STOP_LINES * 12);
  });
});
