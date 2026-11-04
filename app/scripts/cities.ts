// Les villes à extraire, décrites par des données dans `data/villes.json` (seule source) : ajouter une ville, c'est lancer
// la commande unique `npm run city` (scripts/create-city.ts), qui écrit son entrée, son extrait, sa boucle et ses matériaux.
// © contributeurs OpenStreetMap, licence ODbL.
import catalog from "../data/villes.json" with { type: "json" };
import { extract } from "./extract-souq.ts";

export type Retour = "aller-retour" | "boucle";

export interface CityDescription {
  /** L'identifiant de l'itinéraire dans l'application, aussi celui de sa bibliothèque de matériaux. */
  itinerary: string;
  name: string;
  bbox: { south: number; west: number; north: number; east: number };
  userAgent: string;
  /** Fichier de l'extrait, relatif à `app/` ; la boucle est à côté, suffixée `-boucle`. */
  file: string;
  /** Départ, étapes et arrivée en [latitude, longitude], et le retour : par le même chemin ou par un chemin qui évite l'aller. */
  route: { points: number[][]; return: Retour };
}

export type CityId = keyof typeof catalog;

export const CITIES = catalog as Record<CityId, CityDescription>;

export const loopFileOf = (city: Pick<CityDescription, "file">): string => city.file.replace(/\.json$/, "-boucle.json");

/** Interroge Overpass pour la ville donnée et rend le texte de son fichier d'extrait. */
export const extractCity = (fetchFn: typeof fetch, city: CityDescription): Promise<string> => extract(fetchFn, city.bbox, city.userAgent);
