import { RepeatWrapping, Texture, TextureLoader } from "three";
import { describe, expect, it, vi } from "vitest";
import { MAX_LOCAL_MATERIALS, MAX_TEXTURE_BYTES, hasLocalMaterials, localMaterialsFor, parseLibrary, textureBytes } from "./material-library.ts";
import { ITINERARIES } from "../route/itineraries.ts";
import { materialEntry as entry, rawLibrary as raw } from "./material-double.ts";

describe("bibliothèque de matériaux locaux", () => {
  it("APP-012: seul le souk a une bibliothèque embarquée, lisible, aux couleurs dites provisoires, dans le budget de mémoire", () => {
    expect(ITINERARIES.filter((i) => hasLocalMaterials(i.id)).map((i) => i.id)).toEqual(["doha-souq-waqif"]);
    const local = localMaterialsFor("doha-souq-waqif", () => new Texture());
    expect(local?.library.provisional).toBe(true);
    expect(local?.library.materials.map((m) => m.id)).toEqual(["enduit", "pierre", "bois"]);
    expect(textureBytes(local?.library as never)).toBeLessThanOrEqual(MAX_TEXTURE_BYTES);
    expect(localMaterialsFor("pune-fc-road")).toBeUndefined();
    expect(hasLocalMaterials("toString")).toBe(false);
  });

  it("APP-012: lit une bibliothèque valide ; ses couleurs viennent des photos ou sont dites provisoires", () => {
    const library = parseLibrary(raw());
    expect(library).toMatchObject({ itinerary: "test", provisional: false, textureSizePx: 256 });
    expect(library.materials[0]).toMatchObject({ colour: 0xc99a6b, tints: [0xc99a6b, 0xd2b48c], sizeM: 2 });
    expect(library.families.village).toEqual(["bois"]);
    expect(parseLibrary(raw({ colours: { source: "provisoire" } })).provisional).toBe(true);
    // Deux textures par matériau, RGBA, mipmaps comprises (un tiers de plus).
    expect(textureBytes({ materials: library.materials, textureSizePx: 256 })).toBe(Math.ceil((2 * 2 * 256 * 256 * 4 * 4) / 3));
  });

  it("APP-012: refuse une texture hors du dépôt (aucun appel réseau dans le casque) et toute donnée incohérente", () => {
    expect(() => parseLibrary(raw({ schema: 2 }))).toThrow("schéma inconnu");
    expect(() => parseLibrary(raw({ materials: [{ ...entry("enduit"), albedo: "https://ailleurs.example/t.jpg" }] }))).toThrow("texture hors du dépôt");
    expect(() => parseLibrary(raw({ materials: [{ ...entry("enduit"), colour: "ocre" }] }))).toThrow("couleur ocre");
    expect(() => parseLibrary(raw({ materials: [{ ...entry("enduit"), sizeM: 0 }] }))).toThrow("taille de enduit");
    expect(() => parseLibrary(raw({ materials: [] }))).toThrow("0 matériau(x)");
    expect(() => parseLibrary(raw({ materials: ["a", "b", "c", "d"].slice(0, MAX_LOCAL_MATERIALS + 1).map(entry) }))).toThrow(`${String(MAX_LOCAL_MATERIALS + 1)} matériau(x)`);
    expect(() => parseLibrary(raw({ families: { ancien: ["marbre"] } }))).toThrow("famille provencale");
    expect(() => parseLibrary(raw({ families: { ...raw().families, ancien: ["marbre"] } }))).toThrow("famille ancien");
    expect(() => parseLibrary(raw({ textureSizePx: 2048 }))).toThrow("budget de mémoire des textures dépassé");
  });

  it("APP-012: crée chaque texture une seule fois, répétée sur le mur, la couleur en sRGB", () => {
    const load = vi.spyOn(TextureLoader.prototype, "load").mockImplementation(() => new Texture());
    const local = localMaterialsFor("doha-souq-waqif");
    const m = local?.library.materials[0];
    const albedo = local?.texture(m?.albedo as string, true);
    expect(local?.texture(m?.albedo as string, true)).toBe(albedo);
    const normal = local?.texture(m?.normal as string, false);
    expect(load).toHaveBeenCalledTimes(2);
    expect(albedo?.colorSpace).toBe("srgb");
    expect(normal?.colorSpace).not.toBe("srgb");
    expect([albedo?.wrapS, albedo?.wrapT, normal?.wrapS, normal?.wrapT]).toEqual([RepeatWrapping, RepeatWrapping, RepeatWrapping, RepeatWrapping]);
    load.mockRestore();
  });
});
