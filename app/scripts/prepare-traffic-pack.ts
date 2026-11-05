// Préparation des modèles de figurants (APP-014) : lit, HORS du dépôt, les packs gratuits sous licence CC0 (Kenney « Car
// Kit » et « Mini Characters », la moto de AliceCassie sur Poly Pizza), garde les modèles nommés par le catalogue, pose les
// personnages, remplace la texture par une couleur par sommet et écrit dans app/assets/ le fichier embarqué
// (figurants.json) et les licences des archives. Aucun appel réseau ; chaque fichier est une donnée non fiable, lue en
// mémoire sans rien exécuter. Relançable (sources, empreintes et licences dans app/assets/PROVENANCE.md) :
//   node -e "import('./scripts/prepare-traffic-pack.ts').then(m=>m.prepareFiles(process.argv[1],'assets'))" "<dossier des packs>"
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { openZip } from "../src/city/zip-read.ts";
import { readGlbScene, type GlbPart } from "./glb-scene.ts";
import { readPng, sample, type Image } from "./png-read.ts";

interface Source {
  /** Le fichier du pack dans le dossier fourni : une archive zip, ou un modèle .glb seul. */
  file: string;
  /** Dans l'archive : la texture partagée, la licence et son nom de sortie dans app/assets/. */
  texture?: string;
  licence?: { entry: string; out: string };
  /** L'animation dont la première image pose les personnages (bras le long du corps). */
  pose?: string;
  /** Nom du modèle embarqué → fichier .glb dans l'archive (ou le fichier lui-même). */
  models: Record<string, string>;
}

const KENNEY = "Models/GLB format/";
export const SOURCES: Source[] = [
  {
    file: "kenney_car-kit.zip",
    texture: `${KENNEY}Textures/colormap.png`,
    licence: { entry: "License.txt", out: "kenney-car-kit-licence.txt" },
    models: Object.fromEntries(["sedan", "taxi", "suv", "van", "delivery"].map((n) => [n, `${KENNEY}${n}.glb`])),
  },
  {
    file: "kenney_mini-characters.zip",
    texture: `${KENNEY}Textures/colormap.png`,
    licence: { entry: "License.txt", out: "kenney-mini-characters-licence.txt" },
    pose: "idle",
    models: Object.fromEntries(["female-a", "female-b", "female-d", "male-a", "male-c", "male-e"].map((n) => [`character-${n}`, `${KENNEY}character-${n}.glb`])),
  },
  { file: "polypizza_cartoony-purple-motorcycle.glb", models: { motorcycle: "polypizza_cartoony-purple-motorcycle.glb" } },
];

const linear = (srgb: number): number => ((srgb / 255 + 0.055) / 1.055) ** 2.4;
const round = (digits: number) => (v: number): number => Math.round(v * 10 ** digits) / 10 ** digits;

export interface Model {
  name: string;
  positions: number[];
  /** Les couleurs du modèle (trois composantes linéaires chacune) et, pour chaque sommet, l'indice de la sienne. */
  palette: number[];
  shades: number[];
  indices: number[];
}

/**
 * Un modèle d'un seul tenant : couleur de chaque sommet (texture au point du sommet, fois la couleur du matériau ; une palette par modèle), sommets
 * identiques fusionnés, posé au sol (y = 0) et centré, le nez vers +Z comme dans les packs.
 */
export function flatten(name: string, parts: GlbPart[], texture: Image | undefined): Model {
  const all = parts.flatMap((p) => p.positions);
  const axis = (k: number): number[] => all.filter((_, i) => i % 3 === k);
  const xs = axis(0);
  const zs = axis(2);
  const shift = [-(Math.min(...xs) + Math.max(...xs)) / 2, -Math.min(...axis(1)), -(Math.min(...zs) + Math.max(...zs)) / 2];
  const seen = new Map<string, number>();
  const tones = new Map<string, number>();
  const model: Model = { name, positions: [], palette: [], shades: [], indices: [] };
  for (const part of parts) {
    const vertex = (v: number): number => {
      const tint = part.material.image !== undefined && texture ? sample(texture, part.uvs[v * 2] ?? 0, part.uvs[v * 2 + 1] ?? 0).map(linear) : [1, 1, 1];
      const colour = part.material.color.map((c, k) => round(2)(c * (tint[k] as number)));
      const position = [0, 1, 2].map((k) => round(2)((part.positions[v * 3 + k] as number) + (shift[k] as number)));
      const key = [...position, ...colour].join();
      const known = seen.get(key);
      if (known !== undefined) return known;
      seen.set(key, model.positions.length / 3);
      model.positions.push(...position);
      const tone = colour.join();
      if (!tones.has(tone)) tones.set(tone, model.palette.push(...colour) / 3 - 1);
      model.shades.push(tones.get(tone) as number);
      return seen.size - 1;
    };
    for (const index of part.indices) model.indices.push(vertex(index));
  }
  return model;
}

/** Les modèles d'une source et sa licence ; `read` rend le contenu d'un fichier du dossier des packs. */
export function prepareSource(source: Source, read: (file: string) => Uint8Array): { models: Model[]; licence?: [string, string] } {
  const bytes = read(source.file);
  if (!source.file.endsWith(".zip")) {
    return { models: Object.keys(source.models).map((name) => flatten(name, readGlbScene(bytes, source.pose), undefined)) };
  }
  const zip = openZip(bytes);
  const texture = source.texture ? readPng(zip.read(source.texture)) : undefined;
  const models = Object.entries(source.models).map(([name, entry]) => flatten(name, readGlbScene(zip.read(entry), source.pose), texture));
  return { models, ...(source.licence && { licence: [source.licence.out, zip.read(source.licence.entry).toString("utf8")] as [string, string] }) };
}

/** Lit les packs du dossier `packsDir` et écrit `figurants.json` et les licences dans `outDir`. */
export function prepareFiles(
  packsDir: string,
  outDir: string,
  read: (path: string) => Uint8Array = readFileSync,
  write: (path: string, data: string) => void = writeFileSync,
  sources: Source[] = SOURCES,
): void {
  const prepared = sources.map((s) => prepareSource(s, (file) => read(join(packsDir, file))));
  write(join(outDir, "figurants.json"), JSON.stringify({ models: prepared.flatMap((p) => p.models) }));
  for (const { licence } of prepared) if (licence) write(join(outDir, licence[0]), licence[1]);
}
