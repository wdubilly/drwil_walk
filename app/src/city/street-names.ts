// Les noms des rues (balise `name` de l'extrait) : des plaques posées à plat sur le sol, dans le sens de la marche, pour les rues les plus
// proches du parcours, en nombre et en distance plafonnés (APP-003). Ce sont des maillages de la ville : le fondu tête baissée les efface
// et la zone tapis les découpe (APP-001).
import { CanvasTexture, Group, Mesh, MeshBasicMaterial, PlaneGeometry } from "three";
import type { Vec2 } from "../route/geo.ts";
import type { Path } from "../route/path.ts";
import type { Road } from "./souq-data.ts";

export const MAX_STREET_NAMES = 8;
export const MAX_NAME_DISTANCE_M = 60;

const WIDTH_PX = 512;
const HEIGHT_PX = 128;
const MARGIN_PX = 16;
/** La plaque au sol : 6 m sur 1,5 m, un panneau de rue lisible à quelques pas. */
const PLATE_WIDTH_M = 6;
const PLATE_HEIGHT_M = 1.5;
const PLATE_LIFT_M = 0.15;

export interface StreetLabel {
  text: string;
  at: Vec2;
  /** Sens de lecture du texte : le sens de la marche le long de la rue. */
  direction: Vec2;
}

/** Le sens d'une polyligne autour du sommet `i` (différence centrée). */
function directionAt(points: readonly Vec2[], i: number): Vec2 {
  const [a, b] = [points[Math.max(i - 1, 0)] as Vec2, points[Math.min(i + 1, points.length - 1)] as Vec2];
  return { x: b.x - a.x, z: b.z - a.z };
}

/** Une plaque par nom, au sommet de sa rue le plus proche du parcours ; les rues trop loin ne sont pas nommées. */
export function pickStreetLabels(roads: readonly Road[], route: Path): StreetLabel[] {
  const best = new Map<string, StreetLabel & { d: number }>();
  for (const road of roads) {
    if (road.name === undefined || road.footway !== undefined) continue;
    for (const [i, at] of road.points.entries()) {
      const near = route.points
        .map((p, j) => ({ j, d: Math.hypot(p.x - at.x, p.z - at.z) }))
        .reduce((a, b) => (b.d < a.d ? b : a));
      if (near.d > MAX_NAME_DISTANCE_M || near.d >= (best.get(road.name)?.d ?? Infinity)) continue;
      const along = directionAt(road.points, i);
      const walking = directionAt(route.points, near.j);
      const sign = along.x * walking.x + along.z * walking.z < 0 ? -1 : 1;
      best.set(road.name, { text: road.name, at, direction: { x: along.x * sign, z: along.z * sign }, d: near.d });
    }
  }
  return [...best.values()].sort((a, b) => a.d - b.d).slice(0, MAX_STREET_NAMES);
}

function plate(doc: Document, label: StreetLabel): Mesh {
  const canvas = doc.createElement("canvas");
  canvas.width = WIDTH_PX;
  canvas.height = HEIGHT_PX;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D indisponible : les noms des rues ne peuvent pas être dessinés.");
  context.fillStyle = "#10141c";
  context.fillRect(0, 0, WIDTH_PX, HEIGHT_PX);
  context.fillStyle = "#f2f5fa";
  context.font = "bold 64px sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  // Un nom long est comprimé, jamais tronqué.
  context.fillText(label.text, WIDTH_PX / 2, HEIGHT_PX / 2, WIDTH_PX - 2 * MARGIN_PX);
  const mesh = new Mesh(new PlaneGeometry(PLATE_WIDTH_M, PLATE_HEIGHT_M), new MeshBasicMaterial({ map: new CanvasTexture(canvas) }));
  mesh.name = `rue-${label.text}`;
  // À plat (le haut du texte vers -z), puis tournée dans le sens de lecture.
  mesh.rotation.order = "YXZ";
  mesh.rotation.set(-Math.PI / 2, Math.atan2(-label.direction.z, label.direction.x), 0);
  mesh.position.set(label.at.x, PLATE_LIFT_M, label.at.z);
  return mesh;
}

export function buildStreetLabels(doc: Document, roads: readonly Road[], route: Path): Group {
  const group = new Group();
  group.name = "noms-de-rues";
  group.add(...pickStreetLabels(roads, route).map((label) => plate(doc, label)));
  return group;
}
