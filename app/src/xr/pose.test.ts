import { describe, expect, it } from "vitest";
import { PANEL_DISTANCE_M, PANEL_DROP_M, calibrationFrom, gazeYawRad, panelPlacement } from "./pose.ts";

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

  it("APP-001: le panneau est à l'horizontale devant le regard, sous les yeux, tourné vers soi", () => {
    const ahead = panelPlacement({ position: { x: 0, y: 1.6, z: 0 }, orientation: head(0) });
    expect(ahead).toMatchObject({ y: 1.6 - PANEL_DROP_M, yawRad: 0 });
    expect(ahead.x).toBeCloseTo(0);
    expect(ahead.z).toBeCloseTo(-PANEL_DISTANCE_M);
    // Tête tournée à gauche (+90°) : le panneau passe à gauche (-X), sans suivre l'inclinaison.
    const left = panelPlacement({ position: { x: 1, y: 1.5, z: 2 }, orientation: head(90, -30) });
    expect(left.x).toBeCloseTo(1 - PANEL_DISTANCE_M);
    expect(left.z).toBeCloseTo(2);
    expect(left.y).toBe(1.5 - PANEL_DROP_M);
  });
});
