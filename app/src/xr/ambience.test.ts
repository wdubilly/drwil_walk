import { Color, DirectionalLight, HemisphereLight, Scene } from "three";
import { describe, expect, it } from "vitest";
import { HEADSET_FOG_MAX, fogFactorAt, VIEW_RANGE_M } from "../render/fog.ts";
import { startAmbience } from "./ambience.ts";

function scene() {
  const s = new Scene();
  s.add(new HemisphereLight(0xffffff, 0x444444, 1.2), new DirectionalLight(0xffffff, 1.6));
  return s;
}

const at = (hour: number) => () => new Date(2026, 10, 3, hour, 0);

function options(over: { fog?: boolean; soundPct?: number; hour?: number } = {}) {
  return { scene: scene(), target: "casque" as const, fog: over.fog ?? false, soundPct: over.soundPct ?? 0, now: at(over.hour ?? 12), window: null };
}

const lights = (s: Scene) => ({
  hemi: s.children.find((c): c is HemisphereLight => c instanceof HemisphereLight),
  sun: s.children.find((c): c is DirectionalLight => c instanceof DirectionalLight),
});

describe("ambiance de la scène", () => {
  it("APP-011: les lumières de la scène suivent l'heure réelle", () => {
    const jour = options({ hour: 13 });
    startAmbience(jour);
    const nuit = options({ hour: 2 });
    startAmbience(nuit);
    expect(lights(jour.scene).sun?.intensity).toBeGreaterThan(lights(nuit.scene).sun?.intensity ?? 0);
    expect(lights(jour.scene).hemi?.intensity).toBeGreaterThan(lights(nuit.scene).hemi?.intensity ?? 0);
    expect(lights(jour.scene).sun?.position.y).toBeGreaterThan(0);
  });

  it("APP-001: au casque, aucun ciel n'est posé et le brouillard est éteint par défaut", () => {
    const o = options();
    const ambience = startAmbience(o);
    expect(o.scene.background).toBeNull();
    expect(o.scene.fog).toBeNull();
    expect(ambience.fog).toBeNull();
    expect(ambience.summary).toBe("brouillard éteint · sons 0 %");
  });

  it("APP-001: le brouillard allumé au casque reste sous son plafond et ne pose jamais de fond", () => {
    const o = options({ fog: true });
    const ambience = startAmbience(o);
    expect(o.scene.background).toBeNull();
    expect(o.scene.fog).not.toBeNull();
    expect(ambience.fog).not.toBeNull();
    expect(fogFactorAt(VIEW_RANGE_M, ambience.fog as { color: number; near: number; far: number })).toBeCloseTo(HEADSET_FOG_MAX);
    expect(ambience.summary).toBe("brouillard 15 % · sons 0 %");
  });

  it("APP-011: sur un écran sans passthrough, le ciel suit l'heure et le brouillard peut aller plus loin", () => {
    const o = { ...options({ fog: true, hour: 13 }), target: "ecran" as const };
    const ambience = startAmbience(o);
    expect(o.scene.background).toBeInstanceOf(Color);
    expect(ambience.summary).toBe("brouillard 90 % · sons 0 %");
  });

  it("APP-011: le volume choisi se lit sur la page, sans son sans navigateur audio", () => {
    const ambience = startAmbience({ ...options({ soundPct: 100 }), window: null });
    expect(ambience.summary).toBe("brouillard éteint · sons 20 %");
    expect(() => { ambience.stop(); }).not.toThrow();
  });
});
