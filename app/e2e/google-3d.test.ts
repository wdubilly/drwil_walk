// e2e du rendu Google 3D (QUA-020, chemin 9), dans Chromium avec un Meta Quest 3 émulé (IWER) : Google n'est JAMAIS appelé.
// Toute requête vers tile.googleapis.com est servie ici par un jeu de tuiles factice (un triangle dans un fichier glb) ;
// toute autre requête hors de la machine est refusée et fait échouer le test. La clé du serveur de test est fictive.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { expect, test, type Page, type Route } from "@playwright/test";

const iwerBuild = createRequire(import.meta.url).resolve("iwer/build/iwer.min.js");

interface E2eWindow {
  quest: { quaternion: { set(x: number, y: number, z: number, w: number): void } };
  IWER: { XRDevice: new (config: unknown) => E2eWindow["quest"] & { installRuntime(o: object): void }; metaQuest3: unknown };
}

/** Le départ de la boucle du souk : là où les tuiles factices sont posées. */
const loop = JSON.parse(readFileSync(new URL("../data/souq-waqif-boucle.json", import.meta.url), "utf8")) as {
  geometry: { coordinates: number[][] };
};
const [LON, LAT] = loop.geometry.coordinates[0] as [number, number];

/** Position terrestre (WGS84) du point de départ : le jeu de tuiles est en repère terrestre, comme celui de Google. */
function earthPosition(lonDeg: number, latDeg: number): number[] {
  const a = 6378137;
  const e2 = 0.00669437999014;
  const [lon, lat] = [(lonDeg * Math.PI) / 180, (latDeg * Math.PI) / 180];
  const n = a / Math.sqrt(1 - e2 * Math.sin(lat) ** 2);
  return [n * Math.cos(lat) * Math.cos(lon), n * Math.cos(lat) * Math.sin(lon), n * (1 - e2) * Math.sin(lat)];
}

function glb(): Buffer {
  const positions = Buffer.alloc(36);
  [-30, 0, -30, 30, 0, -30, 0, 0, 30].forEach((v, i) => positions.writeFloatLE(v, i * 4));
  const json = Buffer.from(
    JSON.stringify({
      asset: { version: "2.0" },
      scene: 0,
      scenes: [{ nodes: [0] }],
      nodes: [{ mesh: 0 }],
      meshes: [{ primitives: [{ attributes: { POSITION: 0 }, material: 0 }] }],
      materials: [{ pbrMetallicRoughness: { baseColorFactor: [0.6, 0.7, 0.8, 1] }, doubleSided: true }],
      accessors: [{ bufferView: 0, componentType: 5126, count: 3, type: "VEC3", min: [-30, 0, -30], max: [30, 0, 30] }],
      bufferViews: [{ buffer: 0, byteLength: 36 }],
      buffers: [{ byteLength: 36 }],
    }),
  );
  const padded = Buffer.concat([json, Buffer.alloc((4 - (json.length % 4)) % 4, 0x20)]);
  const chunk = (type: string, body: Buffer) => {
    const head = Buffer.alloc(8);
    head.writeUInt32LE(body.length, 0);
    head.write(type, 4, "latin1");
    return Buffer.concat([head, body]);
  };
  const body = Buffer.concat([chunk("JSON", padded), chunk("BIN\0", positions)]);
  const head = Buffer.alloc(12);
  head.write("glTF", 0, "latin1");
  head.writeUInt32LE(2, 4);
  head.writeUInt32LE(12 + body.length, 8);
  return Buffer.concat([head, body]);
}

const TILESET = {
  asset: { version: "1.0" },
  geometricError: 0,
  root: {
    transform: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, ...earthPosition(LON, LAT), 1],
    boundingVolume: { box: [0, 0, 0, 100, 0, 0, 0, 100, 0, 0, 0, 100] },
    geometricError: 0,
    refine: "REPLACE",
    content: { uri: "files/fake.glb?session=session-factice" },
  },
};

/** Sert le jeu factice, ou une panne (`status`) ; les hôtes inattendus sont comptés puis refusés. */
async function fakeGoogle(page: Page, status = 200): Promise<string[]> {
  const leaks: string[] = [];
  const cors = { "access-control-allow-origin": "*" };
  await page.route(/^https?:\/\/(?!localhost)/, async (route: Route) => {
    const url = new URL(route.request().url());
    if (url.host !== "tile.googleapis.com") {
      leaks.push(url.host);
      return route.abort();
    }
    if (status !== 200) return route.fulfill({ status, headers: cors, json: { error: "clé refusée" } });
    if (url.pathname.endsWith(".glb")) return route.fulfill({ headers: cors, body: glb(), contentType: "model/gltf-binary" });
    return route.fulfill({ headers: cors, json: TILESET });
  });
  return leaks;
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript({ path: iwerBuild });
  await page.addInitScript(() => {
    const w = window as unknown as E2eWindow & { navigator: Navigator & { xr: XRSystem } };
    const quest = new w.IWER.XRDevice(w.IWER.metaQuest3);
    quest.installRuntime({ forceInstall: true });
    w.quest = quest;
  });
});

const panel = (page: Page) => page.getByRole("region", { name: "Marche" });

async function walkWithGoogle(page: Page) {
  await page.goto("/");
  await page.getByRole("radio", { name: "Google 3D" }).check();
  await expect(page.locator(".attribution")).toHaveText("© contributeurs OpenStreetMap · Google");
  await page.getByRole("button", { name: "Entrer en réalité mixte" }).click();
  await expect(page.getByRole("status")).toHaveText("Réalité mixte active (immersive-ar)");
}

test("chemin 9 : le rendu Google 3D, tuiles factices alignées sur la boucle, fondu et mentions", async ({ page }) => {
  const leaks = await fakeGoogle(page);
  await walkWithGoogle(page);
  await expect(panel(page)).toHaveAttribute("data-rendering", "google");
  // Les tuiles du jeu factice sont choisies, chargées et affichées autour du départ de la boucle (APP-002).
  await expect.poll(async () => Number(await panel(page).getAttribute("data-tile-count")), { timeout: 30_000 }).toBeGreaterThan(0);
  await expect(page.getByRole("alert")).toHaveText("");
  // APP-003 : la mention de Google s'ajoute à celle d'OpenStreetMap, dans le panneau de marche.
  await expect(panel(page).locator(".attribution")).toContainText("© contributeurs OpenStreetMap · Google");
  // APP-001 : tête baissée, la ville (ici les tuiles Google) s'efface.
  await page.evaluate(() => {
    const a = (-45 * Math.PI) / 360;
    (window as unknown as E2eWindow).quest.quaternion.set(Math.sin(a), 0, 0, Math.cos(a));
  });
  await expect(panel(page).locator("[data-field='opacity']")).toHaveText("0 %");
  expect(leaks).toEqual([]);
});

test("chemin 9 : si les tuiles refusent la clé, la marche se fait en OpenStreetMap et la raison est dite", async ({ page }) => {
  const leaks = await fakeGoogle(page, 403);
  await walkWithGoogle(page);
  await expect(page.getByRole("alert")).toContainText("Rendu Google 3D indisponible");
  await expect(page.getByRole("alert")).toContainText("Rendu OpenStreetMap affiché");
  await expect(panel(page)).toHaveAttribute("data-rendering", "osm");
  await expect(panel(page).locator(".attribution")).toHaveText("© contributeurs OpenStreetMap");
  expect(Number(await panel(page).getAttribute("data-building-count"))).toBeGreaterThan(100);
  expect(leaks).toEqual([]);
});
