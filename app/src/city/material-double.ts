// Doublure de test : une petite bibliothèque de matériaux, textures factices embarquées. Aucun code de l'application ne l'importe.
import { Texture } from "three";
import { parseLibrary, type LocalMaterials, type MaterialLibrary } from "./material-library.ts";

const JPEG = "data:image/jpeg;base64,AAAA";
export const materialEntry = (id: string) => ({ id, label: id, asset: `A${id}`, sizeM: 2, colour: "#c99a6b", tints: ["#c99a6b", "#d2b48c"], albedo: `${JPEG}${id}`, normal: `${JPEG}n${id}` });

export const rawLibrary = (patch: Record<string, unknown> = {}) => ({
  schema: 1,
  itinerary: "test",
  colours: { source: "photos" },
  textureSizePx: 256,
  materials: [materialEntry("enduit"), materialEntry("bois")],
  families: { ancien: ["enduit", "bois"], village: ["bois"], recent: ["enduit"], provencale: ["enduit"] },
  ...patch,
});

export const testLibrary = (patch: Record<string, unknown> = {}): MaterialLibrary => parseLibrary(rawLibrary(patch));

/** Une bibliothèque prête pour la scène, dont les textures sont créées sans rien décoder. */
export function testMaterials(library: MaterialLibrary = testLibrary()): LocalMaterials & { loaded: string[] } {
  const loaded: string[] = [];
  return { library, loaded, texture: (url) => { loaded.push(url); return new Texture(); } };
}
