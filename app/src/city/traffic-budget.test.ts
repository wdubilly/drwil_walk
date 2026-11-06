import { Window } from "happy-dom";
import { InstancedMesh, Mesh, type BufferGeometry, type Object3D } from "three";
import { describe, expect, it } from "vitest";
import { settingsOf, sceneOptionsOf } from "../render/profiles.ts";
import { withCanvasContext } from "./canvas-double.ts";
import { cityFor } from "./cities.ts";
import { createSouqScene } from "./souq.ts";
import { MAX_TRAFFIC_MODELS } from "./traffic-pack.ts";

// Les budgets de rendu provisoires d'APP-006 : 150 appels de rendu et 500 000 triangles par image.
const BUDGET = { calls: 150, triangles: 500_000 };
const page = (): Document => {
  const doc = withCanvasContext(new Window().document as unknown as Document);
  const app = Object.assign(doc.createElement("div"), { id: "app" });
  app.dataset["route"] = "doha-souq-waqif";
  doc.body.append(app);
  return doc;
};
const measure = (root: Object3D): { calls: number; triangles: number } => {
  const total = { calls: 0, triangles: 0 };
  root.traverse((o) => {
    if (!(o instanceof Mesh)) return;
    const g: BufferGeometry = o.geometry as BufferGeometry;
    const perInstance = (g.index?.count ?? g.getAttribute("position").count) / 3;
    total.calls += 1;
    total.triangles += perInstance * (o instanceof InstancedMesh ? o.count : 1);
  });
  return total;
};

describe("budgets de rendu de la ville vivante", () => {
  it("APP-006 APP-014: au souk, profil le plus riche, les figurants restent dans les budgets, relevés avant et après", async () => {
    const options = sceneOptionsOf(settingsOf("qualite"));
    const without = measure(createSouqScene(page(), cityFor("doha-souq-waqif"), { ...options, traffic: false }).osm);
    const scene = createSouqScene(page(), cityFor("doha-souq-waqif"), { ...options, traffic: true });
    await scene.trafficReady;
    const withTraffic = measure(scene.osm);
    const added = { calls: withTraffic.calls - without.calls, triangles: withTraffic.triangles - without.triangles };
    expect(added.calls).toBeGreaterThan(0);
    expect(added.calls).toBeLessThanOrEqual(MAX_TRAFFIC_MODELS);
    expect(withTraffic.calls).toBeLessThanOrEqual(BUDGET.calls);
    expect(withTraffic.triangles).toBeLessThanOrEqual(BUDGET.triangles);
  });
});
