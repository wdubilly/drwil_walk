// Les balises OpenStreetMap que le rendu enrichi lit : couleurs et matériau des bâtiments, arbres et mobilier urbain.
// Partagé par l'extraction des quatre itinéraires figés et par le trajet libre (APP-003).

/** Les noms de couleur CSS les plus courants dans `building:colour` ; les autres noms sont ignorés (ton de la palette). */
const NAMED_COLOURS: Record<string, string> = {
  white: "#ffffff", black: "#000000", grey: "#808080", gray: "#808080", red: "#cc3333", brown: "#8b5a2b", beige: "#e8dcc0",
  yellow: "#e6c84a", orange: "#e08a3c", green: "#5a9a5a", blue: "#4a7ab8", pink: "#e0a0b0", tan: "#d2b48c", cream: "#f5ecd0",
  maroon: "#800000", sandybrown: "#f4a460", darkgray: "#a9a9a9", lightgray: "#d3d3d3", silver: "#c0c0c0",
};

/** Une couleur OSM (`#rgb`, `#rrggbb` ou nom courant) en `#rrggbb`, ou rien si elle n'est pas lisible. */
export function parseColour(value: string | undefined): string | undefined {
  const text = (value ?? "").trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(text)) return text;
  if (/^#[0-9a-f]{3}$/.test(text)) return `#${text.slice(1).replace(/./g, "$&$&")}`;
  return NAMED_COLOURS[text];
}

/** Le mobilier urbain simple retenu : lampadaires et bancs (balises exactes), au côté des arbres `natural=tree`. */
export function propKind(tags: Record<string, string>): "tree" | "lamp" | "bench" | undefined {
  if (tags["natural"] === "tree") return "tree";
  if (tags["highway"] === "street_lamp") return "lamp";
  if (tags["amenity"] === "bench") return "bench";
  return undefined;
}

/** Les balises de couleur et de matériau d'un bâtiment, seulement celles qui sont lisibles. */
export function buildingLook(tags: Record<string, string>): { colour?: string; roofColour?: string; material?: string } {
  const colour = parseColour(tags["building:colour"]);
  const roofColour = parseColour(tags["roof:colour"]);
  const material = tags["building:material"];
  return {
    ...(colour ? { colour } : {}),
    ...(roofColour ? { roofColour } : {}),
    ...(material ? { material } : {}),
  };
}
