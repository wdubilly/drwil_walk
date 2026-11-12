// Les textures KTX2 (Basis) des matériaux locaux : le transcodeur WebAssembly de three.js est servi avec la page (`vite.config.ts`,
// dossier `basis/`), jamais par un réseau pendant la marche. Le chargeur choisit au démarrage le format que le GPU lit (ASTC sur
// Quest 3) : la texture reste compressée en mémoire graphique (APP-012). Les JPEG gardent le chemin `documentTexture`.
import { CompressedTexture, RGBA_ASTC_4x4_Format, type Texture } from "three";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import { KTX2, documentTexture } from "./material-library.ts";

export const TRANSCODER_PATH = "/basis/";

/** Ce que la scène attend d'un chargeur KTX2 : les octets déjà lus (jamais d'adresse à aller chercher), le résultat par rappel. */
export interface Ktx2Like {
  parse(buffer: ArrayBuffer, onLoad: (texture: CompressedTexture) => void, onError: (error: unknown) => void): unknown;
}

const bytesOf = (url: string): ArrayBuffer => Uint8Array.from(atob(url.slice(KTX2.length)), (c) => c.charCodeAt(0)).buffer;

type Extensions = { has(name: string): boolean; get(name: string): unknown };
type GlLike = Partial<{ getExtension(name: string): unknown }>;

/** Un « moteur » minimal pour `detectSupport` : les extensions de compression que le contexte GL du document sait lire (aucune sans contexte). */
export const probeRenderer = (gl: GlLike | null): { extensions: Extensions } => {
  const get = (name: string): unknown => gl?.getExtension?.(name);
  return { extensions: { has: (name) => get(name) != null, get } };
};

/** Le chargeur réel : un contexte GL jetable (le vrai moteur n'existe pas encore à l'accueil) sonde les formats compressés. */
export function createKtx2Loader(doc: Document, path: string = TRANSCODER_PATH): Ktx2Like {
  const loader = new KTX2Loader().setTranscoderPath(path);
  const gl = doc.createElement("canvas").getContext("webgl2");
  loader.detectSupport(probeRenderer(gl) as never);
  return loader;
}

/**
 * Une texture rendue tout de suite, remplie quand le transcodage finit (comme une image qui se charge). Un échec est dit, jamais
 * avalé (QUA-002) : la texture reste vide et le mur garde sa teinte.
 */
export function ktx2Texture(loader: Ktx2Like, url: string, fail: (message: string) => void = (m) => { console.error(m); }): Texture {
  const texture = new CompressedTexture([], 1, 1, RGBA_ASTC_4x4_Format);
  loader.parse(bytesOf(url), (loaded) => {
    texture.mipmaps = loaded.mipmaps;
    texture.image = loaded.image;
    texture.format = loaded.format;
    texture.type = loaded.type;
    texture.colorSpace = loaded.colorSpace;
    texture.generateMipmaps = false;
    texture.minFilter = loaded.minFilter;
    texture.magFilter = loaded.magFilter;
    texture.needsUpdate = true;
  }, (error) => { fail(`texture KTX2 illisible : ${String(error)}`); });
  return texture;
}

/** Le chargeur de textures de l'accueil : KTX2 transcodé (chargeur créé à la première texture), JPEG par une image du document. */
export function textureLoader(doc: Document, make: (doc: Document) => Ktx2Like = createKtx2Loader): (url: string) => Texture {
  let ktx2: Ktx2Like | undefined;
  return (url) => (url.startsWith(KTX2) ? ktx2Texture((ktx2 ??= make(doc)), url) : documentTexture(doc, url));
}
