import { describe, expect, it } from "vitest";
import { gazeYawRad } from "../xr/pose.ts";
import { headPitchDownDeg } from "../safety/visibility.ts";
import { MAX_PITCH_RAD, NO_LOOK, SENSITIVITY, lookOrientation, turn } from "./look.ts";

describe("regard à la souris", () => {
  it("APP-002: à droite on tourne à droite, vers le bas on regarde en bas", () => {
    const look = turn(NO_LOOK, 100, 50);
    expect(look.yawRad).toBeCloseTo(-100 * SENSITIVITY);
    expect(look.pitchRad).toBeCloseTo(-50 * SENSITIVITY);
  });

  it("APP-002: l'inclinaison est bornée avant la verticale, dans les deux sens", () => {
    expect(turn(NO_LOOK, 0, 10_000).pitchRad).toBe(-MAX_PITCH_RAD);
    expect(turn(NO_LOOK, 0, -10_000).pitchRad).toBe(MAX_PITCH_RAD);
  });

  it("APP-002: l'orientation rend le cap et l'inclinaison lus comme dans le casque", () => {
    const orientation = lookOrientation({ yawRad: 1, pitchRad: -0.5 });
    expect(gazeYawRad(orientation)).toBeCloseTo(1);
    expect(headPitchDownDeg(orientation)).toBeCloseTo((0.5 * 180) / Math.PI);
  });
});
