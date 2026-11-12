import { RepeatWrapping, Texture, TextureLoader } from "three";
import { describe, expect, it, vi } from "vitest";
import { MAX_LOCAL_MATERIALS, MAX_TEXTURE_BYTES, hasLocalMaterials, localMaterialsFor, parseLibrary, textureBytes } from "./material-library.ts";
import { ITINERARIES } from "../route/itineraries.ts";
import { materialEntry as entry, rawLibrary as raw } from "./material-double.ts";
import { Window } from "happy-dom";
import recipeData from "../../assets/recette-regions.json" with { type: "json" };
import { RECIPE, loadRecipe, paletteOf, recipeFor } from "./region-palette.ts";
import { documentTexture } from "./material-library.ts";

describe("bibliothèque de matériaux locaux", () => {
  it("APP-012: charge les images embarquées dans le document injecté et met la texture à jour", () => {
    const doc = new Window().document as unknown as Document;
    const texture = documentTexture(doc, "data:image/jpeg;base64,factice");
    const image = texture.image as HTMLImageElement;
    expect(image.ownerDocument).toBe(doc);
    expect(image.src).toBe("data:image/jpeg;base64,factice");
    const before = texture.version;
    image.dispatchEvent(new (doc.defaultView as unknown as Window).Event("load") as unknown as Event);
    expect(texture.version).toBe(before + 1);
  });
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

type Raw = { regions: Record<string, Record<string, unknown>>; districts: Record<string, Record<string, unknown>> };
const at = (group: Record<string, Record<string, unknown>>, name: string): Record<string, unknown> => group[name] ?? {};
const copy = (): Raw => JSON.parse(JSON.stringify(recipeData)) as Raw;

describe("repli des matériaux par région, en données", () => {
  it("APP-012: un quartier sans bibliothèque reçoit la palette de sa région, une région sans jeu propre celle d'« ailleurs »", () => {
    expect(hasLocalMaterials("pune-vieille-ville")).toBe(false);
    expect(recipeFor(RECIPE, "inde", "pune-vieille-ville").palette.value).toEqual(RECIPE.regions["inde"]?.palette?.value);
    expect(paletteOf([73.857, 18.517])).toEqual(RECIPE.regions["inde"]?.palette?.value);
    expect(paletteOf([2.35, 48.85])).toEqual(RECIPE.regions["ailleurs"].palette.value);
    expect(paletteOf([-70, -33])).toEqual(RECIPE.regions["ailleurs"].palette.value);
  });

  it("APP-012: chaque palette de repli dit son origine et reste des teintes valides, sans texture ni réseau", () => {
    for (const entry of [...Object.values(RECIPE.regions), ...Object.values(RECIPE.districts)]) {
      if (!entry.palette) continue;
      expect(["releve", "regle"]).toContain(entry.palette.origin);
      expect(entry.palette.value.buildings.length).toBeGreaterThan(1);
      expect(JSON.stringify(entry.palette)).not.toMatch(/data:|https?:/);
    }
  });

  it("APP-012: une donnée de repli illisible est écartée sans casser la ville, la région ou « ailleurs » prend le relais", () => {
    const raw = copy();
    at(raw.regions, "golfe")["palette"] = { value: { ground: -1 }, origin: "regle" };
    at(raw.regions, "inde")["figurants"] = 7;
    at(raw.districts, "souq-waqif")["bounds"] = { south: 9, north: 1 };
    at(raw.districts, "pune-vieille-ville")["region"] = 4;
    raw.districts["casse"] = 3 as unknown as Record<string, unknown>;
    raw.regions["casse"] = "x" as unknown as Record<string, unknown>;
    const file = loadRecipe(raw);
    expect(recipeFor(file, "golfe").palette.value).toEqual(RECIPE.regions["ailleurs"].palette.value);
    expect(recipeFor(file, "inde").figurants.value).toEqual(RECIPE.regions["ailleurs"].figurants.value);
    expect(file.districts["souq-waqif"]?.bounds).toBeUndefined();
    expect(file.districts["casse"]).toBeUndefined();
    expect(recipeFor(file, "inde").palette.value).toEqual(RECIPE.regions["inde"]?.palette?.value);
  });

  it("APP-012: sans « ailleurs » lisible, rien ne se charge en silence", () => {
    const raw = copy();
    delete at(raw.regions, "ailleurs")["palette"];
    expect(() => loadRecipe(raw)).toThrow("ailleurs");
    expect(() => loadRecipe(null)).toThrow("regions");
    const noDistricts = copy() as Partial<Raw>;
    delete noDistricts.districts;
    expect(loadRecipe(noDistricts).districts).toEqual({});
  });
});
