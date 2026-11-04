import { describe, expect, it, vi } from "vitest";
import type { LonLat } from "../route/geo.ts";
import {
  MAPILLARY_IMAGES,
  MAX_DISTANCE_M,
  MIN_PHOTOS,
  PANORAMAX_SEARCH,
  bboxAround,
  distanceToLine,
  inventory,
  inventoryMarkdown,
  parseMapillary,
  parsePanoramax,
  type StreetPhoto,
} from "../../scripts/panoramax.ts";

// Un tracé est-ouest de ~100 m au souk : 0,001° de longitude ≈ 100 m, 0,0001° de latitude ≈ 11 m.
const route: LonLat[] = [[51.53, 25.287], [51.531, 25.287]];
const UA = "drwil_walk test";

const panoramaxFeature = (id: string, lon: number, lat: number) => ({
  id,
  geometry: { coordinates: [lon, lat] },
  properties: { "view:azimuth": 90, datetime: "2024-03-01T10:00:00Z", "geovisio:producer": "Alice", license: "CC-BY-SA-4.0", "geovisio:thumbnail": `https://x/${id}.jpg` },
  links: [{ rel: "self", href: `https://api.panoramax.xyz/api/collections/c/items/${id}` }],
});

const nearby = (count: number) => Array.from({ length: count }, (_, i) => panoramaxFeature(`p${String(i)}`, 51.5302 + i * 0.00001, 25.2871));

function stub(panoramax: unknown, mapillary?: unknown) {
  return vi.fn<typeof fetch>((url) => Promise.resolve(Response.json((url as string).startsWith(PANORAMAX_SEARCH) ? panoramax : mapillary)));
}

describe("inventaire des photos de rue (préparation hors casque)", () => {
  it("élargit l'emprise du tracé de la distance retenue, de chaque côté", () => {
    const [w, s, e, n] = bboxAround(route);
    expect(w).toBeLessThan(51.53);
    expect(e).toBeGreaterThan(51.531);
    expect((25.287 - s) * 111_320).toBeCloseTo(MAX_DISTANCE_M, 3);
    expect((n - 25.287) * 111_320).toBeCloseTo(MAX_DISTANCE_M, 3);
  });

  it("mesure la distance au segment, pas seulement aux sommets, et au point seul", () => {
    expect(distanceToLine([51.5305, 25.2872], route)).toBeCloseTo(22.3, 0);
    expect(distanceToLine([51.53, 25.2872], [[51.53, 25.287]])).toBeCloseTo(22.3, 0);
    expect(distanceToLine([51.53, 25.2872], [[51.53, 25.287], [51.53, 25.287]])).toBeCloseTo(22.3, 0);
  });

  it("lit une photo Panoramax : identifiant, position, cap, date, auteur, licence, lien et vignette", () => {
    const [photo] = parsePanoramax({ features: [panoramaxFeature("a", 51.53, 25.287)] });
    expect(photo).toEqual({
      source: "panoramax", id: "a", lon: 51.53, lat: 25.287, headingDeg: 90, date: "2024-03-01T10:00:00Z", author: "Alice", licence: "CC-BY-SA-4.0",
      url: "https://api.panoramax.xyz/api/collections/c/items/a", thumb: "https://x/a.jpg",
    });
  });

  it("dit « inconnu » quand Panoramax ne donne ni cap, ni auteur, ni licence, et reconstruit le lien", () => {
    const [photo] = parsePanoramax({ features: [{ id: "b", geometry: { coordinates: [1, 2] }, properties: {}, assets: { thumb: { href: "https://x/t.jpg" } } }] });
    expect(photo).toMatchObject({ headingDeg: null, date: "", author: "inconnu", licence: "inconnue", url: "https://api.panoramax.xyz/#focus=pic&pic=b", thumb: "https://x/t.jpg" });
    expect(parsePanoramax({})).toEqual([]);
    expect(parsePanoramax(null)).toEqual([]);
    expect(parsePanoramax({ features: [{}] })[0]).toMatchObject({ id: "", lon: Number.NaN, thumb: "" });
  });

  it("lit une photo Mapillary, toujours sous CC BY-SA 4.0", () => {
    const [photo, bare] = parseMapillary({
      data: [
        { id: "m1", geometry: { coordinates: [51.53, 25.287] }, compass_angle: 10, captured_at: 0, creator: { username: "bob" }, thumb_1024_url: "https://m/1.jpg" },
        { id: "m2" },
      ],
    });
    expect(photo).toEqual({ source: "mapillary", id: "m1", lon: 51.53, lat: 25.287, headingDeg: 10, date: "1970-01-01T00:00:00.000Z", author: "bob", licence: "CC-BY-SA-4.0", url: "https://www.mapillary.com/app/?pKey=m1", thumb: "https://m/1.jpg" });
    expect(bare).toMatchObject({ date: "", author: "inconnu", headingDeg: null, thumb: "" });
    expect(parseMapillary({})).toEqual([]);
  });

  it("garde Panoramax seul quand il suffit, sans interroger Mapillary, en s'identifiant", async () => {
    const fetchFn = stub({ features: [...nearby(MIN_PHOTOS), panoramaxFeature("loin", 51.53, 25.29)] });
    const found = await inventory(fetchFn, route, UA, "jeton");
    expect(found.mapillary).toBe("non nécessaire");
    expect(found.photos).toHaveLength(MIN_PHOTOS);
    expect(fetchFn).toHaveBeenCalledOnce();
    const [url, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toContain("bbox=");
    expect(init.headers).toEqual({ "User-Agent": UA });
  });

  it("n'interroge pas Mapillary sans jeton : la couverture insuffisante est dite", async () => {
    for (const token of [undefined, ""]) {
      const fetchFn = stub({ features: nearby(2) });
      const found = await inventory(fetchFn, route, UA, token);
      expect(found).toMatchObject({ mapillary: "sans jeton" });
      expect(found.photos).toHaveLength(2);
      expect(fetchFn).toHaveBeenCalledOnce();
    }
  });

  it("complète par Mapillary avec un jeton passé en en-tête, jamais dans l'adresse", async () => {
    const fetchFn = stub({ features: nearby(1) }, { data: [{ id: "m", geometry: { coordinates: [51.5301, 25.287] } }, { id: "loin", geometry: { coordinates: [51.6, 25.287] } }] });
    const found = await inventory(fetchFn, route, UA, "secret-fictif");
    expect(found.photos.map((p) => p.id)).toEqual(["p0", "m"]);
    const [url, init] = fetchFn.mock.calls[1] as unknown as [string, RequestInit];
    expect(url.startsWith(MAPILLARY_IMAGES)).toBe(true);
    expect(url).not.toContain("secret-fictif");
    expect(init.headers).toEqual({ Authorization: "OAuth secret-fictif", "User-Agent": UA });
  });

  it("échoue lisiblement si le service répond une erreur", async () => {
    const fetchFn = vi.fn<typeof fetch>(() => Promise.resolve(new Response("", { status: 503 })));
    await expect(inventory(fetchFn, route, UA)).rejects.toThrow("api.panoramax.xyz a répondu 503");
  });

  it("publie la couverture, puis une ligne par photo retenue", () => {
    expect(inventoryMarkdown({ panoramax: [], mapillary: "sans jeton", photos: [] })).toBe(
      "- Panoramax : 0 photo(s) à moins de 30 m du tracé (seuil de suffisance : 20).\n- Mapillary : non interrogé (sans jeton).\n- Retenues : 0 photo(s).",
    );
    const photo: StreetPhoto = { source: "mapillary", id: "m|1", lon: 51.53, lat: 25.287, headingDeg: null, date: "d", author: "a", licence: "l", url: "u", thumb: "t" };
    const text = inventoryMarkdown({ panoramax: [], mapillary: [photo], photos: [photo, { ...photo, headingDeg: 89.6 }] });
    expect(text).toContain("- Mapillary : 1 photo(s).");
    expect(text).toContain("| mapillary | m\\|1 | 25.28700, 51.53000 | inconnu | d | a | l | u |");
    expect(text).toContain("| 90° |");
  });
});
