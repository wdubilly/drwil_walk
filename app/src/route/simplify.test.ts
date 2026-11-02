import { describe, expect, it } from "vitest";
import { simplifyPath } from "./simplify.ts";

const line = (n: number) => Array.from({ length: n }, (_, i) => ({ x: i, z: 0 }));

describe("tracé simplifié", () => {
  it("APP-002: garde un tracé déjà sous le plafond tel quel", () => {
    const points = line(5);
    expect(simplifyPath(points, 10)).toEqual(points);
  });

  it("APP-002: réduit un long tracé au plafond, bouts compris", () => {
    const wave = Array.from({ length: 2000 }, (_, i) => ({ x: i, z: 30 * Math.sin(i / 40) }));
    const out = simplifyPath(wave, 100);
    expect(out).toHaveLength(100);
    expect(out[0]).toBe(wave[0]);
    expect(out[99]).toBe(wave[1999]);
    expect(out.map((p) => p.x)).toEqual([...out.map((p) => p.x)].sort((a, b) => a - b));
  });

  it("APP-002: garde les virages d'un tracé et laisse tomber les points alignés", () => {
    const corner = [...line(50), ...Array.from({ length: 50 }, (_, i) => ({ x: 49, z: i + 1 }))];
    expect(simplifyPath(corner, 50)).toEqual([corner[0], corner[49], corner[99]]);
  });

  it("APP-002: simplifie une boucle dont les deux bouts sont confondus", () => {
    const square = [{ x: 0, z: 0 }, { x: 10, z: 0 }, { x: 10, z: 10 }, { x: 0, z: 10 }, { x: 0, z: 0 }];
    expect(simplifyPath(square, 4)).toHaveLength(4);
  });
});
