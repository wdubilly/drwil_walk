import { Mesh, type Group, type Material, type Scene } from "three";
import { describe, expect, it } from "vitest";
import { DEFAULT_ZONE, ZONE_STORAGE_KEY } from "../safety/zone.ts";
import { poseFrame, setup } from "./experience-double.ts";

const memory = (initial?: string) => {
  const data = new Map<string, string>(initial ? [[ZONE_STORAGE_KEY, initial]] : []);
  return { data, getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v) };
};
async function started(options: Parameters<typeof setup>[0] = {}) {
  const t = setup(options);
  await t.enter();
  return t;
}
type T = Awaited<ReturnType<typeof started>>;
const scene = (t: T) => t.fake.render.mock.calls[0]?.[0] as Scene;
const world = (t: T) => scene(t).children.find((c) => c.type === "Group") as Group;
const panel = (t: T) => t.panel()?.getAttribute("data-zone");
const left = (t: T, axes: number[], pressed: number[] = []) => {
  t.inputSources[1] = {
    handedness: "left",
    gamepad: { axes, buttons: Array.from({ length: 6 }, (_, i) => ({ pressed: pressed.includes(i), value: 0 })) },
  };
};
const cityMaterials = (t: T): Material[] => {
  const found: Material[] = [];
  world(t).getObjectByName("ville")?.traverse((o) => {
    if (o instanceof Mesh) found.push(o.material as Material);
  });
  return found;
};

describe("zone tapis et vignette réelle dans le casque", () => {
  it("APP-001: la ville est découpée par la zone, dès le premier lancement, quelle que soit l'opacité réglée", async () => {
    const t = await started();
    expect(t.fake.renderer?.localClippingEnabled).toBe(true);
    t.frame(0, poseFrame(0));
    const materials = cityMaterials(t);
    expect(materials.length).toBeGreaterThan(0);
    for (const m of materials) {
      expect(m.clippingPlanes).toHaveLength(6);
      expect(m.clipIntersection).toBe(true);
    }
    expect(panel(t)).toBe("0.000 0.000 0.000 1.200 2.400 1.200");
    t.frame(10, poseFrame(-32.5));
    expect(cityMaterials(t)[0]?.clippingPlanes).toHaveLength(6);
  });

  it("APP-001: la mention d'attribution n'est pas découpée par la zone", async () => {
    const t = await started();
    t.frame(0, poseFrame(0));
    const label = world(t).getObjectByName("attribution") as Mesh;
    expect((label.material as Material).clippingPlanes).toBeNull();
  });

  it("APP-001: une zone enregistrée est relue ; une zone illisible redonne la boîte par défaut", async () => {
    const saved = { ...DEFAULT_ZONE, x: 0.5, width: 1.5 };
    const t = await started({ storage: memory(JSON.stringify(saved)) });
    t.frame(0, poseFrame(0));
    expect(panel(t)).toBe("0.500 0.000 0.000 1.500 2.400 1.200");
    const bad = await started({ storage: memory("[1,2") });
    bad.frame(0, poseFrame(0));
    expect(panel(bad)).toBe("0.000 0.000 0.000 1.200 2.400 1.200");
  });

  it("APP-001: poser la boîte à la manette gauche (X) puis la déplacer, et l'enregistrer", async () => {
    const storage = memory();
    const t = await started({ storage });
    t.frame(0, poseFrame(0, { at: { x: 0.4, y: 1.6, z: -0.3 } }));
    left(t, [0, 0, 0, 0], [4]);
    t.frame(100, poseFrame(0, { at: { x: 0.4, y: 1.6, z: -0.3 } }));
    expect(panel(t)).toContain("0.400 -0.300");
    left(t, [0, 0, 0, 0]);
    t.frame(200, poseFrame(0));
    expect(JSON.parse(storage.data.get(ZONE_STORAGE_KEY) as string)).toMatchObject({ x: 0.4, z: -0.3 });
    expect(t.notice()).toBe("");
  });

  it("QUA-002: dit à l'écran quand la zone ne peut pas être enregistrée", async () => {
    const t = await started();
    t.frame(0, poseFrame(0));
    left(t, [0, 0, 0, -1]);
    t.frame(100, poseFrame(0));
    left(t, [0, 0, 0, 0]);
    t.frame(200, poseFrame(0));
    expect(t.notice()).toContain("n'a pas pu être enregistrée");
  });

  it("APP-001: la vignette réelle est activée par défaut et se désactive à l'accueil", async () => {
    const t = await started();
    t.frame(0, poseFrame(0));
    const vignette = scene(t).getObjectByName("vignette");
    expect(vignette?.visible).toBe(true);
    expect(t.panel()?.getAttribute("data-vignette")).toBe("true");
    const off = setup();
    off.root.querySelector<HTMLInputElement>("input[type='checkbox']")?.click();
    await off.enter();
    off.frame(0, poseFrame(0));
    expect((off.fake.render.mock.calls[0]?.[0] as Scene).getObjectByName("vignette")?.visible).toBe(false);
    expect(off.panel()?.getAttribute("data-vignette")).toBe("false");
  });
});
