import { type Material, Mesh, MeshStandardMaterial, MeshBasicMaterial, PerspectiveCamera, PlaneGeometry, Scene, Texture } from "three";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createGoogleTiles, googleCredit, readApiKey } from "./google-tiles.ts";

// Aucun test n'appelle Google : fetch est remplacé, et la clé est fictive.
const KEY = "cle-fictive-pour-les-tests";
const ORIGIN = [73.85, 18.52] as const;

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function setup() {
  const onFailure = vi.fn();
  const fetchMock = vi.fn((url: URL) => Promise.reject(new Error(`réseau coupé : ${String(url)}`)));
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  const google = createGoogleTiles({ apiKey: KEY, origin: ORIGIN, onFailure });
  const camera = new PerspectiveCamera(70, 1, 0.1, 1000);
  return { google, onFailure, fetchMock, camera };
}

const litTile = () => {
  const tile = new Scene();
  const mesh = new Mesh<PlaneGeometry, Material>(new PlaneGeometry(1, 1), new MeshStandardMaterial({ map: new Texture() }));
  tile.add(mesh);
  return { tile, mesh };
};

describe("clé Google", () => {
  it("SEC-007: lit la clé de l'environnement de build, absente ou vide valant pas de clé", () => {
    expect(readApiKey({ VITE_GOOGLE_MAPS_API_KEY: ` ${KEY} ` })).toBe(KEY);
    expect(readApiKey({ VITE_GOOGLE_MAPS_API_KEY: "  " })).toBeUndefined();
    expect(readApiKey({ VITE_GOOGLE_MAPS_API_KEY: 42 })).toBeUndefined();
    expect(readApiKey({})).toBeUndefined();
    expect(readApiKey(undefined)).toBeUndefined();
  });
});

describe("tuiles Google 3D", () => {
  it("APP-003: la mention est « Google », suivie des droits des tuiles affichées", () => {
    expect(googleCredit("")).toBe("Google");
    expect(googleCredit("Landsat / Copernicus")).toBe("Google · Landsat / Copernicus");
  });

  it("APP-002: les tuiles sont calées sur l'origine de la boucle, repère terrestre tourné vers l'est/sud local", () => {
    const { google } = setup();
    expect(google.root.rotation.y).toBeCloseTo(Math.PI);
    expect(google.root.children).toContain(google.tiles.group);
    expect(google.visibleTileCount()).toBe(0);
    expect(google.copyright()).toBe("");
    google.dispose();
  });

  it("QUA-002: dit la raison quand le jeu de tuiles ne se charge pas, une seule fois, sans la clé", async () => {
    const { google, onFailure, fetchMock, camera } = setup();
    google.update(camera, { x: 1000, y: 1000 });
    await vi.waitFor(() => {
      expect(onFailure).toHaveBeenCalledOnce();
    });
    expect(onFailure.mock.calls[0]?.[0]).toContain("jeu de tuiles refusé ou injoignable");
    expect(onFailure.mock.calls[0]?.[0]).toContain("réseau coupé");
    expect(onFailure.mock.calls[0]?.[0]).not.toContain(KEY);
    expect(fetchMock).toHaveBeenCalled();
    // Une seconde erreur ne redit rien, et le rendu est arrêté.
    google.tiles.dispatchEvent({ type: "load-error", tile: null, error: new Error("autre"), url: "x" });
    expect(onFailure).toHaveBeenCalledOnce();
    const calls = fetchMock.mock.calls.length;
    google.update(camera, { x: 1000, y: 1000 });
    expect(fetchMock.mock.calls.length).toBe(calls);
    google.dispose();
  });

  it("QUA-002: une tuile qui échoue avant tout modèle chargé condamne le rendu, pas après", () => {
    const first = setup();
    first.google.tiles.dispatchEvent({ type: "load-error", tile: {} as never, error: new Error("403"), url: "x" });
    expect(first.onFailure).toHaveBeenCalledWith("tuile illisible : 403");
    first.google.dispose();

    const later = setup();
    later.google.tiles.dispatchEvent({ type: "load-model", scene: litTile().tile, tile: {} as never, url: "x" });
    later.google.tiles.dispatchEvent({ type: "load-error", tile: {} as never, error: new Error("tuile isolée"), url: "x" });
    expect(later.onFailure).not.toHaveBeenCalled();
    later.google.tiles.dispatchEvent({ type: "load-error", tile: null, error: new Error("jeu racine"), url: "x" });
    expect(later.onFailure).toHaveBeenCalledWith(expect.stringContaining("jeu racine"));
    later.google.dispose();
  });

  it("enregistre la caméra une seule fois, et affiche les droits des tuiles visibles", () => {
    const { google, camera } = setup();
    google.update(camera, { x: 1000, y: 1000 });
    google.update(camera, { x: 1200, y: 900 });
    expect(google.tiles.cameras).toEqual([camera]);
    vi.spyOn(google.tiles, "getAttributions").mockReturnValue([
      { type: "image", value: "logo.png" },
      { type: "string", value: "Landsat; Google" },
    ]);
    expect(google.copyright()).toBe("Landsat; Google");
    google.dispose();
  });

  it("rend les tuiles sans éclairage, et libère leurs matériaux", () => {
    const { google } = setup();
    const { tile, mesh } = litTile();
    const old = mesh.material as MeshStandardMaterial;
    const disposeOld = vi.spyOn(old, "dispose");
    google.tiles.dispatchEvent({ type: "load-model", scene: tile, tile: {} as never, url: "x" });
    expect(mesh.material).toBeInstanceOf(MeshBasicMaterial);
    expect((mesh.material as MeshBasicMaterial).map).toBe(old.map);
    expect(disposeOld).toHaveBeenCalled();
    const disposeNew = vi.spyOn(mesh.material as MeshBasicMaterial, "dispose");
    // Une tuile sans texture, et un objet qui n'est pas un maillage, ne font pas d'erreur.
    const bare = new Scene();
    bare.add(new Mesh(new PlaneGeometry(1, 1), new MeshStandardMaterial()), new Scene());
    google.tiles.dispatchEvent({ type: "load-model", scene: bare, tile: {} as never, url: "x" });
    google.tiles.dispatchEvent({ type: "dispose-model", scene: tile, tile: {} as never });
    google.tiles.dispatchEvent({ type: "dispose-model", scene: bare, tile: {} as never });
    expect(disposeNew).toHaveBeenCalled();
    google.dispose();
  });
});
