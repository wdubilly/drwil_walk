import { describe, expect, it } from "vitest";
import {
  DEFAULT_SPEED_KMH,
  MAX_SPEED_KMH,
  MIN_SPEED_KMH,
  clampSpeedKmh,
  formatSpeedKmh,
  kmhToMs,
  stepSpeedKmh,
} from "./speed.ts";

describe("vitesse de marche", () => {
  it("part de 4,0 km/h par défaut, dans une plage de 1 à 8 km/h", () => {
    expect(DEFAULT_SPEED_KMH).toBe(4);
    expect(MIN_SPEED_KMH).toBe(1);
    expect(MAX_SPEED_KMH).toBe(8);
  });

  it("borne la vitesse entre 1 et 8 km/h", () => {
    expect(clampSpeedKmh(0)).toBe(1);
    expect(clampSpeedKmh(-3)).toBe(1);
    expect(clampSpeedKmh(12)).toBe(8);
    expect(clampSpeedKmh(5.5)).toBe(5.5);
  });

  it("arrondit au pas de 0,1 km/h", () => {
    expect(clampSpeedKmh(4.04)).toBe(4);
    expect(clampSpeedKmh(4.06)).toBe(4.1);
  });

  it("revient à la vitesse par défaut sur une valeur invalide", () => {
    expect(clampSpeedKmh(Number.NaN)).toBe(DEFAULT_SPEED_KMH);
    expect(clampSpeedKmh(Number.POSITIVE_INFINITY)).toBe(DEFAULT_SPEED_KMH);
  });

  it("monte et descend de 0,1 km/h par cran sans dérive d'arrondi", () => {
    expect(stepSpeedKmh(4, 1)).toBe(4.1);
    expect(stepSpeedKmh(4, -1)).toBe(3.9);
    let speed = DEFAULT_SPEED_KMH;
    for (let i = 0; i < 10; i += 1) speed = stepSpeedKmh(speed, 1);
    expect(speed).toBe(5);
  });

  it("ne dépasse pas les bornes en crans successifs", () => {
    expect(stepSpeedKmh(8, 1)).toBe(8);
    expect(stepSpeedKmh(1, -1)).toBe(1);
  });

  it("convertit les km/h en m/s", () => {
    expect(kmhToMs(3.6)).toBe(1);
    expect(kmhToMs(DEFAULT_SPEED_KMH)).toBeCloseTo(1.111, 3);
  });

  it("affiche la vitesse à la française, avec une décimale", () => {
    expect(formatSpeedKmh(4)).toBe("4,0 km/h");
    expect(formatSpeedKmh(5.25)).toBe("5,3 km/h");
  });
});
