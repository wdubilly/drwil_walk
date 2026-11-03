// Les boutons à l'écran de la version tablette (APP-007) : vitesse, pause, recalage, sortie. Ils produisent les mêmes
// actions que le clavier (`keys.ts`), donc les mêmes calculs de marche. Affichés seulement sur un pointeur tactile (home.css).
import type { PcAction } from "./keys.ts";

const BUTTONS: readonly { action: PcAction; label: string }[] = [
  { action: "slower", label: "Moins vite" },
  { action: "pause", label: "Pause ou reprise" },
  { action: "faster", label: "Plus vite" },
  { action: "recalibrate", label: "Recaler" },
  { action: "quit", label: "Quitter" },
];

export interface TouchControls {
  element: HTMLElement;
  remove(): void;
}

export function renderTouchControls(doc: Document, root: HTMLElement, onAction: (action: PcAction) => void): TouchControls {
  const bar = doc.createElement("div");
  bar.className = "touch-controls";
  bar.setAttribute("role", "group");
  bar.setAttribute("aria-label", "Commandes tactiles");
  for (const { action, label } of BUTTONS) {
    const button = doc.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.addEventListener("click", () => {
      onAction(action);
    });
    bar.append(button);
  }
  root.append(bar);
  return { element: bar, remove: () => { bar.remove(); } };
}
