// Point d'entrée chargé par index.html : monte l'accueil et branche le vrai renderer three.js.
import { WebGLRenderer } from "three";
import { startExperience } from "./xr/experience.ts";
import type { XrSystemLike } from "./xr/session.ts";

export function mount(doc: Document, xr: XrSystemLike | undefined): void {
  const root = doc.querySelector<HTMLElement>("#app");
  // Sans conteneur, la page est cassée : l'erreur doit se voir (QUA-002), pas une page blanche muette.
  if (!root) throw new Error("drwil_walk : élément #app introuvable dans index.html");
  startExperience({ document: doc, root, xr, Renderer: WebGLRenderer });
}

mount(document, navigator.xr);
