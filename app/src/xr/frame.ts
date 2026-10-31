// Une image de la marche : logique pure qui enchaîne joystick, vitesse, distance et sécurité.
// Le rendu three.js (experience.ts) ne fait qu'appliquer l'état calculé ici.
import { clampSpeedKmh, stepSpeedKmh } from "../route/speed.ts";
import { advanceDistanceM } from "../route/walk.ts";
import { cityOpacity } from "../safety/visibility.ts";
import { BUTTONS_RELEASED, newPresses, type ButtonsReading } from "./buttons.ts";
import { JOYSTICK_RELEASED, readSpeedSteps, type JoystickState } from "./joystick.ts";

export interface WalkState {
  speedKmh: number;
  distanceM: number;
  /** Temps de marche cumulé, celui qui a fait avancer la distance. */
  timeS: number;
  /** Horodatage de l'image précédente, `null` avant la première. */
  lastTimeMs: number | null;
  joystick: JoystickState;
  /** Opacité de la ville à appliquer (0 à 1, APP-001). */
  cityOpacity: number;
  /** Vrai à l'arrivée d'un trajet libre : la marche est arrêtée (APP-002). */
  arrived: boolean;
  /** Gâchette droite : la marche est en pause, l'avancée s'arrête et la vitesse réglée est conservée (APP-002). */
  paused: boolean;
  /** Bouton B : le panneau d'infos du casque est affiché (par défaut dès le départ). */
  showPanel: boolean;
  /** Vrai à l'image où le bouton A vient d'être appuyé : le parcours se recale sur le regard (APP-002). */
  recalibrate: boolean;
  /** Boutons tenus à l'image précédente : un appui ne compte qu'une fois. */
  buttons: ButtonsReading;
}

export interface FrameInput {
  timeMs: number;
  /** Axe Y du joystick droit. */
  axisY: number;
  /** Boutons tenus de la manette droite. */
  buttons: ButtonsReading;
  /** Inclinaison de la tête sous l'horizontale, `null` si la pose n'est pas connue. */
  pitchDownDeg: number | null;
  globalOpacityPct: number;
  /** Longueur d'un trajet libre : la marche s'y arrête. Absente pour une boucle, qui reprend au départ. */
  endM?: number | undefined;
}

export function initialWalkState(speedKmh: number, globalOpacityPct: number): WalkState {
  return {
    speedKmh: clampSpeedKmh(speedKmh),
    distanceM: 0,
    timeS: 0,
    lastTimeMs: null,
    joystick: JOYSTICK_RELEASED,
    cityOpacity: cityOpacity(0, globalOpacityPct),
    arrived: false,
    paused: false,
    showPanel: true,
    recalibrate: false,
    buttons: BUTTONS_RELEASED,
  };
}

export function nextWalkState(state: WalkState, input: FrameInput): WalkState {
  const dtS = state.lastTimeMs === null ? 0 : Math.max(0, (input.timeMs - state.lastTimeMs) / 1000);
  const { steps, state: joystick } = readSpeedSteps(input.axisY, state.joystick);
  const speedKmh = stepSpeedKmh(state.speedKmh, steps);
  const pressed = newPresses(input.buttons, state.buttons);
  const paused = pressed.trigger ? !state.paused : state.paused;
  // Arrivé ou en pause, on ne bouge plus : la distance reste celle de l'arrêt et le temps ne court plus.
  const still = state.arrived || paused;
  const moved = still ? state.distanceM : advanceDistanceM(state.distanceM, speedKmh, dtS);
  const arrived = input.endM !== undefined && moved >= input.endM;
  return {
    speedKmh,
    distanceM: arrived ? (input.endM as number) : moved,
    timeS: still ? state.timeS : state.timeS + dtS,
    arrived,
    paused,
    showPanel: pressed.b ? !state.showPanel : state.showPanel,
    recalibrate: pressed.a,
    buttons: input.buttons,
    lastTimeMs: input.timeMs,
    joystick,
    // Pose inconnue (suivi perdu) : on montre le réel, la ville disparaît (APP-001).
    cityOpacity: input.pitchDownDeg === null ? 0 : cityOpacity(input.pitchDownDeg, input.globalOpacityPct),
  };
}
