import { describe, expect, it, vi } from "vitest";
import { buildQuery } from "../../scripts/extract-souq.ts";
import { CORNICHE_BBOX, CORNICHE_USER_AGENT, extractCorniche } from "../../scripts/extract-corniche.ts";

describe("extraction de la Corniche de Doha depuis OpenStreetMap", () => {
  it("APP-003: interroge Overpass dans le cadre du Musée d'art islamique à West Bay, en s'identifiant", async () => {
    const fetchFn = vi.fn(() => Promise.resolve(Response.json({ elements: [] })));
    await extractCorniche(fetchFn);
    const [, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit];
    expect((init.headers as Record<string, string>)["User-Agent"]).toBe(CORNICHE_USER_AGENT);
    expect((init.body as URLSearchParams).get("data")).toBe(buildQuery(CORNICHE_BBOX));
    // Le cadre contient le Musée d'art islamique (25,2955 ; 51,5393) et les tours de West Bay (25,3237 ; 51,5265).
    for (const [lat, lon] of [[25.2955, 51.5393], [25.3237, 51.5265]] as const) {
      expect(lat).toBeGreaterThan(CORNICHE_BBOX.south);
      expect(lat).toBeLessThan(CORNICHE_BBOX.north);
      expect(lon).toBeGreaterThan(CORNICHE_BBOX.west);
      expect(lon).toBeLessThan(CORNICHE_BBOX.east);
    }
  });
});
