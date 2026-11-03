import { describe, expect, it } from "vitest";
import { buildingSeed, hash32, seededRandom } from "./facade-seed.ts";
import type { Building } from "./souq-data.ts";

const at = (x: number, id?: number): Building => ({ ...(id === undefined ? {} : { id }), heightM: 6, footprint: [{ x, z: 3 }, { x: x + 4, z: 3 }, { x: x + 4, z: 7 }, { x, z: 3 }] });

describe("graine des façades", () => {
  it("APP-008: la même graine donne exactement la même suite, une autre graine une suite différente", () => {
    const draw = (seed: number): number[] => { const next = seededRandom(seed); return Array.from({ length: 5 }, next); };
    expect(draw(42)).toEqual(draw(42));
    expect(draw(42)).not.toEqual(draw(43));
    expect(draw(7).every((v) => v >= 0 && v < 1)).toBe(true);
    expect(hash32(1)).not.toBe(hash32(2));
  });

  it("APP-008: la graine d'un bâtiment vient de son identifiant OSM, sinon de sa position", () => {
    expect(buildingSeed(at(0, 6113066918))).toBe(buildingSeed(at(50, 6113066918)));
    expect(buildingSeed(at(0, 1))).not.toBe(buildingSeed(at(0, 2)));
    expect(buildingSeed(at(0))).toBe(buildingSeed(at(0)));
    expect(buildingSeed(at(0))).not.toBe(buildingSeed(at(9)));
  });
});
