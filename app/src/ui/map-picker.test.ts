import { Window } from "happy-dom";
import { describe, expect, it, vi } from "vitest";
import type { LonLat } from "../route/geo.ts";
import { MAP_HEIGHT_PX, MAP_WIDTH_PX, createMapPicker } from "./map-picker.ts";

const setup = () => {
  const doc = new Window().document as unknown as Document;
  const onPick = vi.fn<(p: LonLat) => void>();
  const picker = createMapPicker(doc, onPick);
  const tiles = () => [...picker.element.querySelectorAll("img")].map((i) => i.src);
  const press = (label: string) => [...picker.element.querySelectorAll("button")].find((b) => b.getAttribute("aria-label") === label)?.click();
  return { doc, onPick, picker, tiles, press };
};

describe("carte de l'accueil (QUA-020)", () => {
  it("n'appelle aucune tuile tant que la carte n'est pas ouverte, puis montre OpenStreetMap et sa mention", () => {
    const { picker, tiles } = setup();
    expect(tiles()).toEqual([]);
    expect(picker.element.querySelector(".map-credit")).toBeNull();
    picker.show();
    picker.show();
    expect(picker.element.querySelectorAll(".map-credit")).toHaveLength(1);
    expect(picker.element.querySelector(".map-credit")?.textContent).toBe("© contributeurs OpenStreetMap");
    expect(tiles().length).toBeGreaterThan(0);
    expect(tiles().every((u) => u.startsWith("https://tile.openstreetmap.org/14/"))).toBe(true);
  });

  it("zoome et se déplace par boutons, dans les bornes", () => {
    const { picker, tiles, press } = setup();
    picker.show();
    press("Zoom avant");
    expect(tiles()[0]).toContain("/15/");
    for (let i = 0; i < 20; i++) press("Zoom arrière");
    expect(tiles()[0]).toContain("/2/");
    for (let i = 0; i < 20; i++) press("Zoom avant");
    expect(tiles()[0]).toContain("/18/");
    const place = () => picker.element.querySelector("img")?.style.cssText;
    const before = place();
    for (const label of ["Carte vers l'ouest", "Carte vers le nord", "Carte vers le sud", "Carte vers l'est"]) press(label);
    expect(place()).toBe(before);
    press("Carte vers le nord");
    expect(place()).not.toBe(before);
  });

  it("ne dépasse pas les pôles en se déplaçant", () => {
    const { picker, tiles, press } = setup();
    picker.show();
    for (let i = 0; i < 20; i++) press("Zoom arrière");
    for (let i = 0; i < 10; i++) press("Carte vers le nord");
    expect(tiles().length).toBeGreaterThan(0);
  });

  it("un toucher rend le point sous le doigt : le centre de la carte est le centre de la vue", () => {
    const { picker, onPick } = setup();
    picker.show();
    const view = picker.element.querySelector(".map-view") as HTMLElement;
    view.dispatchEvent(new (view.ownerDocument.defaultView as unknown as { MouseEvent: typeof MouseEvent }).MouseEvent("click", { clientX: MAP_WIDTH_PX / 2, clientY: MAP_HEIGHT_PX / 2 }));
    const [lon, lat] = onPick.mock.calls[0]?.[0] as LonLat;
    expect(lon).toBeCloseTo(73.8567, 4);
    expect(lat).toBeCloseTo(18.5204, 4);
  });

  it("pose les repères A et B, les retire, et recentre", () => {
    const { picker, press } = setup();
    picker.setMarker("from", [73.8567, 18.5204]);
    expect(picker.element.querySelector(".marker")).toBeNull();
    picker.show();
    picker.setMarker("from", [73.8567, 18.5204]);
    picker.setMarker("to", [73.858, 18.521]);
    expect([...picker.element.querySelectorAll(".marker")].map((m) => m.textContent)).toEqual(["A", "B"]);
    picker.setMarker("to", null);
    expect(picker.element.querySelectorAll(".marker")).toHaveLength(1);
    picker.centerOn([51.5, 25.3]);
    press("Zoom avant");
    expect(picker.element.querySelector("img")?.src).toContain("/15/");
    expect(picker.element.querySelector<HTMLElement>(".marker")?.style.left).not.toBe("");
  });
});
