// Les arbres du pack Quaternius au démarrage de l'expérience : chargés dès l'accueil, pendant que la personne règle sa marche.
// Un échec ne bloque rien : la marche continue avec l'arbre procédural et le motif est dit à l'écran (QUA-002, APP-003).
import type { TreePack } from "../city/tree-pack.ts";

export interface TreeLoad {
  pack?: TreePack;
  /** Le message pour l'écran : vide si les arbres du pack sont chargés (ou non demandés). */
  notice: string;
}

export const treeFallbackNotice = (reason: string): string => `Arbres stylisés indisponibles (${reason}) : arbres simples à la place.`;

/** Lance le chargement ; la promesse ne rejette jamais. Sans chargeur, les arbres restent procéduraux sans rien dire. */
export function preloadTrees(load: (() => Promise<TreePack>) | undefined): Promise<TreeLoad> {
  if (!load) return Promise.resolve({ notice: "" });
  return load().then(
    (pack): TreeLoad => ({ pack, notice: "" }),
    (error: unknown): TreeLoad => ({ notice: treeFallbackNotice(error instanceof Error ? error.message : String(error)) }),
  );
}

/** Un afficheur de message qui garde celui des arbres devant le message qu'on lui donne (le rendu Google peut aussi échouer). */
export const withTreeNotice = (loaded: TreeLoad, show: (text: string) => void): ((text: string) => void) => (text) => {
  show([loaded.notice, text].filter((part) => part !== "").join(" "));
};
