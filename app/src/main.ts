// Point d'entrée chargé par index.html. Il n'affiche pour l'instant que la vitesse de départ :
// la session WebXR, la ville et l'itinéraire arrivent par leurs propres chantiers.
import { DEFAULT_SPEED_KMH, formatSpeedKmh } from "./route/speed.ts";

/** Élément d'accueil : seul `textContent` sert, ce qui garde le point d'entrée testable sans navigateur. */
export interface MountTarget {
  textContent: string | null;
}

export function mount(target: MountTarget | null): void {
  // Sans conteneur, la page est cassée : l'erreur doit se voir (QUA-002), pas une page blanche muette.
  if (!target) throw new Error("drwil_walk : élément #app introuvable dans index.html");
  target.textContent = `Vitesse de départ : ${formatSpeedKmh(DEFAULT_SPEED_KMH)}`;
}

mount(document.querySelector("#app"));
