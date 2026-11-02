// e2e de la minicarte du casque (QUA-020, APP-001, APP-002), dans Chromium avec un Meta Quest 3 émulé (IWER) : chemin 18,
// le point de la minicarte avance le long du parcours figé avec la marche, sans erreur ni requête hors de la page servie
// (le tracé seul, aucun fond de tuiles). La minicarte est dans la scène : sa case est lue sur l'attribut `data-minimap` de #app.
import { createRequire } from "node:module";
import { expect, test } from "@playwright/test";

const iwerBuild = createRequire(import.meta.url).resolve("iwer/build/iwer.min.js");

test.beforeEach(async ({ page }) => {
  await page.addInitScript({ path: iwerBuild });
  await page.addInitScript(() => {
    const w = window as unknown as { IWER: { XRDevice: new (c: unknown) => { installRuntime(o: object): void }; metaQuest3: unknown } };
    new w.IWER.XRDevice(w.IWER.metaQuest3).installRuntime({ forceInstall: true });
  });
});

test("chemin 18 : le point de la minicarte avance avec la marche sur l'itinéraire figé, sans réseau", async ({ page }) => {
  const errors: string[] = [];
  const outside: string[] = [];
  page.on("pageerror", (e) => {
    errors.push(e.message);
  });
  page.on("request", (r) => {
    if (!/^(https?:\/\/localhost:|data:|blob:)/.test(r.url())) outside.push(r.url());
  });
  await page.goto("/");
  await page.getByLabel("Vitesse de départ (km/h)").fill("7");
  await page.getByRole("button", { name: "Entrer en réalité mixte" }).click();
  await expect(page.getByRole("status")).toHaveText("Réalité mixte active (immersive-ar)");
  await expect(page.locator("#app")).toHaveAttribute("data-minimap", /^\d+,\d+$/);
  const first = await page.locator("#app").getAttribute("data-minimap");
  await expect(page.locator("#app")).not.toHaveAttribute("data-minimap", first ?? "", { timeout: 20_000 });
  expect(errors).toEqual([]);
  expect(outside).toEqual([]);
});
