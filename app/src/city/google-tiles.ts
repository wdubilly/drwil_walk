// Le rendu photoréaliste en option : les Google Photorealistic 3D Tiles, via 3d-tiles-renderer. Les tuiles sont
// calées sur le repère local de l'itinéraire par l'origine de sa boucle (APP-002). La clé vient de .env.local
// (SEC-007) ; sans elle, ou si les tuiles ne se chargent pas, l'appelant garde le rendu OpenStreetMap et dit pourquoi (QUA-002).
import { GoogleCloudAuthPlugin } from "3d-tiles-renderer/core/plugins";
import { GLTFExtensionsPlugin, ReorientationPlugin } from "3d-tiles-renderer/three/plugins";
import { TilesRenderer } from "3d-tiles-renderer/three";
import { Group, MathUtils, Mesh, MeshBasicMaterial, type Material, type Object3D, type PerspectiveCamera } from "three";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import type { LonLat } from "../route/geo.ts";
import { GOOGLE_ATTRIBUTION } from "./licence.ts";

/** Décodeur Draco des tuiles Google (version figée) : servi par le CDN de Google, comme les tuiles. */
const DRACO_DECODER_PATH = "https://www.gstatic.com/draco/versioned/decoders/1.5.7/";
/** Le jeu de tuiles de Google est en repère terrestre ; le plugin le ramène à l'origine, X vers l'ouest, Z vers le nord. */
const TO_LOCAL_FRAME_Y_RAD = Math.PI;

export interface GoogleTiles {
  /** À ajouter à la ville : déjà aligné sur le repère local (x est, z sud). */
  root: Group;
  /** Choisit et charge les tuiles vues par `camera`, dont chaque œil fait `size` pixels. */
  update: (camera: PerspectiveCamera, size: { x: number; y: number }) => void;
  /** Droits des tuiles affichées, tels que Google les donne (vide tant qu'aucune n'est affichée). */
  copyright: () => string;
  visibleTileCount: () => number;
  dispose: () => void;
}

export interface GoogleTilesOptions {
  apiKey: string;
  origin: LonLat;
  /** Appelé une fois, avec la raison, quand les tuiles ne se chargent pas. */
  onFailure: (reason: string) => void;
}
export type CreateGoogleTiles = (options: GoogleTilesOptions) => GoogleTiles;

/** La photogrammétrie porte déjà sa lumière : un matériau sans éclairage évite de la surexposer. */
function unlit(scene: Object3D): void {
  scene.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    const old = object.material as Material & { map?: MeshBasicMaterial["map"] };
    object.material = new MeshBasicMaterial({ map: old.map ?? null });
    old.dispose();
  });
}

function disposeMaterials(scene: Object3D): void {
  scene.traverse((object) => {
    if (object instanceof Mesh) (object.material as Material).dispose();
  });
}

/** La raison dite à l'écran ne porte jamais la clé (SEC-007). */
const redact = (message: string, apiKey: string): string => message.replaceAll(apiKey, "***");

/** Les tuiles, et le moteur qui les charge (les tests lui envoient ses événements, sans réseau). */
export type GoogleTilesEngine = GoogleTiles & { tiles: TilesRenderer };

export const createGoogleTiles = ({ apiKey, origin, onFailure }: GoogleTilesOptions): GoogleTilesEngine => {
  const draco = new DRACOLoader().setDecoderPath(DRACO_DECODER_PATH);
  const tiles = new TilesRenderer();
  tiles.registerPlugin(new GoogleCloudAuthPlugin({ apiToken: apiKey }));
  // autoDispose : le plugin libère un chargeur KTX2 que nous n'avons pas fourni ; le Draco est libéré ici.
  tiles.registerPlugin(new GLTFExtensionsPlugin({ dracoLoader: draco, autoDispose: false }));
  tiles.registerPlugin(new ReorientationPlugin({ lat: origin[1] * MathUtils.DEG2RAD, lon: origin[0] * MathUtils.DEG2RAD }));
  const root = new Group();
  root.name = "tuiles-google";
  root.rotation.y = TO_LOCAL_FRAME_Y_RAD;
  root.add(tiles.group);

  let modelLoaded = false;
  let failed = false;
  tiles.addEventListener("load-model", ({ scene }) => {
    modelLoaded = true;
    unlit(scene);
  });
  tiles.addEventListener("dispose-model", ({ scene }) => {
    disposeMaterials(scene);
  });
  tiles.addEventListener("load-error", ({ tile, error }) => {
    // Une tuile isolée qui échoue ne condamne pas le rendu ; le jeu racine, ou une première tuile, si.
    if (failed || (tile !== null && modelLoaded)) return;
    failed = true;
    // La bibliothèque ne garde pas le code HTTP : on nomme les causes probables, puis le détail technique.
    const cause = tile === null ? "jeu de tuiles refusé ou injoignable (clé invalide, restreinte, API non activée ?)" : "tuile illisible";
    onFailure(`${cause} : ${redact(error.message, apiKey)}`);
  });

  return {
    root,
    tiles,
    update: (camera, size) => {
      if (failed) return;
      if (!tiles.hasCamera(camera)) tiles.setCamera(camera);
      tiles.setResolution(camera, size.x, size.y);
      tiles.update();
    },
    copyright: () =>
      tiles
        .getAttributions()
        .filter((entry) => entry.type === "string")
        .map((entry) => String(entry.value))
        .join(" "),
    visibleTileCount: () => tiles.visibleTiles.size,
    dispose: () => {
      tiles.dispose();
      draco.dispose();
    },
  };
};

/** Le texte des droits montré à l'accueil et dans le casque : « Google », puis les droits des tuiles affichées. */
export function googleCredit(copyright: string): string {
  return copyright === "" ? GOOGLE_ATTRIBUTION : `${GOOGLE_ATTRIBUTION} · ${copyright}`;
}

/** La clé Google de l'environnement de build (`VITE_GOOGLE_MAPS_API_KEY`, lue de .env.local) ; absente ou vide : pas de clé. */
export function readApiKey(env: Record<string, unknown> | undefined): string | undefined {
  const key = env?.["VITE_GOOGLE_MAPS_API_KEY"];
  return typeof key === "string" && key.trim() !== "" ? key.trim() : undefined;
}
