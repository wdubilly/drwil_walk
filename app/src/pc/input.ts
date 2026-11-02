// Les commandes de la version PC : clavier (APP-002) et regard à la souris. Les pressions s'accumulent entre deux images,
// puis `take()` les rend une seule fois : une pression ne déclenche qu'une action.
import { BUTTONS_RELEASED, type ButtonsReading } from "../xr/buttons.ts";
import { actionOf, type PcAction } from "./keys.ts";
import { NO_LOOK, turn, type Look } from "./look.ts";

export interface PcFrameInput {
  /** Crans de vitesse demandés depuis l'image précédente (+ plus vite, − moins vite). */
  steps: number;
  /** Les boutons « appuyés à cette image », au même format que la manette du casque. */
  buttons: ButtonsReading;
  quit: boolean;
}

export interface PcInput {
  take(): PcFrameInput;
  look(): Look;
  dispose(): void;
}

export function createPcInput(doc: Document, canvas: HTMLElement): PcInput {
  let look = NO_LOOK;
  let dragging = false;
  let pending: PcAction[] = [];
  const onKey = (event: KeyboardEvent): void => {
    const action = actionOf(event);
    if (!action) return;
    // Espace et flèches ne font pas défiler la page.
    event.preventDefault();
    pending.push(action);
  };
  // La souris ne tourne le regard que bouton enfoncé sur l'image : le curseur reste libre le reste du temps.
  const onDown = (): void => {
    dragging = true;
  };
  const onUp = (): void => {
    dragging = false;
  };
  const onMove = (event: MouseEvent): void => {
    if (dragging) look = turn(look, event.movementX, event.movementY);
  };
  doc.addEventListener("keydown", onKey);
  canvas.addEventListener("mousedown", onDown);
  doc.addEventListener("mouseup", onUp);
  doc.addEventListener("mousemove", onMove);
  return {
    look: () => look,
    take() {
      const taken = pending;
      pending = [];
      // Chaque pression de vitesse compte, même plusieurs entre deux images ; un cran vaut 0,1 km/h.
      const count = (action: PcAction): number => taken.filter((a) => a === action).length;
      const steps = count("faster") - count("slower") + 10 * (count("muchFaster") - count("muchSlower"));
      const buttons = { ...BUTTONS_RELEASED, trigger: taken.includes("pause"), a: taken.includes("recalibrate"), b: taken.includes("panel") };
      return { steps, buttons, quit: taken.includes("quit") };
    },
    dispose() {
      doc.removeEventListener("keydown", onKey);
      canvas.removeEventListener("mousedown", onDown);
      doc.removeEventListener("mouseup", onUp);
      doc.removeEventListener("mousemove", onMove);
    },
  };
}
