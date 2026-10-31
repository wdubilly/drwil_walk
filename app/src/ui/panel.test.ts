import { Window } from "happy-dom";
import { describe, expect, it } from "vitest";
import { renderWalkPanel } from "./panel.ts";

describe("panneau de marche", () => {
  it("APP-003: affiche vitesse, distance, temps, opacité et la mention OpenStreetMap, avec les valeurs exactes", () => {
    const doc = new Window().document as unknown as Document;
    const root = doc.createElement("main");
    const panel = renderWalkPanel(doc, root);
    const info = { speedKmh: 4.1, distanceM: 12.34, timeS: 65, cityOpacity: 0.5, position: { x: 3, z: -4 }, buildingCount: 253 };
    panel.update(info);
    panel.update(info);
    const section = root.querySelector("[aria-label='Marche']");
    const text = (field: string) => section?.querySelector(`[data-field='${field}']`)?.textContent;
    expect(text("speed")).toBe("4,1 km/h");
    expect(text("distance")).toBe("12,3 m");
    expect(text("time")).toBe("1 min 05 s");
    expect(text("opacity")).toBe("50 %");
    expect(section?.getAttribute("data-distance-m")).toBe("12.34");
    expect(section?.getAttribute("data-speed-kmh")).toBe("4.1");
    expect(section?.getAttribute("data-time-s")).toBe("65");
    expect(section?.getAttribute("data-city-opacity")).toBe("0.5");
    expect([section?.getAttribute("data-position-x"), section?.getAttribute("data-position-z")]).toEqual(["3", "-4"]);
    expect(section?.getAttribute("data-building-count")).toBe("253");
    expect(section?.querySelector(".attribution")?.textContent).toBe("© contributeurs OpenStreetMap");
    panel.remove();
    expect(root.querySelector("[aria-label='Marche']")).toBeNull();
  });
});
