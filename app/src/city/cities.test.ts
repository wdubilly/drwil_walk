import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { cityFor } from "./cities.ts";
import { OSM_ATTRIBUTION } from "./licence.ts";

const read = (name: string): unknown => JSON.parse(readFileSync(new URL(`../../data/${name}`, import.meta.url), "utf8"));
const extractFile = read("pune-vieille-ville.json") as {
  attribution: string;
  features: { properties: { kind: string }; geometry: { coordinates: number[][][] | number[][] } }[];
};
const loopFile = read("pune-vieille-ville-boucle.json") as { geometry: { coordinates: number[][] } };

const corniche = {
  extract: read("doha-corniche.json") as typeof extractFile,
  loop: read("doha-corniche-boucle.json") as typeof loopFile,
};

describe("villes des itinéraires", () => {
  it("APP-003: la Vieille ville de Pune affiche les bâtiments de son extrait OpenStreetMap versionné", () => {
    const inFile = extractFile.features.filter((f) => f.properties.kind === "building");
    const { buildings } = cityFor("pune-vieille-ville");
    expect(inFile.length).toBeGreaterThan(1000);
    expect(buildings).toHaveLength(inFile.length);
    expect(buildings.every((b) => b.footprint.length >= 4 && b.heightM > 0)).toBe(true);
    expect(extractFile.attribution).toContain(OSM_ATTRIBUTION);
  });

  it("APP-002: la boucle de Pune fait environ 1,5 km, revient à Shaniwar Wada et suit les voies de l'extrait", () => {
    const { route } = cityFor("pune-vieille-ville");
    expect(route.lengthM).toBeGreaterThan(1200);
    expect(route.lengthM).toBeLessThan(1800);
    const last = route.points[route.points.length - 1];
    expect(last?.x).toBeCloseTo(0);
    expect(last?.z).toBeCloseTo(0);
    const vertices = new Set(
      extractFile.features
        .filter((f) => f.properties.kind === "highway")
        .flatMap((f) => (f.geometry.coordinates as number[][]).map((p) => p.join(","))),
    );
    expect(loopFile.geometry.coordinates.filter((p) => !vertices.has(p.join(",")))).toEqual([]);
  });

  it("APP-003: la Corniche de Doha affiche les bâtiments de son extrait OpenStreetMap versionné", () => {
    const inFile = corniche.extract.features.filter((f) => f.properties.kind === "building");
    const { buildings } = cityFor("doha-corniche");
    expect(inFile.length).toBeGreaterThan(500);
    expect(buildings).toHaveLength(inFile.length);
    expect(buildings.every((b) => b.footprint.length >= 4 && b.heightM > 0)).toBe(true);
    expect(corniche.extract.attribution).toContain(OSM_ATTRIBUTION);
  });

  it("APP-002: la boucle de la Corniche est un aller-retour d'environ 4 km qui revient au départ et suit les voies de l'extrait", () => {
    const { route } = cityFor("doha-corniche");
    expect(route.lengthM).toBeGreaterThan(3500);
    expect(route.lengthM).toBeLessThan(4500);
    const last = route.points[route.points.length - 1];
    expect(last?.x).toBeCloseTo(0);
    expect(last?.z).toBeCloseTo(0);
    const vertices = new Set(
      corniche.extract.features
        .filter((f) => f.properties.kind === "highway")
        .flatMap((f) => (f.geometry.coordinates as number[][]).map((p) => p.join(","))),
    );
    expect(corniche.loop.geometry.coordinates.filter((p) => !vertices.has(p.join(",")))).toEqual([]);
  });

  it("chaque itinéraire a sa ville : celle de Pune n'est pas celle du souk", () => {
    const counts = ["doha-souq-waqif", "pune-vieille-ville", "doha-corniche"].map((id) => cityFor(id).buildings.length);
    expect(new Set(counts).size).toBe(3);
  });

  it("QUA-002: un itinéraire sans ville dans le dépôt est une erreur dite, pas un repli muet", () => {
    expect(() => cityFor("pune-fc-road")).toThrow("aucune ville dans le dépôt");
  });
});
