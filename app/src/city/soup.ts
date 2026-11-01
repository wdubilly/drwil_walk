// Un tas de triangles colorés (position, normale, couleur par sommet) que les toits, auvents, surfaces vertes et haies
// remplissent puis fusionnent en un seul maillage (peu d'appels de dessin, 72 images par seconde).
import { BufferGeometry, Color, Float32BufferAttribute, Vector3 } from "three";

export type V3 = readonly [number, number, number];

export interface Soup {
  positions: number[];
  normals: number[];
  colors: number[];
}

export const newSoup = (): Soup => ({ positions: [], normals: [], colors: [] });

/** Un triangle, tourné pour que sa face avant regarde du côté de `facing` (les matériaux ne dessinent que la face avant). */
export function addTriangle(soup: Soup, a: V3, b: V3, c: V3, color: Color, facing: V3): void {
  const [pa, pb, pc] = [new Vector3(...a), new Vector3(...b), new Vector3(...c)];
  const normal = pb.clone().sub(pa).cross(pc.clone().sub(pa)).normalize();
  const flip = normal.dot(new Vector3(...facing)) < 0;
  if (flip) normal.negate();
  for (const p of flip ? [pa, pc, pb] : [pa, pb, pc]) {
    soup.positions.push(p.x, p.y, p.z);
    soup.normals.push(normal.x, normal.y, normal.z);
    soup.colors.push(color.r, color.g, color.b);
  }
}

/** Un quadrilatère plan a-b-c-d (dans l'ordre du contour), en deux triangles. */
export function addQuad(soup: Soup, a: V3, b: V3, c: V3, d: V3, color: Color, facing: V3): void {
  addTriangle(soup, a, b, c, color, facing);
  addTriangle(soup, a, c, d, color, facing);
}

export function soupGeometry(soup: Soup): BufferGeometry {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(soup.positions, 3));
  geometry.setAttribute("normal", new Float32BufferAttribute(soup.normals, 3));
  geometry.setAttribute("color", new Float32BufferAttribute(soup.colors, 3));
  return geometry;
}
