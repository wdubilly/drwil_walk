import { Window } from "happy-dom";
import { describe, expect, it, vi } from "vitest";
import { withCanvasContext } from "../city/canvas-double.ts";
import type { Vec2 } from "../route/geo.ts";
import { DEFAULT_ZONE, type Zone } from "../safety/zone.ts";
import type { PanelSide } from "../ui/panel-side.ts";
import { MINIMAP_MAX_POINTS, createMinimap, mapProjection } from "./minimap.ts";

const head = { position: { x: 0, y: 1.6, z: 0 }, orientation: { x: 0, y: 0, z: 0, w: 1 } };
const view = (extra: { show?: boolean; opacity?: number; pose?: typeof head | undefined; side?: PanelSide; zone?: Zone } = {}) => ({
  show: true, opacity: 1, pose: head, side: "right" as PanelSide, zone: DEFAULT_ZONE, ...extra,
});
const walk: Vec2[] = Array.from({ length: 1000 }, (_, i) => ({ x: i, z: i < 500 ? 0 : i - 500 }));

function setup(route: readonly Vec2[] = walk) {
  const context = {
    fillRect: vi.fn(), beginPath: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(), stroke: vi.fn(), arc: vi.fn(), fill: vi.fn(),
    fillStyle: "", strokeStyle: "", lineWidth: 0, lineJoin: "", globalCompositeOperation: "",
  };
  const doc = withCanvasContext(new Window().document as unknown as Document, context);
  return { map: createMinimap(doc, route), context, doc };
}

describe("minicarte du casque", () => {
  it("APP-002: projette le tracé nord en haut, tout entier dans le carré, centré", () => {
    const project = mapProjection([{ x: 0, z: 0 }, { x: 100, z: -50 }]);
    // Le sud (z croissant) est en bas : le point le plus au nord est le plus haut.
    expect(project({ x: 0, z: -50 }).y).toBeLessThan(project({ x: 0, z: 0 }).y);
    expect(project({ x: 0, z: 0 }).x).toBeLessThan(project({ x: 100, z: 0 }).x);
    expect(project({ x: 50, z: -25 })).toEqual({ x: 128, y: 128 });
    // Un parcours réduit à un point ne donne pas une échelle infinie.
    expect(Number.isFinite(mapProjection([{ x: 3, z: 3 }]) ({ x: 3, z: 3 }).x)).toBe(true);
  });

  it("APP-002: dessine le tracé sous le plafond de points, avec le point courant", () => {
    const { map, context } = setup();
    map.update(walk[0] as Vec2, view());
    expect(context.moveTo).toHaveBeenCalledTimes(1);
    expect(context.moveTo.mock.calls.length + context.lineTo.mock.calls.length).toBeLessThanOrEqual(MINIMAP_MAX_POINTS);
    expect(context.arc).toHaveBeenCalledTimes(1);
  });

  it("APP-002: ne redessine que lorsque le point a bougé d'un pas", () => {
    const { map, context } = setup();
    map.update({ x: 100, z: 0 }, view());
    map.update({ x: 100.1, z: 0 }, view({ opacity: 0.5 }));
    expect(context.fillRect).toHaveBeenCalledTimes(1);
    map.update({ x: 400, z: 0 }, view());
    expect(context.fillRect).toHaveBeenCalledTimes(2);
  });

  it("APP-002: rend la case du point, qui avance avec la marche", () => {
    const { map } = setup();
    expect(map.update({ x: 0, z: 0 }, view())).not.toBe(map.update({ x: 400, z: 0 }, view()));
  });

  it("APP-001: suit le fondu de la ville, sans ciel ni fond opaque", () => {
    const { map } = setup();
    const material = map.mesh.material as { opacity: number; transparent: boolean; depthWrite: boolean };
    map.update(walk[0] as Vec2, view({ opacity: 0.5 }));
    expect(map.mesh.visible).toBe(true);
    expect(material).toMatchObject({ opacity: 0.5, transparent: true, depthWrite: false });
    map.update(walk[0] as Vec2, view({ opacity: 0 }));
    expect(map.mesh.visible).toBe(false);
  });

  it("APP-001: reste cachée sans pose, ou quand le bouton B a masqué le panneau", () => {
    const { map } = setup();
    map.update(walk[0] as Vec2, view({ pose: undefined }));
    expect(map.mesh.visible).toBe(false);
    map.update(walk[0] as Vec2, view({ show: false }));
    expect(map.mesh.visible).toBe(false);
  });

  it("APP-001: se pose du côté opposé au panneau et jamais dans la zone tapis", () => {
    const { map } = setup();
    const far = { ...DEFAULT_ZONE, x: 50 };
    map.update(walk[0] as Vec2, view({ side: "right", zone: far }));
    expect(map.mesh.position.x).toBeLessThan(0);
    map.update(walk[0] as Vec2, view({ side: "left", zone: far }));
    expect(map.mesh.position.x).toBeGreaterThan(0);
    map.update(walk[0] as Vec2, view({ zone: { ...DEFAULT_ZONE, width: 40, depth: 40 } }));
    expect(map.mesh.visible).toBe(false);
  });

  it("dit l'échec d'un canevas 2D indisponible", () => {
    const doc = withCanvasContext(new Window().document as unknown as Document, null);
    expect(() => createMinimap(doc, walk)).toThrow("Canvas 2D indisponible");
  });
});
