import { Window } from "happy-dom";
import { describe, expect, it, vi } from "vitest";
import type { TripPlanner } from "../city/free-route.ts";
import { renderHome } from "./home.ts";
import { DEFAULT_PANEL_SIDE, PANEL_SIDE_STORAGE_KEY, loadPanelSide, renderPanelSide, savePanelSide } from "./panel-side.ts";

const planner: TripPlanner = {
  find: () => Promise.reject(new Error("jamais")),
  describe: () => Promise.reject(new Error("jamais")),
  plan: () => Promise.reject(new Error("jamais")),
};

function memory(initial?: string) {
  const data = new Map<string, string>(initial === undefined ? [] : [[PANEL_SIDE_STORAGE_KEY, initial]]);
  return { data, getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v), removeItem: (k: string) => void data.delete(k) };
}
const refusing = { getItem: () => null, setItem: () => { throw new Error("stockage plein"); } };

function setup(storage?: Parameters<typeof renderPanelSide>[1]) {
  const doc = new Window().document as unknown as Document;
  const notice = doc.createElement("p");
  const choice = renderPanelSide(doc, storage, notice);
  doc.body.append(choice.element);
  const radio = (value: string) => {
    const found = choice.element.querySelector<HTMLInputElement>(`input[value='${value}']`);
    if (!found) throw new Error(`choix « ${value} » introuvable`);
    return found;
  };
  return { choice, radio, notice };
}

describe("côté du panneau d'infos du casque", () => {
  it("APP-002: propose gauche et droite, avec un côté par défaut coché", () => {
    const { choice, radio } = setup();
    expect(choice.element.querySelector("legend")?.textContent).toContain("Côté du panneau");
    expect([...choice.element.querySelectorAll("label")].map((l) => l.textContent.trim())).toEqual(["À gauche", "À droite"]);
    expect(choice.readSide()).toBe(DEFAULT_PANEL_SIDE);
    expect(radio(DEFAULT_PANEL_SIDE).checked).toBe(true);
  });

  it("APP-002: lit le côté gardé dans ce navigateur", () => {
    expect(loadPanelSide(memory("left"))).toBe("left");
    expect(loadPanelSide(memory("right"))).toBe("right");
    const { choice, radio } = setup(memory("left"));
    expect(choice.readSide()).toBe("left");
    expect(radio("left").checked).toBe(true);
  });

  it("APP-002: remplace une valeur illisible, absente ou un stockage en erreur par le côté par défaut", () => {
    expect(loadPanelSide(memory("haut"))).toBe(DEFAULT_PANEL_SIDE);
    expect(loadPanelSide(memory(""))).toBe(DEFAULT_PANEL_SIDE);
    expect(loadPanelSide(memory())).toBe(DEFAULT_PANEL_SIDE);
    expect(loadPanelSide(undefined)).toBe(DEFAULT_PANEL_SIDE);
    expect(loadPanelSide({ getItem: () => { throw new Error("stockage interdit"); }, setItem: vi.fn() })).toBe(DEFAULT_PANEL_SIDE);
  });

  it("APP-002: garde le côté choisi dans ce navigateur seulement, sans rien écrire avant le choix", () => {
    const storage = memory();
    const { choice, radio, notice } = setup(storage);
    expect(storage.data.size).toBe(0);
    radio("left").click();
    expect(choice.readSide()).toBe("left");
    expect(storage.data.get(PANEL_SIDE_STORAGE_KEY)).toBe("left");
    expect(notice.textContent).toBe("");
    radio("right").click();
    expect(storage.data.get(PANEL_SIDE_STORAGE_KEY)).toBe("right");
  });

  it("QUA-002: dit que le côté ne sera pas gardé si le navigateur refuse ou n'a pas de stockage", () => {
    for (const storage of [refusing, undefined]) {
      const { radio, notice, choice } = setup(storage);
      radio("left").click();
      expect(choice.readSide()).toBe("left");
      expect(notice.textContent).toContain("ne peut pas être gardé");
    }
    expect(savePanelSide(undefined, "left")).toBe(false);
  });

  it("APP-002: l'accueil porte le choix, le relit à l'accueil suivant et le donne à la marche qui démarre", () => {
    const storage = memory();
    const doc = new Window().document as unknown as Document;
    const root = doc.createElement("main");
    doc.body.append(root);
    const view = renderHome(doc, root, planner, storage);
    expect(view.readPanelSide()).toBe(DEFAULT_PANEL_SIDE);
    root.querySelector<HTMLInputElement>("input[value='left']")?.click();
    expect(view.readPanelSide()).toBe("left");
    view.onEnter(() => undefined);
    root.querySelector<HTMLButtonElement>("button.enter")?.click();
    expect(root.dataset["panelSide"]).toBe("left");
    const again = renderHome(doc, doc.createElement("main"), planner, storage);
    expect(again.readPanelSide()).toBe("left");
  });
});
