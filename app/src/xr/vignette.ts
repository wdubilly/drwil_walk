// Vignette réelle (APP-001) : la périphérie du champ de vision reste en passthrough. Un seul quadrilatère plein écran,
// dessiné en dernier dans le rendu normal (aucune passe en plus) : il ne fait que retirer de l'opacité aux bords.
// Fondu multiplicatif (couleur et alpha × (1 - a)) : correct pour le compositeur WebXR, qui attend de l'alpha prémultiplié.
import { CustomBlending, Mesh, OneMinusSrcAlphaFactor, PlaneGeometry, ShaderMaterial, ZeroFactor } from "three";

/** Rayon (0 centre, 1 milieu d'un bord de l'image d'un œil) où le fondu commence, et où il est complet. */
export const VIGNETTE_INNER = 0.6;
export const VIGNETTE_OUTER = 1.25;

/** Part de réel (0 à 1) à la distance `r` du centre de l'image : la formule du shader, testable. */
export function vignetteAmount(r: number): number {
  const t = Math.min(1, Math.max(0, (r - VIGNETTE_INNER) / (VIGNETTE_OUTER - VIGNETTE_INNER)));
  return t * t * (3 - 2 * t);
}

const VERTEX = "varying vec2 vNdc; void main() { vNdc = position.xy; gl_Position = vec4(position.xy, 0.0, 1.0); }";
const FRAGMENT = `varying vec2 vNdc; void main() { gl_FragColor = vec4(0.0, 0.0, 0.0, smoothstep(${VIGNETTE_INNER.toFixed(2)}, ${VIGNETTE_OUTER.toFixed(2)}, length(vNdc))); }`;

export function createVignette(): Mesh {
  const material = new ShaderMaterial({
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: CustomBlending,
    blendSrc: ZeroFactor,
    blendDst: OneMinusSrcAlphaFactor,
  });
  const mesh = new Mesh(new PlaneGeometry(2, 2), material);
  mesh.name = "vignette";
  mesh.renderOrder = 1000;
  // Elle couvre l'image de chaque œil quelle que soit la pose : jamais écartée par le culling.
  mesh.frustumCulled = false;
  return mesh;
}
