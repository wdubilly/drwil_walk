// Choix du rendu de la ville à l'accueil : OpenStreetMap (par défaut, sans réseau) ou Google 3D (photoréaliste, avec clé).
// Des boutons radio, comme le choix d'itinéraire : clavier, manette et pointeur les manient sans code en plus.
export type Rendering = "osm" | "google";

export const DEFAULT_RENDERING: Rendering = "osm";

const CHOICES: readonly { value: Rendering; label: string }[] = [
  { value: "osm", label: "OpenStreetMap" },
  { value: "google", label: "Google 3D" },
];

export interface RenderChoice {
  element: HTMLElement;
  readRendering: () => Rendering;
  /** Appelé quand le choix change (l'accueil montre alors la mention de Google, ou la cache). */
  onChange(handler: () => void): void;
}

export function renderRenderChoice(doc: Document): RenderChoice {
  const element = doc.createElement("fieldset");
  element.className = "rendering";
  const legend = doc.createElement("legend");
  legend.textContent = "Rendu de la ville";
  element.append(legend);
  for (const choice of CHOICES) {
    const label = doc.createElement("label");
    const radio = doc.createElement("input");
    radio.type = "radio";
    radio.name = "rendu";
    radio.value = choice.value;
    radio.checked = choice.value === DEFAULT_RENDERING;
    label.append(radio, ` ${choice.label}`);
    element.append(label);
  }
  const read = (): Rendering =>
    element.querySelector<HTMLInputElement>("input:checked")?.value === "google" ? "google" : DEFAULT_RENDERING;
  return {
    element,
    readRendering: read,
    onChange: (handler) => {
      element.addEventListener("change", handler);
    },
  };
}
