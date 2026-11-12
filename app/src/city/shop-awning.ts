// L'auvent d'une boutique (APP-008) : plat, store incliné rayé ou arcade à deux piliers, posé au-dessus de la vitrine du rez-de-chaussée.
// Chaque forme se paie sur le plafond de triangles du bâtiment ; sans plafond restant, l'auvent n'est pas dessiné.
import { addQuad, type V3 } from "./soup.ts";
import { at, paint, panel, spend, type Draw, type Wall } from "./facade-parts.ts";

const OUT_M = 1;
const HEIGHT_M = 2.5;
const LIP_M = 0.25;
const UP: V3 = [0, 1, 0];

export function addAwning(d: Draw, w: Wall, centre: number): void {
  const { awning, bayM, palette } = d.plan;
  if (awning === "none" || d.plan.floorM < HEIGHT_M + 0.6) return;
  const half = bayM * 0.45;
  const [a0, a1] = [centre - half, centre + half];
  if (awning === "flat") {
    if (!spend(d, 4)) return;
    addQuad(d.soup, at(w, a0, HEIGHT_M, 0), at(w, a1, HEIGHT_M, 0), at(w, a1, HEIGHT_M, OUT_M), at(w, a0, HEIGHT_M, OUT_M), paint(d, palette.accent, HEIGHT_M), UP);
    panel(d, w, [a0, a1], [HEIGHT_M - LIP_M, HEIGHT_M], OUT_M, palette.accent);
  } else if (awning === "striped") {
    if (!spend(d, 4)) return;
    const mid = centre;
    [[a0, mid, palette.accent], [mid, a1, palette.trim]].forEach(([from, to, hex]) => {
      addQuad(d.soup, at(w, from as number, HEIGHT_M, 0), at(w, to as number, HEIGHT_M, 0), at(w, to as number, HEIGHT_M - 0.45, OUT_M), at(w, from as number, HEIGHT_M - 0.45, OUT_M), paint(d, hex as number, HEIGHT_M), [w.nx, 0.6, w.nz]);
    });
  } else {
    if (!spend(d, 8)) return;
    panel(d, w, [a0, a1], [HEIGHT_M - LIP_M, HEIGHT_M], OUT_M, palette.trim);
    addQuad(d.soup, at(w, a0, HEIGHT_M, 0), at(w, a1, HEIGHT_M, 0), at(w, a1, HEIGHT_M, OUT_M), at(w, a0, HEIGHT_M, OUT_M), paint(d, palette.trim, HEIGHT_M), UP);
    for (const [from, to] of [[a0, a0 + 0.18], [a1 - 0.18, a1]] as const) panel(d, w, [from, to], [0, HEIGHT_M - LIP_M], OUT_M, palette.accent);
  }
}
