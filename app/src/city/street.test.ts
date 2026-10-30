import { Group, HemisphereLight, Mesh, type Material } from "three";
import { describe, expect, it } from "vitest";
import { STREET_LENGTH_M } from "../route/walk.ts";
import { createStreet, createStreetScene, placeStreet, setCityOpacity } from "./street.ts";

function materials(city: Group): Material[] {
  const found: Material[] = [];
  city.traverse((o) => {
    if (o instanceof Mesh) found.push(o.material as Material);
  });
  return found;
}

describe("rue simple", () => {
  it("pose un sol et des blocs des deux côtés, sur toute la longueur de la boucle", () => {
    const city = createStreet();
    const meshes = city.children.filter((c) => c instanceof Mesh);
    expect(meshes.length).toBeGreaterThan(2);
    const zs = meshes.map((m) => m.position.z);
    expect(Math.min(...zs)).toBeLessThan(-STREET_LENGTH_M);
    expect(meshes.some((m) => m.position.x < 0)).toBe(true);
    expect(meshes.some((m) => m.position.x > 0)).toBe(true);
  });

  it("APP-001: rend la ville transparente, puis invisible à opacité nulle", () => {
    const city = createStreet();
    setCityOpacity(city, 0.4);
    expect(city.visible).toBe(true);
    expect(materials(city).every((m) => m.transparent && m.opacity === 0.4)).toBe(true);
    setCityOpacity(city, 0);
    expect(city.visible).toBe(false);
    setCityOpacity(city, 1);
    expect(city.visible).toBe(true);
    expect(materials(city).every((m) => !m.transparent && m.opacity === 1)).toBe(true);
  });

  it("ignore ce qui n'est pas un maillage", () => {
    const city = createStreet();
    city.add(new Group());
    expect(() => {
      setCityOpacity(city, 0.5);
    }).not.toThrow();
  });

  it("avance la rue vers l'utilisateur", () => {
    const city = createStreet();
    placeStreet(city, 7);
    expect(city.position.z).toBe(7);
  });

  it("laisse le fond vide pour le passthrough, avec une lumière et la rue", () => {
    const { scene, camera, city } = createStreetScene();
    expect(scene.background).toBeNull();
    expect(scene.children.some((c) => c instanceof HemisphereLight)).toBe(true);
    expect(scene.children).toContain(city);
    expect(camera.near).toBeGreaterThan(0);
  });
});
