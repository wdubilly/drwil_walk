// Le mobilier urbain produit par code (APP-009) : lampadaire, banc, poubelle et panneau, aux dimensions réelles, posés au sol
// (y = 0) et tournés dans l'axe de la rue. Rien n'est tiré d'un modèle : ces quatre pièces sont du mobilier courant (APP-003).
import { BoxGeometry, BufferGeometry, Color, CylinderGeometry, Float32BufferAttribute } from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { Prop } from "./souq-data.ts";

/** Hauteurs réelles, en mètres : un mât de lampadaire, l'assise et le dossier d'un banc, une corbeille, un panneau de rue. */
export const LAMP_HEIGHT_M = 4.5;
export const BENCH_SEAT_M = 0.45;
export const BENCH_BACK_M = 0.85;
export const BIN_HEIGHT_M = 0.9;
export const SIGN_HEIGHT_M = 2.2;
/** La lanterne d'un lampadaire : sa taille et sa place sur le bras, au-dessus de la chaussée (axe Z local). */
export const LANTERN_SIZE_M = { x: 0.28, y: 0.14, z: 0.6 } as const;
export const LANTERN_AT_M = { y: LAMP_HEIGHT_M - 0.1, z: 1.1 } as const;

const STEEL = 0x4d5156;
const LIGHT = 0xf2e6a8;
const WOOD = 0x7a5a38;
const BIN_BODY = 0x3c5a46;
const SIGN_FACE = 0xe8e4da;
const SIGN_RIM = 0xb33a3a;

/** Un modèle coloré : le matériau reste blanc, la teinte vient des sommets. */
export function colored(geometry: BufferGeometry, hex: number, x = 0, y = 0, z = 0): BufferGeometry {
  const solid = geometry.index ? geometry.toNonIndexed() : geometry;
  solid.translate(x, y, z);
  solid.deleteAttribute("uv");
  const c = new Color(hex);
  solid.setAttribute("color", new Float32BufferAttribute(Array.from({ length: solid.getAttribute("position").count }, () => [c.r, c.g, c.b]).flat(), 3));
  return solid;
}

/** Lampadaire : socle, mât de 4,5 m et bras qui porte la lanterne au-dessus de la chaussée (axe Z, en travers de la rue). */
const lamp = (): BufferGeometry[] => [
  colored(new CylinderGeometry(0.16, 0.2, 0.3, 6), STEEL, 0, 0.15, 0),
  colored(new CylinderGeometry(0.06, 0.09, LAMP_HEIGHT_M, 6), STEEL, 0, LAMP_HEIGHT_M / 2, 0),
  colored(new BoxGeometry(0.08, 0.08, 1.2), STEEL, 0, LAMP_HEIGHT_M, 0.6),
  colored(new BoxGeometry(LANTERN_SIZE_M.x, LANTERN_SIZE_M.y, LANTERN_SIZE_M.z), LIGHT, 0, LANTERN_AT_M.y, LANTERN_AT_M.z),
];

/** Banc : assise à 45 cm, dossier incliné à 85 cm, deux piètements ; long de 1,8 m dans l'axe de la rue (axe X). */
const bench = (): BufferGeometry[] => [
  colored(new BoxGeometry(1.8, 0.07, 0.45), WOOD, 0, BENCH_SEAT_M, 0),
  colored(new BoxGeometry(1.8, 0.3, 0.06), WOOD, 0, BENCH_BACK_M - 0.15, -0.22),
  colored(new BoxGeometry(0.08, BENCH_SEAT_M, 0.45), STEEL, -0.75, BENCH_SEAT_M / 2, 0),
  colored(new BoxGeometry(0.08, BENCH_SEAT_M, 0.45), STEEL, 0.75, BENCH_SEAT_M / 2, 0),
];

/** Corbeille de rue : un fût de 90 cm sur son pied, cerclé de métal. */
const bin = (): BufferGeometry[] => [
  colored(new CylinderGeometry(0.26, 0.22, BIN_HEIGHT_M - 0.1, 8), BIN_BODY, 0, 0.1 + (BIN_HEIGHT_M - 0.1) / 2, 0),
  colored(new CylinderGeometry(0.28, 0.28, 0.08, 8), STEEL, 0, BIN_HEIGHT_M, 0),
  colored(new CylinderGeometry(0.07, 0.07, 0.1, 6), STEEL, 0, 0.05, 0),
];

/** Panneau : un poteau de 2,2 m et une plaque bordée, face à la circulation (plaque mince dans l'axe X de la rue). */
const sign = (): BufferGeometry[] => [
  colored(new CylinderGeometry(0.05, 0.05, SIGN_HEIGHT_M, 6), STEEL, 0, SIGN_HEIGHT_M / 2, 0),
  colored(new BoxGeometry(0.04, 0.62, 0.62), SIGN_RIM, 0, SIGN_HEIGHT_M - 0.3, 0),
  colored(new BoxGeometry(0.06, 0.5, 0.5), SIGN_FACE, 0, SIGN_HEIGHT_M - 0.3, 0),
];

const MODELS: Record<Prop["kind"], () => BufferGeometry[]> = { tree: () => [], lamp, bench, bin, sign };

/** Les pièces d'un mobilier, tournées du cap de la rue et posées à sa place ; un arbre n'en est pas (il a son modèle). */
export function furnitureParts(prop: Prop, yaw: number): BufferGeometry[] {
  return MODELS[prop.kind]().map((part) => part.rotateY(yaw).translate(prop.at.x, 0, prop.at.z));
}

/** Les pièces fusionnées en une seule géométrie, vide s'il n'y a aucun mobilier. */
export const mergeParts = (parts: BufferGeometry[]): BufferGeometry => (parts.length > 0 ? mergeGeometries(parts) : null) ?? new BufferGeometry();
