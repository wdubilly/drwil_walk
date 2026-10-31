// e2e de la limite de vitesse (QUA-002, QUA-020), dans Chromium avec un Meta Quest 3 émulé (IWER) :
// 50 km/h saisi à l'accueil, 8 km/h retenu, la limite et sa raison sont dites à l'accueil puis dans le panneau.
import { createRequire } from "node:module";
import { expect, test } from "@playwright/test";

const iwerBuild = createRequire(import.meta.url).resolve("iwer/build/iwer.min.js");

test.beforeEach(async ({ page }) => {
  await page.addInitScript({ path: iwerBuild });
  await page.addInitScript(() => {
    const w = window as unknown as {
      IWER: { XRDevice: new (config: unknown) => { installRuntime(o: object): void }; metaQuest3: unknown };
    };
    new w.IWER.XRDevice(w.IWER.metaQuest3).installRuntime({ forceInstall: true });
  });
});

test("chemin 11 : 50 km/h saisi, 8 km/h retenu, la limite est annoncée à l'accueil et dans le panneau", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("De 1 à 8 km/h, par sécurité sur le tapis.")).toBeVisible();
  await page.getByLabel("Vitesse de départ (km/h)").fill("50");
  await expect(page.getByText("50 km/h dépasse la limite : 8,0 km/h retenus, par sécurité sur le tapis.")).toBeVisible();
  await page.getByRole("button", { name: "Entrer en réalité mixte" }).click();
  await expect(page.getByRole("status")).toHaveText("Réalité mixte active (immersive-ar)");
  const panel = page.getByRole("region", { name: "Marche" });
  await expect(panel.locator("[data-field='speed']")).toHaveText("8,0 km/h");
  await expect(panel.getByText("Vitesse au maximum : 8 km/h, limite de sécurité sur le tapis.")).toBeVisible();
});
