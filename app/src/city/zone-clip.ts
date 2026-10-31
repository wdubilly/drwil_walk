// Découpe de la zone tapis (APP-001, point 2) : six plans de coupe partagés par tous les matériaux de la ville.
// `clipIntersection` écarte un fragment seulement s'il est du mauvais côté des six plans, c'est-à-dire dans la boîte :
// aucun rendu supplémentaire par image, la découpe se fait dans le fragment shader du rendu normal.
import { Plane, Vector3 } from "three";
import { zonePlanes, type Zone } from "../safety/zone.ts";

export interface ZoneClip {
  planes: Plane[];
  /** Replace les six plans sur la zone. */
  set(zone: Zone): void;
}

export function createZoneClip(zone: Zone): ZoneClip {
  const planes = Array.from({ length: 6 }, () => new Plane());
  const clip: ZoneClip = {
    planes,
    set(next) {
      zonePlanes(next).forEach((spec, i) => {
        (planes[i] as Plane).set(new Vector3(spec.normal.x, spec.normal.y, spec.normal.z), spec.constant);
      });
    },
  };
  clip.set(zone);
  return clip;
}
