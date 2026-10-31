import { Window } from "happy-dom";
import { describe, expect, it, vi } from "vitest";
import { renderRenderChoice } from "./render-choice.ts";

function setup() {
  const window = new Window();
  const doc = window.document as unknown as Document;
  const choice = renderRenderChoice(doc);
  doc.body.append(choice.element);
  const radio = (value: string) => {
    const found = choice.element.querySelector<HTMLInputElement>(`input[value='${value}']`);
    if (!found) throw new Error(`choix « ${value} » introuvable`);
    return found;
  };
  return { choice, radio };
}

describe("choix du rendu de la ville", () => {
  it("APP-003: garde OpenStreetMap par défaut : sans geste de l'utilisateur, aucun réseau", () => {
    const { choice, radio } = setup();
    expect(choice.readRendering()).toBe("osm");
    expect(radio("osm").checked).toBe(true);
    expect(radio("google").checked).toBe(false);
  });

  it("lit le rendu Google 3D une fois choisi, et prévient du changement", () => {
    const { choice, radio } = setup();
    const handler = vi.fn();
    choice.onChange(handler);
    radio("google").click();
    expect(handler).toHaveBeenCalledOnce();
    expect(choice.readRendering()).toBe("google");
  });

  it("retombe sur OpenStreetMap si aucun bouton n'est coché", () => {
    const { choice, radio } = setup();
    radio("osm").checked = false;
    expect(choice.readRendering()).toBe("osm");
  });
});
