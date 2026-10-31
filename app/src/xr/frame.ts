// Une image de la marche : logique pure qui enchaîne joystick, vitesse, distance et sécurité.
// Le rendu three.js (experience.ts) ne fait qu'appliquer l'état calculé ici.
import { clampSpeedKmh, stepSpeedKmh } from "../route/speed.ts";
import { advanceDistanceM } from "../route/walk.ts";
import { cityOpacity } from "../safety/visibility.ts";
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
}

export interface FrameInput {
  timeMs: number;
  /** Axe Y du joystick droit. */
  axisY: number;
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
  };
}

export function nextWalkState(state: WalkState, input: FrameInput): WalkState {
  const dtS = state.lastTimeMs === null ? 0 : Math.max(0, (input.timeMs - state.lastTimeMs) / 1000);
  const { steps, state: joystick } = readSpeedSteps(input.axisY, state.joystick);
  const speedKmh = stepSpeedKmh(state.speedKmh, steps);
  // Arrivé, on ne bouge plus : la distance reste celle de l'arrivée et le temps ne court plus.
  const moved = state.arrived ? state.distanceM : advanceDistanceM(state.distanceM, speedKmh, dtS);
  const arrived = input.endM !== undefined && moved >= input.endM;
  return {
    speedKmh,
    distanceM: arrived ? (input.endM as number) : moved,
    timeS: state.arrived ? state.timeS : state.timeS + dtS,
    arrived,
    lastTimeMs: input.timeMs,
    joystick,
    // Pose inconnue (suivi perdu) : on montre le réel, la ville disparaît (APP-001).
    cityOpacity: input.pitchDownDeg === null ? 0 : cityOpacity(input.pitchDownDeg, input.globalOpacityPct),
  };
}
