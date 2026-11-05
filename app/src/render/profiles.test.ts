import { describe, expect, it } from "vitest";
import { MAX_FURNITURE, MAX_GENERATED_LAMPS, MAX_TREES } from "../city/props.ts";
import { FALLBACK_PROFILE, PROFILES, appliedPixelRatio, isProfileId, sceneOptionsOf, settingsOf } from "./profiles.ts";

describe("profils graphiques", () => {
  it("APP-006: trois profils figés, dont le repli est équilibré", () => {
    expect(PROFILES.map((p) => p.id)).toEqual(["performance", "equilibre", "qualite"]);
    expect(FALLBACK_PROFILE).toBe("equilibre");
    expect(isProfileId("qualite")).toBe(true);
    expect(isProfileId("ultra")).toBe(false);
    expect(isProfileId(undefined)).toBe(false);
  });

  it("APP-006: chaque profil règle les mêmes réglages de rendu, dans les plafonds des données", () => {
    for (const { settings } of PROFILES) {
      expect(Object.keys(settings).sort()).toEqual(["facades", "fog", "markings", "maxFurniture", "maxGeneratedLamps", "maxPedestrians", "maxTrees", "maxVehicles", "outlines", "pixelRatio", "richCity", "xrScale"]);
      expect(settings.maxTrees).toBeLessThanOrEqual(MAX_TREES);
      expect(settings.maxFurniture).toBeLessThanOrEqual(MAX_FURNITURE);
      expect(settings.maxGeneratedLamps).toBeLessThanOrEqual(MAX_GENERATED_LAMPS);
    }
    expect(settingsOf("performance").richCity).toBe(false);
    // APP-009 : le profil le plus léger retire les marquages au sol, les autres les gardent.
    expect(PROFILES.map((p) => p.settings.markings)).toEqual([false, true, true]);
    expect(settingsOf("qualite").outlines).toBe(true);
    expect(settingsOf("equilibre")).toMatchObject({ outlines: false, richCity: true, maxTrees: MAX_TREES, maxFurniture: MAX_FURNITURE });
  });

  it("APP-011: le profil règle le brouillard et garde le repli désactivé sur le profil le plus léger", () => {
    expect(PROFILES.map((p) => p.settings.fog)).toEqual([false, true, true]);
    expect(settingsOf("n'importe quoi").fog).toBe(true);
    // Le brouillard n'est pas une option de la scène : l'ambiance l'applique à part (APP-001).
    expect(Object.keys(sceneOptionsOf(settingsOf("qualite")))).not.toContain("fog");
  });

  it("APP-006 APP-013: les lampadaires produits ont leur plafond par profil, distinct de celui du mobilier, le plus bas en performance", () => {
    expect(PROFILES.map((p) => p.settings.maxGeneratedLamps)).toEqual([100, 300, 300]);
    expect(sceneOptionsOf(settingsOf("performance"))).toMatchObject({ maxFurniture: 120, maxGeneratedLamps: 100 });
  });

  it("APP-006 APP-014: les figurants ont leur plafond par profil, véhicules et piétons, le plus bas en performance", () => {
    expect(PROFILES.map((p) => [p.settings.maxVehicles, p.settings.maxPedestrians])).toEqual([[8, 16], [20, 40], [30, 60]]);
    expect(sceneOptionsOf(settingsOf("performance"))).toMatchObject({ maxVehicles: 8, maxPedestrians: 16 });
  });

  it("APP-006: un identifiant inconnu retombe sur le réglage équilibré", () => {
    expect(settingsOf("n'importe quoi")).toBe(settingsOf("equilibre"));
  });

  it("APP-001: aucun profil ne porte de réglage de sécurité-visibilité", () => {
    for (const { settings } of PROFILES) {
      expect(Object.keys(settings).filter((key) => /opacit|vignette|zone|fondu|visib/i.test(key))).toEqual([]);
    }
    expect(Object.keys(sceneOptionsOf(settingsOf("qualite"))).sort()).toEqual(["facades", "markings", "maxFurniture", "maxGeneratedLamps", "maxPedestrians", "maxTrees", "maxVehicles", "outlines", "richCity"]);
  });

  it("APP-006: le ratio de pixels ne dépasse jamais celui de l'écran et reste lisible", () => {
    const quality = settingsOf("qualite");
    expect(appliedPixelRatio(quality, 3)).toBe(2);
    expect(appliedPixelRatio(quality, 1)).toBe(1);
    expect(appliedPixelRatio(quality, 0.25)).toBe(0.5);
    expect(appliedPixelRatio(quality, Number.NaN)).toBe(1);
    expect(appliedPixelRatio(settingsOf("performance"), 2)).toBe(0.75);
  });
  it("APP-008: le profil règle le détail des façades : réduit en performance, complet ailleurs, jamais sans le repli", () => {
    expect(PROFILES.map((p) => [p.id, p.settings.facades])).toEqual([["performance", "reduced"], ["equilibre", "full"], ["qualite", "full"]]);
    expect(sceneOptionsOf(settingsOf("performance")).facades).toBe("reduced");
  });
});
