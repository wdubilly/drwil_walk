import { Group, type Object3D } from "three";
import { describe, expect, it } from "vitest";
import { testPack } from "../city/tree-pack-double.ts";
import { poseFrame, setup } from "./experience-double.ts";
import { treeFallbackNotice } from "./trees-load.ts";

/** La scène rendue par la doublure du renderer à la dernière image. */
function renderedScene(t: ReturnType<typeof setup>): Object3D {
  return (t.fake.render.mock.lastCall as [Object3D])[0];
}

describe("arbres du pack dans la marche", () => {
  it("APP-003: avec le pack chargé, la marche dessine les arbres du pack et ne dit rien", async () => {
    const t = setup({ trees: () => testPack() });
    await t.enter();
    t.frame(0, poseFrame(0));
    const trees = renderedScene(t).getObjectByName("arbres");
    expect(trees).toBeInstanceOf(Group);
    expect(trees?.children.length).toBeGreaterThan(0);
    expect(t.notice()).toBe("");
  });

  it("QUA-002: un pack qui ne se charge pas est dit à l'écran et la marche continue avec l'arbre procédural", async () => {
    const t = setup({ trees: () => Promise.reject(new Error("texture illisible")) });
    await t.enter();
    t.frame(0, poseFrame(0));
    expect(t.notice()).toBe(treeFallbackNotice("texture illisible"));
    expect(renderedScene(t).getObjectByName("arbres")).not.toBeInstanceOf(Group);
    expect(renderedScene(t).getObjectByName("arbres")).toBeDefined();
    expect(t.fake.render).toHaveBeenCalledTimes(1);
  });

  it("QUA-002: le refus des tuiles Google s'ajoute au message des arbres au lieu de l'effacer", async () => {
    const t = setup({ trees: () => Promise.reject(new Error("texture illisible")) });
    t.chooseGoogle();
    await t.enter();
    t.fail("clé refusée");
    expect(t.notice()).toContain(treeFallbackNotice("texture illisible"));
    expect(t.notice()).toContain("clé refusée");
  });

  it("sans chargeur, la marche garde l'arbre procédural sans rien dire", async () => {
    const t = setup();
    await t.enter();
    t.frame(0, poseFrame(0));
    expect(renderedScene(t).getObjectByName("arbres")).not.toBeInstanceOf(Group);
    expect(t.notice()).toBe("");
  });
});
