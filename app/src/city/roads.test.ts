import { describe, expect, it } from "vitest";
import { buildRoadsGeometry, widthOf } from "./roads.ts";

describe("voies dessinées", () => {
  it("APP-003: la largeur suit la classe : les grands axes sont plus larges, les bretelles comme leur voie", () => {
    expect(widthOf("primary")).toBeGreaterThan(widthOf("residential"));
    expect(widthOf("residential")).toBeGreaterThan(widthOf("footway"));
    expect(widthOf("primary_link")).toBe(widthOf("primary"));
    expect(widthOf("inconnue")).toBe(widthOf("footway"));
  });

  it("APP-003: une voie devient un ruban à plat, centré sur son tracé, à la largeur de sa classe", () => {
    const geometry = buildRoadsGeometry([{ highway: "primary", points: [{ x: 0, z: 0 }, { x: 0, z: -100 }] }]);
    geometry.computeBoundingBox();
    const half = widthOf("primary") / 2;
    expect(geometry.boundingBox?.min.x).toBeCloseTo(-half);
    expect(geometry.boundingBox?.max.x).toBeCloseTo(half);
    expect(geometry.boundingBox?.min.z).toBeCloseTo(-100);
    expect(geometry.boundingBox?.max.z).toBeCloseTo(0);
    expect(geometry.boundingBox?.min.y).toBeGreaterThan(0);
    expect(geometry.boundingBox?.max.y).toBeLessThan(0.2);
    expect(geometry.getAttribute("position").count).toBe(6);
    expect(geometry.getAttribute("normal").getY(0)).toBe(1);
  });

  it("ignore un tronçon sans longueur, une voie d'un seul point, et rend un maillage vide sans voie", () => {
    const here = { x: 3, z: 3 };
    const geometry = buildRoadsGeometry([
      { highway: "service", points: [here, here] },
      { highway: "service", points: [here] },
      { highway: "service", points: [] },
    ]);
    expect(geometry.getAttribute("position").count).toBe(0);
    expect(buildRoadsGeometry([]).getAttribute("position").count).toBe(0);
  });
});
