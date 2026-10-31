import { describe, expect, it, vi } from "vitest";
import { rejectWith } from "./reject-double.ts";
import { createValhallaRouter, decodePolyline6 } from "./valhalla.ts";

const BASE = "https://valhalla.exemple.test";
const FROM = [73.8567, 18.5204] as const;
const TO = [73.86, 18.522] as const;
/** Le tracé 18.5204,73.8567 puis 18.522,73.86, encodé à 6 décimales comme le fait Valhalla. */
const encode = (points: readonly (readonly [number, number])[]): string => {
  let [lat, lon, out] = [0, 0, ""];
  const put = (value: number): void => {
    let v = value < 0 ? ~(value << 1) : value << 1;
    while (v >= 0x20) {
      out += String.fromCharCode((0x20 | (v & 0x1f)) + 63);
      v >>= 5;
    }
    out += String.fromCharCode(v + 63);
  };
  for (const [x, y] of points) {
    const [nlat, nlon] = [Math.round(y * 1e6), Math.round(x * 1e6)];
    put(nlat - lat);
    put(nlon - lon);
    [lat, lon] = [nlat, nlon];
  }
  return out;
};
const SHAPE = encode([FROM, [73.858, 18.521], TO]);
const good = { trip: { summary: { length: 0.45 }, legs: [{ shape: SHAPE }] } };
const answer = (body: unknown, status = 200) => vi.fn(() => Promise.resolve(Response.json(body, { status })));
const walk = (fetchFn: unknown, to: readonly [number, number] = TO) =>
  createValhallaRouter(BASE, fetchFn as typeof fetch).walk(FROM, to);

describe("routage piéton Valhalla (APP-002, service factice)", () => {
  it("décode le tracé à 6 décimales en longitude/latitude", () => {
    expect(decodePolyline6(SHAPE)).toEqual([[73.8567, 18.5204], [73.858, 18.521], [73.86, 18.522]]);
    // Un tracé qui recule (écarts négatifs).
    expect(decodePolyline6(encode([[73.86, 18.522], [73.8567, 18.5204]]))).toEqual([[73.86, 18.522], [73.8567, 18.5204]]);
  });

  it("demande un chemin piéton en une requête GET, sans clé, et rend le tracé", async () => {
    const fetchFn = answer(good);
    expect(await walk(fetchFn)).toEqual([[73.8567, 18.5204], [73.858, 18.521], [73.86, 18.522]]);
    expect(fetchFn).toHaveBeenCalledOnce();
    const url = new URL((fetchFn.mock.calls[0] as unknown as [string])[0]);
    expect(url.origin).toBe(BASE);
    expect(url.pathname).toBe("/route");
    const request = JSON.parse(url.searchParams.get("json") ?? "") as { costing: string; locations: { lat: number; lon: number }[] };
    expect(request.costing).toBe("pedestrian");
    expect(request.locations).toEqual([{ lat: 18.5204, lon: 73.8567 }, { lat: 18.522, lon: 73.86 }]);
  });

  it("refuse avant tout appel un trajet de plus de 5 km à vol d'oiseau, et un chemin de plus de 5 km", async () => {
    const fetchFn = answer(good);
    await expect(walk(fetchFn, [73.92, 18.5204])).rejects.toThrow("Trajet trop long : à vol d'oiseau");
    expect(fetchFn).not.toHaveBeenCalled();
    await expect(walk(answer({ trip: { summary: { length: 6.2 }, legs: [{ shape: SHAPE }] } }))).rejects.toThrow("le chemin à pied fait 6,2 km");
  });

  it("QUA-002: dit la limite du service public, son refus avec sa raison, et la panne", async () => {
    await expect(walk(answer({}, 429))).rejects.toThrow("limite les demandes");
    await expect(walk(answer({ error: "No suitable edges near location" }, 400))).rejects.toThrow("répondu 400 (No suitable edges near location)");
    await expect(walk(vi.fn(() => Promise.resolve(new Response("<html>", { status: 502 }))))).rejects.toThrow("répondu 502");
    await expect(walk(vi.fn(() => Promise.reject(new Error("coupé"))))).rejects.toThrow("injoignable (coupé)");
    await expect(walk(vi.fn(() => rejectWith("panne")))).rejects.toThrow("(panne)");
  });

  it("QUA-002: dit qu'aucun chemin n'existe, et accepte une réponse sans longueur annoncée", async () => {
    for (const body of [{}, { trip: { legs: [] } }, { trip: { legs: [{ shape: encode([FROM]) }] } }]) {
      await expect(walk(answer(body))).rejects.toThrow("aucun chemin à pied");
    }
    await expect(walk(answer({ trip: { legs: [{ shape: SHAPE }] } }))).resolves.toHaveLength(3);
  });
});
