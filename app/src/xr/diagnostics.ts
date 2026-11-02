// Diagnostic de rendu (masqué par défaut) : images par seconde sur une fenêtre glissante, temps d'image, et ce que three.js
// dit du dernier rendu (`renderer.info`). Une valeur illisible est `null`, dite « indisponible » : jamais inventée (QUA-002).
// Masqué, seul le compteur d'images tourne : aucune lecture de `renderer.info`, aucun parcours de la scène.
import type { Object3D } from "three";

/** Nombre d'images de la fenêtre glissante : environ une seconde à 60-72 images par seconde. */
export const WINDOW_FRAMES = 60;
export const UNAVAILABLE = "indisponible";

/** Ce que l'on lit du rendu : tout est facultatif, une doublure ou un navigateur peut ne pas le fournir. */
export interface InfoSource {
  info?: {
    render?: { calls?: unknown; triangles?: unknown } | undefined;
    memory?: { geometries?: unknown; textures?: unknown } | undefined;
  } | undefined;
}

export interface Measures {
  fps: number | null;
  frameMeanMs: number | null;
  frameWorstMs: number | null;
  calls: number | null;
  triangles: number | null;
  objects: number;
  geometries: number | null;
  textures: number | null;
  /** Nombre d'images de la fenêtre qui a donné les temps d'image. */
  windowFrames: number;
}

export interface Diagnostics {
  /** À appeler à chaque image : seul coût du diagnostic masqué. */
  tick(timeMs: number): void;
  toggle(): void;
  visible(): boolean;
  /** Les mesures si le diagnostic est affiché, sinon rien (et rien n'est lu). */
  measure(renderer: InfoSource, scene: Object3D): Measures | undefined;
  /** Les mesures, affiché ou non : pour consigner à la demande. */
  sample(renderer: InfoSource, scene: Object3D): Measures;
}

const readable = (value: unknown): number | null => (typeof value === "number" && Number.isFinite(value) ? value : null);

function countVisible(scene: Object3D): number {
  let count = 0;
  scene.traverseVisible(() => {
    count += 1;
  });
  return count;
}

export function createDiagnostics(windowFrames = WINDOW_FRAMES): Diagnostics {
  let shown = false;
  let lastMs: number | null = null;
  const deltas: number[] = [];
  const sample = (renderer: InfoSource, scene: Object3D): Measures => {
    const mean = deltas.length === 0 ? null : deltas.reduce((sum, d) => sum + d, 0) / deltas.length;
    const info = renderer.info;
    return {
      fps: mean === null ? null : 1000 / mean,
      frameMeanMs: mean,
      frameWorstMs: deltas.length === 0 ? null : Math.max(...deltas),
      calls: readable(info?.render?.calls),
      triangles: readable(info?.render?.triangles),
      objects: countVisible(scene),
      geometries: readable(info?.memory?.geometries),
      textures: readable(info?.memory?.textures),
      windowFrames: deltas.length,
    };
  };
  return {
    tick(timeMs) {
      // Une image au même instant ne compte pas : elle donnerait un temps nul et des images par seconde infinies.
      if (lastMs !== null && timeMs > lastMs) {
        deltas.push(timeMs - lastMs);
        if (deltas.length > windowFrames) deltas.shift();
      }
      lastMs = timeMs;
    },
    toggle() {
      shown = !shown;
    },
    visible: () => shown,
    measure: (renderer, scene) => (shown ? sample(renderer, scene) : undefined),
    sample,
  };
}

const text = (value: number | null, unit: string, digits = 0): string =>
  value === null ? UNAVAILABLE : `${value.toFixed(digits).replace(".", ",")}${unit}`;

/** Les lignes du diagnostic, dans l'ordre d'affichage : champ, libellé, valeur dite. */
export function diagnosticRows(m: Measures): { field: string; label: string; value: string }[] {
  return [
    { field: "fps", label: "Images par seconde", value: text(m.fps, " i/s", 1) },
    { field: "frame-mean", label: "Temps d'image moyen", value: text(m.frameMeanMs, " ms", 1) },
    { field: "frame-worst", label: "Temps d'image au pire", value: text(m.frameWorstMs, " ms", 1) },
    { field: "calls", label: "Appels de rendu", value: text(m.calls, "") },
    { field: "triangles", label: "Triangles", value: text(m.triangles, "") },
    { field: "objects", label: "Objets visibles", value: text(m.objects, "") },
    { field: "geometries", label: "Géométries en mémoire", value: text(m.geometries, "") },
    { field: "textures", label: "Textures en mémoire", value: text(m.textures, "") },
  ];
}

/** Une ligne courte pour le panneau du casque. */
export function diagnosticLine(m: Measures): string {
  return `${text(m.fps, " i/s", 0)} · ${text(m.frameMeanMs, " ms", 1)} · ${text(m.calls, " appels")} · ${text(m.triangles, " tri")}`;
}
