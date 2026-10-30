import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("point d'entrée", () => {
  it("affiche la vitesse de départ dans l'élément #app au chargement", async () => {
    const app = { textContent: null as string | null };
    const querySelector = vi.fn(() => app);
    vi.stubGlobal("document", { querySelector });
    await import("./main.ts");
    expect(querySelector).toHaveBeenCalledWith("#app");
    expect(app.textContent).toBe("Vitesse de départ : 4,0 km/h");
  });

  it("signale une page sans élément #app au lieu de rester muette", async () => {
    vi.stubGlobal("document", { querySelector: () => ({ textContent: null }) });
    const { mount } = await import("./main.ts");
    expect(() => {
      mount(null);
    }).toThrow("élément #app introuvable");
  });
});
