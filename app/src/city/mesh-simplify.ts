// Allègement des maillages du pack d'arbres, sans bibliothèque : regroupement des sommets par cases (écorce) et
// éclaircissement des cartes de feuilles (feuillage). Utilisé par le script de préparation du pack.

export interface Colored {
  positions: number[];
  /** Trois composantes par sommet. */
  colors: number[];
  indices: number[];
}

export interface Cards {
  positions: number[];
  uvs: number[];
  indices: number[];
}

/** Regroupe les sommets d'une même case de côté `cell` (mètres) en un seul, à leur moyenne ; les triangles écrasés disparaissent. */
export function clusterMesh(mesh: Colored, cell: number): Colored {
  const ids = new Map<string, number>();
  const sums: number[][] = [];
  const cluster = (vertex: number): number => {
    const p = mesh.positions.slice(vertex * 3, vertex * 3 + 3);
    const key = p.map((v) => Math.floor(v / cell)).join(",");
    let id = ids.get(key);
    if (id === undefined) {
      id = sums.length;
      ids.set(key, id);
      sums.push([0, 0, 0, 0, 0, 0, 0]);
    }
    const sum = sums[id] as number[];
    [...p, ...mesh.colors.slice(vertex * 3, vertex * 3 + 3), 1].forEach((v, i) => (sum[i] = (sum[i] as number) + v));
    return id;
  };
  const owner = Array.from({ length: mesh.positions.length / 3 }, (_, vertex) => cluster(vertex));
  const seen = new Set<string>();
  const indices: number[] = [];
  for (let t = 0; t < mesh.indices.length; t += 3) {
    const tri = [0, 1, 2].map((k) => owner[mesh.indices[t + k] as number] as number);
    const key = [...tri].sort((a, b) => a - b).join(",");
    if (new Set(tri).size === 3 && !seen.has(key)) {
      seen.add(key);
      indices.push(...tri);
    }
  }
  const mean = (sum: number[], from: number): number[] => sum.slice(from, from + 3).map((v) => v / (sum[6] as number));
  return { positions: sums.flatMap((s) => mean(s, 0)), colors: sums.flatMap((s) => mean(s, 3)), indices };
}

/** Grossit les cases (de 5 cm, de 10 % en 10 %) jusqu'à ce que le maillage tienne en `maxTriangles` triangles. */
export function simplifyTo(mesh: Colored, maxTriangles: number): Colored {
  let cell = 0.05;
  let out = clusterMesh(mesh, cell);
  while (out.indices.length / 3 > maxTriangles) {
    cell *= 1.1;
    out = clusterMesh(mesh, cell);
  }
  return out;
}

/**
 * Garde une carte sur `stride` (au plus `maxQuads` cartes) et l'agrandit autour de son centre pour que le feuillage
 * garde son volume (au plus `maxScale` fois). Les cartes du pack sont des quadrilatères de quatre sommets consécutifs,
 * dont les deux triangles sont rangés dans un ordre quelconque : seul compte que chacun reste dans sa carte.
 */
export function thinCards(cards: Cards, maxQuads: number, maxScale: number): Cards {
  const total = cards.positions.length / 12;
  const quad = [0, 3, 2, 0, 2, 1];
  const inside = (t: number): boolean => [1, 2].every((k) => Math.floor((cards.indices[t + k] as number) / 4) === Math.floor((cards.indices[t] as number) / 4));
  const regular = Number.isInteger(total) && cards.indices.length === total * 6 && Array.from({ length: total * 2 }, (_, t) => inside(t * 3)).every(Boolean);
  if (!regular) throw new Error("feuillage : les cartes ne sont pas des quadrilatères consécutifs");
  const stride = Math.ceil(total / maxQuads);
  const scale = Math.min(maxScale, Math.sqrt(stride));
  const out: Cards = { positions: [], uvs: [], indices: [] };
  for (let q = 0, kept = 0; q < total; q += stride, kept += 1) {
    const corners = cards.positions.slice(q * 12, q * 12 + 12);
    const centre = [0, 1, 2].map((axis) => [0, 1, 2, 3].reduce((sum, k) => sum + (corners[k * 3 + axis] as number), 0) / 4);
    corners.forEach((v, i) => out.positions.push((centre[i % 3] as number) + (v - (centre[i % 3] as number)) * scale));
    out.uvs.push(...cards.uvs.slice(q * 8, q * 8 + 8));
    out.indices.push(...quad.map((e) => kept * 4 + e));
  }
  return out;
}
