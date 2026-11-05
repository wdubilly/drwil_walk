// Les données embarquées des figurants (app/assets/, provenance dans PROVENANCE.md) : le catalogue, petit, est dans le paquet
// de la page ; les modèles ne sont chargés (import dynamique, toujours sans réseau externe) que si la case est cochée.
import catalogue from "../../assets/figurants-catalogue.json" with { type: "json" };

export const bundledCatalogue: unknown = catalogue;
export const loadBundledModels = async (): Promise<unknown> => (await import("./traffic-models.ts")).default;
