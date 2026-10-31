// Le rendu choisi à l'accueil, côté marche : OpenStreetMap, ou les tuiles Google quand une clé est fournie et que
// les tuiles se chargent. Tout repli sur OpenStreetMap dit sa raison à l'écran (QUA-002), jamais en silence.
import type { ArrayCamera, PerspectiveCamera } from "three";
import { googleCredit, type CreateGoogleTiles, type GoogleTiles } from "../city/google-tiles.ts";
import { OSM_ATTRIBUTION } from "../city/licence.ts";
import type { SouqScene } from "../city/souq.ts";
import type { Souq } from "../city/souq-data.ts";
import type { Rendering } from "../ui/render-choice.ts";

export interface GoogleConfig {
  /** La clé de `.env.local`, ou rien. */
  apiKey: string | undefined;
  create: CreateGoogleTiles;
}

export const NO_KEY_NOTICE =
  "Rendu Google 3D indisponible : aucune clé (VITE_GOOGLE_MAPS_API_KEY dans app/.env.local). Rendu OpenStreetMap affiché.";
export const failureNotice = (reason: string): string =>
  `Rendu Google 3D indisponible : ${reason}. Rendu OpenStreetMap affiché.`;

/** Résolution d'un œil quand le casque ne l'a pas encore donnée (Quest 3, échelle par défaut, à peu près). */
const FALLBACK_EYE_PX = { x: 2064, y: 2208 };

export interface RenderMode {
  rendering(): Rendering;
  tileCount(): number;
  /** Les mentions de données de ce qui est affiché, pour la page et le casque (APP-003). */
  attribution(): string;
  /** À chaque image : charge les tuiles vues par la tête, et tient la mention à jour. */
  update(camera: PerspectiveCamera, xrCamera: ArrayCamera): void;
  dispose(): void;
}

const creditLine = (copyright: string): string => `${OSM_ATTRIBUTION} · ${googleCredit(copyright)}`;

function eyeSize(xrCamera: ArrayCamera): { x: number; y: number } {
  const viewport = xrCamera.cameras[0]?.viewport;
  return viewport && viewport.z > 0 ? { x: viewport.z, y: viewport.w } : FALLBACK_EYE_PX;
}

interface ModeInput {
  wanted: Rendering;
  config: GoogleConfig;
  souq: Souq;
  scene: SouqScene;
  /** Dit une raison à l'accueil. */
  notice: (text: string) => void;
}

export function chooseRendering({ wanted, config, souq, scene, notice }: ModeInput): RenderMode {
  let tiles: GoogleTiles | null = null;
  let active = false;
  let text = OSM_ATTRIBUTION;
  const fallBack = (reason: string): void => {
    if (tiles) scene.city.remove(tiles.root);
    scene.osm.visible = true;
    text = OSM_ATTRIBUTION;
    scene.label.setText(text);
    notice(reason);
    // Les tuiles ne sont plus mises à jour ; elles se libèrent avec la marche.
    active = false;
  };
  if (wanted === "google") {
    if (config.apiKey === undefined) {
      notice(NO_KEY_NOTICE);
    } else {
      try {
        tiles = config.create({
          apiKey: config.apiKey,
          origin: souq.origin,
          onFailure: (reason) => {
            fallBack(failureNotice(reason));
          },
        });
        active = true;
        scene.city.add(tiles.root);
        scene.osm.visible = false;
        text = creditLine("");
        scene.label.setText(text);
      } catch (error) {
        fallBack(failureNotice(error instanceof Error ? error.message : String(error)));
      }
    }
  }
  return {
    rendering: () => (active ? "google" : "osm"),
    tileCount: () => (active && tiles ? tiles.visibleTileCount() : 0),
    attribution: () => text,
    update(camera, xrCamera) {
      if (!active || !tiles) return;
      tiles.update(camera, eyeSize(xrCamera));
      const next = creditLine(tiles.copyright());
      if (next !== text) {
        text = next;
        scene.label.setText(text);
      }
    },
    dispose: () => tiles?.dispose(),
  };
}
