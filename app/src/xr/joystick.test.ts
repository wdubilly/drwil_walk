import { describe, expect, it } from "vitest";
import { JOYSTICK_RELEASED, readSpeedSteps, rightThumbstickY } from "./joystick.ts";

describe("joystick droit", () => {
  it("compte +1 cran vers le haut, -1 vers le bas", () => {
    expect(readSpeedSteps(-1, JOYSTICK_RELEASED)).toEqual({ steps: 1, state: { held: true } });
    expect(readSpeedSteps(0.9, JOYSTICK_RELEASED)).toEqual({ steps: -1, state: { held: true } });
  });

  it("ne compte rien sous le seuil de poussée", () => {
    expect(readSpeedSteps(-0.3, JOYSTICK_RELEASED)).toEqual({ steps: 0, state: { held: false } });
  });

  it("ne compte qu'un cran par poussée, jusqu'au retour au centre", () => {
    const pushed = readSpeedSteps(-1, JOYSTICK_RELEASED).state;
    expect(readSpeedSteps(-1, pushed)).toEqual({ steps: 0, state: { held: true } });
    const released = readSpeedSteps(0.1, pushed).state;
    expect(released).toEqual({ held: false });
    expect(readSpeedSteps(-1, released).steps).toBe(1);
  });

  it("lit l'axe vertical de la manette droite seulement", () => {
    const left = { handedness: "left", gamepad: { axes: [0, 0, 0, -1] } };
    const right = { handedness: "right", gamepad: { axes: [0, 0, 0, 0.7] } };
    expect(rightThumbstickY([left, right])).toBe(0.7);
    expect(rightThumbstickY([left])).toBe(0);
  });

  it("ignore une manette droite sans gamepad ou sans axe vertical", () => {
    expect(rightThumbstickY([{ handedness: "right", gamepad: null }])).toBe(0);
    expect(rightThumbstickY([{ handedness: "right", gamepad: { axes: [0, 0] } }])).toBe(0);
  });
});
