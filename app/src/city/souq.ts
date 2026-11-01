// La scène du souk : sol, voies et bâtiments OpenStreetMap, mention d'attribution. L'utilisateur reste sur son tapis, à
// l'origine : c'est la ville qui glisse et pivote pour amener le point courant du parcours sous ses pieds.
import {
  Color,
  DirectionalLight,
  DoubleSide,
  Group,
  HemisphereLight,
  Line,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  PerspectiveCamera,
  Plane,
  PlaneGeometry,
  Scene,
  type Material,
} from "three";
import { headingAt, pointAt, type Path } from "../route/path.ts";
import { createAttributionLabel, type AttributionLabel } from "./attribution.ts";
import { buildBuildingsGeometry } from "./buildings.ts";
import { buildFurniture, buildTrees } from "./props.ts";
import { buildOutlinesGeometry } from "./outlines.ts";
import { buildRoadsGeometry } from "./roads.ts";
import type { Souq } from "./souq-data.ts";
import { buildingMaterial, toonMaterial } from "./toon.ts";
import type { TreePack } from "./tree-pack.ts";

const GROUND_SIZE_M = 3000;

/** Le trait des contours : un bleu nuit presque noir, lisible sur toutes les teintes de bâtiments. */
const OUTLINE_COLOR = 0x1b1b2f;

export interface SceneOptions {
  /** Les contours des bâtiments proches du parcours : désactivés par défaut (QUA-020). */
  outlines?: boolean;
  /** Les arbres du pack Quaternius, chargés d'avance : absents, la ville garde l'arbre procédural (APP-003). */
  trees?: TreePack;
}

export interface SouqScene {
  scene: Scene;
  camera: PerspectiveCamera;
  /** Tout ce qui s'efface avec la ville (APP-001) : la ville et la mention. */
  world: Group;
  /** La ville, qui bouge le long du parcours. */
  city: Group;
  /** Le sol, les voies et les bâtiments OpenStreetMap : masqués quand les tuiles Google les remplacent. */
  osm: Group;
  label: AttributionLabel;
  buildingCount: number;
}

/** La scène : pas de fond (le passthrough le remplace), une lumière douce, le souk. */
export function createSouqScene(doc: Document, souq: Souq, options: SceneOptions = {}): SouqScene {
  const city = new Group();
  city.name = "ville";
  const ground = new Mesh(new PlaneGeometry(GROUND_SIZE_M, GROUND_SIZE_M), toonMaterial({ color: new Color(souq.palette.ground) }));
  ground.rotation.x = -Math.PI / 2;
  const roads = new Mesh(buildRoadsGeometry(souq.roads, souq.palette.road), toonMaterial({ vertexColors: true, side: DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
  roads.name = "voies";
  // Couleurs par sommet : la teinte de chaque bâtiment vient de la géométrie, le matériau reste blanc.
  const buildings = new Mesh(buildBuildingsGeometry(souq.buildings, souq.palette.buildings), buildingMaterial());
  buildings.name = "batiments";
  const osm = new Group();
  osm.name = "osm";
  osm.add(ground, roads, buildings, buildTrees(souq.props, souq.route, options.trees), buildFurniture(souq.props, souq.route));
  if (options.outlines === true) {
    const outlines = new LineSegments(buildOutlinesGeometry(souq.buildings, souq.route), new LineBasicMaterial({ color: OUTLINE_COLOR }));
    outlines.name = "contours";
    osm.add(outlines);
  }
  city.add(osm);
  const label = createAttributionLabel(doc);
  const world = new Group();
  world.add(city, label.mesh);
  const scene = new Scene();
  scene.background = null;
  scene.add(new HemisphereLight(0xffffff, 0x444444, 1.2));
  // Sans lumière directionnelle, un matériau toon n'a pas de paliers : le soleil est fixe pour l'utilisateur.
  const sun = new DirectionalLight(0xffffff, 1.6);
  sun.position.set(0.4, 1, 0.3);
  scene.add(sun);
  scene.add(world);
  return { scene, camera: new PerspectiveCamera(70, 1, 0.1, 1000), world, city, osm, label, buildingCount: souq.buildings.length };
}

/**
 * Applique l'opacité calculée par le module safety (APP-001) à tous les matériaux de la scène, et la découpe de la
 * zone tapis à ceux de la ville (pas aux mentions : leur lisibilité est exigée par APP-003).
 */
export function setCityOpacity(world: Group, opacity: number, zonePlanes: Plane[]): void {
  // Ville invisible : rien n'est rendu, le passthrough montre le réel sans aucun voile.
  world.visible = opacity > 0;
  world.traverse((object) => {
    if (!(object instanceof Mesh) && !(object instanceof Line)) return;
    const mat = object.material as Material;
    mat.transparent = opacity < 1;
    mat.opacity = opacity;
    if (object.userData["zoneExempt"] === true) return;
    mat.clippingPlanes = zonePlanes;
    mat.clipIntersection = true;
  });
}

/** Amène le point du parcours atteint à `distanceM` sous les pieds de l'utilisateur, le nez dans le sens de la marche. */
export function placeOnRoute(city: Group, route: Path, distanceM: number): void {
  const at = pointAt(route, distanceM);
  const heading = headingAt(route, distanceM);
  // Rotation autour de Y qui envoie la direction de marche sur -Z (devant l'utilisateur).
  const angle = Math.atan2(heading.x, -heading.z);
  city.rotation.y = angle;
  city.position.set(-(at.x * Math.cos(angle) + at.z * Math.sin(angle)), 0, -(-at.x * Math.sin(angle) + at.z * Math.cos(angle)));
}
