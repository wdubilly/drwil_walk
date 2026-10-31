import { describe, expect, it, vi } from "vitest";
import { buildQuery } from "../../scripts/extract-souq.ts";
import { FC_ROAD_BBOX, FC_ROAD_USER_AGENT, extractFcRoad } from "../../scripts/extract-fc-road.ts";

describe("extraction de FC Road à Pune depuis OpenStreetMap", () => {
  it("APP-003: interroge Overpass dans le cadre de FC Road, de Jangli Maharaj Road à Ferguson College, en s'identifiant", async () => {
    const fetchFn = vi.fn(() => Promise.resolve(Response.json({ elements: [] })));
    await extractFcRoad(fetchFn);
    const [, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit];
    expect((init.headers as Record<string, string>)["User-Agent"]).toBe(FC_ROAD_USER_AGENT);
    expect((init.body as URLSearchParams).get("data")).toBe(buildQuery(FC_ROAD_BBOX));
    // Le cadre contient le carrefour sud de FC Road (18,5150 ; 73,8422) et son extrémité nord (18,5297 ; 73,8437).
    for (const [lat, lon] of [[18.515, 73.8422], [18.5297, 73.8437]] as const) {
      expect(lat).toBeGreaterThan(FC_ROAD_BBOX.south);
      expect(lat).toBeLessThan(FC_ROAD_BBOX.north);
      expect(lon).toBeGreaterThan(FC_ROAD_BBOX.west);
      expect(lon).toBeLessThan(FC_ROAD_BBOX.east);
    }
  });
});
