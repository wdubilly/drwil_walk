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

/** Les surfaces de sol et les haies demandées à Overpass avec les bâtiments : occupation du sol, parcs, jardins et haies. */
export const LAND_WAYS = [
  'way["landuse"~"^(grass|meadow|forest|recreation_ground|village_green|orchard|cemetery|flowerbed)$"]',
  'way["leisure"~"^(park|garden|playground|pitch|common)$"]',
  'way["natural"~"^(wood|scrub|grassland)$"]',
  'way["barrier"="hedge"]',
] as const;

export type AreaKind = "grass" | "park" | "garden" | "wood";

/** La famille d'une surface verte (balises exactes) : de quoi choisir sa teinte au sol. */
export function areaKind(tags: Record<string, string>): AreaKind | undefined {
  const landuse = tags["landuse"];
  const leisure = tags["leisure"];
  const natural = tags["natural"];
  if (leisure === "park" || leisure === "common" || landuse === "recreation_ground" || landuse === "village_green") return "park";
  if (leisure === "garden" || landuse === "flowerbed" || landuse === "orchard") return "garden";
  if (landuse === "forest" || natural === "wood" || natural === "scrub") return "wood";
  if (landuse === "grass" || landuse === "meadow" || landuse === "cemetery" || natural === "grassland" || leisure === "playground" || leisure === "pitch") return "grass";
  return undefined;
}

export type Sidewalk = "both" | "left" | "right";

/** Les trottoirs d'une voie : `sidewalk=both|left|right` (ou `yes`, des deux côtés) ; `no` et le reste : aucun. */
export function sidewalkSides(tags: Record<string, string>): Sidewalk | undefined {
  const value = tags["sidewalk"];
  if (value === "both" || value === "yes") return "both";
  return value === "left" || value === "right" ? value : undefined;
}

/** Un chemin piéton tracé à part : trottoir ou passage piéton (`footway=sidewalk|crossing`). */
export function footwayKind(tags: Record<string, string>): "sidewalk" | "crossing" | undefined {
  const value = tags["footway"] ?? (tags["highway"] === "crossing" ? "crossing" : undefined);
  return value === "sidewalk" || value === "crossing" ? value : undefined;
}

/** La toiture à deux pans : `roof:shape=gabled` (ou `hipped`, dessiné de même). */
export function roofShape(tags: Record<string, string>): "gabled" | undefined {
  const shape = tags["roof:shape"];
  return shape === "gabled" || shape === "hipped" ? "gabled" : undefined;
}
