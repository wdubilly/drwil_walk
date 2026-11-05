// Les lanternes allumées la nuit (APP-011) : une lanterne lumineuse et un halo au sol par lampadaire dessiné, du relevé comme
// produit par règle, en deux maillages instanciés et sans aucune source de lumière (le Quest 3 n'en tiendrait pas des centaines).
// Le groupe arrive éteint : l'ambiance l'allume quand le soleil est sous l'horizon.
import {
  AddEquation,
  BoxGeometry,
  CircleGeometry,
  CustomBlending,
  Float32BufferAttribute,
  Group,
  InstancedMesh,
  Matrix4,
  MeshBasicMaterial,
  OneFactor,
  SrcAlphaFactor,
  ZeroFactor,
} from "three";
import { LANTERN_AT_M, LANTERN_SIZE_M } from "./furniture.ts";
import type { PlacedLamp } from "./props.ts";

export const STREET_LIGHTS_NAME = "lanternes";
/** Rayon du halo au sol, en mètres : la flaque de lumière sous un mât de 4,5 m. */
export const HALO_RADIUS_M = 3.5;
/** Le halo flotte au-dessus des voies pour ne pas scintiller avec elles. */
const HALO_LIFT_M = 0.05;
const HALO_SEGMENTS = 20;
/** La lanterne allumée enveloppe celle du mât, un peu plus grande, pour la couvrir sans scintiller. */
const GLOW_SCALE = 1.06;
const LANTERN_GLOW = 0xffd27a;
/** Le cœur du halo : une teinte chaude sombre, ajoutée à la couleur du sol (elle éclaircit, n'opacifie rien). */
export const HALO_CORE = 0x6a4c1c;

/** La matrice d'un lampadaire : tourné comme son mât, posé à sa place (la même que celle du mobilier, `furnitureParts`). */
export const lampMatrix = (lamp: PlacedLamp): Matrix4 => new Matrix4().makeRotationY(lamp.yaw).setPosition(lamp.at.x, 0, lamp.at.z);

/** Le halo : un disque au sol sous la lanterne, clair au centre et nul au bord. */
export function haloGeometry(): CircleGeometry {
  const disc = new CircleGeometry(HALO_RADIUS_M, HALO_SEGMENTS);
  disc.rotateX(-Math.PI / 2).translate(0, HALO_LIFT_M, LANTERN_AT_M.z);
  const core = [((HALO_CORE >> 16) & 0xff) / 255, ((HALO_CORE >> 8) & 0xff) / 255, (HALO_CORE & 0xff) / 255];
  // Le premier sommet d'un disque est son centre : lui seul porte la lueur, qui s'éteint en dégradé vers le bord.
  const colors = Array.from({ length: disc.getAttribute("position").count }, (_, i) => (i === 0 ? core : [0, 0, 0])).flat();
  disc.setAttribute("color", new Float32BufferAttribute(colors, 3));
  return disc;
}

/**
 * La lueur s'ajoute à la couleur déjà dessinée sans jamais toucher à l'alpha de l'image : au casque, l'alpha règle ce qu'on voit
 * du passthrough, et le halo ne peut donc rien masquer du réel, même quand la ville s'efface (APP-001).
 */
export function glowMaterial(): MeshBasicMaterial {
  return new MeshBasicMaterial({
    vertexColors: true,
    depthWrite: false,
    blending: CustomBlending,
    blendEquation: AddEquation,
    blendSrc: SrcAlphaFactor,
    blendDst: OneFactor,
    blendSrcAlpha: ZeroFactor,
    blendDstAlpha: OneFactor,
  });
}

/** Les lanternes et leurs halos, un maillage instancié chacun ; le groupe est éteint tant que l'ambiance ne l'allume pas. */
export function buildStreetLights(lamps: readonly PlacedLamp[]): Group {
  const lantern = new BoxGeometry(LANTERN_SIZE_M.x * GLOW_SCALE, LANTERN_SIZE_M.y * GLOW_SCALE, LANTERN_SIZE_M.z * GLOW_SCALE);
  lantern.translate(0, LANTERN_AT_M.y, LANTERN_AT_M.z);
  const lanterns = new InstancedMesh(lantern, new MeshBasicMaterial({ color: LANTERN_GLOW }), lamps.length);
  lanterns.name = "lanternes-allumees";
  const halos = new InstancedMesh(haloGeometry(), glowMaterial(), lamps.length);
  halos.name = "halos";
  // Le halo se dessine après le sol et les voies, qu'il éclaircit : sinon le sol, opaque, le recouvrirait.
  halos.renderOrder = 1;
  for (const [i, lamp] of lamps.entries()) {
    lanterns.setMatrixAt(i, lampMatrix(lamp));
    halos.setMatrixAt(i, lampMatrix(lamp));
  }
  const group = new Group();
  group.name = STREET_LIGHTS_NAME;
  group.visible = false;
  group.userData["count"] = lamps.length;
  group.add(lanterns, halos);
  return group;
}
