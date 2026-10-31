import type { Scene } from "three";
import { describe, expect, it, vi } from "vitest";
import { ACTIVE_STATUS } from "./experience.ts";
import { poseFrame, setup } from "./experience-double.ts";

/** Le tracé (73.8567 18.5204) (73.858 18.521) (73.86 18.522), encodé comme Valhalla. */
const SHAPE = "_tkib@wjzzkCod@gpAo}@_|B";
const way = { type: "way", id: 1, tags: { building: "yes" }, geometry: [{ lat: 18.52, lon: 73.857 }, { lat: 18.5201, lon: 73.857 }, { lat: 18.5201, lon: 73.8571 }, { lat: 18.52, lon: 73.857 }] };

/** Routage, adresses et Overpass, factices : aucun réseau. */
const network = () =>
  vi.fn((url: string) => {
    const host = new URL(url).host;
    if (host === "valhalla1.openstreetmap.de") {
      return Promise.resolve(Response.json({ trip: { summary: { length: 0.45 }, legs: [{ shape: SHAPE }] } }));
    }
    if (host === "photon.komoot.io") {
      const near = url.includes("q=arriv");
      const coordinates = near ? [73.86, 18.522] : [73.8567, 18.5204];
      return Promise.resolve(Response.json({ features: [{ geometry: { coordinates }, properties: { name: near ? "Arrivée" : "Départ" } }] }));
    }
    return Promise.resolve(Response.json({ elements: [way] }));
  }) as unknown as typeof fetch;

async function prepared(options: Parameters<typeof setup>[0] = {}) {
  const t = setup({ fetch: network(), ...options });
  const free = t.root.querySelector<HTMLInputElement>("input[value='libre']");
  free?.click();
  const field = (i: number) => t.root.querySelectorAll<HTMLInputElement>(".free-trip input[type='text']")[i] as HTMLInputElement;
  const press = (name: string) => [...t.root.querySelectorAll("button")].find((b) => b.textContent === name || b.getAttribute("aria-label") === name)?.click();
  field(0).value = "départ";
  press("Chercher départ");
  field(1).value = "arrivée";
  press("Chercher arrivée");
  await vi.waitFor(() => { expect(t.root.querySelectorAll(".marker")).toHaveLength(2); });
  press("Calculer le trajet");
  await vi.waitFor(() => { expect(t.root.querySelector(".free-message")?.textContent).toContain("Trajet prêt"); });
  return t;
}

describe("itinéraire libre en marche (QUA-020, services factices)", () => {
  it("QUA-002: sans trajet préparé, le dit et n'ouvre aucune session", async () => {
    const t = setup();
    t.root.querySelector<HTMLInputElement>("input[value='libre']")?.click();
    await t.enter();
    expect(t.status()).toContain("posez un départ et une arrivée");
    expect(t.xr.requestSession).not.toHaveBeenCalled();
  });

  it("QUA-020: sans aucune clé, l'itinéraire libre est proposé et les services ouverts sont ceux interrogés", async () => {
    const fetchFn = network();
    const t = await prepared({ fetch: fetchFn });
    const hosts = (fetchFn as unknown as { mock: { calls: [string][] } }).mock.calls.map(([url]) => new URL(url).host);
    expect(hosts).toContain("valhalla1.openstreetmap.de");
    expect(hosts).toContain("photon.komoot.io");
    expect(hosts.some((host) => host.endsWith("googleapis.com"))).toBe(false);
    t.root.querySelector<HTMLInputElement>("input[value='pune-fc-road']")?.click();
    await t.enter();
    expect(t.status()).toBe(ACTIVE_STATUS);
  });

  it("APP-002: marche le long du trajet calculé, s'arrête à l'arrivée et le dit sur la page et dans le casque", async () => {
    const t = await prepared();
    await t.enter();
    expect(t.status()).toBe(ACTIVE_STATUS);
    t.frame(0, poseFrame(0));
    t.frame(10_000, poseFrame(0));
    expect(t.panel()?.getAttribute("data-arrived")).toBe("false");
    const label = () => (t.fake.render.mock.calls.at(-1)?.[0] as Scene | undefined)?.getObjectByName("arrivee")?.visible;
    expect(label()).toBe(false);
    t.frame(900_000, poseFrame(0));
    const length = Number(t.panel()?.getAttribute("data-distance-m"));
    expect(length).toBeGreaterThan(100);
    expect(t.panel()?.getAttribute("data-arrived")).toBe("true");
    expect(t.panel()?.querySelector<HTMLElement>(".arrival")?.hidden).toBe(false);
    expect(label()).toBe(true);
    t.frame(1_800_000, poseFrame(0));
    expect(Number(t.panel()?.getAttribute("data-distance-m"))).toBe(length);
    // La position reste à l'arrivée : elle ne reprend pas au départ.
    expect(Number(t.panel()?.getAttribute("data-position-x"))).toBeGreaterThan(100);
  });

  it("tête baissée sur un trajet libre, la ville (et le message) s'efface", async () => {
    const t = await prepared();
    await t.enter();
    t.frame(0, poseFrame(0));
    t.frame(1000, poseFrame(-45));
    expect(t.panel()?.getAttribute("data-city-opacity")).toBe("0");
  });

  it("APP-003: la ville est celle des bâtiments OpenStreetMap chargés pour le trajet", async () => {
    const t = await prepared();
    await t.enter();
    t.frame(0, poseFrame(0));
    expect(t.panel()?.getAttribute("data-building-count")).toBe("1");
    expect(t.panel()?.getAttribute("data-rendering")).toBe("osm");
  });
});
