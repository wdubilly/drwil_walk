import { Window } from "happy-dom";
import { Quaternion, Vector3 } from "three";
import { describe, expect, it, vi } from "vitest";
import { withCanvasContext } from "../city/canvas-double.ts";
import { DEFAULT_ZONE } from "../safety/zone.ts";
import { createPreferenceStore } from "../ui/preferences.ts";
import { createPreferencePanel } from "./preference-panel.ts";
import type { HeadPose } from "./pose.ts";

const head: HeadPose = { position: { x: 0, y: 1.6, z: 0 }, orientation: { x: 0, y: 0, z: 0, w: 1 } };
const space = {} as XRReferenceSpace;
function source(handedness: string, index: number, pressed: boolean): XRInputSource {
  return { handedness, targetRaySpace: {}, gamepad: { buttons: Array.from({ length: 2 }, (_, i) => ({ pressed: i === index && pressed })) } } as unknown as XRInputSource;
}
function setup() {
  const draw = vi.fn();
  const doc = withCanvasContext(new Window().document as unknown as Document, { fillRect: vi.fn(), fillText: draw });
  const store = createPreferenceStore(undefined, vi.fn());
  const panel = createPreferencePanel(doc, store);
  const frame = { getPose: () => null } as unknown as XRFrame;
  const update = (sources: readonly XRInputSource[] = [], h: HeadPose | undefined = head, opacity = 1, reference: XRReferenceSpace | null = space, f = frame) =>
    panel.update(f, reference, sources, h, opacity, DEFAULT_ZONE);
  const aim = (x: number, y: number, behind = false): XRFrame => {
    const target = panel.mesh.localToWorld(new Vector3(x, y, 0));
    const origin = new Vector3(0, 1.2, 0);
    const direction = target.sub(origin).normalize().multiplyScalar(behind ? -1 : 1);
    const orientation = new Quaternion().setFromUnitVectors(new Vector3(0, 0, -1), direction);
    return { getPose: () => ({ transform: { position: origin, orientation } }) } as unknown as XRFrame;
  };
  return { doc, store, panel, draw, update, aim };
}

describe("préférences à la manette du casque", () => {
  it("QUA-002: annonce l'absence de canvas au lieu d'afficher un panneau vide", () => {
    const t = setup();
    withCanvasContext(t.doc, null);
    expect(() => createPreferencePanel(t.doc, t.store)).toThrow("Canvas 2D indisponible");
    t.panel.dispose();
  });

  it("APP-001 APP-006: une gâchette tenue ne rebascule pas ; sans tête ou tête baissée le panneau s'efface", () => {
    const t = setup();
    expect(t.update()).toBe(false);
    const left = source("left", 0, true);
    expect(t.update([left])).toBe(true);
    expect(t.panel.mesh.visible).toBe(true);
    expect(t.update([left], undefined, 0)).toBe(true);
    expect(t.panel.mesh.visible).toBe(false);
    t.panel.update({ getPose: () => null } as unknown as XRFrame, space, [left], undefined, 1, DEFAULT_ZONE);
    expect(t.panel.mesh.visible).toBe(false);
    t.update([left]);
    expect(t.panel.mesh.visible).toBe(true);
    t.update([]);
    expect(t.update([left])).toBe(false);
    t.update([{ handedness: "left" } as XRInputSource, { handedness: "right", gamepad: { buttons: [] } } as unknown as XRInputSource]);
    expect(t.panel.mesh.visible).toBe(false);
    t.panel.dispose();
  });

  it("APP-006: le rayon et la prise changent la ligne pointée une seule fois, jamais le titre ou hors du panneau", () => {
    const t = setup();
    t.update([source("left", 0, true)]);
    const right = source("right", 1, true);
    // Centre de la première ligne : le profil ; la géométrie est celle vraiment placée hors de la zone tapis.
    const y = (0.5 - 71 / 320) * 0.25;
    const f = t.aim(0, y);
    t.update([right], head, 1, space, f);
    expect(t.store.read().profile).toBe("qualite");
    expect(t.draw.mock.calls.some(([text]) => String(text).startsWith("› Qualité"))).toBe(true);
    const count = t.draw.mock.calls.length;
    t.update([right], head, 1, space, f);
    expect(t.store.read().profile).toBe("qualite");
    expect(t.draw).toHaveBeenCalledTimes(count);
    for (const [x, hitY, behind] of [[1, y, false], [0, 1, false], [0, y, true], [0, 0.115, false], [0, -0.124, false]] as const) {
      t.update([]);
      t.update([right], head, 1, space, t.aim(x, hitY, behind));
      expect(t.store.read().profile).toBe("qualite");
    }
    t.update([]);
    t.update([right], head, 1, null, f);
    t.update([right], head, 0, space, f);
    expect(t.store.read().profile).toBe("qualite");
    t.update([]);
    t.update([right], head, 1, space, f);
    expect(t.store.read().profile).toBe("performance");
    t.panel.dispose();
  });
});
