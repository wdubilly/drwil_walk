import { describe, expect, it } from "vitest";
import { createPath } from "../route/path.ts";
import type { Area, Hedge } from "./souq-data.ts";
import { MAX_AREAS, MAX_HEDGES, buildVegetation } from "./vegetation.ts";

const route = createPath([{ x: 0, z: 0 }, { x: 0, z: -100 }]);
const square = (x: number, kind: Area["kind"] = "park"): Area => ({
  kind,
  ring: [{ x, z: 0 }, { x: x + 10, z: 0 }, { x: x + 10, z: -10 }, { x, z: -10 }, { x, z: 0 }],
});
const hedge = (x: number): Hedge => ({ points: [{ x, z: 0 }, { x, z: -10 }] });
const count = (areas: Area[], hedges: Hedge[]): number => buildVegetation(areas, hedges, route).getAttribute("position").count;

describe("verdure au sol", () => {
  it("APP-003: une surface verte est posée à plat sur le sol, sous les voies, tournée vers le haut", () => {
    const geometry = buildVegetation([square(5)], [], route);
    expect(geometry.getAttribute("position").count).toBe(6);
    geometry.computeBoundingBox();
    expect(geometry.boundingBox?.min.y).toBeCloseTo(0.03);
    expect(geometry.boundingBox?.max.y).toBeCloseTo(0.03);
    expect(geometry.getAttribute("normal").getY(0)).toBe(1);
  });

  it("APP-003: chaque famille a sa teinte", () => {
    const red = (kind: Area["kind"]): number => buildVegetation([square(5, kind)], [], route).getAttribute("color").getX(0);
    expect(new Set(["grass", "park", "garden", "wood"].map((k) => red(k as Area["kind"]))).size).toBe(4);
  });

  it("APP-003: une haie est un muret vert d'un mètre, sans le segment nul ni la haie d'un point", () => {
    const geometry = buildVegetation([], [hedge(4), { points: [{ x: 1, z: 1 }] }, { points: [{ x: 3, z: 3 }, { x: 3, z: 3 }] }], route);
    // Le dessus (6 sommets) et deux flancs (12) pour la seule haie valide.
    expect(geometry.getAttribute("position").count).toBe(18);
    geometry.computeBoundingBox();
    expect(geometry.boundingBox?.max.y).toBe(1);
    expect(geometry.boundingBox?.max.x).toBeCloseTo(4.3);
  });

  it("APP-003: surfaces et haies sont plafonnées, les plus proches du parcours d'abord ; sans rien, un maillage vide", () => {
    expect(count(Array.from({ length: MAX_AREAS + 20 }, (_, i) => square(i + 1)), [])).toBe(MAX_AREAS * 6);
    expect(count([], Array.from({ length: MAX_HEDGES + 20 }, (_, i) => hedge(i + 1)))).toBe(MAX_HEDGES * 18);
    expect(count([{ kind: "grass", ring: square(0).ring.slice(0, 3) }], [])).toBe(0);
    expect(count([], [])).toBe(0);
  });
});
