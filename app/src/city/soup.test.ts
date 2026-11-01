import { Color } from "three";
import { describe, expect, it } from "vitest";
import { addQuad, addTriangle, newSoup, soupGeometry } from "./soup.ts";

const WHITE = new Color(1, 1, 1);

describe("tas de triangles colorés", () => {
  it("APP-003: un triangle regarde du côté demandé, quel que soit l'ordre de ses sommets", () => {
    for (const facing of [[0, 1, 0], [0, -1, 0]] as const) {
      const soup = newSoup();
      addTriangle(soup, [0, 0, 0], [1, 0, 0], [0, 0, 1], WHITE, facing);
      expect(soup.normals.slice(0, 3).map((v) => v + 0)).toEqual([0, facing[1], 0]);
      expect(soup.positions).toHaveLength(9);
      expect(soup.colors).toEqual([1, 1, 1, 1, 1, 1, 1, 1, 1]);
    }
  });

  it("APP-003: un quadrilatère fait deux triangles, et le tas devient un maillage à position, normale et couleur", () => {
    const soup = newSoup();
    addQuad(soup, [0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1], WHITE, [0, 1, 0]);
    const geometry = soupGeometry(soup);
    for (const name of ["position", "normal", "color"]) expect(geometry.getAttribute(name).count).toBe(6);
    expect(soupGeometry(newSoup()).getAttribute("position").count).toBe(0);
  });
});
