// Les commandes de la version PC : clavier (APP-002) et regard à la souris. Les pressions s'accumulent entre deux images,
// puis `take()` les rend une seule fois : une pression ne déclenche qu'une action.
import { BUTTONS_RELEASED, type ButtonsReading } from "../xr/buttons.ts";
import { actionOf, type PcAction } from "./keys.ts";
import { NO_LOOK, turn, type Look } from "./look.ts";
import { NO_DRAG, touchEnd, touchMove, touchStart } from "./touch.ts";

export interface PcFrameInput {
  /** Crans de vitesse demandés depuis l'image précédente (+ plus vite, − moins vite). */
  steps: number;
  /** Les boutons « appuyés à cette image », au même format que la manette du casque. */
  buttons: ButtonsReading;
  /** Touche du diagnostic de rendu : afficher ou masquer. */
  diagnostics: boolean;
  quit: boolean;
}

export interface PcInput {
  take(): PcFrameInput;
  look(): Look;
  /** Une action venue d'ailleurs que du clavier : les boutons à l'écran de la tablette (APP-007). */
  push: (action: PcAction) => void;
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
  // Le doigt, lui, tourne le regard dès qu'il glisse sur le canvas ; la souris garde ses événements (pointerType « mouse » ignoré ici).
  let drag = NO_DRAG;
  const onTouchDown = (event: PointerEvent): void => {
    if (event.pointerType === "touch") drag = touchStart(drag, event.pointerId, event.clientX, event.clientY);
  };
  const onTouchMove = (event: PointerEvent): void => {
    const step = touchMove(drag, event.pointerId, event.clientX, event.clientY);
    drag = step.drag;
    look = turn(look, step.dx, step.dy);
  };
  const onTouchUp = (event: PointerEvent): void => {
    drag = touchEnd(drag, event.pointerId);
  };
  doc.addEventListener("keydown", onKey);
  canvas.addEventListener("pointerdown", onTouchDown);
  doc.addEventListener("pointermove", onTouchMove);
  doc.addEventListener("pointerup", onTouchUp);
  doc.addEventListener("pointercancel", onTouchUp);
  canvas.addEventListener("mousedown", onDown);
  doc.addEventListener("mouseup", onUp);
  doc.addEventListener("mousemove", onMove);
  return {
    look: () => look,
    push: (action) => {
      pending.push(action);
    },
    take() {
      const taken = pending;
      pending = [];
      // Chaque pression de vitesse compte, même plusieurs entre deux images ; un cran vaut 0,1 km/h.
      const count = (action: PcAction): number => taken.filter((a) => a === action).length;
      const steps = count("faster") - count("slower") + 10 * (count("muchFaster") - count("muchSlower"));
      const buttons = { ...BUTTONS_RELEASED, trigger: taken.includes("pause"), a: taken.includes("recalibrate"), b: taken.includes("panel") };
      return { steps, buttons, diagnostics: taken.includes("diagnostics"), quit: taken.includes("quit") };
    },
    dispose() {
      doc.removeEventListener("keydown", onKey);
      canvas.removeEventListener("pointerdown", onTouchDown);
      doc.removeEventListener("pointermove", onTouchMove);
      doc.removeEventListener("pointerup", onTouchUp);
      doc.removeEventListener("pointercancel", onTouchUp);
      canvas.removeEventListener("mousedown", onDown);
      doc.removeEventListener("mouseup", onUp);
      doc.removeEventListener("mousemove", onMove);
    },
  };
}
