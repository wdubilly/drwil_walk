import type { Scene } from "three";
import { describe, expect, it } from "vitest";
import { ACTIVE_STATUS, ENDED_STATUS } from "./experience.ts";
import { poseFrame, setup } from "./experience-double.ts";

/** Allume la préférence de brouillard (APP-011). */
function tickFog(t: ReturnType<typeof setup>): void {
  t.home.preferences.change({ ...t.home.preferences.read(), fog: true });
}

describe("expérience en réalité mixte", () => {
  it("APP-001: entre en session immersive-ar et lance la marche dans le souk", async () => {
    const t = setup();
    await t.enter();
    expect(t.xr.requestSession).toHaveBeenCalledWith("immersive-ar", expect.anything());
    expect(t.status()).toBe(ACTIVE_STATUS);
    expect(t.root.contains(t.fake.canvas)).toBe(true);
    t.frame(0, poseFrame(0));
    t.frame(1000, poseFrame(0));
    expect(Number(t.panel()?.getAttribute("data-distance-m"))).toBeCloseTo(4 / 3.6);
    expect(t.fake.render).toHaveBeenCalledTimes(2);
  });

  it("APP-006: le casque applique l'échelle d'image du profil choisi, détecté d'abord puis manuel", async () => {
    const scale = (t: ReturnType<typeof setup>) => (t.fake.renderer as unknown as { xr: { setFramebufferScaleFactor: { mock: { calls: number[][] } } } }).xr.setFramebufferScaleFactor.mock.calls;
    const detected = setup();
    expect(detected.home.preferences.read().profile).toBe("equilibre");
    await detected.enter();
    expect(scale(detected)).toEqual([[1]]);
    const chosen = setup();
    chosen.home.preferences.change({ ...chosen.home.preferences.read(), profile: "performance" });
    await chosen.enter();
    expect(scale(chosen)).toEqual([[0.8]]);
    expect(chosen.root.dataset["profile"]).toBe("performance");
  });

  it("APP-011: le brouillard allumé à l'accueil reste plafonné au casque, et le profil le plus léger le refuse", async () => {
    const t = setup();
    tickFog(t);
    await t.enter();
    expect(t.root.dataset["ambiance"]).toBe("brouillard 15 % · sons 0 %");
    const light = setup();
    light.home.preferences.change({ ...light.home.preferences.read(), profile: "performance" });
    tickFog(light);
    await light.enter();
    expect(light.root.dataset["ambiance"]).toBe("brouillard éteint · sons 0 %");
  });

  it("APP-001: sans réglage d'ambiance, le casque garde le passthrough nu : ni brouillard, ni son", async () => {
    const t = setup();
    await t.enter();
    expect(t.root.dataset["ambiance"]).toBe("brouillard éteint · sons 0 %");
  });

  it("APP-002: la position suit le parcours du souk à la distance marchée", async () => {
    const t = setup();
    await t.enter();
    t.frame(0, poseFrame(0));
    t.frame(10_000, poseFrame(0));
    const at = (name: string) => Number(t.panel()?.getAttribute(name));
    const crow = Math.hypot(at("data-position-x"), at("data-position-z"));
    // 10 s à 4 km/h : 11,1 m le long de la ruelle, donc à moins de 11,1 m du départ à vol d'oiseau.
    expect(at("data-distance-m")).toBeCloseTo(40 / 3.6);
    expect(crow).toBeGreaterThan(5);
    expect(crow).toBeLessThanOrEqual(at("data-distance-m") + 1e-6);
    expect(at("data-building-count")).toBeGreaterThan(100);
  });

  it("APP-002: la page dit l'allure, la distance restante et la progression du tour en cours", async () => {
    const t = setup();
    await t.enter();
    t.frame(0, poseFrame(0));
    t.frame(10_000, poseFrame(0));
    const read = (name: string) => t.panel()?.getAttribute(name);
    expect(read("data-pace")).toBe("15:00 min/km");
    expect(Number(read("data-remaining-m"))).toBeGreaterThan(1000);
    expect(Number(read("data-progress-pct"))).toBeGreaterThanOrEqual(0);
    expect(t.panel()?.querySelector("[data-field='progress']")?.textContent).toMatch(/^\d+ %$/);
  });

  it("APP-002: l'itinéraire choisi à l'accueil détermine la ville et le tracé de la marche", async () => {
    const souk = setup();
    await souk.enter();
    const soukCount = Number(souk.panel()?.getAttribute("data-building-count"));
    const pune = setup();
    pune.root.querySelector<HTMLInputElement>("input[value='pune-vieille-ville']")?.click();
    await pune.enter();
    pune.frame(0, poseFrame(0));
    pune.frame(10_000, poseFrame(0));
    expect(pune.panel()?.getAttribute("data-building-count")).not.toBe(String(soukCount));
    expect(Number(pune.panel()?.getAttribute("data-building-count"))).toBeGreaterThan(1000);
    expect(Number(pune.panel()?.getAttribute("data-distance-m"))).toBeCloseTo(40 / 3.6);
  });

  it("APP-002: la Corniche de Doha se choisit et la marche suit sa propre boucle", async () => {
    const souk = setup();
    await souk.enter();
    const soukCount = Number(souk.panel()?.getAttribute("data-building-count"));
    const corniche = setup();
    corniche.root.querySelector<HTMLInputElement>("input[value='doha-corniche']")?.click();
    await corniche.enter();
    corniche.frame(0, poseFrame(0));
    corniche.frame(10_000, poseFrame(0));
    expect(corniche.panel()?.getAttribute("data-building-count")).not.toBe(String(soukCount));
    expect(Number(corniche.panel()?.getAttribute("data-building-count"))).toBeGreaterThan(500);
    expect(Number(corniche.panel()?.getAttribute("data-distance-m"))).toBeCloseTo(40 / 3.6);
  });

  it("APP-002: FC Road se choisit et la marche suit sa propre boucle", async () => {
    const souk = setup();
    await souk.enter();
    const soukCount = Number(souk.panel()?.getAttribute("data-building-count"));
    const fcRoad = setup();
    fcRoad.root.querySelector<HTMLInputElement>("input[value='pune-fc-road']")?.click();
    await fcRoad.enter();
    fcRoad.frame(0, poseFrame(0));
    fcRoad.frame(10_000, poseFrame(0));
    expect(fcRoad.panel()?.getAttribute("data-building-count")).not.toBe(String(soukCount));
    expect(Number(fcRoad.panel()?.getAttribute("data-building-count"))).toBeGreaterThan(500);
    expect(Number(fcRoad.panel()?.getAttribute("data-distance-m"))).toBeCloseTo(40 / 3.6);
  });

  it("change la vitesse au joystick droit", async () => {
    const t = setup();
    await t.enter();
    t.inputSources[0] = { handedness: "right", gamepad: { axes: [0, 0, 0, -1], buttons: [] } };
    t.frame(0, poseFrame(0));
    expect(t.panel()?.getAttribute("data-speed-kmh")).toBe("4.1");
  });

  it("APP-001: efface la ville tête baissée, ou sans pose, repère ou image", async () => {
    const t = setup();
    await t.enter();
    t.frame(0, poseFrame(-60));
    expect(t.panel()?.getAttribute("data-city-opacity")).toBe("0");
    t.frame(10, poseFrame(0));
    expect(t.panel()?.getAttribute("data-city-opacity")).toBe("1");
    t.frame(20, poseFrame(null));
    expect(t.panel()?.getAttribute("data-city-opacity")).toBe("0");
    const noSpace = setup({ space: false });
    await noSpace.enter();
    noSpace.frame(0, poseFrame(0));
    expect(noSpace.panel()?.getAttribute("data-city-opacity")).toBe("0");
  });

  it("signale un test qui pousse une image avant l'entrée en session", () => {
    expect(() => {
      setup().frame(0);
    }).toThrow("boucle de rendu non lancée");
  });

  it("ignore une image hors session, sans pose possible", async () => {
    const t = setup();
    await t.enter();
    t.frame(0);
    expect(t.fake.render).not.toHaveBeenCalled();
  });

  it("arrête le rendu et revient à l'accueil à la fin de la session", async () => {
    const t = setup();
    await t.enter();
    t.listeners.end?.();
    expect(t.fake.loop).toBeNull();
    expect(t.fake.dispose).toHaveBeenCalled();
    expect(t.panel()).toBeNull();
    expect(t.root.contains(t.fake.canvas)).toBe(false);
    expect(t.status()).toBe(ENDED_STATUS);
    expect(t.root.querySelector("button")?.disabled).toBe(false);
  });

  it("dit sur la page pourquoi la réalité mixte ne s'ouvre pas", async () => {
    const t = setup({ supported: false });
    await t.enter();
    expect(t.status()).toContain("immersive-ar");
    expect(t.root.querySelector("button")?.disabled).toBe(false);
    const none = setup({ xr: false });
    await none.enter();
    expect(none.status()).toContain("WebXR indisponible");
  });

  it("ne laisse ni boucle ni canevas si la session ne démarre pas dans le renderer", async () => {
    const t = setup({ sessionFails: true });
    await t.enter();
    expect(t.status()).toBe("contexte WebGL refusé");
    expect(t.fake.loop).toBeNull();
    expect(t.root.contains(t.fake.canvas)).toBe(false);
    expect(t.panel()).toBeNull();
  });

  it("affiche aussi un échec qui n'est pas une Error", async () => {
    const t = setup();
    t.xr.requestSession.mockImplementationOnce(() => Promise.reject(new Error("refus")));
    await t.enter();
    expect(t.status()).toBe("refus");
    // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- on vérifie justement l'affichage d'un rejet qui n'est pas une Error.
    t.xr.requestSession.mockImplementationOnce(() => Promise.reject("refus brut"));
    await t.enter();
    expect(t.status()).toBe("refus brut");
  });

  it("APP-002: dans le casque, le diagnostic est masqué par défaut et le bouton du panneau l'affiche sans changer la distance", async () => {
    const t = setup();
    await t.enter();
    Object.assign(t.fake.renderer as object, { info: { render: { calls: 9, triangles: 77 }, memory: { geometries: 4, textures: 2 } } });
    t.frame(0, poseFrame(0));
    t.frame(1000, poseFrame(0));
    const button = t.panel()?.querySelector<HTMLButtonElement>(".diagnostics button");
    const dd = (field: string) => t.panel()?.querySelector(`.diagnostics [data-field='${field}']`)?.textContent;
    expect(button?.textContent).toBe("Diagnostic de rendu");
    expect(dd("calls")).toBeUndefined();
    button?.click();
    t.frame(2000, poseFrame(0));
    expect([dd("calls"), dd("triangles")]).toEqual(["9", "77"]);
    expect(Number(t.panel()?.getAttribute("data-distance-m"))).toBeCloseTo(8 / 3.6);
    expect(Number(t.panel()?.getAttribute("data-speed-kmh"))).toBe(4);
  });

  it("APP-002: la minicarte du casque avance avec la marche et suit le fondu", async () => {
    const t = setup();
    await t.enter();
    t.frame(0, poseFrame(0));
    const first = t.root.dataset["minimap"];
    t.frame(60_000, poseFrame(0));
    expect(t.root.dataset["minimap"]).not.toBe(first);
    const map = (t.fake.render.mock.calls[0]?.[0] as Scene).getObjectByName("minimap");
    expect(map?.visible).toBe(true);
    t.frame(61_000, poseFrame(-60));
    expect(map?.visible).toBe(false);
  });
});
