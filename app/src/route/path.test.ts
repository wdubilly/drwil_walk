import { describe, expect, it } from "vitest";
import { HEADING_WINDOW_M, createPath, headingAt, pointAt } from "./path.ts";

// Un carré de 100 m de côté : nord, est, sud, retour à l'ouest.
const square = createPath([
  { x: 0, z: 0 },
  { x: 0, z: -100 },
  { x: 100, z: -100 },
  { x: 100, z: 0 },
  { x: 0, z: 0 },
]);

describe("parcours", () => {
  it("APP-002: mesure la longueur du parcours", () => {
    expect(square.lengthM).toBeCloseTo(400);
  });

  it("APP-002: place la position à la distance parcourue, le long du tracé", () => {
    expect(pointAt(square, 0)).toEqual({ x: 0, z: 0 });
    expect(pointAt(square, 50).z).toBeCloseTo(-50);
    expect(pointAt(square, 150).x).toBeCloseTo(50);
    expect(pointAt(square, 150).z).toBeCloseTo(-100);
  });

  it("APP-002: la boucle reprend au départ à la fin", () => {
    expect(pointAt(square, 400).x).toBeCloseTo(0);
    expect(pointAt(square, 400).z).toBeCloseTo(0);
    expect(pointAt(square, 450).z).toBeCloseTo(-50);
    expect(pointAt(square, 4050).z).toBeCloseTo(-50);
    expect(pointAt(square, -50).x).toBeCloseTo(50);
    expect(pointAt(square, -50).z).toBeCloseTo(0);
  });

  it("donne la direction de marche, lissée dans les virages", () => {
    expect(headingAt(square, 50)).toEqual({ x: 0, z: -1 });
    const east = headingAt(square, 150);
    expect(east.x).toBeCloseTo(1);
    const corner = headingAt(square, 100);
    expect(corner.x).toBeGreaterThan(0.5);
    expect(corner.z).toBeLessThan(-0.5);
    expect(Math.hypot(corner.x, corner.z)).toBeCloseTo(1);
  });

  it("garde le nord sur un demi-tour exact", () => {
    const out = createPath([
      { x: 0, z: 0 },
      { x: 0, z: -10 },
      { x: 0, z: 0 },
    ]);
    expect(HEADING_WINDOW_M).toBeLessThan(10);
    expect(headingAt(out, 10)).toEqual({ x: 0, z: -1 });
  });

  it("refuse un parcours sans longueur", () => {
    expect(() => createPath([{ x: 0, z: 0 }])).toThrow("au moins deux points");
    expect(() =>
      createPath([
        { x: 1, z: 1 },
        { x: 1, z: 1 },
      ]),
    ).toThrow("points distincts");
  });
});

describe("APP-002: un trajet libre ne boucle pas", () => {
  const line = createPath([{ x: 0, z: 0 }, { x: 0, z: -100 }], false);
  it("APP-002: s'arrête à l'arrivée au lieu de reprendre au départ", () => {
    expect(line.loop).toBe(false);
    expect(pointAt(line, 100)).toEqual({ x: 0, z: -100 });
    expect(pointAt(line, 5000)).toEqual({ x: 0, z: -100 });
  });
  it("APP-002: reste au départ avant le départ, et suit le tracé entre les deux", () => {
    expect(pointAt(line, -20)).toEqual({ x: 0, z: 0 });
    expect(pointAt(line, 25)).toEqual({ x: 0, z: -25 });
  });
  it("APP-002: garde le cap de la marche jusqu'au bout", () => {
    expect(headingAt(line, 100)).toEqual({ x: 0, z: -1 });
  });
  it("APP-002: les itinéraires figés gardent leur boucle", () => {
    expect(createPath([{ x: 0, z: 0 }, { x: 0, z: -100 }]).loop).toBe(true);
  });
});
