import { describe, expect, it } from "vitest";
import { POINT_TOLERANCE_DEG, pointedStreet, rightGrip, rightRay } from "./choice-ray.ts";

const buttons = (grip: boolean) => [{ pressed: false, value: 0 }, { pressed: grip, value: grip ? 1 : 0 }];
const space = {} as XRSpace;
const frameWith = (pose: unknown) => ({ getPose: () => pose }) as unknown as XRFrame;
const identity = { transform: { position: { x: 1, y: 1.2, z: 2 }, orientation: { x: 0, y: 0, z: 0, w: 1 } } };

describe("APP-002: prise de la manette droite", () => {
  it("n'est tenue que sur la manette droite", () => {
    expect(rightGrip([{ handedness: "right", gamepad: { buttons: buttons(true) } }])).toBe(true);
    expect(rightGrip([{ handedness: "right", gamepad: { buttons: buttons(false) } }])).toBe(false);
    expect(rightGrip([{ handedness: "left", gamepad: { buttons: buttons(true) } }])).toBe(false);
    expect(rightGrip([{ handedness: "right", gamepad: null }])).toBe(false);
    expect(rightGrip([])).toBe(false);
  });
});

describe("APP-002: rayon de la manette droite", () => {
  it("pointe devant (-Z) sans rotation, depuis la position de la manette", () => {
    const ray = rightRay(frameWith(identity), space, [{ handedness: "right", targetRaySpace: space }]);
    expect(ray?.origin).toEqual({ x: 1, y: 1.2, z: 2 });
    expect(ray?.dir.x).toBeCloseTo(0);
    expect(ray?.dir.z).toBeCloseTo(-1);
  });

  it("suit l'orientation : un quart de tour à gauche pointe vers -X", () => {
    const s = Math.SQRT1_2;
    const pose = { transform: { position: { x: 0, y: 1, z: 0 }, orientation: { x: 0, y: s, z: 0, w: s } } };
    const ray = rightRay(frameWith(pose), space, [{ handedness: "right", targetRaySpace: space }]);
    expect(ray?.dir.x).toBeCloseTo(-1);
    expect(ray?.dir.z).toBeCloseTo(0);
  });

  it("n'existe pas sans manette droite posée ni pose", () => {
    expect(rightRay(frameWith(identity), space, [])).toBeUndefined();
    expect(rightRay(frameWith(identity), space, [{ handedness: "left", targetRaySpace: space }])).toBeUndefined();
    expect(rightRay(frameWith(identity), space, [{ handedness: "right" }])).toBeUndefined();
    expect(rightRay(frameWith(null), space, [{ handedness: "right", targetRaySpace: space }])).toBeUndefined();
  });
});

describe("APP-002: rue pointée", () => {
  const origin = { x: 0, y: 1.2, z: 0 };
  const tips = [
    { to: 1, tip: { x: 0, y: 0, z: -8 } },
    { to: 2, tip: { x: 8, y: 0, z: 0 } },
    { to: 3, tip: { x: -8, y: 0, z: 0 } },
  ];

  it("choisit la rue la plus proche du cap visé, dans la tolérance", () => {
    expect(pointedStreet({ origin, dir: { x: 0.05, y: 0, z: -1 } }, tips, POINT_TOLERANCE_DEG)).toBe(1);
    expect(pointedStreet({ origin, dir: { x: 1, y: -0.2, z: 0.1 } }, tips, POINT_TOLERANCE_DEG)).toBe(2);
    expect(pointedStreet({ origin, dir: { x: -1, y: 0, z: 0 } }, tips, POINT_TOLERANCE_DEG)).toBe(3);
  });

  it("ne vise rien hors tolérance, vers le ciel ou le sol, ou sans rue", () => {
    expect(pointedStreet({ origin, dir: { x: 1, y: 0, z: -1 } }, tips, POINT_TOLERANCE_DEG)).toBeUndefined();
    expect(pointedStreet({ origin, dir: { x: 0.02, y: 1, z: -0.02 } }, tips, POINT_TOLERANCE_DEG)).toBeUndefined();
    expect(pointedStreet({ origin, dir: { x: 0, y: 0, z: -1 } }, [], POINT_TOLERANCE_DEG)).toBeUndefined();
  });

  it("garde la plus proche quand deux rues sont dans la tolérance", () => {
    const close = [{ to: 4, tip: { x: 1, y: 0, z: -8 } }, { to: 5, tip: { x: 0.5, y: 0, z: -8 } }];
    expect(pointedStreet({ origin, dir: { x: 0, y: 0, z: -1 } }, close, POINT_TOLERANCE_DEG)).toBe(5);
    expect(pointedStreet({ origin, dir: { x: 0, y: 0, z: -1 } }, [...close].reverse(), POINT_TOLERANCE_DEG)).toBe(5);
  });
});
