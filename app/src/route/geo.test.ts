import { describe, expect, it } from "vitest";
import { toLocalMetres } from "./geo.ts";

describe("GPS vers mètres locaux", () => {
  const origin = [51.5, 25.3] as const;

  it("place l'origine en (0, 0)", () => {
    expect(toLocalMetres(origin, origin)).toEqual({ x: 0, z: -0 });
  });

  it("compte x vers l'est et z vers le sud, en mètres", () => {
    // 0,001° de latitude vers le nord ≈ 111 m ; 0,001° de longitude ≈ 111 m × cos(25,3°) ≈ 100 m.
    const north = toLocalMetres(origin, [51.5, 25.301]);
    expect(north.x).toBeCloseTo(0);
    expect(north.z).toBeCloseTo(-111.2, 0);
    const east = toLocalMetres(origin, [51.501, 25.3]);
    expect(east.x).toBeCloseTo(100.5, 0);
    expect(east.z).toBeCloseTo(0);
  });
});
