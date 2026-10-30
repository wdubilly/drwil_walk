// Rue simple (sol et blocs) en attendant la vraie ville (3D Tiles, repli OSM) : elle sert de
// décor au déplacement et au fondu de sécurité. La rue part devant l'utilisateur, vers -Z.
import {
  BoxGeometry,
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
import { STREET_LENGTH_M } from "../route/walk.ts";

const STREET_WIDTH_M = 8;
const BLOCK_SPACING_M = 12;
const BLOCK_DEPTH_M = 8;

/** Une rue un peu plus longue que la boucle, pour qu'elle ne s'arrête jamais sous les yeux. */
const DRAWN_LENGTH_M = STREET_LENGTH_M * 2;

function material(hex: number): MeshLambertMaterial {
  return new MeshLambertMaterial({ color: new Color(hex) });
}

/** La rue : un sol et deux rangées de blocs, regroupés pour bouger et s'effacer ensemble. */
export function createStreet(): Group {
  const city = new Group();
  city.name = "ville";
  const ground = new Mesh(new PlaneGeometry(STREET_WIDTH_M * 3, DRAWN_LENGTH_M), material(0x6b6b6b));
  ground.rotation.x = -Math.PI / 2;
  ground.position.z = -DRAWN_LENGTH_M / 2;
  city.add(ground);
  for (let i = 0; i * BLOCK_SPACING_M < DRAWN_LENGTH_M; i++) {
    // Hauteurs variées, de 6 à 18 m, pour que le défilement se perçoive.
    const height = 6 + ((i * 7) % 13);
    for (const side of [-1, 1]) {
      const block = new Mesh(new BoxGeometry(BLOCK_DEPTH_M, height, BLOCK_SPACING_M - 2), material(0xc8b08a));
      block.position.set(side * (STREET_WIDTH_M / 2 + BLOCK_DEPTH_M / 2), height / 2, -i * BLOCK_SPACING_M);
      city.add(block);
    }
  }
  return city;
}

/** Applique l'opacité calculée par le module safety (APP-001) à tous les matériaux de la ville. */
export function setCityOpacity(city: Group, opacity: number): void {
  // Ville invisible : rien n'est rendu, le passthrough montre le réel sans aucun voile.
  city.visible = opacity > 0;
  city.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    const mat = object.material as Material;
    mat.transparent = opacity < 1;
    mat.opacity = opacity;
  });
}

/** Avance la rue vers l'utilisateur, immobile sur son tapis. */
export function placeStreet(city: Group, offsetM: number): void {
  city.position.z = offsetM;
}

export interface StreetScene {
  scene: Scene;
  camera: PerspectiveCamera;
  city: Group;
}

/** La scène : pas de fond (le passthrough le remplace), une lumière douce, la rue. */
export function createStreetScene(): StreetScene {
  const scene = new Scene();
  scene.background = null;
  scene.add(new HemisphereLight(0xffffff, 0x444444, 2));
  const city = createStreet();
  scene.add(city);
  return { scene, camera: new PerspectiveCamera(70, 1, 0.1, 1000), city };
}
