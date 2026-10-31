import { describe, expect, it, vi } from "vitest";
import { rejectWith } from "./reject-double.ts";
import { geocode, reverseGeocode, roundedCoordinates } from "./geocoding.ts";

const KEY = "cle-fictive-routes";
const answer = (body: unknown, status = 200) => vi.fn(() => Promise.resolve(Response.json(body, { status })));
const cfg = (fetchFn: typeof fetch, ...noKey: [] | [undefined]) => ({ apiKey: noKey.length > 0 ? undefined : KEY, fetch: fetchFn });
const found = (n = 1) => ({
  status: "OK",
  results: Array.from({ length: n }, (_, i) => ({ formatted_address: `Lieu ${String(i + 1)}`, geometry: { location: { lat: 18.52 + i, lng: 73.85 } } })),
});

describe("recherche d'adresse (QUA-020, géocodage factice)", () => {
  it("retient le premier de plusieurs résultats et rend son libellé", async () => {
    const fetchFn = answer(found(3));
    const place = await geocode("  Shaniwar Wada ", cfg(fetchFn));
    expect(place).toEqual({ point: [73.85, 18.52], label: "Lieu 1" });
    const url = new URL((fetchFn.mock.calls[0] as unknown as [string])[0]);
    expect(url.searchParams.get("address")).toBe("Shaniwar Wada");
    expect(url.searchParams.get("key")).toBe(KEY);
  });

  it("garde le texte tapé si le résultat n'a pas de libellé", async () => {
    const body = { status: "OK", results: [{ geometry: { location: { lat: 1, lng: 2 } } }] };
    expect((await geocode("ici", cfg(answer(body) as unknown as typeof fetch))).label).toBe("ici");
  });

  it("QUA-002: dit une saisie vide sans appeler le service", async () => {
    const fetchFn = answer(found());
    await expect(geocode("   ", cfg(fetchFn as unknown as typeof fetch))).rejects.toThrow("tapez un lieu");
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("QUA-002: dit une adresse introuvable, avec ce qui a été tapé", async () => {
    for (const body of [{ status: "ZERO_RESULTS", results: [] }, { status: "OK" }, { status: "OK", results: [{}] }]) {
      await expect(geocode("xyzzy", cfg(answer(body) as unknown as typeof fetch))).rejects.toThrow("Adresse introuvable : « xyzzy »");
    }
  });

  it("QUA-002: sans clé, dit laquelle manque et n'appelle rien", async () => {
    const fetchFn = answer(found());
    await expect(geocode("a", cfg(fetchFn as unknown as typeof fetch, undefined))).rejects.toThrow("VITE_GOOGLE_ROUTES_API_KEY");
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("QUA-002: dit la clé refusée ou la panne, sans jamais montrer la clé", async () => {
    const denied = answer({ status: "REQUEST_DENIED", error_message: `clé ${KEY} refusée` });
    const e1 = await geocode("a", cfg(denied as unknown as typeof fetch)).then(() => new Error("non rejeté"), (e: unknown) => e as Error);
    expect(e1.message).toContain("REQUEST_DENIED (clé *** refusée)");
    const bare = answer({ status: "REQUEST_DENIED" });
    await expect(geocode("a", cfg(bare as unknown as typeof fetch))).rejects.toThrow("API Geocoding non activée");
    await expect(geocode("a", cfg(answer({}) as unknown as typeof fetch))).rejects.toThrow("réponse inattendue");
    await expect(geocode("a", cfg(answer({}, 500) as unknown as typeof fetch))).rejects.toThrow("répondu 500");
    const down = vi.fn(() => Promise.reject(new Error(`coupé ${KEY}`)));
    const e2 = await geocode("a", cfg(down as unknown as typeof fetch)).then(() => new Error("non rejeté"), (e: unknown) => e as Error);
    expect(e2.message).toContain("injoignable (coupé ***)");
    await expect(geocode("a", cfg(vi.fn(() => rejectWith("panne")) as unknown as typeof fetch))).rejects.toThrow("(panne)");
  });

  it("géocodage inverse : l'adresse du point, sinon ses coordonnées arrondies", async () => {
    const point = [73.85678, 18.52041] as const;
    const fetchFn = answer(found());
    expect(await reverseGeocode(point, cfg(fetchFn as unknown as typeof fetch))).toBe("Lieu 1");
    expect(new URL((fetchFn.mock.calls[0] as unknown as [string])[0]).searchParams.get("latlng")).toBe("18.52041,73.85678");
    expect(roundedCoordinates(point)).toBe("18.5204, 73.8568");
    const bad = [answer({ status: "ZERO_RESULTS" }), answer({ status: "OK", results: [{}] }), answer({}, 403)];
    for (const f of bad) expect(await reverseGeocode(point, cfg(f as unknown as typeof fetch))).toBe("18.5204, 73.8568");
    expect(await reverseGeocode(point, cfg(answer(found()) as unknown as typeof fetch, undefined))).toBe("18.5204, 73.8568");
  });
});
