import { Mesh, Line, type Material, type BufferGeometry } from "three";
import { PROFILES, sceneOptionsOf } from "../render/profiles.ts";
import type { Preferences } from "../ui/preferences.ts";
import { createSouqScene, type SceneOptions, type SouqScene } from "./souq.ts";
import type { Souq } from "./souq-data.ts";

/** Prépare les variantes avant la marche : changer un profil ne fabrique aucune géométrie et conserve la ville et son parcours. */
export function createLiveCity(doc: Document, souq: Souq, options: SceneOptions = {}): SouqScene & {
  apply(prefs: Preferences, night: boolean): void;
  dispose(): void;
} {
  const variants = PROFILES.map((profile) => ({
    profile,
    view: createSouqScene(doc, souq, { ...options, ...sceneOptionsOf(profile.settings), traffic: true, liveLamps: true }),
  }));
  const main = (variants[0] as typeof variants[number]).view;
  main.city.clear();
  for (const { view } of variants) main.city.add(view.osm);
  return {
    ...main,
    trafficReady: Promise.all(variants.map(({ view }) => view.trafficReady)).then(() => undefined),
    apply: (prefs, night) => {
      for (const { profile, view } of variants) {
        view.osm.visible = profile.id === prefs.profile;
        for (const [name, on] of [["arbres", prefs.trees], ["lampadaires", prefs.lamps], ["lanternes", prefs.lamps && night], ["figurants", prefs.traffic]] as const) {
          const group = view.osm.getObjectByName(name);
          if (group) group.visible = on;
        }
        if (view.osm.visible) {
          const page = doc.getElementById("app");
          if (page) {
            page.dataset["mobilier"] = `${String(view.furnitureSources.osm)} d'OpenStreetMap · ${String(prefs.lamps ? view.furnitureSources.generated : 0)} produits`;
            page.dataset["figurants"] = prefs.traffic ? String(view.osm.getObjectByName("figurants")?.userData["summary"] ?? "chargement") : "aucun : ville vivante désactivée";
          }
        }
      }
    },
    dispose: () => {
      const geometries = new Set<BufferGeometry>();
      const materials = new Set<Material>();
      for (const { view } of variants) view.world.traverse((object) => {
        if (!(object instanceof Mesh) && !(object instanceof Line)) return;
        geometries.add(object.geometry as BufferGeometry);
        const mat = object.material as Material | Material[];
        const list = Array.isArray(mat) ? mat : [mat];
        for (const material of list) materials.add(material);
      });
      for (const geometry of geometries) geometry.dispose();
      for (const material of materials) material.dispose();
    },
  };
}
