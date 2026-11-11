import { describe, expect, it, vi } from "vitest";
import { labelOf, providedLabel, regionColours, sourcedColours } from "../../scripts/city-colours.ts";
import { MAPILLARY_IMAGES, PANORAMAX_SEARCH } from "../../scripts/panoramax.ts";
import { MAX_USED_PHOTOS, WIDENING_M, searchPhotos } from "../../scripts/photo-search.ts";
import type { LonLat } from "../route/geo.ts";

// Un tracé est-ouest d'une centaine de mètres ; 0,001° de latitude ≈ 111 m.
const route: LonLat[] = [[10, 50], [10.001, 50]];
const UA = "drwil_walk test";
const TOKEN = "jeton-fictif-pour-les-tests";

const panoramax = (id: string, dLat: number) => ({
  id,
  geometry: { coordinates: [10.0005, 50 + dLat] },
  properties: { datetime: "2024-03-01T10:00:00Z", "geovisio:producer": "Alice", license: "CC-BY-SA-4.0", "geovisio:thumbnail": `https://x/${id}.jpg` },
});
const mapillary = (id: string, dLat: number) => ({ id, geometry: { coordinates: [10.0005, 50 + dLat] }, creator: { username: "Bob" }, thumb_1024_url: `https://m/${id}.jpg` });

function network(panoramaxFeatures: unknown[], mapillaryData: unknown[] = []) {
  return vi.fn<typeof fetch>((url) => Promise.resolve(Response.json((url as string).startsWith(PANORAMAX_SEARCH) ? { features: panoramaxFeatures } : { data: mapillaryData })));
}

describe("recherche des photos de rue, élargie jusqu'à 1 km (APP-012)", () => {
  it("APP-012: s'arrête à 30 m quand une photo s'y trouve, et dit pourquoi Mapillary n'est pas interrogé", async () => {
    const fetchFn = network([panoramax("proche", 0.0001), panoramax("loin", 0.002)]);
    const found = await searchPhotos(fetchFn, route, UA, undefined);
    expect(found.radiusM).toBe(30);
    expect(found.photos.map((p) => p.id)).toEqual(["proche"]);
    expect(found.photos[0]?.distanceM).toBeCloseTo(11, 0);
    expect(found.notes).toEqual(["à moins de 30 m : Panoramax 1 photo(s), Mapillary non interrogé (sans jeton)"]);
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it("APP-012: élargit aux quartiers voisins sans photo à 30 m, en s'identifiant, et attend entre deux recherches", async () => {
    const pause = vi.fn(() => Promise.resolve());
    const fetchFn = network([panoramax("voisin", 0.002)]);
    const found = await searchPhotos(fetchFn, route, UA, undefined, pause);
    expect(found.radiusM).toBe(300);
    expect(found.photos[0]?.distanceM).toBeGreaterThan(100);
    expect(found.notes).toHaveLength(3);
    expect(pause).toHaveBeenCalledTimes(2);
    const [, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit];
    expect(init.headers).toEqual({ "User-Agent": UA });
  });

  it("APP-012: va jusqu'à 1 km, puis rend aucune photo si rien ne s'y trouve (repli sur la palette de la région)", async () => {
    expect((await searchPhotos(network([panoramax("loin", 0.008)]), route, UA, undefined)).radiusM).toBe(1000);
    const none = await searchPhotos(network([panoramax("trop-loin", 0.02)]), route, UA, "");
    expect(none).toMatchObject({ photos: [], radiusM: null });
    expect(none.notes).toHaveLength(WIDENING_M.length);
    expect(none.notes.every((n) => n.endsWith("Mapillary non interrogé (sans jeton)"))).toBe(true);
  });

  it("APP-012: dit quand Panoramax a rendu la limite de 1 000 résultats (des photos proches ont pu manquer)", async () => {
    const many = Array.from({ length: 1000 }, (_, i) => panoramax(`p${String(i)}`, 0.0001));
    const found = await searchPhotos(network(many), route, UA, undefined);
    expect(found.notes[0]).toContain("réponse tronquée à 1000");
    expect(found.photos).toHaveLength(MAX_USED_PHOTOS);
  });

  it("APP-012, SEC-007: complète par Mapillary avec le jeton de l'environnement, sans jamais le répéter dans le résultat", async () => {
    const fetchFn = network([panoramax("p", 0.0002)], [mapillary("m", 0.0001), mapillary("m-loin", 0.5)]);
    const found = await searchPhotos(fetchFn, route, UA, TOKEN);
    expect(found.photos.map((p) => p.id)).toEqual(["m", "p"]);
    expect(found.notes).toEqual(["à moins de 30 m : Panoramax 1 photo(s), Mapillary 1 photo(s)"]);
    const [url, init] = fetchFn.mock.calls[1] as unknown as [string, RequestInit];
    expect(url.startsWith(MAPILLARY_IMAGES)).toBe(true);
    expect((init.headers as Record<string, string>)["Authorization"]).toBe(`OAuth ${TOKEN}`);
    expect(JSON.stringify(found)).not.toContain(TOKEN);
  });

  it("n'interroge pas Mapillary quand Panoramax suffit, et ne lit que les photos les plus proches", async () => {
    const many = Array.from({ length: MAX_USED_PHOTOS + 10 }, (_, i) => panoramax(`p${String(i)}`, 0.000003 * (i + 1)));
    const fetchFn = network(many);
    const found = await searchPhotos(fetchFn, route, UA, TOKEN);
    expect(found.notes[0]).toContain("Mapillary non nécessaire");
    expect(found.photos).toHaveLength(MAX_USED_PHOTOS);
    expect(found.photos[0]?.id).toBe("p0");
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });
});

const flat = (r: number, g: number, b: number) => {
  const data = new Uint8Array(32 * 32 * 4);
  for (let i = 0; i < 32 * 32; i++) data.set([r, g, b, 255], i * 4);
  return { width: 32, height: 32, data };
};

describe("couleurs d'une ville et leur provenance (APP-012)", () => {
  it("APP-012: rattache chaque couleur relevée à la photo dont elle vient", () => {
    const colours = sourcedColours([{ label: "photo orange", image: flat(200, 120, 60) }, { label: "photo grise", image: flat(120, 120, 110) }]);
    expect(colours.map((c) => c.from).sort()).toEqual(["photo grise", "photo orange"]);
    expect(colours.find((c) => c.from === "photo orange")?.hex).toMatch(/^#c8783c$/);
  });

  it("APP-012: cite une photo retrouvée (source, distance, auteur, licence, lien) et une photo fournie sans son chemin", () => {
    const photo = { source: "panoramax" as const, id: "a", lon: 0, lat: 0, headingDeg: null, date: "", author: "Alice", licence: "CC-BY-SA-4.0", url: "https://u", thumb: "t", distanceM: 41.6 };
    expect(labelOf(photo)).toBe("panoramax a, à 42 m du tracé, Alice, CC-BY-SA-4.0, https://u");
    expect(providedLabel("rue.jpg")).toBe("photo fournie par le demandeur (rue.jpg), licence : fournie par le demandeur");
  });

  it("APP-008, APP-012: se replie sur la palette de la région du départ, et le dit pour chaque couleur", () => {
    const pune = regionColours([73.855, 18.519]);
    expect(pune.region).toBe("inde");
    expect(pune.list.length).toBeGreaterThan(2);
    expect(pune.list.every((c) => /^#[0-9a-f]{6}$/.test(c.hex) && c.from.includes("« inde »") && c.from.includes("faute de photo à moins de 1 km"))).toBe(true);
    expect(regionColours([51.53, 25.287]).list.map((c) => c.hex)).not.toEqual(pune.list.map((c) => c.hex));
    expect(regionColours([0, 0]).region).toBe("ailleurs");
  });
});
