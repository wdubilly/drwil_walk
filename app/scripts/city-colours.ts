// Les couleurs d'une ville, avec pour chacune d'où elle vient (APP-012) : une photo (source, distance au tracé, auteur,
// licence), une photo fournie par le demandeur, ou, à défaut de photo même à 1 km, la palette de la région (APP-008).
import type { LonLat } from "../src/route/geo.ts";
import { regionOf, type Region } from "../src/city/facade-family.ts";
import { palettesOf } from "../src/city/facade-palettes.ts";
import { dominantColours, fromHex, toHex, type DominantColour, type Rgba, type Rgb } from "./materials-colours.ts";
import type { FoundPhoto } from "./photo-search.ts";

export interface SourcedColour extends DominantColour { from: string }
export interface PhotoImage { label: string; image: Rgba }

const distance = (a: Rgb, b: Rgb): number => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;

/** La ligne qui cite une photo retrouvée près du tracé : de quoi la rouvrir et la créditer. */
export const labelOf = (p: FoundPhoto): string => `${p.source} ${p.id}, à ${String(Math.round(p.distanceM))} m du tracé, ${p.author}, ${p.licence}, ${p.url}`;

/** La ligne qui cite une photo fournie par le demandeur : le nom du fichier seul, jamais son chemin. */
export const providedLabel = (name: string): string => `photo fournie par le demandeur (${name}), licence : fournie par le demandeur`;

/** Les couleurs dominantes de toutes les photos, chacune rattachée à la photo dont les couleurs en sont les plus proches. */
export function sourcedColours(photos: readonly PhotoImage[]): SourcedColour[] {
  const perPhoto = photos.map((p) => ({ label: p.label, colours: dominantColours([p.image], 3).map((c) => fromHex(c.hex)) }));
  return dominantColours(photos.map((p) => p.image)).map((colour) => {
    const target = fromHex(colour.hex);
    let from = "";
    let best = Infinity;
    for (const photo of perPhoto) {
      for (const c of photo.colours) {
        const d = distance(c, target);
        if (d < best) { best = d; from = photo.label; }
      }
    }
    return { ...colour, from };
  });
}

/** Le repli : les teintes des palettes de la région du départ (liserés et accents des bâtiments anciens), dites comme telles. */
export function regionColours(start: LonLat): { region: Region; list: SourcedColour[] } {
  const region = regionOf(start);
  const ancien = palettesOf(region).ancien;
  const hexes = [...new Set([...ancien.map((p) => p.trim), ...ancien.map((p) => p.accent)])].map((n) => toHex([(n >> 16) & 255, (n >> 8) & 255, n & 255]));
  const from = `palette de la région « ${region} » (APP-008), faute de photo à moins de 1 km`;
  return { region, list: hexes.map((hex) => ({ hex, share: Math.round(1000 / hexes.length) / 1000, from })) };
}
