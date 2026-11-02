// La version PC (APP-002) : la même marche que dans le casque (même ville, même parcours, même vitesse, mêmes calculs),
// dans un canvas de la page, sans session WebXR. Elle n'applique ni le fondu tête baissée, ni la zone tapis, ni la vignette :
// sans passthrough ni tapis, il n'y a pas de réel à protéger (APP-001 ne concerne que la réalité mixte).
import { Color } from "three";
import { createSouqScene, placeOnRoute, setCityOpacity } from "../city/souq.ts";
import type { Souq } from "../city/souq-data.ts";
import { pointAt } from "../route/path.ts";
import { DEFAULT_WEIGHT_KG } from "../route/stats.ts";
import { stepSpeedKmh } from "../route/speed.ts";
import { OSM_ATTRIBUTION } from "../city/licence.ts";
import { renderWalkPanel } from "../ui/panel.ts";
import type { HomeView } from "../ui/home.ts";
import { BUTTONS_RELEASED } from "../xr/buttons.ts";
import { chosenCity } from "../xr/city-choice.ts";
import { placeOf, walkDashboard } from "../xr/dashboard.ts";
import type { ExperienceDeps } from "../xr/experience.ts";
import { createDiagnosticsUi } from "../xr/diagnostics-report.ts";
import { initialWalkState, nextWalkState } from "../xr/frame.ts";
import { NO_CALIBRATION, calibrationFrom } from "../xr/pose.ts";
import { type TreeLoad, withTreeNotice } from "../xr/trees-load.ts";
import { createPcInput } from "./input.ts";
import { EYE_HEIGHT_M, lookOrientation } from "./look.ts";

export const PC_ACTIVE_STATUS = "Version PC active : marche dans la page, sans casque.";
export const PC_ENDED_STATUS = "Version PC arrêtée : vous pouvez y revenir.";
export const PC_GOOGLE_NOTICE = "Rendu Google 3D indisponible en version PC. Rendu OpenStreetMap affiché.";
const SKY = 0xbfd9ef;

/** Lance la marche dans la page ; l'échec se lit sur l'accueil et les deux boutons redeviennent utilisables (QUA-002). */
export async function enterPc(deps: ExperienceDeps, home: HomeView, trees: Promise<TreeLoad>): Promise<void> {
  home.setEntering(true);
  home.showStatus("Ouverture de la version PC…");
  try {
    walkPc(deps, home, chosenCity(home), await trees);
  } catch (error) {
    home.setEntering(false);
    home.showStatus(error instanceof Error ? error.message : String(error));
  }
}

function walkPc(deps: ExperienceDeps, home: HomeView, souq: Souq, trees: TreeLoad): void {
  const souqScene = createSouqScene(deps.document, souq, { outlines: home.readOutlines(), ...(trees.pack && { trees: trees.pack }) });
  const { scene, camera, world, city, buildingCount } = souqScene;
  scene.background = new Color(SKY);
  home.showNotice(trees.notice);
  if (home.readRendering() === "google") withTreeNotice(trees, home.showNotice)(PC_GOOGLE_NOTICE);
  const win = deps.document.defaultView as Window;
  const renderer = new deps.Renderer({ antialias: true, alpha: false });
  const resize = (): void => {
    renderer.setSize(win.innerWidth, win.innerHeight);
    camera.aspect = win.innerWidth / win.innerHeight;
    camera.updateProjectionMatrix();
  };
  resize();
  win.addEventListener("resize", resize);
  renderer.domElement.className = "pc-canvas";
  deps.root.append(renderer.domElement);
  const place = placeOf(home.readRouteId());
  const now = deps.now ?? (() => new Date());
  const diagnostics = createDiagnosticsUi({ doc: deps.document, target: "pc", city: place, now, renderer, scene });
  const panel = renderWalkPanel(deps.document, deps.root, true, diagnostics.element);
  const input = createPcInput(deps.document, renderer.domElement);
  const weightKg = home.readWeightKg() ?? DEFAULT_WEIGHT_KG;
  let calibration = NO_CALIBRATION;
  // Opacité pleine : aucun fondu à appliquer sans réel à montrer.
  let state = initialWalkState(home.readSpeedKmh(), 100);
  camera.position.set(0, EYE_HEIGHT_M, 0);
  const stop = (): void => {
    renderer.setAnimationLoop(null);
    win.removeEventListener("resize", resize);
    input.dispose();
    renderer.domElement.remove();
    renderer.dispose();
    panel.remove();
    home.setEntering(false);
    home.showStatus(PC_ENDED_STATUS);
  };
  renderer.setAnimationLoop((timeMs: number) => {
    const taken = input.take();
    if (taken.diagnostics) diagnostics.toggle();
    if (taken.quit) {
      stop();
      return;
    }
    // Chaque appui compte : les boutons de l'image précédente sont toujours relâchés.
    state = nextWalkState(
      { ...state, speedKmh: stepSpeedKmh(state.speedKmh, taken.steps), buttons: BUTTONS_RELEASED },
      { timeMs, axisY: 0, buttons: taken.buttons, pitchDownDeg: 0, globalOpacityPct: 100, weightKg, endM: souq.route.loop ? undefined : souq.route.lengthM },
    );
    const orientation = lookOrientation(input.look());
    camera.quaternion.set(orientation.x, orientation.y, orientation.z, orientation.w);
    // Recaler : le parcours repart dans le sens où l'on regarde ; la distance ne bouge pas.
    if (state.recalibrate) calibration = calibrationFrom({ position: camera.position, orientation });
    world.rotation.y = calibration.yawRad;
    placeOnRoute(city, souq.route, state.distanceM);
    setCityOpacity(world, state.cityOpacity, []);
    panel.update({
      ...state,
      ...walkDashboard(souq.route, state, { place, weightKg, now }),
      calibration,
      position: pointAt(souq.route, state.distanceM),
      buildingCount,
      zone: null,
      vignette: false,
      rendering: "osm",
      tileCount: 0,
      attribution: OSM_ATTRIBUTION,
    });
    diagnostics.update(timeMs);
    renderer.render(scene, camera);
  });
  home.showStatus(PC_ACTIVE_STATUS);
}
