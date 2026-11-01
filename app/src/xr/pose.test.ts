import { describe, expect, it } from "vitest";
import { DEFAULT_ZONE } from "../safety/zone.ts";
import { PANEL_DISTANCE_M, PANEL_DROP_M, PANEL_SIDE_RAD, calibrationFrom, gazeYawRad, panelPlacement } from "./pose.ts";

/** Une zone loin de la tête : le panneau garde sa place nominale. */
const FAR_ZONE = { ...DEFAULT_ZONE, x: 50 };

/** Orientation de tête : cap `yawDeg` (positif : vers la gauche), puis inclinaison `pitchDeg` (négatif : tête baissée). */
function head(yawDeg: number, pitchDeg = 0) {
  const y = (yawDeg * Math.PI) / 360;
  const p = (pitchDeg * Math.PI) / 360;
  return { x: Math.cos(y) * Math.sin(p), y: Math.sin(y) * Math.cos(p), z: -Math.sin(y) * Math.sin(p), w: Math.cos(y) * Math.cos(p) };
}

describe("pose de la tête", () => {
  it("APP-002: lit le cap du regard, quelle que soit l'inclinaison de la tête", () => {
    expect(gazeYawRad(head(0))).toBeCloseTo(0);
    expect(gazeYawRad(head(90))).toBeCloseTo(Math.PI / 2);
    expect(gazeYawRad(head(-90, -20))).toBeCloseTo(-Math.PI / 2);
    expect(gazeYawRad(head(30, 25))).toBeCloseTo(Math.PI / 6);
  });

  it("APP-002: le recalage reprend l'endroit et le cap de la tête, sans toucher à la hauteur", () => {
    const c = calibrationFrom({ position: { x: 0.4, y: 1.6, z: -0.2 }, orientation: head(90) });
    expect(c.x).toBeCloseTo(0.4);
    expect(c.z).toBeCloseTo(-0.2);
    expect(c.yawRad).toBeCloseTo(Math.PI / 2);
    expect(Object.keys(c).sort()).toEqual(["x", "yawRad", "z"]);
  });

  it("APP-001: le panneau est en bas du champ de vision, côté choisi, à l'horizontale, tourné vers la tête", () => {
    const eyes = { x: 1, y: 1.6, z: 2 };
    const right = panelPlacement({ position: eyes, orientation: head(0) }, "right", FAR_ZONE);
    const left = panelPlacement({ position: eyes, orientation: head(0, -30) }, "left", FAR_ZONE);
    if (!right || !left) throw new Error("aucune place trouvée");
    expect(right.y).toBeCloseTo(eyes.y - PANEL_DROP_M);
    expect(left.y).toBeCloseTo(eyes.y - PANEL_DROP_M);
    expect(right.scale).toBe(1);
    // À 40° du regard, à PANEL_DISTANCE_M : à droite, +X ; à gauche, -X ; sans suivre l'inclinaison de la tête.
    expect(right.x - eyes.x).toBeCloseTo(Math.sin(PANEL_SIDE_RAD) * PANEL_DISTANCE_M);
    expect(left.x - eyes.x).toBeCloseTo(-Math.sin(PANEL_SIDE_RAD) * PANEL_DISTANCE_M);
    expect(right.z - eyes.z).toBeCloseTo(-Math.cos(PANEL_SIDE_RAD) * PANEL_DISTANCE_M);
    expect(right.yawRad).toBeCloseTo(-PANEL_SIDE_RAD);
    expect(left.yawRad).toBeCloseTo(PANEL_SIDE_RAD);
  });

  it("APP-001: le panneau suit le cap du regard", () => {
    // Tête tournée à gauche (+90°) : le côté droit du champ de vision est devant (-Z), le gauche derrière (+Z).
    const aside = panelPlacement({ position: { x: 0, y: 1.6, z: 0 }, orientation: head(90, -30) }, "right", FAR_ZONE);
    expect(aside?.x).toBeCloseTo(-Math.cos(PANEL_SIDE_RAD) * PANEL_DISTANCE_M);
    expect(aside?.z).toBeCloseTo(-Math.sin(PANEL_SIDE_RAD) * PANEL_DISTANCE_M);
  });

  it("APP-001: s'éloigne de la zone tapis sur son axe, en grandissant, et la quitte tout entier", () => {
    const place = panelPlacement({ position: { x: 0, y: 1.6, z: 0 }, orientation: head(0) }, "right", DEFAULT_ZONE);
    if (!place) throw new Error("aucune place trouvée");
    expect(place.scale).toBeGreaterThan(1);
    expect(Math.hypot(place.x, place.z) / place.scale).toBeCloseTo(PANEL_DISTANCE_M, 1);
  });

  it("APP-001: sans s'éloigner quand il passe entièrement au-dessus de la zone", () => {
    const low = { ...DEFAULT_ZONE, height: 0.5 };
    expect(panelPlacement({ position: { x: 0, y: 1.6, z: 0 }, orientation: head(0) }, "left", low)?.scale).toBe(1);
  });

  it("APP-001: ne se pose pas quand la zone ne laisse aucune place à portée", () => {
    const huge = { ...DEFAULT_ZONE, width: 40, depth: 40 };
    expect(panelPlacement({ position: { x: 0, y: 1.6, z: 0 }, orientation: head(0) }, "left", huge)).toBeUndefined();
  });
});
