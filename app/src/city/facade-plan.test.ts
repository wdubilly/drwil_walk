import { describe, expect, it } from "vitest";
import { VARIANT_COUNT, planFacade, resolveFloors, signatureOf, startVariant } from "./facade-plan.ts";
import type { Building } from "./souq-data.ts";

const base = (extra: Partial<Building> = {}): Building => ({ id: 101, heightM: 9, footprint: [{ x: 0, z: 0 }, { x: 8, z: 0 }, { x: 8, z: 8 }, { x: 0, z: 0 }], ...extra });

describe("plan d'une façade", () => {
  it("APP-008: les étages d'OpenStreetMap règlent les ouvertures, avec repli sur la hauteur quand ils manquent ou la contredisent", () => {
    expect(resolveFloors(9, 3)).toEqual({ floors: 3, floorM: 3 });
    expect(resolveFloors(9, undefined)).toEqual({ floors: 3, floorM: 3 });
    expect(resolveFloors(7, undefined).floors).toBe(2);
    expect(resolveFloors(3, 1)).toEqual({ floors: 1, floorM: 3 });
    // 12 étages dans 9 m : incohérent, la hauteur gagne ; un seul étage dans 30 m aussi.
    expect(resolveFloors(9, 12).floors).toBe(3);
    expect(resolveFloors(30, 1).floors).toBe(9);
    expect(resolveFloors(1, undefined).floors).toBe(1);
    expect(resolveFloors(500, undefined).floors).toBe(30);
    expect(resolveFloors(500, 30).floors).toBe(30);
  });

  it("APP-008: le plan est le même à chaque appel et dépend de l'identifiant OSM", () => {
    const [v1, v2] = [startVariant(base()), startVariant(base({ id: 102 }))];
    expect(v1).toBe(startVariant(base()));
    expect(v1).toBeGreaterThanOrEqual(0);
    expect(v1).toBeLessThan(VARIANT_COUNT);
    expect(planFacade(base(), "ailleurs", v1)).toEqual(planFacade(base(), "ailleurs", v1));
    const variants = new Set(Array.from({ length: 40 }, (_, i) => startVariant(base({ id: i + 1 }))));
    expect(variants.size).toBeGreaterThan(10);
    expect(v2).not.toBeUndefined();
  });

  it("APP-008: toutes les variantes donnent un plan complet, aux largeurs de travée et aux étages bornés", () => {
    for (const [region, kind] of [["provence", "house"], ["ailleurs", "apartments"], ["ailleurs", "church"], ["ailleurs", "retail"]] as const) {
      const plans = Array.from({ length: VARIANT_COUNT }, (_, v) => planFacade(base({ kind }), region, v));
      expect(plans.every((p) => p.bayM > 2 && p.bayM < 4.5 && p.floors >= 1 && p.floorM > 2 && p.doorSlot >= 0 && p.doorSlot < 1)).toBe(true);
      expect(new Set(plans.map(signatureOf)).size).toBeGreaterThan(20);
      expect(new Set(plans.map((p) => p.family)).size).toBe(1);
    }
  });

  it("APP-008: chaque famille a ses détails : volets, balcons, corniche, commerce", () => {
    const plans = (kind: string, region: "provence" | "ailleurs") => Array.from({ length: VARIANT_COUNT }, (_, v) => planFacade(base({ kind }), region, v));
    expect(plans("apartments", "ailleurs").every((p) => p.shutters === undefined)).toBe(true);
    expect(plans("house", "ailleurs").every((p) => p.balcony === 0 && p.shutters !== undefined)).toBe(true);
    expect(plans("mosque", "ailleurs").some((p) => p.shutters === undefined)).toBe(true);
    expect(plans("mosque", "ailleurs").some((p) => p.shutters !== undefined)).toBe(true);
    const provencal = Array.from({ length: 80 }, (_, i) => planFacade(base({ id: i, kind: "house", footprint: [{ x: i * 61, z: 0 }, { x: i * 61 + 8, z: 0 }, { x: i * 61 + 8, z: 8 }, { x: i * 61, z: 0 }] }), "provence", 5)).filter((p) => p.family === "provencale");
    expect(provencal.length).toBeGreaterThan(0);
    expect(provencal.every((p) => p.cornice >= 1)).toBe(true);
    expect(plans("retail", "ailleurs").every((p) => p.shop)).toBe(true);
    const byId = Array.from({ length: 200 }, (_, i) => planFacade(base({ id: i + 1, kind: "apartments" }), "ailleurs", 0));
    expect(byId.some((p) => p.shop)).toBe(true);
    expect(byId.some((p) => !p.shop)).toBe(true);
    expect(plans("apartments", "ailleurs").some((p) => p.cornice === 1)).toBe(true);
  });
});
