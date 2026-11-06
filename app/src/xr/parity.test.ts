import { Mesh, type Material, type Object3D } from "three";
import { describe, expect, it } from "vitest";
import { testPack } from "../city/tree-pack-double.ts";
import type { Preferences } from "../ui/preferences.ts";
import { poseFrame, setup } from "./experience-double.ts";

type Mode = "casque" | "pc" | "tablette";
const MODES: Mode[] = ["casque", "pc", "tablette"];
const ROUTES = ["pune-vieille-ville", "doha-souq-waqif"];
const OPTIONS: { label: string; change: Partial<Preferences> }[] = [
  { label: "options par défaut", change: {} },
  { label: "tout allumé", change: { traffic: true, lamps: true, trees: true } },
  { label: "lampadaires et arbres éteints", change: { lamps: false, trees: false } },
  { label: "profil léger", change: { profile: "performance", traffic: true } },
  { label: "profil qualité", change: { profile: "qualite", traffic: true } },
];

const visible = (object: Object3D): boolean => {
  for (let node: Object3D | null = object; node; node = node.parent) if (!node.visible) return false;
  return true;
};

const meshesIn = (object: Object3D): number => {
  let count = 0;
  object.traverse((o) => { if (o instanceof Mesh && visible(o)) count += 1; });
  return count;
};

/** Ce que la ville montre : groupes nommés visibles (avec leur contenu), maillages visibles et matériaux distincts. */
function cityOf(scene: Object3D): Record<string, number> {
  const out: Record<string, number> = { maillages: 0 };
  const materials = new Set<Material>();
  // Les repères de carrefour sont des commandes, hors de la ville elle-même : on ne lit que le groupe « osm » montré.
  const shown: Object3D[] = [];
  scene.traverse((o) => { if (o.name === "osm" && visible(o)) shown.push(o); });
  for (const root of shown) root.traverse((o) => {
    if (!visible(o)) return;
    if (o.name) out[o.name] = (out[o.name] ?? 0) + meshesIn(o);
    if (o instanceof Mesh) {
      out["maillages"] = (out["maillages"] ?? 0) + 1;
      for (const m of Array.isArray(o.material) ? o.material : [o.material]) materials.add(m as Material);
    }
  });
  return { ...out, materiaux: materials.size };
}

async function walk(mode: Mode, change: Partial<Preferences>, route = "pune-vieille-ville") {
  const t = setup({ trees: () => testPack() });
  t.root.querySelector<HTMLInputElement>(`input[value='${route}']`)?.click();
  t.home.preferences.change({ ...t.home.preferences.read(), ...change });
  if (mode === "casque") {
    await t.enter();
    t.frame(0, poseFrame(0));
  } else {
    await t.enterPc();
    t.frame(0);
  }
  await new Promise((resolve) => setTimeout(resolve, 50));
  t.frame(100, mode === "casque" ? poseFrame(0) : undefined);
  const scene = t.fake.render.mock.lastCall?.[0] as Object3D;
  return { scene, dataset: Object.fromEntries(Object.entries(t.root.dataset)) };
}

describe("APP-015: les trois plateformes montrent la même ville", () => {
  for (const { label, change } of OPTIONS) {
    describe(label, () => {
      it.each(MODES.slice(1).flatMap((mode) => ROUTES.map((route) => [mode, route] as const)))("%s, %s : mêmes éléments de ville que le casque", async (mode, route) => {
        const reference = await walk("casque", change, route);
        const other = await walk(mode, change, route);
        expect(cityOf(other.scene)).toEqual(cityOf(reference.scene));
        for (const key of ["mobilier", "figurants", "profile", "lanternes"]) {
          expect(other.dataset[key]).toBe(reference.dataset[key]);
        }
      });
    });
  }

  it.each(MODES)("%s : chaque option de l'accueil agit sur la scène", async (mode) => {
    const onWalk = await walk(mode, { lamps: true, trees: true, traffic: true }, "doha-souq-waqif");
    const on = cityOf(onWalk.scene);
    const offWalk = await walk(mode, { lamps: false, trees: false, traffic: false }, "doha-souq-waqif");
    const off = cityOf(offWalk.scene);
    expect(on["arbres"]).toBeGreaterThan(0);
    expect(off["arbres"] ?? 0).toBe(0);
    expect(on["lampadaires"]).toBeGreaterThan(0);
    expect(off["lampadaires"] ?? 0).toBe(0);
    expect(onWalk.dataset["figurants"]).not.toBe(offWalk.dataset["figurants"]);
  });
});
