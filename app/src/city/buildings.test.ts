import { Color, type BufferGeometry } from "three";
import { describe, expect, it } from "vitest";
import { MAX_AWNINGS } from "./roofs.ts";
import { FOOT_LIGHT, buildBuildingsGeometry, toneIndex } from "./buildings.ts";
import { createPath } from "../route/path.ts";
import type { Building } from "./souq-data.ts";

const TONES = [0xff0000, 0x00ff00, 0x0000ff];
/** Un parcours loin de tout bâtiment : ni auvent, ni toit à deux pans retenu par le budget de proximité. */
const FAR = createPath([{ x: 5000, z: 5000 }, { x: 5000, z: 5010 }]);
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
    const geometry = buildBuildingsGeometry([square(0, 0, 8), square(20, 0, 12)], TONES, FAR);
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
    expect(buildBuildingsGeometry([flat, line], TONES, FAR).getAttribute("position")).toBeUndefined();
    expect(buildBuildingsGeometry([flat, square(0, 0, 3)], TONES, FAR).getAttribute("position").count).toBeGreaterThan(0);
  });

  it("APP-003: la teinte varie d'un bâtiment à l'autre, toujours la même pour le même bâtiment", () => {
    const row = Array.from({ length: 12 }, (_, i) => square(i * 20, 0, 5));
    const indexes = row.map((b) => toneIndex(b, TONES.length));
    expect(new Set(indexes).size).toBeGreaterThan(1);
    expect(indexes.every((i) => i >= 0 && i < TONES.length)).toBe(true);
    expect(row.map((b) => toneIndex(b, TONES.length))).toEqual(indexes);
    const geometry = buildBuildingsGeometry(row, TONES, FAR);
    expect(new Set(roofColors(geometry)).size).toBe(new Set(indexes).size);
  });

  it("APP-003: la couleur des murs vient des balises, celle du toit à part, sinon le ton de la palette", () => {
    const geometry = buildBuildingsGeometry([{ ...square(0, 0, 8), wall: 0x102030 }, { ...square(20, 0, 8), wall: 0x102030, roof: 0xff8000 }], TONES, FAR);
    expect(new Set(roofColors(geometry))).toEqual(new Set([rgb(0x102030), rgb(0xff8000)]));
  });

  it("APP-003: l'ombrage par sommet assombrit les murs vers le pied, le toit garde toute sa lumière", () => {
    const geometry = buildBuildingsGeometry([{ ...square(0, 0, 10), wall: 0xffffff }], TONES, FAR);
    const position = geometry.getAttribute("position");
    const normal = geometry.getAttribute("normal");
    const color = geometry.getAttribute("color");
    const light = (y: number, roof: boolean) =>
      Array.from({ length: position.count }, (_, i) => i).filter((i) => (normal.getY(i) > 0.5) === roof && Math.abs(position.getY(i) - y) < 1e-6).map((i) => color.getX(i));
    expect(new Set(light(0, false))).toEqual(new Set([Math.fround(FOOT_LIGHT)]));
    expect(new Set(light(10, false))).toEqual(new Set([1]));
    expect(new Set(light(10, true))).toEqual(new Set([1]));
  });

  it("APP-003: toits à deux pans et auvents s'ajoutent au même maillage, dans les plafonds, sans texture", () => {
    const near = createPath(Array.from({ length: 5 }, (_, i) => ({ x: -5, z: 20 - i * 10 })));
    const flat = buildBuildingsGeometry([square(0, 0, 8)], TONES, near);
    const gabled = buildBuildingsGeometry([{ ...square(0, 0, 8), roofShape: "gabled" }], TONES, near);
    const none = buildBuildingsGeometry([square(0, 0, 8)], TONES, FAR);
    // Auvent : 12 sommets ; toit à deux pans : 18 de plus.
    expect(flat.getAttribute("position").count - none.getAttribute("position").count).toBe(12);
    expect(gabled.getAttribute("position").count - flat.getAttribute("position").count).toBe(18);
    expect(gabled.hasAttribute("uv")).toBe(false);
    const many = Array.from({ length: MAX_AWNINGS + 30 }, (_, i) => square(i * 30, 0, 8));
    const withAwnings = buildBuildingsGeometry(many, TONES, createPath(Array.from({ length: 300 }, (_, i) => ({ x: i * 10, z: -1 }))));
    const bare = buildBuildingsGeometry(many, TONES, FAR);
    expect(withAwnings.getAttribute("position").count - bare.getAttribute("position").count).toBe(MAX_AWNINGS * 12);
  });

  it("APP-003: la couleur des toits à deux pans est celle du toit du bâtiment", () => {
    const route = createPath([{ x: -5, z: 20 }, { x: -5, z: -20 }]);
    const geometry = buildBuildingsGeometry([{ ...square(0, 0, 8), roof: 0xff8000, roofShape: "gabled" }], TONES, route);
    expect(roofColors(geometry)).toContain(rgb(0xff8000));
  });
});
