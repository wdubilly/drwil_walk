// Doublure de test : un petit pack d'arbres (trois variantes) chargé sans image réelle. Aucun code de l'application ne l'importe.
import { Texture } from "three";
import { loadTreePack, type TreePack } from "./tree-pack.ts";

const model = (name: string): object => ({
  name,
  bark: { positions: [0, 0, 0, 1, 0, 0, 0, 3, 0], colors: [0.3, 0.2, 0.1, 0.3, 0.2, 0.1, 0.3, 0.2, 0.1], indices: [0, 1, 2] },
  leaves: { positions: [0, 2, 0, 1, 2, 0, 1, 4, 0, 0, 4, 0], uvs: [0, 0, 2, 0, 2, 2, 0, 2], indices: [0, 3, 2, 0, 2, 1] },
});

export const testPack = (): Promise<TreePack> =>
  loadTreePack({ leafTexture: "data:image/png;base64,AA==", models: ["A", "B", "C"].map(model) }, () => Promise.resolve(new Texture()));
