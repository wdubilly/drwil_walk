// Côté du panneau d'infos dans le casque, choisi à l'accueil (APP-002) : à gauche ou à droite, en bas du champ de vision.
// Des boutons radio, comme le rendu de la ville ; le choix est gardé dans ce navigateur seulement, jamais envoyé.
export type PanelSide = "left" | "right";

/** Choix technique de l'agent, rouvert par l'essai au casque (fiche panneau-discret). */
export const DEFAULT_PANEL_SIDE: PanelSide = "right";
export const PANEL_SIDE_STORAGE_KEY = "drwil_walk.cote-panneau";

const CHOICES: readonly { value: PanelSide; label: string }[] = [
  { value: "left", label: "À gauche" },
  { value: "right", label: "À droite" },
];

export type PanelSideStorage = Pick<Storage, "getItem" | "setItem">;

/** Le côté gardé ; sans stockage, sans valeur ou avec une valeur illisible : le côté par défaut. */
export function loadPanelSide(storage: PanelSideStorage | undefined): PanelSide {
  try {
    const value = storage?.getItem(PANEL_SIDE_STORAGE_KEY);
    return value === "left" || value === "right" ? value : DEFAULT_PANEL_SIDE;
  } catch {
    return DEFAULT_PANEL_SIDE;
  }
}

/** Garde le côté ; faux si le navigateur refuse (stockage plein ou interdit), à dire à l'utilisateur. */
export function savePanelSide(storage: PanelSideStorage | undefined, side: PanelSide): boolean {
  try {
    if (!storage) return false;
    storage.setItem(PANEL_SIDE_STORAGE_KEY, side);
    return true;
  } catch {
    return false;
  }
}

export interface PanelSideChoice {
  element: HTMLElement;
  readSide: () => PanelSide;
}

/** Le choix du côté ; `notice` reçoit la raison quand le côté ne peut pas être gardé (QUA-002). */
export function renderPanelSide(doc: Document, storage: PanelSideStorage | undefined, notice: HTMLElement): PanelSideChoice {
  const element = doc.createElement("fieldset");
  element.className = "panel-side";
  const legend = doc.createElement("legend");
  legend.textContent = "Côté du panneau d'infos dans le casque";
  element.append(legend);
  const saved = loadPanelSide(storage);
  for (const choice of CHOICES) {
    const label = doc.createElement("label");
    const radio = doc.createElement("input");
    radio.type = "radio";
    radio.name = "cote-panneau";
    radio.value = choice.value;
    radio.checked = choice.value === saved;
    label.append(radio, ` ${choice.label}`);
    element.append(label);
  }
  const readSide = (): PanelSide => ([...element.querySelectorAll("input")].find((radio) => radio.checked)?.value === "left" ? "left" : "right");
  element.addEventListener("change", () => {
    notice.textContent = savePanelSide(storage, readSide())
      ? ""
      : "Le côté du panneau ne peut pas être gardé dans ce navigateur : il sert seulement pour cette séance.";
  });
  return { element, readSide };
}
