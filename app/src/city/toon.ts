// Le rendu cartoon (APP-003) : un matériau toon à paliers de couleur et un motif de fenêtres dessiné par le shader,
// sans texture photo, sans modèle 3D et sans maillage en plus.
import { DataTexture, MeshToonMaterial, NearestFilter, RedFormat, type MeshToonMaterialParameters } from "three";

/** Les paliers de lumière, du plus sombre au plus clair : l'ombre d'un mur ne glisse pas, elle passe d'un palier à l'autre. */
export const TOON_STEPS: readonly number[] = [0.5, 0.7, 0.88, 1];

let gradient: DataTexture | undefined;

/** La rampe partagée par tous les matériaux toon : un seul objet pour toute la ville. */
export function toonGradient(): DataTexture {
  if (gradient === undefined) {
    gradient = new DataTexture(Uint8Array.from(TOON_STEPS, (step) => Math.round(step * 255)), TOON_STEPS.length, 1, RedFormat);
    gradient.minFilter = NearestFilter;
    gradient.magFilter = NearestFilter;
    gradient.needsUpdate = true;
  }
  return gradient;
}

export const toonMaterial = (parameters: MeshToonMaterialParameters): MeshToonMaterial =>
  new MeshToonMaterial({ ...parameters, gradientMap: toonGradient() });

/** Côté d'une case de façade, en mètres : une fenêtre par case. */
export const WINDOW_CELL_M = 3;
/** Part de teinte gardée dans une fenêtre : plus sombre que le mur, la couleur d'OpenStreetMap reste lisible. */
export const WINDOW_SHADE = 0.55;

/** Le shader de sommets passe la position et la normale locales : le motif suit le bâtiment, pas l'écran. */
const VERTEX_DECL = "varying vec3 vLocalPos;\nvarying vec3 vLocalNormal;\n#include <common>";
const VERTEX_SET = "#include <begin_vertex>\nvLocalPos = transformed;\nvLocalNormal = objectNormal;";
const FRAGMENT_DECL = "varying vec3 vLocalPos;\nvarying vec3 vLocalNormal;\n#include <common>";
/** Sur un mur seulement (normale presque horizontale), au-dessus du rez-de-chaussée : une fenêtre au centre de chaque case. */
const FRAGMENT_WINDOWS = `#include <color_fragment>
if (abs(vLocalNormal.y) < 0.5 && vLocalPos.y > ${WINDOW_CELL_M.toFixed(1)}) {
  float along = dot(vLocalPos.xz, vec2(-vLocalNormal.z, vLocalNormal.x)) / ${WINDOW_CELL_M.toFixed(1)};
  vec2 cell = vec2(fract(along), fract(vLocalPos.y / ${WINDOW_CELL_M.toFixed(1)}));
  if (cell.x > 0.25 && cell.x < 0.75 && cell.y > 0.3 && cell.y < 0.75) diffuseColor.rgb *= ${WINDOW_SHADE.toFixed(2)};
}`;

export interface ShaderSource {
  vertexShader: string;
  fragmentShader: string;
}

/** Ajoute le motif de fenêtres au shader d'un matériau (appelé par three.js à la compilation). */
export function addWindows(shader: ShaderSource): void {
  shader.vertexShader = shader.vertexShader.replace("#include <common>", VERTEX_DECL).replace("#include <begin_vertex>", VERTEX_SET);
  shader.fragmentShader = shader.fragmentShader
    .replace("#include <common>", FRAGMENT_DECL)
    .replace("#include <color_fragment>", FRAGMENT_WINDOWS);
}

/** Le matériau des façades : toon, couleurs par sommet, fenêtres ; les faces reculent un peu pour laisser les contours visibles. */
export function buildingMaterial(): MeshToonMaterial {
  const material = toonMaterial({ vertexColors: true, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
  material.onBeforeCompile = addWindows;
  return material;
}
