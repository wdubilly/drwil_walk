import { describe, expect, it, vi } from "vitest";
import { buildQuery } from "../../scripts/extract-souq.ts";
import { PUNE_BBOX, PUNE_USER_AGENT, extractPune } from "../../scripts/extract-pune.ts";

describe("extraction de la Vieille ville de Pune depuis OpenStreetMap", () => {
  it("APP-003: interroge Overpass dans le cadre de Shaniwar Wada au temple Dagdusheth, en s'identifiant", async () => {
    const fetchFn = vi.fn(() => Promise.resolve(Response.json({ elements: [] })));
    await extractPune(fetchFn);
    const [, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit];
    expect((init.headers as Record<string, string>)["User-Agent"]).toBe(PUNE_USER_AGENT);
    expect((init.body as URLSearchParams).get("data")).toBe(buildQuery(PUNE_BBOX));
    // Le cadre contient Shaniwar Wada (18,5195 ; 73,8553) et le temple (18,5164 ; 73,8560).
    for (const [lat, lon] of [[18.5195, 73.8553], [18.5164, 73.856]] as const) {
      expect(lat).toBeGreaterThan(PUNE_BBOX.south);
      expect(lat).toBeLessThan(PUNE_BBOX.north);
      expect(lon).toBeGreaterThan(PUNE_BBOX.west);
      expect(lon).toBeLessThan(PUNE_BBOX.east);
    }
  });
});
