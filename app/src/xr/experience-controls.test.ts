import type { Group, Mesh, Scene } from "three";
import { describe, expect, it } from "vitest";
import { A_BUTTON, B_BUTTON, TRIGGER_BUTTON } from "./buttons.ts";
import { poseFrame, setup } from "./experience-double.ts";

type T = Awaited<ReturnType<typeof started>>;

async function started() {
  const t = setup();
  await t.enter();
  return t;
}
const attr = (t: T, name: string) => t.panel()?.getAttribute(name);
const scene = (t: T) => t.fake.render.mock.calls[0]?.[0] as Scene;
const world = (t: T) => scene(t).children.find((child) => child.type === "Group") as Group;
const hud = (t: T) => scene(t).getObjectByName("panneau-infos") as Mesh;

describe("commandes de la manette droite dans le casque", () => {
  it("APP-002: la gâchette met la marche en pause puis la reprend, la vitesse est conservée", async () => {
    const t = await started();
    t.frame(0, poseFrame(0));
    t.frame(1000, poseFrame(0));
    const walked = Number(attr(t, "data-distance-m"));
    expect(walked).toBeGreaterThan(1);
    t.hold(TRIGGER_BUTTON);
    t.frame(2000, poseFrame(0));
    expect(attr(t, "data-paused")).toBe("true");
    expect(t.panel()?.querySelector<HTMLElement>(".paused")?.hidden).toBe(false);
    t.hold();
    t.frame(5000, poseFrame(0));
    expect(Number(attr(t, "data-distance-m"))).toBeCloseTo(walked);
    expect(attr(t, "data-speed-kmh")).toBe("4");
    t.hold(TRIGGER_BUTTON);
    t.frame(5100, poseFrame(0));
    expect(attr(t, "data-paused")).toBe("false");
    t.hold();
    t.frame(6100, poseFrame(0));
    expect(Number(attr(t, "data-distance-m"))).toBeGreaterThan(walked + 1);
  });

  it("APP-001: en pause, la ville reste affichée et le fondu de sécurité continue", async () => {
    const t = await started();
    t.hold(TRIGGER_BUTTON);
    t.frame(0, poseFrame(0));
    expect(attr(t, "data-city-opacity")).toBe("1");
    expect(world(t).visible).toBe(true);
    t.frame(10, poseFrame(-60));
    expect(attr(t, "data-paused")).toBe("true");
    expect(attr(t, "data-city-opacity")).toBe("0");
    expect(world(t).visible).toBe(false);
  });

  it("APP-002: le bouton A recale le parcours sur le regard, sans toucher à la distance", async () => {
    const t = await started();
    t.frame(0, poseFrame(0));
    t.frame(2000, poseFrame(0, { yawDeg: 90, at: { x: 0.3, y: 1.6, z: -0.5 } }));
    const walked = attr(t, "data-distance-m");
    expect(world(t).position.x).toBe(0);
    t.hold(A_BUTTON);
    t.frame(2000, poseFrame(0, { yawDeg: 90, at: { x: 0.3, y: 1.6, z: -0.5 } }));
    expect(world(t).position.x).toBeCloseTo(0.3);
    expect(world(t).position.z).toBeCloseTo(-0.5);
    expect(world(t).rotation.y).toBeCloseTo(Math.PI / 2);
    expect(Number(attr(t, "data-calibration-yaw"))).toBeCloseTo(Math.PI / 2);
    expect(attr(t, "data-distance-m")).toBe(walked);
  });

  it("APP-002: un appui sur A sans pose connue ne recale rien", async () => {
    const t = await started();
    t.hold(A_BUTTON);
    t.frame(0, poseFrame(null));
    expect(world(t).position.x).toBe(0);
    expect(attr(t, "data-calibration-yaw")).toBe("0");
  });

  it("APP-002: le bouton B masque et réaffiche le panneau d'infos, affiché dès le départ", async () => {
    const t = await started();
    t.frame(0, poseFrame(0));
    expect(attr(t, "data-hud-visible")).toBe("true");
    expect(hud(t).visible).toBe(true);
    t.hold(B_BUTTON);
    t.frame(10, poseFrame(0));
    expect(attr(t, "data-hud-visible")).toBe("false");
    expect(hud(t).visible).toBe(false);
    t.frame(20, poseFrame(0));
    expect(hud(t).visible).toBe(false);
    t.hold();
    t.frame(30, poseFrame(0));
    t.hold(B_BUTTON);
    t.frame(40, poseFrame(0));
    expect(hud(t).visible).toBe(true);
  });

  it("APP-001: le panneau du casque suit le fondu de la ville, tête baissée il disparaît", async () => {
    const t = await started();
    t.frame(0, poseFrame(0));
    expect(hud(t).visible).toBe(true);
    t.frame(10, poseFrame(-45));
    expect(hud(t).visible).toBe(false);
    t.frame(20, poseFrame(null));
    expect(hud(t).visible).toBe(false);
    t.frame(30, poseFrame(-32.5));
    expect(hud(t).visible).toBe(true);
    expect((hud(t).material as { opacity: number }).opacity).toBeCloseTo(0.5);
  });
});
