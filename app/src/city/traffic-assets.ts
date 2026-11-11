// Les données embarquées des figurants (app/assets/, provenance dans PROVENANCE.md) : le catalogue, petit, est dans le paquet
// de la page ; les modèles ne sont chargés (import dynamique, toujours sans réseau externe) que si la case est cochée.
// La table de région des figurants vient de la recette (`app/assets/recette-regions.json`, APP-014), pas du catalogue.
import catalogue from "../../assets/figurants-catalogue.json" with { type: "json" };
import { RECIPE, figurantsTable } from "./region-palette.ts";
import type { Catalogue, RegionSetting } from "./traffic-catalog.ts";

/** Le catalogue embarqué, régions lues de la recette ; `bundledCatalogue` est la même donnée, à valider par `readCatalogue`. */
export const bundledData = { ...catalogue, regions: figurantsTable(RECIPE) as Catalogue["regions"] & { golfe: RegionSetting } };
export const bundledCatalogue: unknown = bundledData;
export const loadBundledModels = async (): Promise<unknown> => (await import("./traffic-models.ts")).default;
