import { Plane, Vector3 } from "three";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_ZONE,
  ZONE_STORAGE_KEY,
  loadZone,
  parseZone,
  saveZone,
  zonePlanes,
  type Zone,
} from "./zone.ts";

const memory = () => {
  const data = new Map<string, string>();
  return { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v) };
};
/** Un point est dans la zone si les six plans le voient du côté coupé (distance négative), règle de `clipIntersection`. */
const inside = (zone: Zone, x: number, y: number, z: number): boolean =>
  zonePlanes(zone).every((s) => new Plane(new Vector3(s.normal.x, s.normal.y, s.normal.z), s.constant).distanceToPoint(new Vector3(x, y, z)) < 0);

describe("zone tapis", () => {
  it("APP-001: la boîte par défaut entoure la position de départ, au sol, jusqu'à hauteur de console", () => {
    expect(inside(DEFAULT_ZONE, 0, 0, 0)).toBe(true);
    expect(inside(DEFAULT_ZONE, 0.55, 1.0, -1.1)).toBe(true);
    expect(inside(DEFAULT_ZONE, 0.65, 1.0, 0)).toBe(false);
    expect(inside(DEFAULT_ZONE, 0, 1.0, 1.3)).toBe(false);
    expect(inside(DEFAULT_ZONE, 0, 1.3, 0)).toBe(false);
    expect(inside(DEFAULT_ZONE, 0, -0.2, 0)).toBe(false);
  });

  it("APP-001: la boîte suit son centre et son cap", () => {
    const zone = { ...DEFAULT_ZONE, x: 2, z: -1, yawRad: Math.PI / 2 };
    // Tournée d'un quart de tour, la profondeur (2,4 m) s'étend sur l'axe X.
    expect(inside(zone, 2 + 1.1, 0.5, -1)).toBe(true);
    expect(inside(zone, 2, 0.5, -1 + 1.1)).toBe(false);
    expect(inside(zone, 2 + 1.3, 0.5, -1)).toBe(false);
    expect(inside(zone, 0, 0.5, 0)).toBe(false);
  });

  it("APP-001: une zone illisible, incomplète ou aberrante est remplacée par la boîte par défaut, jamais par rien", () => {
    expect(parseZone({ ...DEFAULT_ZONE, x: 1 })).toEqual({ ...DEFAULT_ZONE, x: 1 });
    for (const raw of [null, 3, "x", {}, { ...DEFAULT_ZONE, width: 0 }, { ...DEFAULT_ZONE, depth: 99 }, { ...DEFAULT_ZONE, x: Infinity },
      { ...DEFAULT_ZONE, z: "1" }, { ...DEFAULT_ZONE, height: NaN }, { ...DEFAULT_ZONE, yawRad: 50 }, { ...DEFAULT_ZONE, x: 9 }]) {
      expect(parseZone(raw)).toBe(DEFAULT_ZONE);
    }
  });

  it("APP-001: enregistre la zone et la relit au lancement suivant", () => {
    const storage = memory();
    const zone = { ...DEFAULT_ZONE, x: 0.5, width: 1.5 };
    expect(loadZone(storage)).toBe(DEFAULT_ZONE);
    expect(saveZone(storage, zone)).toBe(true);
    expect(loadZone(storage)).toEqual(zone);
  });

  it("APP-001: un stockage absent, interdit ou illisible donne la boîte par défaut", () => {
    expect(loadZone(undefined)).toBe(DEFAULT_ZONE);
    const broken = memory();
    broken.setItem(ZONE_STORAGE_KEY, "{pas du json");
    expect(loadZone(broken)).toBe(DEFAULT_ZONE);
    const denied = { getItem: () => { throw new Error("interdit"); }, setItem: () => { throw new Error("plein"); } };
    expect(loadZone(denied)).toBe(DEFAULT_ZONE);
    expect(saveZone(denied, DEFAULT_ZONE)).toBe(false);
    expect(saveZone(undefined, DEFAULT_ZONE)).toBe(false);
  });
});
