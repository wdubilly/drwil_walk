import { describe, expect, it } from "vitest";
import {
  APPROACH_M,
  advanceOnNetwork,
  buildNetwork,
  directionOf,
  nextCrossing,
  nodeAt,
  positionOf,
  straightest,
  streetsAt,
  turnToward,
  type Network,
} from "./network.ts";

const line = (highway: string, ...pts: [number, number][]) => ({ highway, points: pts.map(([x, z]) => ({ x, z })) });

// Une croix de deux voies de 200 m (sommets tous les 50 m), une impasse de 40 m en (-50, 0), une impasse de 10 m en (50, 0),
// une voie qui monte à l'est vers le bord de l'extrait, et deux voies lointaines qui fixent l'emprise à ±1000 m.
const roads = [
  line("residential", [-100, 0], [-50, 0], [0, 0], [50, 0], [100, 0]),
  line("residential", [0, -100], [0, -50], [0, 0], [0, 50], [0, 100]),
  line("service", [-50, 0], [-50, 40]),
  line("service", [50, 0], [50, 10]),
  line("residential", [100, 0], [100, 500], [100, 1000]),
  line("residential", [-1000, 1000], [1000, 1000]),
  line("residential", [-1000, -1000], [1000, -1000]),
  line("motorway", [-100, 0], [-100, -300]),
  { highway: "footway", footway: "sidewalk", points: [{ x: -100, z: 0 }, { x: -100, z: 300 }] },
  line("residential", [300, 300], [300, 300], [320, 300], [320, 320], [300, 320], [300, 300]),
];
const net: Network = buildNetwork(roads);
const id = (x: number, z: number): number => nodeAt(net, { x, z }) as number;

describe("réseau de voies", () => {
  it("APP-002: un sommet commun à deux voies est un seul nœud, sans autoroute ni trottoir tracé à part", () => {
    expect(net.neighbours[id(0, 0)]).toHaveLength(4);
    expect(nodeAt(net, { x: -100, z: -300 })).toBeUndefined();
    expect(nodeAt(net, { x: -100, z: 300 })).toBeUndefined();
    expect(nodeAt(net, { x: 12, z: 34 })).toBeUndefined();
  });

  it("APP-002: les rues d'un carrefour sont celles qui en partent, sans celle d'où l'on vient", () => {
    const streets = streetsAt(net, id(0, 0), id(-50, 0));
    expect(streets.map((s) => s.to).sort()).toEqual([id(0, -50), id(0, 50), id(50, 0)].sort());
    const east = streets.find((s) => s.to === id(50, 0));
    expect(east?.dir.x).toBeCloseTo(1);
    expect(east?.dir.z).toBeCloseTo(0);
    expect(streetsAt(net, id(0, 0), undefined)).toHaveLength(4);
  });

  it("APP-002: une impasse de 15 m ou plus est proposée, une plus courte ne l'est pas", () => {
    expect(streetsAt(net, id(-50, 0), id(-100, 0)).map((s) => s.to)).toContain(id(-50, 40));
    expect(streetsAt(net, id(50, 0), id(100, 0)).map((s) => s.to)).toEqual([id(0, 0)]);
  });

  it("APP-002: une rue qui sort de l'extrait n'est pas proposée", () => {
    expect(streetsAt(net, id(100, 0), id(50, 0))).toEqual([]);
  });

  it("APP-002: une boucle de voies sans carrefour revient à son point de départ sans s'y perdre", () => {
    const ring = streetsAt(net, id(300, 300), undefined);
    expect(ring).toHaveLength(2);
  });

  it("APP-002: le tout droit est la rue la plus proche de la direction de marche", () => {
    const streets = streetsAt(net, id(0, 0), id(-50, 0));
    expect(straightest(streets, { x: 1, z: 0 })?.to).toBe(id(50, 0));
    expect(straightest(streets, { x: 0, z: -1 })?.to).toBe(id(0, -50));
    expect(straightest([], { x: 1, z: 0 })).toBeUndefined();
  });

  it("APP-002: la position et la direction suivent l'arête", () => {
    const pos = { from: id(0, 0), to: id(0, 50), t: 20 };
    expect(positionOf(net, pos)).toEqual({ x: 0, z: 20 });
    expect(directionOf(net, pos)).toEqual({ x: 0, z: 1 });
  });
});

describe("marche sur le réseau", () => {
  const start = { from: id(-100, 0), to: id(-50, 0), t: 0 };

  it("APP-002: sans choix, la marche continue tout droit à travers un carrefour", () => {
    const pos = advanceOnNetwork(net, start, 120, undefined);
    expect(positionOf(net, pos).x).toBeCloseTo(20);
    expect(positionOf(net, pos).z).toBeCloseTo(0);
  });

  it("APP-002: la rue choisie d'avance est prise à son carrefour, un choix pour un autre nœud est ignoré", () => {
    const north = advanceOnNetwork(net, start, 120, { node: id(0, 0), to: id(0, -50) });
    expect(positionOf(net, north).x).toBeCloseTo(0);
    expect(positionOf(net, north).z).toBeCloseTo(-20);
    const elsewhere = advanceOnNetwork(net, start, 120, { node: id(0, 50), to: id(0, -50) });
    expect(positionOf(net, elsewhere).x).toBeCloseTo(20);
    const unknown = advanceOnNetwork(net, start, 120, { node: id(0, 0), to: id(300, 300) });
    expect(positionOf(net, unknown).x).toBeCloseTo(20);
  });

  it("APP-002: au bout d'une voie sans issue, la marche fait demi-tour", () => {
    const pos = advanceOnNetwork(net, { from: id(-50, 0), to: id(-50, 40), t: 0 }, 50, undefined);
    expect(positionOf(net, pos).z).toBeCloseTo(30);
    expect(pos.to).toBe(id(-50, 0));
  });

  it("APP-002: en bordure de l'extrait, la marche fait demi-tour au lieu d'en sortir", () => {
    const pos = advanceOnNetwork(net, { from: id(50, 0), to: id(100, 0), t: 0 }, 60, undefined);
    expect(positionOf(net, pos).x).toBeCloseTo(90);
    expect(positionOf(net, pos).z).toBeCloseTo(0);
  });

  it("APP-002: le prochain carrefour se signale à l'approche, pas avant", () => {
    const near = nextCrossing(net, { ...start, t: 10 });
    expect(near?.node).toBe(id(-50, 0));
    expect(near?.distanceM).toBeCloseTo(APPROACH_M);
    expect(near?.incoming).toEqual({ x: 1, z: 0 });
    expect(nextCrossing(net, start)).toBeUndefined();
  });

  it("APP-002: le carrefour annoncé est le premier où choisir ; un nœud sans choix est traversé, une impasse n'en annonce aucun", () => {
    const beyond = nextCrossing(net, { from: id(-50, 0), to: id(0, 0), t: 20 });
    expect(beyond?.node).toBe(id(0, 0));
    expect(beyond?.from).toBe(id(-50, 0));
    expect(nextCrossing(net, { from: id(100, 0), to: id(50, 0), t: 40 })).toBeUndefined();
    expect(nextCrossing(net, { from: id(50, 0), to: id(100, 0), t: 40 })).toBeUndefined();
  });

  it("APP-002: le changement de direction est lissé, par le plus court tour", () => {
    expect(turnToward({ x: 1, z: 0 }, { x: 0, z: 1 }, 0.5).x).toBeCloseTo(Math.SQRT1_2);
    expect(turnToward({ x: 1, z: 0 }, { x: 0, z: 1 }, 0.5).z).toBeCloseTo(Math.SQRT1_2);
    const back = turnToward({ x: 1, z: 0 }, { x: Math.cos(-0.9 * Math.PI), z: Math.sin(-0.9 * Math.PI) }, 0.5);
    expect(back.z).toBeLessThan(0);
    expect(turnToward({ x: 1, z: 0 }, { x: 0, z: 1 }, 0)).toEqual({ x: 1, z: 0 });
    expect(turnToward({ x: 1, z: 0 }, { x: 0, z: 1 }, 5).z).toBeCloseTo(1);
    expect(turnToward({ x: 1, z: 0 }, { x: 0, z: 1 }, -1).x).toBeCloseTo(1);
  });
});
