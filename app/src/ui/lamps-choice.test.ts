import { Window } from "happy-dom";
import { describe, expect, it } from "vitest";
import { STREET_LIGHTS_LABEL, generatedLampsOn, renderLampsChoice, renderLampsChoices, streetLightsOn } from "./lamps-choice.ts";

const page = (): Document => new Window().document as unknown as Document;

describe("réglage des lampadaires produits", () => {
  it("APP-013: la case est cochée par défaut, se décoche, et la scène le relit dans la page", () => {
    const doc = page();
    doc.body.append(renderLampsChoice(doc));
    const box = doc.querySelector("input") as HTMLInputElement;
    expect(doc.body.textContent).toContain("Lampadaires produits par règle");
    expect(generatedLampsOn(doc)).toBe(true);
    box.checked = false;
    expect(generatedLampsOn(doc)).toBe(false);
    box.checked = true;
    expect(generatedLampsOn(doc)).toBe(true);
  });

  it("APP-013: sans accueil dans la page, les lampadaires sont posés", () => {
    expect(generatedLampsOn(page())).toBe(true);
  });

  it("APP-011: la case des lanternes allumées la nuit est cochée par défaut, à part de celle des lampadaires produits", () => {
    const doc = page();
    doc.body.append(...renderLampsChoices(doc));
    expect(doc.body.textContent).toContain(STREET_LIGHTS_LABEL);
    expect(streetLightsOn(doc)).toBe(true);
    (doc.getElementById("lampadaires-allumes") as HTMLInputElement).checked = false;
    expect([streetLightsOn(doc), generatedLampsOn(doc)]).toEqual([false, true]);
    expect(streetLightsOn(page())).toBe(true);
  });
});
