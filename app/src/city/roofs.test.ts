import { Color } from "three";
import { describe, expect, it } from "vitest";
import { createPath } from "../route/path.ts";
import { AWNING_COLOUR_COUNT, addAwning, addGabledRoof } from "./roofs.ts";
import { newSoup } from "./soup.ts";
import type { Building } from "./souq-data.ts";

const rect = (w: number, d: number, heightM: number, reverse = false): Building => {
  const ring = [{ x: 0, z: 0 }, { x: w, z: 0 }, { x: w, z: d }, { x: 0, z: d }, { x: 0, z: 0 }];
  return { heightM, footprint: reverse ? ring.reverse() : ring };
};
const ys = (positions: number[]): number[] => positions.filter((_, i) => i % 3 === 1);
const RED = new Color(1, 0, 0);
const GREY = new Color(0.5, 0.5, 0.5);

describe("toits à deux pans", () => {
  it("APP-003: deux pans et deux pignons, faîtage au milieu des petits côtés, dans le sens du plus long côté", () => {
    const soup = newSoup();
    addGabledRoof(soup, rect(10, 6, 8), RED, GREY);
    expect(soup.positions).toHaveLength(18 * 3);
    expect(Math.max(...ys(soup.positions))).toBeCloseTo(8 + 1.8);
    const ridge = Array.from({ length: 18 }, (_, i) => i).filter((i) => ys(soup.positions)[i] !== 8);
    expect(new Set(ridge.map((i) => [soup.positions[i * 3], soup.positions[i * 3 + 2]].join()))).toEqual(new Set(["0,3", "10,3"]));
  });

  it("APP-003: les pans regardent vers le haut en couleur de toit, les pignons vers l'extérieur en teinte de mur", () => {
    const soup = newSoup();
    addGabledRoof(soup, rect(10, 6, 8), RED, GREY);
    const normalY = soup.normals.filter((_, i) => i % 3 === 1);
    expect(normalY.slice(0, 12).every((n) => n > 0.5)).toBe(true);
    expect(soup.colors.slice(0, 3)).toEqual([1, 0, 0]);
    expect(soup.colors[36]).toBeLessThan(0.5);
    const gableX = soup.normals.filter((_, i) => i % 3 === 0).slice(12);
    expect(gableX.filter((n) => n > 0.9)).toHaveLength(3);
    expect(gableX.filter((n) => n < -0.9)).toHaveLength(3);
  });

  it("APP-003: le faîtage suit aussi le plus long côté quand c'est le deuxième, et reste sous le plafond de hauteur", () => {
    const tall = newSoup();
    addGabledRoof(tall, rect(6, 10, 8), RED, GREY);
    expect(new Set(tall.positions.filter((_, i) => i % 3 === 0 && ys(tall.positions)[i / 3] !== 8))).toEqual(new Set([3]));
    const wide = newSoup();
    addGabledRoof(wide, rect(20, 25, 8), RED, GREY);
    expect(Math.max(...ys(wide.positions))).toBeCloseTo(12);
  });

  it("APP-003: un contour qui n'a pas quatre murs garde son toit plat", () => {
    const soup = newSoup();
    addGabledRoof(soup, { heightM: 5, footprint: [{ x: 0, z: 0 }, { x: 5, z: 0 }, { x: 0, z: 5 }, { x: 0, z: 0 }] }, RED, GREY);
    expect(soup.positions).toHaveLength(0);
  });
});

describe("auvents", () => {
  const route = createPath(Array.from({ length: 9 }, (_, i) => ({ x: -5, z: 20 - i * 5 })));

  it("APP-003: un auvent sort du mur le plus proche du parcours, à hauteur de passant, dans les deux sens du contour", () => {
    for (const reverse of [false, true]) {
      const soup = newSoup();
      addAwning(soup, rect(10, 10, 8, reverse), route, 1);
      // Dessus et dessous : deux quadrilatères.
      expect(soup.positions).toHaveLength(12 * 3);
      const xs = soup.positions.filter((_, i) => i % 3 === 0);
      expect(Math.min(...xs)).toBeCloseTo(-1.3);
      expect(Math.max(...xs)).toBeCloseTo(0);
      expect(Math.min(...ys(soup.positions))).toBeCloseTo(2.6);
      expect(Math.max(...ys(soup.positions))).toBeCloseTo(3);
      const zs = soup.positions.filter((_, i) => i % 3 === 2);
      expect(Math.max(...zs) - Math.min(...zs)).toBeCloseTo(8);
      expect(soup.normals.filter((_, i) => i % 3 === 1).some((n) => n < 0)).toBe(true);
      expect(soup.colors[18]).toBeLessThan(soup.colors[0] as number);
    }
  });

  it("APP-003: chaque coloris est un des coloris d'auvent", () => {
    const red = (i: number): number => {
      const soup = newSoup();
      addAwning(soup, rect(10, 10, 8), route, i);
      return soup.colors[0] as number;
    };
    expect(new Set(Array.from({ length: AWNING_COLOUR_COUNT }, (_, i) => red(i))).size).toBeGreaterThan(1);
  });

  it("APP-003: pas d'auvent sur un bâtiment bas, sans mur assez long, ou loin du parcours", () => {
    const none = (building: Building, path = route): number => {
      const soup = newSoup();
      addAwning(soup, building, path, 0);
      return soup.positions.length;
    };
    expect(none(rect(10, 10, 3))).toBe(0);
    expect(none(rect(3, 3, 8))).toBe(0);
    expect(none(rect(10, 10, 8), createPath([{ x: 500, z: 0 }, { x: 500, z: 10 }]))).toBe(0);
  });
});
