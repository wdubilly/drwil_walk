import { Window } from "happy-dom";
import { describe, expect, it } from "vitest";
import { detectCapabilities, detectProfile, profileFor, type DetectionEnv } from "./capabilities.ts";

function env(over: { xr?: DetectionEnv["xr"]; coarse?: boolean; webgl2?: boolean | "throws"; noMatchMedia?: boolean } = {}): DetectionEnv {
  const getContext = () => {
    if (over.webgl2 === "throws") throw new Error("pas de contexte");
    return over.webgl2 === false ? null : {};
  };
  const defaultView = { matchMedia: over.noMatchMedia ? undefined : () => ({ matches: over.coarse ?? false }) };
  const document = { createElement: () => ({ getContext }), defaultView } as unknown as Document;
  return { xr: "xr" in over ? over.xr : { isSessionSupported: () => Promise.resolve(false) }, document };
}
const supported = { isSessionSupported: () => Promise.resolve(true) };

describe("détection des capacités", () => {
  it("APP-006: lit le casque, le tactile et WebGL 2 sur les capacités, pas sur le user-agent", async () => {
    expect(await detectCapabilities(env({ xr: supported }))).toEqual({ headset: true, touch: false, webgl2: true });
    expect(await detectCapabilities(env({ xr: undefined, coarse: true }))).toEqual({ headset: false, touch: true, webgl2: true });
  });

  it("APP-006: une capacité illisible reste inconnue", async () => {
    const failing = { isSessionSupported: () => Promise.reject(new Error("refusé")) };
    expect(await detectCapabilities(env({ xr: failing, noMatchMedia: true, webgl2: "throws" }))).toEqual({ headset: undefined, touch: undefined, webgl2: undefined });
  });

  it("APP-006: un profil par appareil, équilibré quand la détection est impossible", () => {
    expect(profileFor({ headset: true, touch: false, webgl2: true })).toBe("equilibre");
    expect(profileFor({ headset: false, touch: false, webgl2: true })).toBe("qualite");
    expect(profileFor({ headset: false, touch: true, webgl2: true })).toBe("performance");
    expect(profileFor({ headset: false, touch: false, webgl2: false })).toBe("performance");
    expect(profileFor({ headset: undefined, touch: undefined, webgl2: undefined })).toBe("equilibre");
    expect(profileFor({ headset: false, touch: undefined, webgl2: true })).toBe("equilibre");
  });

  it("APP-006: detectProfile propose le profil de l'appareil et retombe sur équilibré en cas de panne", async () => {
    expect(await detectProfile(env({ xr: undefined }))).toBe("qualite");
    const broken = { get xr(): never { throw new Error("panne"); }, document: new Window().document as unknown as Document };
    expect(await detectProfile(broken)).toBe("equilibre");
  });
});
