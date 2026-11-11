import { describe, expect, it } from "vitest";
import { surfaceOf } from "../../scripts/osm-tags.ts";
import { CENTRE_LINE_MIN_WIDTH_M, buildRoadsGeometry, roadColor, surfaceFor, widthOf } from "./roads.ts";

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

  it("APP-009: une balise relevée prime, sinon la région fixe la valeur, sinon « ailleurs », jamais présentée comme relevée", () => {
    expect(surfaceFor("residential", "pave", "golfe")).toEqual({ kind: "pave", origin: "releve" });
    expect(surfaceFor("residential", undefined, "golfe")).toEqual({ kind: "asphalt", origin: "regle" });
    expect(surfaceFor("pedestrian", undefined, "inde")).toEqual({ kind: "pave", origin: "regle" });
    expect(surfaceFor("primary_link", undefined, "region-inconnue")).toEqual({ kind: "asphalt", origin: "regle" });
  });

  it("APP-009: le quartier surcharge sa région ; une recette sans valeur retombe sur l'asphalte", () => {
    const file = {
      regions: { ailleurs: { sols: { value: { chaussee: "asphalt" as const } } }, x: {} },
      districts: { vieux: { region: "x", sols: { value: { chaussee: "pave" as const } } }, nu: { region: "x" } },
    };
    expect(surfaceFor("service", undefined, "x", "vieux", file).kind).toBe("pave");
    expect(surfaceFor("service", undefined, "x", "nu", file).kind).toBe("asphalt");
    expect(surfaceFor("footway", undefined, "x", undefined, file).kind).toBe("asphalt");
    expect(surfaceFor("service", undefined, "x", undefined, { regions: {} }).kind).toBe("asphalt");
  });
});
