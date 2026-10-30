// Session WebXR en réalité mixte (APP-001, point 4) : toujours `immersive-ar`, pour que le
// passthrough du Quest 3 montre le réel partout où la ville n'est pas rendue.

export const SESSION_MODE = "immersive-ar" satisfies XRSessionMode;
/** Sol à hauteur réelle : la hauteur des yeux est celle du casque, sans réglage. */
export const REFERENCE_SPACE: XRReferenceSpaceType = "local-floor";

/** Ce que l'on utilise de `navigator.xr`. */
export interface XrSystemLike {
  isSessionSupported(mode: XRSessionMode): Promise<boolean>;
  requestSession(mode: XRSessionMode, init?: XRSessionInit): Promise<XRSession>;
}

/** Ouvre la session ; une erreur en français dit pourquoi elle est impossible (QUA-002). */
export async function requestMixedRealitySession(xr: XrSystemLike | undefined): Promise<XRSession> {
  if (!xr) throw new Error("WebXR indisponible : ouvrir la page dans le navigateur du Quest 3, en HTTPS.");
  if (!(await xr.isSessionSupported(SESSION_MODE))) {
    throw new Error("La réalité mixte (immersive-ar) n'est pas prise en charge par ce navigateur.");
  }
  return xr.requestSession(SESSION_MODE, { requiredFeatures: [REFERENCE_SPACE] });
}
