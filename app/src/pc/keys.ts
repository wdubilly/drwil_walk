// Les touches de la version PC (APP-002) : une touche, une action. Logique pure, sans DOM.
export type PcAction = "pause" | "faster" | "slower" | "muchFaster" | "muchSlower" | "recalibrate" | "panel" | "quit";

const ACTIONS: Readonly<Record<string, PcAction>> = {
  " ": "pause",
  p: "pause",
  ArrowUp: "faster",
  "+": "faster",
  ArrowDown: "slower",
  "-": "slower",
  PageUp: "muchFaster",
  PageDown: "muchSlower",
  r: "recalibrate",
  h: "panel",
  Escape: "quit",
};

/** Le texte des commandes, dit sur la page pendant la marche. */
export const PC_HELP =
  "Commandes : Espace pause et reprise · ↑ ou + : +0,1 km/h · ↓ ou - : −0,1 km/h · PageHaut ou PageBas : ±1 km/h · R recaler le parcours sur le regard · H masquer le tableau · glisser la souris regarder autour · Échap quitter.";

export interface KeyLike {
  key: string;
  repeat: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  metaKey: boolean;
}

/** L'action d'une pression ; rien pour une répétition (touche tenue) ou un raccourci du navigateur (Ctrl+R, etc.). */
export function actionOf(event: KeyLike): PcAction | null {
  if (event.repeat || event.ctrlKey || event.altKey || event.metaKey) return null;
  return ACTIONS[event.key.length === 1 ? event.key.toLowerCase() : event.key] ?? null;
}
