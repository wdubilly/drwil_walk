import type { Page } from "@playwright/test";
import { Quaternion, Vector3 } from "three";
import { afterEach, describe, expect, it, vi } from "vitest";
import { remembered } from "../../e2e/preferences-helper.ts";
import { installQuest, lookDown, questPreference, toggleQuestPreferences } from "../../e2e/quest-preferences-helper.ts";
import { DEFAULT_ZONE } from "../safety/zone.ts";
import { DEFAULT_PREFERENCES, PREFERENCES_KEY } from "../ui/preferences.ts";
import { panelPlacement } from "./pose.ts";

function setup() {
  const storage = new Map<string, string>();
  const localStorage = { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => void storage.set(key, value) };
  let visible = false;
  const controller = (left: boolean) => ({
    position: new Vector3(), quaternion: new Quaternion(),
    updateButtonValue: vi.fn((_button: string, value: number) => { if (left && value) visible = !visible; }),
  });
  const left = controller(true);
  const right = controller(false);
  const runtime = { position: new Vector3(0, 1.6, 0), quaternion: new Quaternion(), controllers: { left, right }, installRuntime: vi.fn() };
  const window = { quest: runtime, IWER: { metaQuest3: {}, XRDevice: function () { return runtime; } } };
  vi.stubGlobal("window", window);
  vi.stubGlobal("localStorage", localStorage);
  const scripts: unknown[] = [];
  const waits: number[] = [];
  const page = {
    addInitScript: (fn: unknown, arg: unknown) => {
      if (typeof fn === "function") (fn as (arg: unknown) => unknown)(arg);
      else scripts.push(fn);
      return Promise.resolve();
    },
    evaluate: (fn: (arg: unknown) => unknown, arg: unknown) => Promise.resolve(fn(arg)),
    locator: () => ({
      _apiName: "Locator",
      _expect: (_expression: string, options: { expectedText: { string: string }[] }) => Promise.resolve({
        matches: options.expectedText[0]?.string === String(visible), received: String(visible), log: [],
      }),
    }),
    waitForTimeout: (ms: number) => { waits.push(ms); return Promise.resolve(); },
  } as unknown as Page;
  return { page, runtime, storage, scripts, waits };
}
afterEach(() => { vi.unstubAllGlobals(); });

describe("gestes du helper e2e Quest", () => {
  it("installe le vrai fichier IWER et confirme le front gauche avant de relâcher", async () => {
    const t = setup();
    await installQuest(t.page);
    expect(t.scripts).toHaveLength(1);
    expect((t.scripts[0] as { path: string }).path).toMatch(/iwer\.min\.js$/);
    expect(t.runtime.installRuntime).toHaveBeenCalledWith({ forceInstall: true });
    await toggleQuestPreferences(t.page, true);
    await toggleQuestPreferences(t.page, false);
    expect(t.runtime.controllers.left.updateButtonValue.mock.calls).toEqual([["trigger", 1], ["trigger", 0], ["trigger", 1], ["trigger", 0]]);
    expect(t.waits).toEqual([400, 400]);
  });

  it("reprend les derniers choix puis pointe une vraie ligne des deux côtés, sans substitut DOM", async () => {
    const t = setup();
    await questPreference(t.page, 0, {});
    expect(t.runtime.controllers.right.updateButtonValue.mock.calls).toEqual([["squeeze", 1], ["squeeze", 0]]);
    for (const side of ["left", "right"] as const) {
      await remembered(t.page, { side, profile: "qualite" });
      expect(JSON.parse(t.storage.get(PREFERENCES_KEY) as string)).toEqual({ ...DEFAULT_PREFERENCES, side, profile: "qualite" });
      await questPreference(t.page, 6, { side, profile: "qualite" });
      const at = panelPlacement({ position: t.runtime.position, orientation: t.runtime.quaternion }, side, DEFAULT_ZONE);
      expect(at).toBeDefined();
      const target = new Vector3(at?.x, (at?.y ?? 0) + (0.5 - (56 + 6.5 * 30) / 320) * 0.25 * (at?.scale ?? 1), at?.z);
      const ray = new Vector3(0, 0, -1).applyQuaternion(t.runtime.controllers.right.quaternion);
      expect(ray.dot(target.sub(t.runtime.controllers.right.position).normalize())).toBeCloseTo(1);
    }
    await lookDown(t.page);
    expect(t.runtime.quaternion.x).toBeLessThan(0);
    expect(t.runtime.quaternion.length()).toBeCloseTo(1);
  });

  it("refuse de viser un panneau sans place hors d'une zone réglée trop large", async () => {
    const t = setup();
    await expect(questPreference(t.page, 0, {}, { ...DEFAULT_ZONE, width: 100, depth: 100, height: 100 })).rejects.toThrow("Panneau inaccessible");
    expect(t.runtime.controllers.right.updateButtonValue).not.toHaveBeenCalled();
  });
});
