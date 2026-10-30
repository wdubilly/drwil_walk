import { describe, expect, it } from "vitest";
import { STREET_LENGTH_M, advanceDistanceM, formatDistanceM, formatDurationS, streetOffsetM } from "./walk.ts";

describe("marche à la vitesse réglée", () => {
  it("avance de la vitesse multipliée par le temps", () => {
    // 3,6 km/h = 1 m/s.
    expect(advanceDistanceM(0, 3.6, 2)).toBeCloseTo(2);
    expect(advanceDistanceM(10, 7.2, 0.5)).toBeCloseTo(11);
  });

  it("borne la vitesse avant d'avancer", () => {
    expect(advanceDistanceM(0, 100, 1)).toBeCloseTo(8 / 3.6);
  });

  it("n'avance pas sur un pas de temps nul, négatif ou non fini", () => {
    expect(advanceDistanceM(5, 4, 0)).toBe(5);
    expect(advanceDistanceM(5, 4, -1)).toBe(5);
    expect(advanceDistanceM(5, 4, Number.NaN)).toBe(5);
  });

  it("fait boucler la rue au-delà de sa longueur", () => {
    expect(streetOffsetM(12)).toBe(12);
    expect(streetOffsetM(STREET_LENGTH_M + 3)).toBeCloseTo(3);
  });

  it("affiche la distance et le temps en français", () => {
    expect(formatDistanceM(12.345)).toBe("12,3 m");
    expect(formatDurationS(65.9)).toBe("1 min 05 s");
    expect(formatDurationS(0)).toBe("0 min 00 s");
  });
});
