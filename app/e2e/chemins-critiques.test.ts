// e2e des chemins critiques (QUA-020), dans Chromium avec un Meta Quest 3 émulé (IWER) :
// (1) accueil → réalité mixte immersive-ar ; (2) choix de l'itinéraire à l'accueil ; (3) marche à la vitesse réglée, joystick ±0,1 km/h ;
// (4) APP-001 : tête baissée au-delà de 25°, la ville devient transparente ; (5) le souk de Doha ; (6) la Vieille ville de Pune.
import { createRequire } from "node:module";
import { expect, test, type Page } from "@playwright/test";

const iwerBuild = createRequire(import.meta.url).resolve("iwer/build/iwer.min.js");

/** Ce que les tests pilotent du casque émulé et ce qu'ils relèvent de la session. */
interface EmulatedQuest {
  quaternion: { set(x: number, y: number, z: number, w: number): void };
  controllers: { right?: { updateAxes(id: string, x: number, y: number): void } };
}
interface E2eWindow {
  quest: EmulatedQuest;
  requestedModes: string[];
  blendMode?: string;
  IWER: { XRDevice: new (config: unknown) => EmulatedQuest & { installRuntime(o: object): void }; metaQuest3: unknown };
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript({ path: iwerBuild });
  await page.addInitScript(() => {
    const w = window as unknown as E2eWindow & { navigator: Navigator & { xr: XRSystem } };
    const quest = new w.IWER.XRDevice(w.IWER.metaQuest3);
    // forceInstall : Chromium expose déjà un navigator.xr sans casque, l'émulateur doit le remplacer.
    quest.installRuntime({ forceInstall: true });
    w.quest = quest;
    w.requestedModes = [];
    const xr = w.navigator.xr;
    const request = xr.requestSession.bind(xr);
    xr.requestSession = async (mode, init) => {
      w.requestedModes.push(mode);
      const session = await request(mode, init);
      w.blendMode = session.environmentBlendMode;
      return session;
    };
  });
});

const panel = (page: Page) => page.getByRole("region", { name: "Marche" });
const card = (page: Page, name: string) => page.locator("label.card", { hasText: name });
const field = (page: Page, name: string) => panel(page).locator(`[data-field='${name}']`);

async function enter(page: Page, speed = "4.0") {
  await page.goto("/");
  await page.getByLabel("Vitesse de départ (km/h)").fill(speed);
  await page.getByRole("button", { name: "Entrer en réalité mixte" }).click();
  await expect(page.getByRole("status")).toHaveText("Réalité mixte active (immersive-ar)");
}

/** Incline la tête du casque émulé de `deg` degrés autour de l'axe X (négatif : tête baissée). */
async function tiltHead(page: Page, deg: number) {
  await page.evaluate((d) => {
    const a = (d * Math.PI) / 360;
    (window as unknown as E2eWindow).quest.quaternion.set(Math.sin(a), 0, 0, Math.cos(a));
  }, deg);
}

async function pushRightStick(page: Page, y: number) {
  await page.evaluate((v) => {
    (window as unknown as E2eWindow).quest.controllers.right?.updateAxes("thumbstick", 0, v);
  }, y);
}

/** Laisse passer quelques images de la session : l'émulateur n'applique un axe qu'à l'image suivante. */
async function letFramesPass(page: Page) {
  const timeS = async () => Number(await panel(page).getAttribute("data-time-s"));
  const start = await timeS();
  await expect.poll(timeS).toBeGreaterThan(start + 0.1);
}

async function releaseRightStick(page: Page) {
  await pushRightStick(page, 0);
  await letFramesPass(page);
}

test("chemin 1 : de l'accueil à la réalité mixte, en session immersive-ar", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("list", { name: "Rappel de sécurité" })).toContainText("Clé de sécurité");
  await enter(page);
  const seen = await page.evaluate(() => {
    const w = window as unknown as E2eWindow;
    return { modes: w.requestedModes, blend: w.blendMode };
  });
  expect(seen.modes).toEqual(["immersive-ar"]);
  // alpha-blend : le passthrough du casque est visible là où la ville n'est pas rendue.
  expect(seen.blend).toBe("alpha-blend");
  await expect(panel(page)).toBeVisible();
});

// Captures de l'accueil, pour le demandeur qui n'a pas de casque : hors de la couche (dist/ est ignoré par Git),
// publiées en pièce jointe par la CI.
const CAPTURES = "../dist/e2e-captures";

test("chemin 2 : l'accueil propose quatre itinéraires, le choisi est celui qui démarre", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1100 });
  await page.goto("/");
  await expect(page.getByRole("radio")).toHaveCount(4);
  await expect(page.getByRole("radio", { name: /Doha Souq Waqif/ })).toBeChecked();
  await page.screenshot({ path: `${CAPTURES}/accueil-defaut.png`, fullPage: true });

  const soon = page.getByRole("radio", { name: /Pune FC Road/ });
  await expect(soon).toBeDisabled();
  await expect(card(page, "Pune FC Road")).toContainText("Bientôt");
  await card(page, "Pune FC Road").click({ force: true });
  await expect(page.getByRole("radio", { name: /Doha Souq Waqif/ })).toBeChecked();
  await card(page, "Pune FC Road").screenshot({ path: `${CAPTURES}/carte-bientot.png` });

  await card(page, "Doha Souq Waqif").click();
  await card(page, "Doha Souq Waqif").screenshot({ path: `${CAPTURES}/carte-choisie.png` });
  const box = await page.getByRole("button", { name: "Entrer en réalité mixte" }).boundingBox();
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(48);
  await enter(page);
  await expect(page.locator("#app")).toHaveAttribute("data-route", "doha-souq-waqif");
});

test("chemin 3 : la position avance à la vitesse réglée, le joystick change la vitesse de ±0,1 km/h", async ({
  page,
}) => {
  // 3,6 km/h = 1 m/s : la distance parcourue égale le temps de marche.
  await enter(page, "3.6");
  await expect(field(page, "speed")).toHaveText("3,6 km/h");
  await expect.poll(async () => Number(await panel(page).getAttribute("data-time-s"))).toBeGreaterThan(1.5);
  const walked = await panel(page).evaluate((el) => ({
    distance: Number(el.getAttribute("data-distance-m")),
    time: Number(el.getAttribute("data-time-s")),
  }));
  expect(walked.distance).toBeCloseTo(walked.time, 5);

  await pushRightStick(page, -1);
  await expect(field(page, "speed")).toHaveText("3,7 km/h");
  await releaseRightStick(page);
  await pushRightStick(page, 1);
  await expect(field(page, "speed")).toHaveText("3,6 km/h");
  await releaseRightStick(page);
  await pushRightStick(page, 1);
  await expect(field(page, "speed")).toHaveText("3,5 km/h");
});

test("chemin 4 : APP-001, tête baissée au-delà de 25°, la ville devient transparente", async ({ page }) => {
  await enter(page);
  await tiltHead(page, 0);
  await expect(field(page, "opacity")).toHaveText("100 %");
  await tiltHead(page, -20);
  await expect(field(page, "opacity")).toHaveText("100 %");
  await tiltHead(page, -32.5);
  await expect(field(page, "opacity")).toHaveText("50 %");
  await tiltHead(page, -45);
  await expect(field(page, "opacity")).toHaveText("0 %");
  await tiltHead(page, 0);
  await expect(field(page, "opacity")).toHaveText("100 %");
});

test("chemin 5 : le souk de Doha, ses bâtiments OpenStreetMap et sa mention, le long du parcours", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("© contributeurs OpenStreetMap")).toBeVisible();
  // 7,2 km/h = 2 m/s : quelques secondes suffisent à quitter le départ de la boucle.
  await enter(page, "7.2");
  await expect(panel(page).getByText("© contributeurs OpenStreetMap")).toBeVisible();
  expect(Number(await panel(page).getAttribute("data-building-count"))).toBeGreaterThan(100);
  await expect.poll(async () => Number(await panel(page).getAttribute("data-distance-m"))).toBeGreaterThan(8);
  const walked = await panel(page).evaluate((el) => ({
    distance: Number(el.getAttribute("data-distance-m")),
    crow: Math.hypot(Number(el.getAttribute("data-position-x")), Number(el.getAttribute("data-position-z"))),
  }));
  // On suit des ruelles : à vol d'oiseau on est plus près du départ que la distance marchée, mais on a bougé.
  expect(walked.crow).toBeGreaterThan(1);
  expect(walked.crow).toBeLessThanOrEqual(walked.distance + 1e-6);
  // APP-001 dans le souk : tête baissée, la ville s'efface.
  await tiltHead(page, -45);
  await expect(field(page, "opacity")).toHaveText("0 %");
});

test("chemin 6 : la Vieille ville de Pune, ses bâtiments OpenStreetMap et sa mention, le long de la boucle", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1100 });
  await page.goto("/");
  await expect(page.getByRole("radio", { name: /Pune Vieille ville/ })).toBeEnabled();
  await card(page, "Pune Vieille ville").click();
  await page.screenshot({ path: `${CAPTURES}/pune-accueil.png`, fullPage: true });
  await page.getByLabel("Vitesse de départ (km/h)").fill("7.2");
  await page.getByRole("button", { name: "Entrer en réalité mixte" }).click();
  await expect(page.getByRole("status")).toHaveText("Réalité mixte active (immersive-ar)");
  await expect(page.locator("#app")).toHaveAttribute("data-route", "pune-vieille-ville");
  await expect(panel(page).getByText("© contributeurs OpenStreetMap")).toBeVisible();
  expect(Number(await panel(page).getAttribute("data-building-count"))).toBeGreaterThan(1000);
  await expect.poll(async () => Number(await panel(page).getAttribute("data-distance-m"))).toBeGreaterThan(8);
  const walked = await panel(page).evaluate((el) => ({
    distance: Number(el.getAttribute("data-distance-m")),
    crow: Math.hypot(Number(el.getAttribute("data-position-x")), Number(el.getAttribute("data-position-z"))),
  }));
  expect(walked.crow).toBeGreaterThan(1);
  expect(walked.crow).toBeLessThanOrEqual(walked.distance + 1e-6);
  await page.screenshot({ path: `${CAPTURES}/pune-marche.png` });
  // APP-001 dans la Vieille ville : tête baissée, la ville s'efface.
  await tiltHead(page, -45);
  await expect(field(page, "opacity")).toHaveText("0 %");
  await page.screenshot({ path: `${CAPTURES}/pune-tete-baissee.png` });
});
