import { Group, Mesh, type Scene } from "three";
import { describe, expect, it } from "vitest";
import { poseFrame, setup } from "./experience-double.ts";

describe("préférences appliquées à chaud", () => {
  it("APP-001 APP-006 APP-011 APP-013 APP-014: casque, mêmes ville et géométries, marche continue et réel visible", async () => {
    const t = setup();
    await t.enter();
    t.frame(0, poseFrame(0));
    const scene = t.fake.render.mock.lastCall?.[0] as Scene;
    t.inputSources.push({ handedness: "left", gamepad: { axes: [], buttons: [{ pressed: true, value: 1 }] } });
    t.frame(50, poseFrame(0));
    expect(t.root.dataset["preferencesVisible"]).toBe("true");
    expect(scene.getObjectByName("panneau-infos")?.visible).toBe(false);
    t.inputSources[1]?.gamepad.buttons.splice(0, 1, { pressed: false, value: 0 });
    t.frame(60, poseFrame(0));
    t.inputSources[1]?.gamepad.buttons.splice(0, 1, { pressed: true, value: 1 });
    t.frame(70, poseFrame(0));
    expect(t.root.dataset["preferencesVisible"]).toBe("false");
    const world = scene.children.find((o) => o instanceof Group) as Group;
    const geometries: unknown[] = [];
    world.traverse((o) => { if (o instanceof Mesh) geometries.push(o.geometry); });
    for (const profile of ["performance", "qualite", "equilibre"] as const) {
      t.home.preferences.change({ ...t.home.preferences.read(), profile, trees: false, lamps: false, traffic: true, fog: true, side: "left", panelOpacityPct: 90 });
      t.frame(1000, poseFrame(0));
      expect(t.fake.render.mock.lastCall?.[0]).toBe(scene);
      const active = world.getObjectByName("ville")?.children.filter((o) => o.visible) ?? [];
      expect(active).toHaveLength(1);
      expect(active[0]?.getObjectByName("arbres")?.visible).toBe(false);
      expect(active[0]?.getObjectByName("lampadaires")?.visible).toBe(false);
      expect(scene.background).toBeNull();
      expect(scene.fog === null).toBe(profile === "performance");
    }
    const after: unknown[] = [];
    world.traverse((o) => { if (o instanceof Mesh) after.push(o.geometry); });
    expect(after).toEqual(geometries);
    t.frame(2000, poseFrame(-60));
    expect(world.visible).toBe(false);
    expect(scene.getObjectByName("panneau-infos")?.visible).toBe(false);
    expect(Number(t.panel()?.getAttribute("data-distance-m"))).toBeGreaterThan(1);
    t.listeners.end?.();
    t.home.preferences.change({ ...t.home.preferences.read(), profile: "qualite" });
    expect(t.root.dataset["profile"]).toBe("equilibre");
  });

  it("APP-006 APP-007: PC, boutons tactiles et clavier continuent pendant les changements", async () => {
    const t = setup();
    await t.enterPc();
    t.frame(0);
    const scene = t.fake.render.mock.lastCall?.[0] as Scene;
    t.root.querySelector<HTMLButtonElement>(".walk-preferences button")?.click();
    t.home.preferences.change({ ...t.home.preferences.read(), profile: "performance", side: "left", panelOpacityPct: 80 });
    t.frame(1000);
    expect(t.fake.render.mock.lastCall?.[0]).toBe(scene);
    expect(t.fake.setPixelRatio).toHaveBeenLastCalledWith(0.75);
    expect(t.root.style.getPropertyValue("--walk-panel-alpha")).toBe("0.8");
    expect(Number(t.panel()?.getAttribute("data-distance-m"))).toBeGreaterThan(1);
    t.press("Escape");
    t.frame(2000);
    expect(t.root.querySelector(".walk-preferences")).toBeNull();
  });
});
