// Les éléments d'une façade, dessinés en triangles colorés (APP-008) : fenêtres, volets, porte, vitrines, balcons, corniche et
// cheminée. Chaque élément se paie sur le plafond de triangles du bâtiment ; un élément qui ne tient plus n'est pas dessiné.
import { Color } from "three";
import type { Vec2 } from "../route/geo.ts";
import type { FacadePlan } from "./facade-plan.ts";
import { addQuad, addTriangle, type Soup, type V3 } from "./soup.ts";

export interface Wall {
  from: Vec2;
  length: number;
  /** Direction du mur et normale vers l'extérieur, unitaires. */
  ux: number;
  uz: number;
  nx: number;
  nz: number;
}

export interface Draw {
  soup: Soup;
  plan: FacadePlan;
  heightM: number;
  /** Triangles encore permis à ce bâtiment. */
  left: number;
  /** L'ombrage du pied au toit, le même que celui des murs. */
  light: (y: number) => number;
}

/** Tailles de fenêtre (largeur, hauteur) selon le style : étroite, haute, large. */
const WINDOWS: readonly (readonly [number, number])[] = [[1, 1.3], [0.9, 1.7], [1.4, 1.2]];
const SILL_M = 0.9;
const UP: V3 = [0, 1, 0];
const DOWN: V3 = [0, -1, 0];

const spend = (d: Draw, triangles: number): boolean => {
  if (d.left < triangles) return false;
  d.left -= triangles;
  return true;
};

const at = (w: Wall, along: number, y: number, out: number): V3 => [w.from.x + w.ux * along + w.nx * out, y, w.from.z + w.uz * along + w.nz * out];
const paint = (d: Draw, hex: number, y: number): Color => new Color(hex).multiplyScalar(d.light(y));

/** Un rectangle posé sur le mur, à `out` mètres devant lui. */
function panel(d: Draw, w: Wall, [a0, a1]: readonly [number, number], [y0, y1]: readonly [number, number], out: number, hex: number): void {
  addQuad(d.soup, at(w, a0, y0, out), at(w, a1, y0, out), at(w, a1, y1, out), at(w, a0, y1, out), paint(d, hex, (y0 + y1) / 2), [w.nx, 0, w.nz]);
}

/** Une fenêtre : cadre et vitre, ou une vitrine de commerce au rez-de-chaussée. */
function opening(d: Draw, w: Wall, centre: number, floor: number): boolean {
  const { plan } = d;
  const base = floor * plan.floorM;
  const shop = floor === 0 && plan.shop;
  const [ww, wh] = WINDOWS[plan.windowStyle] as readonly [number, number];
  const half = shop ? plan.bayM * 0.4 : Math.min(ww, plan.bayM * 0.6) / 2;
  const [y0, y1] = shop ? [0.3, Math.min(2.4, plan.floorM - 0.4)] : [base + SILL_M, base + SILL_M + Math.min(wh, plan.floorM - 1.3)];
  if (!spend(d, 4)) return false;
  panel(d, w, [centre - half - 0.1, centre + half + 0.1], [y0 - 0.1, y1 + 0.1], 0.04, plan.palette.trim);
  panel(d, w, [centre - half, centre + half], [y0, y1], 0.06, plan.palette.glass);
  return true;
}

function shutters(d: Draw, w: Wall, centre: number, floor: number): void {
  const colour = d.plan.shutters;
  if (colour === undefined || (floor === 0 && d.plan.shop) || !spend(d, 4)) return;
  const [ww, wh] = WINDOWS[d.plan.windowStyle] as readonly [number, number];
  const reach = Math.min(ww, d.plan.bayM * 0.6) / 2;
  const y0 = floor * d.plan.floorM + SILL_M;
  const y1 = y0 + Math.min(wh, d.plan.floorM - 1.3);
  for (const side of [-1, 1]) panel(d, w, side < 0 ? [centre - reach - 0.4, centre - reach - 0.05] : [centre + reach + 0.05, centre + reach + 0.4], [y0, y1], 0.05, colour);
}

function balcony(d: Draw, w: Wall, centre: number): void {
  const half = Math.min(d.plan.bayM * 0.35, 1.1);
  const y = d.plan.floorM + SILL_M - 0.05;
  if (!spend(d, 4)) return;
  const accent = paint(d, d.plan.palette.accent, y);
  addQuad(d.soup, at(w, centre - half, y, 0), at(w, centre + half, y, 0), at(w, centre + half, y, 0.9), at(w, centre - half, y, 0.9), accent, UP);
  panel(d, w, [centre - half, centre + half], [y, y + 0.8], 0.9, d.plan.palette.accent);
}

function door(d: Draw, w: Wall, centre: number): void {
  const half = d.plan.family === "recent" ? 0.65 : 0.5;
  const top = Math.min(2.1, d.plan.floorM - 0.3);
  if (!spend(d, 4)) return;
  panel(d, w, [centre - half, centre + half], [0, top], 0.05, d.plan.door);
  panel(d, w, [centre - half - 0.15, centre + half + 0.15], [top, top + 0.15], 0.07, d.plan.palette.trim);
}

/** Corniche (1 : fine, 2 : large avec un bandeau au premier étage) : face, dessus et dessous. */
function cornice(d: Draw, w: Wall): void {
  const style = d.plan.cornice;
  if (style === 0 || !spend(d, 6)) return;
  const [height, out] = style === 1 ? [0.3, 0.15] : [0.5, 0.3];
  const top = d.heightM;
  const trim = d.plan.palette.trim;
  panel(d, w, [0, w.length], [top - height, top], out, trim);
  addQuad(d.soup, at(w, 0, top, 0), at(w, w.length, top, 0), at(w, w.length, top, out), at(w, 0, top, out), paint(d, trim, top), UP);
  addQuad(d.soup, at(w, 0, top - height, 0), at(w, w.length, top - height, 0), at(w, w.length, top - height, out), at(w, 0, top - height, out), paint(d, trim, top), DOWN);
  if (style === 2 && d.plan.floors >= 2 && spend(d, 2)) panel(d, w, [0, w.length], [d.plan.floorM - 0.06, d.plan.floorM + 0.06], 0.08, trim);
}

/** Tout un mur : corniche, porte, fenêtres, puis volets et balcons (ce qui manque de plafond tombe en dernier). */
export function addWall(d: Draw, w: Wall, withDoor: boolean): void {
  const bays = Math.max(1, Math.floor(w.length / d.plan.bayM));
  const centres = Array.from({ length: bays }, (_, i) => ((i + 0.5) * w.length) / bays);
  const doorBay = withDoor ? Math.min(bays - 1, Math.floor(d.plan.doorSlot * bays)) : -1;
  cornice(d, w);
  if (doorBay >= 0) door(d, w, centres[doorBay] as number);
  const lit: { centre: number; floor: number }[] = [];
  for (let floor = 0; floor < d.plan.floors; floor++) {
    centres.forEach((centre, i) => {
      if (i !== doorBay || floor > 0) if (opening(d, w, centre, floor)) lit.push({ centre, floor });
    });
  }
  for (const { centre, floor } of lit) shutters(d, w, centre, floor);
  if (d.plan.floors >= 2 && d.plan.balcony > 0) centres.forEach((centre, i) => { if (d.plan.balcony === 2 || i % 2 === 0) balcony(d, w, centre); });
}

/** Un volume posé sur le toit plat (cheminée ou local technique) : quatre côtés et le dessus. */
export function addRoofBox(d: Draw, at2: Vec2, size: number, rise: number, hex: number): void {
  if (!spend(d, 10)) return;
  const [x0, x1, z0, z1, y0, y1] = [at2.x - size / 2, at2.x + size / 2, at2.z - size / 2, at2.z + size / 2, d.heightM, d.heightM + rise];
  const colour = paint(d, hex, y1);
  addQuad(d.soup, [x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1], colour, UP);
  const sides: [V3, V3, V3][] = [[[0, 0, -1], [x0, y0, z0], [x1, y0, z0]], [[0, 0, 1], [x1, y0, z1], [x0, y0, z1]], [[-1, 0, 0], [x0, y0, z1], [x0, y0, z0]], [[1, 0, 0], [x1, y0, z0], [x1, y0, z1]]];
  for (const [facing, a, b] of sides) {
    const shade = colour.clone().multiplyScalar(0.85);
    addTriangle(d.soup, a, b, [b[0], y1, b[2]], shade, facing);
    addTriangle(d.soup, a, [b[0], y1, b[2]], [a[0], y1, a[2]], shade, facing);
  }
}
