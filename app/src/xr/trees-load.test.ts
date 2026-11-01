import { describe, expect, it, vi } from "vitest";
import { rejectWith } from "../route/reject-double.ts";
import { testPack } from "../city/tree-pack-double.ts";
import { preloadTrees, treeFallbackNotice, withTreeNotice } from "./trees-load.ts";

describe("chargement des arbres du pack au démarrage", () => {
  it("APP-003: sans chargeur, rien n'est chargé et rien n'est dit", async () => {
    expect(await preloadTrees(undefined)).toEqual({ notice: "" });
  });

  it("APP-003: un pack chargé est rendu tel quel, sans message", async () => {
    const pack = await testPack();
    expect(await preloadTrees(() => Promise.resolve(pack))).toEqual({ pack, notice: "" });
  });

  it("QUA-002: un échec ne rejette pas : la raison est dite et il n'y a pas de pack", async () => {
    const loaded = await preloadTrees(() => Promise.reject(new Error("texture illisible")));
    expect(loaded.pack).toBeUndefined();
    expect(loaded.notice).toBe(treeFallbackNotice("texture illisible"));
    expect(loaded.notice).toContain("arbres simples à la place");
    expect((await preloadTrees(() => Promise.resolve(rejectWith("refusé")))).notice).toBe(treeFallbackNotice("refusé"));
  });

  it("QUA-002: le message des arbres reste devant celui qu'on y ajoute (rendu Google refusé)", () => {
    const show = vi.fn();
    withTreeNotice({ notice: "arbres" }, show)("google");
    withTreeNotice({ notice: "" }, show)("google");
    withTreeNotice({ notice: "arbres" }, show)("");
    expect(show.mock.calls.map((c) => c[0] as string)).toEqual(["arbres google", "google", "arbres"]);
  });
});
