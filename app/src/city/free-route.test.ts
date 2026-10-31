import { describe, expect, it, vi } from "vitest";
import { OVERPASS_URL } from "../../scripts/extract-souq.ts";
import { rejectWith } from "../route/reject-double.ts";
import type { LonLat } from "../route/geo.ts";
import { createProviders } from "../route/create-providers.ts";
import { MAX_QUERY_POINTS, bareSouq, corridorQuery, createTripPlanner, loadFreeCity } from "./free-route.ts";

const POINTS: LonLat[] = [[73.8567, 18.5204], [73.858, 18.521], [73.86, 18.522]];
const way = (id: number, tags: Record<string, string>) => ({
  type: "way", id, tags,
  geometry: [{ lat: 18.52, lon: 73.857 }, { lat: 18.5201, lon: 73.857 }, { lat: 18.5201, lon: 73.8571 }, { lat: 18.52, lon: 73.857 }],
});
const overpass = { elements: [way(1, { building: "yes", height: "12" }), way(2, { highway: "residential" })] };
/** Le tracé de POINTS, encodé comme Valhalla (polyligne à 6 décimales). */
const SHAPE = "_tkib@wjzzkCod@gpAo}@_|B";
const routesBody = { trip: { summary: { length: 0.45 }, legs: [{ shape: SHAPE }] } };
const photonBody = { features: [{ geometry: { coordinates: [73.85, 18.52] }, properties: { name: "Pune" } }] };
const planner = (fetchFn: typeof fetch) => createTripPlanner(createProviders({}, fetchFn));

/** Un fetch factice qui répond selon l'hôte : jamais de réseau. */
function fakeFetch(overpassResponse: () => Promise<Response>) {
  return vi.fn((url: string) => {
    const host = new URL(url).host;
    if (host === "valhalla1.openstreetmap.de") return Promise.resolve(Response.json(routesBody));
    if (host === "photon.komoot.io") return Promise.resolve(Response.json(photonBody));
    return overpassResponse();
  }) as unknown as typeof fetch & ReturnType<typeof vi.fn>;
}

describe("APP-003: la ville d'un trajet libre ne vient pas d'un extrait versionné", () => {
  it("APP-003: demande à Overpass les bâtiments et voies proches du tracé, tracé réduit", () => {
    const query = corridorQuery(POINTS);
    expect(query).toContain('way["building"](around:150,18.5204,73.8567,18.521,73.858,18.522,73.86)');
    expect(query).toContain('way["highway"]');
    const many: LonLat[] = Array.from({ length: 500 }, (_, i) => [73 + i / 1000, 18]);
    const kept = corridorQuery(many).match(/18,/g)?.length ?? 0;
    // Deux fois (bâtiments, voies) au plus MAX_QUERY_POINTS + le dernier point.
    expect(kept).toBeLessThanOrEqual(2 * (MAX_QUERY_POINTS + 1));
    expect(corridorQuery(many)).toContain("18,73.499)");
  });

  it("APP-002: lit les bâtiments et les voies, et le tracé est un aller simple", async () => {
    const fetchFn = fakeFetch(() => Promise.resolve(Response.json(overpass)));
    const souq = await loadFreeCity(POINTS, fetchFn);
    expect(souq.buildings).toHaveLength(1);
    expect(souq.buildings[0]?.heightM).toBe(12);
    expect(souq.roads).toHaveLength(1);
    expect(souq.route.loop).toBe(false);
    expect(souq.origin).toEqual(POINTS[0]);
    const [url, init] = (fetchFn.mock.calls[0] ?? []) as [string, RequestInit];
    expect(url).toBe(OVERPASS_URL);
    expect(init.method).toBe("POST");
  });

  it("QUA-002: dit le refus d'Overpass", async () => {
    await expect(loadFreeCity(POINTS, fakeFetch(() => Promise.resolve(new Response("", { status: 429 }))))).rejects.toThrow("Overpass a répondu 429");
  });

  it("refuse un tracé sans longueur (départ et arrivée identiques)", () => {
    expect(() => bareSouq([[1, 2], [1, 2]])).toThrow("points distincts");
  });
});

describe("préparation du trajet libre (QUA-020, services factices)", () => {
  it("calcule le chemin, charge la ville et dit la longueur", async () => {
    const trip = await planner(fakeFetch(() => Promise.resolve(Response.json(overpass)))).plan(POINTS[0] as LonLat, POINTS[2] as LonLat);
    expect(trip.summary).toMatch(/^Trajet prêt : 0,\d km\.$/);
    expect(trip.souq.buildings).toHaveLength(1);
  });

  it("QUA-002: si Overpass tombe, le trajet reste utilisable sans bâtiments et le dit", async () => {
    const down = () => Promise.reject(new Error("coupé"));
    const trip = await planner(fakeFetch(down)).plan(POINTS[0] as LonLat, POINTS[2] as LonLat);
    expect(trip.summary).toContain("Bâtiments OpenStreetMap indisponibles (coupé) : marche sans bâtiments.");
    expect(trip.souq.buildings).toEqual([]);
    const odd = () => rejectWith("panne");
    const t2 = await planner(fakeFetch(odd)).plan(POINTS[0] as LonLat, POINTS[2] as LonLat);
    expect(t2.summary).toContain("(panne)");
  });

  it("cherche une adresse et décrit un point par Photon", async () => {
    const open = planner(fakeFetch(() => Promise.resolve(Response.json(overpass))));
    expect((await open.find("Pune")).label).toBe("Pune");
    expect(await open.describe([73.85, 18.52])).toBe("Pune");
  });
});
