import { describe, expect, it } from "vitest";
import { DEFAULT_ZONE, MAX_WIDTH_M, MIN_SIZE_M } from "./zone.ts";
import { initialZoneEdit, nextZoneEdit, type ZoneInput } from "./zone-edit.ts";

const idle: ZoneInput = { dtS: 1, stickX: 0, stickY: 0, resize: false, place: null, reset: false };
const start = initialZoneEdit(DEFAULT_ZONE);

describe("réglage de la zone tapis à la manette", () => {
  it("APP-001: sans geste, rien ne change ni ne s'enregistre", () => {
    expect(nextZoneEdit(start, { ...idle, stickX: 0.1 })).toEqual({ edit: start, save: false });
  });

  it("APP-001: le joystick déplace la boîte selon ses propres axes, vers l'avant en poussant", () => {
    const { edit } = nextZoneEdit(start, { ...idle, stickY: -1 });
    expect(edit.zone.z).toBeCloseTo(-0.6);
    expect(edit.zone.x).toBeCloseTo(0);
    expect(edit.dirty).toBe(true);
    const turned = initialZoneEdit({ ...DEFAULT_ZONE, yawRad: Math.PI / 2 });
    const side = nextZoneEdit(turned, { ...idle, stickX: 1 }).edit.zone;
    expect(side.x).toBeCloseTo(0);
    expect(side.z).toBeCloseTo(-0.6);
  });

  it("APP-001: la prise tenue redimensionne, dans les bornes", () => {
    const { edit } = nextZoneEdit(start, { ...idle, resize: true, stickX: 1, stickY: -1 });
    expect(edit.zone.width).toBeCloseTo(1.7);
    expect(edit.zone.depth).toBeCloseTo(2.9);
    const big = nextZoneEdit(start, { ...idle, resize: true, stickX: 1, dtS: 100 }).edit.zone;
    expect(big.width).toBe(MAX_WIDTH_M);
    const small = nextZoneEdit(start, { ...idle, resize: true, stickX: -1, dtS: 100 }).edit.zone;
    expect(small.width).toBe(MIN_SIZE_M);
  });

  it("APP-001: la boîte ne sort pas des bornes de position", () => {
    const far = nextZoneEdit(start, { ...idle, stickX: 1, stickY: 1, dtS: 1000 }).edit.zone;
    expect(Math.abs(far.x)).toBe(5);
    expect(Math.abs(far.z)).toBe(5);
  });

  it("APP-001: X pose la boîte sous soi, Y rend la boîte par défaut ; Y l'emporte sur X", () => {
    const placed = nextZoneEdit(start, { ...idle, place: { x: 1, z: -2, yawRad: 0.5 } }).edit;
    expect(placed.zone).toEqual({ ...DEFAULT_ZONE, x: 1, z: -2, yawRad: 0.5 });
    expect(placed.dirty).toBe(true);
    expect(nextZoneEdit(placed, { ...idle, reset: true }).edit.zone).toBe(DEFAULT_ZONE);
    expect(nextZoneEdit(placed, { ...idle, reset: true, place: { x: 9, z: 9, yawRad: 0 } }).edit.zone).toBe(DEFAULT_ZONE);
  });

  it("APP-001: la zone n'est enregistrée qu'une fois le geste fini", () => {
    const moving = nextZoneEdit(start, { ...idle, stickY: -1 });
    expect(moving.save).toBe(false);
    expect(nextZoneEdit(moving.edit, { ...idle, stickY: -1 }).save).toBe(false);
    const done = nextZoneEdit(moving.edit, idle);
    expect(done.save).toBe(true);
    expect(done.edit.dirty).toBe(true);
  });
});
