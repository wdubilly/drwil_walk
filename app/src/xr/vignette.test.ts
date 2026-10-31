import { CustomBlending, OneMinusSrcAlphaFactor, ShaderMaterial, ZeroFactor } from "three";
import { describe, expect, it } from "vitest";
import { VIGNETTE_INNER, VIGNETTE_OUTER, createVignette, vignetteAmount } from "./vignette.ts";

describe("vignette réelle", () => {
  it("APP-001: le centre reste intact, les bords laissent entièrement passer le réel, entre les deux le fondu est progressif", () => {
    expect(vignetteAmount(0)).toBe(0);
    expect(vignetteAmount(VIGNETTE_INNER)).toBe(0);
    expect(vignetteAmount(VIGNETTE_OUTER)).toBe(1);
    expect(vignetteAmount(2)).toBe(1);
    const mid = vignetteAmount((VIGNETTE_INNER + VIGNETTE_OUTER) / 2);
    expect(mid).toBeCloseTo(0.5);
  });

  it("APP-001: un quadrilatère plein écran dessiné en dernier, qui ne fait que retirer de l'opacité (jamais en ajouter)", () => {
    const mesh = createVignette();
    const m = mesh.material as ShaderMaterial;
    expect([m.blending, m.blendSrc, m.blendDst]).toEqual([CustomBlending, ZeroFactor, OneMinusSrcAlphaFactor]);
    expect([m.depthTest, m.depthWrite, mesh.frustumCulled]).toEqual([false, false, false]);
    expect(mesh.renderOrder).toBeGreaterThan(100);
    expect(m.fragmentShader).toContain(`smoothstep(${VIGNETTE_INNER.toFixed(2)}, ${VIGNETTE_OUTER.toFixed(2)}`);
    expect(m.fragmentShader).toContain("vec4(0.0, 0.0, 0.0,");
  });
});
