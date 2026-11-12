import { CompressedTexture, RGBA_ASTC_4x4_Format, RGBA_ETC2_EAC_Format, SRGBColorSpace } from "three";
import { Window } from "happy-dom";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import { describe, expect, it, vi } from "vitest";
import config, { basisTranscoder } from "../../vite.config.ts";
import { KTX2 } from "./material-library.ts";
import { TRANSCODER_PATH, createKtx2Loader, ktx2Texture, probeRenderer, textureLoader, type Ktx2Like } from "./material-ktx2.ts";

const doc = new Window().document as unknown as Document;
const loaded = (): CompressedTexture => {
  const texture = new CompressedTexture([{ data: new Uint8Array(16), width: 4, height: 4 }], 4, 4, RGBA_ETC2_EAC_Format);
  texture.colorSpace = SRGBColorSpace;
  return texture;
};

describe("textures KTX2 des matériaux locaux", () => {
  it("APP-012: rend tout de suite une texture vide, la remplit (format GPU, mipmaps, espace de couleur) quand le transcodage finit", () => {
    let done: (t: CompressedTexture) => void = () => undefined;
    let bytes = new ArrayBuffer(0);
    const loader: Ktx2Like = { parse: (buffer, onLoad) => { bytes = buffer; done = onLoad; } };
    const texture = ktx2Texture(loader, `${KTX2}AQID`) as CompressedTexture;
    expect([texture.mipmaps.length, texture.format, texture.version]).toEqual([0, RGBA_ASTC_4x4_Format, 0]);
    expect([...new Uint8Array(bytes)]).toEqual([1, 2, 3]);
    const source = loaded();
    done(source);
    expect(texture.mipmaps).toBe(source.mipmaps);
    expect([texture.format, texture.colorSpace, texture.generateMipmaps, texture.version]).toEqual([RGBA_ETC2_EAC_Format, SRGBColorSpace, false, 1]);
  });

  it("QUA-002 APP-012: un KTX2 illisible est dit, jamais avalé, et la texture reste vide", () => {
    const loader: Ktx2Like = { parse: (_bytes, _ok, onError) => { onError(new Error("corrompu")); } };
    const fail = vi.fn();
    expect((ktx2Texture(loader, `${KTX2}AAAA`, fail) as CompressedTexture).version).toBe(0);
    expect(fail).toHaveBeenCalledWith("texture KTX2 illisible : Error: corrompu");
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    ktx2Texture(loader, `${KTX2}AAAA`);
    expect(error).toHaveBeenCalledWith("texture KTX2 illisible : Error: corrompu");
    error.mockRestore();
  });

  it("APP-012: le chargeur de l'accueil crée le chargeur KTX2 à la première texture KTX2 seulement ; un JPEG passe par le document", () => {
    const parse = vi.fn();
    const make = vi.fn((): Ktx2Like => ({ parse }));
    const textures = textureLoader(doc, make);
    expect((textures("data:image/jpeg;base64,AAAA").image as HTMLImageElement).ownerDocument).toBe(doc);
    expect(make).not.toHaveBeenCalled();
    textures(`${KTX2}AAAA`);
    textures(`${KTX2}BBBB`);
    expect(make).toHaveBeenCalledExactlyOnceWith(doc);
    expect(parse).toHaveBeenCalledTimes(2);
  });

  it("APP-012: sonde les formats compressés d'un contexte GL jetable ; sans contexte, aucun format compressé", () => {
    const gl = { getExtension: (name: string) => (name === "WEBGL_compressed_texture_astc" ? { getSupportedProfiles: () => ["ldr"] } : null) };
    const { extensions } = probeRenderer(gl);
    expect([extensions.has("WEBGL_compressed_texture_astc"), extensions.has("WEBGL_compressed_texture_etc")]).toEqual([true, false]);
    expect(extensions.get("WEBGL_compressed_texture_astc")).toEqual({ getSupportedProfiles: expect.any(Function) as unknown });
    for (const none of [null, {}]) expect([probeRenderer(none).extensions.has("x"), probeRenderer(none).extensions.get("x")]).toEqual([false, undefined]);
  });

  it("APP-012: le chargeur réel lit le transcodeur servi avec la page, jamais un autre serveur", () => {
    const path = vi.spyOn(KTX2Loader.prototype, "setTranscoderPath");
    const detect = vi.spyOn(KTX2Loader.prototype, "detectSupport").mockReturnThis();
    createKtx2Loader(doc);
    createKtx2Loader(doc, "/autre/");
    expect(path.mock.calls).toEqual([[TRANSCODER_PATH], ["/autre/"]]);
    expect(TRANSCODER_PATH).toBe("/basis/");
    expect(detect).toHaveBeenCalledTimes(2);
    vi.restoreAllMocks();
  });
});

describe("transcodeur KTX2 servi avec la page", () => {
  const plugin = basisTranscoder();
  const hooks = plugin as unknown as {
    configureServer(server: { middlewares: { use(path: string, handler: (req: { url?: string }, res: { setHeader: (k: string, v: string) => void; end: (body: Buffer) => void }, next: () => void) => void): void } }): void;
    generateBundle(this: { emitFile: (file: { fileName: string; source: Buffer }) => void }): void;
  };

  it("APP-012: est branché dans la configuration Vite", () => {
    expect((config.plugins ?? []).flat().map((p) => (p && typeof p === "object" && "name" in p ? p.name : ""))).toContain(plugin.name);
  });

  it("APP-012: en développement, sert le JavaScript et le WebAssembly sous /basis/, et laisse passer le reste", () => {
    let handler: Parameters<Parameters<typeof hooks.configureServer>[0]["middlewares"]["use"]>[1] = () => undefined;
    hooks.configureServer({ middlewares: { use: (path, h) => { expect(path).toBe("/basis/"); handler = h; } } });
    const headers: Record<string, string> = {};
    const res = { setHeader: (k: string, v: string) => { headers[k] = v; }, end: vi.fn() };
    const next = vi.fn();
    handler({ url: "/basis_transcoder.wasm" }, res, next);
    expect(headers["Content-Type"]).toBe("application/wasm");
    expect((res.end.mock.calls[0] as [Buffer])[0].subarray(0, 4)).toEqual(Buffer.from([0, 0x61, 0x73, 0x6d]));
    handler({ url: "/basis_transcoder.js" }, res, next);
    expect(headers["Content-Type"]).toBe("text/javascript");
    handler({ url: "/../../package.json" }, res, next);
    handler({}, res, next);
    expect(next).toHaveBeenCalledTimes(2);
    expect(res.end).toHaveBeenCalledTimes(2);
  });

  it("APP-012: dans le build, emporte les deux fichiers du transcodeur dans basis/", () => {
    const emitted: string[] = [];
    hooks.generateBundle.call({ emitFile: (file) => { emitted.push(`${file.fileName}:${file.source.length > 1000 ? "plein" : "vide"}`); } });
    expect(emitted).toEqual(["basis/basis_transcoder.js:plein", "basis/basis_transcoder.wasm:plein"]);
  });
});
