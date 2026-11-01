// Les bâtiments OpenStreetMap, extrudés puis fusionnés en un seul maillage, chacun dans l'un des tons de la palette : peu d'appels de dessin,
// pour tenir 72 images par seconde sur le Quest 3.
import { BufferGeometry, Color, ExtrudeGeometry, Float32BufferAttribute, Shape, Vector2 } from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { Vec2 } from "../route/geo.ts";
import type { Path } from "../route/path.ts";
import { closest } from "./near-route.ts";
import { AWNING_COLOUR_COUNT, MAX_AWNINGS, MAX_GABLED_ROOFS, addAwning, addGabledRoof } from "./roofs.ts";
import { newSoup, soupGeometry } from "./soup.ts";
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
function extrude(building: Building, tone: Color): { geometry: BufferGeometry; wall: Color; roof: Color } {
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
  // Tous les morceaux fusionnés portent les mêmes attributs : celui-ci n'a pas de texture.
  geometry.deleteAttribute("uv");
  return { geometry, wall, roof };
}

/** Un contour d'au moins trois sommets distincts (le dernier répète le premier) a un volume. */
const hasVolume = (building: Building): boolean => building.footprint.length >= 4 && building.heightM > 0;

/**
 * Tous les bâtiments en un seul maillage : murs et toits plats extrudés, puis, pour les plus proches du parcours, les toits à
 * deux pans (`roof:shape`) et les auvents (budgets de roofs.ts).
 */
export function buildBuildingsGeometry(buildings: readonly Building[], tones: readonly number[], route: Path): BufferGeometry {
  const colors = tones.map((hex) => new Color(hex));
  const solid = buildings.filter(hasVolume);
  const gabled = new Set(closest(solid.filter((b) => b.roofShape === "gabled"), route, MAX_GABLED_ROOFS, (b) => b.footprint[0] as Vec2));
  const awned = new Set(closest(solid, route, MAX_AWNINGS, (b) => b.footprint[0] as Vec2));
  const extra = newSoup();
  const parts = solid.map((b) => {
    const { geometry, wall, roof } = extrude(b, colors[toneIndex(b, colors.length)] as Color);
    if (gabled.has(b)) addGabledRoof(extra, b, roof, wall);
    if (awned.has(b)) addAwning(extra, b, route, toneIndex(b, AWNING_COLOUR_COUNT));
    return geometry;
  });
  if (extra.positions.length > 0) parts.push(soupGeometry(extra));
  // mergeGeometries échoue sur une liste vide : sans bâtiment, un maillage vide.
  return (parts.length > 0 ? mergeGeometries(parts) : null) ?? new BufferGeometry();
}
