// Les carrefours dans la marche (APP-002) : le guide suit le tracé ou le réseau, les flèches signalent les rues, le rayon de la
// manette droite en pointe une et la prise droite la choisit. Ne touche ni à la vitesse ni à la distance parcourue.
import { Vector3, type Group } from "three";
import { placeOnRoute } from "../city/souq.ts";
import type { Souq } from "../city/souq-data.ts";
import { buildNetwork } from "../route/network.ts";
import { lookingAt } from "../route/path.ts";
import { POINT_TOLERANCE_DEG, pointedStreet, rightGrip, rightRay, type RaySourceLike } from "./choice-ray.ts";
import { createChoiceMarkers } from "./choice-markers.ts";
import { bearingDeg, createGuide, type GuideView } from "./guide.ts";

export interface ChoiceReading {
  /** Cap de la flèche vue de l'utilisateur, en degrés : positif à gauche, 0 droit devant. */
  bearingDeg: number;
  isDefault: boolean;
  chosen: boolean;
  pointed: boolean;
}

export interface JunctionView extends GuideView {
  choices: ChoiceReading[];
}

export interface Junctions {
  /** À chaque image : avance le guide, pose la ville, lit le pointage et le choix. */
  update(input: { distanceM: number; frame: XRFrame; space: XRReferenceSpace | null; sources: Iterable<RaySourceLike>; visible: boolean }): JunctionView;
}

export function createJunctions(city: Group, souq: Souq): Junctions {
  const guide = createGuide(souq.route, buildNetwork(souq.roads));
  const markers = createChoiceMarkers(city);
  let gripBefore = false;
  return {
    update({ distanceM, frame, space, sources, visible }) {
      const view = guide.advance(distanceM);
      placeOnRoute(city, lookingAt(view.at, view.heading), 0);
      city.updateWorldMatrix(true, true);
      // Ville effacée (tête baissée) : aucune rue n'est visée ni choisie à l'aveugle.
      const ray = visible && space && view.candidates.length > 0 ? rightRay(frame, space, sources) : undefined;
      const tips = view.candidates.map((c) => ({ to: c.to, tip: city.localToWorld(new Vector3(c.tip.x, 0, c.tip.z)) }));
      const pointed = ray && pointedStreet(ray, tips, POINT_TOLERANCE_DEG);
      const grip = rightGrip(sources);
      let chosen = view.chosen;
      if (grip && !gripBefore && pointed !== undefined) {
        guide.choose(pointed);
        chosen = pointed;
      }
      gripBefore = grip;
      markers.update(view.candidates, pointed, chosen);
      const choices = view.candidates.map((c) => ({
        bearingDeg: bearingDeg(view.at, view.heading, c.tip),
        isDefault: c.isDefault,
        chosen: c.to === chosen,
        pointed: c.to === pointed,
      }));
      return { ...view, chosen, choices };
    },
  };
}
