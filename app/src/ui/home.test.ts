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

  it("propose le rendu OpenStreetMap par défaut, Google 3D et, pour le souk, les matériaux locaux en option", () => {
    const { root, view } = setup();
    expect(view.readRendering()).toBe("osm");
    expect(view.readMaterials()).toBeUndefined();
    expect([...root.querySelectorAll(".rendering label")].map((l) => l.textContent.trim())).toEqual(["OpenStreetMap", "Google 3D", "Matériaux locaux (prototype)"]);
  });

  it("APP-012: les matériaux locaux se choisissent pour le souk seulement ; un autre itinéraire cache l'option et revient à OpenStreetMap", () => {
    const { root, view } = setup();
    const pick = (name: string, value: string): void => {
      root.querySelector<HTMLInputElement>(`input[name='${name}'][value='${value}']`)?.click();
    };
    const option = root.querySelector<HTMLInputElement>("input[name='rendu'][value='materiaux']")?.closest("label");
    expect(option?.hidden).toBe(false);
    pick("rendu", "materiaux");
    expect(view.readRendering()).toBe("osm");
    expect(view.readMaterials()?.library.itinerary).toBe("doha-souq-waqif");
    expect(view.readMaterials()?.library.provisional).toBe(true);
    pick("itineraire", "pune-fc-road");
    expect(option?.hidden).toBe(true);
    expect(view.readMaterials()).toBeUndefined();
    expect(root.querySelector<HTMLInputElement>("input[name='rendu'][value='osm']")?.checked).toBe(true);
  });

  it("propose 4,0 km/h par défaut, réglable dès 1 km/h, sans maximum, par pas de 0,1", () => {
    const { view, input } = setup();
    const speed = input("Vitesse de départ");
    expect([speed.value, speed.min, speed.max, speed.step]).toEqual(["4.0", "1", "", "0.1"]);
    expect(view.readSpeedKmh()).toBe(4);
    speed.value = "5,5";
    expect(view.readSpeedKmh()).toBe(5.5);
  });

  it("QUA-002: lit le minimum avant la saisie, accepte 50 sans message et dit l'illisible", () => {
    const { root, view, input } = setup();
    const speed = input("Vitesse de départ");
    expect(root.querySelector(".speed-hint")?.textContent).toBe("À partir de 1 km/h.");
    const limit = root.querySelector<HTMLElement>(".speed-limit");
    expect(limit?.textContent).toBe("");
    speed.value = "50";
    speed.dispatchEvent(new DomEvent("input") as unknown as Event);
    expect(limit?.textContent).toBe("");
    expect(view.readSpeedKmh()).toBe(50);
    speed.dispatchEvent(new DomEvent("change") as unknown as Event);
    expect(speed.value).toBe("50.0");
    speed.value = "6";
    speed.dispatchEvent(new DomEvent("input") as unknown as Event);
    expect(limit?.textContent).toBe("");
    speed.value = "0,2";
    expect(view.readSpeedKmh()).toBe(1);
    expect(limit?.textContent).toContain("0,2 km/h est sous la limite");
  });

  it("APP-006: le profil graphique remplace la case des contours : équilibré par défaut, proposé par l'appareil, choisi à la main", () => {
    const { root, view } = setup();
    expect(root.textContent).not.toContain("Contours des bâtiments");
    expect(view.readProfile()).toBe("equilibre");
    view.proposeProfile("qualite");
    expect(view.readProfile()).toBe("qualite");
    root.querySelector<HTMLInputElement>("input[value='performance']")?.click();
    expect(view.readProfile()).toBe("performance");
    view.proposeProfile("qualite");
    expect(view.readProfile()).toBe("performance");
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

  it("APP-002: le bouton « Version PC » est distinct de celui du casque, prévient au clic et se désactive avec lui", () => {
    const { root, view, button } = setup();
    const pcButton = root.querySelector<HTMLButtonElement>("button.enter-pc");
    const headset = vi.fn();
    const pc = vi.fn();
    view.onEnter(headset);
    view.onEnterPc(pc);
    expect(pcButton?.textContent).toBe("Version PC");
    expect(pcButton).not.toBe(button);
    pcButton?.click();
    expect(pc).toHaveBeenCalledOnce();
    expect(headset).not.toHaveBeenCalled();
    expect(root.dataset["route"]).toBeTruthy();
    view.setEntering(true);
    expect([button.disabled, pcButton?.disabled]).toEqual([true, true]);
    view.setEntering(false);
    expect([button.disabled, pcButton?.disabled]).toEqual([false, false]);
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

  it("APP-011: le brouillard arrive éteint et les sons coupés, et se règlent à l'accueil", () => {
    const { view, input } = setup();
    expect(view.readFog()).toBe(false);
    expect(view.readSoundPct()).toBe(0);
    const fog = input("Brouillard");
    fog.checked = true;
    expect(view.readFog()).toBe(true);
    const sound = input("Sons d'ambiance");
    expect(sound.min).toBe("0");
    sound.value = "40";
    expect(view.readSoundPct()).toBe(40);
    // Coupés d'un geste : le curseur revient à zéro, le son avec lui.
    sound.value = "0";
    expect(view.readSoundPct()).toBe(0);
  });

  it("APP-011: aucun réglage d'ambiance n'est gardé : un nouvel accueil arrive sans brouillard ni son", () => {
    const storage = memory();
    const first = setup(storage);
    first.input("Brouillard").checked = true;
    first.input("Sons d'ambiance").value = "100";
    const second = setup(storage);
    expect(second.view.readFog()).toBe(false);
    expect(second.view.readSoundPct()).toBe(0);
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
