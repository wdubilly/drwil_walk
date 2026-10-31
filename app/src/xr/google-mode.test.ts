import { Window } from "happy-dom";
import { Group, PerspectiveCamera, Vector4, type ArrayCamera } from "three";
import { describe, expect, it, vi } from "vitest";
import { withCanvasContext } from "../city/canvas-double.ts";
import type { GoogleTiles, GoogleTilesOptions } from "../city/google-tiles.ts";
import { createSouqScene } from "../city/souq.ts";
import type { Souq } from "../city/souq-data.ts";
import { createPath } from "../route/path.ts";
import { NO_KEY_NOTICE, chooseRendering, failureNotice } from "./google-mode.ts";

const souq: Souq = {
  origin: [51.5, 25.3],
  route: createPath([{ x: 0, z: 0 }, { x: 0, z: -100 }]),
  palette: { ground: 1, road: 2, buildings: [3] },
  roads: [],
  buildings: [],
};
const KEY = "cle-fictive-pour-les-tests";
const camera = new PerspectiveCamera();
const xrCamera = (viewport?: Vector4) => ({ cameras: viewport ? [{ viewport }] : [] }) as unknown as ArrayCamera;

function setup(options: { wanted?: "osm" | "google"; apiKey?: string | undefined; createFails?: boolean } = {}) {
  const doc = withCanvasContext(new Window().document as unknown as Document);
  const scene = createSouqScene(doc, souq);
  const setText = vi.spyOn(scene.label, "setText");
  const notice = vi.fn();
  let copyright = "";
  const tiles: GoogleTiles = {
    root: new Group(),
    update: vi.fn(),
    copyright: () => copyright,
    visibleTileCount: () => 12,
    dispose: vi.fn(),
  };
  let failure: GoogleTilesOptions["onFailure"] = () => undefined;
  const create = vi.fn((o: GoogleTilesOptions) => {
    if (options.createFails) throw new Error("WebGL refusé");
    failure = o.onFailure;
    return tiles;
  });
  const apiKey = "apiKey" in options ? options.apiKey : KEY;
  const mode = chooseRendering({ wanted: options.wanted ?? "google", config: { apiKey, create }, souq, scene, notice });
  return { mode, scene, tiles, notice, create, setText, fail: (r: string) => { failure(r); }, setCopyright: (c: string) => { copyright = c; } };
}

describe("rendu choisi", () => {
  it("garde OpenStreetMap sans toucher à Google quand il est choisi (ou par défaut)", () => {
    const t = setup({ wanted: "osm" });
    expect(t.create).not.toHaveBeenCalled();
    expect(t.notice).not.toHaveBeenCalled();
    expect(t.mode.rendering()).toBe("osm");
    expect(t.mode.tileCount()).toBe(0);
    expect(t.mode.attribution()).toBe("© contributeurs OpenStreetMap");
    t.mode.update(camera, xrCamera());
    expect(t.tiles.update).not.toHaveBeenCalled();
    t.mode.dispose();
    expect(t.tiles.dispose).not.toHaveBeenCalled();
  });

  it("QUA-002: sans clé, garde OpenStreetMap et dit pourquoi", () => {
    const t = setup({ apiKey: undefined });
    expect(t.create).not.toHaveBeenCalled();
    expect(t.notice).toHaveBeenCalledWith(NO_KEY_NOTICE);
    expect(NO_KEY_NOTICE).toContain("aucune clé");
    expect(t.mode.rendering()).toBe("osm");
    expect(t.scene.osm.visible).toBe(true);
  });

  it("APP-002: avec une clé, les tuiles remplacent la ville OpenStreetMap, dans la ville qui suit le parcours", () => {
    const t = setup();
    expect(t.create).toHaveBeenCalledWith(expect.objectContaining({ apiKey: KEY, origin: [51.5, 25.3] }));
    expect(t.scene.city.children).toContain(t.tiles.root);
    expect(t.scene.osm.visible).toBe(false);
    expect(t.mode.rendering()).toBe("google");
    expect(t.mode.tileCount()).toBe(12);
    expect(t.notice).not.toHaveBeenCalled();
  });

  it("APP-003: les mentions de Google s'ajoutent à celles d'OpenStreetMap, sur la page et dans le casque", () => {
    const t = setup();
    expect(t.mode.attribution()).toBe("© contributeurs OpenStreetMap · Google");
    t.setText.mockClear();
    t.setCopyright("Landsat / Copernicus");
    t.mode.update(camera, xrCamera());
    expect(t.mode.attribution()).toBe("© contributeurs OpenStreetMap · Google · Landsat / Copernicus");
    expect(t.setText).toHaveBeenCalledWith("© contributeurs OpenStreetMap · Google · Landsat / Copernicus");
    // Texte inchangé : le panneau n'est pas redessiné à chaque image.
    t.setText.mockClear();
    t.mode.update(camera, xrCamera());
    expect(t.setText).not.toHaveBeenCalled();
  });

  it("charge les tuiles à la résolution d'un œil, ou à défaut à celle du Quest 3", () => {
    const t = setup();
    t.mode.update(camera, xrCamera(new Vector4(0, 0, 1800, 1900)));
    expect(t.tiles.update).toHaveBeenLastCalledWith(camera, { x: 1800, y: 1900 });
    t.mode.update(camera, xrCamera(new Vector4(0, 0, 0, 0)));
    expect(t.tiles.update).toHaveBeenLastCalledWith(camera, { x: 2064, y: 2208 });
    t.mode.update(camera, xrCamera());
    expect(t.tiles.update).toHaveBeenLastCalledWith(camera, { x: 2064, y: 2208 });
  });

  it("QUA-002: si les tuiles ne se chargent pas, retombe sur OpenStreetMap avec la raison et ses mentions seules", () => {
    const t = setup();
    t.fail("403");
    expect(t.notice).toHaveBeenCalledWith(failureNotice("403"));
    expect(t.scene.city.children).not.toContain(t.tiles.root);
    expect(t.scene.osm.visible).toBe(true);
    expect(t.mode.rendering()).toBe("osm");
    expect(t.mode.tileCount()).toBe(0);
    expect(t.mode.attribution()).toBe("© contributeurs OpenStreetMap");
    expect(t.setText).toHaveBeenLastCalledWith("© contributeurs OpenStreetMap");
    t.mode.update(camera, xrCamera());
    expect(t.tiles.update).not.toHaveBeenCalled();
    t.mode.dispose();
    expect(t.tiles.dispose).toHaveBeenCalled();
  });

  it("QUA-002: si les tuiles ne peuvent même pas être créées, retombe sur OpenStreetMap avec la raison", () => {
    const t = setup({ createFails: true });
    expect(t.notice).toHaveBeenCalledWith(failureNotice("WebGL refusé"));
    expect(t.scene.osm.visible).toBe(true);
    expect(t.mode.rendering()).toBe("osm");
  });

  it("dit aussi un échec de création qui n'est pas une Error", () => {
    const doc = withCanvasContext(new Window().document as unknown as Document);
    const notice = vi.fn();
    const create = vi.fn(() => {
      // eslint-disable-next-line @typescript-eslint/only-throw-error -- on vérifie justement l'affichage d'un rejet qui n'est pas une Error.
      throw "refus brut";
    });
    chooseRendering({ wanted: "google", config: { apiKey: KEY, create }, souq, scene: createSouqScene(doc, souq), notice });
    expect(notice).toHaveBeenCalledWith(failureNotice("refus brut"));
  });
});
