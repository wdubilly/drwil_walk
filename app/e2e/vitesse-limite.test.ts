// e2e de la vitesse sans plafond (APP-002, QUA-002, QUA-020), dans Chromium avec un Meta Quest 3 émulé (IWER) :
// 50 km/h saisi à l'accueil est retenu tel quel, sans aucun message de limite, et la ville avance à cette vitesse.
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

test("chemin 11 : 50 km/h saisi, 50 km/h retenu, aucun maximum annoncé, la ville avance à cette vitesse", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("À partir de 1 km/h.")).toBeVisible();
  await page.getByLabel("Vitesse de départ (km/h)").fill("50");
  await expect(page.locator(".speed-limit")).toHaveText("");
  await page.getByRole("button", { name: "Entrer en réalité mixte" }).click();
  await expect(page.getByRole("status")).toHaveText("Réalité mixte active (immersive-ar)");
  const panel = page.getByRole("region", { name: "Marche" });
  await expect(panel.locator("[data-field='speed']")).toHaveText("50,0 km/h");
  await expect(panel).not.toContainText("Vitesse au maximum");
  await expect(panel).not.toContainText("limite de sécurité");
  await expect.poll(async () => Number(await panel.getAttribute("data-distance-m")), { timeout: 20_000 }).toBeGreaterThan(14);
});

test("chemin 11 : une saisie sous 1 km/h est ramenée à 1 km/h en le disant à l'accueil", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Vitesse de départ (km/h)").fill("0.5");
  await expect(page.getByText("0,5 km/h est sous la limite : 1,0 km/h retenus, minimum de 1 km/h.")).toBeVisible();
});
