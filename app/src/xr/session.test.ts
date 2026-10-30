import { describe, expect, it, vi } from "vitest";
import { REFERENCE_SPACE, SESSION_MODE, requestMixedRealitySession, type XrSystemLike } from "./session.ts";

function fakeXr(supported: boolean) {
  const session = { mode: "fausse session" } as unknown as XRSession;
  const xr = {
    isSessionSupported: vi.fn(() => Promise.resolve(supported)),
    requestSession: vi.fn(() => Promise.resolve(session)),
  } satisfies XrSystemLike;
  return { xr, session };
}

describe("APP-001: session en réalité mixte", () => {
  it("APP-001: demande toujours une session immersive-ar, jamais immersive-vr", async () => {
    const { xr, session } = fakeXr(true);
    await expect(requestMixedRealitySession(xr)).resolves.toBe(session);
    expect(SESSION_MODE).toBe("immersive-ar");
    expect(xr.isSessionSupported).toHaveBeenCalledWith("immersive-ar");
    expect(xr.requestSession).toHaveBeenCalledWith("immersive-ar", { requiredFeatures: [REFERENCE_SPACE] });
    expect(xr.requestSession).not.toHaveBeenCalledWith("immersive-vr", expect.anything());
  });

  it("APP-001: refuse plutôt que de se replier sur une session sans passthrough", async () => {
    const { xr } = fakeXr(false);
    await expect(requestMixedRealitySession(xr)).rejects.toThrow("immersive-ar");
    expect(xr.requestSession).not.toHaveBeenCalled();
  });

  it("dit pourquoi sans WebXR", async () => {
    await expect(requestMixedRealitySession(undefined)).rejects.toThrow("WebXR indisponible");
  });
});
