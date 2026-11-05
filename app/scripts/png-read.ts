// Lecture d'une image PNG (8 bits, sans entrelacement : RVB, RVBA ou palette), en mémoire et sans rien exécuter : la texture
// d'un pack de figurants est une donnée non fiable. Le script de préparation y lit la couleur de chaque sommet.
import { inflateSync } from "node:zlib";

export interface Image {
  width: number;
  height: number;
  /** Quatre octets par pixel (rouge, vert, bleu, alpha), ligne par ligne. */
  rgba: Uint8Array;
}

const SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];
const CHANNELS: Record<number, number> = { 2: 3, 3: 1, 6: 4 };

function paeth(a: number, b: number, c: number): number {
  const p = a + b - c;
  const [pa, pb, pc] = [Math.abs(p - a), Math.abs(p - b), Math.abs(p - c)];
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}

/** Retire les filtres de ligne (aucun, sous, haut, moyenne, Paeth) : `channels` octets par pixel. */
function unfilter(raw: Uint8Array, width: number, height: number, channels: number): Uint8Array {
  const line = width * channels;
  const out = new Uint8Array(line * height);
  for (let y = 0; y < height; y += 1) {
    const filter = raw[y * (line + 1)];
    for (let x = 0; x < line; x += 1) {
      const value = raw[y * (line + 1) + 1 + x] ?? 0;
      const left = x >= channels ? (out[y * line + x - channels] as number) : 0;
      const up = y > 0 ? (out[(y - 1) * line + x] as number) : 0;
      const corner = x >= channels && y > 0 ? (out[(y - 1) * line + x - channels] as number) : 0;
      const predictors = [0, left, up, (left + up) >> 1, paeth(left, up, corner)];
      const predictor = predictors[filter ?? -1];
      if (predictor === undefined) throw new Error(`png illisible : filtre ${String(filter)} inconnu`);
      out[y * line + x] = (value + predictor) & 0xff;
    }
  }
  return out;
}

/** Décode l'image ; tout écart (signature, profondeur, type de couleur, palette) lève une erreur qui dit lequel. */
export function readPng(bytes: Uint8Array): Image {
  const data = Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (!SIGNATURE.every((b, i) => data[i] === b)) throw new Error("png illisible : signature attendue");
  let at = 8;
  let header: Buffer | undefined;
  let palette: Buffer | undefined;
  const idat: Buffer[] = [];
  while (at + 8 <= data.length) {
    const length = data.readUInt32BE(at);
    const type = data.toString("latin1", at + 4, at + 8);
    const body = data.subarray(at + 8, at + 8 + length);
    if (type === "IHDR") header = body;
    if (type === "PLTE") palette = body;
    if (type === "IDAT") idat.push(body);
    at += 12 + length;
  }
  if (!header || header.length < 13) throw new Error("png illisible : en-tête absent");
  const [width, height, depth, colour, interlace] = [header.readUInt32BE(0), header.readUInt32BE(4), header[8], header[9] as number, header[12]];
  const channels = CHANNELS[colour];
  if (depth !== 8 || interlace !== 0 || !channels) throw new Error(`png non pris en charge : profondeur ${String(depth)}, couleur ${String(colour)}, entrelacement ${String(interlace)}`);
  if (colour === 3 && !palette) throw new Error("png illisible : palette absente");
  const pixels = unfilter(inflateSync(Buffer.concat(idat)), width, height, channels);
  const rgba = new Uint8Array(width * height * 4);
  for (let p = 0; p < width * height; p += 1) {
    const at3 = colour === 3 ? (pixels[p] as number) * 3 : p * channels;
    const source = colour === 3 ? (palette as Buffer) : pixels;
    rgba.set([source[at3] ?? 0, source[at3 + 1] ?? 0, source[at3 + 2] ?? 0, colour === 6 ? (pixels[p * 4 + 3] as number) : 255], p * 4);
  }
  return { width, height, rgba };
}

/** La couleur au point de texture (u, v) (le plus proche, v vers le bas comme en glTF), en octets sRGB. */
export function sample(image: Image, u: number, v: number): [number, number, number] {
  const wrap = (t: number): number => t - Math.floor(t);
  const x = Math.min(image.width - 1, Math.floor(wrap(u) * image.width));
  const y = Math.min(image.height - 1, Math.floor(wrap(v) * image.height));
  const at = (y * image.width + x) * 4;
  return [image.rgba[at] as number, image.rgba[at + 1] as number, image.rgba[at + 2] as number];
}
