import { Window } from "happy-dom";
import { describe, expect, it, vi } from "vitest";
import { ENTER_LABEL, renderHome } from "./home.ts";

function setup() {
  const window = new Window();
  const doc = window.document as unknown as Document;
  const root = doc.createElement("main");
  doc.body.append(root);
  const view = renderHome(doc, root);
  const input = (label: string) => {
    const found = [...root.querySelectorAll("label")].find((l) => l.textContent.includes(label));
    const el = found?.querySelector("input");
    if (!el) throw new Error(`champ « ${label} » introuvable`);
    return el;
  };
  const button = root.querySelector("button");
  if (!button) throw new Error("bouton introuvable");
  return { root, view, input, button };
}

describe("écran d'accueil", () => {
  it("montre le rappel de sécurité et le bouton d'entrée en réalité mixte", () => {
    const { root, button } = setup();
    expect(root.querySelector("[aria-label='Rappel de sécurité']")?.textContent).toContain("Clé de sécurité");
    expect(button.textContent).toBe(ENTER_LABEL);
  });

  it("propose le choix d'itinéraire et transmet celui qui démarre", () => {
    const { root, view, button } = setup();
    expect(view.readRouteId()).toBe("doha-souq-waqif");
    const handler = vi.fn(() => root.getAttribute("data-route"));
    view.onEnter(handler);
    button.click();
    expect(handler).toHaveReturnedWith("doha-souq-waqif");
  });

  it("APP-003: montre la mention des contributeurs OpenStreetMap", () => {
    const { root } = setup();
    expect(root.querySelector(".attribution")?.textContent).toBe("© contributeurs OpenStreetMap");
  });

  it("propose 4,0 km/h par défaut, réglable de 1 à 8 km/h par pas de 0,1", () => {
    const { view, input } = setup();
    const speed = input("Vitesse de départ");
    expect([speed.value, speed.min, speed.max, speed.step]).toEqual(["4.0", "1", "8", "0.1"]);
    expect(view.readSpeedKmh()).toBe(4);
    speed.value = "5,5";
    expect(view.readSpeedKmh()).toBe(5.5);
  });

  it("APP-001: borne l'opacité de la ville saisie entre 30 et 100 %", () => {
    const { view, input } = setup();
    const opacity = input("Opacité de la ville");
    expect([opacity.min, opacity.max, opacity.value]).toEqual(["30", "100", "100"]);
    opacity.value = "60";
    expect(view.readOpacityPct()).toBe(60);
  });

  it("prévient au clic, se désactive pendant l'entrée et affiche un état", () => {
    const { root, view, button } = setup();
    const handler = vi.fn();
    view.onEnter(handler);
    button.click();
    expect(handler).toHaveBeenCalledOnce();
    view.setEntering(true);
    expect(button.disabled).toBe(true);
    view.showStatus("Réalité mixte active");
    expect(root.querySelector("[role='status']")?.textContent).toBe("Réalité mixte active");
    expect(view.root).toBe(root);
  });
});
