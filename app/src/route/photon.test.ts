import { describe, expect, it, vi } from "vitest";
import { createPhotonGeocoder } from "./photon.ts";
import { rejectWith } from "./reject-double.ts";

const BASE = "https://photon.exemple.test";
const feature = (properties: Record<string, unknown>, coordinates: number[] = [73.85, 18.52]) => ({ geometry: { coordinates }, properties });
const answer = (features: unknown[] | undefined, status = 200) => vi.fn(() => Promise.resolve(Response.json({ features }, { status })));
const geocoder = (fetchFn: unknown) => createPhotonGeocoder(BASE, fetchFn as typeof fetch);
const POINT = [73.85678, 18.52041] as const;
const ROUNDED = "18.5204, 73.8568";

describe("recherche d'adresse Photon (APP-003, service factice)", () => {
  it("retient le premier résultat, compose un libellé sans répétition, une requête sans clé", async () => {
    const fetchFn = answer([
      feature({ name: "Shaniwar Wada", housenumber: "1", street: "Baji Rao Rd", district: "Kasba Peth", city: "Pune", country: "India" }),
      feature({ name: "Autre" }, [1, 2]),
    ]);
    expect(await geocoder(fetchFn).find("  Shaniwar Wada ")).toEqual({
      point: [73.85, 18.52],
      label: "Shaniwar Wada, 1 Baji Rao Rd, Kasba Peth, Pune, India",
    });
    const url = new URL((fetchFn.mock.calls[0] as unknown as [string])[0]);
    expect(url.origin + url.pathname).toBe(`${BASE}/api`);
    expect(url.searchParams.get("q")).toBe("Shaniwar Wada");
    expect(url.searchParams.get("limit")).toBe("1");
    expect(fetchFn).toHaveBeenCalledOnce();
    const same = await geocoder(answer([feature({ name: "Pune", city: "Pune" })])).find("Pune");
    expect(same.label).toBe("Pune");
  });

  it("garde le texte tapé si le résultat n'a pas de libellé", async () => {
    expect((await geocoder(answer([feature({ name: 3 })])).find("ici")).label).toBe("ici");
    expect((await geocoder(answer([{ geometry: { coordinates: [1, 2] } }])).find("là")).label).toBe("là");
  });

  it("QUA-002: dit une saisie vide sans appeler le service", async () => {
    const fetchFn = answer([]);
    await expect(geocoder(fetchFn).find("   ")).rejects.toThrow("tapez un lieu");
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("QUA-002: dit une adresse introuvable, avec ce qui a été tapé", async () => {
    for (const features of [[], undefined, [{}], [{ geometry: { coordinates: [1] } }]]) {
      await expect(geocoder(answer(features)).find("xyzzy")).rejects.toThrow("Adresse introuvable : « xyzzy »");
    }
  });

  it("QUA-002: dit la limite du service public, son refus et la panne", async () => {
    await expect(geocoder(answer([], 429)).find("a")).rejects.toThrow("limite les demandes");
    await expect(geocoder(answer([], 500)).find("a")).rejects.toThrow("répondu 500");
    await expect(geocoder(vi.fn(() => Promise.reject(new Error("coupé")))).find("a")).rejects.toThrow("injoignable (coupé)");
    await expect(geocoder(vi.fn(() => rejectWith("panne"))).find("a")).rejects.toThrow("(panne)");
  });

  it("géocodage inverse : l'adresse du point, sinon ses coordonnées arrondies", async () => {
    const fetchFn = answer([feature({ name: "Rue", city: "Pune" })]);
    expect(await geocoder(fetchFn).describe(POINT)).toBe("Rue, Pune");
    const url = new URL((fetchFn.mock.calls[0] as unknown as [string])[0]);
    expect(url.pathname).toBe("/reverse");
    expect([url.searchParams.get("lon"), url.searchParams.get("lat")]).toEqual(["73.85678", "18.52041"]);
    for (const f of [answer([]), answer([feature({})]), answer([], 429), vi.fn(() => Promise.reject(new Error("coupé")))]) {
      expect(await geocoder(f).describe(POINT)).toBe(ROUNDED);
    }
  });
});
