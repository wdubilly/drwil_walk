import { describe, expect, it } from "vitest";
import { createPath } from "../route/path.ts";
import { closest, distanceToRoute } from "./near-route.ts";

const route = createPath([{ x: 0, z: 0 }, { x: 0, z: -100 }]);

describe("proximité du parcours", () => {
  it("APP-003: la distance se mesure au sommet le plus proche du parcours", () => {
    expect(distanceToRoute({ x: 3, z: -4 }, route)).toBe(5);
  });

  it("APP-003: garde les plus proches d'abord, dans la limite du plafond", () => {
    const items = [{ x: 40, z: 0 }, { x: 2, z: 0 }, { x: 9, z: 0 }];
    expect(closest(items, route, 2, (p) => p)).toEqual([{ x: 2, z: 0 }, { x: 9, z: 0 }]);
  });
});
