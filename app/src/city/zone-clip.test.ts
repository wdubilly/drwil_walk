import { Vector3 } from "three";
import { describe, expect, it } from "vitest";
import { DEFAULT_ZONE } from "../safety/zone.ts";
import { createZoneClip } from "./zone-clip.ts";

const clipped = (planes: ReturnType<typeof createZoneClip>["planes"], x: number, y: number, z: number) =>
  planes.every((p) => p.distanceToPoint(new Vector3(x, y, z)) < 0);

describe("découpe de la zone tapis", () => {
  it("APP-001: six plans qui ne coupent que l'intérieur de la boîte, et suivent la zone quand elle change", () => {
    const clip = createZoneClip(DEFAULT_ZONE);
    expect(clip.planes).toHaveLength(6);
    expect(clipped(clip.planes, 0, 0.5, 0)).toBe(true);
    expect(clipped(clip.planes, 3, 0.5, 0)).toBe(false);
    clip.set({ ...DEFAULT_ZONE, x: 3 });
    expect(clipped(clip.planes, 3, 0.5, 0)).toBe(true);
    expect(clipped(clip.planes, 0, 0.5, 0)).toBe(false);
  });
});
