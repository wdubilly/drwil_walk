import { Group } from "three";
import { describe, expect, it } from "vitest";
import type { Souq } from "../city/souq-data.ts";
import { createPath } from "../route/path.ts";
import { createJunctions } from "./junctions.ts";

const line = (...pts: [number, number][]) => ({ highway: "residential", points: pts.map(([x, z]) => ({ x, z })) });
const roads = [
  line([-100, 0], [-50, 0], [0, 0], [50, 0], [100, 0]),
  line([0, -100], [0, -50], [0, 0], [0, 50], [0, 100]),
  line([-1000, 1000], [1000, 1000]),
  line([-1000, -1000], [1000, -1000]),
];
const route = createPath([-100, -50, 0, 50, 100, 50, 0, -50, -100].map((x) => ({ x, z: 0 })));
const souq = { route, roads } as unknown as Souq;
const space = {} as XRReferenceSpace;
const targetRaySpace = {} as XRSpace;

/** Une manette droite qui vise `yawDeg` (positif à gauche) et dont la prise est tenue ou non. */
function frameAndSources(yawDeg: number, grip: boolean, pointing = true) {
  const half = (yawDeg * Math.PI) / 360;
  const pose = { transform: { position: { x: 0, y: 1.2, z: 0 }, orientation: { x: 0, y: Math.sin(half), z: 0, w: Math.cos(half) } } };
  const frame = { getPose: () => pose } as unknown as XRFrame;
  const buttons = [{ pressed: false, value: 0 }, { pressed: grip, value: grip ? 1 : 0 }];
  return { frame, sources: [{ handedness: "right", gamepad: { buttons }, ...(pointing ? { targetRaySpace } : {}) }] };
}

function setup() {
  const city = new Group();
  const junctions = createJunctions(city, souq);
  const step = (distanceM: number, yawDeg: number, grip: boolean, visible = true, sp: XRReferenceSpace | null = space) => {
    const { frame, sources } = frameAndSources(yawDeg, grip);
    return junctions.update({ distanceM, frame, space: sp, sources, visible });
  };
  return { city, step };
}

describe("APP-002: carrefours dans la marche", () => {
  it("sans carrefour proche, ne propose rien et pose la ville sur le tracé", () => {
    const { city, step } = setup();
    const view = step(10, 0, false);
    expect(view.choices).toEqual([]);
    expect(view.at.x).toBeCloseTo(-90);
    expect(city.getObjectByName("carrefour")?.visible).toBe(false);
  });

  it("pointer une rue ne la choisit pas, la prise droite la choisit une seule fois", () => {
    const { city, step } = setup();
    const first = step(70, 0, false);
    const north = first.choices.find((c) => c.bearingDeg > 10);
    expect(first.choices).toHaveLength(3);
    expect(north).toBeDefined();
    expect(first.choices.find((c) => c.isDefault)?.bearingDeg).toBeCloseTo(0, 0);
    const aim = north?.bearingDeg ?? 0;
    const pointed = step(71, aim, false);
    expect(pointed.choices.filter((c) => c.pointed)).toHaveLength(1);
    expect(pointed.chosen).toBeUndefined();
    const chosen = step(72, aim, true);
    expect(chosen.choices.find((c) => c.chosen)?.pointed).toBe(true);
    expect(chosen.chosen).toBeDefined();
    // La prise reste tenue : pas de nouveau choix, et relâcher puis repointer ailleurs en fait un autre.
    const held = step(73, 0, true);
    expect(held.chosen).toBe(chosen.chosen);
    step(74, 0, false);
    const other = step(75, 0, true);
    expect(other.chosen).not.toBe(chosen.chosen);
    expect(city.getObjectByName("carrefour")?.children.length).toBe(3);
  });

  it("n'accepte aucun choix quand la ville est effacée, sans espace de référence ou sans rayon", () => {
    for (const [visible, sp] of [[false, space], [true, null]] as const) {
      const { step } = setup();
      const aim = step(70, 0, false).choices.find((c) => c.bearingDeg > 10)?.bearingDeg ?? 0;
      expect(step(71, aim, true, visible, sp).chosen).toBeUndefined();
      expect(step(72, aim, true, visible, sp).choices.some((c) => c.pointed)).toBe(false);
    }
    const city = new Group();
    const junctions = createJunctions(city, souq);
    const { frame, sources } = frameAndSources(0, true, false);
    junctions.update({ distanceM: 70, frame, space, sources, visible: true });
    expect(junctions.update({ distanceM: 71, frame, space, sources, visible: true }).chosen).toBeUndefined();
  });
});
