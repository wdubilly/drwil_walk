import { Group, Mesh, MeshBasicMaterial, type Material } from "three";
import { describe, expect, it } from "vitest";
import { setCityOpacity } from "../city/souq.ts";
import { MARKER_COLORS, createChoiceMarkers } from "./choice-markers.ts";
import type { Candidate } from "./guide.ts";

const candidate = (to: number, x: number, z: number): Candidate => ({ to, isDefault: false, dir: { x: Math.sign(x), z: Math.sign(z) }, tip: { x, z } });
const colorOf = (arrow: unknown) => ((arrow as Mesh).material as MeshBasicMaterial).color.getHex();

describe("APP-002: flèches des rues proposées", () => {
  it("apparaissent à l'approche d'un carrefour et disparaissent après", () => {
    const city = new Group();
    const markers = createChoiceMarkers(city);
    expect(city.children).toContain(markers.group);
    expect(markers.group.visible).toBe(false);
    markers.update([candidate(1, 0, -8), candidate(2, 8, 0)], undefined, undefined);
    expect(markers.group.visible).toBe(true);
    expect(markers.group.children).toHaveLength(2);
    markers.update([], undefined, undefined);
    expect(markers.group.visible).toBe(false);
  });

  it("se colorent selon l'état : proposée, pointée, choisie", () => {
    const markers = createChoiceMarkers(new Group());
    const cands = [candidate(1, 0, -8), candidate(2, 8, 0), candidate(3, -8, 0)];
    markers.update(cands, 2, 3);
    expect(markers.group.children.map(colorOf)).toEqual([MARKER_COLORS.offered, MARKER_COLORS.pointed, MARKER_COLORS.chosen]);
    markers.update(cands, undefined, undefined);
    expect(markers.group.children.map(colorOf)).toEqual([MARKER_COLORS.offered, MARKER_COLORS.offered, MARKER_COLORS.offered]);
  });

  it("ne sont reconstruites que quand les rues changent", () => {
    const markers = createChoiceMarkers(new Group());
    markers.update([candidate(1, 0, -8)], undefined, undefined);
    const first = markers.group.children[0];
    markers.update([candidate(1, 0, -8)], 1, undefined);
    expect(markers.group.children[0]).toBe(first);
    markers.update([candidate(4, 0, 8)], undefined, undefined);
    expect(markers.group.children[0]).not.toBe(first);
  });

  it("APP-001: suivent le fondu de sécurité et la découpe de la zone tapis comme la ville", () => {
    const world = new Group();
    const city = new Group();
    world.add(city);
    const markers = createChoiceMarkers(city);
    markers.update([candidate(1, 0, -8)], undefined, undefined);
    const arrow = markers.group.children[0] as Mesh;
    setCityOpacity(world, 0.4, []);
    expect((arrow.material as Material).opacity).toBe(0.4);
    expect((arrow.material as Material).clippingPlanes).toEqual([]);
    setCityOpacity(world, 0, []);
    expect(world.visible).toBe(false);
  });
});
