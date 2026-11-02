import { Group, Mesh, Scene } from "three";
import { describe, expect, it, vi } from "vitest";
import { UNAVAILABLE, WINDOW_FRAMES, createDiagnostics, diagnosticLine, diagnosticRows } from "./diagnostics.ts";

const renderer = { info: { render: { calls: 12, triangles: 3456 }, memory: { geometries: 7, textures: 3 } } };

describe("diagnostic de rendu : mesures", () => {
  it("APP-002: les images par seconde et le temps d'image (moyen, pire) se lisent sur la fenêtre glissante", () => {
    const d = createDiagnostics(3);
    for (const t of [0, 10, 30, 40, 60]) d.tick(t);
    // Fenêtre de 3 images : 30→40 (10 ms), 40→60 (20 ms) et 10→30 (20 ms).
    const m = d.sample(renderer, new Scene());
    expect(m).toMatchObject({ frameMeanMs: (20 + 10 + 20) / 3, frameWorstMs: 20, windowFrames: 3 });
    expect(m.fps).toBeCloseTo(60, 5);
  });

  it("APP-002: sans image mesurée ou à un instant déjà vu, rien n'est inventé", () => {
    const d = createDiagnostics();
    d.tick(5);
    d.tick(5);
    expect(d.sample(renderer, new Scene())).toMatchObject({ fps: null, frameMeanMs: null, frameWorstMs: null, windowFrames: 0 });
    expect(WINDOW_FRAMES).toBeGreaterThan(1);
  });

  it("APP-002: lit les appels, les triangles et la mémoire graphique de renderer.info, et compte les objets visibles", () => {
    const scene = new Scene();
    const hidden = new Mesh();
    hidden.visible = false;
    const group = new Group();
    group.add(new Mesh(), hidden);
    scene.add(group);
    const m = createDiagnostics().sample(renderer, scene);
    expect(m).toMatchObject({ calls: 12, triangles: 3456, geometries: 7, textures: 3, objects: 3 });
  });

  it("QUA-002: une valeur illisible est dite « indisponible », jamais inventée", () => {
    const d = createDiagnostics();
    for (const bad of [{}, { info: {} }, { info: { render: { calls: "x", triangles: NaN }, memory: {} } }]) {
      const m = d.sample(bad, new Scene());
      expect(m).toMatchObject({ calls: null, triangles: null, geometries: null, textures: null });
    }
    const rows = diagnosticRows(d.sample({}, new Scene()));
    expect(rows.filter((r) => r.value === UNAVAILABLE).map((r) => r.field)).toEqual(["fps", "frame-mean", "frame-worst", "calls", "triangles", "geometries", "textures"]);
    expect(diagnosticLine(d.sample({}, new Scene()))).toBe(`${UNAVAILABLE} · ${UNAVAILABLE} · ${UNAVAILABLE} · ${UNAVAILABLE}`);
  });

  it("APP-002: les valeurs se disent en français", () => {
    const d = createDiagnostics();
    d.tick(0);
    d.tick(12.5);
    const m = d.sample(renderer, new Scene());
    expect(diagnosticRows(m).map((r) => r.value)).toEqual(["80,0 i/s", "12,5 ms", "12,5 ms", "12", "3456", "1", "7", "3"]);
    expect(diagnosticLine(m)).toBe("80 i/s · 12,5 ms · 12 appels · 3456 tri");
  });

  it("APP-002: masqué par défaut, et masqué il ne lit ni renderer.info ni la scène", () => {
    const d = createDiagnostics();
    const read = vi.fn(() => ({ render: {}, memory: {} }));
    const spied = { get info() { return read(); } };
    const scene = new Scene();
    const traverse = vi.spyOn(scene, "traverseVisible");
    d.tick(0);
    d.tick(14);
    expect(d.visible()).toBe(false);
    expect(d.measure(spied, scene)).toBeUndefined();
    expect(read).not.toHaveBeenCalled();
    expect(traverse).not.toHaveBeenCalled();
    d.toggle();
    expect(d.visible()).toBe(true);
    expect(d.measure(spied, scene)).toBeDefined();
    d.toggle();
    expect(d.measure(spied, scene)).toBeUndefined();
  });
});
