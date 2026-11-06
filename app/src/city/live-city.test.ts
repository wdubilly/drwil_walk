import { Window } from "happy-dom";
import { BoxGeometry, Mesh, MeshBasicMaterial } from "three";
import { describe, expect, it, vi } from "vitest";
import { createPath } from "../route/path.ts";
import { DEFAULT_PREFERENCES } from "../ui/preferences.ts";
import { withCanvasContext } from "./canvas-double.ts";
import { createLiveCity } from "./live-city.ts";
import type { Souq } from "./souq-data.ts";

const souq: Souq = {
  origin: [51.5, 25.3], route: createPath([{ x: 0, z: 0 }, { x: 0, z: -100 }, { x: 0, z: 0 }]),
  roads: [], props: [], buildings: [], areas: [], hedges: [],
  palette: { ground: 0x808080, road: 0x202020, buildings: [0xffffff] },
};

describe("ville préparée pour les préférences en marche", () => {
  it("APP-006 APP-014: garde les variantes et le parcours même sans page ou sans figurants", async () => {
    const doc = withCanvasContext(new Window().document as unknown as Document);
    const city = createLiveCity(doc, souq);
    city.apply({ ...DEFAULT_PREFERENCES, traffic: true }, false);
    const root = doc.createElement("main");
    root.id = "app";
    doc.body.append(root);
    const active = city.city.children.find((o) => o.visible);
    active?.getObjectByName("figurants")?.removeFromParent();
    city.apply({ ...DEFAULT_PREFERENCES, traffic: true }, false);
    expect(root.dataset["figurants"]).toBe("chargement");
    const variants = [...city.city.children];
    await city.trafficReady;
    city.apply({ ...DEFAULT_PREFERENCES, profile: "qualite", traffic: false, lamps: false }, true);
    expect(city.city.children).toEqual(variants);
    expect(city.city.children.filter((o) => o.visible)).toHaveLength(1);
    expect(root.dataset["figurants"]).toBe("aucun : ville vivante désactivée");
    city.dispose();
  });

  it("libère une seule fois les géométries et chaque matériau, y compris les matériaux multiples", async () => {
    const doc = withCanvasContext(new Window().document as unknown as Document);
    const city = createLiveCity(doc, souq, {});
    await city.trafficReady;
    const geometry = new BoxGeometry();
    const first = new MeshBasicMaterial();
    const second = new MeshBasicMaterial();
    city.world.add(new Mesh(geometry, [first, second]), new Mesh(geometry, first));
    const freed = [vi.spyOn(geometry, "dispose"), vi.spyOn(first, "dispose"), vi.spyOn(second, "dispose")];
    city.dispose();
    for (const dispose of freed) expect(dispose).toHaveBeenCalledTimes(1);
  });
});
