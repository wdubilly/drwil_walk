import { describe, expect, it } from "vitest";
import { COBBLE_M, NO_GRAIN, SURFACE_ID, addGrain, roadMaterial } from "./road-surface.ts";
import { buildRoadsGeometry } from "./roads.ts";

const shaderOf = () => ({ vertexShader: "#include <common>\n#include <begin_vertex>", fragmentShader: "#include <common>\n#include <color_fragment>" });

describe("grain des revêtements", () => {
  it("APP-009: le shader dessine joints de pavés et grain, sans image, d'après la position au sol", () => {
    const shader = shaderOf();
    addGrain(shader);
    expect(shader.vertexShader).toContain("attribute float surfaceKind;");
    expect(shader.fragmentShader).toContain(`vGround / ${COBBLE_M.toFixed(2)}`);
    expect(shader.fragmentShader).toContain("fwidth");
  });

  it("APP-006: le profil « performance » coupe le grain : aplat, sans appel de rendu en plus", () => {
    const shader = shaderOf();
    roadMaterial(false).onBeforeCompile(shader as never, undefined as never);
    expect(shader.fragmentShader).not.toContain("vGround / ");
    const on = shaderOf();
    roadMaterial(true).onBeforeCompile(on as never, undefined as never);
    expect(on.fragmentShader).toContain("vGround / ");
    expect(roadMaterial(true).vertexColors).toBe(true);
  });

  it("APP-009: chaque sommet de voie porte son revêtement ; bordures, lignes et marquages restent sans grain", () => {
    const marks = { positions: [0, 0.1, 0, 1, 0.1, 0, 0, 0.1, 1], colors: [1, 1, 1, 1, 1, 1, 1, 1, 1] };
    const road = { highway: "primary", points: [{ x: 0, z: 0 }, { x: 0, z: -10 }], surface: "pave" as const };
    const geometry = buildRoadsGeometry([road], 0x404040, marks);
    const kinds = Array.from(geometry.getAttribute("surfaceKind").array);
    expect(kinds).toHaveLength(geometry.getAttribute("position").count);
    expect(kinds.slice(0, 6)).toEqual(Array(6).fill(SURFACE_ID.pave));
    expect(kinds.slice(6, 24)).toEqual(Array(18).fill(NO_GRAIN));
    expect(kinds.slice(24)).toEqual([NO_GRAIN, NO_GRAIN, NO_GRAIN]);
  });
});
