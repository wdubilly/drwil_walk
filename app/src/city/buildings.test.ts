import { Color, type BufferGeometry } from "three";
import { describe, expect, it } from "vitest";
import { FOOT_LIGHT, buildBuildingsGeometry, toneIndex } from "./buildings.ts";
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

const rgb = (hex: number): string => new Color(hex).toArray().map((v) => v.toFixed(4)).join(",");
/** Les couleurs des sommets du toit (normale vers le haut), qui ne sont pas assombries par l'ombrage. */
function roofColors(geometry: BufferGeometry): string[] {
  const normal = geometry.getAttribute("normal");
  const color = geometry.getAttribute("color");
  return Array.from({ length: color.count }, (_, i) => i)
    .filter((i) => normal.getY(i) > 0.5)
    .map((i) => [color.getX(i), color.getY(i), color.getZ(i)].map((v) => v.toFixed(4)).join(","));
}

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
    const geometry = buildBuildingsGeometry(row, TONES);
    expect(new Set(roofColors(geometry)).size).toBe(new Set(indexes).size);
  });

  it("APP-003: la couleur des murs vient des balises, celle du toit à part, sinon le ton de la palette", () => {
    const geometry = buildBuildingsGeometry([{ ...square(0, 0, 8), wall: 0x102030 }, { ...square(20, 0, 8), wall: 0x102030, roof: 0xff8000 }], TONES);
    expect(new Set(roofColors(geometry))).toEqual(new Set([rgb(0x102030), rgb(0xff8000)]));
  });

  it("APP-003: l'ombrage par sommet assombrit les murs vers le pied, le toit garde toute sa lumière", () => {
    const geometry = buildBuildingsGeometry([{ ...square(0, 0, 10), wall: 0xffffff }], TONES);
    const position = geometry.getAttribute("position");
    const normal = geometry.getAttribute("normal");
    const color = geometry.getAttribute("color");
    const light = (y: number, roof: boolean) =>
      Array.from({ length: position.count }, (_, i) => i).filter((i) => (normal.getY(i) > 0.5) === roof && Math.abs(position.getY(i) - y) < 1e-6).map((i) => color.getX(i));
    expect(new Set(light(0, false))).toEqual(new Set([Math.fround(FOOT_LIGHT)]));
    expect(new Set(light(10, false))).toEqual(new Set([1]));
    expect(new Set(light(10, true))).toEqual(new Set([1]));
  });
});
