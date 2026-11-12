import { describe, expect, it } from "vitest";
import type { Region } from "./facade-family.ts";
import { shopOf } from "./shop-rules.ts";
import type { Building } from "./souq-data.ts";

const base = (extra: Partial<Building> = {}): Building => ({ id: 101, heightM: 9, footprint: [{ x: 0, z: 0 }, { x: 8, z: 0 }, { x: 8, z: 8 }, { x: 0, z: 0 }], ...extra });
const REGIONS: Region[] = ["provence", "italie", "caucase", "france-nord", "inde", "golfe", "ailleurs"];

describe("boutiques par règle", () => {
  it("APP-013: un usage relevé ou une balise commerciale donne une boutique « relevée » dans toutes les régions", () => {
    for (const region of REGIONS) {
      expect(shopOf(base({ usage: "food", kind: "house" }), region, 2)).toMatchObject({ shop: true, origin: "releve" });
      expect(shopOf(base({ kind: "retail" }), region, 2)).toMatchObject({ shop: true, origin: "releve" });
    }
  });

  it("APP-008: sans usage, une part de la région reçoit une boutique « règle », jamais une église ni une tour", () => {
    for (const region of REGIONS) {
      const shops = Array.from({ length: 300 }, (_, i) => shopOf(base({ id: i + 1, kind: "yes" }), region, 2));
      expect(shops.some((s) => s.origin === "regle")).toBe(true);
      expect(shops.some((s) => s.origin === undefined)).toBe(true);
      expect(shops.every((s) => s.origin !== "releve" && s.shop === (s.origin !== undefined))).toBe(true);
      expect(shops.filter((s) => !s.shop).every((s) => s.awning === "none")).toBe(true);
      expect(shopOf(base({ kind: "church", id: 7 }), region, 2).shop).toBe(false);
      expect(Array.from({ length: 100 }, (_, i) => shopOf(base({ id: i + 1, kind: "yes" }), region, 9)).some((s) => s.shop)).toBe(false);
    }
  });

  it("APP-008: le tirage est le même à chaque appel et la règle change d'une région à l'autre", () => {
    expect(shopOf(base(), "inde", 2)).toEqual(shopOf(base(), "inde", 2));
    const share = (region: Region): number => Array.from({ length: 400 }, (_, i) => shopOf(base({ id: i + 1 }), region, 2)).filter((s) => s.shop).length;
    expect(share("inde")).toBeGreaterThan(share("provence"));
    expect(shopOf(base({ usage: "shop" }), "inde", 2).entryM).toBeGreaterThan(shopOf(base({ usage: "shop" }), "ailleurs", 2).entryM);
    const awnings = new Set(Array.from({ length: 100 }, (_, i) => shopOf(base({ id: i + 1, usage: "shop" }), "golfe", 2).awning));
    expect(awnings).toEqual(new Set(["arcade", "flat"]));
  });
});
