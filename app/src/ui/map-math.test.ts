import { describe, expect, it } from "vitest";
import { MAX_ZOOM, MIN_ZOOM, clampZoom, lonLatToWorld, visibleTiles, worldToLonLat } from "./map-math.ts";

describe("calculs de la carte de l'accueil", () => {
  it("place le point (0, 0) au centre du monde, et revient au même point", () => {
    expect(lonLatToWorld([0, 0], 1)).toEqual({ x: 256, y: 256 });
    const back = worldToLonLat(lonLatToWorld([73.8567, 18.5204], 15), 15);
    expect(back[0]).toBeCloseTo(73.8567, 6);
    expect(back[1]).toBeCloseTo(18.5204, 6);
  });

  it("borne la latitude de la projection et le zoom", () => {
    expect(lonLatToWorld([0, 90], 2).y).toBeCloseTo(0, 0);
    expect(lonLatToWorld([0, -90], 2).y).toBeCloseTo(1024, 0);
    expect(clampZoom(0)).toBe(MIN_ZOOM);
    expect(clampZoom(30)).toBe(MAX_ZOOM);
    expect(clampZoom(10)).toBe(10);
  });

  it("liste les tuiles OpenStreetMap qui couvrent la vue, posées par rapport à son coin", () => {
    const tiles = visibleTiles([0, 0], 1, 256, 256);
    expect(tiles).toEqual([
      { url: "https://tile.openstreetmap.org/1/0/0.png", left: -128, top: -128 },
      { url: "https://tile.openstreetmap.org/1/1/0.png", left: 128, top: -128 },
      { url: "https://tile.openstreetmap.org/1/0/1.png", left: -128, top: 128 },
      { url: "https://tile.openstreetmap.org/1/1/1.png", left: 128, top: 128 },
    ]);
  });

  it("répète le monde en largeur et s'arrête en hauteur", () => {
    const west = visibleTiles([-179.9, 0], 2, 512, 256);
    expect(west.some((t) => t.url.endsWith("/2/3/2.png") || t.url.endsWith("/2/3/1.png"))).toBe(true);
    const pole = visibleTiles([0, 85], 2, 256, 1024);
    expect(pole.every((t) => !t.url.endsWith("/-1.png"))).toBe(true);
    expect(pole.every((t) => Number(t.url.split("/").pop()?.replace(".png", "")) < 4)).toBe(true);
  });
});
