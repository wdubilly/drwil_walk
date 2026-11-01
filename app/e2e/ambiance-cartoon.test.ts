// e2e de l'ambiance cartoon (QUA-020, APP-003), dans Chromium avec un Meta Quest 3 émulé (IWER) :
// la marche avec le matériau toon et les fenêtres compile ses shaders sans erreur WebGL, avec et sans contours des bâtiments.
import { createRequire } from "node:module";
import { expect, test, type Page } from "@playwright/test";

const iwerBuild = createRequire(import.meta.url).resolve("iwer/build/iwer.min.js");

interface E2eWindow {
  IWER: { XRDevice: new (config: unknown) => { installRuntime(o: object): void }; metaQuest3: unknown };
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript({ path: iwerBuild });
  await page.addInitScript(() => {
    const w = window as unknown as E2eWindow;
    new w.IWER.XRDevice(w.IWER.metaQuest3).installRuntime({ forceInstall: true });
  });
});

async function walkWith(page: Page, outlines: boolean): Promise<string[]> {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => {
    errors.push(e.message);
  });
  await page.goto("/");
  const box = page.getByLabel("Contours des bâtiments");
  await expect(box).not.toBeChecked();
  if (outlines) await box.check();
  await page.getByRole("button", { name: "Entrer en réalité mixte" }).click();
  await expect(page.getByRole("status")).toHaveText("Réalité mixte active (immersive-ar)");
  await page.waitForTimeout(500);
  return errors;
}

test("chemin 14 : la marche en rendu cartoon, sans contours (défaut), ne produit aucune erreur", async ({ page }) => {
  expect(await walkWith(page, false)).toEqual([]);
});

test("chemin 14 : la marche en rendu cartoon, avec les contours des bâtiments, ne produit aucune erreur", async ({ page }) => {
  expect(await walkWith(page, true)).toEqual([]);
});
