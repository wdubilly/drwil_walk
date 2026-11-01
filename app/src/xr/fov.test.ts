import { describe, expect, it } from "vitest";
import { FOV_MARGIN, QUEST3_FOV, pointInView, rectCorners, rectInView, visibilityMask, type SceneRect } from "./fov.ts";
import type { HeadPose } from "./pose.ts";

const deg = (d: number): number => (d * Math.PI) / 180;

/** Tête en `position`, tournée de `yaw` à gauche (autour de Y) puis relevée de `pitch` (autour de X), en degrés. */
function head(yaw: number, pitch = 0, position = { x: 0, y: 0, z: 0 }): HeadPose {
  const [sy, cy] = [Math.sin(deg(yaw) / 2), Math.cos(deg(yaw) / 2)];
  const [sx, cx] = [Math.sin(deg(pitch) / 2), Math.cos(deg(pitch) / 2)];
  return { position, orientation: { x: cy * sx, y: sy * cx, z: -sy * sx, w: cy * cx } };
}

/** Un point à 1 m devant le regard, décalé de `azimuth` à droite et `elevation` en haut, en degrés (axes de la tête). */
const ahead = (azimuth: number, elevation = 0) => ({ x: Math.tan(deg(azimuth)), y: Math.tan(deg(elevation)), z: -1 });

const halfH = QUEST3_FOV.horizontalDeg / 2;
const halfV = QUEST3_FOV.verticalDeg / 2;
const limitH = halfH * FOV_MARGIN;
const limitV = halfV * FOV_MARGIN;

describe("APP-004: un point dans la vue de la tête", () => {
  it("APP-004: le regard droit devant est dans la vue", () => {
    expect(pointInView(head(0), ahead(0))).toBe(true);
  });

  it("APP-004: juste dedans et juste dehors, à droite et à gauche, marge comprise", () => {
    expect(pointInView(head(0), ahead(limitH - 0.5))).toBe(true);
    expect(pointInView(head(0), ahead(limitH + 0.5))).toBe(false);
    expect(pointInView(head(0), ahead(-(limitH - 0.5)))).toBe(true);
    expect(pointInView(head(0), ahead(-(limitH + 0.5)))).toBe(false);
  });

  it("APP-004: juste dedans et juste dehors, en haut et en bas", () => {
    expect(pointInView(head(0), ahead(0, limitV - 0.5))).toBe(true);
    expect(pointInView(head(0), ahead(0, limitV + 0.5))).toBe(false);
    expect(pointInView(head(0), ahead(0, -(limitV - 0.5)))).toBe(true);
    expect(pointInView(head(0), ahead(0, -(limitV + 0.5)))).toBe(false);
  });

  it("APP-004: sans marge, le champ entier compte ; entre la marge et le bord, le point est hors de la vue jugée", () => {
    const edge = ahead(halfH - 1);
    expect(pointInView(head(0), edge, QUEST3_FOV, 1)).toBe(true);
    expect(pointInView(head(0), edge)).toBe(false);
    expect(pointInView(head(0), ahead(halfH + 1), QUEST3_FOV, 1)).toBe(false);
  });

  it("APP-004: un point derrière la tête, ou à sa hauteur exacte sur le côté, n'est jamais dans la vue", () => {
    expect(pointInView(head(0), { x: 0, y: 0, z: 1 })).toBe(false);
    expect(pointInView(head(0), { x: 1, y: 0, z: 0 })).toBe(false);
  });

  it("APP-004: tête tournée, la vue suit le cap", () => {
    // Tournée de 90° à gauche, la tête regarde vers -X.
    expect(pointInView(head(90), { x: -1, y: 0, z: 0 })).toBe(true);
    expect(pointInView(head(90), { x: 0, y: 0, z: -1 })).toBe(false);
    expect(pointInView(head(90), { x: -1, y: 0, z: -Math.tan(deg(limitH - 0.5)) })).toBe(true);
    expect(pointInView(head(90), { x: -1, y: 0, z: -Math.tan(deg(limitH + 0.5)) })).toBe(false);
  });

  it("APP-004: tête inclinée, la vue suit l'inclinaison", () => {
    const up = { x: 0, y: Math.tan(deg(60)), z: -1 };
    expect(pointInView(head(0), up)).toBe(false);
    expect(pointInView(head(0, 30), up)).toBe(true);
    expect(pointInView(head(0, -30), up)).toBe(false);
    expect(pointInView(head(0, 30), ahead(0, 30 + limitV + 0.5))).toBe(false);
  });

  it("APP-004: la position de la tête compte", () => {
    const pose = head(0, 0, { x: 2, y: 1.6, z: 5 });
    expect(pointInView(pose, { x: 2, y: 1.6, z: 4 })).toBe(true);
    expect(pointInView(pose, { x: 2, y: 1.6, z: 6 })).toBe(false);
  });
});

describe("APP-004: un rectangle dans la vue", () => {
  const right = { x: 1, y: 0, z: 0 };
  const up = { x: 0, y: 1, z: 0 };
  const rect = (x: number, y: number, z: number, width = 0.5, height = 0.25): SceneRect => ({ center: { x, y, z }, right, up, width, height });

  it("APP-004: les quatre coins sont calculés depuis le centre et les axes", () => {
    expect(rectCorners(rect(1, 2, 3, 2, 4))).toEqual([
      { x: 0, y: 0, z: 3 },
      { x: 2, y: 0, z: 3 },
      { x: 2, y: 4, z: 3 },
      { x: 0, y: 4, z: 3 },
    ]);
  });

  it("APP-004: un rectangle devant la tête est dans la vue", () => {
    expect(rectInView(head(0), rect(0, 0, -1))).toBe(true);
  });

  it("APP-004: un seul coin hors de la vue suffit pour que le rectangle n'y soit pas", () => {
    const edge = Math.tan(deg(limitH));
    expect(rectInView(head(0), rect(edge - 0.3, 0, -1))).toBe(true);
    expect(rectInView(head(0), rect(edge - 0.2, 0, -1))).toBe(false);
  });

  it("APP-004: un rectangle derrière la tête, ou tourné de côté hors du regard, n'est pas dans la vue", () => {
    expect(rectInView(head(0), rect(0, 0, 1))).toBe(false);
    expect(rectInView(head(90), rect(0, 0, -1))).toBe(false);
  });
});

describe("APP-004: le masque du champ de vision pour IWER", () => {
  it("APP-004: les demi-angles de la cible, en radians, identiques pour chaque œil", () => {
    const mask = visibilityMask();
    expect(mask.left).toEqual(mask.right);
    expect(mask.left.angleLeft).toBeCloseTo(deg(55));
    expect(mask.left.angleRight).toBeCloseTo(deg(55));
    expect(mask.left.angleUp).toBeCloseTo(deg(48));
    expect(mask.left.angleDown).toBeCloseTo(deg(48));
    expect(visibilityMask({ horizontalDeg: 90, verticalDeg: 60 }).right.angleUp).toBeCloseTo(deg(30));
  });
});
