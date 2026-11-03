import { encode } from "jpeg-js";
import { describe, expect, it, vi } from "vitest";
import { MATERIAL_AREAS, areaOf } from "../../scripts/materials-areas.ts";
import { DISK, coloursOf, runInventory, runLibrary, toneOf, type Files } from "../../scripts/materials-run.ts";
import { TEXTURE_PX } from "../../scripts/materials-textures.ts";
import type { StreetPhoto } from "../../scripts/panoramax.ts";
import { parseLibrary } from "./material-library.ts";
import { makeZip } from "./zip-double.ts";

const area = MATERIAL_AREAS["doha-souq-waqif"];

function memory(initial: Record<string, string>): Files & { files: Record<string, string> } {
  const files = { ...initial };
  return { files, read: (path) => files[path] ?? "", write: (path, text) => { files[path] = text; } };
}

const jpeg = (rgb: readonly [number, number, number], size = TEXTURE_PX): Uint8Array => {
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
  it("décrit le souk par des données : tracé, matériaux CC0, familles qui citent des matériaux connus", () => {
    expect(areaOf("doha-souq-waqif")).toBe(area);
    expect(() => areaOf("pune-fc-road")).toThrow("quartier « pune-fc-road » : aucune bibliothèque de matériaux décrite");
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

  it("dit provisoires les couleurs de repli quand aucune photo n'est relevée", async () => {
    const fetchFn = network();
    const colours = await coloursOf(fetchFn, area, []);
    expect(colours.source).toBe("provisoire");
    expect(colours.list.map((c) => c.hex)).toEqual(area.provisional.colours);
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
    expect(summary).toBe("provisoire : #e3cfa5, #d2b48c, #c99a6b, #efe0c0");
    const library = parseLibrary(JSON.parse(files.files[area.library] as string));
    expect(library.provisional).toBe(true);
    expect(library.materials.map((m) => m.asset)).toEqual(["Plaster001", "Bricks106A", "Planks037A"]);
    expect(library.textureSizePx).toBe(TEXTURE_PX);
  });

  it("lit les fichiers du dépôt sur le disque", () => {
    expect(JSON.parse(DISK.read("package.json"))).toMatchObject({ name: expect.any(String) as string });
  });
});
