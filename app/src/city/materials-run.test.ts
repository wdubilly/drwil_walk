import { encode } from "jpeg-js";
import { describe, expect, it, vi } from "vitest";
import { areaFor, areaOf } from "../../scripts/materials-areas.ts";
import { CITIES } from "../../scripts/cities.ts";
import { DISK, coloursOf, runInventory, runLibrary, toneOf, type Files } from "../../scripts/materials-run.ts";
import { KTX2_PX, ktx2DataUri, prepareKtx2Material } from "../../scripts/materials-textures.ts";
import type { StreetPhoto } from "../../scripts/panoramax.ts";
import { parseLibrary } from "./material-library.ts";
import { makeZip } from "./zip-double.ts";

const area = areaOf("doha-souq-waqif");

function memory(initial: Record<string, string>): Files & { files: Record<string, string> } {
  const files = { ...initial };
  return { files, read: (path) => files[path] ?? "", write: (path, text) => { files[path] = text; } };
}

const jpeg = (rgb: readonly [number, number, number], size = 256): Uint8Array => {
  const data = new Uint8Array(size * size * 4);
  for (let i = 0; i < size * size; i++) data.set([...rgb, 255], i * 4);
  return encode({ width: size, height: size, data }, 90).data;
};

/** Le réseau de la préparation, simulé : les archives CC0 d'ambientCG et les vignettes des photos. */
function network(thumb?: Uint8Array) {
  return vi.fn<typeof fetch>((input) => {
    const url = input as string;
    const asset = /file=(\w+)_1K-JPG\.zip/.exec(url)?.[1];
    if (asset) return Promise.resolve(new Response(Buffer.from(makeZip({ [`${asset}_1K-JPG_Color.jpg`]: jpeg([128, 128, 128]), [`${asset}_1K-JPG_NormalGL.jpg`]: jpeg([128, 128, 255]) }))));
    if (url.startsWith("https://api.panoramax.xyz")) return Promise.resolve(Response.json({ features: [] }));
    return Promise.resolve(thumb ? new Response(Buffer.from(thumb)) : new Response("", { status: 404 }));
  });
}

const photo: StreetPhoto = { source: "panoramax", id: "p", lon: 51.53, lat: 25.287, headingDeg: 0, date: "", author: "a", licence: "CC-BY-SA-4.0", url: "u", thumb: "https://x/t.jpg" };
const loop = JSON.stringify({ geometry: { coordinates: [[51.53, 25.287], [51.531, 25.287]] } });

describe("préparation des matériaux d'un quartier (hors casque)", () => {
  it("déduit le quartier de la ville décrite dans data/villes.json : tracé, matériaux CC0, familles qui citent des matériaux connus", () => {
    expect(area).toEqual(areaFor(CITIES.souq));
    expect(area.loop).toBe("data/souq-waqif-boucle.json");
    expect(areaOf("pune-fc-road").library).toBe("assets/materials/pune-fc-road.json");
    expect(() => areaOf("inconnu")).toThrow("quartier « inconnu » : aucune ville décrite dans data/villes.json");
    const ids = new Set(area.materials.map((m) => m.id));
    for (const list of Object.values(area.families)) for (const id of list) expect(ids.has(id)).toBe(true);
  });

  it("écrit l'inventaire des photos (liens seulement) et rend le relevé, sans jeton", async () => {
    const files = memory({ [area.loop]: loop });
    const text = await runInventory(network(), "doha-souq-waqif", undefined, files);
    expect(text).toContain("- Mapillary : non interrogé (sans jeton).");
    expect(JSON.parse(files.files[area.photos] as string)).toEqual([]);
  });

  it("choisit le ton d'un matériau parmi les couleurs relevées, et ses teintes les plus proches", () => {
    const colours = ["#e3cfa5", "#d2b48c", "#c99a6b", "#efe0c0"];
    expect(toneOf(colours, "clair")).toEqual({ colour: "#efe0c0", tints: ["#efe0c0", "#e3cfa5", "#d2b48c"] });
    expect(toneOf(colours, "moyen").colour).toBe("#d2b48c");
    expect(toneOf(colours, "sombre")).toEqual({ colour: "#c99a6b", tints: ["#c99a6b", "#d2b48c", "#e3cfa5"] });
  });

  it("APP-012: dit provisoires les couleurs de repli — la palette de la région — quand aucune photo n'est relevée", async () => {
    const fetchFn = network();
    const colours = await coloursOf(fetchFn, area, []);
    expect(colours.source).toBe("provisoire");
    expect(colours.note).toContain("« golfe »");
    expect(colours.list.map((c) => c.hex)).toEqual(["#d6c09a", "#cab28a", "#e0caa4", "#9a7a52", "#8e6e48", "#a6845a"]);
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("relève les couleurs sur les vignettes des photos, en s'identifiant", async () => {
    const fetchFn = network(jpeg([200, 160, 100], 64));
    const colours = await coloursOf(fetchFn, area, [photo]);
    expect(colours).toMatchObject({ source: "photos", note: "1 photo(s) de l'inventaire" });
    expect(colours.list[0]?.hex).toMatch(/^#c[6-a]/);
    const [, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit];
    expect(init.headers).toEqual({ "User-Agent": area.userAgent });
    await expect(coloursOf(network(), area, [photo])).rejects.toThrow("https://x/t.jpg : réponse 404");
  });

  it("APP-012: écrit une bibliothèque embarquable : textures en data URI, couleurs dites, lisible par l'application", async () => {
    const files = memory({ [area.photos]: "[]" });
    const summary = await runLibrary(network(), "doha-souq-waqif", files);
    expect(summary).toMatch(/^provisoire : #[0-9a-f]{6}(, #[0-9a-f]{6})+$/);
    const library = parseLibrary(JSON.parse(files.files[area.library] as string));
    expect(library.provisional).toBe(true);
    expect(library.materials.map((m) => m.asset)).toEqual(["Plaster001", "Bricks106A", "Planks037A"]);
    expect(library.materials.every((m) => m.albedo.startsWith("data:image/ktx2;base64,q0tUWCAy") && m.normal.startsWith("data:image/ktx2;base64,"))).toBe(true);
    expect(library.textureSizePx).toBe(256);
  });

  it("APP-012: encode en KTX2 à 512 px (jamais agrandi), couleur sRGB et normale linéaire, mipmaps comprises", async () => {
    expect(KTX2_PX).toBe(512);
    const archive = makeZip({ "Plaster001_1K-JPG_Color.jpg": jpeg([128, 128, 128], 1024), "Plaster001_1K-JPG_NormalGL.jpg": jpeg([128, 128, 255], 1024) });
    const { albedo, normal, sizePx } = await prepareKtx2Material(archive, "Plaster001", [200, 170, 120]);
    expect(sizePx).toBe(512);
    const header = (uri: string): Buffer => Buffer.from(uri.slice("data:image/ktx2;base64,".length), "base64");
    for (const uri of [albedo, normal]) {
      const bytes = header(uri);
      expect([bytes.readUInt32LE(20), bytes.readUInt32LE(24)]).toEqual([512, 512]);
      expect(bytes.readUInt32LE(40)).toBe(10);
    }
    const image = { width: 4, height: 4, data: new Uint8Array(64).fill(255) };
    expect(header(await ktx2DataUri(image, "colour"))).not.toEqual(header(await ktx2DataUri(image, "normal")));
  }, 60_000);

  it("lit les fichiers du dépôt sur le disque", () => {
    expect(JSON.parse(DISK.read("package.json"))).toMatchObject({ name: expect.any(String) as string });
  });
});
