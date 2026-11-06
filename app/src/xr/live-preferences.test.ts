import { Window } from "happy-dom";
import { describe, expect, it, vi } from "vitest";
import type { createLiveCity } from "../city/live-city.ts";
import { renderHome } from "../ui/home.ts";
import type { Ambience } from "./ambience.ts";
import type { RendererLike } from "./experience.ts";
import { bindLivePreferences } from "./live-preferences.ts";

describe("chargement et arrêt des préférences à chaud", () => {
  it("APP-006: sans ratio de pixels détectable le PC garde le repli ; un chargement fini après l'arrêt n'applique rien", async () => {
    const doc = new Window().document as unknown as Document;
    const root = doc.createElement("main");
    const home = renderHome(doc, root);
    Object.defineProperty(doc, "defaultView", { value: null });
    let resolve!: () => void;
    const apply = vi.fn();
    const city = { apply, trafficReady: new Promise<void>((r) => { resolve = r; }) } as unknown as ReturnType<typeof createLiveCity>;
    const ambience = { update: vi.fn(), daylight: { night: false }, summary: "jour", lanterns: "éteintes" } as unknown as Ambience;
    const renderer = { setPixelRatio: vi.fn() } as unknown as RendererLike;
    const stop = bindLivePreferences(home, city, ambience, renderer, true);
    expect(renderer.setPixelRatio).toHaveBeenCalledWith(1);
    expect(apply).toHaveBeenCalledTimes(1);
    stop();
    resolve();
    await city.trafficReady;
    home.preferences.change({ ...home.preferences.read(), profile: "qualite" });
    expect(apply).toHaveBeenCalledTimes(1);
  });
});
