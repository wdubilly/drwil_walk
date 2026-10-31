// Les bâtiments OpenStreetMap, extrudés puis fusionnés en un seul maillage : peu d'appels de dessin,
// pour tenir 72 images par seconde sur le Quest 3.
import { BufferGeometry, ExtrudeGeometry, Shape, Vector2 } from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { Building } from "./souq-data.ts";

/** Un bâtiment debout : le contour (x, z) du repère local, tiré vers le haut sur sa hauteur. */
function extrude(building: Building): BufferGeometry {
  // ExtrudeGeometry pousse le contour (x, y) le long de +Z ; la rotation couche cet axe sur +Y.
  // Le contour est donc posé en (x, -z), pour que le monde garde son z vers le sud.
  const shape = new Shape(building.footprint.map((p) => new Vector2(p.x, -p.z)));
  const geometry = new ExtrudeGeometry(shape, { depth: building.heightM, bevelEnabled: false });
  geometry.rotateX(-Math.PI / 2);
  return geometry;
}

/** Un contour d'au moins trois sommets distincts (le dernier répète le premier) a un volume. */
const hasVolume = (building: Building): boolean => building.footprint.length >= 4 && building.heightM > 0;

export function buildBuildingsGeometry(buildings: readonly Building[]): BufferGeometry {
  const solids = buildings.filter(hasVolume).map(extrude);
  // mergeGeometries échoue sur une liste vide : sans bâtiment, un maillage vide.
  return (solids.length > 0 ? mergeGeometries(solids) : null) ?? new BufferGeometry();
}
