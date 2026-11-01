// Les arbres du pack embarqué dans le dépôt (app/assets/, provenance dans PROVENANCE.md) : le modèle est importé comme du JSON
// (donc dans le paquet de la page : aucun appel réseau dans le casque) et sa texture, une image en base64, décodée par three.js.
import { TextureLoader } from "three";
import bundled from "../../assets/quaternius-trees.json" with { type: "json" };
import { loadTreePack, type TreePack } from "./tree-pack.ts";

export const loadBundledTreePack = (): Promise<TreePack> => loadTreePack(bundled, (url) => new TextureLoader().loadAsync(url));
