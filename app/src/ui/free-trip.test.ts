import { Window } from "happy-dom";
import { describe, expect, it, vi } from "vitest";
import type { PlannedTrip, TripPlanner } from "../city/free-route.ts";
import { bareSouq } from "../city/free-route.ts";
import type { LonLat } from "../route/geo.ts";
import { rejectWith } from "../route/reject-double.ts";
import { renderFreeTrip } from "./free-trip.ts";

const POINTS: LonLat[] = [[73.8567, 18.5204], [73.86, 18.522]];
const TRIP: PlannedTrip = { souq: bareSouq(POINTS), summary: "Trajet prêt : 0,3 km." };

function setup(over: Partial<TripPlanner> = {}) {
  const doc = new Window().document as unknown as Document;
  const find = vi.fn((text: string) => Promise.resolve({ point: POINTS[text === "arrivée" ? 1 : 0] as LonLat, label: `Adresse de ${text}` }));
  const plan = vi.fn<TripPlanner["plan"]>(() => Promise.resolve(TRIP));
  const planner: TripPlanner = {
    unavailable: undefined,
    find,
    describe: vi.fn((p: LonLat) => Promise.resolve(`Près de ${p[1].toFixed(2)}`)),
    plan,
    ...over,
  };
  const trip = renderFreeTrip(doc, planner);
  trip.setVisible(true);
  const el = trip.element;
  const button = (name: string) => [...el.querySelectorAll("button")].find((b) => b.textContent === name || b.getAttribute("aria-label") === name) as HTMLButtonElement;
  const input = (i: number) => el.querySelectorAll("input")[i] as HTMLInputElement;
  const message = () => el.querySelector(".free-message")?.textContent;
  const tap = (clientX: number, clientY: number) => {
    const view = el.querySelector(".map-view") as HTMLElement;
    view.dispatchEvent(new (doc.defaultView as unknown as { MouseEvent: typeof MouseEvent }).MouseEvent("click", { clientX, clientY }));
  };
  const settle = () => vi.waitFor(() => { expect(true).toBe(true); }).then(() => new Promise((r) => setTimeout(r, 0)));
  return { doc, find, plan, trip, el, button, input, message, tap, settle };
}

describe("itinéraire libre à l'accueil (QUA-020, services factices)", () => {
  it("QUA-002: sans clé, dit la raison, ne charge aucune carte et ne propose rien d'autre", () => {
    const { el, trip, message } = setup({ unavailable: "Itinéraire libre indisponible : aucune clé" });
    expect(message()).toBe("Itinéraire libre indisponible : aucune clé");
    expect(el.querySelector("img")).toBeNull();
    expect(el.querySelector("input")).toBeNull();
    expect(trip.readTrip()).toBeNull();
    trip.setVisible(false);
    expect(el.hidden).toBe(true);
  });

  it("deux touches posent le départ puis l'arrivée, et inscrivent l'adresse trouvée dans les champs", async () => {
    const { tap, input, message, settle, el } = setup();
    expect(message()).toContain("poser le départ");
    tap(320, 200);
    expect(input(0).value).toBe("18.5204, 73.8567");
    expect(message()).toContain("poser l'arrivée");
    await settle();
    expect(input(0).value).toBe("Près de 18.52");
    tap(400, 100);
    await settle();
    expect(message()).toContain("calculez le trajet");
    expect(el.querySelectorAll(".marker")).toHaveLength(2);
  });

  it("un troisième toucher recommence un trajet, et Effacer vide tout", async () => {
    const { tap, input, button, message, settle, el } = setup();
    tap(320, 200);
    tap(400, 100);
    tap(100, 100);
    expect(input(1).value).toBe("");
    expect(el.querySelectorAll(".marker")).toHaveLength(1);
    await settle();
    button("Effacer").click();
    expect(input(0).value).toBe("");
    expect(el.querySelectorAll(".marker")).toHaveLength(0);
    expect(message()).toContain("poser le départ");
  });

  it("une adresse validée place le point, l'affiche tel que trouvé et recentre la carte", async () => {
    const { input, button, message, settle, find, el } = setup();
    input(0).value = "départ";
    button("Chercher départ").click();
    await settle();
    expect(find).toHaveBeenCalledWith("départ");
    expect(input(0).value).toBe("Adresse de départ");
    expect(message()).toBe("Retenu : Adresse de départ. Départ posé. Touchez la carte pour poser l'arrivée, ou cherchez une adresse.");
    expect(el.querySelectorAll(".marker")).toHaveLength(1);
  });

  it("la touche Entrée lance la recherche, les autres non", async () => {
    const { input, find, settle, doc } = setup();
    const Keyboard = (doc.defaultView as unknown as { KeyboardEvent: typeof KeyboardEvent }).KeyboardEvent;
    input(1).dispatchEvent(new Keyboard("keydown", { key: "a" }));
    expect(find).not.toHaveBeenCalled();
    input(1).value = "arrivée";
    input(1).dispatchEvent(new Keyboard("keydown", { key: "Enter" }));
    await settle();
    expect(find).toHaveBeenCalledWith("arrivée");
  });

  it("QUA-002: dit l'adresse introuvable, la saisie vide ou le service refusé", async () => {
    const { input, button, message, settle } = setup({ find: vi.fn(() => Promise.reject(new Error("Adresse introuvable : « zzz »."))) });
    input(0).value = "zzz";
    button("Chercher départ").click();
    await settle();
    expect(message()).toBe("Adresse introuvable : « zzz ».");
    const odd = setup({ find: vi.fn(() => rejectWith("panne")) });
    odd.button("Chercher arrivée").click();
    await odd.settle();
    expect(odd.message()).toBe("panne");
  });

  it("calcule le trajet : ni départ ni arrivée, on le dit ; puis le trajet prêt se lit", async () => {
    const { input, button, message, settle, trip, plan } = setup();
    button("Calculer le trajet").click();
    expect(message()).toBe("Posez d'abord un départ et une arrivée.");
    input(0).value = "départ";
    button("Chercher départ").click();
    await settle();
    input(1).value = "arrivée";
    button("Chercher arrivée").click();
    await settle();
    button("Calculer le trajet").click();
    expect(message()).toBe("Calcul du trajet…");
    await settle();
    expect(message()).toBe("Trajet prêt : 0,3 km.");
    expect(trip.readTrip()).toBe(TRIP);
    expect(plan).toHaveBeenCalledWith(POINTS[0], POINTS[1]);
    // Changer un point invalide le trajet.
    button("Effacer").click();
    expect(trip.readTrip()).toBeNull();
  });

  it("QUA-002: dit l'échec du calcul (trop long, clé refusée) et n'en garde aucun trajet", async () => {
    const { input, button, message, settle, trip } = setup({ plan: vi.fn(() => Promise.reject(new Error("Trajet trop long : à vol d'oiseau 7,0 km, 5 km au plus."))) });
    for (const [i, name] of [[0, "départ"], [1, "arrivée"]] as const) {
      input(i).value = name;
      button(`Chercher ${name}`).click();
      await settle();
    }
    button("Calculer le trajet").click();
    await settle();
    expect(message()).toContain("Trajet trop long");
    expect(trip.readTrip()).toBeNull();
  });

  it("ignore un calcul dont les points ont changé entre-temps", async () => {
    let finish: (t: PlannedTrip) => void = () => undefined;
    const { input, button, settle, trip, message } = setup({ plan: vi.fn(() => new Promise<PlannedTrip>((r) => { finish = r; })) });
    for (const [i, name] of [[0, "départ"], [1, "arrivée"]] as const) {
      input(i).value = name;
      button(`Chercher ${name}`).click();
      await settle();
    }
    button("Calculer le trajet").click();
    button("Effacer").click();
    finish(TRIP);
    await settle();
    expect(trip.readTrip()).toBeNull();
    expect(message()).not.toBe("Trajet prêt : 0,3 km.");
  });

  it("n'écrase pas le champ si le point a été remplacé avant la réponse du géocodage inverse", async () => {
    let answer: (s: string) => void = () => undefined;
    const { tap, input, button, settle } = setup({ describe: vi.fn(() => new Promise<string>((r) => { answer = r; })) });
    tap(320, 200);
    button("Effacer").click();
    answer("Trop tard");
    await settle();
    expect(input(0).value).toBe("");
  });
});
