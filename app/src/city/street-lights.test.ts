import { Window } from "happy-dom";
import { AddEquation, CustomBlending, Group, InstancedMesh, Matrix4, Mesh, OneFactor, Scene, Vector3, ZeroFactor, type MeshBasicMaterial } from "three";
import { describe, expect, it } from "vitest";
import { createPath } from "../route/path.ts";
import { DEFAULT_ZONE } from "../safety/zone.ts";
import { renderLampsChoices } from "../ui/lamps-choice.ts";
import { startAmbience } from "../xr/ambience.ts";
import { withCanvasContext } from "./canvas-double.ts";
import { LANTERN_AT_M, furnitureParts } from "./furniture.ts";
import { MAX_CITY_MESHES, createSouqScene, setCityOpacity } from "./souq.ts";
import type { Souq } from "./souq-data.ts";
import { HALO_CORE, HALO_RADIUS_M, STREET_LIGHTS_NAME, buildStreetLights, haloGeometry, lampMatrix } from "./street-lights.ts";
import { createZoneClip } from "./zone-clip.ts";

const route = createPath([{ x: 0, z: 0 }, { x: 0, z: -600 }]);
const souq: Souq = {
  origin: [51.5, 25.3],
  route,
  palette: { ground: 0x808080, road: 0x202020, buildings: [0xff0000] },
  roads: [{ highway: "tertiary", id: 3, points: [{ x: 0, z: 0 }, { x: 0, z: -600 }] }],
  areas: [],
  hedges: [],
  props: [{ kind: "lamp", source: "osm", at: { x: 5, z: -10 }, yaw: 0.4 }, { kind: "bench", source: "osm", at: { x: 6, z: -12 } }],
  buildings: [],
};
const doc = () => withCanvasContext(new Window().document as unknown as Document);
const lightsOf = (group: Group) => group.getObjectByName(STREET_LIGHTS_NAME) as Group;
const at = (hour: number) => () => new Date(2026, 10, 5, hour, 0);
const ambience = (scene: Scene, hour: number) => startAmbience({ scene, target: "casque", fog: false, soundPct: 0, now: at(hour), window: null });

describe("lanternes allumées la nuit", () => {
  it("APP-011: chaque lampadaire dessiné, du relevé comme produit, a sa lanterne et son halo, en deux maillages sans aucune lumière", () => {
    const { osm, furnitureSources } = createSouqScene(doc(), souq);
    const lights = lightsOf(osm);
    const [lanterns, halos] = lights.children as InstancedMesh[];
    const lamps = furnitureSources.generated + 1;
    expect(lights.userData["count"]).toBe(lamps);
    expect(lanterns?.count).toBe(lamps);
    expect(halos?.count).toBe(lamps);
    let sources = 0;
    lights.traverse((o) => {
      if ("isLight" in o) sources++;
    });
    expect(sources).toBe(0);
    let meshes = 0;
    osm.traverse((o) => {
      if (o instanceof Mesh) meshes++;
    });
    expect(meshes).toBeLessThanOrEqual(MAX_CITY_MESHES);
  });

  it("APP-011: la lanterne allumée est à la place de celle du mât, le halo au sol juste dessous", () => {
    const lamp = { at: { x: 5, z: -10 }, yaw: 0.4 };
    const group = buildStreetLights([lamp]);
    const [lanterns, halos] = group.children as InstancedMesh[];
    const placed = new Matrix4();
    (lanterns as InstancedMesh).getMatrixAt(0, placed);
    lampMatrix(lamp).elements.forEach((value, i) => { expect(placed.elements[i]).toBeCloseTo(value, 5); });
    (lanterns as InstancedMesh).geometry.computeBoundingBox();
    const glow = ((lanterns as InstancedMesh).geometry.boundingBox?.getCenter(new Vector3()) as Vector3).applyMatrix4(placed);
    const pole = furnitureParts({ kind: "lamp", source: "osm", at: lamp.at }, lamp.yaw)[3];
    pole?.computeBoundingBox();
    const lit = pole?.boundingBox?.getCenter(new Vector3()) as Vector3;
    expect(glow.distanceTo(lit)).toBeLessThan(1e-5);
    (halos as InstancedMesh).geometry.computeBoundingBox();
    const halo = (halos as InstancedMesh).geometry.boundingBox;
    expect(halo?.max.y).toBeLessThan(0.1);
    expect((halo?.max.z ?? 0) - LANTERN_AT_M.z).toBeCloseTo(HALO_RADIUS_M);
  });

  it("APP-001: le halo éclaircit le sol sans jamais toucher à l'alpha de l'image, donc sans rien masquer du réel", () => {
    const halos = buildStreetLights([]).getObjectByName("halos") as Mesh;
    const material = halos.material as MeshBasicMaterial;
    expect(material.blending).toBe(CustomBlending);
    expect(material.blendEquation).toBe(AddEquation);
    expect(material.blendDst).toBe(OneFactor);
    expect([material.blendSrcAlpha, material.blendDstAlpha]).toEqual([ZeroFactor, OneFactor]);
    expect(material.depthWrite).toBe(false);
    expect(halos.renderOrder).toBeGreaterThan(0);
    const colors = haloGeometry().getAttribute("color");
    expect(colors.getX(0)).toBeCloseTo(((HALO_CORE >> 16) & 0xff) / 255);
    expect(colors.getX(colors.count - 1)).toBe(0);
  });

  it("APP-011: la nuit, soleil sous l'horizon, les lanternes brillent ; le jour, elles sont éteintes", () => {
    const night = createSouqScene(doc(), souq);
    expect(lightsOf(night.osm).visible).toBe(false);
    expect(ambience(night.scene, 23).lanterns).toBe("allumées");
    expect(lightsOf(night.osm).visible).toBe(true);
    const day = createSouqScene(doc(), souq);
    expect(ambience(day.scene, 12).lanterns).toBe("éteintes");
    expect(lightsOf(day.osm).visible).toBe(false);
    expect(ambience(day.scene, 5).lanterns).toBe("allumées");
    expect(ambience(day.scene, 19).lanterns).toBe("allumées");
    expect(ambience(day.scene, 7).lanterns).toBe("éteintes");
  });

  it("APP-011: la case « Lampadaires allumés la nuit », cochée par défaut, retire les lanternes décochée", () => {
    const page = doc();
    page.body.append(...renderLampsChoices(page));
    expect(lightsOf(createSouqScene(page, souq).osm)).toBeDefined();
    (page.getElementById("lampadaires-allumes") as HTMLInputElement).checked = false;
    const off = createSouqScene(page, souq);
    expect(lightsOf(off.osm)).toBeUndefined();
    expect(ambience(off.scene, 23).lanterns).toBe("absentes");
    expect(lightsOf(createSouqScene(doc(), souq, { streetLights: false }).osm)).toBeUndefined();
    expect(lightsOf(createSouqScene(page, souq, { streetLights: true }).osm)).toBeDefined();
  });

  it("APP-001: les lanternes et leurs halos s'effacent avec la ville tête baissée et sont découpés dans la zone tapis", () => {
    const { world, osm } = createSouqScene(doc(), souq);
    const planes = createZoneClip(DEFAULT_ZONE).planes;
    setCityOpacity(world, 0.3, planes);
    for (const mesh of lightsOf(osm).children as Mesh[]) {
      const material = mesh.material as MeshBasicMaterial;
      expect([material.transparent, material.opacity]).toEqual([true, 0.3]);
      expect(material.clippingPlanes).toBe(planes);
    }
    setCityOpacity(world, 0, planes);
    expect(world.visible).toBe(false);
  });
});
