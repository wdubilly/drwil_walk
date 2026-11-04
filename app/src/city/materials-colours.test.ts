import { decode, encode } from "jpeg-js";
import { describe, expect, it } from "vitest";
import { BAND, STRIDE, dominantColours, facadePixels, fromHex, isFacadePixel, kMeans, luma, toHex, type Rgb, type Rgba } from "../../scripts/materials-colours.ts";
import { JPEG_QUALITY, TEXTURE_PX, ambientCgUrl, downsample, jpegDataUri, prepareMaterial, recolour } from "../../scripts/materials-textures.ts";
import { makeZip } from "./zip-double.ts";

/** Une image unie de `size` × `size`, ou peinte pixel par pixel. */
function image(size: number, paint: (x: number, y: number) => Rgb): Rgba {
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      data.set([...paint(x, y), 255], (y * size + x) * 4);
    }
  }
  return { width: size, height: size, data };
}

const OCHRE: Rgb = [200, 160, 100];
const SKY: Rgb = [90, 140, 230];

describe("relevé des couleurs des façades sur les photos", () => {
  it("écarte le ciel bleu et les tons extrêmes, garde un enduit ocre", () => {
    expect(isFacadePixel(OCHRE)).toBe(true);
    expect(isFacadePixel(SKY)).toBe(false);
    expect(isFacadePixel([10, 10, 10])).toBe(false);
    expect(isFacadePixel([252, 252, 252])).toBe(false);
    expect(luma([255, 255, 255])).toBeCloseTo(255);
  });

  it("ne lit que la bande centrale de la photo, un pixel sur STRIDE", () => {
    // Le ciel en haut, l'ocre au milieu, la chaussée sombre en bas.
    const photo = image(40, (_, y) => (y < 40 * BAND.top ? SKY : y < 40 * BAND.bottom ? OCHRE : [20, 20, 20]));
    const pixels = facadePixels(photo);
    expect(pixels.length).toBe(Math.ceil((40 * (BAND.bottom - BAND.top)) / STRIDE) * (40 / STRIDE));
    expect(new Set(pixels.map(toHex))).toEqual(new Set([toHex(OCHRE)]));
    expect(facadePixels({ width: 4, height: 4, data: new Uint8Array(0) })).toEqual([]);
  });

  it("regroupe les pixels de façon déterministe, sans hasard", () => {
    const pixels: Rgb[] = [[200, 160, 100], [202, 158, 98], [100, 80, 60], [98, 82, 62]];
    expect(kMeans(pixels, 2)).toEqual(kMeans([...pixels].reverse(), 2));
    expect(kMeans(pixels, 2).map((c) => c.count)).toEqual([2, 2]);
    expect(kMeans([], 3)).toEqual([]);
    expect(kMeans([[1, 2, 3]], 4)).toEqual([{ centre: [1, 2, 3], count: 1 }]);
    // Deux centres identiques au départ : le second ne reçoit aucun pixel et reste en place.
    expect(kMeans([[5, 5, 5], [5, 5, 5]], 2).map((c) => c.count)).toEqual([2, 0]);
  });

  it("rend les couleurs dominantes, de la plus fréquente à la plus rare", () => {
    const photo = image(40, (x) => (x < 30 ? OCHRE : [120, 90, 70]));
    const colours = dominantColours([photo], 2);
    expect(colours.map((c) => c.hex)).toEqual([toHex(OCHRE), "#785a46"]);
    // Un pixel sur quatre : 8 colonnes lues sur 10 sont ocre.
    expect(colours[0]?.share).toBe(0.8);
    expect(dominantColours([image(8, () => OCHRE)], 3)).toEqual([{ hex: "#c8a064", share: 1 }]);
  });

  it("écrit et relit une couleur hexadécimale, bornée", () => {
    expect(toHex([300, -4, 15.6])).toBe("#ff0010");
    expect(fromHex("#C8a064")).toEqual([200, 160, 100]);
    expect(() => fromHex("ocre")).toThrow("couleur illisible : ocre");
  });
});

describe("préparation des textures d'un matériau", () => {
  it("réduit une image par moyenne de blocs", () => {
    const checker = image(4, (x, y) => ((x + y) % 2 === 0 ? [0, 0, 0] : [200, 100, 50]));
    const small = downsample(checker, 2);
    expect([...small.data.slice(0, 4)]).toEqual([100, 50, 25, 255]);
    expect(small.width).toBe(2);
  });

  it("donne à la texture la couleur relevée en gardant son relief", () => {
    const relief = image(2, (x) => (x === 0 ? [50, 50, 50] : [150, 150, 150]));
    const coloured = recolour(relief, [200, 100, 40]);
    expect([...coloured.data.slice(0, 4)]).toEqual([100, 50, 20, 255]);
    expect([...coloured.data.slice(4, 8)]).toEqual([255, 150, 60, 255]);
    // Une texture noire n'a pas de relief : la division ne s'emballe pas.
    expect([...recolour(image(1, () => [0, 0, 0]), OCHRE).data]).toEqual([0, 0, 0, 255]);
  });

  it("embarque une image en JPEG base64, et lit l'archive CC0 sans rien en extraire sur le disque", () => {
    expect(jpegDataUri(image(8, () => OCHRE)).startsWith("data:image/jpeg;base64,")).toBe(true);
    expect(JPEG_QUALITY).toBeLessThanOrEqual(90);
    expect(ambientCgUrl("Plaster001")).toBe("https://ambientcg.com/get?file=Plaster001_1K-JPG.zip");
    const jpeg = (paint: Rgb): Uint8Array => encode({ ...image(TEXTURE_PX * 2, () => paint) }, 95).data;
    const zip = makeZip({ "Plaster001_1K-JPG_Color.jpg": jpeg([128, 128, 128]), "Plaster001_1K-JPG_NormalGL.jpg": jpeg([128, 128, 255]) });
    const { albedo, normal } = prepareMaterial(zip, "Plaster001", OCHRE);
    const read = (uri: string): Rgba => decode(Buffer.from(uri.split(",")[1] as string, "base64"), { useTArray: true, formatAsRGBA: true });
    const colour = read(albedo);
    expect(colour.width).toBe(TEXTURE_PX);
    expect(Math.abs((colour.data[0] as number) - OCHRE[0])).toBeLessThanOrEqual(3);
    expect(Math.abs((read(normal).data[2] as number) - 255)).toBeLessThanOrEqual(3);
  });
});
