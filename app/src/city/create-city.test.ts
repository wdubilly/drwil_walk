import { readFileSync } from "node:fs";
import { encode } from "jpeg-js";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CityDescription } from "../../scripts/cities.ts";
import { REAL_DISK, createCity, main, realDeps, reportOf, type Deps, type Disk } from "../../scripts/create-city.ts";
import { OVERPASS_URL } from "../../scripts/extract-souq.ts";
import { TEXTURE_PX } from "../../scripts/materials-textures.ts";
import { PANORAMAX_SEARCH } from "../../scripts/panoramax.ts";
import { OSM_ATTRIBUTION } from "./licence.ts";
import { parseLibrary } from "./material-library.ts";
import { makeZip } from "./zip-double.ts";

const city: CityDescription = {
  itinerary: "essai",
  label: "Essai",
  place: "Un lieu d'essai",
  name: "Essai",
  bbox: { south: 49.99, west: 9.99, north: 50.01, east: 10.01 },
  userAgent: "drwil_walk test",
  file: "data/essai.json",
  route: { points: [[50, 10], [50, 10.002]], return: "aller-retour" },
};

const jpeg = (rgb: readonly [number, number, number], size: number): Uint8Array => {
  const data = new Uint8Array(size * size * 4);
  for (let i = 0; i < size * size; i++) data.set([...rgb, 255], i * 4);
  return encode({ width: size, height: size, data }, 90).data;
};

const way = (id: number, tags: Record<string, string>, ...points: [number, number][]) => ({ type: "way", id, tags, geometry: points.map(([lon, lat]) => ({ lat, lon })) });
const OVERPASS = {
  osm3s: { timestamp_osm_base: "2026-11-04T00:00:00Z" },
  elements: [
    way(1, { highway: "residential" }, [10, 50], [10.001, 50], [10.002, 50]),
    way(2, { highway: "footway" }, [10.002, 50], [10.002, 50.001]),
    way(3, { building: "yes" }, [10, 50.002], [10.001, 50.002], [10.001, 50.003], [10, 50.002]),
  ],
};

/** Le réseau simulé : Overpass, Panoramax, les vignettes des photos et les archives CC0 d'ambientCG. */
function network(photos: { id: string; dLat: number }[] = []) {
  return vi.fn<typeof fetch>((input) => {
    const url = input as string;
    const asset = /file=(\w+)_1K-JPG\.zip/.exec(url)?.[1];
    if (url === OVERPASS_URL) return Promise.resolve(Response.json(OVERPASS));
    if (asset) return Promise.resolve(new Response(Buffer.from(makeZip({ [`${asset}_1K-JPG_Color.jpg`]: jpeg([128, 128, 128], TEXTURE_PX), [`${asset}_1K-JPG_NormalGL.jpg`]: jpeg([128, 128, 255], TEXTURE_PX) }))));
    if (url.startsWith(PANORAMAX_SEARCH)) {
      const features = photos.map((p) => ({
        id: p.id,
        geometry: { coordinates: [10.001, 50 + p.dLat] },
        properties: { "geovisio:producer": "Alice", license: "CC-BY-SA-4.0", "geovisio:thumbnail": `https://x/${p.id}.jpg` },
      }));
      return Promise.resolve(Response.json({ features }));
    }
    return Promise.resolve(new Response(Buffer.from(jpeg([200, 150, 90], 64))));
  });
}

function memory(initial: Record<string, string> = {}, provided: Record<string, Uint8Array> = {}): Disk & { files: Record<string, string> } {
  const files = { ...initial };
  return {
    files,
    read: (path) => files[path] ?? "",
    write: (path, text) => { files[path] = text; },
    readBytes: (path) => provided[path] as Uint8Array,
    list: () => Object.keys(provided).map((p) => p.split("/").pop() as string),
  };
}

const deps = (disk: Disk, fetchFn: typeof fetch): Deps => ({ fetchFn, disk, token: undefined, pause: () => Promise.resolve() });
const CATALOG = readFileSync(new URL("../../data/villes.json", import.meta.url), "utf8");

afterEach(() => vi.useRealTimers());

describe("commande unique de création d'une ville (hors casque)", () => {
  it("APP-003, APP-012: écrit extrait, boucle, photos et bibliothèque, et dit d'où vient chaque couleur", async () => {
    const disk = memory({}, { "/photos/rue.jpg": jpeg([180, 90, 60], 64), "/photos/notes.txt": new Uint8Array() });
    const report = await createCity(deps(disk, network([{ id: "p1", dLat: 0.0001 }])), city, "/photos");
    const extract = JSON.parse(disk.files["data/essai.json"] as string) as { attribution: string; features: { properties: { kind: string }; geometry: { coordinates: unknown } }[] };
    expect(extract.attribution).toContain(OSM_ATTRIBUTION);
    const vertices = new Set(extract.features.filter((f) => f.properties.kind === "highway").flatMap((f) => (f.geometry.coordinates as number[][]).map((p) => p.join(","))));
    const loop = JSON.parse(disk.files["data/essai-boucle.json"] as string) as { geometry: { coordinates: number[][] } };
    expect(loop.geometry.coordinates.filter((p) => !vertices.has(p.join(",")))).toEqual([]);
    expect(JSON.parse(disk.files["assets/materials/essai-photos.json"] as string)).toHaveLength(1);
    const library = parseLibrary(JSON.parse(disk.files["assets/materials/essai.json"] as string));
    expect(library.materials.map((m) => m.asset)).toEqual(["Plaster001", "Bricks106A", "Planks037A"]);
    expect(library.provisional).toBe(false);
    expect(report).toContain("retenues à moins de 30 m du tracé");
    expect(report).toContain("2 photo(s) dont 1 fournie(s) par le demandeur");
    expect(report).toMatch(/- #[0-9a-f]{6} \(\d+ %\) — panoramax p1, à \d+ m du tracé, Alice, CC-BY-SA-4.0/);
    expect(report).toMatch(/— photo fournie par le demandeur \(rue\.jpg\)/);
    expect(report).not.toContain("/photos");
  });

  it("APP-008, APP-012: sans photo à 1 km, se replie sur la palette de la région et le dit", async () => {
    const disk = memory();
    const report = await createCity(deps(disk, network()), city);
    expect(report).toContain("aucune photo retrouvée, même à 1 km du tracé");
    expect(report).toContain("Couleurs (provisoire : aucune photo, même à 1 km du tracé : palette de la région « ailleurs » (APP-008))");
    expect(report).toContain("faute de photo à moins de 1 km");
    expect(parseLibrary(JSON.parse(disk.files["assets/materials/essai.json"] as string)).provisional).toBe(true);
  });

  it("utilise les seules photos fournies quand le réseau n'en rend aucune", async () => {
    const disk = memory({}, { "/p/a.JPEG": jpeg([90, 120, 60], 64) });
    const report = await createCity(deps(disk, network()), city, "/p");
    expect(report).toContain("(photos : 1 photo(s) dont 1 fournie(s) par le demandeur)");
  });

  it("dit l'origine non connue d'une couleur sans provenance", () => {
    const lines = reportOf(city, { photos: [], radiusM: 100, notes: [] }, { source: "photos", note: "n", list: [{ hex: "#aabbcc", share: 0.5 }] }, ["f"]);
    expect(lines).toContain("- #aabbcc (50 %) — origine non dite");
    expect(lines).toContain("retenues à moins de 100 m du tracé");
  });

  it("APP-003: rejoue une ville du catalogue sans le réécrire, et décrit une nouvelle ville dans le catalogue", async () => {
    const disk = memory({ "data/villes.json": CATALOG });
    await main(["souq"], deps(disk, network()));
    expect(disk.files["data/villes.json"]).toBe(CATALOG);
    expect(Object.keys(disk.files)).toContain("data/souq-waqif-boucle.json");
    const fresh = memory({ "data/villes.json": CATALOG });
    await main(["essai", "--nom", "Essai", "--emprise", "49.99,9.99,50.01,10.01", "--depart", "50,10", "--arrivee", "50,10.002"], deps(fresh, network()));
    expect(JSON.parse(fresh.files["data/villes.json"] as string)).toMatchObject({ essai: { itinerary: "essai", file: "data/essai.json" }, souq: { itinerary: "doha-souq-waqif" } });
    await expect(main(["inconnue"], deps(fresh, network()))).rejects.toThrow("n'est pas décrite");
  });

  it("SEC-007: lit le jeton Mapillary dans l'environnement seulement, et attend entre deux recherches", async () => {
    vi.useFakeTimers();
    const real = realDeps({ MAPILLARY_TOKEN: "jeton-fictif" });
    expect(real).toMatchObject({ fetchFn: fetch, disk: REAL_DISK, token: "jeton-fictif" });
    expect(realDeps({}).token).toBeUndefined();
    const waited = vi.fn();
    void real.pause().then(waited);
    await vi.advanceTimersByTimeAsync(2000);
    expect(waited).toHaveBeenCalled();
  });

  it("lit le disque réel : des octets et la liste d'un dossier", () => {
    expect(REAL_DISK.readBytes("package.json").length).toBeGreaterThan(10);
    expect(REAL_DISK.list("scripts")).toContain("create-city.ts");
  });
});
