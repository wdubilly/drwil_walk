import { describe, expect, it } from "vitest";
import {
  DEFAULT_GLOBAL_OPACITY_PCT,
  HEAD_DOWN_END_DEG,
  HEAD_DOWN_START_DEG,
  MAX_GLOBAL_OPACITY_PCT,
  MIN_GLOBAL_OPACITY_PCT,
  cityOpacity,
  clampGlobalOpacityPct,
  formatOpacity,
  headDownFactor,
  headPitchDownDeg,
} from "./visibility.ts";

/** Rotation autour de l'axe X (tangage) : un angle négatif baisse la tête. */
function pitch(deg: number) {
  const a = (deg * Math.PI) / 180 / 2;
  return { x: Math.sin(a), y: 0, z: 0, w: Math.cos(a) };
}

describe("APP-001: fondu de la ville tête baissée", () => {
  it("APP-001: lit l'inclinaison de la tête depuis l'orientation WebXR", () => {
    expect(headPitchDownDeg({ x: 0, y: 0, z: 0, w: 1 })).toBeCloseTo(0);
    expect(headPitchDownDeg(pitch(-30))).toBeCloseTo(30);
    expect(headPitchDownDeg(pitch(20))).toBeCloseTo(-20);
  });

  it("APP-001: l'inclinaison ne dépend pas de la direction où l'on regarde", () => {
    const yaw = Math.PI / 4;
    const p = pitch(-30);
    // Composition lacet puis tangage : q = qYaw * qPitch.
    const qy = { x: 0, y: Math.sin(yaw), z: 0, w: Math.cos(yaw) };
    const q = {
      x: qy.w * p.x,
      y: qy.y * p.w,
      z: -qy.y * p.x,
      w: qy.w * p.w,
    };
    expect(headPitchDownDeg(q)).toBeCloseTo(30);
  });

  it("APP-001: borne une orientation non normalisée au lieu de produire NaN", () => {
    expect(headPitchDownDeg({ x: -2, y: 0, z: 0, w: 2 })).toBeCloseTo(90);
    expect(headPitchDownDeg({ x: 2, y: 0, z: 0, w: 2 })).toBeCloseTo(-90);
  });

  it("APP-001: la ville reste pleine jusqu'à 25° puis s'efface jusqu'à disparaître", () => {
    expect(HEAD_DOWN_START_DEG).toBe(25);
    expect(headDownFactor(-10)).toBe(1);
    expect(headDownFactor(25)).toBe(1);
    expect(headDownFactor(32.5)).toBeCloseTo(0.5);
    expect(headDownFactor(HEAD_DOWN_END_DEG)).toBe(0);
    expect(headDownFactor(80)).toBe(0);
  });

  it("APP-001: une inclinaison illisible montre le réel plutôt que la ville", () => {
    expect(headDownFactor(Number.NaN)).toBe(0);
  });
});

describe("APP-001: opacité globale bornée entre 30 et 100 %", () => {
  it("APP-001: borne le réglage de l'utilisateur", () => {
    expect(MIN_GLOBAL_OPACITY_PCT).toBe(30);
    expect(MAX_GLOBAL_OPACITY_PCT).toBe(100);
    expect(clampGlobalOpacityPct(0)).toBe(30);
    expect(clampGlobalOpacityPct(150)).toBe(100);
    expect(clampGlobalOpacityPct(64.6)).toBe(65);
    expect(clampGlobalOpacityPct(Number.NaN)).toBe(DEFAULT_GLOBAL_OPACITY_PCT);
  });

  it("APP-001: combine le réglage global et le fondu tête baissée", () => {
    expect(cityOpacity(0, 100)).toBe(1);
    expect(cityOpacity(0, 10)).toBeCloseTo(0.3);
    expect(cityOpacity(32.5, 60)).toBeCloseTo(0.3);
    expect(cityOpacity(45, 100)).toBe(0);
  });
});

describe("affichage de l'opacité", () => {
  it("affiche un pourcentage entier", () => {
    expect(formatOpacity(0.754)).toBe("75 %");
    expect(formatOpacity(0)).toBe("0 %");
  });
});
