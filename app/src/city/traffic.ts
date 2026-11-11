// La ville vivante dans la scène (APP-014) : le groupe « figurants », un maillage instancié par modèle (un appel de rendu
// chacun), mis à jour avant chaque image d'après l'horloge et la position de l'utilisateur. Il est dans la ville : fondu tête
// baissée, vignette et découpe de la zone tapis s'y appliquent comme au reste (APP-001).
import { Euler, Group, InstancedMesh, Matrix4, Quaternion, Vector3, type Camera, type Object3D } from "three";
import type { Souq } from "./souq-data.ts";
import { figurantsKeyOf } from "./region-palette.ts";
import { toonMaterial } from "./toon.ts";
import { readCatalogue } from "./traffic-catalog.ts";
import { poseAt } from "./traffic-motion.ts";
import { readTrafficPack, type PackModel } from "./traffic-pack.ts";
import { planTraffic, type Agent, type Caps } from "./traffic-rule.ts";

/** Écart maximal entre l'échelle verticale (la hauteur du gabarit fait foi) et les horizontales : un modèle n'est jamais trop déformé. */
export const MAX_STRETCH = 1.6;

export interface TrafficOptions {
  caps: Caps;
  catalogue: unknown;
  /** Les modèles : `loadBundledModels` en vrai, une doublure dans les tests. */
  loadModels: () => Promise<unknown>;
  /** L'horloge, en secondes. */
  now?: () => number;
}

export interface Traffic {
  group: Group;
  /** Résolue une fois les figurants posés, ou refusés (raison écrite sur la page). */
  ready: Promise<void>;
}

const clamp = (v: number, low: number, high: number): number => Math.min(high, Math.max(low, v));

/** L'échelle qui amène un modèle à son gabarit : la hauteur exacte, la longueur et la largeur au plus près sans trop déformer. */
export function scaleOf(agent: Agent, size: PackModel["size"]): Vector3 {
  const y = agent.gabarit.hauteurM / size.y;
  return new Vector3(clamp(agent.gabarit.largeurM / size.x, y / MAX_STRETCH, y * MAX_STRETCH), y, clamp(agent.gabarit.longueurM / size.z, y / MAX_STRETCH, y * MAX_STRETCH));
}

function instanced(model: PackModel, agents: Agent[], group: Group, now: () => number): InstancedMesh {
  const mesh = new InstancedMesh(model.geometry, toonMaterial({ vertexColors: true }), agents.length);
  // Les figurants sont répartis dans toute la ville : la boîte du modèle seul ne dit pas où ils sont.
  mesh.frustumCulled = false;
  const scales = agents.map((a) => scaleOf(a, model.size));
  const matrix = new Matrix4();
  const turn = new Quaternion();
  const user = new Vector3();
  const grown = new Vector3();
  mesh.onBeforeRender = (_renderer, _scene, camera: Camera): void => {
    camera.getWorldPosition(user);
    group.worldToLocal(user);
    const t = now();
    agents.forEach((agent, i) => {
      const pose = poseAt(agent, t, { x: user.x, z: user.z });
      turn.setFromEuler(new Euler(0, pose.yaw, 0));
      matrix.compose(new Vector3(pose.x, 0, pose.z), turn, grown.copy(scales[i] as Vector3).multiplyScalar(pose.grow));
      mesh.setMatrixAt(i, matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  };
  return mesh;
}

/** Le groupe des figurants (vide d'abord), rempli quand les modèles sont lus ; le compte, ou la raison d'un refus, est écrit sur la page. */
export function buildTraffic(doc: Document, souq: Souq, options: TrafficOptions): Traffic {
  const group = new Group();
  group.name = "figurants";
  const page = doc.getElementById("app");
  const write = (text: string): void => {
    group.userData["summary"] = text;
    if (page) page.dataset["figurants"] = text;
  };
  const start = performance.now() / 1000;
  const now = options.now ?? ((): number => performance.now() / 1000 - start);
  const ready = (async (): Promise<void> => {
    const catalogue = readCatalogue(options.catalogue);
    if (!catalogue.itineraires.includes(page?.dataset["route"] ?? "")) {
      write("aucun : itinéraire hors du catalogue");
      return;
    }
    const pack = readTrafficPack(await options.loadModels());
    const agents = planTraffic(souq.roads, souq.buildings, souq.route, catalogue, figurantsKeyOf(souq.origin), new Set(pack.keys()), options.caps);
    const byModel = new Map<string, Agent[]>();
    for (const agent of agents) byModel.set(agent.model, [...(byModel.get(agent.model) ?? []), agent]);
    const meshes: Object3D[] = [...byModel].map(([name, list]) => instanced(pack.get(name) as PackModel, list, group, now));
    group.add(...meshes);
    const vehicles = agents.filter((a) => a.lieu === "chaussee").length;
    write(`${String(vehicles)} véhicules · ${String(agents.length - vehicles)} piétons`);
  })().catch((error: unknown) => {
    write(`refusés : ${String(error)}`);
  });
  return { group, ready };
}
