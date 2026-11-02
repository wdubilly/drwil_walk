// e2e du diagnostic de rendu (QUA-020, APP-002, SEC-007) : masqué par défaut, affiché par la touche D en version PC (Chromium sans
// WebXR) et par le clic du joystick droit dans le Quest 3 émulé (IWER) ; le fichier JSON consigné est lu et validé, sans appel réseau.
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { expect, test, type Page } from "@playwright/test";

const iwerBuild = createRequire(import.meta.url).resolve("iwer/build/iwer.min.js");

interface Quest {
  installRuntime(o: object): void;
  controllers: { right?: { updateButtonValue(id: string, value: number): void } };
}

/** Un appui complet sur le clic du joystick droit : l'émulateur n'applique une valeur qu'à l'image suivante. */
async function pressStick(page: Page) {
  const set = (value: number) => page.evaluate((v) => (window as unknown as { quest: Quest }).quest.controllers.right?.updateButtonValue("thumbstick", v), value);
  await set(1);
  await page.waitForTimeout(250);
  await set(0);
  await page.waitForTimeout(250);
}

const panel = (page: Page) => page.getByRole("region", { name: "Marche" });
const diagnostics = (page: Page) => page.getByRole("region", { name: "Diagnostic de rendu" });
const values = (page: Page) => diagnostics(page).locator("dd");

/** Les valeurs sont lues sur la page, la mémoire graphique pouvant rester « indisponible » mais jamais inventée. */
async function expectMeasures(page: Page) {
  await expect(diagnostics(page).locator("[data-field='fps']")).toHaveText(/^\d+(,\d)? i\/s$/);
  await expect(diagnostics(page).locator("[data-field='calls']")).toHaveText(/^\d+$/);
  await expect(diagnostics(page).locator("[data-field='triangles']")).toHaveText(/^\d+$/);
  await expect(values(page)).toHaveCount(8);
}

/** Enregistre les mesures, lit le fichier et le valide ; l'unique requête permise est celle de la page servie. */
async function saveAndRead(page: Page, target: "pc" | "casque") {
  const download = page.waitForEvent("download");
  // Dans l'émulateur, le canvas recouvre la page : le clic est envoyé au bouton sans passer par la souris.
  await diagnostics(page).getByRole("button", { name: "Enregistrer les mesures" }).dispatchEvent("click");
  const file = await download;
  expect(file.suggestedFilename()).toMatch(new RegExp(`^mesures-rendu-${target}-.+\\.json$`));
  const report = JSON.parse(await readFile(await file.path(), "utf8")) as Record<string, unknown>;
  expect(report).toMatchObject({ schema: 1, target, city: "Doha Souq Waqif" });
  expect(new Date(String(report.date)).getTime()).not.toBeNaN();
  expect(typeof report.version).toBe("string");
  expect(report.window).toMatchObject({ frames: expect.any(Number) });
  expect(Object.keys(report.measures as object)).toEqual(
    expect.arrayContaining(["fps", "frameMeanMs", "frameWorstMs", "calls", "triangles", "objects", "geometries", "textures"]),
  );
  await expect(diagnostics(page).getByText(/^Mesures enregistrées : mesures-rendu-/)).toBeVisible();
}

function watchNetwork(page: Page) {
  const foreign: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (!["localhost", "127.0.0.1"].includes(url.hostname) && !["data:", "blob:"].includes(url.protocol)) foreign.push(request.url());
  });
  return foreign;
}

test("chemin 21 : en version PC, le diagnostic est masqué, la touche D l'affiche et le masque, le fichier consigné est valide", async ({ page }) => {
  const foreign = watchNetwork(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Version PC" }).click();
  await expect(page.getByRole("status")).toHaveText("Version PC active : marche dans la page, sans casque.");
  await expect(diagnostics(page).getByRole("button", { name: "Diagnostic de rendu" })).toHaveAttribute("aria-pressed", "false");
  await expect(diagnostics(page).locator("dl")).toBeHidden();

  // La marche n'est pas touchée : la vitesse réglée reste, la distance avance.
  const speed = await panel(page).getAttribute("data-speed-kmh");
  await page.keyboard.press("d");
  await expect(diagnostics(page).locator("dl")).toBeVisible();
  await expectMeasures(page);
  await expect(panel(page)).toHaveAttribute("data-speed-kmh", speed ?? "");
  await saveAndRead(page, "pc");

  await page.keyboard.press("d");
  await expect(diagnostics(page).locator("dl")).toBeHidden();
  expect(foreign).toEqual([]);
});

test("chemin 21 : dans le Quest 3 émulé, le clic du joystick droit affiche et masque le diagnostic, le fichier consigné est valide", async ({ page }) => {
  await page.addInitScript({ path: iwerBuild });
  await page.addInitScript(() => {
    const w = window as unknown as { quest: Quest; IWER: { XRDevice: new (c: unknown) => Quest; metaQuest3: unknown } };
    w.quest = new w.IWER.XRDevice(w.IWER.metaQuest3);
    w.quest.installRuntime({ forceInstall: true });
  });
  const foreign = watchNetwork(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Entrer en réalité mixte" }).click();
  await expect(page.getByRole("status")).toHaveText("Réalité mixte active (immersive-ar)");
  const toggle = diagnostics(page).getByRole("button", { name: "Diagnostic de rendu" });
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await expect(diagnostics(page).locator("dl")).toBeHidden();

  await pressStick(page);
  await expect(diagnostics(page).locator("dl")).toBeVisible();
  await expectMeasures(page);
  await saveAndRead(page, "casque");

  await pressStick(page);
  await expect(diagnostics(page).locator("dl")).toBeHidden();
  expect(foreign).toEqual([]);
});
