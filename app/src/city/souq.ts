// La scène du souk : sol, bâtiments OpenStreetMap, mention d'attribution. L'utilisateur reste sur son tapis, à
// l'origine : c'est la ville qui glisse et pivote pour amener le point courant du parcours sous ses pieds.
import {
  Color,
  Group,
  HemisphereLight,
  Mesh,
  MeshLambertMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  type Material,
} from "three";
import { headingAt, pointAt, type Path } from "../route/path.ts";
import { createAttributionLabel } from "./attribution.ts";
import { buildBuildingsGeometry } from "./buildings.ts";
import type { Souq } from "./souq-data.ts";

const GROUND_SIZE_M = 3000;

function material(hex: number): MeshLambertMaterial {
  return new MeshLambertMaterial({ color: new Color(hex) });
}

export interface SouqScene {
  scene: Scene;
  camera: PerspectiveCamera;
  /** Tout ce qui s'efface avec la ville (APP-001) : la ville et la mention. */
  world: Group;
  /** La ville, qui bouge le long du parcours. */
  city: Group;
  buildingCount: number;
}

/** La scène : pas de fond (le passthrough le remplace), une lumière douce, le souk. */
export function createSouqScene(doc: Document, souq: Souq): SouqScene {
  const city = new Group();
  city.name = "ville";
  const ground = new Mesh(new PlaneGeometry(GROUND_SIZE_M, GROUND_SIZE_M), material(0xb59b73));
  ground.rotation.x = -Math.PI / 2;
  const buildings = new Mesh(buildBuildingsGeometry(souq.buildings), material(0xe3cfa5));
  buildings.name = "batiments";
  city.add(ground, buildings);
  const world = new Group();
  world.add(city, createAttributionLabel(doc));
  const scene = new Scene();
  scene.background = null;
  scene.add(new HemisphereLight(0xffffff, 0x444444, 2));
  scene.add(world);
  return { scene, camera: new PerspectiveCamera(70, 1, 0.1, 1000), world, city, buildingCount: souq.buildings.length };
}

/** Applique l'opacité calculée par le module safety (APP-001) à tous les matériaux de la scène. */
export function setCityOpacity(world: Group, opacity: number): void {
  // Ville invisible : rien n'est rendu, le passthrough montre le réel sans aucun voile.
  world.visible = opacity > 0;
  world.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    const mat = object.material as Material;
    mat.transparent = opacity < 1;
    mat.opacity = opacity;
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
