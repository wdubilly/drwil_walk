import { describe, expect, it } from "vitest";
import { readPng, sample } from "../../scripts/png-read.ts";
import { makePng } from "./glb-double.ts";

describe("lecture des textures des packs de figurants", () => {
  it("APP-014: décode une image RVB, filtres de ligne compris (aucun, sous, haut, moyenne, Paeth)", () => {
    const rows = [
      [0, 10, 20, 30, 40, 50, 60],
      [1, 10, 20, 30, 5, 5, 5],
      [2, 1, 1, 1, 1, 1, 1],
      [3, 2, 2, 2, 2, 2, 2],
      [4, 1, 1, 1, 1, 1, 1],
    ];
    const image = readPng(makePng(2, 5, 2, rows));
    expect([...image.rgba.slice(0, 8)]).toEqual([10, 20, 30, 255, 40, 50, 60, 255]);
    expect([...image.rgba.slice(8, 16)]).toEqual([10, 20, 30, 255, 15, 25, 35, 255]);
    expect([...image.rgba.slice(16, 24)]).toEqual([11, 21, 31, 255, 16, 26, 36, 255]);
    // Moyenne : (gauche + haut) / 2 ; Paeth : le prédicteur le plus proche.
    expect([...image.rgba.slice(24, 27)]).toEqual([7, 12, 17]);
    expect(image.rgba[28]).toBe(((7 + 16) >> 1) + 2);
    expect([...image.rgba.slice(32, 35)]).toEqual([8, 13, 18]);
    expect(sample(image, 0.75, 0.1)).toEqual([40, 50, 60]);
    expect(sample(image, -0.25, 1.05)).toEqual([40, 50, 60]);
  });

  it("APP-014: décode une image RVBA et une image à palette", () => {
    expect([...readPng(makePng(1, 1, 6, [[0, 1, 2, 3, 4]])).rgba]).toEqual([1, 2, 3, 4]);
    expect([...readPng(makePng(2, 1, 3, [[0, 1, 0]], { palette: [9, 9, 9, 7, 8, 9] })).rgba]).toEqual([7, 8, 9, 255, 9, 9, 9, 255]);
  });

  it("APP-014: une image illisible ou d'un format non pris en charge est refusée avec sa raison", () => {
    expect(() => readPng(Uint8Array.from([1, 2, 3]))).toThrow("signature attendue");
    expect(() => readPng(Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]))).toThrow("en-tête absent");
    expect(() => readPng(makePng(1, 1, 2, [[0, 1, 2, 3]], { depth: 16 }))).toThrow("profondeur 16");
    expect(() => readPng(makePng(1, 1, 0, [[0, 1]]))).toThrow("couleur 0");
    expect(() => readPng(makePng(1, 1, 2, [[0, 1, 2, 3]], { interlace: 1 }))).toThrow("entrelacement 1");
    expect(() => readPng(makePng(1, 1, 3, [[0, 0]]))).toThrow("palette absente");
    expect(() => readPng(makePng(1, 1, 2, [[7, 1, 2, 3]]))).toThrow("filtre 7 inconnu");
    expect(() => readPng(makePng(1, 2, 2, [[0, 1, 2, 3]]))).toThrow("filtre undefined inconnu");
  });

  it("APP-014: une ligne tronquée ou un indice hors de la palette donne du noir, jamais une lecture hors des données", () => {
    expect([...readPng(makePng(2, 1, 2, [[0, 1, 2, 3]])).rgba]).toEqual([1, 2, 3, 255, 0, 0, 0, 255]);
    expect([...readPng(makePng(1, 1, 3, [[0, 5]], { palette: [9, 9, 9] })).rgba]).toEqual([0, 0, 0, 255]);
  });
});
