import { describe, expect, it } from "vitest";
import { GRIP_BUTTON } from "./left-controller.ts";
import { poseFrame, setup } from "./experience-double.ts";

type T = Awaited<ReturnType<typeof started>>;
interface Reading {
  bearingDeg: number;
  isDefault: boolean;
  chosen: boolean;
  pointed: boolean;
}

async function started() {
  const t = setup();
  await t.enter();
  return t;
}
const attr = (t: T, name: string) => t.panel()?.getAttribute(name);
const choices = (t: T): Reading[] => JSON.parse(attr(t, "data-choices") ?? "[]") as Reading[];

/** Marche, une image toutes les 2 s, jusqu'à ce qu'un carrefour soit annoncé ; rend l'instant atteint. */
function walkToCrossing(t: T): number {
  let time = 0;
  t.frame(time, poseFrame(0));
  while (choices(t).length === 0 && time < 600_000) {
    time += 2000;
    t.frame(time, poseFrame(0));
  }
  return time;
}

describe("choix de la rue aux carrefours dans le casque", () => {
  it("APP-002: un carrefour est annoncé à l'approche, avec la rue du tracé par défaut, sans toucher à la vitesse", async () => {
    const t = await started();
    const time = walkToCrossing(t);
    expect(choices(t).length).toBeGreaterThanOrEqual(2);
    expect(choices(t).filter((c) => c.isDefault)).toHaveLength(1);
    expect(Number(attr(t, "data-junction-m"))).toBeLessThanOrEqual(40);
    expect(t.panel()?.querySelector<HTMLElement>(".junction")?.hidden).toBe(false);
    expect(attr(t, "data-off-route")).toBe("false");
    expect(attr(t, "data-speed-kmh")).toBe("4");
    expect(time).toBeGreaterThan(0);
  });

  it("APP-002: pointer puis presser la prise droite quitte le tracé d'origine sans changer distance ni vitesse", async () => {
    const t = await started();
    let time = walkToCrossing(t);
    const other = choices(t).find((c) => !c.isDefault);
    expect(other).toBeDefined();
    const aim = other?.bearingDeg ?? 0;
    time += 100;
    t.frame(time, poseFrame(0, { rayYawDeg: aim }));
    expect(choices(t).find((c) => c.pointed)?.bearingDeg).toBeCloseTo(aim, 0);
    expect(choices(t).some((c) => c.chosen)).toBe(false);
    t.hold(GRIP_BUTTON);
    time += 100;
    t.frame(time, poseFrame(0, { rayYawDeg: aim }));
    t.hold();
    expect(choices(t).find((c) => c.chosen)?.bearingDeg).toBeCloseTo(aim, 0);
    const before = Number(attr(t, "data-distance-m"));
    for (let i = 0; i < 40; i += 1) {
      time += 2000;
      t.frame(time, poseFrame(0));
    }
    expect(attr(t, "data-off-route")).toBe("true");
    expect(Number(attr(t, "data-distance-m"))).toBeGreaterThan(before + 40);
    expect(attr(t, "data-speed-kmh")).toBe("4");
  });

  it("APP-001: tête baissée, la ville est effacée et aucune rue n'est choisie à l'aveugle", async () => {
    const t = await started();
    let time = walkToCrossing(t);
    const other = choices(t).find((c) => !c.isDefault);
    time += 100;
    t.hold(GRIP_BUTTON);
    t.frame(time, poseFrame(-60, { rayYawDeg: other?.bearingDeg ?? 0 }));
    t.hold();
    expect(Number(attr(t, "data-city-opacity"))).toBe(0);
    expect(choices(t).some((c) => c.chosen || c.pointed)).toBe(false);
  });
});
