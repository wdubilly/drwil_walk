import { describe, expect, it } from "vitest";
import { DEFAULT_ITINERARY_ID, ITINERARIES } from "./itineraries.ts";

describe("itinéraires", () => {
  it("propose les quatre balades de la mission, dans l'ordre de MISSION.md", () => {
    expect(ITINERARIES.map((i) => i.name)).toEqual([
      "Pune Vieille ville",
      "Pune FC Road",
      "Doha Corniche",
      "Doha Souq Waqif",
    ]);
    expect(ITINERARIES.find((i) => i.id === DEFAULT_ITINERARY_ID)?.available).toBe(true);
  });

  it("les quatre itinéraires peuvent démarrer : chacun a sa ville dans le dépôt", () => {
    expect(ITINERARIES.filter((i) => i.available).map((i) => i.id)).toEqual(["pune-vieille-ville", "pune-fc-road", "doha-corniche", DEFAULT_ITINERARY_ID]);
  });

  it("chaque itinéraire a un identifiant unique", () => {
    expect(new Set(ITINERARIES.map((i) => i.id)).size).toBe(ITINERARIES.length);
  });
});
