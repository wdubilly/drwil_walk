// Préparation du pack Quaternius « Stylized Nature MegaKit » (Standard, CC0) : lit l'archive zip fournie HORS du dépôt,
// retient quelques arbres, les allège (écorce regroupée en peu de triangles, feuillage éclairci, tronc en couleur unie
// plutôt qu'en texture de 4 Mo) et écrit dans app/assets/ le modèle embarqué (quaternius-trees.json, texture des feuilles
// comprise) et la licence de l'archive. Aucun appel réseau ; l'archive est une donnée non fiable, lue sans rien exécuter.
// Relançable (la provenance est dans app/assets/PROVENANCE.md) :
//   node -e "import('./scripts/prepare-nature-pack.ts').then(m=>m.prepareFiles(process.argv[1],'assets'))" "<archive>.zip"
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { readGltf, type Primitive } from "../src/city/gltf-read.ts";
import { simplifyTo, thinCards } from "../src/city/mesh-simplify.ts";
import { openZip, type Zip } from "../src/city/zip-read.ts";

/** Les arbres retenus parmi les 15 de l'archive : quatre variantes d'arbre commun (feuillage vert), sans les arbres morts ni tordus. */
export const RETAINED = ["CommonTree_1", "CommonTree_2", "CommonTree_3", "CommonTree_5"];
export const LEAF_TEXTURE = "glTF/Leaves_NormalTree_C.png";
export const LICENCE_FILE = "License_Standard.txt";
/** Couleur moyenne de la texture d'écorce Bark_NormalTree.png (sRGB), relevée une fois : le tronc est en couleur unie. */
export const BARK_SRGB = [140, 88, 67];
/** Triangles d'écorce par arbre, cartes de feuilles gardées par arbre et agrandissement maximal d'une carte gardée. */
export const BARK_TRIANGLES = 200;
export const LEAF_QUADS = 130;
export const LEAF_MAX_SCALE = 2;

const linear = (srgb: number): number => ((srgb / 255 + 0.055) / 1.055) ** 2.4;
const round = (digits: number) => (v: number): number => Math.round(v * 10 ** digits) / 10 ** digits;

function primitive(primitives: Primitive[], prefix: string, model: string): Primitive {
  const found = primitives.find((p) => p.material.startsWith(prefix));
  if (!found) throw new Error(`${model} : matériau « ${prefix}… » absent`);
  return found;
}

/** Un arbre allégé : écorce à couleurs par sommet (couleur du tronc fois l'ombrage du pack), feuillage en cartes à texture. */
export function prepareTree(zip: Zip, name: string): object {
  const primitives = readGltf(zip.read(`glTF/${name}.gltf`).toString("utf8"), zip.read(`glTF/${name}.bin`));
  const bark = primitive(primitives, "Bark", name);
  const leaves = primitive(primitives, "Leaves", name);
  const base = BARK_SRGB.map(linear);
  const colors = Array.from({ length: bark.positions.length / 3 }, (_, v) => base.map((c) => c * (bark.colors[v * 4] ?? 1))).flat();
  const light = simplifyTo({ positions: bark.positions, colors, indices: bark.indices }, BARK_TRIANGLES);
  const cards = thinCards(leaves, LEAF_QUADS, LEAF_MAX_SCALE);
  return {
    name,
    bark: { positions: light.positions.map(round(2)), colors: light.colors.map(round(2)), indices: light.indices },
    leaves: { positions: cards.positions.map(round(2)), uvs: cards.uvs.map(round(3)), indices: cards.indices },
  };
}

/** Le contenu des fichiers à écrire : le modèle embarqué et la licence de l'archive. */
export function prepare(archive: Uint8Array): { trees: string; licence: string } {
  const zip = openZip(archive);
  const texture = `data:image/png;base64,${zip.read(LEAF_TEXTURE).toString("base64")}`;
  const models = RETAINED.map((name) => prepareTree(zip, name));
  return { trees: JSON.stringify({ leafTexture: texture, models }), licence: zip.read(LICENCE_FILE).toString("utf8") };
}

/** Lit l'archive et écrit `quaternius-trees.json` et `quaternius-licence.txt` dans `outDir`. */
export function prepareFiles(
  archivePath: string,
  outDir: string,
  read: (path: string) => Uint8Array = readFileSync,
  write: (path: string, data: string) => void = writeFileSync,
): void {
  const { trees, licence } = prepare(read(archivePath));
  write(join(outDir, "quaternius-trees.json"), trees);
  write(join(outDir, "quaternius-licence.txt"), licence);
}
