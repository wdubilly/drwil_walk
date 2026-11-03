// Choix du rendu de la ville à l'accueil : OpenStreetMap (par défaut, sans réseau), Google 3D (photoréaliste, avec clé), ou les
// matériaux locaux (prototype : la ville OpenStreetMap habillée des matériaux du quartier, proposée là où une bibliothèque existe).
// Des boutons radio, comme le choix d'itinéraire : clavier, manette et pointeur les manient sans code en plus.
export type Rendering = "osm" | "google";

export const DEFAULT_RENDERING: Rendering = "osm";
export const LOCAL_MATERIALS = "materiaux";

const CHOICES: readonly { value: Rendering | typeof LOCAL_MATERIALS; label: string }[] = [
  { value: "osm", label: "OpenStreetMap" },
  { value: "google", label: "Google 3D" },
  { value: LOCAL_MATERIALS, label: "Matériaux locaux (prototype)" },
];

export interface RenderChoice {
  element: HTMLElement;
  /** La source de la ville : les matériaux locaux habillent la ville OpenStreetMap. */
  readRendering: () => Rendering;
  /** Vrai si les matériaux locaux sont choisis (jamais quand l'itinéraire n'en a pas). */
  readLocalMaterials: () => boolean;
  /** Montre ou cache l'option des matériaux locaux selon l'itinéraire ; cachée, le choix retombe sur OpenStreetMap. */
  setLocalAvailable(available: boolean): void;
  /** Appelé quand le choix change (l'accueil montre alors la mention de Google, ou la cache). */
  onChange(handler: () => void): void;
}

export function renderRenderChoice(doc: Document): RenderChoice {
  const element = doc.createElement("fieldset");
  element.className = "rendering";
  const legend = doc.createElement("legend");
  legend.textContent = "Rendu de la ville";
  element.append(legend);
  const labels = CHOICES.map((choice) => {
    const label = doc.createElement("label");
    const radio = doc.createElement("input");
    radio.type = "radio";
    radio.name = "rendu";
    radio.value = choice.value;
    radio.checked = choice.value === DEFAULT_RENDERING;
    label.append(radio, ` ${choice.label}`);
    element.append(label);
    return { label, radio };
  });
  const local = labels[2] as { label: HTMLLabelElement; radio: HTMLInputElement };
  const checked = (): string | undefined => labels.find((l) => l.radio.checked)?.radio.value;
  return {
    element,
    readRendering: () => (checked() === "google" ? "google" : DEFAULT_RENDERING),
    readLocalMaterials: () => checked() === LOCAL_MATERIALS,
    setLocalAvailable: (available) => {
      local.label.hidden = !available;
      // La feuille de style donne `display: flex` aux choix, qui l'emporte sur l'attribut `hidden`.
      local.label.style.display = available ? "" : "none";
      if (!available && local.radio.checked) (labels[0] as { radio: HTMLInputElement }).radio.checked = true;
    },
    onChange: (handler) => {
      element.addEventListener("change", handler);
    },
  };
}
