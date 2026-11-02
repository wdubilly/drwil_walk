import { describe, expect, it } from "vitest";
import { BUTTONS_RELEASED, newPresses, rightButtons, rightStickPressed, type ButtonLike } from "./buttons.ts";

const up: ButtonLike = { pressed: false, value: 0 };
const down: ButtonLike = { pressed: true, value: 1 };
const pad = (trigger: ButtonLike, a: ButtonLike, b: ButtonLike) => [trigger, up, up, up, a, b];

describe("boutons de la manette droite", () => {
  it("APP-002: lit la gâchette, A et B de la manette droite seulement", () => {
    const right = { handedness: "right", gamepad: { buttons: pad(down, up, down) } };
    const left = { handedness: "left", gamepad: { buttons: pad(up, down, up) } };
    expect(rightButtons([left, right])).toEqual({ trigger: true, a: false, b: true });
    expect(rightButtons([left])).toEqual(BUTTONS_RELEASED);
  });

  it("APP-002: compte une gâchette analogique enfoncée à moitié, pas un effleurement", () => {
    const half = { handedness: "right", gamepad: { buttons: pad({ pressed: false, value: 0.5 }, up, up) } };
    const touch = { handedness: "right", gamepad: { buttons: pad({ pressed: false, value: 0.2 }, up, up) } };
    expect(rightButtons([half]).trigger).toBe(true);
    expect(rightButtons([touch]).trigger).toBe(false);
  });

  it("ignore une manette droite sans gamepad, sans boutons ou avec trop peu de boutons", () => {
    expect(rightButtons([{ handedness: "right", gamepad: null }])).toEqual(BUTTONS_RELEASED);
    expect(rightButtons([{ handedness: "right", gamepad: {} }])).toEqual(BUTTONS_RELEASED);
    expect(rightButtons([{ handedness: "right", gamepad: { buttons: [down] } }])).toEqual({ trigger: true, a: false, b: false });
  });

  it("APP-002: un appui ne compte qu'une fois tant que le bouton reste tenu", () => {
    const held = { trigger: true, a: true, b: false };
    expect(newPresses(held, BUTTONS_RELEASED)).toEqual({ trigger: true, a: true, b: false });
    expect(newPresses(held, held)).toEqual(BUTTONS_RELEASED);
    expect(newPresses(BUTTONS_RELEASED, held)).toEqual(BUTTONS_RELEASED);
  });
});

describe("clic du joystick droit", () => {
  const stick = (handedness: string, button: ButtonLike) => ({ handedness, gamepad: { buttons: [up, up, up, button] } });
  it("APP-002: se lit sur la manette droite seulement, faux sans elle ou sans bouton", () => {
    expect(rightStickPressed([stick("left", down), stick("right", down)])).toBe(true);
    expect(rightStickPressed([stick("left", down), stick("right", up)])).toBe(false);
    expect(rightStickPressed([stick("left", down)])).toBe(false);
    expect(rightStickPressed([{ handedness: "right", gamepad: null }])).toBe(false);
  });
});
