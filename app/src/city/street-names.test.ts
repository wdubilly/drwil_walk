import { Window } from "happy-dom";
import { Mesh, Vector3 } from "three";
import { describe, expect, it } from "vitest";
import { createPath } from "../route/path.ts";
import { withCanvasContext } from "./canvas-double.ts";
import type { Road } from "./souq-data.ts";
import { MAX_NAME_DISTANCE_M, MAX_STREET_NAMES, buildStreetLabels, pickStreetLabels } from "./street-names.ts";

const route = createPath([{ x: 0, z: 0 }, { x: 0, z: -100 }]);
const across = (name: string | undefined, z: number, x = 0, extra: Partial<Road> = {}): Road => ({
  highway: "residential",
  points: [{ x: x - 30, z }, { x, z }, { x: x + 30, z }],
  ...(name === undefined ? {} : { name }),
  ...extra,
});
const doc = (): Document => withCanvasContext(new Window().document as unknown as Document);

describe("noms des rues", () => {
  it("APP-003: une plaque par nom, au sommet de la rue le plus proche du parcours", () => {
    const [label] = pickStreetLabels([across("Rue du Souk", -50, 4)], route);
    expect(label).toMatchObject({ text: "Rue du Souk", at: { x: 4, z: -50 } });
  });

  it("APP-003: ignore les rues sans nom, les cheminements piétons et celles trop loin du parcours", () => {
    const roads = [across(undefined, -10), across("Piéton", -20, 0, { footway: "crossing" }), across("Loin", -30, 500)];
    expect(pickStreetLabels(roads, route)).toEqual([]);
    expect(MAX_NAME_DISTANCE_M).toBeLessThanOrEqual(60);
  });

  it("APP-003: un nom porté par plusieurs voies n'a qu'une plaque, la plus proche", () => {
    const labels = pickStreetLabels([across("Rue A", -50, 20), across("Rue A", -60, 5)], route);
    expect(labels).toHaveLength(1);
    expect(labels[0]?.at).toEqual({ x: 5, z: -60 });
  });

  it("APP-003: le nombre de plaques est plafonné, les plus proches du parcours d'abord", () => {
    const roads = Array.from({ length: MAX_STREET_NAMES + 5 }, (_, i) => across(`Rue ${String(i)}`, -(i + 1) * 5, 10 + i));
    const labels = pickStreetLabels(roads, route);
    expect(labels).toHaveLength(MAX_STREET_NAMES);
    expect(labels[0]?.text).toBe("Rue 0");
  });

  it("APP-003: le texte se lit dans le sens de la marche, que la rue soit tracée dans un sens ou dans l'autre", () => {
    const along = (from: number, to: number): Road => ({ highway: "residential", name: "Rue", points: [{ x: 5, z: from }, { x: 5, z: to }] });
    expect(pickStreetLabels([along(-80, -20)], route)[0]?.direction.z).toBeLessThan(0);
    expect(pickStreetLabels([along(-20, -80)], route)[0]?.direction.z).toBeLessThan(0);
  });
});

describe("plaques posées sur le sol", () => {
  it("APP-003: une plaque à plat au-dessus du sol, qui se lit dans le sens de la marche", () => {
    const group = buildStreetLabels(doc(), [{ highway: "residential", name: "Rue du Souk", points: [{ x: 5, z: -20 }, { x: 5, z: -80 }] }], route);
    const plate = group.children[0] as Mesh;
    expect(group.name).toBe("noms-de-rues");
    expect(plate.name).toBe("rue-Rue du Souk");
    expect(plate.position.y).toBeGreaterThan(0);
    expect(plate.position.y).toBeLessThan(0.5);
    plate.updateMatrixWorld();
    expect(new Vector3(1, 0, 0).applyEuler(plate.rotation).toArray().map((v) => Math.round(v))).toEqual([0, 0, -1].map((v) => v + 0));
    expect(new Vector3(0, 0, 1).applyEuler(plate.rotation).y).toBeCloseTo(1);
  });

  it("QUA-002: sans canevas 2D, le dit au lieu de dessiner de travers", () => {
    expect(() => buildStreetLabels(withCanvasContext(new Window().document as unknown as Document, null), [across("Rue", -50)], route)).toThrow("Canvas 2D indisponible");
  });

  it("APP-003: sans rue nommée près du parcours, un groupe vide", () => {
    expect(buildStreetLabels(doc(), [], route).children).toHaveLength(0);
  });
});
