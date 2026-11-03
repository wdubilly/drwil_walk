// L'ambiance de la scène (APP-011) : la lumière de l'heure réelle, le ciel et le brouillard, les sons facultatifs.
// Au casque, le ciel reste le réel (aucun fond n'est jamais posé) et le brouillard reste sous son plafond (APP-001).
import { Color, DirectionalLight, Fog, HemisphereLight, type Scene } from "three";
import { daylightNow, type Daylight } from "../render/daylight.ts";
import { fogFor, fogSummary, type FogSettings, type FogTarget } from "../render/fog.ts";
import { soundGain, startAmbienceSound, type SoundWindow } from "./ambience-sound.ts";

export interface AmbienceOptions {
  scene: Scene;
  target: FogTarget;
  /** Le brouillard : éteint par défaut, allumé à l'accueil et permis par le profil graphique (APP-006). */
  fog: boolean;
  /** Le volume des sons d'ambiance, en pour cent : 0 (coupé) tant que l'utilisateur n'a rien réglé. */
  soundPct: number;
  /** L'horloge de l'utilisateur (injectée : les tests fixent l'heure). */
  now: () => Date;
  /** La fenêtre qui porte l'audio ; absente, aucun son n'est joué. */
  window: SoundWindow | null;
}

export interface Ambience {
  daylight: Daylight;
  fog: FogSettings | null;
  /** Ce qui est appliqué, lisible sur la page par l'e2e. */
  summary: string;
  stop(): void;
}

/** Règle les lumières déjà posées dans la scène sur la lumière du moment. */
function applyLights(scene: Scene, daylight: Daylight): void {
  scene.traverse((object) => {
    if (object instanceof HemisphereLight) {
      object.intensity = daylight.hemiIntensity;
      object.color.set(daylight.skyColor);
    }
    if (object instanceof DirectionalLight) {
      object.intensity = daylight.sunIntensity;
      object.color.set(daylight.sunColor);
      object.position.set(daylight.sun.x, daylight.sun.y, daylight.sun.z);
    }
  });
}

/** Applique l'ambiance à la scène et démarre le son choisi ; `stop` coupe le son. */
export function startAmbience(options: AmbienceOptions): Ambience {
  const daylight = daylightNow(options.now);
  applyLights(options.scene, daylight);
  const fog = options.fog ? fogFor(options.target, daylight.fogColor) : null;
  options.scene.fog = fog ? new Fog(fog.color, fog.near, fog.far) : null;
  // Au casque, aucun ciel n'est posé : le fond est le passthrough, donc le réel (APP-001).
  options.scene.background = options.target === "ecran" ? new Color(daylight.skyColor) : null;
  const sound = startAmbienceSound(options.window, options.soundPct);
  const gainPct = Math.round(soundGain(options.soundPct) * 100);
  return { daylight, fog, summary: `${fogSummary(fog)} · sons ${String(gainPct)} %`, stop: () => { sound.stop(); } };
}
