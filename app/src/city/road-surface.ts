// Le grain des revêtements, dessiné par le shader des voies (APP-009) : joints de pavés, grain d'asphalte, mottes de terre.
// Aucune image à charger (poids nul), aucune texture propre à une ville : le motif ne dépend que de la position au sol,
// donc mêmes données, mêmes sols (APP-013), sur Quest, PC et tablette (APP-015).
import type { MeshToonMaterial } from "three";
import type { Surface } from "../../scripts/osm-tags.ts";
import { toonMaterial, type ShaderSource } from "./toon.ts";

/** Le code de chaque revêtement dans l'attribut `surfaceKind` ; -1 : bordures et marquages, sans grain. */
export const SURFACE_ID: Record<Surface, number> = { asphalt: 0, pave: 1, terre: 2 };
export const NO_GRAIN = -1;

/** Côté d'un pavé, en mètres. */
export const COBBLE_M = 0.3;

const VERTEX_DECL = "attribute float surfaceKind;\nvarying float vSurfaceKind;\nvarying vec2 vGround;\n#include <common>";
const VERTEX_SET = "#include <begin_vertex>\nvSurfaceKind = surfaceKind;\nvGround = (modelMatrix * vec4(transformed, 1.0)).xz;";
const FRAGMENT_DECL = "varying float vSurfaceKind;\nvarying vec2 vGround;\n#include <common>";

/** Le détail s'efface avec la distance (fwidth) : pas de moiré, et le profil « performance » le coupe tout à fait. */
const grain = (detail: boolean): string => `#include <color_fragment>
${detail ? `if (vSurfaceKind > -0.5) {
  float footprint = fwidth(vGround.x) + fwidth(vGround.y);
  float near = 1.0 - smoothstep(${COBBLE_M.toFixed(2)}, ${(COBBLE_M * 3).toFixed(2)}, footprint);
  if (vSurfaceKind > 0.5 && vSurfaceKind < 1.5) {
    vec2 p = vGround / ${COBBLE_M.toFixed(2)};
    p.x += floor(p.y) * 0.5;
    vec2 f = fract(p);
    float joint = max(step(f.x, 0.1), step(f.y, 0.1));
    diffuseColor.rgb *= 1.0 - 0.3 * joint * near;
  } else {
    vec2 q = floor(vGround * 6.0);
    float h = fract(sin(dot(q, vec2(12.9898, 78.233))) * 43758.5453);
    float spread = vSurfaceKind > 1.5 ? 0.22 : 0.1;
    diffuseColor.rgb *= 1.0 + spread * (h - 0.5) * near;
  }
}` : ""}`;

/** Ajoute le grain au shader d'un matériau (appelé par three.js à la compilation). */
export function addGrain(shader: ShaderSource, detail = true): void {
  shader.vertexShader = shader.vertexShader.replace("#include <common>", VERTEX_DECL).replace("#include <begin_vertex>", VERTEX_SET);
  shader.fragmentShader = shader.fragmentShader.replace("#include <common>", FRAGMENT_DECL).replace("#include <color_fragment>", grain(detail));
}

/** Le matériau des voies : toon, couleurs par sommet, grain du revêtement ; `detail` faux (profil « performance ») : aplat. */
export function roadMaterial(detail: boolean, extra: Parameters<typeof toonMaterial>[0] = {}): MeshToonMaterial {
  const material = toonMaterial({ vertexColors: true, ...extra });
  material.onBeforeCompile = (shader) => { addGrain(shader, detail); };
  return material;
}
