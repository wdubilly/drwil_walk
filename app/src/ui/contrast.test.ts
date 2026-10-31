import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { contrastRatio, luminance } from "./contrast.ts";

const css = readFileSync(new URL("./home.css", import.meta.url), "utf8");
const palette = new Map(
  [...css.matchAll(/--([a-z-]+):\s*(#[0-9a-f]{6});/g)].map((m) => [m[1], m[2]] as [string, string]),
);
const color = (name: string): string => {
  const value = palette.get(name);
  if (!value) throw new Error(`couleur --${name} absente de home.css`);
  return value;
};

// Chaque texte de l'accueil avec son fond : [texte, fond, grand texte ?]. « Grand » : 24 px, ou 18,5 px gras.
const PAIRS: readonly [string, string, boolean][] = [
  ["texte", "fond", false],
  ["texte-doux", "fond", false],
  ["texte", "surface", false],
  ["texte-doux", "surface", false],
  ["sur-accent", "accent", true],
  ["bientot-texte", "bientot-fond", false],
  ["sur-bouton-inactif", "bouton-inactif", true],
];

describe("QUA-014 : contraste du texte et de son fond", () => {
  it("QUA-014 : la mesure du contraste est celle de WCAG (noir sur blanc : 21:1)", () => {
    expect(luminance("#ffffff")).toBeCloseTo(1, 5);
    expect(luminance("#000000")).toBe(0);
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#ffffff", "#000000")).toBeCloseTo(21, 5);
    expect(contrastRatio("#777777", "#ffffff")).toBeCloseTo(4.48, 2);
  });

  it.each(PAIRS)("QUA-014 : %s sur %s atteint 4,5:1 (3:1 si grand texte : %s)", (text, background, large) => {
    expect(contrastRatio(color(text), color(background))).toBeGreaterThanOrEqual(large ? 3 : 4.5);
  });

  it("QUA-014 : les couleurs de l'accueil sont déclarées une fois, dans les variables de home.css", () => {
    const outsideRoot = css.replace(/:root\s*\{[^}]*\}/, "");
    expect(outsideRoot).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i);
  });
});
