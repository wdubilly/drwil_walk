import { NearestFilter } from "three";
import { describe, expect, it } from "vitest";
import { TOON_STEPS, WINDOW_CELL_M, addWindows, buildingMaterial, toonGradient, toonMaterial } from "./toon.ts";

describe("rendu cartoon", () => {
  it("APP-003: la rampe toon a un palier par valeur, sans lissage, et elle est partagée", () => {
    const gradient = toonGradient();
    expect(gradient.image.width).toBe(TOON_STEPS.length);
    expect(gradient.magFilter).toBe(NearestFilter);
    expect(toonGradient()).toBe(gradient);
    expect(toonMaterial({ color: 0xff0000 }).gradientMap).toBe(gradient);
  });

  it("APP-003: le shader reçoit le motif de fenêtres, sans texture ni maillage en plus", () => {
    const shader = {
      vertexShader: "#include <common>\n#include <begin_vertex>",
      fragmentShader: "#include <common>\n#include <color_fragment>",
    };
    addWindows(shader);
    expect(shader.vertexShader).toContain("vLocalNormal = objectNormal;");
    expect(shader.fragmentShader).toContain("varying vec3 vLocalPos;");
    expect(shader.fragmentShader).toContain("diffuseColor.rgb *=");
    expect(shader.fragmentShader).toContain(`/ ${WINDOW_CELL_M.toFixed(1)}`);
    expect(shader.fragmentShader).toContain("#include <color_fragment>");
  });

  it("APP-003: le matériau des façades est toon, coloré par sommet, et compile avec les fenêtres", () => {
    const material = buildingMaterial();
    expect(material.vertexColors).toBe(true);
    expect(material.map).toBeNull();
    const shader = { vertexShader: "#include <common>\n#include <begin_vertex>", fragmentShader: "#include <common>\n#include <color_fragment>" };
    (material.onBeforeCompile as (s: typeof shader) => void)(shader);
    expect(shader.fragmentShader).toContain("vLocalPos");
  });
});
