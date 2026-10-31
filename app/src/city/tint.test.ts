import { describe, expect, it } from "vitest";
import { buildingLook, parseColour, propKind } from "../../scripts/osm-tags.ts";
import { materialTone, parseHex } from "./tint.ts";

describe("teintes issues des balises OpenStreetMap", () => {
  it("APP-003: lit une couleur en #rrggbb, #rgb ou nom courant, et ignore le reste", () => {
    expect(parseColour("#C8785A")).toBe("#c8785a");
    expect(parseColour(" #f80 ")).toBe("#ff8800");
    expect(parseColour("Red")).toBe("#cc3333");
    expect(parseColour("saumon vif")).toBeUndefined();
    expect(parseColour(undefined)).toBeUndefined();
  });

  it("APP-003: ne garde des balises d'un bâtiment que ce qui est lisible", () => {
    expect(buildingLook({ "building:colour": "white", "roof:colour": "#726B60", "building:material": "brick" })).toEqual({
      colour: "#ffffff", roofColour: "#726b60", material: "brick",
    });
    expect(buildingLook({ "building:colour": "?", building: "yes" })).toEqual({});
  });

  it("APP-003: reconnaît les arbres, lampadaires et bancs par leurs balises exactes", () => {
    expect(propKind({ natural: "tree" })).toBe("tree");
    expect(propKind({ highway: "street_lamp" })).toBe("lamp");
    expect(propKind({ amenity: "bench" })).toBe("bench");
    expect(propKind({ natural: "wood" })).toBeUndefined();
    expect(propKind({})).toBeUndefined();
  });

  it("APP-003: convertit #rrggbb en nombre et un matériau en ton, sans inventer pour un matériau inconnu", () => {
    expect(parseHex("#102030")).toBe(0x102030);
    expect(parseHex("rouge")).toBeUndefined();
    expect(materialTone("brick")).toBe(0xa4513b);
    expect(materialTone("papier")).toBeUndefined();
    expect(materialTone(undefined)).toBeUndefined();
  });
});
