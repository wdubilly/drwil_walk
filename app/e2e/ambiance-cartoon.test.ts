// e2e de l'ambiance cartoon (QUA-020, APP-003), dans Chromium avec un Meta Quest 3 émulé (IWER) :
// la marche avec le matériau toon, les fenêtres et les arbres du pack Quaternius compile ses shaders sans erreur WebGL,
// avec et sans contours des bâtiments ; les arbres du pack n'appellent aucun réseau, et un modèle d'arbres abîmé est dit à
// l'écran sans arrêter la marche (QUA-002).
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

interface Walk {
  errors: string[];
  /** Les requêtes qui sortent de la page servie par Vite (adresses autres que localhost, hors data:). */
  foreign: string[];
}

async function walkWith(page: Page, outlines: boolean): Promise<Walk> {
  const errors: string[] = [];
  const foreign: string[] = [];
  page.on("request", (r) => {
    if (!/^(https:\/\/localhost:|data:|blob:)/.test(r.url())) foreign.push(r.url());
  });
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
  return { errors, foreign };
}

test("chemin 14 : la marche en rendu cartoon, sans contours (défaut), avec les arbres du pack, sans erreur ni appel réseau", async ({ page }) => {
  const walk = await walkWith(page, false);
  expect(walk).toEqual({ errors: [], foreign: [] });
  await expect(page.getByRole("alert")).toHaveText("");
});

test("chemin 14 : la marche en rendu cartoon, avec les contours des bâtiments et les arbres du pack, sans erreur ni appel réseau", async ({ page }) => {
  const walk = await walkWith(page, true);
  expect(walk).toEqual({ errors: [], foreign: [] });
  await expect(page.getByRole("alert")).toHaveText("");
});

test("chemin 14 : un modèle d'arbres abîmé est dit à l'écran et la marche continue avec l'arbre simple", async ({ page }) => {
  await page.route("**/quaternius-trees.json*", (route) =>
    route.fulfill({ contentType: "text/javascript", body: 'export default { leafTexture: "data:image/png;base64,AA==", models: [] };' }),
  );
  const walk = await walkWith(page, false);
  await expect(page.getByRole("alert")).toContainText("Arbres stylisés indisponibles");
  await expect(page.getByRole("alert")).toContainText("arbres simples à la place");
  await expect(page.getByRole("status")).toHaveText("Réalité mixte active (immersive-ar)");
  expect(walk.errors.filter((e) => !e.includes("Failed to load resource"))).toEqual([]);
});
