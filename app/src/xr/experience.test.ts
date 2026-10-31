import { Window } from "happy-dom";
import { describe, expect, it, vi } from "vitest";
import { withCanvasContext } from "../city/canvas-double.ts";
import { ACTIVE_STATUS, ENDED_STATUS, startExperience, type RendererClass } from "./experience.ts";
import type { XrSystemLike } from "./session.ts";

type Loop = ((timeMs: number, frame?: XRFrame) => void) | null;

/** Pose de tête inclinée de `deg` degrés (négatif : tête baissée). */
function poseFrame(deg: number | null): XRFrame {
  const a = ((deg ?? 0) * Math.PI) / 360;
  const pose = deg === null ? undefined : { transform: { orientation: { x: Math.sin(a), y: 0, z: 0, w: Math.cos(a) } } };
  return { getViewerPose: () => pose } as unknown as XRFrame;
}

function setup(options: { supported?: boolean; space?: boolean; xr?: boolean; sessionFails?: boolean } = {}) {
  const doc = withCanvasContext(new Window().document as unknown as Document);
  const root = doc.createElement("main");
  doc.body.append(root);
  const listeners: Record<string, () => void> = {};
  const inputSources = [{ handedness: "right", gamepad: { axes: [0, 0, 0, 0] } }];
  const session = {
    inputSources,
    addEventListener: (type: string, cb: () => void) => (listeners[type] = cb),
  } as unknown as XRSession;
  const xr = {
    isSessionSupported: () => Promise.resolve(options.supported ?? true),
    requestSession: vi.fn(() => Promise.resolve(session)),
  } satisfies XrSystemLike;
  const fake = { loop: null as Loop, render: vi.fn(), dispose: vi.fn(), canvas: doc.createElement("canvas") };
  const space = options.space === false ? null : ({} as XRReferenceSpace);
  class FakeRenderer {
    domElement = fake.canvas;
    xr = { enabled: false, setReferenceSpaceType: vi.fn(), setSession: vi.fn(() =>
        options.sessionFails ? Promise.reject(new Error("contexte WebGL refusé")) : Promise.resolve(),
      ), getReferenceSpace: () => space };
    setAnimationLoop = (cb: Loop) => (fake.loop = cb);
    render = fake.render;
    dispose = fake.dispose;
  }
  const Renderer = FakeRenderer as unknown as RendererClass;
  const home = startExperience({ document: doc, root, xr: options.xr === false ? undefined : xr, Renderer });
  const status = () => root.querySelector("[role='status']")?.textContent;
  const panel = () => root.querySelector("[aria-label='Marche']");
  const enter = async () => {
    root.querySelector("button")?.click();
    await vi.waitFor(() => {
      expect(status()).not.toBe("Ouverture de la réalité mixte…");
    });
  };
  const frame = (timeMs: number, f?: XRFrame) => {
    if (!fake.loop) throw new Error("boucle de rendu non lancée");
    fake.loop(timeMs, f);
  };
  return { root, home, xr, fake, inputSources, listeners, status, panel, enter, frame };
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

  it("change la vitesse au joystick droit", async () => {
    const t = setup();
    await t.enter();
    t.inputSources[0] = { handedness: "right", gamepad: { axes: [0, 0, 0, -1] } };
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
});
