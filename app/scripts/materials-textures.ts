// Préparation des textures d'un matériau (hors casque) : l'archive CC0 d'ambientCG (lue en mémoire, rien d'extrait ni
// d'exécuté) donne la couleur et la normale ; la couleur est recolorée d'après la couleur relevée sur les photos, les deux
// sont réduites à une petite taille pour le Quest 3 puis embarquées en base64 : en KTX2 (Basis, mipmaps comprises, compression
// GPU : `prepareKtx2Material`) ou en JPEG (`prepareMaterial`).
import { decode, encode } from "jpeg-js";
import { encodeToKTX2 } from "ktx2-encoder";
import { openZip } from "../src/city/zip-read.ts";
import { luma, type Rgb, type Rgba } from "./materials-colours.ts";

/** Côté des textures embarquées, en pixels : une puissance de deux (mipmaps), légère pour le casque. */
export const TEXTURE_PX = 256;
export const JPEG_QUALITY = 80;
export const ambientCgUrl = (asset: string): string => `https://ambientcg.com/get?file=${asset}_1K-JPG.zip`;

/** Réduit une image à `size` × `size` par moyenne de blocs (l'image source est carrée, plus grande). */
export function downsample(image: Rgba, size: number): Rgba {
  const data = new Uint8Array(size * size * 4);
  const [bw, bh] = [image.width / size, image.height / size];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const sum = [0, 0, 0, 0];
      let n = 0;
      for (let sy = Math.floor(y * bh); sy < Math.floor((y + 1) * bh); sy++) {
        for (let sx = Math.floor(x * bw); sx < Math.floor((x + 1) * bw); sx++) {
          const i = (sy * image.width + sx) * 4;
          for (let c = 0; c < 4; c++) sum[c] = (sum[c] as number) + (image.data[i + c] as number);
          n += 1;
        }
      }
      for (let c = 0; c < 4; c++) data[(y * size + x) * 4 + c] = Math.round((sum[c] as number) / n);
    }
  }
  return { width: size, height: size, data };
}

/** Garde le relief lumineux de la texture et lui donne la couleur relevée : sa moyenne devient exactement `target`. */
export function recolour(image: Rgba, target: Rgb): Rgba {
  const count = image.width * image.height;
  const lumas = Array.from({ length: count }, (_, p) => luma([image.data[p * 4] as number, image.data[p * 4 + 1] as number, image.data[p * 4 + 2] as number]));
  const mean = lumas.reduce((sum, y) => sum + y, 0) / count || 1;
  const data = new Uint8Array(count * 4);
  lumas.forEach((y, p) => {
    for (let c = 0; c < 3; c++) data[p * 4 + c] = Math.round(Math.min(255, (target[c] as number) * (y / mean)));
    data[p * 4 + 3] = 255;
  });
  return { width: image.width, height: image.height, data };
}

export const jpegDataUri = (image: Rgba): string =>
  `data:image/jpeg;base64,${Buffer.from(encode({ width: image.width, height: image.height, data: image.data }, JPEG_QUALITY).data).toString("base64")}`;

const read = (bytes: Uint8Array): Rgba => decode(bytes, { useTArray: true, formatAsRGBA: true, maxMemoryUsageInMB: 256 });

/** La couleur (recolorée) et la normale d'un matériau, prêtes à embarquer. */
export function prepareMaterial(archive: Uint8Array, asset: string, colour: Rgb): { albedo: string; normal: string } {
  const zip = openZip(archive);
  const file = (map: string): Uint8Array => zip.read(`${asset}_1K-JPG_${map}.jpg`);
  return {
    albedo: jpegDataUri(recolour(downsample(read(file("Color")), TEXTURE_PX), colour)),
    normal: jpegDataUri(downsample(read(file("NormalGL")), TEXTURE_PX)),
  };
}

/** Côté des textures KTX2, en pixels : 512 rend bien à hauteur d'homme, et un KTX2 reste compressé en mémoire graphique. */
export const KTX2_PX = 512;

/** Une image RGBA en KTX2 (encodeur Basis en WebAssembly, sans outil système) : ETC1S (≈ 60 Ko par texture ; UASTC en pèserait 330 Ko), la couleur en sRGB, la normale en mode « normal map ». */
export async function ktx2DataUri(image: Rgba, kind: "colour" | "normal"): Promise<string> {
  const { width, height, data } = image;
  const options = kind === "colour" ? { isPerceptual: true, isSetKTX2SRGBTransferFunc: true } : { isNormalMap: true, isPerceptual: false };
  const bytes = await encodeToKTX2(new Uint8Array(0), { ...options, isUASTC: false, generateMipmap: true, imageDecoder: () => Promise.resolve({ data, width, height }) });
  return `data:image/ktx2;base64,${Buffer.from(bytes).toString("base64")}`;
}

/** Comme `prepareMaterial`, en KTX2 : jamais agrandi (la source plus petite que 512 px garde sa taille). Rend aussi le côté retenu. */
export async function prepareKtx2Material(archive: Uint8Array, asset: string, colour: Rgb): Promise<{ albedo: string; normal: string; sizePx: number }> {
  const zip = openZip(archive);
  const file = (map: string): Rgba => read(zip.read(`${asset}_1K-JPG_${map}.jpg`));
  const [albedo, normal] = [file("Color"), file("NormalGL")];
  const sizePx = Math.min(KTX2_PX, albedo.width);
  return {
    albedo: await ktx2DataUri(recolour(downsample(albedo, sizePx), colour), "colour"),
    normal: await ktx2DataUri(downsample(normal, sizePx), "normal"),
    sizePx,
  };
}
