import { describe, expect, it } from "vitest";
import { buildNetwork, nodeAt } from "../route/network.ts";
import { createPath, headingAt, pointAt } from "../route/path.ts";
import { ARROW_AT_M, bearingDeg, createGuide, type GuideView } from "./guide.ts";

const line = (...pts: [number, number][]) => ({ highway: "residential", points: pts.map(([x, z]) => ({ x, z })) });

// Une croix de deux voies de 200 m, une impasse de 40 m en (-50, 0), une impasse de 10 m en (50, 0), une voie qui monte
// à l'est jusqu'au bord de l'extrait, et deux voies lointaines qui fixent l'emprise à ±1000 m.
const net = buildNetwork([
  line([-100, 0], [-50, 0], [0, 0], [50, 0], [100, 0]),
  line([0, -100], [0, -50], [0, 0], [0, 50], [0, 100]),
  line([-50, 0], [-50, 40]),
  line([50, 0], [50, 10]),
  line([100, 0], [100, 500], [100, 1000]),
  line([-1000, 1000], [1000, 1000]),
  line([-1000, -1000], [1000, -1000]),
]);
const id = (x: number, z: number): number => nodeAt(net, { x, z }) as number;
const pts = (...p: [number, number][]) => p.map(([x, z]) => ({ x, z }));
// Aller-retour le long de la voie est-ouest : 400 m, carrefours en (-50, 0) à 50 m, (0, 0) à 100 m et 300 m, (-50, 0) à 350 m.
const route = createPath(pts([-100, 0], [-50, 0], [0, 0], [50, 0], [100, 0], [50, 0], [0, 0], [-50, 0], [-100, 0]));

/** Avance de `from` à `to` par pas de `step` mètres, comme les images de la boucle de rendu. */
function walk(guide: ReturnType<typeof createGuide>, from: number, to: number, step = 1): GuideView {
  let view = guide.advance(from);
  for (let d = from + step; d < to + step / 2; d += step) view = guide.advance(d);
  return view;
}

describe("guide de marche", () => {
  it("APP-002: sans aucun choix, la marche suit le tracé d'origine, boucle comprise", () => {
    const guide = createGuide(route, net);
    for (let d = 0; d <= 900; d += 1) {
      const view = guide.advance(d);
      expect(view.at).toEqual(pointAt(route, d));
      expect(view.heading).toEqual(headingAt(route, d));
      expect(view.offRoute).toBe(false);
      expect(view.chosen).toBeUndefined();
    }
  });

  it("APP-002: les rues sont proposées à l'approche d'un carrefour, avec celle du tracé par défaut", () => {
    const guide = createGuide(route, net);
    expect(walk(guide, 0, 5).candidates).toEqual([]);
    const view = walk(guide, 5, 70);
    expect(view.crossingM).toBeCloseTo(30);
    expect(view.candidates.map((c) => c.to).sort()).toEqual([id(0, -50), id(0, 50), id(50, 0)].sort());
    expect(view.candidates.filter((c) => c.isDefault).map((c) => c.to)).toEqual([id(50, 0)]);
    const north = view.candidates.find((c) => c.to === id(0, -50));
    expect(north?.tip.x).toBeCloseTo(0);
    expect(north?.tip.z).toBeCloseTo(-ARROW_AT_M);
  });

  it("APP-002: choisir une autre rue quitte le tracé à ce carrefour, en douceur", () => {
    const guide = createGuide(route, net);
    expect(walk(guide, 0, 70).chosen).toBeUndefined();
    guide.choose(id(0, -50));
    expect(guide.advance(71).chosen).toBe(id(0, -50));
    const turning = walk(guide, 72, 102);
    expect(turning.offRoute).toBe(true);
    // Le changement de direction est lissé : encore tourné vers l'est juste après le virage, vers le nord un peu plus loin.
    expect(turning.heading.x).toBeGreaterThan(0.5);
    const after = walk(guide, 103, 110);
    expect(after.at.x).toBeCloseTo(0);
    expect(after.at.z).toBeCloseTo(-10);
    expect(after.chosen).toBeUndefined();
    expect(walk(guide, 111, 140).heading.z).toBeLessThan(-0.99);
  });

  it("APP-002: choisir la rue du tracé, une rue absente ou un choix hors approche ne quitte pas le tracé", () => {
    const guide = createGuide(route, net);
    guide.choose(id(0, -50));
    expect(guide.advance(0).chosen).toBeUndefined();
    walk(guide, 1, 70);
    guide.choose(99_999);
    expect(guide.advance(71).chosen).toBeUndefined();
    guide.choose(id(50, 0));
    expect(walk(guide, 72, 110).offRoute).toBe(false);
    // Le choix ne survit pas au carrefour passé.
    expect(walk(guide, 111, 290).chosen).toBeUndefined();
    expect(walk(guide, 291, 330).offRoute).toBe(false);
  });

  it("APP-002: sur le réseau, la marche continue tout droit, fait demi-tour en bout de voie et propose de nouveau les rues", () => {
    const guide = createGuide(route, net);
    walk(guide, 0, 70);
    guide.choose(id(0, -50));
    // Impasse en (0, -100) : demi-tour, retour au carrefour (0, 0) à 300 m de marche.
    const back = walk(guide, 71, 270);
    expect(back.offRoute).toBe(true);
    expect(back.crossingM).toBeCloseTo(30, 0);
    expect(back.candidates.map((c) => c.to).sort()).toEqual([id(-50, 0), id(0, 50), id(50, 0)].sort());
    expect(back.candidates.find((c) => c.isDefault)?.to).toBe(id(0, 50));
    guide.choose(id(-50, 0));
    const west = walk(guide, 271, 320);
    expect(west.at.x).toBeCloseTo(-20);
    expect(west.at.z).toBeCloseTo(0);
    // Le carrefour suivant, en (-50, 0), est déjà annoncé.
    expect(west.candidates.map((c) => c.to).sort()).toEqual([id(-100, 0), id(-50, 40)].sort());
  });

  it("APP-002: un tracé qui fait demi-tour à un carrefour laisse choisir de continuer", () => {
    const turn = createPath(pts([-100, 0], [-50, 0], [0, 0], [-50, 0], [-100, 0]));
    const guide = createGuide(turn, net);
    const view = walk(guide, 0, 80);
    expect(view.candidates.some((c) => c.isDefault)).toBe(false);
    guide.choose(id(50, 0));
    expect(walk(guide, 81, 120).at.x).toBeCloseTo(20);
  });

  it("APP-002: un point du tracé hors réseau ne propose rien, un trajet libre n'a aucun carrefour", () => {
    const off = createPath(pts([-100, 0], [-50, 0], [0, 0], [5, 7], [-100, 0]));
    expect(createGuide(off, net).advance(105).candidates).toEqual([]);
    const free = createPath(pts([-100, 0], [-50, 0], [0, 0], [50, 0]), false);
    const guide = createGuide(free, net);
    expect(walk(guide, 0, 80).candidates).toEqual([]);
    expect(guide.advance(500).at).toEqual({ x: 50, z: 0 });
  });

  it("APP-002: une distance qui recule ou qui n'est pas un nombre n'avance pas", () => {
    const guide = createGuide(route, net);
    guide.advance(20);
    expect(guide.advance(10).at).toEqual(pointAt(route, 20));
    expect(guide.advance(Number.NaN).at).toEqual(pointAt(route, 20));
  });

  it("APP-002: le cap d'une flèche se lit depuis l'utilisateur, positif à gauche", () => {
    const heading = { x: 0, z: -1 };
    expect(bearingDeg({ x: 0, z: 0 }, heading, { x: 0, z: -10 })).toBeCloseTo(0);
    expect(bearingDeg({ x: 0, z: 0 }, heading, { x: -10, z: -10 })).toBeCloseTo(45);
    expect(bearingDeg({ x: 0, z: 0 }, heading, { x: 10, z: 0 })).toBeCloseTo(-90);
  });
});
