import { describe, expect, it } from "vitest";
import { BENCH_BACK_M, BENCH_SEAT_M, BIN_HEIGHT_M, LAMP_HEIGHT_M, SIGN_HEIGHT_M, furnitureParts, mergeParts } from "./furniture.ts";
import type { Prop } from "./souq-data.ts";

const at = (kind: Prop["kind"], x = 0, z = 0): Prop => ({ kind, at: { x, z } });
/** La boîte englobante des pièces d'un mobilier, posé à l'origine, sans rotation. */
function box(kind: Prop["kind"], yaw = 0): { x: number; y: number; z: number; minY: number } {
  const geometry = mergeParts(furnitureParts(at(kind), yaw));
  geometry.computeBoundingBox();
  const { min, max } = geometry.boundingBox ?? { min: { x: 0, y: 0, z: 0 }, max: { x: 0, y: 0, z: 0 } };
  return { x: max.x - min.x, y: max.y - min.y, z: max.z - min.z, minY: min.y };
}

describe("mobilier urbain produit par code", () => {
  it("APP-009: lampadaire, banc, poubelle et panneau sont aux dimensions réelles, posés au sol", () => {
    expect(box("lamp").y).toBeCloseTo(LAMP_HEIGHT_M, 1);
    expect(box("bench").y).toBeCloseTo(BENCH_BACK_M, 1);
    const seat = mergeParts(furnitureParts(at("bench"), 0).slice(0, 1));
    seat.computeBoundingBox();
    expect(seat.boundingBox?.max.y).toBeCloseTo(BENCH_SEAT_M, 1);
    expect(box("bench").x).toBeCloseTo(1.8, 1);
    expect(box("bin").y).toBeCloseTo(BIN_HEIGHT_M, 1);
    expect(box("sign").y).toBeCloseTo(SIGN_HEIGHT_M, 1);
    for (const kind of ["lamp", "bench", "bin", "sign"] as const) expect(box(kind).minY).toBeCloseTo(0);
  });

  it("APP-009: chaque pièce porte sa teinte par sommet, et un arbre n'est pas du mobilier", () => {
    const geometry = mergeParts(furnitureParts(at("sign"), 0));
    expect(geometry.getAttribute("color").count).toBe(geometry.getAttribute("position").count);
    expect(furnitureParts(at("tree"), 0)).toEqual([]);
    expect(mergeParts([]).hasAttribute("position")).toBe(false);
  });

  it("APP-009: le cap de la rue tourne le mobilier, qui reste à sa place", () => {
    const turned = box("bench", Math.PI / 2);
    expect(turned.z).toBeCloseTo(1.8, 1);
    expect(turned.x).toBeCloseTo(box("bench").z, 1);
    const moved = mergeParts(furnitureParts({ kind: "bin", at: { x: 12, z: -4 } }, 0));
    moved.computeBoundingBox();
    expect(moved.boundingBox?.max.x).toBeLessThan(13);
    expect(moved.boundingBox?.min.z).toBeGreaterThan(-5);
  });
});
