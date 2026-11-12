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

/** Le mobilier urbain simple retenu : lampadaires, bancs, poubelles et panneaux (balises exactes), au côté des arbres `natural=tree`. */
export function propKind(tags: Record<string, string>): "tree" | "lamp" | "bench" | "bin" | "sign" | undefined {
  if (tags["natural"] === "tree") return "tree";
  if (tags["highway"] === "street_lamp") return "lamp";
  if (tags["amenity"] === "bench") return "bench";
  if (tags["amenity"] === "waste_basket") return "bin";
  if (tags["traffic_sign"] !== undefined || tags["highway"] === "stop" || tags["highway"] === "give_way") return "sign";
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

/** La balise `building` (`yes`, `house`, `apartments`…), sans espace ; rien si elle est vide. */
export function buildingKind(tags: Record<string, string>): string | undefined {
  const value = (tags["building"] ?? "").trim().toLowerCase();
  return value === "" ? undefined : value;
}

/** L'usage commercial d'un bâtiment : `shop` pour un commerce, `food` pour un café ou un restaurant ; rien sinon (APP-008). */
export type Usage = "shop" | "food";
const FOOD_AMENITIES = new Set(["restaurant", "cafe", "fast_food", "bar", "pub", "food_court", "ice_cream"]);
export function usageOf(tags: Record<string, string>): Usage | undefined {
  const shop = (tags["shop"] ?? "").trim().toLowerCase();
  if (shop !== "" && shop !== "no") return "shop";
  if (FOOD_AMENITIES.has((tags["amenity"] ?? "").trim().toLowerCase())) return "food";
  return undefined;
}

/** Le nombre d'étages (`building:levels`) : un entier de 1 à 60, arrondi ; rien si la valeur est illisible. */
export function buildingLevels(tags: Record<string, string>): number | undefined {
  const levels = Math.round(parseFloat(tags["building:levels"] ?? ""));
  return levels >= 1 && levels <= 60 ? levels : undefined;
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

/** Le sens unique d'une voie : `oneway=yes|1|true` dans le sens du tracé, `-1` à rebours ; le reste : double sens. */
export function onewayOf(tags: Record<string, string>): "forward" | "backward" | undefined {
  const value = tags["oneway"];
  if (value === "yes" || value === "1" || value === "true") return "forward";
  return value === "-1" ? "backward" : undefined;
}

/** Le nombre de voies (`lanes`) : un entier de 1 à 8 ; rien si la valeur est illisible. */
export function lanesOf(tags: Record<string, string>): number | undefined {
  const lanes = Number(tags["lanes"]);
  return Number.isInteger(lanes) && lanes >= 1 && lanes <= 8 ? lanes : undefined;
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

export type Surface = "asphalt" | "pave" | "terre";

const SURFACES: Record<string, Surface> = {
  asphalt: "asphalt", paved: "asphalt", concrete: "asphalt", "concrete:plates": "asphalt", "concrete:lanes": "asphalt",
  paving_stones: "pave", sett: "pave", cobblestone: "pave", unhewn_cobblestone: "pave", bricks: "pave", brick: "pave",
  unpaved: "terre", dirt: "terre", ground: "terre", earth: "terre", gravel: "terre", compacted: "terre", sand: "terre", grass: "terre",
};

/** Le revêtement relevé d'une voie (`surface`), en trois familles ; rien si la balise est absente ou inconnue (la région fournit le repli). */
export function surfaceOf(tags: Record<string, string>): Surface | undefined {
  return SURFACES[(tags["surface"] ?? "").trim().toLowerCase()];
}
