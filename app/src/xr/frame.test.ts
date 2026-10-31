import { describe, expect, it } from "vitest";
import { initialWalkState, nextWalkState, type FrameInput } from "./frame.ts";

const still: Omit<FrameInput, "timeMs"> = { axisY: 0, pitchDownDeg: 0, globalOpacityPct: 100 };

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
});
