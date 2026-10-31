import { describe, expect, it } from "vitest";
import {
  DEFAULT_SPEED_KMH,
  MAX_SPEED_KMH,
  MIN_SPEED_KMH,
  clampSpeedKmh,
  formatSpeedKmh,
  kmhToMs,
  speedBoundMessage,
  speedLimitMessage,
  SPEED_RANGE_TEXT,
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

  it("QUA-002: dit la limite et la raison quand une vitesse saisie est hors de la plage", () => {
    expect(SPEED_RANGE_TEXT).toBe("De 1 à 8 km/h, par sécurité sur le tapis.");
    expect(speedLimitMessage(50)).toBe("50 km/h dépasse la limite : 8,0 km/h retenus, par sécurité sur le tapis.");
    expect(speedLimitMessage(0.5)).toBe("0,5 km/h est sous la limite : 1,0 km/h retenus, plage de 1 à 8 km/h.");
    expect(speedLimitMessage(5)).toBe("");
    expect(speedLimitMessage(8)).toBe("");
    expect(speedLimitMessage(Number.NaN)).toBe("Vitesse illisible : 4,0 km/h retenus.");
  });

  it("QUA-002: dit qu'une vitesse est à la borne quand le joystick tente de la dépasser", () => {
    expect(speedBoundMessage(8)).toBe("Vitesse au maximum : 8 km/h, limite de sécurité sur le tapis.");
    expect(speedBoundMessage(1)).toBe("Vitesse au minimum : 1 km/h.");
    expect(speedBoundMessage(4)).toBe("");
  });
});
