// Détection des capacités de l'appareil (APP-006) : jamais le user-agent seul. Une capacité inconnue reste `undefined`,
// et une détection impossible retombe sur le profil équilibré.
import { FALLBACK_PROFILE, type ProfileId } from "./profiles.ts";

export interface Capabilities {
  /** Le casque : une session `immersive-ar` est possible. */
  headset: boolean | undefined;
  /** Un pointeur tactile principal (tablette, téléphone). */
  touch: boolean | undefined;
  /** WebGL 2 disponible (extensions graphiques modernes). */
  webgl2: boolean | undefined;
}

export interface DetectionEnv {
  xr: { isSessionSupported(mode: "immersive-ar"): Promise<boolean> } | undefined;
  document: Document;
}

async function headsetOf(xr: DetectionEnv["xr"]): Promise<boolean | undefined> {
  if (!xr) return false;
  try {
    return await xr.isSessionSupported("immersive-ar");
  } catch {
    return undefined;
  }
}

function touchOf(win: Window | null): boolean | undefined {
  if (typeof win?.matchMedia !== "function") return undefined;
  return win.matchMedia("(pointer: coarse)").matches;
}

function webgl2Of(doc: Document): boolean | undefined {
  try {
    return doc.createElement("canvas").getContext("webgl2") !== null;
  } catch {
    return undefined;
  }
}

export async function detectCapabilities(env: DetectionEnv): Promise<Capabilities> {
  return { headset: await headsetOf(env.xr), touch: touchOf(env.document.defaultView), webgl2: webgl2Of(env.document) };
}

/** Le profil proposé : le casque garde le rendu d'avant, la tablette ménage l'image, le PC en donne plus. */
export function profileFor(capabilities: Capabilities): ProfileId {
  if (capabilities.webgl2 === false) return "performance";
  if (capabilities.headset === true) return "equilibre";
  if (capabilities.touch === true) return "performance";
  if (capabilities.headset === false && capabilities.touch === false) return "qualite";
  return FALLBACK_PROFILE;
}

/** Le profil proposé d'après l'appareil ; toute panne de détection retombe sur le repli. */
export async function detectProfile(env: DetectionEnv): Promise<ProfileId> {
  try {
    return profileFor(await detectCapabilities(env));
  } catch {
    return FALLBACK_PROFILE;
  }
}
