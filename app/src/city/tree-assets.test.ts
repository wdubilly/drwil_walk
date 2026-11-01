import { readFileSync, statSync } from "node:fs";
import { Texture, TextureLoader } from "three";
import { describe, expect, it, vi } from "vitest";
import { MAX_TREES, MAX_TREE_TRIANGLES } from "./props.ts";
import { loadBundledTreePack } from "./tree-assets.ts";
import { MAX_MODEL_TRIANGLES } from "./tree-pack.ts";

const assets = new URL("../../assets/", import.meta.url);

describe("arbres du pack embarqué dans le dépôt", () => {
  it("APP-003: se chargent sans réseau, sous les plafonds de triangles, et la texture vient des données embarquées", async () => {
    const load = vi.spyOn(TextureLoader.prototype, "loadAsync").mockResolvedValue(new Texture());
    vi.stubGlobal("fetch", () => Promise.reject(new Error("réseau interdit aux tests")));
    const pack = await loadBundledTreePack();
    vi.unstubAllGlobals();
    expect(String(load.mock.calls[0]?.[0])).toMatch(/^data:image\/png;base64,/);
    load.mockRestore();
    expect(pack.variants.length).toBeGreaterThanOrEqual(3);
    for (const variant of pack.variants) expect(variant.triangles).toBeLessThanOrEqual(MAX_MODEL_TRIANGLES);
    const worst = Math.max(...pack.variants.map((v) => v.triangles));
    expect(worst * MAX_TREES).toBeLessThanOrEqual(MAX_TREE_TRIANGLES);
  });

  it("APP-003: les fichiers restent légers (de l'ordre du méga-octet au total) et la licence CC0 est à côté", () => {
    const size = ["quaternius-trees.json", "quaternius-licence.txt", "PROVENANCE.md"].reduce((sum, name) => sum + statSync(new URL(name, assets)).size, 0);
    expect(size).toBeLessThan(1_000_000);
    expect(readFileSync(new URL("quaternius-licence.txt", assets), "utf8")).toContain("CC0 1.0");
  });

  it("APP-003: la provenance écrit le pack, la page, la version, la date, la licence, les fichiers retenus et l'écart de contenu", () => {
    const provenance = readFileSync(new URL("PROVENANCE.md", assets), "utf8");
    const models = (JSON.parse(readFileSync(new URL("quaternius-trees.json", assets), "utf8")) as { models: { name: string }[] }).models;
    for (const needle of ["Stylized Nature MegaKit", "https://quaternius.com/packs/stylizednaturemegakit.html", "Standard", "2026-11-01", "CC0", "15 arbres", "40"]) {
      expect(provenance).toContain(needle);
    }
    for (const model of models) expect(provenance).toContain(model.name);
  });
});
