import { Window } from "happy-dom";
import { InstancedMesh, Matrix4, PerspectiveCamera, Vector3, type Mesh, type Scene, type WebGLRenderer } from "three";
import { describe, expect, it } from "vitest";
import bundledCatalogue from "../../assets/figurants-catalogue.json" with { type: "json" };
import { createPath } from "../route/path.ts";
import { DEFAULT_ZONE } from "../safety/zone.ts";
import { withCanvasContext } from "./canvas-double.ts";
import { createSouqScene, setCityOpacity } from "./souq.ts";
import type { Souq } from "./souq-data.ts";
import { MAX_STRETCH, buildTraffic, scaleOf } from "./traffic.ts";
import { loadBundledModels } from "./traffic-assets.ts";
import type { Agent } from "./traffic-rule.ts";
import { createZoneClip } from "./zone-clip.ts";

const souq: Souq = {
  origin: [51.53, 25.29],
  route: createPath([{ x: 0, z: 0 }, { x: 0, z: -600 }]),
  palette: { ground: 0x808080, road: 0x202020, buildings: [0xff0000] },
  roads: [
    { highway: "primary", id: 3, points: [{ x: 30, z: 0 }, { x: 30, z: -600 }] },
    { highway: "pedestrian", id: 4, points: [{ x: -20, z: 0 }, { x: -20, z: -600 }] },
  ],
  areas: [],
  hedges: [],
  props: [],
  buildings: [],
};
const page = (route = "doha-souq-waqif"): Document => {
  const doc = withCanvasContext(new Window().document as unknown as Document);
  const app = Object.assign(doc.createElement("div"), { id: "app" });
  app.dataset["route"] = route;
  doc.body.append(app);
  return doc;
};
const meshesOf = (scene: { osm: { getObjectByName: (n: string) => unknown } }): InstancedMesh[] => ((scene.osm.getObjectByName("figurants") as { children: InstancedMesh[] } | undefined)?.children ?? []);
const render = (mesh: Mesh, camera = new PerspectiveCamera()): void => {
  mesh.onBeforeRender({} as WebGLRenderer, {} as Scene, camera, mesh.geometry, mesh.material as never, null as never);
};

describe("ville vivante dans la scène", () => {
  it("APP-014: les figurants du souk sont préparés, un maillage instancié par modèle, compte écrit sur la page", async () => {
    const doc = page();
    const scene = createSouqScene(doc, souq, { traffic: true, maxVehicles: 5, maxPedestrians: 7 });
    await scene.trafficReady;
    const meshes = meshesOf(scene);
    expect(meshes.length).toBeGreaterThan(1);
    expect(new Set(meshes.map((m) => m.geometry)).size).toBe(meshes.length);
    expect(meshes.reduce((sum, m) => sum + m.count, 0)).toBe(12);
    expect(doc.getElementById("app")?.dataset["figurants"]).toBe("5 véhicules · 7 piétons");
  });

  it("APP-014: décochée, hors des itinéraires listés ou sans accueil, la scène n'en contient aucun", async () => {
    for (const doc of [page(), withCanvasContext(new Window().document as unknown as Document)]) {
      const scene = createSouqScene(doc, souq);
      await scene.trafficReady;
      expect(scene.osm.getObjectByName("figurants")).toBeUndefined();
    }
    const elsewhere = page("pune-vieille-ville");
    const scene = createSouqScene(elsewhere, souq, { traffic: true });
    await scene.trafficReady;
    expect(meshesOf(scene)).toEqual([]);
    expect(elsewhere.getElementById("app")?.dataset["figurants"]).toBe("aucun : itinéraire hors du catalogue");
  });

  it("APP-014: un fichier de modèles illisible est refusé avec sa raison, la ville reste sans figurant", async () => {
    const doc = page();
    const scene = createSouqScene(doc, souq, { traffic: true, trafficModels: () => Promise.resolve({ models: [] }) });
    await scene.trafficReady;
    expect(meshesOf(scene)).toEqual([]);
    expect(doc.getElementById("app")?.dataset["figurants"]).toBe("refusés : Error: aucun modèle de figurant");
    const thrown = buildTraffic(page(), souq, { caps: { vehicles: 1, pedestrians: 1 }, catalogue: bundledCatalogue, loadModels: () => Promise.reject(new Error("réseau")) });
    await thrown.ready;
    const quiet = buildTraffic(withCanvasContext(new Window().document as unknown as Document), souq, { caps: { vehicles: 1, pedestrians: 1 }, catalogue: bundledCatalogue, loadModels: loadBundledModels });
    await quiet.ready;
    expect(quiet.group.children).toEqual([]);
  });

  it("APP-014: avant chaque image ils avancent, et près de l'utilisateur ils sont retirés de l'image ; le fondu de la ville s'y applique", async () => {
    let t = 0;
    const doc = page();
    const traffic = buildTraffic(doc, souq, { caps: { vehicles: 3, pedestrians: 3 }, catalogue: bundledCatalogue, loadModels: loadBundledModels, now: () => t });
    await traffic.ready;
    const mesh = traffic.group.children[0] as InstancedMesh;
    const matrix = new Matrix4();
    const camera = new PerspectiveCamera();
    camera.position.set(1000, 0, 1000);
    camera.updateMatrixWorld();
    render(mesh, camera);
    mesh.getMatrixAt(0, matrix);
    const start = new Vector3().setFromMatrixPosition(matrix);
    t = 2;
    render(mesh, camera);
    mesh.getMatrixAt(0, matrix);
    expect(new Vector3().setFromMatrixPosition(matrix).distanceTo(start)).toBeGreaterThan(0.5);
    expect(mesh.instanceMatrix.version).toBeGreaterThan(0);
    // L'utilisateur juste sur le figurant : il est retiré de l'image (échelle nulle).
    const at = new Vector3().setFromMatrixPosition(matrix);
    camera.position.copy(at);
    camera.updateMatrixWorld();
    render(mesh, camera);
    mesh.getMatrixAt(0, matrix);
    expect(new Vector3().setFromMatrixScale(matrix).length()).toBe(0);
    const scene = createSouqScene(page(), souq, { traffic: true });
    await scene.trafficReady;
    setCityOpacity(scene.world, 0.4, createZoneClip(DEFAULT_ZONE).planes);
    for (const m of meshesOf(scene)) expect(m.material).toMatchObject({ opacity: 0.4, transparent: true });
    // L'horloge réelle par défaut : la mise à jour avant l'image ne dépend d'aucune doublure.
    render(meshesOf(scene)[0] as InstancedMesh);
    expect(meshesOf(scene)[0]?.instanceMatrix.version).toBeGreaterThan(0);
  });

  it("APP-014: le modèle prend la hauteur de son gabarit, longueur et largeur au plus près sans trop le déformer", () => {
    const agent = { gabarit: { longueurM: 4, largeurM: 0.5, hauteurM: 2 } } as Agent;
    expect(scaleOf(agent, { x: 1, y: 1, z: 2 })).toEqual(new Vector3(2 / MAX_STRETCH, 2, 2));
    expect(scaleOf(agent, { x: 1, y: 1, z: 0.5 })).toEqual(new Vector3(2 / MAX_STRETCH, 2, 2 * MAX_STRETCH));
  });
});
