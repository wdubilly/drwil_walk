// Les boutiques du rez-de-chaussée, décidées par règle de région (APP-008) : un usage relevé dans OpenStreetMap (`shop`, `amenity`,
// `building=retail`) donne une boutique « relevée » ; sans usage, une part de la région est ajoutée par règle (APP-013).
import { SHOP_KINDS, type Region } from "./facade-family.ts";
import { buildingSeed, seededRandom } from "./facade-seed.ts";
import type { Building } from "./souq-data.ts";

/** L'auvent d'une boutique : aucun, plat, store incliné rayé, ou arcade à deux piliers. */
export type Awning = "none" | "flat" | "striped" | "arcade";
/** Un commerce vient du relevé ; une boutique sans usage connu est ajoutée par la règle de la région. */
export type ShopOrigin = "releve" | "regle";

interface ShopRule {
  /** Part des bâtiments sans usage connu qui reçoivent une boutique par règle. */
  share: number;
  /** Les auvents possibles ; le tirage du bâtiment en choisit un. */
  awnings: readonly Awning[];
  /** Largeur de l'entrée d'une boutique, en mètres. */
  entryM: number;
}

const SHOP_RULES: Record<Region, ShopRule> = {
  provence: { share: 0.15, awnings: ["striped", "flat", "none"], entryM: 1.1 },
  italie: { share: 0.2, awnings: ["striped", "none", "flat"], entryM: 1.1 },
  caucase: { share: 0.2, awnings: ["flat", "none"], entryM: 1.2 },
  "france-nord": { share: 0.15, awnings: ["striped", "none"], entryM: 1.1 },
  inde: { share: 0.5, awnings: ["striped", "striped", "flat"], entryM: 1.6 },
  golfe: { share: 0.35, awnings: ["arcade", "flat", "arcade"], entryM: 1.3 },
  ailleurs: { share: 0.2, awnings: ["flat", "none", "striped"], entryM: 1.1 },
};

/** Les balises sans usage précis : seules elles peuvent recevoir une boutique par règle (jamais une église ni une maison). */
const UNDECIDED_KINDS = new Set(["", "yes", "apartments"]);
/** Au-delà, un immeuble n'a pas de boutique de plain-pied par règle. */
const MAX_SHOP_FLOORS = 5;

export interface Shop {
  shop: boolean;
  origin: ShopOrigin | undefined;
  awning: Awning;
  entryM: number;
}

export function shopOf(building: Building, region: Region, floors: number): Shop {
  const rule = SHOP_RULES[region];
  const draw = seededRandom(buildingSeed(building) ^ 0x5409);
  const [share, pick] = [draw(), draw()];
  const relevé = building.usage !== undefined || SHOP_KINDS.has(building.kind ?? "");
  const origin: ShopOrigin | undefined = relevé
    ? "releve"
    : UNDECIDED_KINDS.has(building.kind ?? "") && floors <= MAX_SHOP_FLOORS && share < rule.share
      ? "regle"
      : undefined;
  const awning = origin === undefined ? "none" : (rule.awnings[Math.floor(pick * rule.awnings.length)] as Awning);
  return { shop: origin !== undefined, origin, awning, entryM: rule.entryM };
}
