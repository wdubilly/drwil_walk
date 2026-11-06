import { createRequire } from "node:module";
import { expect, type Page } from "@playwright/test";
import { Quaternion, Vector3 } from "three";
import { panelPlacement, PANEL_HEIGHT_M } from "../src/xr/pose.ts";
import { DEFAULT_ZONE, type Zone } from "../src/safety/zone.ts";
import type { Preferences } from "../src/ui/preferences.ts";

interface Controller {
  position: { set(x: number, y: number, z: number): void };
  quaternion: { set(x: number, y: number, z: number, w: number): void };
  updateButtonValue(id: string, value: number): void;
}
interface Quest {
  position: { x: number; y: number; z: number };
  quaternion: { x: number; y: number; z: number; w: number; set(x: number, y: number, z: number, w: number): void };
  controllers: { left: Controller; right: Controller };
  installRuntime(o: object): void;
}
interface QuestWindow {
  quest: Quest;
  IWER: { XRDevice: new (config: unknown) => Quest; metaQuest3: unknown };
}

export async function installQuest(page: Page): Promise<void> {
  await page.addInitScript({ path: createRequire(import.meta.url).resolve("iwer/build/iwer.min.js") });
  await page.addInitScript(() => {
    const w = window as unknown as QuestWindow;
    w.quest = new w.IWER.XRDevice(w.IWER.metaQuest3);
    w.quest.installRuntime({ forceInstall: true });
  });
}

export async function toggleQuestPreferences(page: Page, visible: boolean): Promise<void> {
  await page.evaluate(() => { (window as unknown as QuestWindow).quest.controllers.left.updateButtonValue("trigger", 1); });
  await expect(page.locator("#app")).toHaveAttribute("data-preferences-visible", String(visible));
  await page.evaluate(() => { (window as unknown as QuestWindow).quest.controllers.left.updateButtonValue("trigger", 0); });
  await page.waitForTimeout(400);
}

export async function questPreference(page: Page, row: number, expected: Partial<Preferences>, zone: Zone = DEFAULT_ZONE): Promise<void> {
  const state = await page.evaluate(() => {
    const q = (window as unknown as QuestWindow).quest;
    const prefs = JSON.parse(localStorage.getItem("drwil_walk.preferences-v1") ?? '{"side":"right"}') as Preferences;
    return { head: { position: { x: q.position.x, y: q.position.y, z: q.position.z }, orientation: { x: q.quaternion.x, y: q.quaternion.y, z: q.quaternion.z, w: q.quaternion.w } }, side: prefs.side };
  });
  const at = panelPlacement(state.head, state.side, zone);
  if (!at) throw new Error("Panneau inaccessible");
  const rowY = (0.5 - (56 + (row + 0.5) * 30) / 320) * PANEL_HEIGHT_M * at.scale;
  const origin = new Vector3(0, 1.2, 0);
  const direction = new Vector3(at.x, at.y + rowY, at.z).sub(origin).normalize();
  const q = new Quaternion().setFromUnitVectors(new Vector3(0, 0, -1), direction);
  await page.evaluate(({ x, y, z, w }) => {
    const right = (window as unknown as QuestWindow).quest.controllers.right;
    right.position.set(0, 1.2, 0);
    right.quaternion.set(x, y, z, w);
    right.updateButtonValue("squeeze", 1);
  }, { x: q.x, y: q.y, z: q.z, w: q.w });
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("drwil_walk.preferences-v1") ?? "{}") as unknown), { timeout: 20_000 }).toMatchObject(expected);
  await page.evaluate(() => { (window as unknown as QuestWindow).quest.controllers.right.updateButtonValue("squeeze", 0); });
  await page.waitForTimeout(400);
}

export async function lookDown(page: Page): Promise<void> {
  await page.evaluate(() => { (window as unknown as QuestWindow).quest.quaternion.set(Math.sin(-Math.PI / 8), 0, 0, Math.cos(-Math.PI / 8)); });
}
