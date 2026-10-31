import { describe, expect, it, vi } from "vitest";
import {
  BBOX,
  DEFAULT_HEIGHT_M,
  OVERPASS_URL,
  USER_AGENT,
  buildQuery,
  buildingHeightM,
  extract,
  toGeoJsonText,
  type OverpassResponse,
} from "../../scripts/extract-souq.ts";

const ring = [
  { lat: 25.287, lon: 51.5331234567 },
  { lat: 25.287, lon: 51.534 },
  { lat: 25.288, lon: 51.534 },
  { lat: 25.287, lon: 51.5331234567 },
];
const osm: OverpassResponse = {
  osm3s: { timestamp_osm_base: "2026-10-31T06:43:47Z" },
  elements: [
    { type: "way", id: 1, tags: { building: "yes", "building:levels": "2" }, geometry: ring },
    { type: "way", id: 2, tags: { building: "yes" }, geometry: ring.slice(0, 2) },
    { type: "way", id: 3, tags: { highway: "pedestrian" }, geometry: ring.slice(0, 2) },
    { type: "way", id: 4, tags: { highway: "footway" }, geometry: ring.slice(0, 1) },
    { type: "way", id: 5, geometry: ring.slice(0, 2) },
    { type: "way", id: 6 },
    { type: "way", id: 7, tags: { building: "yes", "building:colour": "#C8785A", "roof:colour": "red", "building:material": "brick" }, geometry: ring },
    { type: "node", id: 8, lat: 25.2871, lon: 51.5331234567, tags: { natural: "tree" } },
    { type: "node", id: 9, lat: 25.2872, lon: 51.5332, tags: { highway: "street_lamp" } },
    { type: "node", id: 10, tags: { amenity: "bench" } },
    { type: "node", id: 11, lat: 25.2873, lon: 51.5333, tags: { shop: "bakery" } },
  ],
};

describe("extraction du souk depuis OpenStreetMap", () => {
  it("APP-003: interroge bâtiments et voies dans le cadre du quartier", () => {
    const query = buildQuery();
    expect(query).toContain('way["building"](25.284,51.529,25.29,51.538)');
    expect(query).toContain('way["highway"](25.284,51.529,25.29,51.538)');
    for (const node of ['node["natural"="tree"]', 'node["highway"="street_lamp"]', 'node["amenity"="bench"]']) {
      expect(query).toContain(`${node}(25.284,51.529,25.29,51.538)`);
    }
    expect(query).toContain("out geom");
    expect(BBOX.south).toBeLessThan(BBOX.north);
  });

  it("lit la hauteur, sinon les niveaux, sinon une valeur par défaut", () => {
    expect(buildingHeightM({ height: "12.5 m" })).toBe(12.5);
    expect(buildingHeightM({ "building:levels": "3" })).toBe(9);
    expect(buildingHeightM({ height: "haut", "building:levels": "0" })).toBe(DEFAULT_HEIGHT_M);
    expect(buildingHeightM({})).toBe(DEFAULT_HEIGHT_M);
  });

  it("APP-003: produit un GeoJSON : bâtiments fermés et teintés, voies, arbres et mobilier, une entité par ligne, coordonnées arrondies", () => {
    const text = toGeoJsonText(osm);
    const parsed = JSON.parse(text) as {
      attribution: string;
      extractedFrom: string;
      features: { id: number; properties: { kind: string; heightM?: number; highway?: string }; geometry: { coordinates: unknown } }[];
    };
    expect(parsed.attribution).toContain("OpenStreetMap");
    expect(parsed.extractedFrom).toBe("2026-10-31T06:43:47Z");
    // Le bâtiment sans anneau, la voie d'un seul point, la voie sans géométrie sont écartés ; la voie sans étiquette garde un type vide.
    expect(parsed.features.map((f) => f.id)).toEqual([1, 3, 5, 7, 8, 9]);
    expect(parsed.features[0]?.properties).toEqual({ kind: "building", heightM: 6 });
    expect(parsed.features[0]?.geometry.coordinates).toEqual([[[51.533123, 25.287], [51.534, 25.287], [51.534, 25.288], [51.533123, 25.287]]]);
    expect(parsed.features[1]?.properties).toEqual({ kind: "highway", highway: "pedestrian" });
    expect(parsed.features[2]?.properties).toEqual({ kind: "highway", highway: "" });
    expect(parsed.features[3]?.properties).toEqual({ kind: "building", heightM: 7, colour: "#c8785a", roofColour: "#cc3333", material: "brick" });
    expect(parsed.features[4]).toMatchObject({ properties: { kind: "tree" }, geometry: { type: "Point", coordinates: [51.533123, 25.2871] } });
    expect(parsed.features[5]?.properties).toEqual({ kind: "lamp" });
    expect(text.split("\n")).toHaveLength(9);
    expect(toGeoJsonText({ elements: [] })).toContain('"extractedFrom":""');
  });

  it("appelle Overpass en s'identifiant, et rend le fichier", async () => {
    const fetchFn = vi.fn(() => Promise.resolve(Response.json(osm)));
    const text = await extract(fetchFn);
    expect(text).toBe(toGeoJsonText(osm));
    const [url, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(OVERPASS_URL);
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>)["User-Agent"]).toBe(USER_AGENT);
    expect((init.body as URLSearchParams).get("data")).toBe(buildQuery());
  });

  it("dit l'échec d'Overpass au lieu d'écrire un fichier vide", async () => {
    const fetchFn = vi.fn(() => Promise.resolve(new Response("", { status: 429 })));
    await expect(extract(fetchFn)).rejects.toThrow("Overpass a répondu 429");
  });
});
