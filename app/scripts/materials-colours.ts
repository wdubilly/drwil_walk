// Relevé des couleurs dominantes des façades sur des photos de rue (préparation, hors casque) : seule la bande centrale de
// chaque photo est lue (ni le ciel ni le sol), le ciel bleu et les tons extrêmes sont écartés, puis un k-moyennes
// déterministe regroupe les pixels. Les couleurs relevées sont relues par le demandeur avant d'entrer dans le casque.

/** Une image décodée en RGBA, ligne par ligne. */
export interface Rgba {
  width: number;
  height: number;
  data: Uint8Array;
}

export type Rgb = readonly [number, number, number];

export interface DominantColour {
  hex: string;
  /** Part des pixels retenus que cette couleur regroupe, de 0 à 1. */
  share: number;
}

/** La bande lue, en part de la hauteur : sous le ciel, au-dessus de la chaussée. */
export const BAND = { top: 0.35, bottom: 0.75 } as const;
/** Un pixel sur `STRIDE` dans chaque sens : assez pour la couleur, peu pour le calcul. */
export const STRIDE = 4;
const MIN_LUMA = 40;
const MAX_LUMA = 245;

export const luma = ([r, g, b]: Rgb): number => 0.2126 * r + 0.7152 * g + 0.0722 * b;

/** Le ciel (bleu dominant) et les tons extrêmes (ombre noire, reflet blanc) ne disent rien du matériau. */
export function isFacadePixel(rgb: Rgb): boolean {
  const [r, g, b] = rgb;
  const y = luma(rgb);
  return y >= MIN_LUMA && y <= MAX_LUMA && !(b > r + 10 && b >= g);
}

/** Les pixels de façade d'une photo, dans la bande centrale. */
export function facadePixels(image: Rgba): Rgb[] {
  const pixels: Rgb[] = [];
  for (let y = Math.floor(image.height * BAND.top); y < Math.floor(image.height * BAND.bottom); y += STRIDE) {
    for (let x = 0; x < image.width; x += STRIDE) {
      const i = (y * image.width + x) * 4;
      const rgb: Rgb = [image.data[i] ?? 0, image.data[i + 1] ?? 0, image.data[i + 2] ?? 0];
      if (isFacadePixel(rgb)) pixels.push(rgb);
    }
  }
  return pixels;
}

const square = (a: Rgb, b: Rgb): number => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;

/** Un k-moyennes déterministe : les centres partent de pixels répartis du plus sombre au plus clair (aucun hasard). */
export function kMeans(pixels: readonly Rgb[], k: number, iterations = 12): { centre: Rgb; count: number }[] {
  if (pixels.length === 0) return [];
  const sorted = [...pixels].sort((a, b) => luma(a) - luma(b));
  const count = Math.min(k, sorted.length);
  let centres: Rgb[] = Array.from({ length: count }, (_, i) => sorted[Math.floor(((i + 0.5) * sorted.length) / count)] as Rgb);
  let members: number[] = [];
  for (let step = 0; step < iterations; step++) {
    const sums = centres.map(() => [0, 0, 0, 0]);
    members = pixels.map((p) => {
      let best = 0;
      centres.forEach((c, i) => { if (square(p, c) < square(p, centres[best] as Rgb)) best = i; });
      const sum = sums[best] as number[];
      sum[0] = (sum[0] as number) + p[0];
      sum[1] = (sum[1] as number) + p[1];
      sum[2] = (sum[2] as number) + p[2];
      sum[3] = (sum[3] as number) + 1;
      return best;
    });
    centres = centres.map((c, i) => {
      const [r, g, b, n] = sums[i] as [number, number, number, number];
      return n === 0 ? c : [r / n, g / n, b / n];
    });
  }
  return centres.map((centre, i) => ({ centre, count: members.filter((m) => m === i).length }));
}

export const toHex = (rgb: Rgb): string => `#${rgb.map((c) => Math.round(Math.max(0, Math.min(255, c))).toString(16).padStart(2, "0")).join("")}`;

export function fromHex(hex: string): Rgb {
  const value = /^#([0-9a-f]{6})$/i.exec(hex)?.[1];
  if (value === undefined) throw new Error(`couleur illisible : ${hex}`);
  const n = Number.parseInt(value, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Les couleurs dominantes des façades sur toutes les photos, de la plus fréquente à la plus rare. */
export function dominantColours(images: readonly Rgba[], k = 5): DominantColour[] {
  const pixels = images.flatMap(facadePixels);
  return kMeans(pixels, k)
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count)
    .map((c) => ({ hex: toHex(c.centre), share: Math.round((c.count / pixels.length) * 1000) / 1000 }));
}
