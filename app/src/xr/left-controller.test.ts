import { describe, expect, it } from "vitest";
import { LEFT_RELEASED, leftPresses, leftReading } from "./left-controller.ts";

const pad = (axes: number[], pressed: number[] = [], analog: number[] = []) => ({
  handedness: "left",
  gamepad: { axes, buttons: Array.from({ length: 6 }, (_, i) => ({ pressed: pressed.includes(i), value: analog.includes(i) ? 0.9 : 0 })) },
});

describe("manette gauche", () => {
  it("APP-001: lit le joystick, la prise, X et Y", () => {
    expect(leftReading([pad([0, 0, 0.4, -0.7], [1, 4], [5])])).toEqual({ stickX: 0.4, stickY: -0.7, grip: true, x: true, y: true });
  });

  it("APP-001: sans manette gauche, ou sans gamepad, tout est relâché ; les axes ou boutons manquants valent zéro", () => {
    expect(leftReading([{ handedness: "right", gamepad: { axes: [1, 1, 1, 1] } }])).toBe(LEFT_RELEASED);
    expect(leftReading([{ handedness: "left" }])).toBe(LEFT_RELEASED);
    expect(leftReading([{ handedness: "left", gamepad: { axes: [] } }])).toEqual(LEFT_RELEASED);
  });

  it("APP-001: un appui sur X ou Y ne compte qu'une fois", () => {
    const on = { ...LEFT_RELEASED, x: true, y: true };
    expect(leftPresses(on, LEFT_RELEASED)).toEqual({ x: true, y: true });
    expect(leftPresses(on, on)).toEqual({ x: false, y: false });
  });
});
