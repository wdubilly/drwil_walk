import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CATALOG, cityFor } from "./cities.ts";
import { OSM_ATTRIBUTION } from "./licence.ts";
import { regionOf } from "./facade-family.ts";
import { paletteOf } from "./region-palette.ts";
import { ITINERARIES } from "../route/itineraries.ts";

interface Collection { attribution: string; features: { properties: { kind: string }; geometry: { coordinates: unknown } }[] }
const read = (file: string): Collection => JSON.parse(readFileSync(new URL(`../../${file}`, import.meta.url), "utf8")) as Collection;

// Une ville ajoutée au catalogue par la commande entre ici sans une ligne de test en plus.
describe.each(CATALOG.map((entry) => [entry.itinerary, entry] as const))("ville du catalogue %s", (id, entry) => {
  const extract = read(entry.file);
  const loop = read(entry.file.replace(/\.json$/, "-boucle.json")) as unknown as { geometry: { coordinates: number[][] } };

  it("APP-003: l'extrait OpenStreetMap est là, attribué, et la ville se charge avec ses bâtiments", () => {
    expect(extract.attribution).toContain(OSM_ATTRIBUTION);
    const inFile = extract.features.filter((f) => f.properties.kind === "building");
    const { buildings } = cityFor(id);
    expect(buildings.length).toBeGreaterThan(0);
    expect(buildings).toHaveLength(inFile.length);
  });

  it("APP-002: la boucle est présente, revient à son départ et chaque point est un sommet de voie de l'extrait", () => {
    const vertices = new Set(
      extract.features.filter((f) => f.properties.kind === "highway").flatMap((f) => (f.geometry.coordinates as number[][]).map((p) => p.join(","))),
    );
    expect(loop.geometry.coordinates.length).toBeGreaterThan(1);
    expect(loop.geometry.coordinates.filter((p) => !vertices.has(p.join(",")))).toEqual([]);
    const { route } = cityFor(id);
    expect(route.lengthM).toBeGreaterThan(0);
  });

  it("APP-003: la carte d'accueil existe, avec son nom et son lieu", () => {
    const card = ITINERARIES.find((i) => i.id === id);
    expect(card).toMatchObject({ name: entry.label, place: entry.place, available: true });
    expect(entry.label.length).toBeGreaterThan(0);
    expect(entry.place.length).toBeGreaterThan(0);
  });

  it("APP-008: la palette vient de la région du départ de la boucle", () => {
    const [lon, lat] = loop.geometry.coordinates[0] as [number, number];
    expect(cityFor(id).palette).toEqual(paletteOf([lon, lat]));
  });
});

describe("palette par région", () => {
  it("APP-008: golfe et Inde ont chacun la leur, une région inconnue reçoit celle d'« ailleurs »", () => {
    const golfe = paletteOf([51.53, 25.29]);
    const inde = paletteOf([73.85, 18.52]);
    const ailleurs = paletteOf([-70, -33]);
    expect(regionOf([-70, -33])).toBe("ailleurs");
    expect(new Set([golfe.ground, inde.ground, ailleurs.ground]).size).toBe(3);
    expect(paletteOf([5.4, 43.5])).toEqual(ailleurs);
    expect(ailleurs.buildings.length).toBeGreaterThan(0);
  });
});
