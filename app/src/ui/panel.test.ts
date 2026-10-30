import { Window } from "happy-dom";
import { describe, expect, it } from "vitest";
import { renderWalkPanel } from "./panel.ts";

describe("panneau de marche", () => {
  it("affiche vitesse, distance, temps et opacité, avec leurs valeurs exactes", () => {
    const doc = new Window().document as unknown as Document;
    const root = doc.createElement("main");
    const panel = renderWalkPanel(doc, root);
    const info = { speedKmh: 4.1, distanceM: 12.34, timeS: 65, cityOpacity: 0.5 };
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
    panel.remove();
    expect(root.querySelector("[aria-label='Marche']")).toBeNull();
  });
});
