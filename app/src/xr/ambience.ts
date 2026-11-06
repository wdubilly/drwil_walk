// L'ambiance de la scène (APP-011) : la lumière de l'heure réelle, le ciel et le brouillard, les sons facultatifs.
// Au casque, le ciel reste le réel (aucun fond n'est jamais posé) et le brouillard reste sous son plafond (APP-001).
import { Color, DirectionalLight, Fog, HemisphereLight, type Scene } from "three";
import { STREET_LIGHTS_NAME } from "../city/street-lights.ts";
import { daylightNow, type Daylight } from "../render/daylight.ts";
import { fogFor, fogSummary, type FogSettings, type FogTarget } from "../render/fog.ts";
import { soundGain, startAmbienceSound, type SoundWindow } from "./ambience-sound.ts";

export interface AmbienceOptions {
  scene: Scene;
  target: FogTarget;
  /** Brouillard activable en marche, permis par le profil (APP-006). */
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
  /** Lanternes : nuit/jour ; la préférence Lampadaires peut les masquer (APP-011). */
  lanterns: "allumées" | "éteintes" | "absentes";
  /** Ce qui est appliqué, lisible sur la page par l'e2e. */
  summary: string;
  stop(): void;
  update(fog: boolean, soundPct: number): void;
}

/** Règle les lumières déjà posées dans la scène sur la lumière du moment, et allume les lanternes la nuit. */
function applyLights(scene: Scene, daylight: Daylight): Ambience["lanterns"] {
  let lanterns: Ambience["lanterns"] = "absentes";
  scene.traverse((object) => {
    if (object.name === STREET_LIGHTS_NAME) {
      object.visible = daylight.night;
      lanterns = daylight.night ? "allumées" : "éteintes";
    }
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
  return lanterns;
}

/** Applique l'ambiance à la scène et démarre le son choisi ; `stop` coupe le son. */
export function startAmbience(options: AmbienceOptions): Ambience {
  const daylight = daylightNow(options.now);
  const lanterns = applyLights(options.scene, daylight);
  // Au casque, aucun ciel n'est posé : le fond est le passthrough, donc le réel (APP-001).
  options.scene.background = options.target === "ecran" ? new Color(daylight.skyColor) : null;
  let sound = startAmbienceSound(options.window, options.soundPct);
  let volume = options.soundPct;
  const ambience: Ambience = {
    daylight, fog: null, lanterns, summary: "",
    stop: () => { sound.stop(); },
    update: (enabled, soundPct) => {
      ambience.fog = enabled ? fogFor(options.target, daylight.fogColor) : null;
      options.scene.fog = ambience.fog ? new Fog(ambience.fog.color, ambience.fog.near, ambience.fog.far) : null;
      if (volume !== soundPct) {
        sound.stop();
        sound = startAmbienceSound(options.window, soundPct);
        volume = soundPct;
      }
      ambience.summary = `${fogSummary(ambience.fog)} · sons ${String(Math.round(soundGain(soundPct) * 100))} %`;
    },
  };
  ambience.update(options.fog, options.soundPct);
  return ambience;
}
