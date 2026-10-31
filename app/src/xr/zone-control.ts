// Zone tapis dans la marche (APP-001, point 2) : charge la zone enregistrée, la règle à la manette gauche, l'enregistre
// quand le geste est fini et tient les plans de coupe à jour. Ne fait que réduire ce qui est rendu.
import { createZoneClip, type ZoneClip } from "../city/zone-clip.ts";
import { gazeYawRad, type HeadPose } from "./pose.ts";
import { initialZoneEdit, nextZoneEdit, type ZoneEdit } from "../safety/zone-edit.ts";
import { loadZone, saveZone, type Zone, type ZoneStorage } from "../safety/zone.ts";
import { LEFT_RELEASED, leftPresses, leftReading, type LeftReading, type LeftSourceLike } from "./left-controller.ts";

export interface ZoneControl {
  clip: ZoneClip;
  zone(): Zone;
  /** À chaque image ; renvoie vrai si l'enregistrement d'un geste fini a échoué. */
  update(timeMs: number, sources: Iterable<LeftSourceLike>, head: HeadPose | undefined): boolean;
}

export function createZoneControl(storage: ZoneStorage | undefined): ZoneControl {
  let edit: ZoneEdit = initialZoneEdit(loadZone(storage));
  const clip = createZoneClip(edit.zone);
  let before: LeftReading = LEFT_RELEASED;
  let lastMs: number | null = null;
  return {
    clip,
    zone: () => edit.zone,
    update(timeMs, sources, head) {
      const now = leftReading(sources);
      const pressed = leftPresses(now, before);
      const dtS = lastMs === null ? 0 : Math.max(0, (timeMs - lastMs) / 1000);
      before = now;
      lastMs = timeMs;
      const result = nextZoneEdit(edit, {
        dtS,
        stickX: now.stickX,
        stickY: now.stickY,
        resize: now.grip,
        place: pressed.x && head ? { x: head.position.x, z: head.position.z, yawRad: gazeYawRad(head.orientation) } : null,
        reset: pressed.y,
      });
      if (result.edit.zone !== edit.zone) clip.set(result.edit.zone);
      edit = result.edit;
      if (!result.save) return false;
      edit = { ...edit, dirty: false };
      return !saveZone(storage, edit.zone);
    },
  };
}
