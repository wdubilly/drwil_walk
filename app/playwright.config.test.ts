import { describe, expect, it } from "vitest";
import config, { E2E_PORT } from "./playwright.config.ts";

describe("configuration Playwright", () => {
  it("lance les e2e du dossier e2e/ contre le serveur de dev en HTTPS", () => {
    expect(config.testDir).toBe("e2e");
    expect(config.use?.baseURL).toBe(`https://localhost:${String(E2E_PORT)}`);
    expect(config.use?.ignoreHTTPSErrors).toBe(true);
    const server = Array.isArray(config.webServer) ? config.webServer[0] : config.webServer;
    expect(server?.command).toContain(`--port ${String(E2E_PORT)} --strictPort`);
  });

  it("SEC-007: le serveur des e2e reçoit une clé fictive, jamais une vraie", () => {
    const server = Array.isArray(config.webServer) ? config.webServer[0] : config.webServer;
    expect(server?.env?.["VITE_GOOGLE_MAPS_API_KEY"]).toBe("cle-factice-e2e");
  });

  it("refuse un test isolé par .only, qui ferait passer les autres pour verts", () => {
    expect(config.forbidOnly).toBe(true);
  });

  it("écrit ses résultats hors de la couche, ignorés par Git", () => {
    expect(config.outputDir).toBe("../dist/e2e-results");
  });
});
