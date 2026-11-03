import { describe, expect, it } from "vitest";
import { FALLBACK_HOUR, daylightAt, daylightNow, hourOfDay, sunElevation } from "./daylight.ts";

describe("lumière du jour", () => {
  it("APP-011: l'éclairage suit l'heure locale réelle de l'utilisateur", () => {
    const midi = daylightNow(() => new Date(2026, 10, 3, 12, 0));
    const nuit = daylightNow(() => new Date(2026, 10, 3, 0, 0));
    expect(midi.sunIntensity).toBeGreaterThan(nuit.sunIntensity);
    expect(midi.hemiIntensity).toBeGreaterThan(nuit.hemiIntensity);
    // Le ciel de midi est plus clair que celui de la nuit, sur les trois canaux.
    expect(midi.skyColor).toBeGreaterThan(nuit.skyColor);
    expect(midi.fogColor).toBe(midi.skyColor);
  });

  it("APP-011: l'heure décimale vient de l'horloge locale, minutes comprises", () => {
    expect(hourOfDay(new Date(2026, 10, 3, 7, 30))).toBe(7.5);
    expect(hourOfDay(new Date(2026, 10, 3, 18, 0))).toBe(18);
  });

  it("APP-011: une heure illisible retombe sur le repli, jamais sur une ville noire", () => {
    expect(hourOfDay(new Date(Number.NaN))).toBe(FALLBACK_HOUR);
    const repli = daylightNow(() => new Date(Number.NaN));
    expect(repli).toEqual(daylightAt(FALLBACK_HOUR));
    expect(repli.sunIntensity).toBeGreaterThan(1);
  });

  it("APP-011: le soleil monte du lever au zénith et redescend au coucher", () => {
    expect(sunElevation(6)).toBeCloseTo(0);
    expect(sunElevation(12)).toBeCloseTo(1);
    expect(sunElevation(18)).toBeCloseTo(0);
    expect(sunElevation(0)).toBeCloseTo(-1);
    expect(daylightAt(8).sun.x).toBeGreaterThan(daylightAt(16).sun.x);
  });

  it("APP-011: la lumière reste toujours au-dessus de la ville, même la nuit", () => {
    for (let hour = 0; hour <= 24; hour += 0.5) {
      const light = daylightAt(hour);
      expect(light.sun.y).toBeGreaterThan(0);
      expect(light.sunIntensity).toBeGreaterThan(0);
      expect(light.hemiIntensity).toBeGreaterThan(0);
    }
  });
});
