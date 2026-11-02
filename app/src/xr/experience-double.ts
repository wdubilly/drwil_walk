// Doublures des tests de l'expérience : un renderer, une session et des tuiles Google factices (jamais d'appel à Google).
import { Window } from "happy-dom";
import { Group, Mesh, MeshBasicMaterial, PlaneGeometry } from "three";
import { expect, vi } from "vitest";
import { withCanvasContext } from "../city/canvas-double.ts";
import { createProviders } from "../route/create-providers.ts";
import { startExperience, type RendererClass } from "./experience.ts";
import type { GoogleTiles, GoogleTilesOptions } from "../city/google-tiles.ts";
import type { TreePack } from "../city/tree-pack.ts";
import type { WeightStorage } from "../route/stats.ts";
import type { XrSystemLike } from "./session.ts";

type Loop = ((timeMs: number, frame?: XRFrame) => void) | null;

/** Pose de tête inclinée de `deg` degrés (négatif : tête baissée), tournée de `yawDeg` vers la gauche, à la position `at`. */
export function poseFrame(deg: number | null, { yawDeg = 0, at = { x: 0, y: 1.6, z: 0 } } = {}): XRFrame {
  const p = ((deg ?? 0) * Math.PI) / 360;
  const y = (yawDeg * Math.PI) / 360;
  const orientation = { x: Math.cos(y) * Math.sin(p), y: Math.sin(y) * Math.cos(p), z: -Math.sin(y) * Math.sin(p), w: Math.cos(y) * Math.cos(p) };
  const pose = deg === null ? undefined : { transform: { position: at, orientation } };
  return { getViewerPose: () => pose } as unknown as XRFrame;
}

/** Un contexte 2D muet qui accepte aussi le tracé de la minicarte. */
const DRAWING_CONTEXT = Object.fromEntries(
  ["fillRect", "fillText", "beginPath", "moveTo", "lineTo", "stroke", "arc", "fill"].map((name) => [name, () => undefined]),
);

export const KEY = "cle-fictive-pour-les-tests";

export function setup(
  options: { supported?: boolean; space?: boolean; xr?: boolean; sessionFails?: boolean; rendererThrows?: unknown; apiKey?: string | undefined; fetch?: typeof fetch; storage?: WeightStorage; now?: () => Date; trees?: () => Promise<TreePack> } = {},
) {
  const win = new Window();
  const doc = withCanvasContext(win.document as unknown as Document, DRAWING_CONTEXT);
  const root = doc.createElement("main");
  doc.body.append(root);
  const listeners: Record<string, () => void> = {};
  const released = () => Array.from({ length: 6 }, () => ({ pressed: false, value: 0 }));
  const inputSources = [{ handedness: "right", gamepad: { axes: [0, 0, 0, 0], buttons: released() } }];
  /** Tient les boutons d'index donnés de la manette droite (aucun : tous relâchés). */
  const hold = (...indices: number[]) => {
    inputSources[0] = {
      handedness: "right",
      gamepad: { axes: [0, 0, 0, 0], buttons: released().map((b, i) => (indices.includes(i) ? { pressed: true, value: 1 } : b)) },
    };
  };
  const session = {
    inputSources,
    addEventListener: (type: string, cb: () => void) => (listeners[type] = cb),
  } as unknown as XRSession;
  const xr = {
    isSessionSupported: () => Promise.resolve(options.supported ?? true),
    requestSession: vi.fn(() => Promise.resolve(session)),
  } satisfies XrSystemLike;
  const fake = { renderer: null as { localClippingEnabled: boolean } | null, loop: null as Loop, render: vi.fn(), setSize: vi.fn(), dispose: vi.fn(), canvas: doc.createElement("canvas") };
  const space = options.space === false ? null : ({} as XRReferenceSpace);
  class FakeRenderer {
    domElement = fake.canvas;
    localClippingEnabled = false;
    xr = { enabled: false, getCamera: () => ({ cameras: [] }), setReferenceSpaceType: vi.fn(), setSession: vi.fn(() =>
        options.sessionFails ? Promise.reject(new Error("contexte WebGL refusé")) : Promise.resolve(),
      ), getReferenceSpace: () => space };
    setAnimationLoop = (cb: Loop) => (fake.loop = cb);
    setSize = fake.setSize;
    render = fake.render;
    constructor() {
      if ("rendererThrows" in options) throw options.rendererThrows;
      fake.renderer = this;
    }
    dispose = fake.dispose;
  }
  const Renderer = FakeRenderer as unknown as RendererClass;
  // Aucune tuile réelle : un maillage factice tient lieu de jeu de tuiles Google.
  const tileMesh = new Mesh(new PlaneGeometry(1, 1), new MeshBasicMaterial());
  const tiles = { root: new Group(), update: vi.fn(), copyright: () => "Landsat", visibleTileCount: () => 3, dispose: vi.fn() };
  tiles.root.add(tileMesh);
  const failures: GoogleTilesOptions["onFailure"][] = [];
  const create = vi.fn((o: GoogleTilesOptions): GoogleTiles => {
    failures.push(o.onFailure);
    return tiles;
  });
  const apiKey = "apiKey" in options ? options.apiKey : KEY;
  const home = startExperience({
    document: doc,
    root,
    xr: options.xr === false ? undefined : xr,
    Renderer,
    google: { apiKey, create },
    storage: options.storage,
    now: options.now,
    trees: options.trees,
    routes: createProviders({}, options.fetch ?? (() => Promise.reject(new Error("réseau interdit aux tests")))),
  });
  const status = () => root.querySelector("[role='status']")?.textContent;
  const panel = () => root.querySelector("[aria-label='Marche']");
  const enter = async () => {
    root.querySelector<HTMLButtonElement>("button.enter")?.click();
    await vi.waitFor(() => {
      expect(status()).not.toBe("Ouverture de la réalité mixte…");
    });
  };
  const enterPc = async () => {
    root.querySelector<HTMLButtonElement>("button.enter-pc")?.click();
    await vi.waitFor(() => {
      expect(status()).not.toBe("Ouverture de la version PC…");
    });
  };
  /** Une pression de touche et la souris de la version PC. */
  const press = (key: string, init: { repeat?: boolean; ctrlKey?: boolean } = {}) => {
    const event = new win.KeyboardEvent("keydown", { key, cancelable: true, ...init });
    doc.dispatchEvent(event as unknown as Event);
    return event;
  };
  const mouse = (type: string, init: { movementX?: number; movementY?: number } = {}, target: EventTarget = doc) => {
    target.dispatchEvent(new win.MouseEvent(type, init) as unknown as Event);
  };
  const frame = (timeMs: number, f?: XRFrame) => {
    if (!fake.loop) throw new Error("boucle de rendu non lancée");
    fake.loop(timeMs, f);
  };
  const notice = () => root.querySelector("[role='alert']")?.textContent;
  const chooseGoogle = () => root.querySelector<HTMLInputElement>("input[value='google']")?.click();
  const fail = (reason: string) => {
    for (const failure of failures) failure(reason);
  };
  return { root, win, home, xr, enterPc, press, mouse, fake, inputSources, hold, listeners, status, panel, enter, frame, notice, chooseGoogle, create, tiles, tileMesh, fail };
}

