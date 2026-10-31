import { Window } from "happy-dom";
import { describe, expect, it } from "vitest";
import { renderWalkPanel } from "./panel.ts";

describe("panneau de marche", () => {
  it("APP-003: affiche vitesse, distance, temps, opacité et les mentions de données, avec les valeurs exactes", () => {
    const doc = new Window().document as unknown as Document;
    const root = doc.createElement("main");
    const panel = renderWalkPanel(doc, root);
    const info = { speedKmh: 4.1, distanceM: 12.34, timeS: 65, cityOpacity: 0.5, position: { x: 3, z: -4 }, buildingCount: 253,
      rendering: "google" as const, tileCount: 7, attribution: "© contributeurs OpenStreetMap · Google", arrived: false,
      paused: false, showPanel: true, calibration: { x: 0, z: 0, yawRad: 0 } };
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
    expect(section?.getAttribute("data-rendering")).toBe("google");
    expect(section?.getAttribute("data-tile-count")).toBe("7");
    expect(section?.querySelector(".attribution")?.textContent).toBe("© contributeurs OpenStreetMap · Google");
    expect(section?.querySelector<HTMLElement>(".arrival")?.hidden).toBe(true);
    expect(section?.getAttribute("data-arrived")).toBe("false");
    panel.update({ ...info, arrived: true });
    expect(section?.querySelector<HTMLElement>(".arrival")?.hidden).toBe(false);
    expect(section?.querySelector(".arrival")?.textContent).toContain("Arrivée");
    expect(section?.getAttribute("data-paused")).toBe("false");
    expect(section?.getAttribute("data-hud-visible")).toBe("true");
    expect(section?.querySelector<HTMLElement>(".paused")?.hidden).toBe(true);
    panel.update({ ...info, paused: true, showPanel: false, calibration: { x: 0.3, z: -0.5, yawRad: 1.5 } });
    expect(section?.querySelector<HTMLElement>(".paused")?.hidden).toBe(false);
    expect(section?.getAttribute("data-hud-visible")).toBe("false");
    expect([section?.getAttribute("data-calibration-x"), section?.getAttribute("data-calibration-z"), section?.getAttribute("data-calibration-yaw")]).toEqual(["0.3", "-0.5", "1.5"]);
    panel.remove();
    expect(root.querySelector("[aria-label='Marche']")).toBeNull();
  });

  it("QUA-002: dit la limite quand la vitesse est à la borne, et l'efface sinon", () => {
    const doc = new Window().document as unknown as Document;
    const root = doc.createElement("main");
    const panel = renderWalkPanel(doc, root);
    const info = { speedKmh: 8, distanceM: 0, timeS: 0, cityOpacity: 1, position: { x: 0, z: 0 }, buildingCount: 1,
      rendering: "osm" as const, tileCount: 0, attribution: "", arrived: false,
      paused: false, showPanel: true, calibration: { x: 0, z: 0, yawRad: 0 } };
    const limit = () => root.querySelector<HTMLElement>(".speed-limit");
    panel.update(info);
    expect(limit()?.hidden).toBe(false);
    expect(limit()?.textContent).toBe("Vitesse au maximum : 8 km/h, limite de sécurité sur le tapis.");
    panel.update({ ...info, speedKmh: 7.9 });
    expect(limit()?.hidden).toBe(true);
    panel.update({ ...info, speedKmh: 1 });
    expect(limit()?.textContent).toBe("Vitesse au minimum : 1 km/h.");
  });
});
