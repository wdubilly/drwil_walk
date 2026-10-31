// Les bâtiments OpenStreetMap, extrudés puis fusionnés en un seul maillage, chacun dans l'un des tons de la palette : peu d'appels de dessin,
// pour tenir 72 images par seconde sur le Quest 3.
import { BufferGeometry, Color, ExtrudeGeometry, Float32BufferAttribute, Shape, Vector2 } from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { Building } from "./souq-data.ts";

/** Le ton d'un bâtiment, déterministe : il ne dépend que de la position de son premier sommet (aucune donnée en plus). */
export function toneIndex(building: Building, toneCount: number): number {
  const p = building.footprint[0] as { x: number; z: number };
  return Math.abs(Math.floor(p.x * 7.3 + p.z * 13.1)) % toneCount;
}

/** Part de lumière au pied d'un mur : l'ombrage par sommet l'assombrit vers le sol et l'éclaircit jusqu'au toit. */
export const FOOT_LIGHT = 0.55;

/** Le toit se reconnaît à sa normale tournée vers le haut. */
const isRoof = (normalY: number): boolean => normalY > 0.5;

/** Un bâtiment debout : le contour (x, z) du repère local, tiré vers le haut sur sa hauteur. */
function extrude(building: Building, tone: Color): BufferGeometry {
  // ExtrudeGeometry pousse le contour (x, y) le long de +Z ; la rotation couche cet axe sur +Y.
  // Le contour est donc posé en (x, -z), pour que le monde garde son z vers le sud.
  const shape = new Shape(building.footprint.map((p) => new Vector2(p.x, -p.z)));
  const geometry = new ExtrudeGeometry(shape, { depth: building.heightM, bevelEnabled: false });
  geometry.rotateX(-Math.PI / 2);
  // Couleur par sommet (teinte, toit à part, ombrage vers le pied) : tous les bâtiments restent dans un seul maillage.
  const position = geometry.getAttribute("position");
  const normal = geometry.getAttribute("normal");
  const wall = building.wall === undefined ? tone : new Color(building.wall);
  const roof = building.roof === undefined ? wall : new Color(building.roof);
  const colors: number[] = [];
  for (let i = 0; i < position.count; i++) {
    const color = isRoof(normal.getY(i)) ? roof : wall;
    const light = isRoof(normal.getY(i)) ? 1 : FOOT_LIGHT + (1 - FOOT_LIGHT) * Math.min(position.getY(i) / building.heightM, 1);
    colors.push(color.r * light, color.g * light, color.b * light);
  }
  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  return geometry;
}

/** Un contour d'au moins trois sommets distincts (le dernier répète le premier) a un volume. */
const hasVolume = (building: Building): boolean => building.footprint.length >= 4 && building.heightM > 0;

export function buildBuildingsGeometry(buildings: readonly Building[], tones: readonly number[]): BufferGeometry {
  const colors = tones.map((hex) => new Color(hex));
  const solids = buildings.filter(hasVolume).map((b) => extrude(b, colors[toneIndex(b, colors.length)] as Color));
  // mergeGeometries échoue sur une liste vide : sans bâtiment, un maillage vide.
  return (solids.length > 0 ? mergeGeometries(solids) : null) ?? new BufferGeometry();
}
