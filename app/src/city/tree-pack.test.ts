import { DoubleSide, RepeatWrapping, SRGBColorSpace, Texture } from "three";
import { describe, expect, it, vi } from "vitest";
import { rejectWith } from "../route/reject-double.ts";
import { LEAF_ALPHA_CUTOFF, MAX_MODEL_TRIANGLES, loadTreePack } from "./tree-pack.ts";

const model = (name: string, extra: Record<string, unknown> = {}): Record<string, unknown> => ({
  name,
  bark: { positions: [0, 0, 0, 1, 0, 0, 0, 1, 0], colors: [0.3, 0.2, 0.1, 0.3, 0.2, 0.1, 0.3, 0.2, 0.1], indices: [0, 1, 2] },
  leaves: { positions: [0, 2, 0, 1, 2, 0, 1, 3, 0, 0, 3, 0], uvs: [0, 0, 2, 0, 2, 2, 0, 2], indices: [0, 3, 2, 0, 2, 1] },
  ...extra,
});
const data = (models: unknown[] = [model("A"), model("B")]): Record<string, unknown> => ({ leafTexture: "data:image/png;base64,AA==", models });
const load = (value: unknown) => loadTreePack(value, () => Promise.resolve(new Texture()));

describe("arbres du pack embarqué", () => {
  it("APP-003: donne une variante par arbre et des matériaux toon partagés, la texture des feuilles découpée au seuil du pack", async () => {
    const loadTexture = vi.fn(() => Promise.resolve(new Texture()));
    const pack = await loadTreePack(data(), loadTexture);
    expect(loadTexture).toHaveBeenCalledWith("data:image/png;base64,AA==");
    expect(pack.variants.map((v) => [v.name, v.triangles])).toEqual([["A", 3], ["B", 3]]);
    expect(pack.variants[0]?.bark.getAttribute("normal").count).toBe(3);
    expect(pack.variants[0]?.leaves.getAttribute("uv").count).toBe(4);
    expect(pack.barkMaterial.vertexColors).toBe(true);
    expect(pack.leavesMaterial.alphaTest).toBe(LEAF_ALPHA_CUTOFF);
    expect(pack.leavesMaterial.side).toBe(DoubleSide);
    expect(pack.leavesMaterial.map?.colorSpace).toBe(SRGBColorSpace);
    expect(pack.leavesMaterial.map?.wrapS).toBe(RepeatWrapping);
  });

  it("QUA-002: une donnée invalide est refusée avec la raison, jamais un arbre cassé", async () => {
    const reason = async (value: unknown): Promise<string> => load(value).then(() => "", (e: unknown) => (e as Error).message);
    const prefix = "arbres du pack Quaternius : ";
    expect(await reason(null)).toBe(`${prefix}aucun arbre dans le modèle`);
    expect(await reason({ ...data(), models: [] })).toBe(`${prefix}aucun arbre dans le modèle`);
    expect(await reason({ models: [model("A")] })).toBe(`${prefix}texture des feuilles absente`);
    expect(await reason(data([{ ...model("A"), name: "" }]))).toBe(`${prefix}arbre sans nom`);
    expect(await reason(data([null]))).toBe(`${prefix}arbre sans nom`);
    expect(await reason(data([model("A", { bark: null })]))).toContain("A, écorce, positions : 3 nombres par élément attendus");
    expect(await reason(data([model("A", { bark: { positions: [0, 0, "x"], colors: [0, 0, 0], indices: [0, 0, 0] } })]))).toContain("positions");
    expect(await reason(data([model("A", { leaves: { positions: [0, 0, 0], uvs: [0, 0, 0], indices: [0, 0, 0] } })]))).toContain("A, feuillage, uvs : 2 nombres");
    const short = { positions: [0, 0, 0], colors: [0, 0, 0, 0, 0, 0], indices: [0, 0, 0] };
    expect(await reason(data([model("A", { bark: short })]))).toContain("colors et positions ne correspondent pas");
    const outside = { positions: [0, 0, 0], colors: [0, 0, 0], indices: [0, 0, 5] };
    expect(await reason(data([model("A", { bark: outside })]))).toContain("indice hors des sommets");
    const fractional = { positions: [0, 0, 0], colors: [0, 0, 0], indices: [0, 0, 0.5] };
    expect(await reason(data([model("A", { bark: fractional })]))).toContain("indice hors des sommets");
  });

  it("QUA-002: refuse un arbre au-dessus du plafond de triangles du modèle", async () => {
    const many = Array.from({ length: MAX_MODEL_TRIANGLES + 1 }, () => [0, 1, 2]).flat();
    const heavy = model("Lourd", { bark: { positions: [0, 0, 0, 1, 0, 0, 0, 1, 0], colors: Array.from({ length: 9 }, () => 0.5), indices: many } });
    await expect(load(data([heavy]))).rejects.toThrow(`Lourd : ${String(MAX_MODEL_TRIANGLES + 3)} triangles, plafond ${String(MAX_MODEL_TRIANGLES)}`);
  });

  it("QUA-002: une texture qui ne se charge pas est dite", async () => {
    await expect(loadTreePack(data(), () => Promise.reject(new Error("image illisible")))).rejects.toThrow("arbres du pack Quaternius : image illisible");
    await expect(loadTreePack(data(), () => Promise.resolve(rejectWith("refusée")))).rejects.toThrow("arbres du pack Quaternius : refusée");
  });
});
