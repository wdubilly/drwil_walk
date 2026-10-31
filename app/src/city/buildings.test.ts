import { describe, expect, it } from "vitest";
import { buildBuildingsGeometry, toneIndex } from "./buildings.ts";
import type { Building } from "./souq-data.ts";

const TONES = [0xff0000, 0x00ff00, 0x0000ff];
const square = (x: number, z: number, heightM: number): Building => ({
  heightM,
  footprint: [
    { x, z },
    { x: x + 10, z },
    { x: x + 10, z: z + 10 },
    { x, z: z + 10 },
    { x, z },
  ],
});

describe("bâtiments extrudés", () => {
  it("fusionne les bâtiments en un seul maillage, debout sur le sol", () => {
    const geometry = buildBuildingsGeometry([square(0, 0, 8), square(20, 0, 12)], TONES);
    geometry.computeBoundingBox();
    expect(geometry.boundingBox?.min.y).toBeCloseTo(0);
    expect(geometry.boundingBox?.max.y).toBeCloseTo(12);
    // z du monde = z local : le sud reste du côté +Z.
    expect(geometry.boundingBox?.min.z).toBeCloseTo(0);
    expect(geometry.boundingBox?.max.z).toBeCloseTo(10);
    expect(geometry.boundingBox?.max.x).toBeCloseTo(30);
  });

  it("ignore un contour dégénéré ou sans hauteur, et rend un maillage vide sans bâtiment", () => {
    const flat = square(0, 0, 0);
    const line: Building = { heightM: 5, footprint: [{ x: 0, z: 0 }, { x: 1, z: 1 }] };
    expect(buildBuildingsGeometry([flat, line], TONES).getAttribute("position")).toBeUndefined();
    expect(buildBuildingsGeometry([flat, square(0, 0, 3)], TONES).getAttribute("position").count).toBeGreaterThan(0);
  });

  it("APP-003: la teinte varie d'un bâtiment à l'autre, toujours la même pour le même bâtiment", () => {
    const row = Array.from({ length: 12 }, (_, i) => square(i * 20, 0, 5));
    const indexes = row.map((b) => toneIndex(b, TONES.length));
    expect(new Set(indexes).size).toBeGreaterThan(1);
    expect(indexes.every((i) => i >= 0 && i < TONES.length)).toBe(true);
    expect(row.map((b) => toneIndex(b, TONES.length))).toEqual(indexes);
    const colors = buildBuildingsGeometry(row, TONES).getAttribute("color");
    const distinct = new Set(Array.from({ length: colors.count }, (_, i) => [colors.getX(i), colors.getY(i), colors.getZ(i)].join(",")));
    expect(distinct.size).toBe(new Set(indexes).size);
  });
});
