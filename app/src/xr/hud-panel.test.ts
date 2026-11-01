import { Window } from "happy-dom";
import { Vector3 } from "three";
import { describe, expect, it, vi } from "vitest";
import { withCanvasContext } from "../city/canvas-double.ts";
import { contrastRatio } from "../ui/contrast.ts";
import { HUD_BACKGROUND_ALPHA, HUD_BACKGROUND_RGB, HUD_TEXT, createHudPanel, type HudInfo } from "./hud-panel.ts";
import { DEFAULT_ZONE, zonePlanes, type Zone } from "../safety/zone.ts";
import type { PanelSide } from "../ui/panel-side.ts";

const info: HudInfo = {
  speedKmh: 4, distanceM: 12.34, timeS: 65, kcal: 7.4, compass: "NE 45°", clock: "09:05", place: "Doha Souq Waqif", paused: false,
};
const head = { position: { x: 0, y: 1.6, z: 0 }, orientation: { x: 0, y: 0, z: 0, w: 1 } };
/** Ce que la boucle de rendu donne au panneau : par défaut côté droit, zone tapis par défaut. */
const view = (extra: { show?: boolean; opacity?: number; pose?: typeof head | undefined; side?: PanelSide; zone?: Zone } = {}) => ({
  show: true, opacity: 1, pose: head, side: "right" as PanelSide, zone: DEFAULT_ZONE, ...extra,
});
const hex = (rgb: readonly number[]) => `#${rgb.map((c) => Math.round(c).toString(16).padStart(2, "0")).join("")}`;
/** Le fond mélangé au réel `behind` (« #rrggbb ») : la couleur que l'œil voit derrière le texte. */
const over = (behind: string) => {
  const real = [1, 3, 5].map((i) => Number.parseInt(behind.slice(i, i + 2), 16));
  return hex(HUD_BACKGROUND_RGB.map((c, i) => c * HUD_BACKGROUND_ALPHA + (real[i] ?? 0) * (1 - HUD_BACKGROUND_ALPHA)));
};
/** Un point de la zone tapis : la distance aux six plans de sa boîte est négative partout. */
const insideZone = (zone: Zone, p: Vector3) =>
  zonePlanes(zone).every(({ normal, constant }) => normal.x * p.x + normal.y * p.y + normal.z * p.z + constant < 0);

function setup() {
  const context = { fillRect: vi.fn(), fillText: vi.fn() };
  const doc = withCanvasContext(new Window().document as unknown as Document, context);
  return { panel: createHudPanel(doc), context, doc };
}

describe("panneau d'infos dans le casque", () => {
  it("APP-002: dessine boussole, heure, lieu, vitesse, durée, distance et calories « environ »", () => {
    const { panel, context } = setup();
    panel.update(info, view());
    const lines = context.fillText.mock.calls.map((call) => call[0] as string);
    expect(lines).toEqual(["NE 45°", "09:05", "Doha Souq Waqif", "4,0 km/h", "1 min 05 s", "12,3 m", "environ 7 kcal"]);
  });

  it("APP-002: dit la pause avec la vitesse", () => {
    const { panel, context } = setup();
    panel.update({ ...info, paused: true }, view());
    expect(context.fillText.mock.calls[3]?.[0]).toBe("4,0 km/h · PAUSE");
  });

  it("n'est redessiné que lorsqu'une valeur affichée change", () => {
    const { panel, context } = setup();
    panel.update(info, view());
    panel.update({ ...info, distanceM: 12.341 }, view({ opacity: 0.5 }));
    expect(context.fillRect).toHaveBeenCalledTimes(1);
    panel.update({ ...info, distanceM: 12.5 }, view());
    expect(context.fillRect).toHaveBeenCalledTimes(2);
    panel.update({ ...info, distanceM: 12.5, clock: "09:06" }, view());
    expect(context.fillRect).toHaveBeenCalledTimes(3);
    panel.update({ ...info, distanceM: 12.5, clock: "09:06", kcal: 7.6 }, view());
    expect(context.fillRect).toHaveBeenCalledTimes(4);
  });

  it("APP-001: suit le fondu de la ville et disparaît à opacité nulle", () => {
    const { panel } = setup();
    const material = panel.mesh.material as { opacity: number; transparent: boolean };
    panel.update(info, view({ opacity: 0.5 }));
    expect(panel.mesh.visible).toBe(true);
    expect(material).toMatchObject({ opacity: 0.5, transparent: true });
    panel.update(info, view({ opacity: 0 }));
    expect(panel.mesh.visible).toBe(false);
    panel.update(info, view());
    // Le fond est translucide : la matière reste transparente, même à pleine opacité.
    expect(material).toMatchObject({ opacity: 1, transparent: true });
  });

  it("APP-001: reste caché sans pose, ou quand le bouton B l'a masqué", () => {
    const { panel } = setup();
    panel.update(info, view({ pose: undefined }));
    expect(panel.mesh.visible).toBe(false);
    panel.update(info, view({ show: false }));
    expect(panel.mesh.visible).toBe(false);
  });

  it("APP-001: a un fond légèrement transparent, et son texte reste lisible même sur un réel blanc ou noir", () => {
    const { panel, context } = setup();
    panel.update(info, view());
    expect(HUD_BACKGROUND_ALPHA).toBeGreaterThan(0.5);
    expect(HUD_BACKGROUND_ALPHA).toBeLessThan(1);
    expect(context).toMatchObject({ fillStyle: HUD_TEXT, globalCompositeOperation: "source-over" });
    for (const real of ["#ffffff", "#000000", "#808080"]) {
      expect(contrastRatio(HUD_TEXT, over(real))).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("APP-001: peint le fond translucide en remplaçant l'image précédente, sans empiler les couches", () => {
    const { panel, context } = setup();
    const modes: unknown[] = [];
    const styles: unknown[] = [];
    context.fillRect.mockImplementation(() => {
      modes.push((context as unknown as { globalCompositeOperation: string }).globalCompositeOperation);
      styles.push((context as unknown as { fillStyle: string }).fillStyle);
    });
    panel.update(info, view());
    expect(modes).toEqual(["copy"]);
    expect(styles).toEqual(["rgba(16, 20, 28, 0.7)"]);
  });

  it.each([["left", -1], ["right", 1]] as const)(
    "APP-001: se pose en bas du champ de vision, décalé côté %s, à l'horizontale et tourné vers la tête",
    (side, sign) => {
      const { panel } = setup();
      panel.update(info, view({ side }));
      const { position, rotation } = panel.mesh;
      expect(position.y).toBeLessThan(head.position.y - 0.3);
      expect(Math.sign(position.x)).toBe(sign);
      expect(position.z).toBeLessThan(0);
      expect(rotation.x).toBe(0);
      expect(rotation.z).toBe(0);
      // La normale du panneau regarde la tête.
      const toHead = new Vector3(head.position.x - position.x, 0, head.position.z - position.z).normalize();
      const normal = new Vector3(0, 0, 1).applyEuler(rotation);
      expect(normal.dot(toHead)).toBeCloseTo(1);
    },
  );

  it("APP-001: suit le cap du regard", () => {
    const { panel } = setup();
    // Tête tournée à gauche de 90° : le côté droit du champ de vision passe devant (-Z).
    const left = { ...head, orientation: { x: 0, y: Math.SQRT1_2, z: 0, w: Math.SQRT1_2 } };
    panel.update(info, view({ pose: left }));
    expect(panel.mesh.position.x).toBeLessThan(-0.5);
    expect(panel.mesh.position.z).toBeLessThan(0);
  });

  const zones: [string, Zone][] = [
    ["par défaut", DEFAULT_ZONE],
    ["plus haute", { ...DEFAULT_ZONE, height: 2.5 }],
    ["plus large", { ...DEFAULT_ZONE, width: 3, depth: 4 }],
    ["décalée et tournée", { ...DEFAULT_ZONE, x: 0.4, z: -0.3, yawRad: 0.6, width: 1.6 }],
  ];
  it.each(zones.flatMap(([name, zone]) => (["left", "right"] as const).map((side) => [name, zone, side] as const)))(
    "APP-001: le panneau tout entier reste hors de la zone tapis %s (côté %s)",
    (_name, zone, side) => {
      const { panel } = setup();
      panel.update(info, view({ side, zone }));
      expect(panel.mesh.visible).toBe(true);
      const { width, height } = (panel.mesh.geometry as unknown as { parameters: { width: number; height: number } }).parameters;
      panel.mesh.updateMatrixWorld();
      for (let i = 0; i <= 12; i++) {
        for (let j = 0; j <= 6; j++) {
          const corner = new Vector3((i / 12 - 0.5) * width, (j / 6 - 0.5) * height, 0);
          expect(insideZone(zone, panel.mesh.localToWorld(corner))).toBe(false);
        }
      }
    },
  );

  it("APP-001: garde la même taille dans le champ de vision en s'éloignant de la zone", () => {
    const { panel } = setup();
    panel.update(info, view());
    const wide = setup().panel;
    wide.update(info, view({ zone: { ...DEFAULT_ZONE, width: 3, depth: 4 } }));
    expect(panel.mesh.scale.x).toBeGreaterThanOrEqual(1);
    expect(wide.mesh.scale.x).toBeGreaterThan(panel.mesh.scale.x);
  });

  it("APP-001: reste caché quand aucune place hors de la zone tapis n'existe à portée", () => {
    const { panel } = setup();
    panel.update(info, view({ zone: { ...DEFAULT_ZONE, width: 40, depth: 40 } }));
    expect(panel.mesh.visible).toBe(false);
    panel.update(info, view());
    expect(panel.mesh.visible).toBe(true);
  });

  it("dit pourquoi il ne peut pas se dessiner sans contexte canvas", () => {
    const doc = withCanvasContext(new Window().document as unknown as Document, null);
    expect(() => createHudPanel(doc)).toThrow("Canvas 2D indisponible");
  });
});
