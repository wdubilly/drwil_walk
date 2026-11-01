import { describe, expect, it } from "vitest";
import { createPath } from "../route/path.ts";
import { OUTLINE_RADIUS_M, buildOutlinesGeometry, nearRoute } from "./outlines.ts";
import type { Building } from "./souq-data.ts";

const route = createPath([{ x: 0, z: 0 }, { x: 0, z: -100 }]);
const box = (x: number, z: number): Building => ({
  heightM: 6,
  footprint: [{ x, z }, { x: x + 8, z }, { x: x + 8, z: z - 8 }, { x, z: z - 8 }, { x, z }],
});

describe("contours des bâtiments", () => {
  it("QUA-020: seuls les bâtiments proches du parcours sont cernés", () => {
    const near = box(5, -20);
    const far = box(OUTLINE_RADIUS_M + 500, -20);
    expect(nearRoute([near, far], route)).toEqual([near]);
  });

  it("QUA-020: un bâtiment proche donne des arêtes, sans bâtiment proche un maillage vide", () => {
    expect(buildOutlinesGeometry([box(5, -20)], route).getAttribute("position").count).toBeGreaterThan(0);
    expect(buildOutlinesGeometry([box(5000, -20)], route).hasAttribute("position")).toBe(false);
  });
});
