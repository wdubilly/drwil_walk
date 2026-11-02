import { describe, expect, it } from "vitest";
import { actionOf, type KeyLike } from "./keys.ts";

const key = (name: string, init: Partial<KeyLike> = {}): KeyLike => ({ key: name, repeat: false, ctrlKey: false, altKey: false, metaKey: false, ...init });

describe("touches de la version PC", () => {
  it("APP-002: chaque commande a sa touche, majuscule ou minuscule", () => {
    expect(["p", " ", "ArrowUp", "+", "ArrowDown", "-", "PageUp", "PageDown", "r", "R", "h", "d", "D", "Escape"].map((k) => actionOf(key(k)))).toEqual([
      "pause", "pause", "faster", "faster", "slower", "slower", "muchFaster", "muchSlower", "recalibrate", "recalibrate", "panel", "diagnostics", "diagnostics", "quit",
    ]);
  });

  it("APP-002: une touche tenue, un raccourci du navigateur ou une touche inconnue ne déclenchent rien", () => {
    expect([key(" ", { repeat: true }), key("r", { ctrlKey: true }), key("r", { altKey: true }), key("r", { metaKey: true }), key("x"), key("Tab")].map(actionOf)).toEqual([null, null, null, null, null, null]);
  });
});
