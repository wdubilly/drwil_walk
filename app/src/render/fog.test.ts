import { describe, expect, it } from "vitest";
import { FOG_START_M, HEADSET_FOG_MAX, SCREEN_FOG_MAX, VIEW_RANGE_M, fogFactorAt, fogFar, fogFor, fogSummary } from "./fog.ts";

describe("brouillard", () => {
  it("APP-011: au casque, le voile du brouillard ne dépasse jamais 0,15 d'opacité", () => {
    expect(HEADSET_FOG_MAX).toBe(0.15);
    const fog = fogFor("casque", 0x223344);
    for (let d = 0; d <= VIEW_RANGE_M; d += 10) expect(fogFactorAt(d, fog)).toBeLessThanOrEqual(HEADSET_FOG_MAX);
    expect(fogFactorAt(VIEW_RANGE_M, fog)).toBeCloseTo(HEADSET_FOG_MAX);
  });

  it("APP-001: le brouillard ne masque jamais un obstacle : rien n'est voilé à portée de pas", () => {
    const fog = fogFor("casque", 0x223344);
    expect(FOG_START_M).toBeGreaterThanOrEqual(5);
    for (const d of [0, 1, 2.5, FOG_START_M]) expect(fogFactorAt(d, fog)).toBe(0);
  });

  it("APP-011: le cheminement reste lisible : la voie et les flèches d'un carrefour gardent plus de 95 % de leurs couleurs", () => {
    const fog = fogFor("casque", 0x223344);
    // Les flèches d'un carrefour sont annoncées à 40 m et posées à 8 m du carrefour (APP-002).
    expect(fogFactorAt(48, fog)).toBeLessThan(0.05);
  });

  it("APP-011: sur un écran sans passthrough, le brouillard peut aller plus loin", () => {
    const fog = fogFor("ecran", 0xbfd9ef);
    expect(fogFactorAt(VIEW_RANGE_M, fog)).toBeCloseTo(SCREEN_FOG_MAX);
    expect(fog.color).toBe(0xbfd9ef);
  });

  it("APP-011: le brouillard total est calculé pour tenir le plafond sur toute la portée visible", () => {
    expect(fogFar(0, 100, 0.5)).toBe(200);
    expect(fogFactorAt(2000, { color: 0, near: 0, far: 200 })).toBe(1);
  });

  it("APP-011: le brouillard appliqué se lit en clair, éteint compris", () => {
    expect(fogSummary(null)).toBe("brouillard éteint");
    expect(fogSummary(fogFor("casque", 0))).toBe("brouillard 15 %");
  });
});
