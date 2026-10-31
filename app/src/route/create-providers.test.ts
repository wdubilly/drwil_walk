import { describe, expect, it, vi } from "vitest";
import { PHOTON_URL, VALHALLA_URL, createProviders } from "./create-providers.ts";

const FROM = [73.8567, 18.5204] as const;
const TO = [73.86, 18.522] as const;
/** Un réseau factice qui note les hôtes appelés et répond vide : seule l'adresse compte ici. */
const spy = () => vi.fn(() => Promise.resolve(Response.json({}, { status: 500 })));
const hostsOf = (fetchFn: ReturnType<typeof spy>) => fetchFn.mock.calls.map((call) => new URL((call as unknown as [string])[0]).host);

describe("choix des services d'un trajet libre (APP-002)", () => {
  it("sans aucune clé, route par Valhalla et cherche par Photon, aux adresses publiques", async () => {
    const fetchFn = spy();
    const providers = createProviders({}, fetchFn);
    await providers.router.walk(FROM, TO).catch(() => undefined);
    await providers.geocoder.find("Pune").catch(() => undefined);
    expect(hostsOf(fetchFn)).toEqual([new URL(VALHALLA_URL).host, new URL(PHOTON_URL).host]);
  });

  it("vise une instance auto-hébergée par des variables non secrètes, sans barre finale", async () => {
    const fetchFn = spy();
    const env = { VITE_ROUTING_URL: " http://localhost:8002/ ", VITE_GEOCODING_URL: "http://localhost:2322" };
    const providers = createProviders(env, fetchFn);
    await providers.router.walk(FROM, TO).catch(() => undefined);
    await providers.geocoder.find("Pune").catch(() => undefined);
    expect((fetchFn.mock.calls[0] as unknown as [string])[0]).toMatch(/^http:\/\/localhost:8002\/route\?/);
    expect((fetchFn.mock.calls[1] as unknown as [string])[0]).toMatch(/^http:\/\/localhost:2322\/api\?/);
  });

  it("ignore une variable vide ou qui n'est pas un texte", async () => {
    const fetchFn = spy();
    const providers = createProviders({ VITE_ROUTING_URL: "  ", VITE_GEOCODING_URL: 3 }, fetchFn);
    await providers.router.walk(FROM, TO).catch(() => undefined);
    await providers.geocoder.find("Pune").catch(() => undefined);
    expect(hostsOf(fetchFn)).toEqual([new URL(VALHALLA_URL).host, new URL(PHOTON_URL).host]);
  });

  it("avec une clé Routes, Google remplace les deux services (option)", async () => {
    const fetchFn = spy();
    const providers = createProviders({ VITE_GOOGLE_ROUTES_API_KEY: "cle-fictive" }, fetchFn);
    await providers.router.walk(FROM, TO).catch(() => undefined);
    await providers.geocoder.find("Pune").catch(() => undefined);
    expect(hostsOf(fetchFn)).toEqual(["routes.googleapis.com", "maps.googleapis.com"]);
    expect(providers.fetch).toBe(fetchFn);
  });
});
