import { describe, expect, it } from "vitest";
import type { Road } from "./souq-data.ts";
import { surfaceOf } from "../../scripts/osm-tags.ts";
import { CENTRE_LINE_MIN_WIDTH_M, buildRoadsGeometry, roadColor, surfaceFor, wearOf, widthOf } from "./roads.ts";

describe("voies dessinées", () => {
  it("APP-003: la largeur suit la classe : les grands axes sont plus larges, les bretelles comme leur voie", () => {
    expect(widthOf("primary")).toBeGreaterThan(widthOf("residential"));
    expect(widthOf("residential")).toBeGreaterThan(widthOf("footway"));
    expect(widthOf("primary_link")).toBe(widthOf("primary"));
    expect(widthOf("inconnue")).toBe(widthOf("footway"));
  });

  it("APP-003: une voie devient un ruban à plat, centré sur son tracé, à la largeur de sa classe", () => {
    const geometry = buildRoadsGeometry([{ highway: "primary", points: [{ x: 0, z: 0 }, { x: 0, z: -100 }] }]);
    geometry.computeBoundingBox();
    const half = widthOf("primary") / 2;
    expect(geometry.boundingBox?.min.x).toBeCloseTo(-half);
    expect(geometry.boundingBox?.max.x).toBeCloseTo(half);
    expect(geometry.boundingBox?.min.z).toBeCloseTo(-100);
    expect(geometry.boundingBox?.max.z).toBeCloseTo(0);
    expect(geometry.boundingBox?.min.y).toBeGreaterThan(0);
    expect(geometry.boundingBox?.max.y).toBeLessThan(0.2);
    // Le corps (6 sommets), deux bordures (12) et la ligne centrale (6) : le ruban lui-même ne change pas.
    expect(geometry.getAttribute("position").count).toBe(24);
    expect(geometry.getAttribute("normal").getY(0)).toBe(1);
  });

  it("ignore un tronçon sans longueur, une voie d'un seul point, et rend un maillage vide sans voie", () => {
    const here = { x: 3, z: 3 };
    const geometry = buildRoadsGeometry([
      { highway: "service", points: [here, here] },
      { highway: "service", points: [here] },
      { highway: "service", points: [] },
    ]);
    expect(geometry.getAttribute("position").count).toBe(0);
    expect(buildRoadsGeometry([]).getAttribute("position").count).toBe(0);
  });

  it("APP-003: chaque classe a sa couleur, la bordure est plus claire que le corps, la ligne plus claire encore", () => {
    const tones = ["trunk", "primary", "secondary", "tertiary", "unclassified", "residential", "living_street", "service", "pedestrian", "footway"]
      .map((highway) => roadColor(highway, 0x808080).getHex());
    expect(new Set(tones).size).toBe(tones.length);
    expect(roadColor("primary_link", 0x808080).getHex()).toBe(roadColor("primary", 0x808080).getHex());
    const geometry = buildRoadsGeometry([{ highway: "primary", points: [{ x: 0, z: 0 }, { x: 0, z: -100 }] }], 0x808080);
    const color = geometry.getAttribute("color");
    expect(color.count).toBe(24);
    expect(color.getX(6)).toBeGreaterThan(color.getX(0));
    expect(color.getX(18)).toBeGreaterThan(color.getX(6));
  });

  it("APP-003: seule une voie assez large reçoit sa ligne centrale", () => {
    const track = (highway: string) => buildRoadsGeometry([{ highway, points: [{ x: 0, z: 0 }, { x: 0, z: -10 }] }]).getAttribute("position").count;
    expect(widthOf("tertiary")).toBe(CENTRE_LINE_MIN_WIDTH_M);
    expect(track("tertiary")).toBe(24);
    expect(track("residential")).toBe(18);
  });
});

describe("revêtement des voies", () => {
  it("APP-009: la balise surface est lue en trois familles ; absente ou inconnue, elle ne donne rien", () => {
    expect(surfaceOf({ surface: "asphalt" })).toBe("asphalt");
    expect(surfaceOf({ surface: " Sett " })).toBe("pave");
    expect(surfaceOf({ surface: "gravel" })).toBe("terre");
    expect(surfaceOf({ surface: "moquette" })).toBeUndefined();
    expect(surfaceOf({})).toBeUndefined();
  });

  it("APP-009: une balise relevée prime, sinon la valeur de la recette, jamais présentée comme relevée", () => {
    const sols = { chaussee: "pave", pieton: "terre" } as const;
    expect(surfaceFor("residential", "asphalt", sols)).toEqual({ kind: "asphalt", origin: "releve" });
    expect(surfaceFor("residential", undefined, sols)).toEqual({ kind: "pave", origin: "regle" });
    expect(surfaceFor("pedestrian", undefined, sols)).toEqual({ kind: "terre", origin: "regle" });
    expect(surfaceFor("primary_link", undefined)).toEqual({ kind: "asphalt", origin: "regle" });
    expect(surfaceFor("footway", undefined, { chaussee: "asphalt" })).toEqual({ kind: "pave", origin: "regle" });
  });

  it("APP-009: le ton suit le revêtement et la recette du lieu ; même données, mêmes sols (APP-013)", () => {
    const road = { highway: "residential", points: [{ x: 0, z: 0 }, { x: 0, z: -20 }] };
    const first = (roads: Road[], place?: { region: string; district?: string }) => buildRoadsGeometry(roads, 0x404040, undefined, place).getAttribute("color").getX(0);
    const asphalt = first([road]);
    expect(first([{ ...road, surface: "pave" }])).toBeGreaterThan(asphalt);
    expect(first([{ ...road, surface: "terre" }])).toBeGreaterThan(asphalt);
    expect(first([road], { region: "inde" })).toBe(asphalt);
    expect(first([{ ...road, highway: "pedestrian" }], { region: "golfe", district: "souq-waqif" })).toBe(first([{ ...road, highway: "pedestrian", surface: "pave" }]));
    expect(first([road])).toBe(first([road]));
  });

  it("APP-013: l'usure est déterministe, bornée, propre à chaque voie, et nulle sans identifiant", () => {
    const ids = Array.from({ length: 200 }, (_, i) => 1000 + i * 7919);
    const wears = ids.map(wearOf);
    expect(wears).toEqual(ids.map(wearOf));
    expect(Math.min(...wears)).toBeGreaterThanOrEqual(-1);
    expect(Math.max(...wears)).toBeLessThanOrEqual(1);
    expect(new Set(wears).size).toBeGreaterThan(150);
    expect(Math.min(...wears)).toBeLessThan(0);
    expect(Math.max(...wears)).toBeGreaterThan(0);
    expect(wearOf(undefined)).toBe(0);
  });

  it("APP-009: une voie usée est plus foncée, une voie poussiéreuse plus claire, sans changer le nombre de sommets", () => {
    const base = { highway: "residential", points: [{ x: 0, z: 0 }, { x: 0, z: -20 }] };
    const shade = (id: number) => buildRoadsGeometry([{ ...base, id }], 0x404040).getAttribute("color").getX(0);
    const byWear = [1, 2, 3, 4, 5, 6, 7, 8].sort((a, b) => wearOf(a) - wearOf(b));
    expect(shade(byWear[0] as number)).toBeLessThan(shade(byWear[7] as number));
    expect(buildRoadsGeometry([{ ...base, id: 1 }]).getAttribute("position").count).toBe(buildRoadsGeometry([base]).getAttribute("position").count);
  });
});
