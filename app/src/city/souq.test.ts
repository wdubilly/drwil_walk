import { Window } from "happy-dom";
import { Group, HemisphereLight, Mesh, type Material } from "three";
import { describe, expect, it } from "vitest";
import { withCanvasContext } from "./canvas-double.ts";
import { createPath } from "../route/path.ts";
import { createSouqScene, placeOnRoute, setCityOpacity } from "./souq.ts";
import type { Souq } from "./souq-data.ts";

const route = createPath([
  { x: 0, z: 0 },
  { x: 0, z: -100 },
  { x: 100, z: -100 },
  { x: 0, z: 0 },
]);
const souq: Souq = {
  route,
  buildings: [
    {
      heightM: 8,
      footprint: [
        { x: 5, z: -5 },
        { x: 15, z: -5 },
        { x: 15, z: -15 },
        { x: 5, z: -5 },
      ],
    },
  ],
};

function setup() {
  const doc = withCanvasContext(new Window().document as unknown as Document);
  return createSouqScene(doc, souq);
}

function materials(world: Group): Material[] {
  const found: Material[] = [];
  world.traverse((o) => {
    if (o instanceof Mesh) found.push(o.material as Material);
  });
  return found;
}

describe("scène du souk", () => {
  it("laisse le fond vide pour le passthrough, avec une lumière, le sol, les bâtiments et la mention", () => {
    const { scene, camera, world, city, buildingCount } = setup();
    expect(scene.background).toBeNull();
    expect(scene.children.some((c) => c instanceof HemisphereLight)).toBe(true);
    expect(scene.children).toContain(world);
    expect(world.children).toContain(city);
    expect(city.getObjectByName("batiments")).toBeInstanceOf(Mesh);
    expect(world.getObjectByName("attribution-osm")).toBeInstanceOf(Mesh);
    expect(buildingCount).toBe(1);
    expect(camera.near).toBeGreaterThan(0);
  });

  it("APP-001: rend la ville transparente, puis invisible à opacité nulle", () => {
    const { world } = setup();
    setCityOpacity(world, 0.4);
    expect(world.visible).toBe(true);
    expect(materials(world).every((m) => m.transparent && m.opacity === 0.4)).toBe(true);
    setCityOpacity(world, 0);
    expect(world.visible).toBe(false);
    setCityOpacity(world, 1);
    expect(world.visible).toBe(true);
    expect(materials(world).every((m) => !m.transparent && m.opacity === 1)).toBe(true);
  });

  it("ignore ce qui n'est pas un maillage", () => {
    const { world } = setup();
    world.add(new Group());
    expect(() => {
      setCityOpacity(world, 0.5);
    }).not.toThrow();
  });

  it("APP-002: amène le point du parcours sous les pieds, le nez dans le sens de la marche", () => {
    const { city } = setup();
    // À 50 m, la ville est reculée de 50 m vers l'utilisateur (+Z).
    placeOnRoute(city, route, 50);
    expect(city.rotation.y).toBeCloseTo(0);
    expect(city.position.x).toBeCloseTo(0);
    expect(city.position.z).toBeCloseTo(50);
    // Sur le tronçon vers l'est, la ville a tourné d'un quart de tour et le point (50, -100) est sous l'utilisateur.
    placeOnRoute(city, route, 150);
    expect(city.rotation.y).toBeCloseTo(Math.PI / 2, 1);
    city.updateMatrixWorld();
    const under = city.localToWorld(city.position.clone().set(50, 0, -100));
    expect(under.x).toBeCloseTo(0, 1);
    expect(under.z).toBeCloseTo(0, 1);
  });
});
