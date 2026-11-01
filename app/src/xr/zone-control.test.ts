import { describe, expect, it } from "vitest";
import { DEFAULT_ZONE, ZONE_STORAGE_KEY } from "../safety/zone.ts";
import { createZoneControl } from "./zone-control.ts";

const pad = (axes: number[], pressed: number[] = []) => ({
  handedness: "left",
  gamepad: { axes, buttons: Array.from({ length: 6 }, (_, i) => ({ pressed: pressed.includes(i), value: 0 })) },
});
const head = { position: { x: 1, y: 1.6, z: -2 }, orientation: { x: 0, y: 0, z: 0, w: 1 } };
const memory = () => {
  const data = new Map<string, string>();
  return { data, getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v) };
};

describe("zone tapis dans la marche", () => {
  it("APP-001: démarre sur la boîte par défaut sans zone enregistrée", () => {
    expect(createZoneControl(memory()).zone()).toBe(DEFAULT_ZONE);
  });

  it("APP-001: poser la boîte sous soi (X) l'enregistre à la fin du geste, et elle est relue au lancement suivant", () => {
    const storage = memory();
    const control = createZoneControl(storage);
    control.update(0, [pad([0, 0, 0, 0])], head);
    expect(control.update(10, [pad([0, 0, 0, 0], [4])], head)).toBe(false);
    expect(control.zone()).toMatchObject({ x: 1, z: -2, yawRad: 0 });
    expect(storage.data.has(ZONE_STORAGE_KEY)).toBe(false);
    control.update(20, [pad([0, 0, 0, 0])], head);
    expect(storage.data.has(ZONE_STORAGE_KEY)).toBe(true);
    expect(createZoneControl(storage).zone()).toMatchObject({ x: 1, z: -2 });
  });

  it("APP-001: X sans pose connue ne pose rien ; Y rend la boîte par défaut et le joystick la déplace", () => {
    const control = createZoneControl(memory());
    control.update(0, [], undefined);
    control.update(10, [pad([0, 0, 0, 0], [4])], undefined);
    expect(control.zone()).toBe(DEFAULT_ZONE);
    control.update(1010, [pad([0, 0, 0, -1])], head);
    expect(control.zone().z).toBeCloseTo(-0.6);
    control.update(1020, [pad([0, 0, 0, 0], [5])], head);
    expect(control.zone()).toBe(DEFAULT_ZONE);
  });

  it("QUA-002: dit quand l'enregistrement échoue", () => {
    const control = createZoneControl(undefined);
    control.update(0, [pad([0, 0, 0, -1])], head);
    control.update(10, [pad([0, 0, 0, -1])], head);
    expect(control.update(20, [pad([0, 0, 0, 0])], head)).toBe(true);
    expect(control.update(30, [pad([0, 0, 0, 0])], head)).toBe(false);
  });
});
