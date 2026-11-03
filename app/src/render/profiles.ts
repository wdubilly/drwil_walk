// Les profils graphiques (APP-006) : trois réglages figés du rendu, sans rien de la logique de marche ni de la sécurité.
// Aucun réglage ici ne touche l'opacité, la vignette ou la zone tapis : le réel reste visible quel que soit le profil (APP-001).
import type { FacadeDetail } from "../city/facades.ts";

export type ProfileId = "performance" | "equilibre" | "qualite";

export interface RenderSettings {
  /** Les contours des bâtiments proches du parcours. */
  outlines: boolean;
  /** Le détail des façades (fenêtres, volets, portes, balcons, corniches) : réduit ou retiré, la ville garde son motif de repli (APP-008). */
  facades: FacadeDetail;
  /** La ville riche : verdure au sol et noms des rues. */
  richCity: boolean;
  /** Les marquages au sol des voies (bordures de trottoir, lignes d'arrêt) : retirés par le profil le plus léger (APP-009). */
  markings: boolean;
  /** Plafonds d'arbres et de mobilier (bornés par ceux des données, `props.ts`). */
  maxTrees: number;
  maxFurniture: number;
  /** Ratio de pixels de la version PC et de la tablette, borné par celui de l'écran. */
  pixelRatio: number;
  /** Échelle de l'image dans le casque (1 : la résolution par défaut). */
  xrScale: number;
}

export interface Profile {
  id: ProfileId;
  label: string;
  settings: RenderSettings;
}

/** Le repli : le profil qui garde le rendu d'avant les profils, utilisé quand rien ne permet de choisir. */
export const FALLBACK_PROFILE: ProfileId = "equilibre";

export const PROFILES: readonly Profile[] = [
  { id: "performance", label: "Performance", settings: { outlines: false, facades: "reduced", richCity: false, markings: false, maxTrees: 100, maxFurniture: 120, pixelRatio: 0.75, xrScale: 0.8 } },
  { id: "equilibre", label: "Équilibré", settings: { outlines: false, facades: "full", richCity: true, markings: true, maxTrees: 300, maxFurniture: 400, pixelRatio: 1, xrScale: 1 } },
  { id: "qualite", label: "Qualité", settings: { outlines: true, facades: "full", richCity: true, markings: true, maxTrees: 300, maxFurniture: 400, pixelRatio: 2, xrScale: 1.2 } },
];

export function isProfileId(value: unknown): value is ProfileId {
  return PROFILES.some((profile) => profile.id === value);
}

/** Les réglages d'un profil ; un identifiant inconnu retombe sur le repli. */
export function settingsOf(id: unknown): RenderSettings {
  const found = PROFILES.find((profile) => profile.id === id) ?? PROFILES.find((profile) => profile.id === FALLBACK_PROFILE);
  return (found as Profile).settings;
}

/** Le ratio de pixels appliqué : celui du profil, sans dépasser celui de l'écran (ni descendre sous 0,5). */
export function appliedPixelRatio(settings: RenderSettings, devicePixelRatio: number): number {
  const screen = Number.isFinite(devicePixelRatio) && devicePixelRatio > 0 ? devicePixelRatio : 1;
  return Math.max(0.5, Math.min(settings.pixelRatio, screen));
}

/** Les options de la scène de la ville réglées par un profil (`createSouqScene`). */
export function sceneOptionsOf(settings: RenderSettings): Pick<RenderSettings, "outlines" | "facades" | "richCity" | "markings" | "maxTrees" | "maxFurniture"> {
  const { outlines, facades, richCity, markings, maxTrees, maxFurniture } = settings;
  return { outlines, facades, richCity, markings, maxTrees, maxFurniture };
}
