import { Window } from "happy-dom";
import { Group, Mesh } from "three";
import { describe, expect, it } from "vitest";
import { createPath } from "../route/path.ts";
import { DEFAULT_ZONE } from "../safety/zone.ts";
import { withCanvasContext } from "./canvas-double.ts";
import { MAX_CITY_MESHES, createSouqScene, setCityOpacity } from "./souq.ts";
import { MAX_FURNITURE, MAX_GENERATED_LAMPS, buildFurniture, countSources } from "./props.ts";
import type { Prop, Souq } from "./souq-data.ts";
import { createZoneClip } from "./zone-clip.ts";

const route = createPath([{ x: 0, z: 0 }, { x: 0, z: -600 }]);
const souq: Souq = {
  origin: [51.5, 25.3],
  route,
  palette: { ground: 0x808080, road: 0x202020, buildings: [0xff0000] },
  roads: [{ highway: "tertiary", id: 3, points: [{ x: 0, z: 0 }, { x: 0, z: -600 }] }],
  areas: [],
  hedges: [],
  props: [{ kind: "bench", source: "osm", at: { x: 5, z: -10 } }, { kind: "tree", source: "osm", at: { x: 6, z: -10 } }],
  buildings: [],
};
const doc = () => withCanvasContext(new Window().document as unknown as Document);
const furnitureOf = (scene: Group): Mesh => scene.getObjectByName("mobilier") as Mesh;

describe("lampadaires produits dans la scène", () => {
  it("APP-013: visibles par défaut, le relevé et le produit sont comptés à part, sans maillage en plus", () => {
    const { furnitureSources, osm } = createSouqScene(doc(), souq);
    expect(furnitureSources.osm).toBe(1);
    expect(furnitureSources.generated).toBeGreaterThan(10);
    expect(osm.children.length).toBeLessThanOrEqual(MAX_CITY_MESHES);
    expect(osm.children.filter((c) => c.name === "mobilier")).toHaveLength(1);
  });

  it("APP-013: le relevé est écrit sur la page : combien d'objets viennent d'OpenStreetMap, combien sont produits", () => {
    const page = doc();
    page.body.append(Object.assign(page.createElement("main"), { id: "app" }));
    const { furnitureSources } = createSouqScene(page, souq, { maxGeneratedLamps: 4 });
    expect(furnitureSources).toEqual({ osm: 1, generated: 4 });
    expect((page.getElementById("app") as HTMLElement).dataset["mobilier"]).toBe("1 d'OpenStreetMap · 4 produits");
  });

  it("APP-013: le moteur peut préparer une variante sans lampadaires produits, sans changer le relevé", () => {
    const page = doc();
    expect(createSouqScene(page, souq).furnitureSources.generated).toBeGreaterThan(0);
    expect(createSouqScene(page, souq, { generatedLamps: false }).furnitureSources).toEqual({ osm: 1, generated: 0 });
    expect(createSouqScene(doc(), souq, { generatedLamps: false }).furnitureSources.generated).toBe(0);
    expect(createSouqScene(page, souq, { generatedLamps: true }).furnitureSources.generated).toBeGreaterThan(0);
  });

  it("APP-006: le plafond des lampadaires produits est à part : le mobilier réel n'est jamais évincé", () => {
    const capped = createSouqScene(doc(), souq, { maxGeneratedLamps: 5 }).furnitureSources;
    expect(capped).toEqual({ osm: 1, generated: 5 });
    const benches: Prop[] = Array.from({ length: MAX_FURNITURE }, (_, i) => ({ kind: "bench", source: "osm", at: { x: 8, z: -i } }));
    const lamps: Prop[] = Array.from({ length: MAX_GENERATED_LAMPS + 50 }, (_, i) => ({ kind: "lamp", source: "generated", at: { x: -4, z: -i } }));
    const mesh = buildFurniture(benches, route, MAX_FURNITURE, lamps);
    expect(mesh.userData["sources"]).toEqual({ osm: MAX_FURNITURE, generated: MAX_GENERATED_LAMPS });
    expect(countSources([...benches, ...lamps])).toEqual({ osm: MAX_FURNITURE, generated: MAX_GENERATED_LAMPS + 50 });
  });

  it("APP-001: les lampadaires produits s'effacent avec la ville tête baissée", () => {
    const { world } = createSouqScene(doc(), souq);
    setCityOpacity(world, 0, createZoneClip(DEFAULT_ZONE).planes);
    expect(world.visible).toBe(false);
    setCityOpacity(world, 0.5, createZoneClip(DEFAULT_ZONE).planes);
    const material = furnitureOf(world).material as { opacity: number; clippingPlanes: unknown[] };
    expect(material.opacity).toBe(0.5);
    expect(material.clippingPlanes.length).toBeGreaterThan(0);
  });
});
