import { describe, expect, it, vi } from "vitest";
import { buildQuery } from "../../scripts/extract-souq.ts";
import { CITIES, extractCity, type CityId } from "../../scripts/cities.ts";

// Repères de chaque ville, qui doivent tomber dans son emprise ; le souk a son propre test (extract-souq.test.ts).
const LANDMARKS: Record<Exclude<CityId, "souq">, { name: string; points: (readonly [number, number])[] }> = {
  // Shaniwar Wada (18,5195 ; 73,8553) et le temple Dagdusheth (18,5164 ; 73,8560).
  pune: { name: "Vieille ville de Pune", points: [[18.5195, 73.8553], [18.5164, 73.856]] },
  // Le Musée d'art islamique (25,2955 ; 51,5393) et les tours de West Bay (25,3237 ; 51,5265).
  corniche: { name: "Corniche de Doha", points: [[25.2955, 51.5393], [25.3237, 51.5265]] },
  // Le carrefour sud de FC Road (18,5150 ; 73,8422) et son extrémité nord (18,5297 ; 73,8437).
  "fc-road": { name: "FC Road à Pune", points: [[18.515, 73.8422], [18.5297, 73.8437]] },
};

describe("extraction de chaque ville depuis OpenStreetMap (CITIES)", () => {
  it.each(Object.entries(LANDMARKS) as [Exclude<CityId, "souq">, (typeof LANDMARKS)["pune"]][])(
    "APP-003: %s — interroge Overpass dans l'emprise de la ville, en s'identifiant, ses repères dans l'emprise",
    async (id, { name, points }) => {
      const city = CITIES[id];
      const fetchFn = vi.fn(() => Promise.resolve(Response.json({ elements: [] })));
      await extractCity(fetchFn, id);
      const [, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit];
      expect((init.headers as Record<string, string>)["User-Agent"]).toBe(city.userAgent);
      expect(city.userAgent).toContain(name);
      expect((init.body as URLSearchParams).get("data")).toBe(buildQuery(city.bbox));
      for (const [lat, lon] of points) {
        expect(lat).toBeGreaterThan(city.bbox.south);
        expect(lat).toBeLessThan(city.bbox.north);
        expect(lon).toBeGreaterThan(city.bbox.west);
        expect(lon).toBeLessThan(city.bbox.east);
      }
    },
  );

  it("APP-003: chaque ville de CITIES, hors le souk, a ses repères vérifiés", () => {
    expect(Object.keys(CITIES).filter((id) => id !== "souq").sort()).toEqual(Object.keys(LANDMARKS).sort());
  });
});
