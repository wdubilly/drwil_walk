import { describe, expect, it } from "vitest";
import {
  DEFAULT_WEIGHT_KG,
  WEIGHT_STORAGE_KEY,
  advanceKcal,
  clearWeightKg,
  compassText,
  formatClock,
  formatKcal,
  loadWeightKg,
  parseWeightKg,
  saveWeightKg,
  type WeightStorage,
} from "./stats.ts";

function memory(initial?: string): WeightStorage & { data: Map<string, string> } {
  const data = new Map<string, string>(initial === undefined ? [] : [[WEIGHT_STORAGE_KEY, initial]]);
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v), removeItem: (k) => void data.delete(k) };
}
const refusing: WeightStorage = {
  getItem: () => {
    throw new Error("interdit");
  },
  setItem: () => {
    throw new Error("plein");
  },
  removeItem: () => {
    throw new Error("interdit");
  },
};

describe("calories estimées", () => {
  it("APP-002: dépendent de la vitesse, de la durée et du poids", () => {
    // 4 km/h, 70 kg : VO2 = 0,1 × 66,67 + 3,5 = 10,17 ml/kg/min, soit 3,56 kcal par minute.
    expect(advanceKcal(0, 4, 60, 70)).toBeCloseTo(3.558, 3);
    expect(advanceKcal(0, 4, 120, 70)).toBeCloseTo(2 * advanceKcal(0, 4, 60, 70), 6);
    expect(advanceKcal(0, 4, 60, 140)).toBeCloseTo(2 * advanceKcal(0, 4, 60, 70), 6);
    expect(advanceKcal(0, 6, 60, 70)).toBeGreaterThan(advanceKcal(0, 4, 60, 70));
    expect(advanceKcal(5, 4, 60, 70)).toBeCloseTo(5 + 3.558, 3);
  });

  it("APP-002: un pas de temps négatif, nul ou non fini n'ajoute rien", () => {
    for (const dt of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) expect(advanceKcal(2, 4, dt, 70)).toBe(2);
  });

  it("APP-002: s'écrivent « environ », arrondies", () => {
    expect(formatKcal(12.4)).toBe("environ 12 kcal");
    expect(formatKcal(0)).toBe("environ 0 kcal");
  });
});

describe("poids de l'utilisateur", () => {
  it("SEC-007: n'accepte qu'un poids plausible, virgule française comprise", () => {
    expect(parseWeightKg("72,5")).toBe(72.5);
    expect(parseWeightKg(80)).toBe(80);
    for (const bad of ["", "abc", "29", "251", undefined, null, Number.NaN]) expect(parseWeightKg(bad)).toBeUndefined();
    expect(DEFAULT_WEIGHT_KG).toBe(70);
  });

  it("SEC-007: se garde, se relit et s'efface dans le stockage local", () => {
    const storage = memory();
    expect(loadWeightKg(storage)).toBeUndefined();
    expect(saveWeightKg(storage, 72)).toBe(true);
    expect(loadWeightKg(storage)).toBe(72);
    expect(clearWeightKg(storage)).toBe(true);
    expect(storage.data.size).toBe(0);
    expect(loadWeightKg(memory("n'importe quoi"))).toBeUndefined();
  });

  it("SEC-007: sans stockage ou si le navigateur refuse, le dit au lieu de l'avaler", () => {
    expect(loadWeightKg(undefined)).toBeUndefined();
    expect(saveWeightKg(undefined, 70)).toBe(false);
    expect(clearWeightKg(undefined)).toBe(false);
    expect(loadWeightKg(refusing)).toBeUndefined();
    expect(saveWeightKg(refusing, 70)).toBe(false);
    expect(clearWeightKg(refusing)).toBe(false);
  });
});

describe("boussole et heure", () => {
  it("APP-002: donne le point cardinal et le cap de la direction de marche", () => {
    expect(compassText({ x: 0, z: -1 })).toBe("N 0°");
    expect(compassText({ x: 1, z: 0 })).toBe("E 90°");
    expect(compassText({ x: 0, z: 1 })).toBe("S 180°");
    expect(compassText({ x: -1, z: 0 })).toBe("O 270°");
    expect(compassText({ x: 1, z: -1 })).toBe("NE 45°");
    expect(compassText({ x: -1, z: -1 })).toBe("NO 315°");
  });

  it("APP-002: arrondit le cap à 5° et boucle à 360° vers le nord", () => {
    expect(compassText({ x: Math.sin((47 * Math.PI) / 180), z: -Math.cos((47 * Math.PI) / 180) })).toBe("NE 45°");
    expect(compassText({ x: -Math.sin((1 * Math.PI) / 180), z: -Math.cos((1 * Math.PI) / 180) })).toBe("N 0°");
  });

  it("APP-002: écrit l'heure locale sur deux chiffres", () => {
    expect(formatClock(new Date(2026, 10, 1, 9, 5))).toBe("09:05");
    expect(formatClock(new Date(2026, 10, 1, 23, 59))).toBe("23:59");
  });
});
