import { InstancedMesh } from "three";
import { describe, expect, it } from "vitest";
import { createPath } from "../route/path.ts";
import { MAX_FURNITURE, MAX_TREES, buildFurniture, buildTrees, nearest } from "./props.ts";
import type { Prop } from "./souq-data.ts";

const route = createPath([{ x: 0, z: 0 }, { x: 0, z: -100 }]);
const at = (kind: Prop["kind"], x: number): Prop => ({ kind, at: { x, z: -50 } });

describe("arbres et mobilier urbain", () => {
  it("APP-003: garde les éléments les plus proches du parcours, dans la limite du plafond", () => {
    const props = [at("tree", 40), at("tree", 2), at("tree", 9)];
    expect(nearest(props, route, 2).map((p) => p.at.x)).toEqual([2, 9]);
  });

  it("APP-003: les arbres sont les instances d'un seul maillage, plafonnées", () => {
    const many = Array.from({ length: MAX_TREES + 50 }, (_, i) => at("tree", i + 1));
    const trees = buildTrees([...many, at("bench", 1)], route);
    expect(trees).toBeInstanceOf(InstancedMesh);
    expect(trees.count).toBe(MAX_TREES);
    expect(trees.name).toBe("arbres");
    expect(buildTrees([], route).count).toBe(0);
  });

  it("APP-003: lampadaires et bancs sont fusionnés en un seul maillage coloré, plafonné, sans arbre", () => {
    const furniture = buildFurniture([at("lamp", 3), at("bench", -3), at("tree", 1)], route);
    expect(furniture.name).toBe("mobilier");
    const geometry = furniture.geometry;
    geometry.computeBoundingBox();
    // Le lampadaire dépasse les 5 m ; le banc, posé au sol, reste bas.
    expect(geometry.boundingBox?.max.y).toBeGreaterThan(5);
    expect(geometry.getAttribute("color").count).toBe(geometry.getAttribute("position").count);
    const capped = buildFurniture(Array.from({ length: MAX_FURNITURE + 20 }, (_, i) => at("bench", i)), route);
    expect(capped.geometry.getAttribute("position").count).toBe(MAX_FURNITURE * 36);
    expect(buildFurniture([at("tree", 1)], route).geometry.getAttribute("position")).toBeUndefined();
  });
});
