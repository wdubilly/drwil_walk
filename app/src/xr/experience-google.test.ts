import { type Scene } from "three";
import { describe, expect, it } from "vitest";
import { ACTIVE_STATUS } from "./experience.ts";
import { KEY, poseFrame, setup } from "./experience-double.ts";

describe("rendu Google 3D en marche", () => {
  it("garde le rendu OpenStreetMap par défaut, sans appeler Google", async () => {
    const t = setup();
    await t.enter();
    t.frame(0, poseFrame(0));
    expect(t.create).not.toHaveBeenCalled();
    expect(t.panel()?.getAttribute("data-rendering")).toBe("osm");
    expect(t.panel()?.getAttribute("data-tile-count")).toBe("0");
    expect(t.notice()).toBe("");
  });

  it("QUA-002: Google choisi sans clé, la marche se fait en OpenStreetMap et la raison est dite à l'écran", async () => {
    const t = setup({ apiKey: undefined });
    t.chooseGoogle();
    await t.enter();
    t.frame(0, poseFrame(0));
    expect(t.create).not.toHaveBeenCalled();
    expect(t.notice()).toContain("aucune clé");
    expect(t.status()).toBe(ACTIVE_STATUS);
    expect(t.panel()?.getAttribute("data-rendering")).toBe("osm");
  });

  it("APP-002: Google choisi avec une clé, les tuiles sont chargées à chaque image dans la ville", async () => {
    const t = setup();
    t.chooseGoogle();
    await t.enter();
    t.frame(0, poseFrame(0));
    expect(t.create).toHaveBeenCalledWith(expect.objectContaining({ apiKey: KEY }));
    expect(t.tiles.update).toHaveBeenCalledOnce();
    expect(t.panel()?.getAttribute("data-rendering")).toBe("google");
    expect(t.panel()?.getAttribute("data-tile-count")).toBe("3");
    expect(t.panel()?.querySelector(".attribution")?.textContent).toBe("© contributeurs OpenStreetMap · Google · Landsat");
    expect(t.notice()).toBe("");
  });

  it("APP-001: le fondu efface aussi les tuiles Google, et la scène n'a toujours ni ciel ni fond", async () => {
    const t = setup();
    t.chooseGoogle();
    await t.enter();
    t.frame(0, poseFrame(-32.5));
    const scene = t.fake.render.mock.calls[0]?.[0] as Scene;
    expect(scene.background).toBeNull();
    const material = t.tileMesh.material;
    expect(material.transparent).toBe(true);
    expect(material.opacity).toBeCloseTo(0.5);
    t.frame(10, poseFrame(-60));
    expect(material.opacity).toBe(0);
    expect(t.tiles.root.parent?.parent?.visible).toBe(false);
    expect(scene.background).toBeNull();
    t.frame(20, poseFrame(0));
    expect(material.opacity).toBe(1);
    expect(t.tiles.root.parent?.parent?.visible).toBe(true);
  });

  it("QUA-002: si les tuiles ne se chargent pas en marchant, retombe sur OpenStreetMap avec la raison", async () => {
    const t = setup();
    t.chooseGoogle();
    await t.enter();
    t.frame(0, poseFrame(0));
    t.fail("HTTP 403");
    t.frame(10, poseFrame(0));
    expect(t.notice()).toContain("HTTP 403");
    expect(t.notice()).toContain("OpenStreetMap");
    expect(t.panel()?.getAttribute("data-rendering")).toBe("osm");
    expect(t.status()).toBe(ACTIVE_STATUS);
  });

  it("libère les tuiles à la fin de la session, et efface l'ancien message à la marche suivante", async () => {
    const t = setup({ apiKey: undefined });
    t.chooseGoogle();
    await t.enter();
    expect(t.notice()).not.toBe("");
    t.listeners.end?.();
    t.root.querySelector<HTMLInputElement>("input[value='osm']")?.click();
    await t.enter();
    expect(t.notice()).toBe("");
    const withKey = setup();
    withKey.chooseGoogle();
    await withKey.enter();
    withKey.listeners.end?.();
    expect(withKey.tiles.dispose).toHaveBeenCalled();
  });
});
