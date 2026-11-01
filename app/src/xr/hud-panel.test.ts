import { Window } from "happy-dom";
import { Box3 } from "three";
import { describe, expect, it, vi } from "vitest";
import { withCanvasContext } from "../city/canvas-double.ts";
import { createHudPanel, type HudInfo } from "./hud-panel.ts";
import { DEFAULT_ZONE } from "../safety/zone.ts";
import { PANEL_DISTANCE_M } from "./pose.ts";

const info: HudInfo = {
  speedKmh: 4, distanceM: 12.34, timeS: 65, kcal: 7.4, compass: "NE 45°", clock: "09:05", place: "Doha Souq Waqif", paused: false,
};
const pose = { position: { x: 0, y: 1.6, z: 0 }, orientation: { x: 0, y: 0, z: 0, w: 1 } };

function setup() {
  const context = { fillRect: vi.fn(), fillText: vi.fn() };
  const doc = withCanvasContext(new Window().document as unknown as Document, context);
  return { panel: createHudPanel(doc), context, doc };
}

describe("panneau d'infos dans le casque", () => {
  it("APP-002: dessine boussole, heure, lieu, vitesse, durée, distance et calories « environ »", () => {
    const { panel, context } = setup();
    panel.update(info, { show: true, opacity: 1, pose });
    const lines = context.fillText.mock.calls.map((call) => call[0] as string);
    expect(lines).toEqual(["NE 45°", "09:05", "Doha Souq Waqif", "4,0 km/h", "1 min 05 s", "12,3 m", "environ 7 kcal"]);
  });

  it("APP-002: dit la pause avec la vitesse", () => {
    const { panel, context } = setup();
    panel.update({ ...info, paused: true }, { show: true, opacity: 1, pose });
    expect(context.fillText.mock.calls[3]?.[0]).toBe("4,0 km/h · PAUSE");
  });

  it("n'est redessiné que lorsqu'une valeur affichée change", () => {
    const { panel, context } = setup();
    panel.update(info, { show: true, opacity: 1, pose });
    panel.update({ ...info, distanceM: 12.341 }, { show: true, opacity: 0.5, pose });
    expect(context.fillRect).toHaveBeenCalledTimes(1);
    panel.update({ ...info, distanceM: 12.5 }, { show: true, opacity: 1, pose });
    expect(context.fillRect).toHaveBeenCalledTimes(2);
    panel.update({ ...info, distanceM: 12.5, clock: "09:06" }, { show: true, opacity: 1, pose });
    expect(context.fillRect).toHaveBeenCalledTimes(3);
    panel.update({ ...info, distanceM: 12.5, clock: "09:06", kcal: 7.6 }, { show: true, opacity: 1, pose });
    expect(context.fillRect).toHaveBeenCalledTimes(4);
  });

  it("APP-001: suit le fondu de la ville et disparaît à opacité nulle", () => {
    const { panel } = setup();
    const material = panel.mesh.material as { opacity: number; transparent: boolean };
    panel.update(info, { show: true, opacity: 0.5, pose });
    expect(panel.mesh.visible).toBe(true);
    expect(material).toMatchObject({ opacity: 0.5, transparent: true });
    panel.update(info, { show: true, opacity: 0, pose });
    expect(panel.mesh.visible).toBe(false);
    panel.update(info, { show: true, opacity: 1, pose });
    expect(material.transparent).toBe(false);
  });

  it("APP-001: reste caché sans pose, ou quand le bouton B l'a masqué", () => {
    const { panel } = setup();
    panel.update(info, { show: true, opacity: 1, pose: undefined });
    expect(panel.mesh.visible).toBe(false);
    panel.update(info, { show: false, opacity: 1, pose });
    expect(panel.mesh.visible).toBe(false);
  });

  it("se pose devant le regard, borné dans le champ de vision", () => {
    const { panel } = setup();
    panel.update(info, { show: true, opacity: 1, pose });
    expect(panel.mesh.position.z).toBeCloseTo(-PANEL_DISTANCE_M);
    expect(panel.mesh.position.y).toBeLessThan(1.6);
    expect(panel.mesh.position.y).toBeGreaterThan(1.6 - 0.3);
  });

  it("APP-001: reste au-dessus de la zone tapis par défaut, dans le champ de vision", () => {
    const { panel } = setup();
    panel.update(info, { show: true, opacity: 1, pose });
    const box = new Box3().setFromObject(panel.mesh);
    expect(box.min.y).toBeGreaterThan(DEFAULT_ZONE.height);
    expect(box.max.y).toBeLessThan(pose.position.y);
    expect(box.max.x - box.min.x).toBeLessThan(0.61);
  });

  it("dit pourquoi il ne peut pas se dessiner sans contexte canvas", () => {
    const doc = withCanvasContext(new Window().document as unknown as Document, null);
    expect(() => createHudPanel(doc)).toThrow("Canvas 2D indisponible");
  });
});
