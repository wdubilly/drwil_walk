import { describe, expect, it } from "vitest";
import { createPath } from "../route/path.ts";
import { FADE_M, KEEP_OUT_M, poseAt } from "./traffic-motion.ts";
import type { Agent } from "./traffic-rule.ts";

const agent = (extra: Partial<Agent> = {}): Agent => ({
  type: "berline",
  model: "sedan",
  lieu: "chaussee",
  path: createPath([{ x: 0, z: 0 }, { x: 100, z: 0 }], false),
  startM: 50,
  speedMs: 5,
  reverse: false,
  gabarit: { longueurM: 4.6, largeurM: 1.8, hauteurM: 1.45 },
  ...extra,
});
const far = { x: 50, z: 500 };

describe("mouvement des figurants", () => {
  it("APP-014: le figurant avance le long de son trajet, le nez dans son sens, et reboucle", () => {
    expect(poseAt(agent(), 2, far)).toMatchObject({ x: 60, z: 0, grow: 1 });
    expect(poseAt(agent(), 0, far).yaw).toBeCloseTo(Math.PI / 2);
    expect(poseAt(agent(), 12, far).x).toBeCloseTo(10);
    const back = poseAt(agent({ reverse: true }), 2, far);
    expect(back.x).toBeCloseTo(40);
    expect(back.yaw).toBeCloseTo(-Math.PI / 2);
  });

  it("APP-014: aucun ne surgit : il grandit et rapetisse sur FADE_M au bout de son trajet", () => {
    expect(poseAt(agent({ startM: 0 }), 0, far).grow).toBe(0);
    expect(poseAt(agent({ startM: 0 }), FADE_M / 2 / 5, far).grow).toBeCloseTo(0.5);
    expect(poseAt(agent({ startM: 100 - FADE_M / 4 }), 0, far).grow).toBeCloseTo(0.25);
    expect(poseAt(agent({ startM: FADE_M / 4, reverse: true }), 0, far).grow).toBeCloseTo(0.25);
  });

  it("APP-014: retiré de l'image à moins de KEEP_OUT_M de l'utilisateur, il rapetisse de KEEP_OUT_M + FADE_M à KEEP_OUT_M", () => {
    const user = (d: number) => ({ x: 50, z: d });
    expect(poseAt(agent(), 0, user(KEEP_OUT_M - 1)).grow).toBe(0);
    expect(poseAt(agent(), 0, user(0)).grow).toBe(0);
    expect(poseAt(agent(), 0, user(KEEP_OUT_M + FADE_M / 2)).grow).toBeCloseTo(0.5);
    expect(poseAt(agent(), 0, user(KEEP_OUT_M + FADE_M)).grow).toBe(1);
  });
});
