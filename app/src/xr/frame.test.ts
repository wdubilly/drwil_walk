import { describe, expect, it } from "vitest";
import { BUTTONS_RELEASED } from "./buttons.ts";
import { initialWalkState, nextWalkState, type FrameInput } from "./frame.ts";

const still: Omit<FrameInput, "timeMs"> = { axisY: 0, buttons: BUTTONS_RELEASED, pitchDownDeg: 0, globalOpacityPct: 100 };

describe("image de la marche", () => {
  it("part immobile, à la vitesse et à l'opacité réglées", () => {
    const s = initialWalkState(5.04, 50);
    expect(s).toMatchObject({ speedKmh: 5, distanceM: 0, timeS: 0, lastTimeMs: null, cityOpacity: 0.5 });
  });

  it("n'avance pas à la première image, puis avance à la vitesse réglée", () => {
    let s = initialWalkState(3.6, 100);
    s = nextWalkState(s, { ...still, timeMs: 1000 });
    expect(s.distanceM).toBe(0);
    s = nextWalkState(s, { ...still, timeMs: 3000 });
    expect(s.distanceM).toBeCloseTo(2);
    expect(s.timeS).toBeCloseTo(2);
  });

  it("ignore une horloge qui recule", () => {
    let s = nextWalkState(initialWalkState(4, 100), { ...still, timeMs: 1000 });
    s = nextWalkState(s, { ...still, timeMs: 500 });
    expect(s.distanceM).toBe(0);
  });

  it("change la vitesse de 0,1 km/h par cran de joystick", () => {
    let s = initialWalkState(4, 100);
    s = nextWalkState(s, { ...still, timeMs: 0, axisY: -1 });
    expect(s.speedKmh).toBe(4.1);
    s = nextWalkState(s, { ...still, timeMs: 10, axisY: 0 });
    s = nextWalkState(s, { ...still, timeMs: 20, axisY: 1 });
    expect(s.speedKmh).toBe(4);
  });

  it("APP-001: efface la ville tête baissée et quand la pose est perdue", () => {
    const s = initialWalkState(4, 100);
    expect(nextWalkState(s, { ...still, timeMs: 0, pitchDownDeg: 50 }).cityOpacity).toBe(0);
    expect(nextWalkState(s, { ...still, timeMs: 0, pitchDownDeg: null }).cityOpacity).toBe(0);
    expect(nextWalkState(s, { ...still, timeMs: 0, globalOpacityPct: 10 }).cityOpacity).toBeCloseTo(0.3);
  });

  it("APP-002: à l'arrivée d'un trajet libre, s'arrête pile au bout et fige le temps", () => {
    let s = nextWalkState(initialWalkState(3.6, 100), { ...still, timeMs: 0, endM: 10 });
    expect(s.arrived).toBe(false);
    s = nextWalkState(s, { ...still, timeMs: 8000, endM: 10 });
    expect(s).toMatchObject({ arrived: false });
    s = nextWalkState(s, { ...still, timeMs: 12000, endM: 10 });
    expect(s).toMatchObject({ arrived: true, distanceM: 10 });
    const timeS = s.timeS;
    s = nextWalkState(s, { ...still, timeMs: 20000, endM: 10 });
    expect(s).toMatchObject({ arrived: true, distanceM: 10, timeS });
  });

  it("APP-002: une boucle n'arrive jamais", () => {
    let s = nextWalkState(initialWalkState(8, 100), { ...still, timeMs: 0 });
    s = nextWalkState(s, { ...still, timeMs: 1_000_000 });
    expect(s.arrived).toBe(false);
    expect(s.distanceM).toBeGreaterThan(1000);
  });

  it("APP-002: la gâchette met en pause et reprend, la vitesse réglée est conservée", () => {
    const trigger = { ...BUTTONS_RELEASED, trigger: true };
    let s = nextWalkState(initialWalkState(3.6, 100), { ...still, timeMs: 0 });
    s = nextWalkState(s, { ...still, timeMs: 2000 });
    expect(s.distanceM).toBeCloseTo(2);
    s = nextWalkState(s, { ...still, timeMs: 3000, buttons: trigger });
    expect(s).toMatchObject({ paused: true, speedKmh: 3.6, timeS: 2 });
    expect(s.distanceM).toBeCloseTo(2);
    s = nextWalkState(s, { ...still, timeMs: 5000, axisY: -1 });
    expect(s).toMatchObject({ paused: true, speedKmh: 3.7, timeS: 2 });
    expect(s.distanceM).toBeCloseTo(2);
    s = nextWalkState(s, { ...still, timeMs: 6000, buttons: trigger });
    expect(s.paused).toBe(false);
    s = nextWalkState(s, { ...still, timeMs: 7000 });
    expect(s.distanceM).toBeGreaterThan(2.9);
  });

  it("APP-001: en pause, le fondu de sécurité continue de s'appliquer", () => {
    const trigger = { ...BUTTONS_RELEASED, trigger: true };
    let s = nextWalkState(initialWalkState(4, 100), { ...still, timeMs: 0, buttons: trigger });
    expect(s.paused).toBe(true);
    s = nextWalkState(s, { ...still, timeMs: 10, buttons: trigger, pitchDownDeg: 50 });
    expect(s).toMatchObject({ paused: true, cityOpacity: 0 });
    s = nextWalkState(s, { ...still, timeMs: 20, pitchDownDeg: 0 });
    expect(s.cityOpacity).toBe(1);
  });

  it("APP-002: un bouton tenu ne déclenche qu'une action, le suivant en redéclenche une", () => {
    const b = { ...BUTTONS_RELEASED, b: true };
    const a = { ...BUTTONS_RELEASED, a: true };
    let s = initialWalkState(4, 100);
    expect(s).toMatchObject({ showPanel: true, recalibrate: false });
    s = nextWalkState(s, { ...still, timeMs: 0, buttons: b });
    expect(s.showPanel).toBe(false);
    s = nextWalkState(s, { ...still, timeMs: 10, buttons: b });
    expect(s.showPanel).toBe(false);
    s = nextWalkState(s, { ...still, timeMs: 20 });
    s = nextWalkState(s, { ...still, timeMs: 30, buttons: b });
    expect(s.showPanel).toBe(true);
    s = nextWalkState(s, { ...still, timeMs: 40, buttons: a });
    expect(s.recalibrate).toBe(true);
    s = nextWalkState(s, { ...still, timeMs: 50, buttons: a });
    expect(s.recalibrate).toBe(false);
  });

  it("APP-002: le recalage ne touche pas à la distance parcourue", () => {
    let s = nextWalkState(initialWalkState(3.6, 100), { ...still, timeMs: 0 });
    s = nextWalkState(s, { ...still, timeMs: 2000 });
    const before = s.distanceM;
    s = nextWalkState(s, { ...still, timeMs: 2000, buttons: { ...BUTTONS_RELEASED, a: true } });
    expect(s.distanceM).toBe(before);
  });
});
