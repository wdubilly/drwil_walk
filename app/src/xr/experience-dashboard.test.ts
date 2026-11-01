import type { Mesh, Scene } from "three";
import { describe, expect, it } from "vitest";
import { WEIGHT_STORAGE_KEY, advanceKcal } from "../route/stats.ts";
import { poseFrame, setup } from "./experience-double.ts";

const memory = (initial?: string) => {
  const data = new Map<string, string>(initial ? [[WEIGHT_STORAGE_KEY, initial]] : []);
  return { data, getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v), removeItem: (k: string) => void data.delete(k) };
};
async function started(options: Parameters<typeof setup>[0] = {}) {
  const t = setup(options);
  await t.enter();
  return t;
}
type T = Awaited<ReturnType<typeof started>>;
const attr = (t: T, name: string) => t.panel()?.getAttribute(name);
const hud = (t: T) => (t.fake.render.mock.calls[0]?.[0] as Scene).getObjectByName("panneau-infos") as Mesh;

describe("tableau de bord de marche dans le casque", () => {
  it("APP-002: est affiché dès le départ avec vitesse, durée, distance, lieu, cap et heure locale", async () => {
    const t = await started({ now: () => new Date(2026, 10, 1, 9, 5) });
    t.frame(0, poseFrame(0));
    t.frame(10_000, poseFrame(0));
    expect(hud(t).visible).toBe(true);
    expect(Number(attr(t, "data-distance-m"))).toBeCloseTo((4 / 3.6) * 10);
    expect(Number(attr(t, "data-time-s"))).toBeCloseTo(10);
    expect(attr(t, "data-place")).toBe("Doha Souq Waqif");
    expect(attr(t, "data-clock")).toBe("09:05");
    expect(attr(t, "data-compass")).toMatch(/^(N|NE|E|SE|S|SO|O|NO) \d{1,3}°$/);
  });

  it("APP-002: lit l'heure du casque quand aucune horloge n'est injectée", async () => {
    const t = await started();
    t.frame(0, poseFrame(0));
    expect(attr(t, "data-clock")).toMatch(/^\d{2}:\d{2}$/);
  });

  it("APP-002: estime les calories avec le poids moyen quand aucun poids n'est saisi", async () => {
    const t = await started();
    t.frame(0, poseFrame(0));
    t.frame(60_000, poseFrame(0));
    expect(attr(t, "data-weight-kg")).toBe("70");
    expect(Number(attr(t, "data-kcal"))).toBeCloseTo(advanceKcal(0, 4, 60, 70), 6);
    expect(t.panel()?.querySelector("[data-field='kcal']")?.textContent).toBe("environ 4 kcal");
  });

  it("SEC-007: estime les calories avec le poids gardé dans le navigateur", async () => {
    const t = await started({ storage: memory("90") });
    t.frame(0, poseFrame(0));
    t.frame(60_000, poseFrame(0));
    expect(attr(t, "data-weight-kg")).toBe("90");
    expect(Number(attr(t, "data-kcal"))).toBeCloseTo(advanceKcal(0, 4, 60, 90), 6);
  });

  it("SEC-007: le poids saisi à l'accueil sert à la marche qui démarre", async () => {
    const t = setup({ storage: memory() });
    const weight = [...t.root.querySelectorAll("label")].find((l) => l.textContent.includes("Poids"))?.querySelector("input");
    if (!weight) throw new Error("champ du poids introuvable");
    weight.value = "100";
    await t.enter();
    t.frame(0, poseFrame(0));
    expect(attr(t, "data-weight-kg")).toBe("100");
  });

  it("APP-001: le tableau de bord disparaît tête baissée, avec la ville", async () => {
    const t = await started();
    t.frame(0, poseFrame(0));
    expect(hud(t).visible).toBe(true);
    t.frame(10, poseFrame(-60));
    expect(hud(t).visible).toBe(false);
  });
});
