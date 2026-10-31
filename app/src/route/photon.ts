// La recherche d'adresse par Photon (données OpenStreetMap), instance publique par défaut. Une requête par validation d'adresse,
// jamais d'autocomplétion ; un point touché sur la carte en demande une seule (géocodage inverse). Les adresses ne partent
// qu'à ce service : rien n'est enregistré (aucune donnée personnelle conservée).
import type { LonLat } from "./geo.ts";
import { errorMessage, roundedCoordinates, type Geocoder, type Place } from "./providers.ts";

interface PhotonResponse {
  features?: { geometry?: { coordinates?: number[] }; properties?: Record<string, unknown> }[];
}

type Feature = NonNullable<PhotonResponse["features"]>[number];

const text = (value: unknown): string => (typeof value === "string" ? value : "");

/** Un libellé lisible : nom du lieu, numéro et rue, quartier, ville, pays — sans répétition. */
function labelOf(feature: Feature): string {
  const p = feature.properties ?? {};
  const street = [text(p["housenumber"]), text(p["street"])].filter((part) => part !== "").join(" ");
  const parts = [text(p["name"]), street, text(p["district"]), text(p["city"]), text(p["country"])].filter((part) => part !== "");
  return [...new Set(parts)].join(", ");
}

export function createPhotonGeocoder(baseUrl: string, fetchFn: typeof fetch): Geocoder {
  const fail = (reason: string): Error => new Error(`Recherche d'adresse impossible : ${reason}`);
  async function query(path: string, params: Record<string, string>): Promise<Feature[]> {
    let response: Response;
    try {
      response = await fetchFn(`${baseUrl}/${path}?${new URLSearchParams(params).toString()}`);
    } catch (error) {
      throw fail(`service d'adresses injoignable (${errorMessage(error)})`);
    }
    if (response.status === 429) throw fail("le service d'adresses public limite les demandes, réessayez dans un instant");
    if (!response.ok) throw fail(`le service d'adresses a répondu ${String(response.status)}`);
    return ((await response.json()) as PhotonResponse).features ?? [];
  }
  return {
    async find(input): Promise<Place> {
      const address = input.trim();
      if (address === "") throw new Error("Recherche d'adresse : tapez un lieu ou une adresse.");
      const first = (await query("api", { q: address, limit: "1" }))[0];
      const [lon, lat] = first?.geometry?.coordinates ?? [];
      if (first === undefined || lon === undefined || lat === undefined) {
        throw new Error(`Adresse introuvable : « ${address} ». Précisez le lieu, ou touchez la carte.`);
      }
      return { point: [lon, lat], label: labelOf(first) || address };
    },
    async describe(point: LonLat): Promise<string> {
      try {
        const first = (await query("reverse", { lon: String(point[0]), lat: String(point[1]), limit: "1" }))[0];
        return (first && labelOf(first)) || roundedCoordinates(point);
      } catch {
        // Le trajet ne dépend pas de l'adresse : les coordonnées arrondies suffisent, la raison est celle du calcul.
        return roundedCoordinates(point);
      }
    },
  };
}
