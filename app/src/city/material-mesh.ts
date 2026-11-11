// Les matériaux locaux posés sur les murs des bâtiments détaillés (prototype du souk) : un placage texturé (couleur relevée sur
// les photos de rue, relief de la normale), juste devant le mur et derrière les détails de façade (APP-008) qui restent visibles.
// Un maillage par matériau, ajouté à la ville : il s'efface avec elle tête baissée (APP-001).
import { BufferGeometry, Float32BufferAttribute, Group, Mesh } from "three";
import type { Path } from "../route/path.ts";
import type { Region } from "./facade-family.ts";
import type { Wall } from "./facade-parts.ts";
import { detailedPlans, wallsOf, type FacadeDetail } from "./facades.ts";
import type { LocalMaterials } from "./material-library.ts";
import { pickAll, type MaterialPick } from "./material-variation.ts";
import type { Building } from "./souq-data.ts";
import { toonMaterial } from "./toon.ts";

/** Le placage se tient devant le mur, mais derrière les détails de façade (4 cm et plus). */
export const MATERIAL_OFFSET_M = 0.02;
/** La hauteur de l'usure au pied des murs, en mètres. */
export const WEAR_HEIGHT_M = 1.2;
export const LOCAL_MATERIALS_NAME = "materiaux-locaux";

export interface MaterialContext {
  detail: FacadeDetail;
  region: Region;
  district?: string;
  route: Path;
  /** Part de lumière au pied d'un mur : le placage suit l'ombrage des murs. */
  footLight: number;
}

interface Buffers {
  positions: number[];
  normals: number[];
  colors: number[];
  uvs: number[];
}

const channels = (hex: number): [number, number, number] => [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];

/** Une bande horizontale du mur, de `y0` à `y1`, face avant vers l'extérieur. */
function addBand(out: Buffers, w: Wall, pick: MaterialPick, shade: (y: number) => number, [y0, y1]: readonly [number, number]): void {
  const ratio = channels(pick.tint).map((c, i) => c / Math.max(channels(pick.material.colour)[i] as number, 1));
  const corner = (along: number, y: number): void => {
    out.positions.push(w.from.x + w.ux * along + w.nx * MATERIAL_OFFSET_M, y, w.from.z + w.uz * along + w.nz * MATERIAL_OFFSET_M);
    out.normals.push(w.nx, 0, w.nz);
    out.colors.push(...ratio.map((r) => r * shade(y)));
    out.uvs.push(along / pick.sizeM + pick.offset[0], y / pick.sizeM + pick.offset[1]);
  };
  // L'ordre des sommets dépend du côté de la normale : seule la face avant est dessinée.
  const outward = w.uz * w.nx - w.ux * w.nz < 0;
  const order: readonly (readonly [number, number])[] = outward
    ? [[0, y0], [w.length, y0], [w.length, y1], [0, y0], [w.length, y1], [0, y1]]
    : [[0, y0], [w.length, y1], [w.length, y0], [0, y0], [0, y1], [w.length, y1]];
  for (const [along, y] of order) corner(along, y);
}

function addBuilding(out: Buffers, b: Building, pick: MaterialPick, ctx: MaterialContext): void {
  const shade = (y: number): number => (ctx.footLight + (1 - ctx.footLight) * Math.min(y / b.heightM, 1)) * (1 - pick.wear * Math.max(0, 1 - y / WEAR_HEIGHT_M));
  for (const wall of wallsOf(b.footprint, ctx.route)) {
    // Deux bandes : l'usure, puis le reste du mur (un bâtiment détaillé dépasse toujours sa hauteur).
    addBand(out, wall, pick, shade, [0, WEAR_HEIGHT_M]);
    addBand(out, wall, pick, shade, [WEAR_HEIGHT_M, b.heightM]);
  }
}

/** Les placages des bâtiments détaillés, en profil complet seulement : le profil « performance » n'en a aucun (APP-006). */
export function buildLocalMaterials(buildings: readonly Building[], materials: LocalMaterials, ctx: MaterialContext): Group {
  const group = new Group();
  group.name = LOCAL_MATERIALS_NAME;
  if (ctx.detail !== "full") return group;
  const byMaterial = new Map<string, Buffers>();
  for (const [b, pick] of pickAll(detailedPlans(buildings.filter((b) => b.footprint.length >= 4), ctx), materials.library)) {
    const out = byMaterial.get(pick.material.id) ?? { positions: [], normals: [], colors: [], uvs: [] };
    byMaterial.set(pick.material.id, out);
    addBuilding(out, b, pick, ctx);
  }
  for (const m of materials.library.materials) {
    const out = byMaterial.get(m.id);
    if (!out || out.positions.length === 0) continue;
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(out.positions, 3));
    geometry.setAttribute("normal", new Float32BufferAttribute(out.normals, 3));
    geometry.setAttribute("color", new Float32BufferAttribute(out.colors, 3));
    geometry.setAttribute("uv", new Float32BufferAttribute(out.uvs, 2));
    const mesh = new Mesh(geometry, toonMaterial({ map: materials.texture(m.albedo, true), normalMap: materials.texture(m.normal, false), vertexColors: true, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }));
    mesh.name = `materiau-${m.id}`;
    group.add(mesh);
  }
  return group;
}
