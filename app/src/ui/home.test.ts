import { Event as DomEvent, Window } from "happy-dom";
import { describe, expect, it, vi } from "vitest";
import type { TripPlanner } from "../city/free-route.ts";
import { WEIGHT_STORAGE_KEY, type WeightStorage } from "../route/stats.ts";
import { ENTER_LABEL, renderHome } from "./home.ts";

export const planner: TripPlanner = {
  find: () => Promise.reject(new Error("jamais")),
  describe: () => Promise.reject(new Error("jamais")),
  plan: () => Promise.reject(new Error("jamais")),
};

function memory(initial?: string): WeightStorage & { data: Map<string, string> } {
  const data = new Map<string, string>(initial === undefined ? [] : [[WEIGHT_STORAGE_KEY, initial]]);
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v), removeItem: (k) => void data.delete(k) };
}

function setup(storage?: WeightStorage) {
  const window = new Window();
  const doc = window.document as unknown as Document;
  const root = doc.createElement("main");
  doc.body.append(root);
  const view = renderHome(doc, root, planner, storage);
  const input = (label: string) => {
    const found = [...root.querySelectorAll("label")].find((l) => l.textContent.includes(label));
    const el = found?.querySelector("input");
    if (!el) throw new Error(`champ « ${label} » introuvable`);
    return el;
  };
  const button = root.querySelector<HTMLButtonElement>("button.enter");
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

  it("QUA-020: la carte de l'itinéraire libre n'apparaît qu'avec la carte « Itinéraire libre »", () => {
    const { root, view } = setup();
    const section = root.querySelector<HTMLElement>(".free-trip");
    expect(section?.hidden).toBe(true);
    root.querySelector<HTMLInputElement>("input[value='libre']")?.click();
    expect(section?.hidden).toBe(false);
    expect(section?.textContent).toContain("Touchez la carte pour poser le départ");
    expect(view.readTrip()).toBeNull();
    root.querySelector<HTMLInputElement>("input[value='pune-fc-road']")?.click();
    expect(section?.hidden).toBe(true);
  });

  it("APP-003: montre la mention des contributeurs OpenStreetMap", () => {
    const { root } = setup();
    expect(root.querySelector(".attribution")?.textContent).toBe("© contributeurs OpenStreetMap · Google");
  });

  it("APP-003: ajoute la mention de Google à celle d'OpenStreetMap quand le rendu Google est choisi", () => {
    const { root } = setup();
    const google = root.querySelector<HTMLElement>(".attribution-google");
    expect(google?.hidden).toBe(true);
    const radio = (value: string) => root.querySelector<HTMLInputElement>(`input[name='rendu'][value='${value}']`);
    const choose = (value: string) => {
      radio(value)?.click();
    };
    choose("google");
    expect(google?.hidden).toBe(false);
    expect(root.querySelector(".attribution")?.textContent).toBe("© contributeurs OpenStreetMap · Google");
    choose("osm");
    expect(google?.hidden).toBe(true);
  });

  it("QUA-002: garde un message à part du statut, effaçable", () => {
    const { root, view } = setup();
    view.showNotice("Rendu Google 3D indisponible");
    view.showStatus("Réalité mixte active");
    expect(root.querySelector("[role='alert']")?.textContent).toBe("Rendu Google 3D indisponible");
    view.showNotice("");
    expect(root.querySelector("[role='alert']")?.textContent).toBe("");
  });

  it("propose le rendu OpenStreetMap par défaut, et Google 3D en option", () => {
    const { root, view } = setup();
    expect(view.readRendering()).toBe("osm");
    expect([...root.querySelectorAll(".rendering label")].map((l) => l.textContent.trim())).toEqual(["OpenStreetMap", "Google 3D"]);
  });

  it("propose 4,0 km/h par défaut, réglable de 1 à 8 km/h par pas de 0,1", () => {
    const { view, input } = setup();
    const speed = input("Vitesse de départ");
    expect([speed.value, speed.min, speed.max, speed.step]).toEqual(["4.0", "1", "8", "0.1"]);
    expect(view.readSpeedKmh()).toBe(4);
    speed.value = "5,5";
    expect(view.readSpeedKmh()).toBe(5.5);
  });

  it("QUA-002: lit la plage de vitesse avant la saisie et dit la limite quand 50 est saisi", () => {
    const { root, view, input } = setup();
    const speed = input("Vitesse de départ");
    expect(root.querySelector(".speed-hint")?.textContent).toBe("De 1 à 8 km/h, par sécurité sur le tapis.");
    const limit = root.querySelector<HTMLElement>(".speed-limit");
    expect(limit?.textContent).toBe("");
    speed.value = "50";
    speed.dispatchEvent(new DomEvent("input") as unknown as Event);
    expect(limit?.textContent).toBe("50 km/h dépasse la limite : 8,0 km/h retenus, par sécurité sur le tapis.");
    speed.dispatchEvent(new DomEvent("change") as unknown as Event);
    expect(speed.value).toBe("8.0");
    speed.value = "6";
    speed.dispatchEvent(new DomEvent("input") as unknown as Event);
    expect(limit?.textContent).toBe("");
    speed.value = "0,2";
    expect(view.readSpeedKmh()).toBe(1);
    expect(limit?.textContent).toContain("0,2 km/h est sous la limite");
  });

  it("QUA-020: les contours des bâtiments sont décochés par défaut et se cochent", () => {
    const { view, input } = setup();
    const outlines = input("Contours des bâtiments");
    expect(view.readOutlines()).toBe(false);
    outlines.checked = true;
    expect(view.readOutlines()).toBe(true);
  });

  it("APP-001: la vignette réelle est cochée par défaut et se décoche", () => {
    const { view, input } = setup();
    const vignette = input("Vignette réelle");
    expect(view.readVignette()).toBe(true);
    vignette.checked = false;
    expect(view.readVignette()).toBe(false);
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

  it("SEC-007: le poids est facultatif, se garde dans le navigateur à la saisie et se relit à l'accueil suivant", () => {
    const storage = memory();
    const { view, input } = setup(storage);
    const weight = input("Poids");
    expect(view.readWeightKg()).toBeUndefined();
    weight.value = "72,5";
    weight.dispatchEvent(new DomEvent("change") as unknown as Event);
    expect(view.readWeightKg()).toBe(72.5);
    expect(storage.data.get(WEIGHT_STORAGE_KEY)).toBe("72.5");
    expect(setup(storage).input("Poids").value).toBe("72.5");
  });

  it("SEC-007: un poids invalide ou vidé n'est pas gardé, l'ancien est effacé", () => {
    const storage = memory("80");
    const { view, input } = setup(storage);
    const weight = input("Poids");
    expect(view.readWeightKg()).toBe(80);
    weight.value = "5";
    weight.dispatchEvent(new DomEvent("change") as unknown as Event);
    expect(view.readWeightKg()).toBeUndefined();
    expect(storage.data.size).toBe(0);
  });

  it("SEC-007: le bouton « Effacer mon poids » vide le champ et le stockage", () => {
    const storage = memory("80");
    const { root, view } = setup(storage);
    const erase = [...root.querySelectorAll("button")].find((b) => b.textContent === "Effacer mon poids");
    erase?.click();
    expect(view.readWeightKg()).toBeUndefined();
    expect(storage.data.size).toBe(0);
    expect(root.querySelector("[role='alert']")?.textContent).toBe("");
  });

  it("QUA-002: dit que le poids ne sera pas gardé si le navigateur refuse ou n'a pas de stockage", () => {
    const { root, view, input } = setup();
    const weight = input("Poids");
    weight.value = "70";
    weight.dispatchEvent(new DomEvent("change") as unknown as Event);
    expect(view.readWeightKg()).toBe(70);
    expect(root.querySelector("[role='alert']")?.textContent).toContain("seulement pour cette séance");
  });
});
