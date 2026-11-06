import { Event as DomEvent, Window } from "happy-dom";
import { describe, expect, it, vi } from "vitest";
import { ENTER_LABEL, renderHome } from "./home.ts";
import { DEFAULT_PREFERENCES } from "./preferences.ts";

function setup() {
  const doc = new Window().document as unknown as Document;
  const root = doc.createElement("main");
  doc.body.append(root);
  const view = renderHome(doc, root);
  const speed = root.querySelector<HTMLInputElement>("input[type='number']") as HTMLInputElement;
  return { root, view, speed, button: root.querySelector<HTMLButtonElement>("button.enter") as HTMLButtonElement };
}

describe("accueil réduit", () => {
  it("QUA-020 APP-003 APP-011: quatre itinéraires, vitesse, rappels et démarrages seulement ; attribution locale", () => {
    const { root, view, button } = setup();
    expect(root.querySelectorAll("input[name='itineraire']")).toHaveLength(4);
    expect(root.querySelectorAll("input")).toHaveLength(5);
    expect(root.querySelector("[aria-label='Rappel de sécurité']")?.textContent).toContain("Clé de sécurité");
    expect(button.textContent).toBe(ENTER_LABEL);
    expect(root.querySelector(".attribution")?.textContent).toBe("© contributeurs OpenStreetMap");
    expect(root.textContent).not.toMatch(/Google|Itinéraire libre|Poids|Brouillard|Lampadaires/);
    expect(view.readRouteId()).toBe("doha-souq-waqif");
  });

  it("APP-001 APP-006 APP-012: préférences sûres par défaut, pas de vignette ni de matériaux à commander", () => {
    const { root, view } = setup();
    expect(view.preferences.read()).toEqual(DEFAULT_PREFERENCES);
    expect(view.readMaterials()?.library.itinerary).toBe("doha-souq-waqif");
    root.querySelector<HTMLInputElement>("input[value='pune-fc-road']")?.click();
    expect(view.readMaterials()).toBeUndefined();
  });

  it("lit la vitesse dès 1 km/h, sans plafond, au pas de 0,1 et annonce puis normalise une saisie hors limite", () => {
    const { root, view, speed } = setup();
    expect([speed.min, speed.max, speed.step, speed.value]).toEqual(["1", "", "0.1", "4.0"]);
    expect(view.readSpeedKmh()).toBe(4);
    speed.value = "50";
    speed.dispatchEvent(new DomEvent("input") as unknown as Event);
    expect(view.readSpeedKmh()).toBe(50);
    speed.value = "0.2";
    speed.dispatchEvent(new DomEvent("change") as unknown as Event);
    expect(root.querySelector(".speed-limit")?.textContent).toContain("sous la limite");
    expect(speed.value).toBe("1.0");
    speed.value = "5,5";
    expect(view.readSpeedKmh()).toBe(5.5);
  });

  it("APP-002: les deux boutons distincts préviennent du choix puis se désactivent pendant l'entrée", () => {
    const { root, view, button } = setup();
    const xr = vi.fn(), pc = vi.fn();
    view.onEnter(xr);
    view.onEnterPc(pc);
    button.click();
    expect(xr).toHaveBeenCalledOnce();
    root.querySelector<HTMLButtonElement>("button.enter-pc")?.click();
    expect(pc).toHaveBeenCalledOnce();
    expect(root.dataset["route"]).toBe(view.readRouteId());
    view.setEntering(true);
    expect([...root.querySelectorAll<HTMLButtonElement>("button")].every((b) => b.disabled)).toBe(true);
    view.setEntering(false);
    expect(button.disabled).toBe(false);
  });

  it("QUA-002: l'avis persiste indépendamment du statut, et peut s'effacer", () => {
    const { root, view } = setup();
    view.showNotice("Arbres simples");
    view.showStatus("Marche active");
    expect(root.querySelector("[role='alert']")?.textContent).toBe("Arbres simples");
    expect(root.querySelector("[role='status']")?.textContent).toBe("Marche active");
    view.showNotice("");
    expect(root.querySelector("[role='alert']")?.textContent).toBe("");
  });
});
