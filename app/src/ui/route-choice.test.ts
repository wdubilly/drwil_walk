import { Window } from "happy-dom";
import { describe, expect, it } from "vitest";
import { DEFAULT_ITINERARY_ID } from "../route/itineraries.ts";
import { SOON_LABEL, renderRouteChoice } from "./route-choice.ts";

function setup() {
  const doc = new Window().document as unknown as Document;
  const choice = renderRouteChoice(doc);
  doc.body.append(choice.element);
  const cards = [...choice.element.querySelectorAll("label")];
  const radio = (name: string) => {
    const found = cards.find((c) => c.textContent.includes(name))?.querySelector("input");
    if (!found) throw new Error(`carte « ${name} » introuvable`);
    return found;
  };
  return { choice, cards, radio };
}

describe("choix de l'itinéraire", () => {
  it("montre quatre cartes avec une image, Doha Souq Waqif choisi par défaut", () => {
    const { choice, cards, radio } = setup();
    expect(choice.element.querySelector("legend")?.textContent).toBe("Itinéraire");
    expect(cards).toHaveLength(4);
    for (const card of cards) expect(card.querySelector("img")?.getAttribute("src")).toMatch(/\.svg$/);
    expect(radio("Doha Souq Waqif").checked).toBe(true);
    expect(choice.readId()).toBe(DEFAULT_ITINERARY_ID);
  });

  it("marque « Bientôt » les itinéraires sans ville, qu'on ne peut pas choisir", () => {
    const { choice, cards, radio } = setup();
    const soon = cards.filter((c) => c.textContent.includes(SOON_LABEL));
    expect(soon.map((c) => c.querySelector(".card-name")?.textContent)).toEqual([
      "Pune FC Road",
      "Doha Corniche",
    ]);
    expect(radio("Pune FC Road").disabled).toBe(true);
    expect(radio("Doha Souq Waqif").disabled).toBe(false);
    radio("Doha Corniche").click();
    expect(choice.readId()).toBe(DEFAULT_ITINERARY_ID);
  });

  it("laisse choisir la Vieille ville de Pune, qui a sa ville", () => {
    const { choice, radio } = setup();
    expect(radio("Pune Vieille ville").disabled).toBe(false);
    radio("Pune Vieille ville").click();
    expect(choice.readId()).toBe("pune-vieille-ville");
  });

  it("garde l'itinéraire par défaut si plus aucune carte n'est cochée", () => {
    const { choice, radio } = setup();
    radio("Doha Souq Waqif").checked = false;
    expect(choice.readId()).toBe(DEFAULT_ITINERARY_ID);
  });
});
