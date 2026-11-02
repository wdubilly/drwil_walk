// Les flèches des rues proposées à l'approche d'un carrefour (APP-002), posées sur le sol de la ville : elles suivent le
// fondu tête baissée et la découpe de la zone tapis comme tout le reste de la ville (APP-001).
import { BufferGeometry, DoubleSide, Float32BufferAttribute, Group, Mesh, MeshBasicMaterial } from "three";
import type { Candidate } from "./guide.ts";

/** Les trois états d'une flèche : proposée, pointée par la manette, choisie. */
export const MARKER_COLORS = { offered: 0xffd23f, pointed: 0xffffff, chosen: 0x3fdc6b } as const;
const HEIGHT_M = 0.15;

/** Une flèche à plat de 5 m qui pointe vers -Z : une pointe triangulaire et une queue, centrées sur le bout posé. */
function arrowGeometry(): BufferGeometry {
  const geometry = new BufferGeometry();
  const triangles = [0, 0, -2.5, -1.6, 0, -0.5, 1.6, 0, -0.5, -0.5, 0, -0.5, -0.5, 0, 2.5, 0.5, 0, -0.5, 0.5, 0, -0.5, -0.5, 0, 2.5, 0.5, 0, 2.5];
  geometry.setAttribute("position", new Float32BufferAttribute(triangles, 3));
  return geometry;
}

export interface ChoiceMarkers {
  group: Group;
  update(candidates: readonly Candidate[], pointed: number | undefined, chosen: number | undefined): void;
}

/** Pose les flèches dans `city` (le groupe de la ville) ; elles se reconstruisent quand le carrefour change. */
export function createChoiceMarkers(city: Group): ChoiceMarkers {
  const group = new Group();
  group.name = "carrefour";
  group.visible = false;
  city.add(group);
  const geometry = arrowGeometry();
  const materials = {
    offered: new MeshBasicMaterial({ color: MARKER_COLORS.offered, side: DoubleSide }),
    pointed: new MeshBasicMaterial({ color: MARKER_COLORS.pointed, side: DoubleSide }),
    chosen: new MeshBasicMaterial({ color: MARKER_COLORS.chosen, side: DoubleSide }),
  };
  let built = "";
  return {
    group,
    update(candidates, pointed, chosen) {
      group.visible = candidates.length > 0;
      const signature = candidates.map((c) => c.to).join(",");
      if (signature !== built) {
        built = signature;
        group.clear();
        for (const c of candidates) {
          const arrow = new Mesh(geometry, materials.offered);
          arrow.name = `fleche-${String(c.to)}`;
          arrow.userData["to"] = c.to;
          arrow.position.set(c.tip.x, HEIGHT_M, c.tip.z);
          arrow.rotation.y = Math.atan2(-c.dir.x, -c.dir.z);
          group.add(arrow);
        }
      }
      for (const arrow of group.children as Mesh[]) {
        const to = arrow.userData["to"] as number;
        arrow.material = to === chosen ? materials.chosen : to === pointed ? materials.pointed : materials.offered;
      }
    },
  };
}
