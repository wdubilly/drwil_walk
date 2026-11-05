import { statSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { loadBundledModels } from "./traffic-assets.ts";
import { MAX_MODEL_TRIANGLES, MAX_TRAFFIC_MODELS, readTrafficPack } from "./traffic-pack.ts";

const assets = new URL("../../assets/", import.meta.url);
const cube = (name = "cube", extra: Record<string, unknown> = {}) => ({
  name,
  positions: [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
  palette: [1, 0, 0, 0, 1, 0],
  shades: [0, 1, 0, 1],
  indices: [0, 1, 2, 0, 2, 3, 0, 3, 1, 1, 3, 2],
  ...extra,
});

describe("modèles des figurants", () => {
  it("APP-014: les modèles embarqués se lisent, chacun sous son plafond de triangles, couleurs par sommet", async () => {
    const pack = readTrafficPack(await loadBundledModels());
    expect([...pack.keys()]).toEqual(expect.arrayContaining(["sedan", "taxi", "suv", "van", "delivery", "motorcycle", "character-male-a"]));
    for (const model of pack.values()) {
      expect(model.triangles).toBeLessThanOrEqual(MAX_MODEL_TRIANGLES);
      expect(model.geometry.getAttribute("color").count).toBe(model.geometry.getAttribute("position").count);
      expect(model.size.y).toBeGreaterThan(0);
    }
    expect(pack.size).toBeLessThanOrEqual(MAX_TRAFFIC_MODELS);
  });

  it("APP-014: les fichiers embarqués restent légers (modèles, catalogue, licences)", () => {
    const files = ["figurants.json", "figurants-catalogue.json", "kenney-car-kit-licence.txt", "kenney-mini-characters-licence.txt"];
    expect(files.reduce((sum, name) => sum + statSync(new URL(name, assets)).size, 0)).toBeLessThan(600_000);
  });

  it("APP-014: un fichier de modèles illisible ou hors plafond est refusé avec sa raison", () => {
    expect(readTrafficPack({ models: [cube()] }).get("cube")?.size).toEqual({ x: 1, y: 1, z: 1 });
    expect(() => readTrafficPack(null)).toThrow("aucun modèle de figurant");
    expect(() => readTrafficPack({ models: [] })).toThrow("aucun modèle de figurant");
    expect(() => readTrafficPack({ models: Array.from({ length: MAX_TRAFFIC_MODELS + 1 }, (_, i) => cube(`c${String(i)}`)) })).toThrow("plafond");
    expect(() => readTrafficPack({ models: [7] })).toThrow("modèle sans nom");
    expect(() => readTrafficPack({ models: [cube("c", { positions: [0, 1] })] })).toThrow("c, positions : 3 nombres");
    expect(() => readTrafficPack({ models: [cube("c", { palette: [1, "x", 0] })] })).toThrow("c, palette");
    expect(() => readTrafficPack({ models: [cube("c", { shades: [0, 1] })] })).toThrow("teintes et sommets");
    expect(() => readTrafficPack({ models: [cube("c", { shades: [0, 1, 2, 0] })] })).toThrow("teintes et sommets");
    expect(() => readTrafficPack({ models: [cube("c", { indices: [0, 1, 9] })] })).toThrow("indice hors des sommets");
    expect(() => readTrafficPack({ models: [cube("c", { indices: Array.from({ length: (MAX_MODEL_TRIANGLES + 1) * 3 }, () => 0) })] })).toThrow("triangles, plafond");
    expect(() => readTrafficPack({ models: [cube("c", { positions: [0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 1] })] })).toThrow("modèle plat");
  });
});
