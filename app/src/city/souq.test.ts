import { Window } from "happy-dom";
import { Group, HemisphereLight, InstancedMesh, Mesh, type Material, type MeshLambertMaterial } from "three";
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
const palette = { ground: 0x808080, road: 0x202020, buildings: [0xff0000, 0x00ff00] };
const souq: Souq = {
  origin: [51.5, 25.3],
  route,
  palette,
  roads: [{ highway: "primary", points: [{ x: 0, z: 0 }, { x: 0, z: -100 }] }],
  props: [
    { kind: "tree", at: { x: 3, z: -10 } },
    { kind: "lamp", at: { x: -3, z: -20 } },
    { kind: "bench", at: { x: -3, z: -30 } },
  ],
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
    expect(city.getObjectByName("voies")).toBeInstanceOf(Mesh);
    expect(world.getObjectByName("attribution")).toBeInstanceOf(Mesh);
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

  it("APP-003: le sol, les voies et les bâtiments ont chacun leur teinte, ceux-ci par sommet", () => {
    const { city } = setup();
    const color = (name: string) => (city.getObjectByName(name) as Mesh).material as MeshLambertMaterial;
    const [ground] = (city.getObjectByName("osm") as Group).children as Mesh[];
    expect((ground?.material as MeshLambertMaterial).color.getHex()).toBe(palette.ground);
    expect(color("voies").color.getHex()).toBe(palette.road);
    expect(color("batiments").vertexColors).toBe(true);
    expect((city.getObjectByName("batiments") as Mesh).geometry.getAttribute("color").count).toBeGreaterThan(0);
  });

  it("APP-003: les arbres sont un maillage instancié, le mobilier un maillage fusionné, dans le groupe OpenStreetMap", () => {
    const { osm } = setup();
    const trees = osm.getObjectByName("arbres") as InstancedMesh;
    expect(trees.count).toBe(1);
    expect((osm.getObjectByName("mobilier") as Mesh).geometry.getAttribute("position").count).toBeGreaterThan(0);
  });

  it("APP-001: le fondu de sécurité efface aussi les arbres et le mobilier", () => {
    const { world, osm } = setup();
    setCityOpacity(world, 0.3);
    for (const name of ["arbres", "mobilier", "batiments"]) {
      const material = (osm.getObjectByName(name) as Mesh).material as Material;
      expect([name, material.transparent, material.opacity]).toEqual([name, true, 0.3]);
    }
    setCityOpacity(world, 0);
    expect(world.visible).toBe(false);
  });

  it("range le sol, les voies et les bâtiments OpenStreetMap dans un groupe que le rendu Google peut masquer", () => {
    const { city, osm, label } = setup();
    expect(city.children).toContain(osm);
    expect(osm.children.map((c) => c.name)).toContain("batiments");
    label.setText("autre mention");
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
