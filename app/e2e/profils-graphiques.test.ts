import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { expect, test } from "@playwright/test";
import { remembered } from "./preferences-helper.ts";

const CITY_COUNT = Object.keys(JSON.parse(readFileSync(new URL("../data/villes.json", import.meta.url), "utf8")) as object).length;
const iwerBuild = createRequire(import.meta.url).resolve("iwer/build/iwer.min.js");
interface QuestWindow {
  quest: { quaternion: { set(x: number, y: number, z: number, w: number): void } };
  IWER: { XRDevice: new (config: unknown) => QuestWindow["quest"] & { installRuntime(o: object): void }; metaQuest3: unknown };
}
test.beforeEach(async ({ page }) => {
  await page.addInitScript({ path: iwerBuild });
  await page.addInitScript(() => {
    const w = window as unknown as QuestWindow;
    const quest = new w.IWER.XRDevice(w.IWER.metaQuest3);
    quest.installRuntime({ forceInstall: true });
    w.quest = quest;
  });
});

for (const profile of ["performance", "equilibre", "qualite"] as const) {
  test(`QUA-020 APP-006 APP-001: dernier profil ${profile} repris, sans réseau et réel visible`, async ({ page }) => {
    await remembered(page, { profile });
    const errors: string[] = [];
    const foreign: string[] = [];
    page.on("pageerror", (e) => { errors.push(e.message); });
    page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
    page.on("request", (r) => { if (!/^(https:\/\/localhost:|data:|blob:)/.test(r.url())) foreign.push(r.url()); });
    await page.goto("/");
    await expect(page.locator("input")).toHaveCount(CITY_COUNT + 1);
    await page.getByRole("button", { name: "Entrer en réalité mixte" }).click();
    await expect(page.getByRole("status")).toHaveText("Réalité mixte active (immersive-ar)");
    await expect(page.locator("#app")).toHaveAttribute("data-profile", profile);
    const panel = page.getByRole("region", { name: "Marche" });
    await expect.poll(async () => Number(await panel.getAttribute("data-distance-m")), { timeout: 20_000 }).toBeGreaterThan(1);
    await page.evaluate(() => {
      (window as unknown as QuestWindow).quest.quaternion.set(Math.sin(-Math.PI / 8), 0, 0, Math.cos(-Math.PI / 8));
    });
    await expect(panel.locator("[data-field='opacity']")).toHaveText("0 %");
    expect({ errors, foreign }).toEqual({ errors: [], foreign: [] });
  });
}

test("QUA-020 APP-006: profil historique relu seul, ancien réglage ignoré, valeur inconnue dite", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("drwil_walk.profil-graphique", "ultra");
    localStorage.setItem("drwil_walk.cote-panneau", "left");
  });
  await page.goto("/");
  await expect(page.getByRole("alert")).toContainText("profil gardé est illisible");
  await page.getByRole("button", { name: "Entrer en réalité mixte" }).click();
  await expect(page.locator("#app")).toHaveAttribute("data-profile", "equilibre");
  await expect(page.locator("#app")).toHaveAttribute("data-panel-side", "right");
});
