import { describe, expect, it } from "vitest";
import { clusterMesh, simplifyTo, thinCards, type Cards, type Colored } from "./mesh-simplify.ts";

/** Une grille de n×n carrés (deux triangles chacun) de 10 cm de côté, rouge à gauche et bleue à droite. */
function grid(n: number): Colored {
  const positions: number[] = [];
  const colors: number[] = [];
  for (let x = 0; x <= n; x += 1) {
    for (let z = 0; z <= n; z += 1) {
      positions.push(x * 0.1, 0, z * 0.1);
      colors.push(x < n / 2 ? 1 : 0, 0, x < n / 2 ? 0 : 1);
    }
  }
  const indices: number[] = [];
  for (let x = 0; x < n; x += 1) {
    for (let z = 0; z < n; z += 1) {
      const a = x * (n + 1) + z;
      indices.push(a, a + 1, a + n + 2, a, a + n + 2, a + n + 1);
    }
  }
  return { positions, colors, indices };
}

describe("allègement des maillages du pack d'arbres", () => {
  it("APP-003: regroupe les sommets d'une même case à leur moyenne et retire les triangles écrasés", () => {
    const merged = clusterMesh(grid(4), 0.2);
    expect(merged.positions.length / 3).toBeLessThan(25);
    expect(merged.indices.length / 3).toBeLessThan(32);
    expect(merged.indices.length % 3).toBe(0);
    expect(merged.colors.length).toBe(merged.positions.length);
    // Un maillage dont tous les sommets tiennent dans une case ne garde aucun triangle.
    expect(clusterMesh(grid(4), 100).indices).toEqual([]);
  });

  it("APP-003: ne garde qu'une fois un triangle qui retombe sur un autre", () => {
    const twice: Colored = { positions: [0, 0, 0, 1, 0, 0, 0, 1, 0], colors: Array.from({ length: 9 }, () => 1), indices: [0, 1, 2, 2, 1, 0] };
    expect(clusterMesh(twice, 0.5).indices.length).toBe(3);
  });

  it("APP-003: grossit les cases jusqu'à tenir dans le nombre de triangles demandé, sans toucher un maillage déjà assez léger", () => {
    const mesh = grid(10);
    expect(simplifyTo(mesh, 1000).indices.length / 3).toBe(200);
    expect(simplifyTo(mesh, 60).indices.length / 3).toBeLessThanOrEqual(60);
    expect(simplifyTo(mesh, 60).indices.length).toBeGreaterThan(0);
  });
});

/** `n` cartes d'un mètre, de quatre sommets consécutifs, avec deux triangles rangés dans un ordre quelconque. */
function cards(n: number): Cards {
  const positions = Array.from({ length: n }, (_, q) => [0, 0, q * 10, 1, 0, q * 10, 1, 1, q * 10, 0, 1, q * 10]).flat();
  const uvs = Array.from({ length: n }, () => [0, 0, 1, 0, 1, 1, 0, 1]).flat();
  const indices = Array.from({ length: n }, (_, q) => [0, 3, 2, 0, 2, 1].map((v) => v + q * 4)).flat().reverse();
  return { positions, uvs, indices };
}

describe("éclaircissement des cartes de feuilles", () => {
  it("APP-003: garde une carte sur trois (au plus le nombre voulu) et les agrandit autour de leur centre", () => {
    const out = thinCards(cards(9), 3, 10);
    expect(out.positions.length / 12).toBe(3);
    expect(out.uvs.length).toBe(24);
    expect(out.indices.length).toBe(18);
    // Trois fois moins de cartes : chacune est √3 fois plus large, centrée au même endroit.
    const width = (out.positions[3] as number) - (out.positions[0] as number);
    expect(width).toBeCloseTo(Math.sqrt(3));
    expect(((out.positions[3] as number) + (out.positions[0] as number)) / 2).toBeCloseTo(0.5);
    // La deuxième carte gardée est la quatrième de l'entrée (z = 30).
    expect(out.positions[14]).toBeCloseTo(30);
  });

  it("APP-003: borne l'agrandissement", () => {
    const out = thinCards(cards(9), 1, 1.5);
    expect((out.positions[3] as number) - (out.positions[0] as number)).toBeCloseTo(1.5);
  });

  it("APP-003: refuse des cartes qui ne sont pas des quadrilatères consécutifs", () => {
    const wrong = cards(2);
    wrong.indices[0] = 1;
    expect(() => thinCards(wrong, 2, 2)).toThrow("quadrilatères consécutifs");
    expect(() => thinCards({ ...cards(2), positions: [0, 0, 0] }, 2, 2)).toThrow("quadrilatères consécutifs");
    expect(() => thinCards({ ...cards(2), indices: [0, 1, 2] }, 2, 2)).toThrow("quadrilatères consécutifs");
  });
});
