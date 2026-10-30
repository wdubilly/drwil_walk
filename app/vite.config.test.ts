import { describe, expect, it } from "vitest";
import config from "./vite.config.ts";

describe("configuration Vite", () => {
  it("sert la page en HTTPS, exigé par WebXR", () => {
    const names = (config.plugins ?? []).flat().map((p) => (p && typeof p === "object" && "name" in p ? p.name : ""));
    expect(names.some((n) => n.includes("basic-ssl"))).toBe(true);
  });

  it("écoute sur le réseau local pour être ouverte depuis le Quest 3", () => {
    expect(config.server?.host).toBe(true);
    expect(config.preview?.host).toBe(true);
  });

  it("garde les tests dans un mode que c8 sait mesurer", () => {
    expect(config.test?.pool).toBe("threads");
    expect(config.test?.experimental?.viteModuleRunner).toBe(false);
  });
});
