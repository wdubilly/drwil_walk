import { settingsOf, appliedPixelRatio } from "../render/profiles.ts";
import type { HomeView } from "../ui/home.ts";
import type { createLiveCity } from "../city/live-city.ts";
import type { RendererLike } from "./experience.ts";
import type { Ambience } from "./ambience.ts";

export function bindLivePreferences(home: HomeView, city: ReturnType<typeof createLiveCity>, ambience: Ambience, renderer: RendererLike, pc: boolean): () => void {
  const apply = (): void => {
    const prefs = home.preferences.read();
    const settings = settingsOf(prefs.profile);
    ambience.update(settings.fog && prefs.fog, prefs.soundPct);
    city.apply(prefs, ambience.daylight.night);
    if (pc) renderer.setPixelRatio(appliedPixelRatio(settings, home.root.ownerDocument.defaultView?.devicePixelRatio ?? 1));
    else renderer.xr.setFoveation(prefs.profile === "performance" ? 1 : prefs.profile === "equilibre" ? 0.5 : 0);
    home.root.dataset["profile"] = prefs.profile;
    home.root.dataset["panelSide"] = prefs.side;
    home.root.style.setProperty("--walk-panel-alpha", String(prefs.panelOpacityPct / 100));
    home.root.dataset["ambiance"] = ambience.summary;
    home.root.dataset["lanternes"] = prefs.lamps ? ambience.lanterns : "absentes";
  };
  apply();
  let active = true;
  void city.trafficReady.then(() => { if (active) apply(); });
  const unsubscribe = home.preferences.subscribe(apply);
  return () => { active = false; unsubscribe(); };
}
