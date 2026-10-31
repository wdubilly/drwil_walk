// Point d'entrée chargé par index.html : monte l'accueil et branche le vrai renderer three.js.
import { WebGLRenderer } from "three";
import { createGoogleTiles, readApiKey } from "./city/google-tiles.ts";
import { createProviders } from "./route/create-providers.ts";
import { startExperience } from "./xr/experience.ts";
import type { XrSystemLike } from "./xr/session.ts";

export function mount(doc: Document, xr: XrSystemLike | undefined, env: Record<string, unknown> | undefined): void {
  const root = doc.querySelector<HTMLElement>("#app");
  // Sans conteneur, la page est cassée : l'erreur doit se voir (QUA-002), pas une page blanche muette.
  if (!root) throw new Error("drwil_walk : élément #app introuvable dans index.html");
  startExperience({
    document: doc,
    root,
    xr,
    Renderer: WebGLRenderer,
    google: { apiKey: readApiKey(env), create: createGoogleTiles },
    storage: doc.defaultView?.localStorage,
    routes: createProviders(env, fetch.bind(globalThis)),
  });
}

// Sous Vite, `import.meta.env` porte les variables VITE_* de .env.local ; sous Node (tests), il n'existe pas.
mount(document, navigator.xr, import.meta.env);
