import { describe, expect, it } from "vitest";
import { DEFAULT_ITINERARY_ID, ITINERARIES } from "./itineraries.ts";

describe("itinéraires", () => {
  it("propose les quatre balades de la mission, Pune Vieille ville en premier", () => {
    expect(ITINERARIES.map((i) => i.name)).toEqual([
      "Pune Vieille ville",
      "Pune FC Road",
      "Doha Corniche",
      "Doha Souq Waqif",
    ]);
    expect(ITINERARIES[0]?.id).toBe(DEFAULT_ITINERARY_ID);
  });

  it("l'itinéraire par défaut peut démarrer, les autres sont « bientôt »", () => {
    expect(ITINERARIES.filter((i) => i.available).map((i) => i.id)).toEqual([DEFAULT_ITINERARY_ID]);
  });

  it("chaque itinéraire a un identifiant unique et une illustration locale", () => {
    expect(new Set(ITINERARIES.map((i) => i.id)).size).toBe(ITINERARIES.length);
    for (const i of ITINERARIES) expect(i.image).toMatch(/^\/[a-z-]+\.svg$/);
  });
});
