import { describe, expect, it, vi } from "vitest";
import { rejectWith } from "./reject-double.ts";
import { MAX_ROUTE_M } from "./providers.ts";
import { ROUTES_URL, createGoogleRouter, readRoutesKey } from "./routes-api.ts";

const KEY = "cle-fictive-routes";
const FROM = [73.8567, 18.5204] as const;
const TO = [73.86, 18.522] as const;
const computeWalkingRoute = (from: readonly [number, number], to: readonly [number, number], config: { apiKey: string; fetch: typeof fetch }) =>
  createGoogleRouter(config).walk(from, to);
const ok = (body: unknown) => vi.fn(() => Promise.resolve(Response.json(body)));
const good = { routes: [{ distanceMeters: 450, polyline: { geoJsonLinestring: { coordinates: [[73.8567, 18.5204], [73.858, 18.521], [73.86, 18.522]] } } }] };

describe("APP-002: calcul du chemin à pied par Google, option derrière l'interface Router (QUA-020, fournisseur factice)", () => {
  it("demande un chemin piéton avec la clé en en-tête et rend le tracé", async () => {
    const fetchFn = ok(good);
    const route = await computeWalkingRoute(FROM, TO, { apiKey: KEY, fetch: fetchFn });
    expect(route).toEqual([[73.8567, 18.5204], [73.858, 18.521], [73.86, 18.522]]);
    const [url, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(ROUTES_URL);
    expect((init.headers as Record<string, string>)["X-Goog-Api-Key"]).toBe(KEY);
    const body = JSON.parse(init.body as string) as { travelMode: string; origin: { location: { latLng: { latitude: number } } } };
    expect(body.travelMode).toBe("WALK");
    expect(body.origin.location.latLng.latitude).toBe(18.5204);
  });

  it("refuse avant tout appel un trajet de plus de 5 km à vol d'oiseau", async () => {
    const fetchFn = ok(good);
    await expect(computeWalkingRoute(FROM, [73.92, 18.5204], { apiKey: KEY, fetch: fetchFn })).rejects.toThrow("Trajet trop long : à vol d'oiseau");
    expect(fetchFn).not.toHaveBeenCalled();
    expect(MAX_ROUTE_M).toBe(5000);
  });

  it("refuse un chemin à pied de plus de 5 km", async () => {
    const long = { routes: [{ ...good.routes[0], distanceMeters: 6200 }] };
    await expect(computeWalkingRoute(FROM, TO, { apiKey: KEY, fetch: ok(long) })).rejects.toThrow("le chemin à pied fait 6,2 km, 5 km au plus");
  });

  it("QUA-002: dit le refus du service, sans jamais montrer la clé", async () => {
    const refused = vi.fn(() => Promise.resolve(Response.json({ error: KEY }, { status: 403 })));
    await expect(computeWalkingRoute(FROM, TO, { apiKey: KEY, fetch: refused })).rejects.toThrow("répondu 403");
    const down = vi.fn(() => Promise.reject(new Error(`réseau coupé vers ${KEY}`)));
    const error = await computeWalkingRoute(FROM, TO, { apiKey: KEY, fetch: down }).then(() => new Error("non rejeté"), (e: unknown) => e as Error);
    expect(error.message).toContain("service injoignable (réseau coupé vers ***)");
    expect(error.message).not.toContain(KEY);
    const odd = vi.fn(() => rejectWith("panne"));
    await expect(computeWalkingRoute(FROM, TO, { apiKey: KEY, fetch: odd })).rejects.toThrow("(panne)");
  });

  it("QUA-002: dit qu'aucun chemin n'existe ou que la réponse est vide", async () => {
    for (const body of [{}, { routes: [] }, { routes: [{ polyline: { geoJsonLinestring: { coordinates: [[1, 2]] } } }] }]) {
      await expect(computeWalkingRoute(FROM, TO, { apiKey: KEY, fetch: ok(body) })).rejects.toThrow("aucun chemin à pied");
    }
  });

  it("accepte une réponse sans distance annoncée", async () => {
    const bare = { routes: [{ polyline: good.routes[0]?.polyline }] };
    await expect(computeWalkingRoute(FROM, TO, { apiKey: KEY, fetch: ok(bare) })).resolves.toHaveLength(3);
  });

  it("lit la clé Routes de l'environnement, sans espace, ou rien", () => {
    expect(readRoutesKey({ VITE_GOOGLE_ROUTES_API_KEY: ` ${KEY} ` })).toBe(KEY);
    for (const env of [undefined, {}, { VITE_GOOGLE_ROUTES_API_KEY: "  " }, { VITE_GOOGLE_ROUTES_API_KEY: 3 }]) {
      expect(readRoutesKey(env)).toBeUndefined();
    }
  });
});
