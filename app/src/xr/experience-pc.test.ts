import type { Scene } from "three";
import { describe, expect, it } from "vitest";
import { testPack } from "../city/tree-pack-double.ts";
import { PC_ACTIVE_STATUS, PC_ENDED_STATUS, PC_GOOGLE_NOTICE } from "../pc/enter-pc.ts";
import { setup } from "./experience-double.ts";

const read = (t: ReturnType<typeof setup>, name: string) => Number(t.panel()?.getAttribute(name));

async function walking(options: Parameters<typeof setup>[0] = {}) {
  const t = setup(options);
  await t.enterPc();
  t.frame(0);
  return t;
}

describe("version PC (sans casque)", () => {
  it("APP-002: le bouton Version PC lance la marche dans un canvas de la page, sans ouvrir de session WebXR", async () => {
    const t = setup();
    await t.enterPc();
    expect(t.status()).toBe(PC_ACTIVE_STATUS);
    expect(t.xr.requestSession).not.toHaveBeenCalled();
    expect(t.root.contains(t.fake.canvas)).toBe(true);
    expect(t.fake.canvas.className).toBe("pc-canvas");
    expect(t.panel()?.getAttribute("data-mode")).toBe("pc");
    expect(t.fake.setSize).toHaveBeenCalledWith(t.win.innerWidth, t.win.innerHeight);
    t.frame(0);
    t.frame(1000);
    expect(read(t, "data-distance-m")).toBeCloseTo(4 / 3.6);
    expect(read(t, "data-building-count")).toBeGreaterThan(100);
    expect(t.fake.render).toHaveBeenCalledTimes(2);
  });

  it("APP-002: même ville, même parcours et même vitesse que dans le casque", async () => {
    const pc = await walking();
    pc.frame(10_000);
    const headset = setup();
    await headset.enter();
    headset.frame(0, { getViewerPose: () => undefined } as unknown as XRFrame);
    expect(read(pc, "data-building-count")).toBe(read(headset, "data-building-count"));
    expect(read(pc, "data-speed-kmh")).toBe(4);
    expect(read(pc, "data-distance-m")).toBeCloseTo(40 / 3.6);
    expect(pc.panel()?.getAttribute("data-compass")).toBeTruthy();
  });

  it("APP-001: la version PC n'applique ni fondu, ni zone tapis, ni vignette, et le casque n'ouvre toujours que immersive-ar", async () => {
    const pc = await walking();
    pc.mouse("mousedown", {}, pc.fake.canvas);
    pc.mouse("mousemove", { movementY: 400 });
    pc.frame(1000);
    expect(pc.panel()?.getAttribute("data-city-opacity")).toBe("1");
    expect(pc.panel()?.getAttribute("data-zone")).toBe("aucune");
    expect(pc.panel()?.getAttribute("data-vignette")).toBe("false");
    expect(pc.fake.renderer?.localClippingEnabled).toBe(false);
    const scene = pc.fake.render.mock.calls.at(-1)?.[0] as Scene;
    expect(scene.getObjectByName("vignette")).toBeUndefined();
    const headset = setup();
    await headset.enter();
    expect(headset.xr.requestSession).toHaveBeenCalledWith("immersive-ar", expect.anything());
    expect(headset.panel()?.getAttribute("data-mode")).toBeNull();
  });

  it("APP-002: Espace met en pause et reprend, une seule fois par pression", async () => {
    const t = await walking();
    t.frame(1000);
    expect(t.press(" ").defaultPrevented).toBe(true);
    t.frame(2000);
    expect(t.panel()?.getAttribute("data-paused")).toBe("true");
    expect(t.panel()?.textContent).toContain("la touche Espace la reprend");
    const frozen = read(t, "data-distance-m");
    t.frame(3000);
    expect(read(t, "data-distance-m")).toBe(frozen);
    t.press(" ", { repeat: true });
    t.frame(4000);
    expect(t.panel()?.getAttribute("data-paused")).toBe("true");
    t.press("p");
    t.frame(5000);
    expect(t.panel()?.getAttribute("data-paused")).toBe("false");
  });

  it("APP-002: la vitesse monte et descend de 0,1 km/h par pression (toutes comptent, même entre deux images), par pas de 1 km/h avec PageHaut et PageBas, dans la plage de 1 à 8", async () => {
    const t = await walking();
    t.press("ArrowUp");
    t.press("+");
    t.frame(1000);
    expect(read(t, "data-speed-kmh")).toBe(4.2);
    t.press("ArrowDown");
    t.press("-");
    t.press("-");
    t.frame(2000);
    expect(read(t, "data-speed-kmh")).toBe(3.9);
    t.press("PageUp");
    t.frame(3000);
    expect(read(t, "data-speed-kmh")).toBe(4.9);
    t.press("PageUp");
    t.press("PageUp");
    t.press("PageUp");
    t.press("PageUp");
    t.frame(4000);
    expect(read(t, "data-speed-kmh")).toBe(8);
    expect(t.panel()?.textContent).toContain("Vitesse au maximum");
    for (let i = 0; i < 9; i++) t.press("PageDown");
    t.frame(5000);
    expect(read(t, "data-speed-kmh")).toBe(1);
  });

  it("APP-002: R recale le parcours sur le regard sans toucher à la distance, H masque le tableau mais pas les mentions", async () => {
    const t = await walking();
    t.frame(2000);
    const distance = read(t, "data-distance-m");
    t.mouse("mousedown", {}, t.fake.canvas);
    t.mouse("mousemove", { movementX: -250 });
    t.mouse("mouseup");
    t.mouse("mousemove", { movementX: 999 });
    t.press("r");
    t.frame(3000);
    // 250 px vers la gauche à 0,004 rad par pixel : un radian vers la gauche.
    expect(read(t, "data-calibration-yaw")).toBeCloseTo(1, 5);
    expect(read(t, "data-calibration-x")).toBe(0);
    expect(read(t, "data-distance-m")).toBeGreaterThan(distance);
    expect(t.panel()?.getAttribute("data-hud-visible")).toBe("true");
    t.press("h");
    t.frame(4000);
    expect(t.panel()?.getAttribute("data-hud-visible")).toBe("false");
    expect(t.panel()?.querySelector<HTMLElement>("dl")?.hidden).toBe(true);
    expect(t.panel()?.querySelector(".attribution")?.textContent).toContain("OpenStreetMap");
    t.press("H");
    t.frame(5000);
    expect(t.panel()?.querySelector<HTMLElement>("dl")?.hidden).toBe(false);
  });

  it("une touche inconnue ou un raccourci du navigateur ne fait rien", async () => {
    const t = await walking();
    expect(t.press("x").defaultPrevented).toBe(false);
    expect(t.press("r", { ctrlKey: true }).defaultPrevented).toBe(false);
    t.frame(1000);
    expect(t.panel()?.getAttribute("data-calibration-yaw")).toBe("0");
  });

  it("Échap arrête la marche, retire le canvas et le panneau, et rend les deux boutons", async () => {
    const t = await walking();
    t.press("Escape");
    t.frame(1000);
    expect(t.status()).toBe(PC_ENDED_STATUS);
    expect(t.panel()).toBeNull();
    expect(t.root.contains(t.fake.canvas)).toBe(false);
    expect(t.fake.dispose).toHaveBeenCalled();
    expect(t.root.querySelector<HTMLButtonElement>("button.enter")?.disabled).toBe(false);
    expect(t.root.querySelector<HTMLButtonElement>("button.enter-pc")?.disabled).toBe(false);
    t.press(" ");
    t.mouse("mousemove", { movementX: 50 });
    t.win.dispatchEvent(new t.win.Event("resize"));
    expect(t.fake.setSize).toHaveBeenCalledTimes(1);
  });

  it("le redimensionnement de la fenêtre ajuste le canvas", async () => {
    const t = await walking();
    t.win.happyDOM.setViewport({ width: 640, height: 480 });
    t.win.dispatchEvent(new t.win.Event("resize"));
    expect(t.fake.setSize).toHaveBeenLastCalledWith(640, 480);
  });

  it("QUA-002: le rendu Google demandé est dit indisponible en version PC, la marche est en OpenStreetMap", async () => {
    const t = setup();
    t.chooseGoogle();
    await t.enterPc();
    expect(t.notice()).toBe(PC_GOOGLE_NOTICE);
    t.frame(0);
    expect(t.panel()?.getAttribute("data-rendering")).toBe("osm");
    expect(t.create).not.toHaveBeenCalled();
  });

  it("QUA-002: sans WebXR, la version PC se lance ; le bouton du casque dit l'échec sans bloquer l'application", async () => {
    const t = setup({ xr: false });
    await t.enter();
    expect(t.status()).toContain("WebXR indisponible");
    expect(t.root.querySelector<HTMLButtonElement>("button.enter-pc")?.disabled).toBe(false);
    await t.enterPc();
    expect(t.status()).toBe(PC_ACTIVE_STATUS);
  });

  it("QUA-002: un trajet libre non préparé est dit et ne lance rien", async () => {
    const t = setup();
    t.root.querySelector<HTMLInputElement>("input[value='libre']")?.click();
    await t.enterPc();
    expect(t.status()).toContain("posez un départ et une arrivée");
    expect(t.root.contains(t.fake.canvas)).toBe(false);
    expect(t.root.querySelector<HTMLButtonElement>("button.enter-pc")?.disabled).toBe(false);
  });

  it("QUA-002: un échec au lancement, avec ou sans message d'erreur, est dit et rend les boutons", async () => {
    const withMessage = setup({ rendererThrows: new Error("contexte WebGL refusé") });
    await withMessage.enterPc();
    expect(withMessage.status()).toBe("contexte WebGL refusé");
    const bare = setup({ rendererThrows: "refus" });
    await bare.enterPc();
    expect(bare.status()).toBe("refus");
    expect(bare.root.querySelector<HTMLButtonElement>("button.enter-pc")?.disabled).toBe(false);
  });

  it("APP-002: avec le pack chargé, la marche PC dessine les arbres du pack", async () => {
    const t = await walking({ trees: () => testPack() });
    const scene = (t.fake.render.mock.lastCall as [Scene])[0];
    expect(scene.getObjectByName("arbres")?.children.length).toBeGreaterThan(0);
    expect(t.notice()).toBe("");
  });

  it("QUA-002: l'échec du chargement des arbres est dit et la marche se lance quand même", async () => {
    const t = setup({ trees: () => Promise.reject(new Error("réseau coupé")) });
    await t.enterPc();
    expect(t.status()).toBe(PC_ACTIVE_STATUS);
    expect(t.notice()).toContain("Arbres stylisés indisponibles (réseau coupé)");
  });
});
