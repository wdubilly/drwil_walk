import { Mesh, Vector3, type BufferGeometry, type MeshToonMaterial } from "three";
import { describe, expect, it } from "vitest";
import { createPath } from "../route/path.ts";
import { LOCAL_MATERIALS_NAME, MATERIAL_OFFSET_M, WEAR_HEIGHT_M, buildLocalMaterials, type MaterialContext } from "./material-mesh.ts";
import { MAX_LOCAL_MATERIALS } from "./material-library.ts";
import { testMaterials } from "./material-double.ts";
import type { Building } from "./souq-data.ts";

const ROUTE = createPath([{ x: -10, z: -6 }, { x: 600, z: -6 }]);
const CTX: MaterialContext = { detail: "full", region: "ailleurs", route: ROUTE, footLight: 0.55 };

function house(i: number, extra: Partial<Building> = {}): Building {
  const x = i * 14;
  return { id: 5000 + i, kind: "yes", heightM: 9, footprint: [{ x, z: 0 }, { x: x + 10, z: 0 }, { x: x + 10, z: 10 }, { x, z: 10 }, { x, z: 0 }], ...extra };
}
const row = (n: number): Building[] => Array.from({ length: n }, (_, i) => house(i));
const meshes = (buildings: Building[], ctx = CTX, materials = testMaterials()): Mesh[] => buildLocalMaterials(buildings, materials, ctx).children as Mesh[];
const values = (g: BufferGeometry, name: string): number[] => [...(g.getAttribute(name).array as Float32Array)];

describe("matériaux locaux posés sur les façades", () => {
  it("APP-012: un maillage par matériau employé, nommé, texturé (couleur et relief), dans le budget de la scène", () => {
    const materials = testMaterials();
    const group = buildLocalMaterials(row(30), materials, CTX);
    expect(group.name).toBe(LOCAL_MATERIALS_NAME);
    expect(group.children.map((m) => m.name).sort()).toEqual(["materiau-bois", "materiau-enduit"]);
    expect(group.children.length).toBeLessThanOrEqual(MAX_LOCAL_MATERIALS);
    for (const mesh of group.children as Mesh[]) {
      const material = mesh.material as MeshToonMaterial;
      expect(material.map).not.toBeNull();
      expect(material.normalMap).not.toBeNull();
      expect(material.vertexColors).toBe(true);
      expect(values(mesh.geometry, "uv").every(Number.isFinite)).toBe(true);
    }
    // Une texture par image, chargée depuis la bibliothèque embarquée seulement.
    expect(materials.loaded.every((url) => url.startsWith("data:image/jpeg;base64,"))).toBe(true);
    expect(materials.loaded).toHaveLength(4);
  });

  it("APP-012: le placage se tient devant le mur, face avant vers l'extérieur, quel que soit le sens du contour", () => {
    const reversed = house(1, { footprint: [...house(1).footprint].reverse() });
    for (const b of [house(0), reversed]) {
      const [mesh] = meshes([b], CTX, testMaterials());
      const g = (mesh as Mesh).geometry;
      const [p, n] = [values(g, "position"), values(g, "normal")];
      const x0 = (b.footprint[0]?.x ?? 0);
      for (let i = 0; i < p.length; i += 3) {
        const [x, y, z] = [p[i] as number, p[i + 1] as number, p[i + 2] as number];
        // Hors du contour d'exactement l'écart du placage, sur une face au moins.
        const out = Math.max(x0 - x, x - (x0 + 10), -z, z - 10);
        expect(out).toBeCloseTo(MATERIAL_OFFSET_M, 5);
        expect(y).toBeGreaterThanOrEqual(0);
        expect(y).toBeLessThanOrEqual(b.heightM);
      }
      for (let t = 0; t < p.length; t += 9) {
        const [a, bb, c] = [0, 3, 6].map((o) => new Vector3(p[t + o], p[t + o + 1], p[t + o + 2])) as [Vector3, Vector3, Vector3];
        expect(bb.clone().sub(a).cross(c.clone().sub(a)).dot(new Vector3(n[t], n[t + 1], n[t + 2]))).toBeGreaterThan(0);
      }
    }
  });

  it("APP-012: le pied du mur est usé (plus sombre) et suit l'ombrage des murs ; la teinte du bâtiment reste lisible", () => {
    const [mesh] = meshes([house(0)]);
    const g = (mesh as Mesh).geometry;
    const [p, c] = [values(g, "position"), values(g, "color")];
    const shadeAt = (height: number): number => {
      const i = p.findIndex((v, k) => k % 3 === 1 && Math.abs(v - height) < 1e-6);
      return c[i] as number;
    };
    expect(shadeAt(0)).toBeLessThan(CTX.footLight);
    expect(shadeAt(WEAR_HEIGHT_M)).toBeGreaterThan(shadeAt(0));
    expect(shadeAt(9)).toBeGreaterThan(shadeAt(WEAR_HEIGHT_M));
    expect(c.every((v) => Number.isFinite(v) && v >= 0 && v <= 1.5)).toBe(true);
  });

  it("APP-012 (APP-006): en profil « performance » (détail réduit) ou sans détail, aucun placage", () => {
    expect(meshes(row(10), { ...CTX, detail: "reduced" })).toEqual([]);
    expect(meshes(row(10), { ...CTX, detail: "off" })).toEqual([]);
  });

  it("APP-012: n'ajoute rien pour un bâtiment sans mur assez long, ni pour un contour dégénéré", () => {
    const tiny = house(0, { footprint: [{ x: 0, z: 0 }, { x: 2, z: 0 }, { x: 2, z: 2 }, { x: 0, z: 2 }, { x: 0, z: 0 }] });
    expect(meshes([tiny, house(1, { footprint: [{ x: 14, z: 0 }, { x: 24, z: 0 }, { x: 14, z: 0 }] })])).toEqual([]);
  });
});
